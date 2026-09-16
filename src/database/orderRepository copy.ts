import {getDB} from './database';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type OrderStatus = {
  id: number;
  status: string;
  priority: number;
  color?: string | null;
  label?: string | null;
};

export type OrderItemAddOn = {
  id?: number;
  order_item_id?: number;
  name: string;
  price: number;
};

export type OrderItem = {
  id: number;
  order_id: number;
  product_id?: number | null;
  product_item_id?: number | null;
  sku: string;
  name: string;
  type?: string | null;
  size?: string | null;
  price: number;
  quantity: number;
  status: string;
  add_ons?: OrderItemAddOn[];
  add_ons_detail?: OrderItemAddOn[];
};

export type Order = {
  id: number;
  order_number: string;
  customer_name?: string | null;
  total_price: number;
  notes?: string | null;
  payment_method?: string | null;
  cash_tendered?: number | null;
  is_paid: number;
  status: string;
  created_at: string;
  updated_at?: string | null;
  items: OrderItem[];
};

// These are the statuses that should also update every order item.
const STATUS_CASCADES_TO_ITEMS = ['cancelled', 'completed'];

const VALID_STATUSES = [
  'pending',
  'preparing',
  'ready',
  'served',
  'cancelled',
  'completed',
];

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generate a human-readable order number.
 *
 * Example:
 * ORD-20260917-4821
 *
 * The database still remains the source of truth because we check
 * for collisions before inserting the order.
 */
const generateOrderNumber = (): string => {
  const now = new Date();

  const datePart = now.toISOString().slice(0, 10).replace(/-/g, '');

  const randomNumber = Math.floor(1000 + Math.random() * 9000);

  return `ORD-${datePart}-${randomNumber}`;
};

/**
 * Generate a unique order number.
 */
const generateUniqueOrderNumber = async (): Promise<string> => {
  const db = getDB();

  let orderNumber = generateOrderNumber();

  while (true) {
    const result = await db.execute(
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

    orderNumber = generateOrderNumber();
  }
};

/**
 * Get all add-ons belonging to an order item.
 */
const getOrderItemAddOns = async (
  orderItemId: number,
): Promise<OrderItemAddOn[]> => {
  const db = getDB();

  const result = await db.execute(
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

  return result.rows ?? [];
};

/**
 * Get all items belonging to an order.
 *
 * We intentionally keep this separate from getOrderById()
 * because it is also useful for other repository operations.
 */
const getOrderItems = async (orderId: number): Promise<OrderItem[]> => {
  const db = getDB();

  const result = await db.execute(
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
      status
    FROM order_items
    WHERE order_id = ?
    ORDER BY
      CASE status
        WHEN 'pending' THEN 1
        WHEN 'done' THEN 2
        ELSE 3
      END,
      name ASC;
    `,
    [orderId],
  );

  const items = result.rows ?? [];

  // Load add-ons for every item.
  for (const item of items) {
    item.add_ons_detail = await getOrderItemAddOns(item.id);

    // Keep compatibility with the old API structure.
    item.add_ons = item.add_ons_detail;
  }

  return items;
};

/**
 * Build the complete Order object.
 *
 * This is the React Native equivalent of:
 * getOrderWithItems(db, orderId)
 */
const getOrderWithItems = async (orderId: number): Promise<Order | null> => {
  const db = getDB();

  const result = await db.execute(
    `
    SELECT *
    FROM orders
    WHERE id = ?
    LIMIT 1;
    `,
    [orderId],
  );

  const order = result.rows?.[0];

  if (!order) {
    return null;
  }

  order.items = await getOrderItems(order.id);

  return order;
};

// ─────────────────────────────────────────────────────────────────────────────
// Order statuses
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get order statuses used by the kitchen/cashier screens.
 */
export const getOrderStatusesFromDatabase = async (): Promise<
  OrderStatus[]
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

// ─────────────────────────────────────────────────────────────────────────────
// Get orders
// ─────────────────────────────────────────────────────────────────────────────

export const getOrdersFromDatabase = async (options?: {
  status?: string | string[];
  isPaid?: boolean;
  from?: string;
  to?: string;
}): Promise<Order[]> => {
  const db = getDB();

  let query = `
    SELECT *
    FROM orders
    WHERE 1 = 1
  `;

  const params: (string | number)[] = [];

  // Date range filter.
  if (options?.from) {
    query += ` AND date(created_at) >= ?`;
    params.push(options.from);
  }

  if (options?.to) {
    query += ` AND date(created_at) <= ?`;
    params.push(options.to);
  }

  // Status can be:
  // "pending"
  //
  // or:
  // ["pending", "preparing", "ready"]
  //
  // or:
  // "pending,preparing,ready"
  if (options?.status) {
    const statuses = Array.isArray(options.status)
      ? options.status
      : options.status.split(',');

    const placeholders = statuses.map(() => '?').join(',');

    query += ` AND status IN (${placeholders})`;

    params.push(...statuses);
  }

  // Paid/unpaid filter.
  if (options?.isPaid !== undefined) {
    query += ` AND is_paid = ?`;
    params.push(options.isPaid ? 1 : 0);
  }

  query += `
    ORDER BY created_at ASC;
  `;

  const result = await db.execute(query, params);

  const orders = result.rows ?? [];

  // Load order items.
  for (const order of orders) {
    order.items = await getOrderItems(order.id);
  }

  return orders;
};

// ─────────────────────────────────────────────────────────────────────────────
// Get one order
// ─────────────────────────────────────────────────────────────────────────────

export const getOrderById = async (orderId: number): Promise<Order | null> => {
  return getOrderWithItems(orderId);
};

// ─────────────────────────────────────────────────────────────────────────────
// Create order
// ─────────────────────────────────────────────────────────────────────────────

export type CreateOrderAddOn = {
  name: string;
  price: number;
};

export type CreateOrderItem = {
  id?: number;
  temp?: string | null;
  type?: string | null;
  size: string;
  price: number;
  quantity?: number;
  add_ons?: CreateOrderAddOn[];
};

export type CreateOrderProduct = {
  id?: number;
  sku: string;
  name: string;
  items: CreateOrderItem[];
};

export type CreateOrderInput = {
  customer_name?: string | null;
  notes?: string | null;
  payment_method?: string | null;
  cash_tendered?: number | null;
  is_paid?: number;
  orders: CreateOrderProduct[];
};

/**
 * Create a new order and all of its items in one transaction.
 *
 * A transaction is important here because an order consists of:
 *
 * orders
 *   ↓
 * order_items
 *   ↓
 * order_item_add_ons
 *
 * If anything fails, the entire order is rolled back.
 */
export const createOrder = async (data: CreateOrderInput): Promise<Order> => {
  const db = getDB();

  // ─────────────────────────────────────────────────────────────────────────
  // Validate input
  // ─────────────────────────────────────────────────────────────────────────

  if (!Array.isArray(data.orders) || data.orders.length === 0) {
    throw new Error('orders array is required.');
  }

  for (const [productIndex, product] of data.orders.entries()) {
    if (!product.sku) {
      throw new Error(`Order ${productIndex + 1} is missing sku.`);
    }

    if (!Array.isArray(product.items) || product.items.length === 0) {
      throw new Error(`Order ${productIndex + 1} is missing items.`);
    }

    for (const [itemIndex, item] of product.items.entries()) {
      if (!item.size || item.price === undefined) {
        throw new Error(
          `Order ${productIndex + 1} item ${
            itemIndex + 1
          } is missing size or price.`,
        );
      }
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Generate unique order number
  // ─────────────────────────────────────────────────────────────────────────

  const orderNumber = await generateUniqueOrderNumber();

  // ─────────────────────────────────────────────────────────────────────────
  // Calculate total
  // ─────────────────────────────────────────────────────────────────────────

  let totalPrice = 0;

  for (const product of data.orders) {
    for (const item of product.items) {
      const quantity = item.quantity || 1;

      totalPrice += Number(item.price) * quantity;

      // Add-ons are currently treated as one add-on per selected variant,
      // matching the behavior of your Node.js API.
      for (const addOn of item.add_ons ?? []) {
        totalPrice += Number(addOn.price) * quantity;
      }
    }
  }

  let createdOrderId: number | undefined;

  try {
    // ───────────────────────────────────────────────────────────────────────
    // Transaction
    // ───────────────────────────────────────────────────────────────────────

    await db.transaction(async tx => {
      // Insert order header.
      const orderResult = await tx.execute(
        `
        INSERT INTO orders (
          order_number,
          customer_name,
          total_price,
          notes,
          payment_method,
          cash_tendered,
          is_paid
        )
        VALUES (?, ?, ?, ?, ?, ?, ?);
        `,
        [
          orderNumber,
          data.customer_name ?? null,
          totalPrice,
          data.notes ?? null,
          data.payment_method ?? null,
          data.cash_tendered ?? null,
          data.is_paid ?? 0,
        ],
      );

      createdOrderId = orderResult.insertId;

      if (!createdOrderId) {
        throw new Error('Failed to create order.');
      }

      // Prepare each product and its selected variants.
      for (const product of data.orders) {
        for (const item of product.items) {
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
              status
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
            `,
            [
              createdOrderId,
              product.id ?? null,
              item.id ?? null,
              product.sku,
              product.name,
              item.temp ?? item.type ?? null,
              item.size,
              item.price,
              item.quantity ?? 1,
              'pending',
            ],
          );

          const orderItemId = itemResult.insertId;

          if (!orderItemId) {
            throw new Error(`Failed to create order item for ${product.name}.`);
          }

          // Insert selected add-ons.
          for (const addOn of item.add_ons ?? []) {
            await tx.execute(
              `
              INSERT INTO order_item_add_ons (
                order_item_id,
                name,
                price
              )
              VALUES (?, ?, ?);
              `,
              [orderItemId, addOn.name, addOn.price],
            );
          }
        }
      }
    });

    // Fetch the fully populated order after the transaction.
    const createdOrder = await getOrderWithItems(createdOrderId);

    if (!createdOrder) {
      throw new Error('Order was created but could not be loaded.');
    }

    return createdOrder;
  } catch (error) {
    console.error('[OrderRepository] Failed to create order:', error);

    throw error;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Update payment
// ─────────────────────────────────────────────────────────────────────────────

export const updateOrderPayment = async (
  orderId: number,
  data: {
    is_paid?: boolean;
    cash_tendered?: number | null;
    isGcash?: boolean;
  },
): Promise<Order> => {
  const db = getDB();

  const existingOrder = await getOrderById(orderId);

  if (!existingOrder) {
    throw new Error('Order not found.');
  }

  const fields: string[] = [];
  const values: (string | number | null)[] = [];

  /*
   * Your original API intentionally does not use is_paid directly.
   * Instead, providing cash_tendered marks the order as paid.
   */
  if (data.cash_tendered !== undefined) {
    fields.push('cash_tendered = ?');
    values.push(data.cash_tendered ?? null);

    fields.push('is_paid = ?');
    values.push(1);
  }

  if (data.isGcash !== undefined) {
    fields.push('payment_method = ?');
    values.push(data.isGcash ? 'gcash' : 'cash');
  }

  if (fields.length === 0) {
    throw new Error('No payment fields provided.');
  }

  fields.push(`updated_at = datetime('now')`);

  values.push(orderId);

  await db.execute(
    `
    UPDATE orders
    SET ${fields.join(', ')}
    WHERE id = ?;
    `,
    values,
  );

  const updatedOrder = await getOrderById(orderId);

  if (!updatedOrder) {
    throw new Error('Failed to load updated order.');
  }

  return updatedOrder;
};

// ─────────────────────────────────────────────────────────────────────────────
// Update order status
// ─────────────────────────────────────────────────────────────────────────────

export const updateOrderStatus = async (
  orderId: number,
  status: string,
): Promise<Order> => {
  const db = getDB();

  if (!VALID_STATUSES.includes(status)) {
    throw new Error(`status must be one of: ${VALID_STATUSES.join(', ')}`);
  }

  const existingOrder = await getOrderById(orderId);

  if (!existingOrder) {
    throw new Error('Order not found.');
  }

  try {
    await db.transaction(async tx => {
      // Update the order itself.
      await tx.execute(
        `
        UPDATE orders
        SET
          status = ?,
          updated_at = datetime('now')
        WHERE id = ?;
        `,
        [status, orderId],
      );

      // Certain statuses should cascade to every order item.
      if (STATUS_CASCADES_TO_ITEMS.includes(status)) {
        await tx.execute(
          `
          UPDATE order_items
          SET
            status = ?,
            updated_at = datetime('now')
          WHERE order_id = ?;
          `,
          [status, orderId],
        );
      }
    });

    const updatedOrder = await getOrderById(orderId);

    if (!updatedOrder) {
      throw new Error('Failed to load updated order.');
    }

    return updatedOrder;
  } catch (error) {
    console.error('[OrderRepository] Failed to update status:', error);

    throw error;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Toggle order item done/pending
// ─────────────────────────────────────────────────────────────────────────────

export const toggleOrderItemStatus = async (
  orderId: number,
  itemId: number,
): Promise<Order> => {
  const db = getDB();

  const order = await getOrderById(orderId);

  if (!order) {
    throw new Error('Order not found.');
  }

  const item = order.items.find(orderItem => orderItem.id === itemId);

  if (!item) {
    throw new Error('Item not found.');
  }

  // Toggle pending ↔ done.
  const newStatus = item.status === 'done' ? 'pending' : 'done';

  try {
    await db.transaction(async tx => {
      // Update selected item.
      await tx.execute(
        `
        UPDATE order_items
        SET
          status = ?,
          updated_at = datetime('now')
        WHERE id = ?
          AND order_id = ?;
        `,
        [newStatus, itemId, orderId],
      );

      // Determine the status of the whole order.
      const statsResult = await tx.execute(
        `
        SELECT
          COUNT(*) AS total,
          SUM(
            CASE
              WHEN status = 'pending' THEN 1
              ELSE 0
            END
          ) AS pending_count,
          SUM(
            CASE
              WHEN status = 'done' THEN 1
              ELSE 0
            END
          ) AS done_count
        FROM order_items
        WHERE order_id = ?;
        `,
        [orderId],
      );

      const stats = statsResult.rows?.[0];

      const total = Number(stats?.total ?? 0);
      const pendingCount = Number(stats?.pending_count ?? 0);
      const doneCount = Number(stats?.done_count ?? 0);

      let orderStatus = 'pending';

      // All items are done.
      if (pendingCount === 0 && total > 0) {
        orderStatus = 'ready';
      }

      // Some items are done, some are pending.
      else if (doneCount > 0) {
        orderStatus = 'preparing';
      }

      // Everything is pending.
      else {
        orderStatus = 'pending';
      }

      await tx.execute(
        `
        UPDATE orders
        SET
          status = ?,
          updated_at = datetime('now')
        WHERE id = ?;
        `,
        [orderStatus, orderId],
      );
    });

    const updatedOrder = await getOrderById(orderId);

    if (!updatedOrder) {
      throw new Error('Failed to load updated order.');
    }

    return updatedOrder;
  } catch (error) {
    console.error('[OrderRepository] Failed to toggle item:', error);

    throw error;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Update an existing order
// ─────────────────────────────────────────────────────────────────────────────

export type UpdateOrderInput = {
  customer_name?: string | null;
  notes?: string | null;
  payment_method?: string | null;
  cash_tendered?: number | null;
  is_paid?: boolean;
  orders?: CreateOrderProduct[];
};

/**
 * Update an order.
 *
 * Header fields are updated only when supplied.
 *
 * If `orders` is supplied, all existing order items are replaced,
 * matching the behavior of your original PUT /orders/:id endpoint.
 */
export const updateOrder = async (
  orderId: number,
  data: UpdateOrderInput,
): Promise<Order> => {
  const db = getDB();

  const existingOrder = await getOrderById(orderId);

  if (!existingOrder) {
    throw new Error('Order not found.');
  }

  try {
    await db.transaction(async tx => {
      // ─────────────────────────────────────────────────────────────────────
      // 1. Update order header
      // ─────────────────────────────────────────────────────────────────────

      const fields: string[] = [];
      const values: (string | number | null)[] = [];

      if (data.customer_name !== undefined) {
        fields.push('customer_name = ?');
        values.push(data.customer_name ?? null);
      }

      if (data.notes !== undefined) {
        fields.push('notes = ?');
        values.push(data.notes ?? null);
      }

      if (data.payment_method !== undefined) {
        fields.push('payment_method = ?');
        values.push(data.payment_method ?? null);
      }

      if (data.cash_tendered !== undefined) {
        fields.push('cash_tendered = ?');
        values.push(data.cash_tendered ?? null);
      }

      if (data.is_paid !== undefined) {
        fields.push('is_paid = ?');
        values.push(data.is_paid ? 1 : 0);
      }

      if (fields.length > 0) {
        fields.push(`updated_at = datetime('now')`);

        values.push(orderId);

        await tx.execute(
          `
          UPDATE orders
          SET ${fields.join(', ')}
          WHERE id = ?;
          `,
          values,
        );
      }

      // ─────────────────────────────────────────────────────────────────────
      // 2. Replace order items only when orders are supplied
      // ─────────────────────────────────────────────────────────────────────

      if (Array.isArray(data.orders) && data.orders.length > 0) {
        // Delete add-ons first because they reference order_items.
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

        // Delete existing items.
        await tx.execute(
          `
          DELETE FROM order_items
          WHERE order_id = ?;
          `,
          [orderId],
        );

        let newTotal = 0;

        for (const product of data.orders) {
          for (const variant of product.items) {
            const quantity = variant.quantity ?? 1;

            const itemResult = await tx.execute(
              `
              INSERT INTO order_items (
                order_id,
                sku,
                product_id,
                product_item_id,
                name,
                type,
                size,
                price,
                quantity,
                status
              )
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
              `,
              [
                orderId,
                product.sku,
                product.id ?? null,
                variant.id ?? null,
                product.name,
                variant.temp ?? variant.type ?? null,
                variant.size,
                variant.price,
                quantity,
                'pending',
              ],
            );

            const itemId = itemResult.insertId;

            if (!itemId) {
              throw new Error(`Failed to create item for ${product.name}.`);
            }

            newTotal += Number(variant.price) * quantity;

            // Add selected add-ons.
            for (const addOn of variant.add_ons ?? []) {
              await tx.execute(
                `
                INSERT INTO order_item_add_ons (
                  order_item_id,
                  name,
                  price
                )
                VALUES (?, ?, ?);
                `,
                [itemId, addOn.name, addOn.price],
              );

              newTotal += Number(addOn.price) * quantity;
            }
          }
        }

        // Recalculate order total.
        await tx.execute(
          `
          UPDATE orders
          SET
            total_price = ?,
            updated_at = datetime('now')
          WHERE id = ?;
          `,
          [newTotal, orderId],
        );
      }
    });

    const updatedOrder = await getOrderById(orderId);

    if (!updatedOrder) {
      throw new Error('Failed to load updated order.');
    }

    return updatedOrder;
  } catch (error) {
    console.error('[OrderRepository] Failed to update order:', error);

    throw error;
  }
};
