const migrations = [
  {
    version: 1,
    name: 'add_default_categories',
    run: db => {
      db.execute(`
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
    run: db => {
      db.execute(`
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
];

export function runMigrations(db) {
  // Fetch current user database layout version
  const result = db.execute(
    'SELECT MAX(version) as current_version FROM schema_versions;',
  );
  const currentVersion = result.rows?._array[0]?.current_version || 0;

  // Filter out updates the user already applied in past launches
  const pendingMigrations = migrations.filter(m => m.version > currentVersion);

  if (pendingMigrations.length === 0) return;

  // Wrap inside a fast atomized transaction block
  db.transaction(tx => {
    for (const migration of pendingMigrations) {
      console.log(
        `[DB Migration] Applying version ${migration.version}: ${migration.name}`,
      );

      // Execute instructions
      migration.run(db);

      // Save migration version history stamp
      db.execute('INSERT INTO schema_versions (version) VALUES (?);', [
        migration.version,
      ]);
    }
  });

  console.log('[DB Migration] All schema structures synced up successfully.');
}
