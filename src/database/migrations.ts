// src/database/migrations.js
const migrations = [
  {
    version: 1,
    name: 'add_default_categories',
    up: async db => {
      await db.execute(`
        INSERT OR IGNORE INTO categories (name, type, is_active) VALUES
        ('Beverage', 'beverage', 1),
        ('Food', 'food', 1),
        ('Other', 'other', 1)
      `);
    },
  },
  {
    version: 2,
    name: 'add_status_priority_default_values',
    up: async db => {
      await db.execute(`
        INSERT OR IGNORE INTO order_statuses (status, priority, color, label) VALUES
        ('pending',   1, '#F5A623', 'Pending'),
        ('preparing', 2, '#F5A623', 'Preparing'),
        ('ready',     3, '#3befd4', 'Ready'),
        ('served',    4, '#1D9E75', 'Served'),
        ('completed', 5, '#1D9E75', 'Completed'),
        ('cancelled', 6, 'red',    'Cancelled')
      `);
    },
  },
  {
    version: 3,
    name: 'widen_order_items_status_constraint',
    up: async db => {
      await db.execute(`
        CREATE TABLE IF NOT EXISTS order_items_new (
          id          INTEGER PRIMARY KEY AUTOINCREMENT,
          order_id    INTEGER NOT NULL,
          sku         TEXT NOT NULL,
          name        TEXT NOT NULL,
          type        TEXT,
          size        TEXT NOT NULL,
          price       REAL NOT NULL,
          quantity    INTEGER DEFAULT 1,
          status      TEXT DEFAULT 'pending'
                        CHECK(status IN ('pending', 'done', 'cancelled', 'completed')),
          add_ons     TEXT,
          created_at  TEXT DEFAULT (datetime('now')),
          updated_at  TEXT DEFAULT (datetime('now')),
          FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
        )
      `);

      await db.execute(`
        INSERT INTO order_items_new
          (id, order_id, sku, name, type, size, price, quantity, status, add_ons, created_at, updated_at)
        SELECT
          id, order_id, sku, name, type, size, price, quantity, status, add_ons, created_at, updated_at
        FROM order_items
      `);

      await db.execute(`DROP TABLE order_items`);
      await db.execute(`ALTER TABLE order_items_new RENAME TO order_items`);
    },
  },
];

export async function runMigrations(db) {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS migrations (
      id      INTEGER PRIMARY KEY AUTOINCREMENT,
      version INTEGER NOT NULL UNIQUE,
      name    TEXT NOT NULL,
      run_at  TEXT DEFAULT (datetime('now'))
    )
  `);

  const {rows} = await db.execute('SELECT version FROM migrations');
  const ran = rows.map(r => r.version);

  for (const migration of migrations) {
    if (ran.includes(migration.version)) {
      console.log(
        `[Migration] v${migration.version} ${migration.name} — skipped`,
      );
      continue;
    }

    try {
      await db.transaction(async tx => {
        await migration.up(tx);
        await tx.execute(
          'INSERT INTO migrations (version, name) VALUES (?, ?)',
          [migration.version, migration.name],
        );
      });

      console.log(
        `[Migration] v${migration.version} ${migration.name} — ✓ done`,
      );
    } catch (err) {
      console.error(
        `[Migration] v${migration.version} ${migration.name} — ✗ failed:`,
        err.message,
      );
      throw err;
    }
  }
}
