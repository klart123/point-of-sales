import {Platform, StyleSheet} from 'react-native';
import {COLORS} from '../../theme';

export default StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    maxHeight: '88%',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -4},
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 12,
  },

  // ── Header ──────────────────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 20,
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
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.beige,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },

  // ── Subnet row ───────────────────────────────────────────────────────────────
  subnetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 10,
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

  // ── Scan button / scanning state ─────────────────────────────────────────────
  scanRow: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
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

  // ── Error ────────────────────────────────────────────────────────────────────
  errorText: {
    color: COLORS.textError,
    fontSize: 12,
    paddingHorizontal: 20,
    marginBottom: 6,
  },

  // ── Server list ──────────────────────────────────────────────────────────────
  list: {maxHeight: 280},
  listContent: {paddingHorizontal: 16, paddingVertical: 6},
  listEmpty: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
    alignItems: 'center',
  },
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

  // ── Server row ───────────────────────────────────────────────────────────────
  serverRow: {
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
  serverRowSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.beige,
  },
  serverRowLeft: {flexDirection: 'row', alignItems: 'center', gap: 12},
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
  serverIP: {
    color: COLORS.text,
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontWeight: '600',
  },
  serverIPSelected: {color: COLORS.primary},
  serverLabel: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 1,
  },
  latencyBadge: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  latencyText: {fontSize: 11, fontWeight: '700'},

  // ── Manual IP ────────────────────────────────────────────────────────────────
  manualRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 10,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
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

  // ── Footer ───────────────────────────────────────────────────────────────────
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: COLORS.beige,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  cancelText: {
    color: COLORS.textSecondary,
    fontWeight: '600',
    fontSize: 14,
  },
  confirmBtn: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
  },
  confirmBtnDisabled: {
    backgroundColor: COLORS.secondary,
    opacity: 0.45,
  },
  confirmText: {
    color: COLORS.background,
    fontWeight: '700',
    fontSize: 14,
  },

  // ── Pulse dot ────────────────────────────────────────────────────────────────
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
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  ms: {
    fontSize: 12,
    fontWeight: '600',
  },
  label: {
    fontSize: 11,
    fontWeight: '400',
    opacity: 0.85,
  },
});
