import {getDB} from './database';

/**
 * ============================================================================
 * ORDER TYPES
 * ============================================================================
 *
 * These types represent the local SQLite order domain.
 *
 * Keep these types strict because orders are one of the most important
 * pieces of data in a POS system. A small mismatch here can result in
 * incorrect totals, statuses, or payment records.
 */

/**
 * Valid order statuses.
 *
 * IMPORTANT:
 * Keep this as a string union.
 * Do not use the database status row itself as the OrderStatus type.
 */
export type OrderStatus =
  | 'pending'
  | 'preparing'
  | 'ready'
  | 'served'
  | 'cancelled'
  | 'completed';

/**
 * Status of an individual order item.
 */
export type OrderItemStatus = 'pending' | 'done';

/**
 * Supported payment methods.
 */
export type PaymentMethod = 'cash' | 'gcash';

/**
 * Status configuration stored in the order_statuses table.
 *
 * Example:
 * {
 *   id: 1,
 *   status: 'pending',
 *   priority: 1,
 *   color: '#...',
 *   label: 'Pending'
 * }
 */
export type OrderStatusRecord = {
  id: number;
  status: OrderStatus;
  priority: number;
  color?: string | null;
  label?: string | null;
};

/**
 * ============================================================================
 * ADD-ON TYPES
 * ============================================================================
 */

export type OrderItemAddOn = {
  id?: number;
  order_item_id?: number;
  name: string;
  price: number;
};

/**
 * ============================================================================
 * ORDER ITEM TYPES
 * ============================================================================
 */

export type OrderItem = {
  id: number;
  order_id: number;

  /**
   * Reference to the original product.
   */
  product_id: number | null;

  /**
   * Reference to product_variant_items.
   *
   * The old Node API called this product_item_id.
   * We keep the same field name in the order table for compatibility.
   */
  product_item_id: number | null;

  sku: string;
  name: string;

  /**
   * In the existing database, this field stores the temperature.
   *
   * Example:
   * - hot
   * - cold
   */
  type: string | null;

  size: string | null;

  price: number;
  quantity: number;

  status: OrderItemStatus;

  /**
   * Some older orders may have stored add-ons as JSON.
   * New orders should use order_item_add_ons.
   */
  add_ons?: OrderItemAddOn[];

  /**
   * Alias used by some of the previous repository/API implementations.
   */
  add_ons_detail?: OrderItemAddOn[];

  created_at?: string;
  updated_at?: string;
};

/**
 * ============================================================================
 * ORDER TYPE
 * ============================================================================
 */

export type Order = {
  id: number;
  order_number: string;

  customer_name?: string | null;
  notes?: string | null;

  total: number;

  status: OrderStatus;

  payment_method: PaymentMethod | null;

  cash_tendered: number;
  is_paid: number;

  created_at: string;
  updated_at: string;

  items: OrderItem[];
};

/**
 * ============================================================================
 * CREATE ORDER TYPES
 * ============================================================================
 */

export type CreateOrderAddOn = {
  name: string;
  price: number;
};

export type CreateOrderItem = {
  /**
   * Product ID from the products table.
   */
  id?: number;

  /**
   * Product SKU.
   */
  sku: string;

  /**
   * Product name.
   */
  name?: string;

  /**
   * Temperature.
   *
   * Example: hot / cold
   */
  temp?: string | null;

  /**
   * Some existing code may call this "type".
   */
  type?: string | null;

  size: string;

  price: number;

  quantity?: number;

  addOns?: CreateOrderAddOn[];

  /**
   * Compatibility with the previous API/repository naming.
   */
  add_ons?: CreateOrderAddOn[];
};

export type CreateOrderProduct = {
  /**
   * Product ID.
   */
  id?: number;

  sku: string;

  name?: string;

  /**
   * The selected variants/items for this product.
   */
  items: CreateOrderItem[];

  /**
   * Product-level add-ons used by some older Store implementations.
   */
  addOns?: CreateOrderAddOn[];

  /**
   * Compatibility with older API payloads.
   */
  add_ons?: CreateOrderAddOn[];
};

export type CreateOrderInput = {
  customer_name?: string | null;
  notes?: string | null;

  payment_method?: PaymentMethod | null;

  cash_tendered?: number;

  is_paid?: boolean;

  /**
   * Products selected from the Store/cart.
   */
  orders: CreateOrderProduct[];
};

/**
 * ============================================================================
 * UPDATE ORDER TYPES
 * ============================================================================
 */

export type UpdateOrderPaymentInput = {
  cash_tendered?: number;
  isGcash?: boolean;
  is_paid?: boolean;
};

export type UpdateOrderInput = {
  customer_name?: string | null;
  notes?: string | null;
  payment_method?: PaymentMethod | null;
  cash_tendered?: number;
  is_paid?: boolean;

  /**
   * If supplied, the existing order items are replaced.
   */
  orders?: CreateOrderProduct[];
};

/**
 * ============================================================================
 * SUMMARY TYPES
 * ============================================================================
 */

export type OrderDateSummary = {
  date: string;
  total_orders: number;
  revenue: number;
  served: number;
  cancelled: number;
  pending: number;
};

export type TopProduct = {
  sku: string;
  name: string;
  type: string | null;
  size: string | null;
  quantity: number;
  revenue: number;
};

export type OrderItemStatusSummary = {
  pending: number;
  done: number;
};

export type SummaryOrder = Order & {
  item_status_summary: OrderItemStatusSummary;
};

export type OrderSummary = {
  total_orders: number;
  revenue: number;

  paid_orders: number;

  total_gcash: number;
  total_cash: number;

  total_items: number;

  top_products: TopProduct[];

  orders: SummaryOrder[];
};

/**
 * ============================================================================
 * CONSTANTS
 * ============================================================================
 */

/**
 * These statuses cause the order-level status to cascade down to every item.
 *
 * Example:
 *
 * completed order
 *   ├── item 1 -> completed
 *   ├── item 2 -> completed
 *   └── item 3 -> completed
 *
 * This matches the behavior of the original Node API.
 */
const STATUS_CASCADES_TO_ITEMS = new Set<OrderStatus>([
  'cancelled',
  'completed',
]);

/**
 * Database-level validation for status values.
 */
const VALID_STATUSES: OrderStatus[] = [
  'pending',
  'preparing',
  'ready',
  'served',
  'cancelled',
  'completed',
];

/**
 * ============================================================================
 * HELPERS
 * ============================================================================
 */

/**
 * Returns the current local date in YYYYMMDD format.
 *
 * We intentionally do NOT use toISOString() here.
 *
 * A POS should use the device's local business date. Using UTC can cause
 * orders created around midnight in the Philippines to receive the previous
 * or next day's order number.
 *
 * Example:
 * 20260917
 */
const getLocalDateString = (): string => {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}${month}${day}`;
};

/**
 * Generates a random four-digit number.
 *
 * Example:
 * 4821
 */
const generateRandomFourDigits = (): string => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

/**
 * Generate a unique order number.
 *
 * Example:
 * ORD-20260917-4821
 *
 * We check SQLite before returning the number because order numbers should
 * never collide, even if the random generator happens to produce the same
 * number.
 */
const generateUniqueOrderNumber = async (tx: any): Promise<string> => {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const orderNumber = `ORD-${getLocalDateString()}-${generateRandomFourDigits()}`;

    const result = await tx.execute(
      `
      SELECT id
      FROM orders
      WHERE order_number = ?
      LIMIT 1;
      `,
      [orderNumber],
    );

    if (!result.rows?.length) {
      return orderNumber;
    }
  }

  /**
   * This should be extremely unlikely.
   *
   * Throwing here is safer than silently creating an order with a duplicate
   * order number.
   */
  throw new Error('Unable to generate a unique order number.');
};

/**
 * Safely convert an unknown value into a number.
 */
const toNumber = (value: unknown, fallback = 0): number => {
  const number = Number(value);

  return Number.isFinite(number) ? number : fallback;
};

/**
 * Safely parse the legacy add_ons JSON column.
 *
 * Older versions of the Node API could store add-ons as JSON directly on
 * order_items.
 *
 * New orders should use order_item_add_ons, but keeping this parser makes
 * existing local data compatible.
 */
const parseLegacyAddOns = (value: unknown): OrderItemAddOn[] => {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value !== 'string') {
    return [];
  }

  try {
    const parsed = JSON.parse(value);

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    /**
     * Invalid legacy JSON should not prevent the order itself from loading.
     */
    return [];
  }
};

/**
 * Normalize an order item so callers always receive an add-ons array.
 */
const normalizeOrderItem = (
  item: OrderItem & {add_ons?: unknown},
): OrderItem => {
  const relationalAddOns = Array.isArray(item.add_ons_detail)
    ? item.add_ons_detail
    : [];

  const legacyAddOns = parseLegacyAddOns(item.add_ons);

  const addOns = relationalAddOns.length > 0 ? relationalAddOns : legacyAddOns;

  return {
    ...item,
    price: toNumber(item.price),
    quantity: toNumber(item.quantity, 1),
    status: item.status ?? 'pending',
    add_ons: addOns,
    add_ons_detail: addOns,
  };
};

/**
 * ============================================================================
 * ORDER ITEM LOADING
 * ============================================================================
 */

/**
 * Get all add-ons belonging to an order item.
 */
const getOrderItemAddOns = async (
  dbOrTransaction: any,
  orderItemId: number,
): Promise<OrderItemAddOn[]> => {
  const result = await dbOrTransaction.execute(
    `
    SELECT
      id,
      order_item_id,
      name,
      price
    FROM order_item_add_ons
    WHERE order_item_id = ?
    ORDER BY id ASC;
    `,
    [orderItemId],
  );

  return (result.rows ?? []).map((addOn: OrderItemAddOn) => ({
    ...addOn,
    price: toNumber(addOn.price),
  }));
};

/**
 * Get all items belonging to an order.
 *
 * We explicitly select columns instead of SELECT *.
 * This protects the repository from accidentally exposing unrelated columns
 * if the database schema changes later.
 */
const getOrderItems = async (
  dbOrTransaction: any,
  orderId: number,
): Promise<OrderItem[]> => {
  const result = await dbOrTransaction.execute(
    `
    SELECT
      id,
      order_id,
      product_id,
      product_item_id,
      sku,
      name,
      type,
      size,
      price,
      quantity,
      status,
      add_ons,
      created_at,
      updated_at
    FROM order_items
    WHERE order_id = ?
    ORDER BY
      CASE
        WHEN status = 'pending' THEN 0
        WHEN status = 'done' THEN 1
        ELSE 2
      END,
      id ASC;
    `,
    [orderId],
  );

  const items = result.rows ?? [];

  const resultItems: OrderItem[] = [];

  for (const item of items) {
    const relationalAddOns = await getOrderItemAddOns(dbOrTransaction, item.id);

    resultItems.push(
      normalizeOrderItem({
        ...item,
        add_ons_detail: relationalAddOns,
      }),
    );
  }

  return resultItems;
};

/**
 * Get a complete order including all order items and add-ons.
 */
const getOrderWithItems = async (
  dbOrTransaction: any,
  orderId: number,
): Promise<Order | null> => {
  const orderResult = await dbOrTransaction.execute(
    `
    SELECT
      id,
      order_number,
      customer_name,
      notes,
      total,
      status,
      payment_method,
      cash_tendered,
      is_paid,
      created_at,
      updated_at
    FROM orders
    WHERE id = ?
    LIMIT 1;
    `,
    [orderId],
  );

  const order = orderResult.rows?.[0];

  if (!order) {
    return null;
  }

  const items = await getOrderItems(dbOrTransaction, orderId);

  return {
    ...order,
    total: toNumber(order.total),
    cash_tendered: toNumber(order.cash_tendered),
    is_paid: toNumber(order.is_paid),
    items,
  };
};

/**
 * ============================================================================
 * STATUS
 * ============================================================================
 */

/**
 * Get all configured order statuses.
 *
 * The UI can use priority, color, and label without hardcoding those values.
 */
export const getOrderStatusesFromDatabase = async (): Promise<
  OrderStatusRecord[]
> => {
  const db = getDB();

  const result = await db.execute(`
    SELECT
      id,
      status,
      priority,
      color,
      label
    FROM order_statuses
    ORDER BY priority ASC;
  `);

  return result.rows ?? [];
};

/**
 * ============================================================================
 * GET ORDERS
 * ============================================================================
 */

export type GetOrdersOptions = {
  from?: string;
  to?: string;

  status?: OrderStatus[];

  /**
   * Supports:
   * 0 / 1
   * false / true
   */
  is_paid?: number | boolean;
};

/**
 * Get orders using optional filters.
 *
 * This replaces the old:
 *
 * GET /orders
 *
 * endpoint from the Node backend.
 */
export const getOrdersFromDatabase = async (
  options?: GetOrdersOptions,
): Promise<Order[]> => {
  const db = getDB();

  let query = `
    SELECT
      id,
      order_number,
      customer_name,
      notes,
      total_price,
      status,
      payment_method,
      cash_tendered,
      is_paid,
      created_at,
      updated_at
    FROM orders
    WHERE 1 = 1
  `;

  const params: (number | string)[] = [];

  if (options?.from) {
    query += `
      AND date(created_at) >= date(?)
    `;

    params.push(options.from);
  }

  if (options?.to) {
    query += `
      AND date(created_at) <= date(?)
    `;

    params.push(options.to);
  }

  if (options?.status && options.status.length > 0) {
    const placeholders = options.status.map(() => '?').join(', ');

    query += `
      AND status IN (${placeholders})
    `;

    params.push(...options.status);
  }

  if (options?.is_paid !== undefined) {
    query += `
      AND is_paid = ?
    `;

    params.push(options.is_paid ? 1 : 0);
  }

  /**
   * ASC is intentional.
   *
   * The original Node API returned oldest orders first.
   * OrderList can then apply its own presentation sorting.
   */
  query += `
    ORDER BY datetime(created_at) ASC;
  `;

  const result = await db.execute(query, params);

  const orders = result.rows ?? [];

  const resultOrders: Order[] = [];

  for (const order of orders) {
    const fullOrder = await getOrderWithItems(db, order.id);

    if (fullOrder) {
      resultOrders.push(fullOrder);
    }
  }

  return resultOrders;
};

/**
 * ============================================================================
 * GET SINGLE ORDER
 * ============================================================================
 */

/**
 * Get one complete order.
 *
 * Replaces:
 * GET /orders/:id
 */
export const getOrderById = async (orderId: number): Promise<Order | null> => {
  const db = getDB();

  return getOrderWithItems(db, orderId);
};

/**
 * ============================================================================
 * CREATE ORDER
 * ============================================================================
 */

/**
 * Resolve the add-ons from the different payload formats supported by the
 * existing POS code.
 */
const getCreateItemAddOns = (
  product: CreateOrderProduct,
  item: CreateOrderItem,
): CreateOrderAddOn[] => {
  /**
   * Preferred format:
   *
   * item.addOns
   */
  if (item.addOns) {
    return item.addOns;
  }

  /**
   * Compatibility format:
   *
   * item.add_ons
   */
  if (item.add_ons) {
    return item.add_ons;
  }

  /**
   * Older Store implementation could attach add-ons to the product itself.
   */
  if (product.addOns) {
    return product.addOns;
  }

  if (product.add_ons) {
    return product.add_ons;
  }

  return [];
};

/**
 * Create a new order.
 *
 * This replaces:
 *
 * POST /orders
 *
 * The entire operation runs inside one SQLite transaction.
 *
 * If inserting an item or add-on fails, the order itself is rolled back.
 * This prevents partially-created orders.
 */
export const createOrder = async (input: CreateOrderInput): Promise<Order> => {
  const db = getDB();

  if (!input.orders || input.orders.length === 0) {
    throw new Error('Order must contain at least one product.');
  }

  let createdOrderId = 0;

  await db.transaction(async tx => {
    const orderNumber = await generateUniqueOrderNumber(tx);

    const now = new Date().toISOString();

    let total = 0;

    /**
     * Calculate the order total before inserting the header.
     *
     * Product item:
     * price × quantity
     *
     * Add-ons:
     * add-on price
     *
     * NOTE:
     * This follows the original Node API behavior where add-on price was
     * added once per selected add-on rather than multiplied by quantity.
     *
     * If your business rule is that add-ons should be charged for every
     * quantity, change the calculation to:
     *
     * total += addOn.price * quantity;
     */
    for (const product of input.orders) {
      if (!product.sku) {
        throw new Error('Each product must contain a SKU.');
      }

      if (!product.items || product.items.length === 0) {
        throw new Error(
          `Product ${product.sku} must contain at least one item.`,
        );
      }

      for (const item of product.items) {
        if (!item.size) {
          throw new Error(`Product ${product.sku} requires a size.`);
        }

        const price = toNumber(item.price);
        const quantity = Math.max(1, toNumber(item.quantity, 1));

        total += price * quantity;

        const addOns = getCreateItemAddOns(product, item);

        for (const addOn of addOns) {
          total += toNumber(addOn.price);
        }
      }
    }

    /**
     * Insert order header.
     */
    const orderResult = await tx.execute(
      `
      INSERT INTO orders (
        order_number,
        customer_name,
        notes,
        total,
        status,
        payment_method,
        cash_tendered,
        is_paid,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
      `,
      [
        orderNumber,
        input.customer_name ?? null,
        input.notes ?? null,
        total,
        'pending',
        input.payment_method ?? null,
        toNumber(input.cash_tendered),
        input.is_paid ? 1 : 0,
        now,
        now,
      ],
    );

    createdOrderId = Number(orderResult.insertId);

    /**
     * Insert order items and their add-ons.
     */
    for (const product of input.orders) {
      for (const item of product.items) {
        const quantity = Math.max(1, toNumber(item.quantity, 1));

        const itemResult = await tx.execute(
          `
          INSERT INTO order_items (
            order_id,
            product_id,
            product_item_id,
            sku,
            name,
            type,
            size,
            price,
            quantity,
            status,
            created_at,
            updated_at
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
          `,
          [
            createdOrderId,
            product.id ?? item.id ?? null,
            item.id ?? null,
            product.sku,
            item.name ?? product.name ?? '',
            item.temp ?? item.type ?? null,
            item.size,
            toNumber(item.price),
            quantity,
            'pending',
            now,
            now,
          ],
        );

        const orderItemId = Number(itemResult.insertId);

        const addOns = getCreateItemAddOns(product, item);

        for (const addOn of addOns) {
          await tx.execute(
            `
            INSERT INTO order_item_add_ons (
              order_item_id,
              name,
              price
            )
            VALUES (?, ?, ?);
            `,
            [orderItemId, addOn.name, toNumber(addOn.price)],
          );
        }
      }
    }
  });

  const createdOrder = await getOrderById(createdOrderId);

  if (!createdOrder) {
    throw new Error('Order was created but could not be loaded.');
  }

  return createdOrder;
};

/**
 * ============================================================================
 * PAYMENT
 * ============================================================================
 */

/**
 * Update payment information.
 *
 * Replaces:
 *
 * PATCH /orders/:id/payment
 */
export const updateOrderPayment = async (
  orderId: number,
  input: UpdateOrderPaymentInput,
): Promise<Order> => {
  const db = getDB();

  const existingOrder = await getOrderById(orderId);

  if (!existingOrder) {
    throw new Error('Order not found.');
  }

  const fields: string[] = [];
  const params: (number | string | null)[] = [];

  /**
   * Cash tendered being supplied means the order has been paid.
   */
  if (input.cash_tendered !== undefined) {
    fields.push('cash_tendered = ?');
    params.push(toNumber(input.cash_tendered));

    fields.push('is_paid = ?');
    params.push(1);
  }

  /**
   * Payment method.
   *
   * The existing API uses isGcash rather than directly passing the payment
   * method, so we continue supporting that interface.
   */
  if (input.isGcash !== undefined) {
    fields.push('payment_method = ?');
    params.push(input.isGcash ? 'gcash' : 'cash');
  }

  /**
   * Explicit is_paid support.
   *
   * The older repository exposed this in its input type but did not actually
   * use it. We handle it here so the API contract and implementation agree.
   */
  if (input.is_paid !== undefined) {
    fields.push('is_paid = ?');
    params.push(input.is_paid ? 1 : 0);
  }

  /**
   * Nothing changed.
   */
  if (fields.length === 0) {
    return existingOrder;
  }

  fields.push('updated_at = ?');
  params.push(new Date().toISOString());

  params.push(orderId);

  await db.execute(
    `
    UPDATE orders
    SET ${fields.join(', ')}
    WHERE id = ?;
    `,
    params,
  );

  const updatedOrder = await getOrderById(orderId);

  if (!updatedOrder) {
    throw new Error('Order could not be loaded after payment update.');
  }

  return updatedOrder;
};

/**
 * ============================================================================
 * ORDER STATUS
 * ============================================================================
 */

/**
 * Update the status of an entire order.
 *
 * Replaces:
 *
 * PATCH /orders/:id/status
 */
export const updateOrderStatus = async (
  orderId: number,
  status: OrderStatus,
): Promise<Order> => {
  const db = getDB();

  if (!VALID_STATUSES.includes(status)) {
    throw new Error(`Invalid order status: ${status}`);
  }

  const existingOrder = await getOrderById(orderId);

  if (!existingOrder) {
    throw new Error('Order not found.');
  }

  const now = new Date().toISOString();

  await db.transaction(async tx => {
    await tx.execute(
      `
      UPDATE orders
      SET
        status = ?,
        updated_at = ?
      WHERE id = ?;
      `,
      [status, now, orderId],
    );

    /**
     * cancelled and completed are terminal states in the current POS
     * workflow, so their status is cascaded to all items.
     */
    if (STATUS_CASCADES_TO_ITEMS.has(status)) {
      await tx.execute(
        `
        UPDATE order_items
        SET
          status = ?,
          updated_at = ?
        WHERE order_id = ?;
        `,
        [status === 'completed' ? 'done' : 'pending', now, orderId],
      );
    }
  });

  const updatedOrder = await getOrderById(orderId);

  if (!updatedOrder) {
    throw new Error('Order could not be loaded after status update.');
  }

  return updatedOrder;
};

/**
 * ============================================================================
 * ORDER ITEM STATUS
 * ============================================================================
 */

/**
 * Determine the correct order status based on its item statuses.
 *
 * Business rule:
 *
 * all pending -> pending
 * some done   -> preparing
 * all done    -> ready
 */
const calculateOrderStatusFromItems = (items: OrderItem[]): OrderStatus => {
  if (items.length === 0) {
    return 'pending';
  }

  const doneCount = items.filter(item => item.status === 'done').length;

  if (doneCount === 0) {
    return 'pending';
  }

  if (doneCount === items.length) {
    return 'ready';
  }

  return 'preparing';
};

/**
 * Toggle an individual order item between pending and done.
 *
 * Replaces:
 *
 * PATCH /orders/:orderId/items/:itemId/done
 *
 * We validate ownership directly in SQLite rather than loading every item
 * just to find the requested item.
 */
export const toggleOrderItemStatus = async (
  orderId: number,
  orderItemId: number,
): Promise<Order> => {
  const db = getDB();

  const itemResult = await db.execute(
    `
    SELECT
      id,
      status
    FROM order_items
    WHERE id = ?
      AND order_id = ?
    LIMIT 1;
    `,
    [orderItemId, orderId],
  );

  const item = itemResult.rows?.[0];

  if (!item) {
    throw new Error('Order item not found.');
  }

  const newItemStatus: OrderItemStatus =
    item.status === 'done' ? 'pending' : 'done';

  const now = new Date().toISOString();

  await db.transaction(async tx => {
    await tx.execute(
      `
      UPDATE order_items
      SET
        status = ?,
        updated_at = ?
      WHERE id = ?
        AND order_id = ?;
      `,
      [newItemStatus, now, orderItemId, orderId],
    );

    /**
     * Re-read the item statuses after the toggle.
     *
     * This is important because the order status depends on ALL items.
     */
    const itemsResult = await tx.execute(
      `
      SELECT status
      FROM order_items
      WHERE order_id = ?
      ORDER BY id ASC;
      `,
      [orderId],
    );

    const items = itemsResult.rows ?? [];

    const orderStatus = calculateOrderStatusFromItems(items as OrderItem[]);

    await tx.execute(
      `
      UPDATE orders
      SET
        status = ?,
        updated_at = ?
      WHERE id = ?;
      `,
      [orderStatus, now, orderId],
    );
  });

  const updatedOrder = await getOrderById(orderId);

  if (!updatedOrder) {
    throw new Error('Order could not be loaded after item update.');
  }

  return updatedOrder;
};

/**
 * ============================================================================
 * UPDATE ORDER
 * ============================================================================
 */

/**
 * Calculate the total from a product payload.
 *
 * This is kept separate from createOrder so PUT/update behavior uses the
 * exact same calculation rules.
 */
const calculateOrderTotal = (products: CreateOrderProduct[]): number => {
  let total = 0;

  for (const product of products) {
    for (const item of product.items) {
      const price = toNumber(item.price);
      const quantity = Math.max(1, toNumber(item.quantity, 1));

      total += price * quantity;

      const addOns = getCreateItemAddOns(product, item);

      for (const addOn of addOns) {
        total += toNumber(addOn.price);
      }
    }
  }

  return total;
};

/**
 * Replace all order items when an updated order payload contains "orders".
 *
 * Header-only updates are supported without touching existing items.
 *
 * Replaces:
 *
 * PUT /orders/:id
 */
export const updateOrder = async (
  orderId: number,
  input: UpdateOrderInput,
): Promise<Order> => {
  const db = getDB();

  const existingOrder = await getOrderById(orderId);

  if (!existingOrder) {
    throw new Error('Order not found.');
  }

  await db.transaction(async tx => {
    const now = new Date().toISOString();

    const headerFields: string[] = [];
    const headerParams: (number | string | null)[] = [];

    if (input.customer_name !== undefined) {
      headerFields.push('customer_name = ?');
      headerParams.push(input.customer_name);
    }

    if (input.notes !== undefined) {
      headerFields.push('notes = ?');
      headerParams.push(input.notes);
    }

    if (input.payment_method !== undefined) {
      headerFields.push('payment_method = ?');
      headerParams.push(input.payment_method);
    }

    if (input.cash_tendered !== undefined) {
      headerFields.push('cash_tendered = ?');
      headerParams.push(toNumber(input.cash_tendered));
    }

    if (input.is_paid !== undefined) {
      headerFields.push('is_paid = ?');
      headerParams.push(input.is_paid ? 1 : 0);
    }

    /**
     * If new order items are provided, replace the existing items.
     */
    if (input.orders !== undefined) {
      if (input.orders.length === 0) {
        throw new Error('Updated order must contain at least one product.');
      }

      const total = calculateOrderTotal(input.orders);

      headerFields.push('total = ?');
      headerParams.push(total);

      /**
       * Remove add-ons first because they depend on order_items.
       */
      await tx.execute(
        `
        DELETE FROM order_item_add_ons
        WHERE order_item_id IN (
          SELECT id
          FROM order_items
          WHERE order_id = ?
        );
        `,
        [orderId],
      );

      /**
       * Remove old items.
       */
      await tx.execute(
        `
        DELETE FROM order_items
        WHERE order_id = ?;
        `,
        [orderId],
      );

      /**
       * Insert replacement items.
       */
      for (const product of input.orders) {
        if (!product.sku) {
          throw new Error('Each product must contain a SKU.');
        }

        if (!product.items || product.items.length === 0) {
          throw new Error(
            `Product ${product.sku} must contain at least one item.`,
          );
        }

        for (const item of product.items) {
          if (!item.size) {
            throw new Error(`Product ${product.sku} requires a size.`);
          }

          const quantity = Math.max(1, toNumber(item.quantity, 1));

          const itemResult = await tx.execute(
            `
            INSERT INTO order_items (
              order_id,
              product_id,
              product_item_id,
              sku,
              name,
              type,
              size,
              price,
              quantity,
              status,
              created_at,
              updated_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
            `,
            [
              orderId,
              product.id ?? item.id ?? null,
              item.id ?? null,
              product.sku,
              item.name ?? product.name ?? '',
              item.temp ?? item.type ?? null,
              item.size,
              toNumber(item.price),
              quantity,
              'pending',
              now,
              now,
            ],
          );

          const orderItemId = Number(itemResult.insertId);

          const addOns = getCreateItemAddOns(product, item);

          for (const addOn of addOns) {
            await tx.execute(
              `
              INSERT INTO order_item_add_ons (
                order_item_id,
                name,
                price
              )
              VALUES (?, ?, ?);
              `,
              [orderItemId, addOn.name, toNumber(addOn.price)],
            );
          }
        }
      }

      /**
       * Replacing the items means the order should return to pending.
       */
      headerFields.push('status = ?');
      headerParams.push('pending');
    }

    headerFields.push('updated_at = ?');
    headerParams.push(now);

    /**
     * There should always be at least updated_at here.
     */
    const queryParams = [...headerParams, orderId];

    await tx.execute(
      `
      UPDATE orders
      SET ${headerFields.join(', ')}
      WHERE id = ?;
      `,
      queryParams,
    );
  });

  const updatedOrder = await getOrderById(orderId);

  if (!updatedOrder) {
    throw new Error('Order could not be loaded after update.');
  }

  return updatedOrder;
};

/**
 * ============================================================================
 * DELETE ORDER
 * ============================================================================
 */

/**
 * Delete an order and its dependent records.
 *
 * This should normally be used carefully in a POS.
 *
 * For accounting/history purposes, cancelling an order is usually preferable
 * to physically deleting it.
 */
export const deleteOrder = async (orderId: number): Promise<boolean> => {
  const db = getDB();

  const existingOrder = await getOrderById(orderId);

  if (!existingOrder) {
    return false;
  }

  await db.transaction(async tx => {
    /**
     * Delete add-ons first because they reference order_items.
     */
    await tx.execute(
      `
      DELETE FROM order_item_add_ons
      WHERE order_item_id IN (
        SELECT id
        FROM order_items
        WHERE order_id = ?
      );
      `,
      [orderId],
    );

    /**
     * Delete order items.
     */
    await tx.execute(
      `
      DELETE FROM order_items
      WHERE order_id = ?;
      `,
      [orderId],
    );

    /**
     * Finally delete the order itself.
     */
    await tx.execute(
      `
      DELETE FROM orders
      WHERE id = ?;
      `,
      [orderId],
    );
  });

  return true;
};

/**
 * ============================================================================
 * ORDER DATES
 * ============================================================================
 */

/**
 * Get daily order statistics.
 *
 * Replaces:
 *
 * GET /dates
 *
 * Revenue only includes served/completed orders, matching the original API.
 */
export const getOrderDates = async (): Promise<OrderDateSummary[]> => {
  const db = getDB();

  const result = await db.execute(`
    SELECT
      date(created_at) AS date,

      COUNT(*) AS total_orders,

      COALESCE(
        SUM(
          CASE
            WHEN status IN ('served', 'completed')
            THEN total
            ELSE 0
          END
        ),
        0
      ) AS revenue,

      SUM(
        CASE
          WHEN status = 'served' THEN 1
          ELSE 0
        END
      ) AS served,

      SUM(
        CASE
          WHEN status = 'cancelled' THEN 1
          ELSE 0
        END
      ) AS cancelled,

      SUM(
        CASE
          WHEN status = 'pending' THEN 1
          ELSE 0
        END
      ) AS pending

    FROM orders

    GROUP BY date(created_at)

    ORDER BY date(created_at) DESC;
  `);

  return (result.rows ?? []).map((row: OrderDateSummary) => ({
    date: row.date,
    total_orders: toNumber(row.total_orders),
    revenue: toNumber(row.revenue),
    served: toNumber(row.served),
    cancelled: toNumber(row.cancelled),
    pending: toNumber(row.pending),
  }));
};

/**
 * ============================================================================
 * ORDER SUMMARY
 * ============================================================================
 */

export type GetOrderSummaryOptions = {
  from?: string;
  to?: string;
};

/**
 * Get POS summary information for a date range.
 *
 * Replaces:
 *
 * GET /summary?from=YYYY-MM-DD&to=YYYY-MM-DD
 *
 * Default:
 * today -> today
 */
export const getOrderSummary = async (
  options?: GetOrderSummaryOptions,
): Promise<OrderSummary> => {
  const db = getDB();

  /**
   * Use local device date for the default POS reporting date.
   */
  const today = new Date();

  const localToday = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, '0'),
    String(today.getDate()).padStart(2, '0'),
  ].join('-');

  const from = options?.from ?? localToday;
  const to = options?.to ?? localToday;

  /**
   * --------------------------------------------------------------------------
   * SUMMARY HEADER
   * --------------------------------------------------------------------------
   *
   * Cancelled orders are excluded from total_orders.
   *
   * Revenue only comes from served/completed orders.
   */
  const summaryResult = await db.execute(
    `
    SELECT
      COUNT(
        CASE
          WHEN status != 'cancelled'
          THEN 1
        END
      ) AS total_orders,

      COALESCE(
        SUM(
          CASE
            WHEN status IN ('served', 'completed')
            THEN total
            ELSE 0
          END
        ),
        0
      ) AS revenue,

      COUNT(
        CASE
          WHEN status IN ('served', 'completed')
            AND is_paid = 1
          THEN 1
        END
      ) AS paid_orders,

      COALESCE(
        SUM(
          CASE
            WHEN status IN ('served', 'completed')
              AND is_paid = 1
              AND payment_method = 'gcash'
            THEN total
            ELSE 0
          END
        ),
        0
      ) AS total_gcash,

      COALESCE(
        SUM(
          CASE
            WHEN status IN ('served', 'completed')
              AND is_paid = 1
              AND payment_method = 'cash'
            THEN total
            ELSE 0
          END
        ),
        0
      ) AS total_cash

    FROM orders

    WHERE date(created_at) BETWEEN date(?) AND date(?);
    `,
    [from, to],
  );

  const summaryRow = summaryResult.rows?.[0] ?? {};

  /**
   * --------------------------------------------------------------------------
   * TOTAL ITEM COUNT
   * --------------------------------------------------------------------------
   *
   * Quantity is used here rather than number of order_items rows.
   *
   * Example:
   *
   * Latte x 3
   *
   * counts as 3 items, not 1.
   *
   * Cancelled orders are excluded.
   */
  const itemCountResult = await db.execute(
    `
    SELECT
      COALESCE(
        SUM(oi.quantity),
        0
      ) AS total_items

    FROM order_items oi

    INNER JOIN orders o
      ON o.id = oi.order_id

    WHERE date(o.created_at) BETWEEN date(?) AND date(?)
      AND o.status != 'cancelled';
    `,
    [from, to],
  );

  const totalItems = toNumber(itemCountResult.rows?.[0]?.total_items);

  /**
   * --------------------------------------------------------------------------
   * TOP PRODUCTS
   * --------------------------------------------------------------------------
   *
   * Group by:
   * SKU
   * product name
   * temperature/type
   * size
   *
   * This lets the report distinguish:
   *
   * Latte / cold / medium
   * Latte / cold / large
   * Latte / hot / medium
   */
  const topProductsResult = await db.execute(
    `
    SELECT
      oi.sku,
      oi.name,
      oi.type,
      oi.size,

      COALESCE(
        SUM(oi.quantity),
        0
      ) AS quantity,

      COALESCE(
        SUM(oi.price * oi.quantity),
        0
      ) AS revenue

    FROM order_items oi

    INNER JOIN orders o
      ON o.id = oi.order_id

    WHERE date(o.created_at) BETWEEN date(?) AND date(?)
      AND o.status IN ('served', 'completed')

    GROUP BY
      oi.sku,
      oi.name,
      oi.type,
      oi.size

    ORDER BY quantity DESC

    LIMIT 10;
    `,
    [from, to],
  );

  const topProducts: TopProduct[] = (topProductsResult.rows ?? []).map(
    (row: TopProduct) => ({
      sku: row.sku,
      name: row.name,
      type: row.type ?? null,
      size: row.size ?? null,
      quantity: toNumber(row.quantity),
      revenue: toNumber(row.revenue),
    }),
  );

  /**
   * --------------------------------------------------------------------------
   * SUMMARY ORDERS
   * --------------------------------------------------------------------------
   *
   * Load the same complete order objects used by the rest of the POS.
   *
   * Keeping this consistent means the summary screen does not need to
   * understand a different order structure.
   */
  const orderResult = await db.execute(
    `
    SELECT
      id,
      order_number,
      customer_name,
      notes,
      total,
      status,
      payment_method,
      cash_tendered,
      is_paid,
      created_at,
      updated_at
    FROM orders

    WHERE date(created_at) BETWEEN date(?) AND date(?)

    ORDER BY datetime(created_at) ASC;
    `,
    [from, to],
  );

  const summaryOrders: SummaryOrder[] = [];

  for (const row of orderResult.rows ?? []) {
    const order = await getOrderWithItems(db, row.id);

    if (!order) {
      continue;
    }

    /**
     * Cancelled orders are intentionally still returned in the order list
     * so the report can show what happened during the day.
     */
    const pending = order.items.filter(
      item => item.status === 'pending',
    ).length;

    const done = order.items.filter(item => item.status === 'done').length;

    summaryOrders.push({
      ...order,
      item_status_summary: {
        pending,
        done,
      },
    });
  }

  return {
    total_orders: toNumber(summaryRow.total_orders),
    revenue: toNumber(summaryRow.revenue),

    paid_orders: toNumber(summaryRow.paid_orders),

    total_gcash: toNumber(summaryRow.total_gcash),
    total_cash: toNumber(summaryRow.total_cash),

    total_items: totalItems,

    top_products: topProducts,

    orders: summaryOrders,
  };
};

/**
 * ============================================================================
 * GENERIC ORDER ITEM ACCESS
 * ============================================================================
 */

/**
 * Public helper for retrieving the items of an order.
 *
 * This can be useful for screens that do not need the complete order header.
 */
export const getOrderItemsFromDatabase = async (
  orderId: number,
): Promise<OrderItem[]> => {
  const db = getDB();

  return getOrderItems(db, orderId);
};
