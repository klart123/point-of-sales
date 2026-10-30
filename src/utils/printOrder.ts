import {enqueueOrderForPrinting} from '../printer/PrintQueue';

interface OrderItem {
  id?: number;
  name: string;
  size: string;
  type?: string;
  quantity?: number;
  add_ons?: {
    name: string;
    price: number;
  }[];
}

interface PrintOrderData {
  order_number?: number | string;
  customer_name?: string;
  items?: OrderItem[];
}

interface PrintCup {
  itemName: string;
  cupSize: string;
  addOns?: OrderItem['add_ons'];
}

export const printOrder = (data: PrintOrderData): void => {
  const cups: PrintCup[] = (data.items ?? []).flatMap(item => {
    const quantity = Math.max(0, Math.floor(Number(item.quantity ?? 1)));

    const cup: PrintCup = {
      itemName: item.name,
      cupSize: `${item.size} (${item.type?.toUpperCase() ?? ''})`,
      addOns: item.add_ons ?? [],
    };

    // One label for each physical cup.
    return Array.from({length: quantity}, () => cup);
  });

  if (cups.length === 0) {
    return;
  }

  enqueueOrderForPrinting({
    orderNumber: data.order_number ?? undefined,
    customerName: data.customer_name?.trim() || 'Guest',
    cups,
  });
};
