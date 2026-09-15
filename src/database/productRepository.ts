import {getDB} from './database';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type ProductItem = {
  id?: number;
  temperature?: string | null;
  size?: string | null;
  price: number;
};

export type Product = {
  id: number;
  name: string;
  sku: string;
  description?: string | null;
  category_id: number;
  product_category_id?: number | null;
  product_variant_id?: number | null;
  price?: number | null;
  cost?: number | null;
  is_active: number;
  product_category_name?: string | null;
  items?: ProductItem[];
};

export type ProductCategory = {
  id: number;
  name: string;
  category_id: number;
  is_active: number;
  products: Product[];
};

export type GroupedCategory = {
  id: number;
  name: string;
  is_active: number;
  product_categories: ProductCategory[];
  uncategorized_products: Product[];
};

// ─────────────────────────────────────────────────────────────────────────────
// Helper: Get product items
// ─────────────────────────────────────────────────────────────────────────────

const getProductItems = async (
  productVariantId: number | null | undefined,
): Promise<ProductItem[]> => {
  if (!productVariantId) {
    return [];
  }

  const db = getDB();

  const result = await db.execute(
    `
    SELECT
      id,
      temperature,
      size,
      price
    FROM product_variant_items
    WHERE product_variant_id = ?
    ORDER BY id ASC;
    `,
    [productVariantId],
  );

  return result.rows ?? [];
};

// ─────────────────────────────────────────────────────────────────────────────
// Get all products
// Equivalent to:
// GET /api/products
// ─────────────────────────────────────────────────────────────────────────────

export const getProductsFromDatabase = async (options?: {
  categoryId?: number;
  productCategoryId?: number;
  active?: boolean;
}): Promise<Product[]> => {
  const db = getDB();

  let query = `
    SELECT
      p.id,
      p.name,
      p.sku,
      p.description,
      p.category_id,
      p.product_category_id,
      p.product_variant_id,
      p.price,
      p.cost,
      p.is_active,

      pc.name AS product_category_name

    FROM products p

    LEFT JOIN product_categories pc
      ON pc.id = p.product_category_id

    WHERE 1 = 1
  `;

  const params: (number | string)[] = [];

  // Filter main category
  if (options?.categoryId !== undefined) {
    query += ` AND p.category_id = ?`;
    params.push(options.categoryId);
  }

  // Filter subcategory
  if (options?.productCategoryId !== undefined) {
    query += ` AND p.product_category_id = ?`;
    params.push(options.productCategoryId);
  }

  // Filter active
  if (options?.active !== undefined) {
    query += ` AND p.is_active = ?`;
    params.push(options.active ? 1 : 0);
  }

  query += `
    ORDER BY
      p.category_id ASC,
      p.product_category_id ASC,
      p.name ASC;
  `;

  const result = await db.execute(query, params);

  const products = result.rows ?? [];

  // Load variant items
  for (const product of products) {
    product.items = await getProductItems(product.product_variant_id);
  }

  return products;
};

// ─────────────────────────────────────────────────────────────────────────────
// Get one product
// Equivalent to:
// GET /api/products/:id
// ─────────────────────────────────────────────────────────────────────────────

export const getProductById = async (
  productId: number,
): Promise<Product | null> => {
  const db = getDB();

  const result = await db.execute(
    `
    SELECT
      p.id,
      p.name,
      p.sku,
      p.description,
      p.category_id,
      p.product_category_id,
      p.product_variant_id,
      p.price,
      p.cost,
      p.is_active,

      pc.name AS product_category_name

    FROM products p

    LEFT JOIN product_categories pc
      ON pc.id = p.product_category_id

    WHERE p.id = ?
    LIMIT 1;
    `,
    [productId],
  );

  const product = result.rows?.[0];

  if (!product) {
    return null;
  }

  product.items = await getProductItems(product.product_variant_id);

  return product;
};

// ─────────────────────────────────────────────────────────────────────────────
// Get grouped products
// Equivalent to:
// GET /api/products/grouped
// ─────────────────────────────────────────────────────────────────────────────

export const getProductsGroupedFromDatabase = async (
  active?: boolean,
): Promise<GroupedCategory[]> => {
  const db = getDB();

  // ─────────────────────────────────────────────────────────────────────────
  // Get main categories
  // ─────────────────────────────────────────────────────────────────────────

  const categoryResult = await db.execute(`
      SELECT *
      FROM categories
      WHERE is_active = 1
      ORDER BY id ASC;
    `);

  const categories = categoryResult.rows ?? [];

  const result: GroupedCategory[] = [];

  // ─────────────────────────────────────────────────────────────────────────
  // Build category hierarchy
  // ─────────────────────────────────────────────────────────────────────────

  for (const category of categories) {
    const productCategoryResult = await db.execute(
      `
          SELECT *
          FROM product_categories
          WHERE category_id = ?
            AND is_active = 1
          ORDER BY id ASC;
          `,
      [category.id],
    );

    const productCategories = productCategoryResult.rows ?? [];

    const productCategoriesWithProducts: ProductCategory[] = [];

    // ───────────────────────────────────────────────────────────────────────
    // Subcategories
    // ───────────────────────────────────────────────────────────────────────

    for (const productCategory of productCategories) {
      let productQuery = `
          SELECT
            p.id,
            p.name,
            p.sku,
            p.description,
            p.category_id,
            p.product_category_id,
            p.product_variant_id,
            p.price,
            p.cost,
            p.is_active,

            pc.name AS product_category_name

          FROM products p

          LEFT JOIN product_categories pc
            ON pc.id = p.product_category_id

          WHERE p.product_category_id = ?
            AND p.category_id = ?
        `;

      const params: (number | string)[] = [productCategory.id, category.id];

      if (active !== undefined) {
        productQuery += `
            AND p.is_active = ?
          `;

        params.push(active ? 1 : 0);
      }

      productQuery += `
          ORDER BY p.name ASC;
        `;

      const productsResult = await db.execute(productQuery, params);

      const products = productsResult.rows ?? [];

      // Load variant items
      for (const product of products) {
        product.items = await getProductItems(product.product_variant_id);
      }

      productCategoriesWithProducts.push({
        ...productCategory,
        products,
      });
    }

    // ───────────────────────────────────────────────────────────────────────
    // Uncategorized products
    // ───────────────────────────────────────────────────────────────────────

    let uncategorizedQuery = `
        SELECT
          p.id,
          p.name,
          p.sku,
          p.description,
          p.category_id,
          p.product_category_id,
          p.product_variant_id,
          p.price,
          p.cost,
          p.is_active
        FROM products p
        WHERE p.category_id = ?
          AND p.product_category_id IS NULL
      `;

    const uncategorizedParams: (number | string)[] = [category.id];

    if (active !== undefined) {
      uncategorizedQuery += `
          AND p.is_active = ?
        `;

      uncategorizedParams.push(active ? 1 : 0);
    }

    uncategorizedQuery += `
        ORDER BY p.name ASC;
      `;

    const uncategorizedResult = await db.execute(
      uncategorizedQuery,
      uncategorizedParams,
    );

    const uncategorizedProducts = uncategorizedResult.rows ?? [];

    // Load variant items
    for (const product of uncategorizedProducts) {
      product.items = await getProductItems(product.product_variant_id);
    }

    result.push({
      ...category,

      product_categories: productCategoriesWithProducts,

      uncategorized_products: uncategorizedProducts,
    });
  }

  return result;
};

// ─────────────────────────────────────────────────────────────────────────────
// Get product items
// ─────────────────────────────────────────────────────────────────────────────

export const getProductItemsFromDatabase = async (
  productVariantId: number,
): Promise<ProductItem[]> => {
  return getProductItems(productVariantId);
};
