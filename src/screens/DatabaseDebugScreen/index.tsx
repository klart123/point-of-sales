import React, {useCallback, useEffect, useState} from 'react';
import {
  Alert,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {getDB} from '../../database/database';

type TableName = string;

export default function DatabaseDebugScreen() {
  const [tables, setTables] = useState<TableName[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);

  const [rows, setRows] = useState<any[]>([]);
  const [loadingTables, setLoadingTables] = useState(false);
  const [loadingRows, setLoadingRows] = useState(false);

  // ───────────────────────────────────────────────────────────────────────────
  // Get all tables
  // ───────────────────────────────────────────────────────────────────────────

  const loadTables = useCallback(async () => {
    try {
      setLoadingTables(true);

      const db = getDB();

      const result = await db.execute(`
        SELECT name
        FROM sqlite_master
        WHERE type = 'table'
          AND name NOT LIKE 'sqlite_%'
        ORDER BY name;
      `);

      const tableNames = (result.rows ?? []).map(row => row.name);

      console.log('[DB Debug] Tables:', tableNames);

      setTables(tableNames);

      // Automatically select the first table
      if (tableNames.length > 0) {
        setSelectedTable(current =>
          current && tableNames.includes(current) ? current : tableNames[0],
        );
      }
    } catch (error) {
      console.error('[DB Debug] Failed to load tables:', error);

      Alert.alert(
        'Database Error',
        error instanceof Error ? error.message : String(error),
      );
    } finally {
      setLoadingTables(false);
    }
  }, []);

  // ───────────────────────────────────────────────────────────────────────────
  // Get rows from selected table
  // ───────────────────────────────────────────────────────────────────────────

  const loadTable = useCallback(async (table: string) => {
    try {
      setLoadingRows(true);
      setSelectedTable(table);

      const db = getDB();

      const result = await db.execute(`SELECT * FROM "${table}";`);

      console.log(`[DB Debug] ${table}:`, result.rows);

      setRows(result.rows ?? []);
    } catch (error) {
      console.error('[DB Debug] Failed:', error);

      Alert.alert(
        'Database Error',
        error instanceof Error ? error.message : String(error),
      );
    } finally {
      setLoadingRows(false);
    }
  }, []);

  // ───────────────────────────────────────────────────────────────────────────
  // Load tables when screen opens
  // ───────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    loadTables();
  }, [loadTables]);

  // ───────────────────────────────────────────────────────────────────────────
  // Automatically load selected table
  // ───────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (selectedTable) {
      loadTable(selectedTable);
    }
  }, [selectedTable, loadTable]);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>SQLite Database</Text>

      {/* ─────────────────────────────────────────────────────────────────────
          Tables
      ───────────────────────────────────────────────────────────────────── */}

      {loadingTables ? (
        <Text style={styles.status}>Loading tables...</Text>
      ) : (
        <View style={styles.tableButtons}>
          {tables.map(table => (
            <TouchableOpacity
              key={table}
              style={[
                styles.tableButton,
                selectedTable === table && styles.tableButtonActive,
              ]}
              onPress={() => setSelectedTable(table)}>
              <Text
                style={[
                  styles.tableButtonText,
                  selectedTable === table && styles.tableButtonTextActive,
                ]}>
                {table}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* ─────────────────────────────────────────────────────────────────────
          Selected table
      ───────────────────────────────────────────────────────────────────── */}

      {selectedTable && (
        <Text style={styles.currentTable}>Table: {selectedTable}</Text>
      )}

      {/* ─────────────────────────────────────────────────────────────────────
          Rows
      ───────────────────────────────────────────────────────────────────── */}

      {loadingRows ? (
        <Text style={styles.status}>Loading...</Text>
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(_, index) => String(index)}
          contentContainerStyle={styles.list}
          renderItem={({item, index}) => (
            <View style={styles.row}>
              <Text style={styles.rowNumber}>#{index + 1}</Text>

              <Text style={styles.rowText}>
                {JSON.stringify(item, null, 2)}
              </Text>
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.empty}>No records found.</Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },

  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
  },

  tableButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  tableButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderRadius: 8,
  },

  tableButtonActive: {
    backgroundColor: '#000',
  },

  tableButtonText: {
    fontSize: 12,
  },

  tableButtonTextActive: {
    color: '#fff',
  },

  currentTable: {
    marginTop: 20,
    marginBottom: 10,
    fontSize: 16,
    fontWeight: '600',
  },

  status: {
    marginTop: 20,
  },

  list: {
    paddingBottom: 30,
  },

  row: {
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderRadius: 8,
  },

  rowNumber: {
    fontWeight: '700',
    marginBottom: 6,
  },

  rowText: {
    fontFamily: 'Courier',
    fontSize: 12,
  },

  empty: {
    textAlign: 'center',
    marginTop: 30,
  },
});
