import {getDB} from './database';

// =============================================================================
// TYPES
// =============================================================================

/**
 * Represents one price/size/temperature combination of a product.
 *
 * Example:
 *
 * {
 *   temperature: 'cold',
 *   size: '16oz',
 *   price: 120
 * }
 *
 * IMPORTANT:
 * Your RN database uses `product_variant_items`.
 *
 * The old Node.js backend used `product_items`, which is NOT
 * the table used by your current RN database.
 */
export type ProductItem = {
  id?: number;
  temperature?: string | null;
  size?: string | null;
  price: number;
};

/**
 * Product returned by the local SQLite database.
 */
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

/**
 * Product category / subcategory.
 */
export type ProductCategory = {
  id: number;
  name: string;
  category_id: number;
  is_active: number;
  products: Product[];
};

/**
 * Main category with its subcategories and products.
 */
export type GroupedCategory = {
  id: number;
  name: string;
  is_active: number;

  product_categories: ProductCategory[];

  uncategorized_products: Product[];
};

/**
 * Data required to create a product.
 *
 * This is the React Native equivalent of req.body
 * from the Node.js POST /api/products endpoint.
 */
export type CreateProductData = {
  name: string;
  description?: string | null;
  cost?: number | null;

  category_id: number;
  product_category_id?: number | null;

  is_active?: boolean;

  items: ProductItem[];
};

// =============================================================================
// CONSTANTS
// =============================================================================

/**
 * Valid temperatures according to your SQLite schema:
 *
 * product_variant_items.temperature
 *
 * CHECK(
 *   temperature IN ('hot', 'cold', 'blended')
 * )
 */
const VALID_TEMPERATURES = ['hot', 'cold', 'blended'] as const;

// =============================================================================
// HELPER: GET PRODUCT ITEMS
// =============================================================================

/**
 * Get all size/temperature/price combinations for a product variant.
 *
 * Node.js equivalent:
 *
 * withItems(db, product)
 *
 * But because your RN database separates variants from products,
 * we retrieve the items through `product_variant_id`.
 */
const getProductItems = async (
  productVariantId: number | null | undefined,
): Promise<ProductItem[]> => {
  // A product without a variant has no items.
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

  // OP-SQLite returns rows directly as an array.
  return result.rows ?? [];
};

// =============================================================================
// GET ALL PRODUCTS
// =============================================================================

/**
 * Get products from the local SQLite database.
 *
 * Equivalent to:
 *
 * GET /api/products
 *
 * Example:
 *
 * const products = await getProductsFromDatabase({
 *   categoryId: 1,
 *   active: true,
 * });
 */
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

  // ---------------------------------------------------------------------------
  // Filter by main category
  // ---------------------------------------------------------------------------

  if (options?.categoryId !== undefined) {
    query += ` AND p.category_id = ?`;
    params.push(options.categoryId);
  }

  // ---------------------------------------------------------------------------
  // Filter by subcategory
  // ---------------------------------------------------------------------------

  if (options?.productCategoryId !== undefined) {
    query += ` AND p.product_category_id = ?`;
    params.push(options.productCategoryId);
  }

  // ---------------------------------------------------------------------------
  // Filter by active/inactive
  // ---------------------------------------------------------------------------

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

  // ---------------------------------------------------------------------------
  // Load variant items for every product
  // ---------------------------------------------------------------------------

  for (const product of products) {
    product.items = await getProductItems(product.product_variant_id);
  }

  return products;
};

// =============================================================================
// GET PRODUCT BY ID
// =============================================================================

/**
 * Get one product by ID.
 *
 * Equivalent to:
 *
 * GET /api/products/:id
 */
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

  // Load the product's variants/items.
  product.items = await getProductItems(product.product_variant_id);

  return product;
};

// =============================================================================
// CREATE PRODUCT
// =============================================================================

/**
 * Create a new product.
 *
 * This is the React Native / OP-SQLite equivalent of:
 *
 * POST /api/products
 *
 * Node.js originally did:
 *
 * req.body
 *     ↓
 * validate
 *     ↓
 * INSERT products
 *     ↓
 * INSERT product_items
 *     ↓
 * COMMIT
 *
 * Our RN version does:
 *
 * CreateProductData
 *     ↓
 * validate
 *     ↓
 * INSERT products
 *     ↓
 * INSERT product_variants
 *     ↓
 * INSERT product_variant_items
 *     ↓
 * COMMIT
 *
 * IMPORTANT:
 *
 * Your RN schema does NOT have:
 *
 * product_items
 *
 * Instead it has:
 *
 * product_variants
 * product_variant_items
 *
 * Therefore we create a variant container for the product first.
 */
export const createProduct = async (
  data: CreateProductData,
): Promise<Product> => {
  const db = getDB();

  // ===========================================================================
  // 1. BASIC VALIDATION
  // ===========================================================================

  const name = data.name?.trim();

  if (!name || !data.category_id) {
    throw new Error('name and category_id are required.');
  }

  // The Node endpoint requires at least one item.
  if (!Array.isArray(data.items) || data.items.length === 0) {
    throw new Error('At least one product item is required.');
  }

  // ===========================================================================
  // 2. VALIDATE CATEGORY
  // ===========================================================================

  /**
   * Node.js equivalent:
   *
   * db.prepare(
   *   "SELECT name FROM categories WHERE id = ?"
   * ).get([category_id]);
   *
   * OP-SQLite equivalent:
   *
   * await db.execute(...)
   *
   * Then:
   *
   * result.rows?.[0]
   */
  const categoryResult = await db.execute(
    `
    SELECT
      id,
      name,
      type
    FROM categories
    WHERE id = ?
    LIMIT 1;
    `,
    [data.category_id],
  );

  const category = categoryResult.rows?.[0];

  if (!category) {
    throw new Error('Invalid category_id.');
  }

  // ===========================================================================
  // 3. VALIDATE PRODUCT SUBCATEGORY
  // ===========================================================================

  /**
   * Make sure the selected product_category actually belongs
   * to the selected main category.
   *
   * Example:
   *
   * Beverage
   *   └── Coffee
   *
   * A Coffee subcategory should not be allowed under Food.
   */
  if (
    data.product_category_id !== undefined &&
    data.product_category_id !== null
  ) {
    const productCategoryResult = await db.execute(
      `
      SELECT
        id,
        name
      FROM product_categories
      WHERE id = ?
        AND category_id = ?
      LIMIT 1;
      `,
      [data.product_category_id, data.category_id],
    );

    if (!productCategoryResult.rows?.length) {
      throw new Error('Invalid product_category_id for this category.');
    }
  }

  // ===========================================================================
  // 4. CHECK DUPLICATE PRODUCT NAME
  // ===========================================================================

  /**
   * SQLite LOWER() makes this case-insensitive.
   *
   * Therefore:
   *
   * "Latte"
   * "latte"
   * "LATTE"
   *
   * are considered the same product within the same category.
   */
  const duplicateResult = await db.execute(
    `
    SELECT id
    FROM products
    WHERE LOWER(name) = LOWER(?)
      AND category_id = ?
    LIMIT 1;
    `,
    [name, data.category_id],
  );

  if (duplicateResult.rows?.length) {
    throw new Error(`Product "${name}" already exists in this category.`);
  }

  // ===========================================================================
  // 5. VALIDATE PRODUCT ITEMS
  // ===========================================================================

  for (const [index, item] of data.items.entries()) {
    // -------------------------------------------------------------------------
    // Price is required
    // -------------------------------------------------------------------------

    if (item.price === undefined || item.price === null || item.price === '') {
      throw new Error(`Item ${index + 1} is missing price.`);
    }

    // -------------------------------------------------------------------------
    // Convert price to number
    // -------------------------------------------------------------------------

    const price = Number(item.price);

    if (!Number.isFinite(price)) {
      throw new Error(`Item ${index + 1} has an invalid price.`);
    }

    if (price < 0) {
      throw new Error(`Item ${index + 1} cannot have a negative price.`);
    }

    // -------------------------------------------------------------------------
    // Validate temperature
    // -------------------------------------------------------------------------

    if (
      item.temperature &&
      !VALID_TEMPERATURES.includes(
        item.temperature as (typeof VALID_TEMPERATURES)[number],
      )
    ) {
      throw new Error(`Item ${index + 1} has invalid temperature.`);
    }

    // -------------------------------------------------------------------------
    // Size is required by your SQLite schema
    //
    // product_variant_items:
    //
    // size TEXT NOT NULL
    // -------------------------------------------------------------------------

    if (!item.size?.trim()) {
      throw new Error(`Item ${index + 1} is missing size.`);
    }
  }

  // ===========================================================================
  // 6. GENERATE SKU
  // ===========================================================================

  /**
   * Your original Node.js code generated:
   *
   * BEV-001
   * FOO-001
   * OTH-001
   *
   * based on the first three letters of the category.
   *
   * We keep that behavior here so this function remains
   * a close equivalent to the original endpoint.
   *
   * NOTE:
   *
   * Your current seeder uses SKUs such as:
   *
   * BEV-COFFEE-001
   * BEV-MATCHA-001
   * BEV-SODA-001
   *
   * If you want ONE consistent SKU format throughout your POS,
   * I recommend changing SKU generation later to include the
   * subcategory.
   */

  const prefix = String(category.name).trim().slice(0, 3).toUpperCase();

  const existingSkuResult = await db.execute(
    `
    SELECT sku
    FROM products
    WHERE sku LIKE ?
    ORDER BY sku DESC;
    `,
    [`${prefix}-%`],
  );

  const existingProducts = existingSkuResult.rows ?? [];

  let nextNumber = 1;

  if (existingProducts.length > 0) {
    const numbers = existingProducts
      .map((product: {sku: string}) => {
        /**
         * Example:
         *
         * BEV-001
         *
         * split("-") gives:
         *
         * ["BEV", "001"]
         *
         * We take index 1.
         */
        const parts = product.sku.split('-');

        return Number.parseInt(parts[1], 10);
      })
      .filter((number: number) => Number.isFinite(number));

    if (numbers.length > 0) {
      nextNumber = Math.max(...numbers) + 1;
    }
  }

  const sku = `${prefix}-${String(nextNumber).padStart(3, '0')}`;

  // ===========================================================================
  // 7. PREPARE PRODUCT VALUES
  // ===========================================================================

  const description = data.description?.trim() || null;

  const cost =
    data.cost !== undefined && data.cost !== null && data.cost !== ''
      ? Number(data.cost)
      : null;

  if (cost !== null && !Number.isFinite(cost)) {
    throw new Error('Product cost must be a valid number.');
  }

  const isActive = data.is_active !== undefined ? (data.is_active ? 1 : 0) : 1;

  // ===========================================================================
  // 8. CREATE PRODUCT + VARIANT + ITEMS IN ONE TRANSACTION
  // ===========================================================================

  /**
   * This is one of the biggest differences from the Node.js version.
   *
   * Instead of:
   *
   * BEGIN
   * ...
   * COMMIT
   * ROLLBACK
   *
   * OP-SQLite gives us:
   *
   * db.transaction(async tx => {
   *   ...
   * });
   *
   * If anything inside this callback throws,
   * the transaction is rolled back.
   */
  let productId: number;

  await db.transaction(async tx => {
    // ========================================================================
    // 8A. INSERT PRODUCT
    // ========================================================================

    const productResult = await tx.execute(
      `
      INSERT INTO products (
        name,
        sku,
        description,
        category_id,
        product_category_id,
        cost,
        is_active
      )
      VALUES (?, ?, ?, ?, ?, ?, ?);
      `,
      [
        name,
        sku,
        description,
        data.category_id,
        data.product_category_id ?? null,
        cost,
        isActive,
      ],
    );

    /**
     * OP-SQLite equivalent of better-sqlite3:
     *
     * result.lastInsertRowid
     *
     * is:
     *
     * result.insertId
     */
    if (!productResult.insertId) {
      throw new Error('Failed to create product: no insertId returned.');
    }

    productId = productResult.insertId;

    // ========================================================================
    // 8B. CREATE PRODUCT VARIANT
    // ========================================================================

    /**
     * Your database architecture uses:
     *
     * products
     *    ↓
     * product_variants
     *    ↓
     * product_variant_items
     *
     * A product can therefore have a variant container.
     *
     * Example:
     *
     * Latte
     *   ↓
     * Latte Variants
     *   ├── hot / 8oz / ₱90
     *   ├── hot / 12oz / ₱100
     *   ├── cold / 16oz / ₱120
     *   └── cold / 22oz / ₱150
     */

    const variantResult = await tx.execute(
      `
      INSERT INTO product_variants (
        name,
        category_id
      )
      VALUES (?, ?);
      `,
      [`${name} Variants`, data.category_id],
    );

    if (!variantResult.insertId) {
      throw new Error(
        'Failed to create product variant: no insertId returned.',
      );
    }

    const productVariantId = variantResult.insertId;

    // ========================================================================
    // 8C. LINK VARIANT TO PRODUCT
    // ========================================================================

    await tx.execute(
      `
      UPDATE products
      SET
        product_variant_id = ?,
        updated_at = datetime('now')
      WHERE id = ?;
      `,
      [productVariantId, productId],
    );

    // ========================================================================
    // 8D. INSERT PRODUCT VARIANT ITEMS
    // ========================================================================

    for (const item of data.items) {
      const price = Number(item.price);

      await tx.execute(
        `
        INSERT INTO product_variant_items (
          product_variant_id,
          temperature,
          size,
          price
        )
        VALUES (?, ?, ?, ?);
        `,
        [productVariantId, item.temperature ?? null, item.size!.trim(), price],
      );
    }
  });

  // ===========================================================================
  // 9. RETURN THE COMPLETE PRODUCT
  // ===========================================================================

  /**
   * The Node.js endpoint returned:
   *
   * withItems(db, product)
   *
   * We do the equivalent by retrieving the product again.
   *
   * This also means the caller receives:
   *
   * product
   *   + category
   *   + product_category_name
   *   + items
   */
  const createdProduct = await getProductById(productId!);

  if (!createdProduct) {
    throw new Error('Product was created but could not be retrieved.');
  }

  return createdProduct;
};

// =============================================================================
// GET GROUPED PRODUCTS
// =============================================================================

/**
 * Get products grouped as:
 *
 * Beverage
 *   ├── Coffee
 *   │    ├── Espresso
 *   │    ├── Latte
 *   │    └── Americano
 *   │
 *   ├── Matcha
 *   │    ├── Matcha Latte
 *   │    └── Dirty Matcha
 *   │
 *   └── Fruit Soda
 *
 * Food
 *   ├── Pastries
 *   ├── Snacks
 *   └── Meals
 *
 * Other
 *   ├── Add-ons
 *   └── Merchandise
 */
export const getProductsGroupedFromDatabase = async (
  active?: boolean,
): Promise<GroupedCategory[]> => {
  const db = getDB();

  // ===========================================================================
  // GET MAIN CATEGORIES
  // ===========================================================================

  const categoryResult = await db.execute(`
    SELECT *
    FROM categories
    WHERE is_active = 1
    ORDER BY id ASC;
  `);

  const categories = categoryResult.rows ?? [];

  const result: GroupedCategory[] = [];

  // ===========================================================================
  // LOOP THROUGH MAIN CATEGORIES
  // ===========================================================================

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

    // ========================================================================
    // LOOP THROUGH SUBCATEGORIES
    // ========================================================================

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

      // Filter active products if requested.
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

      // Load product variants/items.
      for (const product of products) {
        product.items = await getProductItems(product.product_variant_id);
      }

      productCategoriesWithProducts.push({
        ...productCategory,
        products,
      });
    }

    // =========================================================================
    // UNCATEGORIZED PRODUCTS
    // =========================================================================

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

    // Load variant items.
    for (const product of uncategorizedProducts) {
      product.items = await getProductItems(product.product_variant_id);
    }

    // =========================================================================
    // ADD CATEGORY TO RESULT
    // =========================================================================

    result.push({
      ...category,

      product_categories: productCategoriesWithProducts,

      uncategorized_products: uncategorizedProducts,
    });
  }

  return result;
};

// =============================================================================
// GET PRODUCT ITEMS
// =============================================================================

/**
 * Get variant items directly.
 *
 * Useful when the UI already knows the product_variant_id.
 */
export const getProductItemsFromDatabase = async (
  productVariantId: number,
): Promise<ProductItem[]> => {
  return getProductItems(productVariantId);
};

// =============================================================================
// UPDATE PRODUCT
// =============================================================================

/**
 * Update an existing product.
 *
 * Equivalent to:
 *
 * PUT /api/products/:id
 *
 * This version uses an OP-SQLite transaction instead of manual
 * BEGIN / COMMIT / ROLLBACK.
 */
export const updateProduct = async (
  productId: number,
  data: {
    name?: string;
    description?: string | null;
    cost?: number | null;
    category_id?: number;
    product_category_id?: number | null;
    is_active?: boolean;
    items?: ProductItem[];
  },
): Promise<Product> => {
  const db = getDB();

  // ===========================================================================
  // 1. GET EXISTING PRODUCT
  // ===========================================================================

  const productResult = await db.execute(
    `
    SELECT *
    FROM products
    WHERE id = ?
    LIMIT 1;
    `,
    [productId],
  );

  const product = productResult.rows?.[0];

  if (!product) {
    throw new Error('Product not found.');
  }

  // ===========================================================================
  // 2. VALIDATE CATEGORY
  // ===========================================================================

  if (data.category_id !== undefined) {
    const categoryResult = await db.execute(
      `
      SELECT id
      FROM categories
      WHERE id = ?
      LIMIT 1;
      `,
      [data.category_id],
    );

    if (!categoryResult.rows?.length) {
      throw new Error('Invalid category_id.');
    }
  }

  // ===========================================================================
  // 3. VALIDATE SUBCATEGORY
  // ===========================================================================

  if (
    data.product_category_id !== undefined &&
    data.product_category_id !== null
  ) {
    const resolvedCategoryId =
      data.category_id !== undefined ? data.category_id : product.category_id;

    const productCategoryResult = await db.execute(
      `
      SELECT id
      FROM product_categories
      WHERE id = ?
        AND category_id = ?
      LIMIT 1;
      `,
      [data.product_category_id, resolvedCategoryId],
    );

    if (!productCategoryResult.rows?.length) {
      throw new Error('Invalid product_category_id for this category.');
    }
  }

  // ===========================================================================
  // 4. VALIDATE ITEMS BEFORE STARTING TRANSACTION
  // ===========================================================================

  if (Array.isArray(data.items)) {
    for (const [index, item] of data.items.entries()) {
      if (item.price === undefined || item.price === null) {
        throw new Error(`Item ${index + 1} is missing price.`);
      }

      const price = Number(item.price);

      if (!Number.isFinite(price)) {
        throw new Error(`Item ${index + 1} has invalid price.`);
      }

      if (
        item.temperature &&
        !VALID_TEMPERATURES.includes(
          item.temperature as (typeof VALID_TEMPERATURES)[number],
        )
      ) {
        throw new Error(`Item ${index + 1} has invalid temperature.`);
      }

      if (!item.size?.trim()) {
        throw new Error(`Item ${index + 1} is missing size.`);
      }
    }
  }

  // ===========================================================================
  // 5. TRANSACTION
  // ===========================================================================

  await db.transaction(async tx => {
    // ========================================================================
    // UPDATE PRODUCT
    // ========================================================================

    await tx.execute(
      `
      UPDATE products
      SET
        name = COALESCE(?, name),
        description = COALESCE(?, description),
        product_category_id = COALESCE(
          ?,
          product_category_id
        ),
        cost = COALESCE(?, cost),
        category_id = COALESCE(?, category_id),
        is_active = COALESCE(?, is_active),
        updated_at = datetime('now')
      WHERE id = ?;
      `,
      [
        data.name !== undefined ? data.name.trim() : null,

        data.description !== undefined ? data.description : null,

        data.product_category_id !== undefined
          ? data.product_category_id
          : null,

        data.cost !== undefined ? data.cost : null,

        data.category_id !== undefined ? data.category_id : null,

        data.is_active !== undefined ? (data.is_active ? 1 : 0) : null,

        productId,
      ],
    );

    // ========================================================================
    // REPLACE VARIANT ITEMS
    // ========================================================================

    if (Array.isArray(data.items)) {
      let productVariantId = product.product_variant_id;

      // ----------------------------------------------------------------------
      // CREATE VARIANT IF PRODUCT DOES NOT HAVE ONE
      // ----------------------------------------------------------------------

      if (!productVariantId) {
        const variantResult = await tx.execute(
          `
          INSERT INTO product_variants (
            name,
            category_id
          )
          VALUES (?, ?);
          `,
          [`${product.name} Variants`, data.category_id ?? product.category_id],
        );

        if (!variantResult.insertId) {
          throw new Error('Failed to create product variant.');
        }

        productVariantId = variantResult.insertId;

        await tx.execute(
          `
          UPDATE products
          SET
            product_variant_id = ?,
            updated_at = datetime('now')
          WHERE id = ?;
          `,
          [productVariantId, productId],
        );
      }

      // ----------------------------------------------------------------------
      // DELETE OLD ITEMS
      // ----------------------------------------------------------------------

      await tx.execute(
        `
        DELETE FROM product_variant_items
        WHERE product_variant_id = ?;
        `,
        [productVariantId],
      );

      // ----------------------------------------------------------------------
      // INSERT NEW ITEMS
      // ----------------------------------------------------------------------

      for (const item of data.items) {
        const price = Number(item.price);

        await tx.execute(
          `
          INSERT INTO product_variant_items (
            product_variant_id,
            temperature,
            size,
            price
          )
          VALUES (?, ?, ?, ?);
          `,
          [
            productVariantId,
            item.temperature ?? null,
            item.size!.trim(),
            price,
          ],
        );
      }
    }
  });

  // ===========================================================================
  // 6. RETURN UPDATED PRODUCT
  // ===========================================================================

  const updatedProduct = await getProductById(productId);

  if (!updatedProduct) {
    throw new Error('Failed to retrieve updated product.');
  }

  return updatedProduct;
};
