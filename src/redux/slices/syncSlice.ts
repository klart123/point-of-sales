import {createSlice, createAsyncThunk, PayloadAction} from '@reduxjs/toolkit';
import {getLocalIPAddress} from '../../utils/getLocalIP';
import {scanSubnetForPort} from '../../utils/networkScanner';
import {
  verifyNodes,
  pushSyncToTarget,
  NodeInfo,
  SyncTarget,
  SyncResult,
} from '../../services/syncService';

interface SyncState {
  scanning: boolean;
  nodes: NodeInfo[];
  scanError: string | null;
  syncing: boolean;
  lastSyncResult: SyncResult | null;
  syncError: string | null;
}

const initialState: SyncState = {
  scanning: false,
  nodes: [],
  scanError: null,
  syncing: false,
  lastSyncResult: null,
  syncError: null,
};

// Thunk 1: Scan LAN for nodes
export const scanForNodes = createAsyncThunk(
  'sync/scanForNodes',
  async (_, {rejectWithValue}) => {
    const myIp = await getLocalIPAddress();
    if (!myIp) return rejectWithValue('Could not determine local IP');

    const ips = await scanSubnetForPort(myIp, 3000, 20);
    if (!ips.length) return [];

    const nodes = await verifyNodes(ips, 3000);
    return nodes;
  },
);

// Thunk 2: Push sync to chosen target
export const syncToTarget = createAsyncThunk(
  'sync/syncToTarget',
  async (
    {target, since}: {target: SyncTarget; since?: string},
    {rejectWithValue},
  ) => {
    const result = await pushSyncToTarget(target, since);
    if (!result.ok) return rejectWithValue(result.error);
    return result;
  },
);

const syncSlice = createSlice({
  name: 'sync',
  initialState,
  reducers: {
    clearSyncResult(state) {
      state.lastSyncResult = null;
      state.syncError = null;
    },
  },
  extraReducers: builder => {
    // Scan
    builder
      .addCase(scanForNodes.pending, state => {
        state.scanning = true;
        state.scanError = null;
        state.nodes = [];
      })
      .addCase(
        scanForNodes.fulfilled,
        (state, action: PayloadAction<NodeInfo[]>) => {
          state.scanning = false;
          state.nodes = action.payload;
        },
      )
      .addCase(scanForNodes.rejected, (state, action) => {
        state.scanning = false;
        state.scanError = action.payload as string;
      });

    // Sync
    builder
      .addCase(syncToTarget.pending, state => {
        state.syncing = true;
        state.syncError = null;
        state.lastSyncResult = null;
      })
      .addCase(
        syncToTarget.fulfilled,
        (state, action: PayloadAction<SyncResult>) => {
          state.syncing = false;
          state.lastSyncResult = action.payload;
        },
      )
      .addCase(syncToTarget.rejected, (state, action) => {
        state.syncing = false;
        state.syncError = action.payload as string;
      });
  },
});

export const {clearSyncResult} = syncSlice.actions;
export default syncSlice.reducer;
