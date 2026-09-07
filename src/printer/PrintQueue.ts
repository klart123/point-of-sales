/**
 * PrintQueue.ts
 *
 * A centralized, first-in-first-out print queue for the NIIMBOT B1.
 *
 * WHY THIS FILE EXISTS:
 * Printing labels directly from MenuScreen's handleSubmitOrder — even
 * with a sequential for-loop and a BLE-level lock in PrintService —
 * is NOT enough to guarantee order. If the cashier submits Order 2
 * while Order 1's loop is still mid-way through printing, both loops
 * are independently racing to call printOrderLabel(), and whichever
 * one wins each turn is essentially random. Symptom: Order 2's label
 * jumps ahead, then Order 1's remaining labels print afterward.
 *
 * This file fixes that by being the ONLY thing that ever calls
 * PrintService directly. Orders are pushed in as a single atomic
 * batch (enqueueOrderForPrinting), and ONE worker loop drains the
 * queue strictly oldest-job-first — guaranteeing:
 *
 *   1. All of Order 1's cups print before any of Order 2's cups,
 *      as long as Order 1 was submitted first.
 *   2. No label is ever skipped, even under rapid repeated submits.
 *   3. Screens (MenuScreen, etc.) never block on printing — they just
 *      drop the order in the queue and move on.
 */

import {printOrderLabel, OrderLabelData} from './PrintService';

export interface CupToPrint {
  itemName: string;
  cupSize: string;
}

export interface OrderForPrinting {
  orderNumber?: string;
  customerName: string;
  cups: CupToPrint[];
}

interface QueuedJob extends OrderLabelData {
  queueId: string;
  orderNumber?: string;
}

export interface PrintQueueStatus {
  pending: number; // jobs waiting behind the one currently printing
  printing: QueuedJob | null;
  isProcessing: boolean;
}

type QueueListener = (status: PrintQueueStatus) => void;

const queue: QueuedJob[] = [];
const listeners = new Set<QueueListener>();

let isProcessing = false;
let currentlyPrinting: QueuedJob | null = null;
let jobCounter = 0;

function notifyListeners() {
  const status: PrintQueueStatus = {
    pending: queue.length,
    printing: currentlyPrinting,
    isProcessing,
  };

  listeners.forEach(listener => listener(status));
}

/**
 * Subscribe to queue status changes (queue length, what's currently
 * printing). Returns an unsubscribe function. Useful for showing a
 * "Printing 2 of 5..." indicator in the UI.
 */
export function subscribeToPrintQueue(listener: QueueListener): () => void {
  listeners.add(listener);

  // Immediately push current status so the UI doesn't have to wait
  // for the next change to render something.
  listener({
    pending: queue.length,
    printing: currentlyPrinting,
    isProcessing,
  });

  return () => {
    listeners.delete(listener);
  };
}

/**
 * Push an ENTIRE order's labels onto the queue as one atomic batch.
 *
 * This is the key to "first order first print": all of this order's
 * cups are appended to the queue back-to-back, synchronously, in one
 * call. Because JavaScript is single-threaded, nothing can interleave
 * another order's items into the middle of this order's items — the
 * whole batch either goes in before or after another order's batch,
 * never mixed.
 *
 * Does NOT wait for printing to finish — call this and move on.
 * The worker (processQueue) handles the rest in the background.
 */
export function enqueueOrderForPrinting(order: OrderForPrinting): void {
  if (order.cups.length === 0) {
    console.warn(
      `[PrintQueue] Order ${order.orderNumber ?? '(no number)'} has no ` +
        `cups to print — skipping.`,
    );
    return;
  }

  for (const cup of order.cups) {
    jobCounter += 1;

    queue.push({
      queueId: `job-${jobCounter}`,
      itemName: cup.itemName,
      customerName: order.customerName,
      cupSize: cup.cupSize,
      orderNumber: order.orderNumber,
    });
  }

  console.log(
    `[PrintQueue] Enqueued ${order.cups.length} label(s) for order ` +
      `${order.orderNumber ?? '(no number)'} (${order.customerName}). ` +
      `Total queue length now: ${queue.length}.`,
  );

  notifyListeners();

  // Start the worker if it isn't already running. If it IS running,
  // this is a no-op — the running worker will reach these new jobs
  // naturally once it finishes what's ahead of them.
  processQueue();
}

/**
 * The single worker loop. `isProcessing` guarantees only ONE instance
 * of this ever runs at a time. queue.shift() always takes the OLDEST
 * job — that's what makes this strictly FIFO across orders, no matter
 * how many times enqueueOrderForPrinting() gets called while a
 * previous order is still printing.
 */
async function processQueue(): Promise<void> {
  if (isProcessing) {
    return; // a worker is already draining the queue
  }

  isProcessing = true;
  notifyListeners();

  while (queue.length > 0) {
    const job = queue.shift()!;

    currentlyPrinting = job;
    notifyListeners();

    console.log(`[PrintQueue] Printing ${job.queueId}:`, job);

    try {
      await printOrderLabel(job);

      console.log(`[PrintQueue] Finished ${job.queueId}.`);
    } catch (error) {
      // One failed label should never stall or corrupt the rest of
      // the queue — log it and keep going.
      console.warn(`[PrintQueue] FAILED ${job.queueId}:`, error);
    }

    currentlyPrinting = null;
    notifyListeners();
  }

  isProcessing = false;
  notifyListeners();

  console.log('[PrintQueue] Queue drained, worker idle.');
}

/**
 * Snapshot helpers, useful for quick debugging/logging without
 * subscribing.
 */
export function getPrintQueueLength(): number {
  return queue.length;
}

export function isPrintQueueBusy(): boolean {
  return isProcessing;
}
