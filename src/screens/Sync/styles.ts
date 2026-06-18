// ─── Styles ───────────────────────────────────────────────────────────────────
import {COLORS} from '../../theme';
import {Platform, StyleSheet} from 'react-native';

export default StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 25,
  },

  // Header
  header: {
    marginBottom: 14,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: 0.2,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 3,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },

  // Subnet row
  subnetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 10,
    marginBottom: 2,
  },
  subnetLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    width: 52,
  },
  subnetInput: {
    flex: 1,
    backgroundColor: COLORS.peach,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: COLORS.text,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 13,
  },

  // Scan row
  scanRow: {paddingBottom: 12},
  scanBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  scanBtnText: {
    color: COLORS.background,
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: 0.3,
  },
  scanningState: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.peach,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 10,
    gap: 10,
  },
  progressWrap: {flex: 1, gap: 4},
  progressTrack: {
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: 4,
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  progressText: {
    color: COLORS.textSecondary,
    fontSize: 11,
  },
  stopBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: COLORS.beige,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  stopBtnText: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '600',
  },

  errorText: {
    color: COLORS.textError,
    fontSize: 12,
    marginBottom: 6,
  },

  // Pulse dot
  pulseWrapper: {
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.primary,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.secondary,
  },

  // Node list
  list: {flex: 1},
  listContent: {paddingVertical: 6},
  listEmpty: {flex: 1, justifyContent: 'center'},

  emptyState: {alignItems: 'center', gap: 8, paddingVertical: 10},
  emptyIcon: {fontSize: 32},
  emptyTitle: {
    color: COLORS.text,
    fontWeight: '600',
    fontSize: 14,
  },
  emptyBody: {
    color: COLORS.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 260,
  },

  // Node row — mirrors serverRow from modal styles
  nodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.cardSoft,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  nodeRowSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.beige,
  },
  supabaseRow: {
    borderColor: COLORS.border,
  },
  nodeRowLeft: {flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1},
  nodeInfo: {flex: 1},
  nodeIP: {
    color: COLORS.text,
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontWeight: '600',
  },
  nodeIPSelected: {color: COLORS.primary},
  nodeSubtext: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 1,
  },

  // Radio — exact copy from modal
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: {borderColor: COLORS.primary},
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },

  // Latency badge — exact copy from modal
  latencyBadge: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  latencyText: {fontSize: 11, fontWeight: '700'},

  // Manual row — mirrors modal manualRow
  manualRow: {
    flexDirection: 'row',
    paddingTop: 10,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    marginBottom: 10,
  },
  manualInput: {
    flex: 1,
    backgroundColor: COLORS.peach,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    paddingVertical: 9,
    color: COLORS.text,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 13,
  },
  manualAddBtn: {
    backgroundColor: COLORS.secondary,
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  manualAddText: {
    color: COLORS.background,
    fontWeight: '600',
    fontSize: 14,
  },

  // Result banners
  resultSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: COLORS.beige,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  resultError: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: COLORS.beige,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: COLORS.textError,
  },
  resultIcon: {fontSize: 20},
  resultTitle: {fontSize: 14, fontWeight: '700', color: COLORS.text},
  resultSub: {fontSize: 12, color: COLORS.textSecondary, marginTop: 2},

  // Footer sync buttons — mirrors modal footer/confirmBtn pattern
  footer: {
    flexDirection: 'row',
    paddingTop: 12,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  syncBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
  },
  syncAllBtn: {
    backgroundColor: COLORS.secondary,
  },
  syncBtnDisabled: {
    opacity: 0.45,
  },
  syncBtnText: {
    color: COLORS.background,
    fontWeight: '700',
    fontSize: 14,
  },
});
