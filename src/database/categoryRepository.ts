import {getDB} from './database';

export type CategoryType = 'beverage' | 'food' | 'other';

export type ProductCategory = {
  id: number;
  name: string;
  category_id: number;
  is_active: number;
};

export type Category = {
  id: number;
  name: string;
  type: CategoryType;
  is_active: number;
  product_categories: ProductCategory[];
};

/**
 * Validate category type
 */
const isValidType = (type: string): type is CategoryType => {
  return ['beverage', 'food', 'other'].includes(type);
};

/**
 * Get all categories with their product categories
 *
 * Equivalent to:
 * GET /api/categories
 */
export const getCategoriesFromDatabase = async (
  active?: boolean,
): Promise<Category[]> => {
  const db = getDB();

  let query = `
    SELECT *
    FROM categories
    WHERE 1 = 1
  `;

  const params: number[] = [];

  if (active !== undefined) {
    query += ` AND is_active = ?`;
    params.push(active ? 1 : 0);
  }

  query += ` ORDER BY name ASC`;

  const result = await db.execute(query, params);

  const categories = result.rows ?? [];

  const resultWithProductCategories: Category[] = [];

  for (const category of categories) {
    const productCategoryResult = await db.execute(
      `
        SELECT *
        FROM product_categories
        WHERE category_id = ?
          AND is_active = 1
        ORDER BY name ASC
      `,
      [category.id],
    );

    resultWithProductCategories.push({
      ...category,
      product_categories: productCategoryResult.rows ?? [],
    });
  }

  return resultWithProductCategories;
};

/**
 * Get one category by ID
 */
export const getCategoryById = async (
  categoryId: number,
): Promise<Category | null> => {
  const db = getDB();

  const result = await db.execute(
    `
      SELECT *
      FROM categories
      WHERE id = ?
      LIMIT 1
    `,
    [categoryId],
  );

  const category = result.rows?.[0];

  if (!category) {
    return null;
  }

  const productCategoryResult = await db.execute(
    `
      SELECT *
      FROM product_categories
      WHERE category_id = ?
        AND is_active = 1
      ORDER BY name ASC
    `,
    [categoryId],
  );

  return {
    ...category,
    product_categories: productCategoryResult.rows ?? [],
  };
};

/**
 * Create a new category
 *
 * Equivalent to:
 * POST /api/categories
 */
export const createCategory = async (
  name: string,
  type: CategoryType,
): Promise<Category> => {
  const db = getDB();

  if (!name || !type) {
    throw new Error('name and type are required.');
  }

  if (!isValidType(type)) {
    throw new Error('Invalid category type.');
  }

  const existingResult = await db.execute(
    `
      SELECT id
      FROM categories
      WHERE name = ?
      LIMIT 1
    `,
    [name],
  );

  if (existingResult.rows?.length) {
    throw new Error('Category name already exists.');
  }

  const result = await db.execute(
    `
      INSERT INTO categories (
        name,
        type
      )
      VALUES (?, ?)
    `,
    [name, type],
  );

  const newCategory = await getCategoryById(result.insertId);

  if (!newCategory) {
    throw new Error('Failed to create category.');
  }

  return newCategory;
};
