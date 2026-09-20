const migrations = [
  {
    version: 1,
    name: 'add_default_categories',
    run: async db => {
      await db.execute(`
        INSERT OR IGNORE INTO categories
          (name, type, is_active)
        VALUES
          ('Beverage', 'beverage', 1),
          ('Food', 'food', 1),
          ('Other', 'other', 1);
      `);
    },
  },

  {
    version: 2,
    name: 'add_status_priority_default_values',
    run: async db => {
      await db.execute(`
        INSERT OR IGNORE INTO order_statuses
          (status, priority, color, label)
        VALUES
          ('pending',   1, '#F5A623', 'Pending'),
          ('preparing', 2, '#F5A623', 'Preparing'),
          ('ready',     3, '#3befd4', 'Ready'),
          ('served',    4, '#1D9E75', 'Served'),
          ('completed', 5, '#1D9E75', 'Completed'),
          ('cancelled', 6, 'red', 'Cancelled');
      `);
    },
  },

  {
    version: 3,
    name: 'add_default_product_categories',
    run: async db => {
      await db.execute(`
        INSERT OR IGNORE INTO product_categories
          (name, category_id, is_active)
        VALUES
          ('Coffee', 1, 1),
          ('Matcha', 1, 1),
          ('Fruit Soda', 1, 1),
          ('Others', 1, 1),

          ('Pastries', 2, 1),
          ('Snacks', 2, 1),
          ('Meals', 2, 1),

          ('Add-ons', 3, 1),
          ('Merchandise', 3, 1);
      `);
    },
  },
];

export async function runMigrations(db) {
  // ─────────────────────────────────────────────────────────────────────────
  // 1. Make sure the migration tracking table exists
  // ─────────────────────────────────────────────────────────────────────────

  await db.execute(`
    CREATE TABLE IF NOT EXISTS schema_versions (
      version INTEGER PRIMARY KEY,
      applied_at TEXT DEFAULT (datetime('now'))
    );
  `);

  // ─────────────────────────────────────────────────────────────────────────
  // 2. Get the latest migration version
  // ─────────────────────────────────────────────────────────────────────────

  const result = await db.execute(`
    SELECT MAX(version) AS current_version
    FROM schema_versions;
  `);

  console.log('[DB Migration] Version query result:', result.rows?._array);

  const currentVersion = Number(result.rows?._array?.[0]?.current_version ?? 0);

  console.log('[DB Migration] Current database version:', currentVersion);

  // ─────────────────────────────────────────────────────────────────────────
  // 3. Find migrations that have not been applied
  // ─────────────────────────────────────────────────────────────────────────

  const pendingMigrations = migrations.filter(
    migration => migration.version > currentVersion,
  );

  if (pendingMigrations.length === 0) {
    console.log('[DB Migration] Database is already up to date.');

    return;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 4. Apply pending migrations
  // ─────────────────────────────────────────────────────────────────────────

  for (const migration of pendingMigrations) {
    console.log(
      `[DB Migration] Applying version ${migration.version}: ${migration.name}`,
    );

    // Run migration
    await migration.run(db);

    // IMPORTANT:
    // INSERT OR IGNORE prevents the app from crashing if the
    // migration version already exists.
    await db.execute(
      `
        INSERT OR IGNORE INTO schema_versions (version)
        VALUES (?);
      `,
      [migration.version],
    );

    console.log(`[DB Migration] Migration ${migration.version} completed.`);
  }

  console.log('[DB Migration] All migrations completed successfully.');
}
