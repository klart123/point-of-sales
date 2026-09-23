import {getDB} from './database';
// If your database export is different, change the import above.
//
// Example:
// import { db } from "./database";
// or
// import { getDatabase } from "./database";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface ProductCategory {
  id: number;
  name: string;
  category_id: number;
  category_name: string;
  category_type: string;
  is_active: number;
  created_at: string;
  updated_at: string;
}

export interface CreateProductCategoryInput {
  name: string;
  category_id: number;
  is_active?: boolean;
}

export interface UpdateProductCategoryInput {
  name?: string;
  is_active?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// GET ALL PRODUCT CATEGORIES
//
// Node.js equivalent:
//
// GET /api/product-categories
//
// Optional:
// ?category_id=1
//
// React Native usage:
//
// const categories = await getProductCategories();
//
// or:
//
// const categories = await getProductCategories(1);
// ─────────────────────────────────────────────────────────────────────────────

export const getProductCategories = async (
  categoryId?: number,
): Promise<ProductCategory[]> => {
  const db = getDB();

  let query = `
    SELECT
      pc.id,
      pc.name,
      pc.category_id,
      c.name AS category_name,
      c.type AS category_type,
      pc.is_active,
      pc.created_at,
      pc.updated_at
    FROM product_categories pc
    JOIN categories c
      ON c.id = pc.category_id
    WHERE 1 = 1
  `;

  const params: (string | number)[] = [];

  // Optional category filter
  if (categoryId !== undefined) {
    query += `
      AND pc.category_id = ?
    `;

    params.push(categoryId);
  }

  query += `
    ORDER BY c.name, pc.name
  `;

  const result = await db.execute(query, params);

  /*
   * @op-engineering/op-sqlite returns rows through:
   *
   * result.rows
   *
   * Depending on your installed version, this may be a ResultSet
   * containing a rows array.
   */

  const rows = result.rows?._array ?? result.rows ?? [];

  return rows.map((pc: any) => ({
    id: Number(pc.id),
    name: pc.name,
    category_id: Number(pc.category_id),
    category_name: pc.category_name,
    category_type: pc.category_type,
    is_active: Number(pc.is_active),
    created_at: pc.created_at,
    updated_at: pc.updated_at,
  }));
};

// ─────────────────────────────────────────────────────────────────────────────
// GET SINGLE PRODUCT CATEGORY
//
// Node.js equivalent:
//
// GET /api/product-categories/:id
//
// React Native usage:
//
// const category = await getProductCategoryById(1);
// ─────────────────────────────────────────────────────────────────────────────

export const getProductCategoryById = async (
  id: number,
): Promise<ProductCategory | null> => {
  const db = getDB();

  const result = await db.execute(
    `
      SELECT
        pc.id,
        pc.name,
        pc.category_id,
        c.name AS category_name,
        c.type AS category_type,
        pc.is_active,
        pc.created_at,
        pc.updated_at
      FROM product_categories pc
      JOIN categories c
        ON c.id = pc.category_id
      WHERE pc.id = ?
    `,
    [id],
  );

  const rows = result.rows?._array ?? result.rows ?? [];

  if (rows.length === 0) {
    return null;
  }

  const pc = rows[0];

  return {
    id: Number(pc.id),
    name: pc.name,
    category_id: Number(pc.category_id),
    category_name: pc.category_name,
    category_type: pc.category_type,
    is_active: Number(pc.is_active),
    created_at: pc.created_at,
    updated_at: pc.updated_at,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// CREATE PRODUCT CATEGORY
//
// Node.js equivalent:
//
// POST /api/product-categories
//
// Body:
//
// {
//   name: "Coffee",
//   category_id: 1,
//   is_active: true
// }
//
// React Native usage:
//
// const category = await createProductCategory({
//   name: "Coffee",
//   category_id: 1,
// });
// ─────────────────────────────────────────────────────────────────────────────

export const createProductCategory = async (
  data: CreateProductCategoryInput,
): Promise<ProductCategory> => {
  const db = getDB();

  // ───────────────────────────────────────────────────────────────────────────
  // Validate name
  // ───────────────────────────────────────────────────────────────────────────

  const trimmedName = data.name.trim();

  if (!trimmedName) {
    throw new Error('name and category_id are required.');
  }

  if (!data.category_id) {
    throw new Error('name and category_id are required.');
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Check that the parent category exists
  // ───────────────────────────────────────────────────────────────────────────

  const categoryResult = await db.execute(
    `
      SELECT id
      FROM categories
      WHERE id = ?
    `,
    [data.category_id],
  );

  const categoryRows = categoryResult.rows?._array ?? categoryResult.rows ?? [];

  if (categoryRows.length === 0) {
    throw new Error('Invalid category_id.');
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Check for duplicate product category
  //
  // Example:
  //
  // Coffee
  // coffee
  // COFFEE
  //
  // These should all be considered duplicates.
  // ───────────────────────────────────────────────────────────────────────────

  const duplicateResult = await db.execute(
    `
      SELECT id
      FROM product_categories
      WHERE LOWER(name) = LOWER(?)
        AND category_id = ?
    `,
    [trimmedName, data.category_id],
  );

  const duplicateRows =
    duplicateResult.rows?._array ?? duplicateResult.rows ?? [];

  if (duplicateRows.length > 0) {
    throw new Error(`"${trimmedName}" already exists in this category.`);
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Determine active state
  //
  // If is_active isn't supplied:
  //
  // undefined → active
  //
  // ───────────────────────────────────────────────────────────────────────────

  const isActive = data.is_active !== undefined ? (data.is_active ? 1 : 0) : 1;

  // ───────────────────────────────────────────────────────────────────────────
  // INSERT
  // ───────────────────────────────────────────────────────────────────────────

  const insertResult = await db.execute(
    `
      INSERT INTO product_categories (
        name,
        category_id,
        is_active
      )
      VALUES (?, ?, ?)
    `,
    [trimmedName, data.category_id, isActive],
  );

  // ───────────────────────────────────────────────────────────────────────────
  // Get inserted ID
  // ───────────────────────────────────────────────────────────────────────────

  const insertedId = Number(insertResult.insertId);

  if (!insertedId) {
    throw new Error(
      'Product category was created but the inserted ID could not be determined.',
    );
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Return the newly-created product category
  // ───────────────────────────────────────────────────────────────────────────

  const created = await getProductCategoryById(insertedId);

  if (!created) {
    throw new Error('Product category was created but could not be retrieved.');
  }

  return created;
};

// ─────────────────────────────────────────────────────────────────────────────
// UPDATE PRODUCT CATEGORY
//
// Node.js equivalent:
//
// PUT /api/product-categories/:id
//
// Body:
//
// {
//   name: "Coffee",
//   is_active: true
// }
//
// Both properties are optional.
//
// React Native usage:
//
// await updateProductCategory(1, {
//   name: "Coffee",
// });
//
// or:
//
// await updateProductCategory(1, {
//   is_active: false,
// });
// ─────────────────────────────────────────────────────────────────────────────

export const updateProductCategory = async (
  id: number,
  data: UpdateProductCategoryInput,
): Promise<ProductCategory> => {
  const db = getDB();

  // ───────────────────────────────────────────────────────────────────────────
  // Get existing product category
  // ───────────────────────────────────────────────────────────────────────────

  const existingResult = await db.execute(
    `
      SELECT *
      FROM product_categories
      WHERE id = ?
    `,
    [id],
  );

  const existingRows = existingResult.rows?._array ?? existingResult.rows ?? [];

  if (existingRows.length === 0) {
    throw new Error('Product category not found.');
  }

  const existing = existingRows[0];

  // ───────────────────────────────────────────────────────────────────────────
  // Prepare new name
  // ───────────────────────────────────────────────────────────────────────────

  const trimmedName = data.name !== undefined ? data.name.trim() : null;

  // ───────────────────────────────────────────────────────────────────────────
  // Check duplicate name
  //
  // Only check when the name is actually changing.
  // ───────────────────────────────────────────────────────────────────────────

  if (
    trimmedName !== null &&
    trimmedName.toLowerCase() !== String(existing.name).toLowerCase()
  ) {
    const duplicateResult = await db.execute(
      `
        SELECT id
        FROM product_categories
        WHERE LOWER(name) = LOWER(?)
          AND category_id = ?
          AND id != ?
      `,
      [trimmedName, existing.category_id, id],
    );

    const duplicateRows =
      duplicateResult.rows?._array ?? duplicateResult.rows ?? [];

    if (duplicateRows.length > 0) {
      throw new Error(`"${trimmedName}" already exists in this category.`);
    }
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Prepare active state
  //
  // undefined means:
  //
  // "Don't change the existing value."
  //
  // ───────────────────────────────────────────────────────────────────────────

  const isActive =
    data.is_active !== undefined ? (data.is_active ? 1 : 0) : null;

  // ───────────────────────────────────────────────────────────────────────────
  // UPDATE
  //
  // COALESCE means:
  //
  // name = NULL
  //      → keep existing name
  //
  // is_active = NULL
  //      → keep existing active state
  // ───────────────────────────────────────────────────────────────────────────

  await db.execute(
    `
      UPDATE product_categories
      SET
        name = COALESCE(?, name),
        is_active = COALESCE(?, is_active),
        updated_at = datetime('now')
      WHERE id = ?
    `,
    [trimmedName, isActive, id],
  );

  // ───────────────────────────────────────────────────────────────────────────
  // Return updated category
  // ───────────────────────────────────────────────────────────────────────────

  const updated = await getProductCategoryById(id);

  if (!updated) {
    throw new Error('Product category was updated but could not be retrieved.');
  }

  return updated;
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE PRODUCT CATEGORY
//
// Node.js equivalent:
//
// DELETE /api/product-categories/:id
//
// React Native usage:
//
// await deleteProductCategory(1);
// ─────────────────────────────────────────────────────────────────────────────

export const deleteProductCategory = async (id: number): Promise<void> => {
  const db = getDB();

  // ───────────────────────────────────────────────────────────────────────────
  // Check that it exists
  // ───────────────────────────────────────────────────────────────────────────

  const existingResult = await db.execute(
    `
      SELECT id
      FROM product_categories
      WHERE id = ?
    `,
    [id],
  );

  const existingRows = existingResult.rows?._array ?? existingResult.rows ?? [];

  if (existingRows.length === 0) {
    throw new Error('Product category not found.');
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Delete
  // ───────────────────────────────────────────────────────────────────────────

  await db.execute(
    `
      DELETE FROM product_categories
      WHERE id = ?
    `,
    [id],
  );
};
