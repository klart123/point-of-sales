import {getDB} from './database';

// ─────────────────────────────────────────────────────────────────────────────
// Main Categories
//
// categories
//
// Beverage
// Food
// Other
// ─────────────────────────────────────────────────────────────────────────────

const MAIN_CATEGORIES = [
  {
    id: 1,
    name: 'Beverage',
    type: 'beverage',
  },
  {
    id: 2,
    name: 'Food',
    type: 'food',
  },
  {
    id: 3,
    name: 'Other',
    type: 'other',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Product Categories / Subcategories
//
// product_categories belongs to a MAIN CATEGORY.
//
// Beverage
//   ├── Coffee
//   ├── Matcha
//   ├── Fruit Soda
//   └── Others
//
// Food
//   ├── Pastries
//   ├── Snacks
//   └── Meals
//
// Other
//   ├── Add-ons
//   └── Merchandise
// ─────────────────────────────────────────────────────────────────────────────

const PRODUCT_CATEGORIES = [
  // Beverage
  {
    name: 'Coffee',
    category_id: 1,
  },
  {
    name: 'Matcha',
    category_id: 1,
  },
  {
    name: 'Fruit Soda',
    category_id: 1,
  },
  {
    name: 'Others',
    category_id: 1,
  },

  // Food
  {
    name: 'Pastries',
    category_id: 2,
  },
  {
    name: 'Snacks',
    category_id: 2,
  },
  {
    name: 'Meals',
    category_id: 2,
  },

  // Other
  {
    name: 'Add-ons',
    category_id: 3,
  },
  {
    name: 'Merchandise',
    category_id: 3,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Products
// ─────────────────────────────────────────────────────────────────────────────

const PRODUCTS = [
  // ───────────────────────────────────────────────────────────────────────
  // Coffee
  // ───────────────────────────────────────────────────────────────────────

  {
    name: 'Espresso',
    sku: 'BEV-COFFEE-001',
    category_id: 1,
    product_category_name: 'Coffee',
    description: '',
    items: [
      {
        temperature: 'hot',
        size: 'Regular',
        price: 70,
      },
    ],
  },

  {
    name: 'Americano',
    sku: 'BEV-COFFEE-002',
    category_id: 1,
    product_category_name: 'Coffee',
    description: '',
    items: [
      {
        temperature: 'hot',
        size: 'Small',
        price: 79,
      },
      {
        temperature: 'cold',
        size: 'Medium',
        price: 79,
      },
      {
        temperature: 'cold',
        size: 'Large',
        price: 99,
      },
    ],
  },

  {
    name: 'Latte',
    sku: 'BEV-COFFEE-003',
    category_id: 1,
    product_category_name: 'Coffee',
    description: '',
    items: [
      {
        temperature: 'hot',
        size: 'Medium',
        price: 89,
      },
      {
        temperature: 'cold',
        size: 'Medium',
        price: 89,
      },
      {
        temperature: 'cold',
        size: 'Large',
        price: 109,
      },
    ],
  },

  {
    name: 'Cappuccino',
    sku: 'BEV-COFFEE-004',
    category_id: 1,
    product_category_name: 'Coffee',
    description: '',
    items: [
      {
        temperature: 'hot',
        size: 'Medium',
        price: 89,
      },
      {
        temperature: 'cold',
        size: 'Medium',
        price: 89,
      },
      {
        temperature: 'cold',
        size: 'Large',
        price: 109,
      },
    ],
  },

  {
    name: 'Spanish',
    sku: 'BEV-COFFEE-005',
    category_id: 1,
    product_category_name: 'Coffee',
    description: '',
    items: [
      {
        temperature: 'hot',
        size: 'Medium',
        price: 109,
      },
      {
        temperature: 'cold',
        size: 'Medium',
        price: 109,
      },
      {
        temperature: 'cold',
        size: 'Large',
        price: 129,
      },
    ],
  },

  {
    name: 'Caramel',
    sku: 'BEV-COFFEE-006',
    category_id: 1,
    product_category_name: 'Coffee',
    description: '',
    items: [
      {
        temperature: 'hot',
        size: 'Medium',
        price: 109,
      },
      {
        temperature: 'cold',
        size: 'Medium',
        price: 109,
      },
      {
        temperature: 'cold',
        size: 'Large',
        price: 129,
      },
    ],
  },

  {
    name: 'Salted Caramel',
    sku: 'BEV-COFFEE-007',
    category_id: 1,
    product_category_name: 'Coffee',
    description: '',
    items: [
      {
        temperature: 'hot',
        size: 'Medium',
        price: 109,
      },
      {
        temperature: 'cold',
        size: 'Medium',
        price: 109,
      },
      {
        temperature: 'cold',
        size: 'Large',
        price: 129,
      },
    ],
  },

  {
    name: 'Mocha',
    sku: 'BEV-COFFEE-008',
    category_id: 1,
    product_category_name: 'Coffee',
    description: '',
    items: [
      {
        temperature: 'hot',
        size: 'Medium',
        price: 109,
      },
      {
        temperature: 'cold',
        size: 'Medium',
        price: 109,
      },
      {
        temperature: 'cold',
        size: 'Large',
        price: 129,
      },
    ],
  },

  {
    name: 'Vanilla',
    sku: 'BEV-COFFEE-009',
    category_id: 1,
    product_category_name: 'Coffee',
    description: '',
    items: [
      {
        temperature: 'hot',
        size: 'Medium',
        price: 109,
      },
      {
        temperature: 'cold',
        size: 'Medium',
        price: 109,
      },
      {
        temperature: 'cold',
        size: 'Large',
        price: 129,
      },
    ],
  },

  {
    name: 'Lychee Americano',
    sku: 'BEV-COFFEE-010',
    category_id: 1,
    product_category_name: 'Coffee',
    description: '',
    items: [
      {
        temperature: 'cold',
        size: 'Medium',
        price: 99,
      },
      {
        temperature: 'cold',
        size: 'Large',
        price: 109,
      },
    ],
  },
  {
    name: 'Biscoff Latte',
    sku: 'BEV-COFFEE-011',
    category_id: 1,
    product_category_name: 'Coffee',
    description: '',
    items: [
      {
        temperature: 'hot',
        size: 'Medium',
        price: 109,
      },
      {
        temperature: 'cold',
        size: 'Medium',
        price: 109,
      },
      {
        temperature: 'cold',
        size: 'Large',
        price: 119,
      },
    ],
  },
  {
    name: 'Oreo Latte',
    sku: 'BEV-COFFEE-012',
    category_id: 1,
    product_category_name: 'Coffee',
    description: '',
    items: [
      {
        temperature: 'hot',
        size: 'Medium',
        price: 119,
      },
      {
        temperature: 'cold',
        size: 'Medium',
        price: 119,
      },
      {
        temperature: 'cold',
        size: 'Large',
        price: 149,
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────
  // Matcha
  // ───────────────────────────────────────────────────────────────────────

  {
    name: 'Matcha Latte',
    sku: 'BEV-MATCHA-001',
    category_id: 1,
    product_category_name: 'Matcha',
    description: '',
    items: [
      {
        temperature: 'hot',
        size: 'Medium',
        price: 89,
      },
      {
        temperature: 'cold',
        size: 'Medium',
        price: 89,
      },
      {
        temperature: 'cold',
        size: 'Large',
        price: 109,
      },
    ],
  },

  {
    name: 'Matcha Spanish',
    sku: 'BEV-MATCHA-002',
    category_id: 1,
    product_category_name: 'Matcha',
    description: '',
    items: [
      {
        temperature: 'hot',
        size: 'Medium',
        price: 89,
      },
      {
        temperature: 'cold',
        size: 'Medium',
        price: 89,
      },
      {
        temperature: 'cold',
        size: 'Large',
        price: 109,
      },
    ],
  },

  {
    name: 'Matcha Caramel',
    sku: 'BEV-MATCHA-003',
    category_id: 1,
    product_category_name: 'Matcha',
    description: '',
    items: [
      {
        temperature: 'hot',
        size: 'Medium',
        price: 99,
      },
      {
        temperature: 'cold',
        size: 'Medium',
        price: 99,
      },
      {
        temperature: 'cold',
        size: 'Large',
        price: 119,
      },
    ],
  },

  {
    name: 'Matcha Salted Caramel',
    sku: 'BEV-MATCHA-004',
    category_id: 1,
    product_category_name: 'Matcha',
    description: '',
    items: [
      {
        temperature: 'hot',
        size: 'Medium',
        price: 99,
      },
      {
        temperature: 'cold',
        size: 'Medium',
        price: 99,
      },
      {
        temperature: 'cold',
        size: 'Large',
        price: 119,
      },
    ],
  },

  {
    name: 'Matcha Chocolate',
    sku: 'BEV-MATCHA-005',
    category_id: 1,
    product_category_name: 'Matcha',
    description: '',
    items: [
      {
        temperature: 'hot',
        size: 'Medium',
        price: 99,
      },
      {
        temperature: 'cold',
        size: 'Medium',
        price: 99,
      },
      {
        temperature: 'cold',
        size: 'Large',
        price: 119,
      },
    ],
  },

  {
    name: 'Matcha Strawberry',
    sku: 'BEV-MATCHA-006',
    category_id: 1,
    product_category_name: 'Matcha',
    description: '',
    items: [
      {
        temperature: 'hot',
        size: 'Medium',
        price: 99,
      },
      {
        temperature: 'cold',
        size: 'Medium',
        price: 99,
      },
      {
        temperature: 'cold',
        size: 'Large',
        price: 119,
      },
    ],
  },

  {
    name: 'Dirty Matcha',
    sku: 'BEV-MATCHA-007',
    category_id: 1,
    product_category_name: 'Matcha',
    description: '',
    items: [
      {
        temperature: 'hot',
        size: 'Medium',
        price: 109,
      },
      {
        temperature: 'cold',
        size: 'Medium',
        price: 109,
      },
      {
        temperature: 'cold',
        size: 'Large',
        price: 129,
      },
    ],
  },
  {
    name: 'Biscoff Matcha',
    sku: 'BEV-MATCHA-008',
    category_id: 1,
    product_category_name: 'Matcha',
    description: '',
    items: [
      {
        temperature: 'hot',
        size: 'Medium',
        price: 119,
      },
      {
        temperature: 'cold',
        size: 'Medium',
        price: 119,
      },
      {
        temperature: 'cold',
        size: 'Large',
        price: 149,
      },
    ],
  },
  {
    name: 'Oreo Matcha',
    sku: 'BEV-MATCHA-009',
    category_id: 1,
    product_category_name: 'Matcha',
    description: '',
    items: [
      {
        temperature: 'hot',
        size: 'Medium',
        price: 99,
      },
      {
        temperature: 'cold',
        size: 'Medium',
        price: 99,
      },
      {
        temperature: 'cold',
        size: 'Large',
        price: 119,
      },
    ],
  },
  // ───────────────────────────────────────────────────────────────────────
  // Fruit Soda
  // ───────────────────────────────────────────────────────────────────────

  {
    name: 'Strawberry Soda',
    sku: 'BEV-SODA-001',
    category_id: 1,
    product_category_name: 'Fruit Soda',
    description: '',
    items: [
      {
        temperature: 'cold',
        size: 'Medium',
        price: 60,
      },
      {
        temperature: 'cold',
        size: 'Large',
        price: 80,
      },
    ],
  },

  {
    name: 'Blueberry Soda',
    sku: 'BEV-SODA-002',
    category_id: 1,
    product_category_name: 'Fruit Soda',
    description: '',
    items: [
      {
        temperature: 'cold',
        size: 'Medium',
        price: 60,
      },
      {
        temperature: 'cold',
        size: 'Large',
        price: 80,
      },
    ],
  },

  {
    name: 'Lychee Soda',
    sku: 'BEV-SODA-003',
    category_id: 1,
    product_category_name: 'Fruit Soda',
    description: '',
    items: [
      {
        temperature: 'cold',
        size: 'Medium',
        price: 60,
      },
      {
        temperature: 'cold',
        size: 'Large',
        price: 80,
      },
    ],
  },

  {
    name: 'Green Apple Soda',
    sku: 'BEV-SODA-004',
    category_id: 1,
    product_category_name: 'Fruit Soda',
    description: '',
    items: [
      {
        temperature: 'cold',
        size: 'Medium',
        price: 60,
      },
      {
        temperature: 'cold',
        size: 'Large',
        price: 80,
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────
  // Others
  // ───────────────────────────────────────────────────────────────────────

  {
    name: 'Hot Chocolate',
    sku: 'BEV-OTHER-001',
    category_id: 1,
    product_category_name: 'Others',
    description: '',
    items: [
      {
        temperature: 'hot',
        size: 'Regular',
        price: 79,
      },
    ],
  },

  {
    name: 'Milk Chocolate',
    sku: 'BEV-OTHER-002',
    category_id: 1,
    product_category_name: 'Others',
    description: '',
    items: [
      {
        temperature: 'cold',
        size: 'Medium',
        price: 70,
      },
      {
        temperature: 'cold',
        size: 'Large',
        price: 90,
      },
    ],
  },

  {
    name: 'Milk Strawberry',
    sku: 'BEV-OTHER-003',
    category_id: 1,
    product_category_name: 'Others',
    description: '',
    items: [
      {
        temperature: 'cold',
        size: 'Medium',
        price: 70,
      },
      {
        temperature: 'cold',
        size: 'Large',
        price: 90,
      },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Seed Database
// ─────────────────────────────────────────────────────────────────────────────

export async function seedDatabase(): Promise<boolean> {
  const db = getDB();

  try {
    console.log('[Seeder] Starting database seed...');

    let createdProducts = 0;
    let updatedProducts = 0;
    let createdItems = 0;
    let updatedItems = 0;

    await db.transaction(async tx => {
      // ───────────────────────────────────────────────────────────────────────
      // 1. MAIN CATEGORIES
      // ───────────────────────────────────────────────────────────────────────

      const categoryMap: Record<string, number> = {};

      for (const category of MAIN_CATEGORIES) {
        const existing = await tx.execute(
          `
          SELECT id
          FROM categories
          WHERE id = ?
          LIMIT 1;
          `,
          [category.id],
        );

        if (existing.rows?.length > 0) {
          await tx.execute(
            `
            UPDATE categories
            SET
              name = ?,
              updated_at = CURRENT_TIMESTAMP
            WHERE id = ?;
            `,
            [category.name, category.id],
          );
        } else {
          await tx.execute(
            `
            INSERT INTO categories (
              id,
              name,
              type,
              created_at,
              updated_at
            )
            VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
            `,
            [category.id, category.name, category.type],
          );
        }

        categoryMap[category.name] = category.id;
      }

      console.log('[Seeder] Main category map:', categoryMap);

      // ───────────────────────────────────────────────────────────────────────
      // 2. PRODUCT CATEGORIES / SUBCATEGORIES
      // ───────────────────────────────────────────────────────────────────────

      const productCategoryMap: Record<string, number> = {};

      for (const category of PRODUCT_CATEGORIES) {
        // Make sure the main category actually exists.
        const mainCategoryExists = Object.values(categoryMap).includes(
          category.category_id,
        );

        if (!mainCategoryExists) {
          throw new Error(
            `Main category ID "${category.category_id}" not found for product category "${category.name}".`,
          );
        }

        const existing = await tx.execute(
          `
          SELECT id
          FROM product_categories
          WHERE name = ?
            AND category_id = ?
          LIMIT 1;
          `,
          [category.name, category.category_id],
        );

        let productCategoryId: number;

        if (existing.rows?.length > 0) {
          productCategoryId = Number(existing.rows[0].id);

          await tx.execute(
            `
            UPDATE product_categories
            SET
              name = ?,
              category_id = ?,
              updated_at = CURRENT_TIMESTAMP
            WHERE id = ?;
            `,
            [category.name, category.category_id, productCategoryId],
          );

          console.log(`[Seeder] Product category updated: ${category.name}`);
        } else {
          const result = await tx.execute(
            `
            INSERT INTO product_categories (
              name,
              category_id,
              created_at,
              updated_at
            )
            VALUES (
              ?,
              ?,
              CURRENT_TIMESTAMP,
              CURRENT_TIMESTAMP
            );
            `,
            [category.name, category.category_id],
          );

          if (result.insertId === undefined || result.insertId === null) {
            throw new Error(
              `Failed to create product category: ${category.name}`,
            );
          }

          productCategoryId = Number(result.insertId);

          console.log(`[Seeder] Product category created: ${category.name}`);
        }

        // Example:
        //
        // 1:Coffee       → 1
        // 1:Matcha       → 2
        // 1:Fruit Soda   → 3
        // 1:Others       → 4
        // 2:Pastries     → 5
        // 2:Snacks       → 6
        // 2:Meals        → 7
        // 3:Add-ons      → 8
        // 3:Merchandise  → 9

        productCategoryMap[`${category.category_id}:${category.name}`] =
          productCategoryId;
      }

      console.log('[Seeder] Product category map:', productCategoryMap);

      // ───────────────────────────────────────────────────────────────────────
      // 3. PRODUCTS
      // ───────────────────────────────────────────────────────────────────────

      for (const product of PRODUCTS) {
        console.log(`[Seeder] Processing product: ${product.name}`);

        // ─────────────────────────────────────────────────────────────────
        // Get the product category ID
        //
        // Example:
        //
        // Espresso
        // category_id = 1
        // product_category_name = Coffee
        //
        // → productCategoryMap["1:Coffee"]
        // ─────────────────────────────────────────────────────────────────

        const productCategoryKey = `${product.category_id}:${product.product_category_name}`;

        const productCategoryId = productCategoryMap[productCategoryKey];

        if (!productCategoryId) {
          throw new Error(
            `Product category "${product.product_category_name}" with main category ID "${product.category_id}" not found.`,
          );
        }

        // ─────────────────────────────────────────────────────────────────
        // Find existing product by SKU
        // ─────────────────────────────────────────────────────────────────

        const existingProductResult = await tx.execute(
          `
            SELECT id
            FROM products
            WHERE sku = ?
            LIMIT 1;
            `,
          [product.sku],
        );

        const existingProductRows = existingProductResult.rows ?? [];

        let productId: number;

        // ─────────────────────────────────────────────────────────────────
        // UPDATE PRODUCT
        // ─────────────────────────────────────────────────────────────────

        if (existingProductRows.length > 0) {
          productId = Number(existingProductRows[0].id);

          await tx.execute(
            `
            UPDATE products
            SET
              name = ?,
              category_id = ?,
              product_category_id = ?,
              description = ?,
              price = ?,
              is_active = 1,
              updated_at = CURRENT_TIMESTAMP
            WHERE id = ?;
            `,
            [
              product.name,
              product.category_id,
              productCategoryId,
              product.description ?? '',
              product.items[0]?.price ?? 0,
              productId,
            ],
          );

          updatedProducts++;

          console.log(`[Seeder] Product updated: ${product.name}`);
        } else {
          // ───────────────────────────────────────────────────────────────
          // CREATE PRODUCT
          // ───────────────────────────────────────────────────────────────

          const productResult = await tx.execute(
            `
              INSERT INTO products (
                name,
                sku,
                category_id,
                product_category_id,
                description,
                price,
                is_active
              )
              VALUES (?, ?, ?, ?, ?, ?, 1);
              `,
            [
              product.name,
              product.sku,
              product.category_id,
              productCategoryId,
              product.description ?? '',
              product.items[0]?.price ?? 0,
            ],
          );

          if (
            productResult.insertId === undefined ||
            productResult.insertId === null
          ) {
            throw new Error(`Failed to create product: ${product.name}`);
          }

          productId = Number(productResult.insertId);

          createdProducts++;

          console.log(`[Seeder] Product created: ${product.name}`);
        }

        // ─────────────────────────────────────────────────────────────────
        // 4. PRODUCT VARIANT
        // ─────────────────────────────────────────────────────────────────

        let productVariantId: number;

        const variantName = `${product.name} Variants`;

        const existingVariantResult = await tx.execute(
          `
            SELECT id
            FROM product_variants
            WHERE name = ?
              AND category_id = ?
            LIMIT 1;
            `,
          [variantName, product.category_id],
        );

        const existingVariantRows = existingVariantResult.rows ?? [];

        if (existingVariantRows.length > 0) {
          productVariantId = Number(existingVariantRows[0].id);

          console.log(`[Seeder] Variant exists: ${product.name}`);
        } else {
          const variantResult = await tx.execute(
            `
              INSERT INTO product_variants (
                name,
                category_id
              )
              VALUES (?, ?);
              `,
            [variantName, product.category_id],
          );

          if (
            variantResult.insertId === undefined ||
            variantResult.insertId === null
          ) {
            throw new Error(`Failed to create variant: ${product.name}`);
          }

          productVariantId = Number(variantResult.insertId);

          console.log(`[Seeder] Variant created: ${product.name}`);
        }

        // ─────────────────────────────────────────────────────────────────
        // 5. LINK PRODUCT → PRODUCT VARIANT
        // ─────────────────────────────────────────────────────────────────

        await tx.execute(
          `
          UPDATE products
          SET
            product_variant_id = ?,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ?;
          `,
          [productVariantId, productId],
        );

        // ─────────────────────────────────────────────────────────────────
        // 6. PRODUCT VARIANT ITEMS
        // ─────────────────────────────────────────────────────────────────

        for (const item of product.items) {
          const temperature = item.temperature ?? null;

          // Handle NULL correctly.
          //
          // Using:
          //     temperature IS ?
          //
          // allows SQLite to compare both NULL and
          // normal values.

          const existingItemResult = await tx.execute(
            `
              SELECT id
              FROM product_variant_items
              WHERE product_variant_id = ?
                AND temperature IS ?
                AND size = ?
              LIMIT 1;
              `,
            [productVariantId, temperature, item.size],
          );

          const existingItemRows = existingItemResult.rows ?? [];

          if (existingItemRows.length > 0) {
            const itemId = Number(existingItemRows[0].id);

            await tx.execute(
              `
              UPDATE product_variant_items
              SET
                temperature = ?,
                size = ?,
                price = ?,
                updated_at = CURRENT_TIMESTAMP
              WHERE id = ?;
              `,
              [temperature, item.size, item.price, itemId],
            );

            updatedItems++;

            console.log(
              `[Seeder] Item updated: ${product.name} / ${temperature} / ${item.size}`,
            );
          } else {
            await tx.execute(
              `
              INSERT INTO product_variant_items (
                product_variant_id,
                temperature,
                size,
                price,
                created_at,
                updated_at
              )
              VALUES (
                ?,
                ?,
                ?,
                ?,
                CURRENT_TIMESTAMP,
                CURRENT_TIMESTAMP
              );
              `,
              [productVariantId, temperature, item.size, item.price],
            );

            createdItems++;

            console.log(
              `[Seeder] Item created: ${product.name} / ${temperature} / ${item.size}`,
            );
          }
        }
      }
    });

    // ─────────────────────────────────────────────────────────────────────────
    // Completed
    // ─────────────────────────────────────────────────────────────────────────

    console.log('[Seeder] Database seeding completed successfully.');

    console.log('[Seeder] Summary:', {
      createdProducts,
      updatedProducts,
      createdItems,
      updatedItems,
    });

    return true;
  } catch (error) {
    console.error('[Seeder] SEEDING FAILED');

    if (error instanceof Error) {
      console.error('[Seeder] Error name:', error.name);

      console.error('[Seeder] Error message:', error.message);

      console.error('[Seeder] Error stack:', error.stack);
    } else {
      console.error('[Seeder] Unknown error:', JSON.stringify(error, null, 2));
    }

    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Clear Seeded Database
// ─────────────────────────────────────────────────────────────────────────────
export async function clearSeededDatabase(): Promise<void> {
  const db = getDB();

  try {
    console.log('[Seeder] Clearing local database...');

    await db.transaction(async tx => {
      await tx.execute(`
        DELETE FROM product_variant_items;
      `);

      await tx.execute(`
        DELETE FROM products;
      `);

      await tx.execute(`
        DELETE FROM product_variants;
      `);

      await tx.execute(`
        DELETE FROM product_categories;
      `);

      // Reset AUTOINCREMENT for seeded tables
      await tx.execute(`
        DELETE FROM sqlite_sequence
        WHERE name IN (
          'product_variant_items',
          'products',
          'product_variants',
          'product_categories'
        );
      `);
    });

    console.log('[Seeder] Local database cleared successfully.');
  } catch (error) {
    console.error('[Seeder] Failed to clear database:', error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Reset Seeded Database
// ─────────────────────────────────────────────────────────────────────────────

export async function resetAllDatabase(): Promise<void> {
  const db = getDB();

  try {
    console.log('[DB] Clearing all local database data...');

    await db.transaction(async tx => {
      // Order-related data
      await tx.execute(`
        DELETE FROM order_item_add_ons;
      `);

      await tx.execute(`
        DELETE FROM order_items;
      `);

      await tx.execute(`
        DELETE FROM orders;
      `);

      // Add-ons
      await tx.execute(`
        DELETE FROM add_ons;
      `);

      await tx.execute(`
        DELETE FROM add_on_categories;
      `);

      // Products
      await tx.execute(`
        DELETE FROM product_variant_items;
      `);

      await tx.execute(`
        DELETE FROM products;
      `);

      await tx.execute(`
        DELETE FROM product_variants;
      `);

      await tx.execute(`
        DELETE FROM product_categories;
      `);

      // Users
      await tx.execute(`
        DELETE FROM users;
      `);

      // Main categories
      await tx.execute(`
        DELETE FROM categories;
      `);

      // Order statuses
      await tx.execute(`
        DELETE FROM order_statuses;
      `);

      // Reset AUTOINCREMENT for seeded tables
      await tx.execute(`
        DELETE FROM sqlite_sequence
        WHERE name IN (
          'product_variant_items',
          'products',
          'product_variants',
          'product_categories'
        );
      `);
    });

    console.log('[DB] All local database data cleared successfully.');
  } catch (error) {
    console.error('[DB] Failed to clear database:', error);
    throw error;
  }
}
