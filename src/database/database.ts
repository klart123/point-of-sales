// src/database/database.js
import {open} from '@op-engineering/op-sqlite';
import {runMigrations} from './migrations';

let db;

export function getDB() {
  if (!db) {
    db = open({name: 'pos_data.db'}); // stored in app's document directory automatically
    db.execute('PRAGMA journal_mode = WAL');
    db.execute('PRAGMA foreign_keys = ON');
  }
  return db;
}

export async function initDB() {
  const db = getDB();

  // ─── users ────────────────────────────────────────────────────────────────
  await db.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id                 INTEGER PRIMARY KEY AUTOINCREMENT,
      name               TEXT NOT NULL,
      email              TEXT NOT NULL UNIQUE,
      password           TEXT NOT NULL,
      email_verified_at  TEXT,
      remember_token     TEXT,
      created_at         TEXT DEFAULT (datetime('now')),
      updated_at         TEXT DEFAULT (datetime('now'))
    )
  `);

  // ─── categories ───────────────────────────────────────────────────────────
  await db.execute(`
    CREATE TABLE IF NOT EXISTS categories (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      name        TEXT NOT NULL UNIQUE,
      type        TEXT NOT NULL CHECK(type IN ('beverage', 'food', 'other')),
      is_active   INTEGER DEFAULT 1,
      created_at  TEXT DEFAULT (datetime('now')),
      updated_at  TEXT DEFAULT (datetime('now'))
    )
  `);

  // ─── product_categories ───────────────────────────────────────────────────
  await db.execute(`
    CREATE TABLE IF NOT EXISTS product_categories (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      name        TEXT NOT NULL,
      category_id INTEGER NOT NULL,
      is_active   INTEGER DEFAULT 1,
      created_at  TEXT DEFAULT (datetime('now')),
      updated_at  TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
      UNIQUE(name, category_id)
    )
  `);

  // ─── product_variants ─────────────────────────────────────────────────────
  await db.execute(`
    CREATE TABLE IF NOT EXISTS product_variants (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      name        TEXT NOT NULL,
      category_id INTEGER,
      created_at  TEXT DEFAULT (datetime('now')),
      updated_at  TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
    )
  `);

  // ─── product_variant_items ────────────────────────────────────────────────
  await db.execute(`
    CREATE TABLE IF NOT EXISTS product_variant_items (
      id                  INTEGER PRIMARY KEY AUTOINCREMENT,
      product_variant_id  INTEGER NOT NULL,
      temperature         TEXT CHECK(temperature IN ('hot', 'cold', 'blended')),
      size                TEXT NOT NULL,
      price               REAL NOT NULL CHECK(price >= 0),
      created_at          TEXT DEFAULT (datetime('now')),
      updated_at          TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (product_variant_id) REFERENCES product_variants(id) ON DELETE CASCADE,
      UNIQUE(product_variant_id, temperature, size)
    )
  `);

  // ─── products ─────────────────────────────────────────────────────────────
  await db.execute(`
    CREATE TABLE IF NOT EXISTS products (
      id                  INTEGER PRIMARY KEY AUTOINCREMENT,
      name                TEXT NOT NULL,
      sku                 TEXT NOT NULL UNIQUE,
      description         TEXT,
      image               TEXT,
      category_id         INTEGER NOT NULL,
      product_variant_id  INTEGER,
      product_category_id INTEGER,
      cost                REAL CHECK(cost >= 0),
      price               REAL,
      is_active           INTEGER DEFAULT 1 CHECK(is_active IN (0, 1)),
      created_at          TEXT DEFAULT (datetime('now')),
      updated_at          TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (category_id) REFERENCES categories(id),
      FOREIGN KEY (product_variant_id) REFERENCES product_variants(id) ON DELETE SET NULL
    )
  `);

  // ─── orders ───────────────────────────────────────────────────────────────
  await db.execute(`
    CREATE TABLE IF NOT EXISTS orders (
      id               INTEGER PRIMARY KEY AUTOINCREMENT,
      order_number     TEXT NOT NULL UNIQUE,
      customer_name    TEXT,
      total_price      REAL DEFAULT 0,
      is_paid          INTEGER DEFAULT 0,
      notes            TEXT,
      payment_method   TEXT,
      cash_tendered    REAL,
      status           TEXT DEFAULT 'pending'
                         CHECK(status IN ('pending','preparing','ready','served','cancelled','completed')),
      created_at       TEXT DEFAULT (datetime('now')),
      updated_at       TEXT DEFAULT (datetime('now'))
    )
  `);

  // ─── order_items ──────────────────────────────────────────────────────────
  await db.execute(`
    CREATE TABLE IF NOT EXISTS order_items (
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

  // ─── add_on_categories ────────────────────────────────────────────────────
  await db.execute(`
    CREATE TABLE IF NOT EXISTS add_on_categories (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      name       TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // ─── add_ons ──────────────────────────────────────────────────────────────
  await db.execute(`
    CREATE TABLE IF NOT EXISTS add_ons (
      id                  INTEGER PRIMARY KEY AUTOINCREMENT,
      name                TEXT NOT NULL,
      price               REAL NOT NULL,
      add_on_category_id  INTEGER NOT NULL,
      created_at          TEXT DEFAULT (datetime('now')),
      updated_at          TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (add_on_category_id) REFERENCES add_on_categories(id) ON DELETE CASCADE
    )
  `);

  // ─── order_item_add_ons ───────────────────────────────────────────────────
  await db.execute(`
    CREATE TABLE IF NOT EXISTS order_item_add_ons (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      order_item_id INTEGER NOT NULL,
      name          TEXT NOT NULL,
      price         REAL NOT NULL,
      created_at    TEXT DEFAULT (datetime('now')),
      updated_at    TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (order_item_id) REFERENCES order_items(id) ON DELETE CASCADE
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS order_statuses (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      status    TEXT NOT NULL UNIQUE,
      priority  INTEGER NOT NULL UNIQUE,
      color     TEXT,
      label     TEXT
    )
  `);

  // ─── Run migrations ───────────────────────────────────────────────────────
  await runMigrations(db);

  console.log('[DB] SQLite ready (React Native)');
}
