// CrimeSphere AI — CaseDetailScreen (Investigation Workspace)
// Layout: left panel (case metadata + description) | right panel (network graph)
// Node click → draggable & resizable floating popup
import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, Pressable, Animated,
  ScrollView, LayoutChangeEvent, PanResponder,
  Platform,
} from 'react-native';
import Svg, { Path, Circle, Defs, RadialGradient as SvgRadialGradient, Stop } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RouteProp } from '@react-navigation/native';
import type { CaseStackParamList } from '../../types/navigation';
import { Colors } from '../../constants/colors';
import { FontFamily, FontSize } from '../../constants/typography';
import { useCaseStore } from '../../store/caseStore';
import { EmptyState } from '../../components/ui/EmptyState';
import type { Priority } from '../../types';

// ─── Types ────────────────────────────────────────────────────────────────────
type Props = {
  navigation: StackNavigationProp<CaseStackParamList, 'CaseDetail'>;
  route: RouteProp<CaseStackParamList, 'CaseDetail'>;
};

type Category = 'people' | 'evidence' | 'intel' | 'location' | 'assets';

interface NodeDef {
  id: string;
  label: string;
  subLabel: string;
  icon: string;
  category: Category;
  angle: number;
  ring: 'inner' | 'outer';
}

interface PopupPos { x: number; y: number; w: number; h: number }
type OpenedNodesMap = Map<string, NodeDef>;

// ─── Constants ────────────────────────────────────────────────────────────────
const PRIORITY_COLORS: Record<Priority, string> = {
  urgent: Colors.red,
  review: Colors.amber,
  routine: Colors.green,
};

const PRIORITY_LABELS: Record<Priority, string> = {
  urgent: 'HIGH PRIORITY',
  review: 'UNDER REVIEW',
  routine: 'ROUTINE',
};

const CAT_COLOR: Record<Category, string> = {
  people:   Colors.steel,
  evidence: Colors.amber,
  intel:    Colors.inkNavy,
  location: Colors.red,
  assets:   Colors.green,
};

const CAT_TINT: Record<Category, string> = {
  people:   Colors.paperDim,
  evidence: Colors.amberDim,
  intel:    Colors.paperDim,
  location: Colors.redDim,
  assets:   Colors.greenDim,
};

const CAT_LABEL: Record<Category, string> = {
  people:   'People',
  evidence: 'Evidence',
  intel:    'Intelligence',
  location: 'Location',
  assets:   'Assets',
};

const ALL_NODE_IDS = [
  'suspects','evidence','documents','linked','financial','witnesses',
  'timeline','analysis','network','vehicles','calls','crimescene','officer','cctv',
];

const RING_GAP   = 8;
const TOP_PAD    = 108;
const BOTTOM_PAD = 96;

// Popup defaults / constraints
const POPUP_DEFAULT_W = 320;
const POPUP_DEFAULT_H = 400;
const POPUP_MIN_W     = 260;
const POPUP_MIN_H     = 200;

// ─── Draggable Resizable Popup ────────────────────────────────────────────────
interface PopupProps {
  node: NodeDef;
  children: React.ReactNode;
  onClose: () => void;
  containerW: number;
  containerH: number;
  accentColor: string;
  tintColor: string;
  offsetIndex?: number;  // stagger each popup so they don't perfectly overlap
}

const DraggablePopup: React.FC<PopupProps> = ({
  node, children, onClose, containerW, containerH, accentColor, tintColor,
  offsetIndex = 0,
}) => {
  const STAGGER = 28 * offsetIndex;
  const posRef = useRef<PopupPos>({
    x: Math.min(containerW - POPUP_DEFAULT_W, Math.max(0, (containerW - POPUP_DEFAULT_W) / 2 + STAGGER)),
    y: Math.min(containerH - POPUP_DEFAULT_H, Math.max(0, (containerH - POPUP_DEFAULT_H) / 2 + STAGGER)),
    w: POPUP_DEFAULT_W,
    h: POPUP_DEFAULT_H,
  });
  const dragStart   = useRef({ px: 0, py: 0, ox: 0, oy: 0 });
  const resizeStart = useRef({ px: 0, py: 0, ow: 0, oh: 0 });
  const [, forceUpdate] = useState(0);
  const popupAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate in — position is set at mount so we don't re-center on every re-render
    popupAnim.setValue(0);
    Animated.spring(popupAnim, { toValue: 1, friction: 7, tension: 100, useNativeDriver: true }).start();
  }, [node.id]);

  // ── Drag responder (title bar)
  const dragResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => {
        dragStart.current = {
          px: e.nativeEvent.pageX,
          py: e.nativeEvent.pageY,
          ox: posRef.current.x,
          oy: posRef.current.y,
        };
      },
      onPanResponderMove: (e) => {
        const dx = e.nativeEvent.pageX - dragStart.current.px;
        const dy = e.nativeEvent.pageY - dragStart.current.py;
        posRef.current.x = Math.max(0, Math.min(containerW - posRef.current.w, dragStart.current.ox + dx));
        posRef.current.y = Math.max(0, Math.min(containerH - posRef.current.h, dragStart.current.oy + dy));
        forceUpdate(n => n + 1);
      },
    })
  ).current;

  // ── Resize responder (bottom-right corner handle)
  const resizeResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => {
        resizeStart.current = {
          px: e.nativeEvent.pageX,
          py: e.nativeEvent.pageY,
          ow: posRef.current.w,
          oh: posRef.current.h,
        };
      },
      onPanResponderMove: (e) => {
        const dx = e.nativeEvent.pageX - resizeStart.current.px;
        const dy = e.nativeEvent.pageY - resizeStart.current.py;
        posRef.current.w = Math.max(POPUP_MIN_W, Math.min(containerW - posRef.current.x, resizeStart.current.ow + dx));
        posRef.current.h = Math.max(POPUP_MIN_H, Math.min(containerH - posRef.current.y, resizeStart.current.oh + dy));
        forceUpdate(n => n + 1);
      },
    })
  ).current;

  const { x, y, w, h } = posRef.current;

  const popupScale   = popupAnim.interpolate({ inputRange: [0, 1], outputRange: [0.88, 1] });
  const popupOpacity = popupAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });

  return (
    <Animated.View
      style={[
        popupStyles.popup,
        {
          left: x, top: y, width: w, height: h,
          borderColor: accentColor + '55',
          transform: [{ scale: popupScale }],
          opacity: popupOpacity,
        },
      ]}
    >
      {/* ── Title bar (draggable) */}
      <View
        {...dragResponder.panHandlers}
        style={[popupStyles.titleBar, { backgroundColor: accentColor }]}
      >
        <View style={popupStyles.titleBarLeft}>
          <Text style={popupStyles.titleBarIcon}>{node.icon}</Text>
          <View>
            <Text style={popupStyles.titleBarLabel}>{node.label}</Text>
            <Text style={popupStyles.titleBarSub}>{node.subLabel}</Text>
          </View>
        </View>
        <View style={popupStyles.titleBarRight}>
          <View style={[popupStyles.catBadge, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
            <Text style={popupStyles.catBadgeText}>{CAT_LABEL[node.category].toUpperCase()}</Text>
          </View>
          <Pressable onPress={onClose} style={popupStyles.closeBtn} accessibilityLabel="Close popup">
            <Text style={popupStyles.closeBtnText}>✕</Text>
          </Pressable>
        </View>
      </View>

      {/* ── Accent divider */}
      <View style={[popupStyles.accentDivider, { backgroundColor: accentColor }]} />

      {/* ── Scrollable body */}
      <ScrollView
        style={popupStyles.body}
        contentContainerStyle={popupStyles.bodyContent}
        showsVerticalScrollIndicator
        nestedScrollEnabled
        bounces={false}
      >
        {children}
        <View style={{ height: 32 }} />
      </ScrollView>

      {/* ── Resize handle (bottom-right) */}
      <View
        {...resizeResponder.panHandlers}
        style={[popupStyles.resizeHandle, { borderColor: accentColor + '88' }]}
      >
        <Text style={[popupStyles.resizeIcon, { color: accentColor }]}>⤡</Text>
      </View>

      {/* ── Drag hint strip */}
      <View style={popupStyles.dragHint}>
        <View style={[popupStyles.dragDot, { backgroundColor: accentColor + '55' }]} />
        <View style={[popupStyles.dragDot, { backgroundColor: accentColor + '55' }]} />
        <View style={[popupStyles.dragDot, { backgroundColor: accentColor + '55' }]} />
      </View>
    </Animated.View>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────────
export const CaseDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { caseId } = route.params;
  const getCaseById = useCaseStore((s) => s.getCaseById);
  const caseItem = getCaseById(caseId);
  const insets = useSafeAreaInsets();

  // Canvas dimensions (right graph pane)
  const [cW, setCW] = useState(0);
  const [containerH, setContainerH] = useState(0);

  // Interaction state — Map of nodeId → NodeDef for multi-popup support
  const [openedNodes, setOpenedNodes] = useState<OpenedNodesMap>(new Map());
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // ── Animation refs ──────────────────────────────────────────────────────────
  const globalFade  = useRef(new Animated.Value(0)).current;
  const centerScale = useRef(new Animated.Value(0.72)).current;
  const pulseAnim   = useRef(new Animated.Value(0)).current;

  const nodeEnter = useRef<Record<string, Animated.Value>>({});
  const nodePress = useRef<Record<string, Animated.Value>>({});

  ALL_NODE_IDS.forEach((id) => {
    if (!nodeEnter.current[id]) nodeEnter.current[id] = new Animated.Value(0);
    if (!nodePress.current[id]) nodePress.current[id] = new Animated.Value(1);
  });

  useEffect(() => {
    Animated.timing(globalFade,  { toValue: 1, duration: 480, useNativeDriver: true }).start();
    Animated.spring(centerScale, { toValue: 1, friction: 6, tension: 80, useNativeDriver: true }).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 2200, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0, duration: 2200, useNativeDriver: true }),
      ])
    ).start();
    ALL_NODE_IDS.forEach((id, i) => {
      Animated.sequence([
        Animated.delay(280 + i * 55),
        Animated.spring(nodeEnter.current[id], { toValue: 1, friction: 7, tension: 85, useNativeDriver: true }),
      ]).start();
    });
  }, []);

  // ── Guard ──────────────────────────────────────────────────────────────────
  if (!caseItem) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <EmptyState icon="📂" title="Case not found" subtitle={`No case with ID ${caseId}`} />
      </View>
    );
  }

  const pc = PRIORITY_COLORS[caseItem.priority];

  // ── Node definitions ────────────────────────────────────────────────────────
  const nodeDefs: NodeDef[] = [
    { id: 'suspects',   label: 'Suspects',      subLabel: `${Math.max(1, caseItem.entities.length)} Persons`,  icon: '👤', category: 'people',   angle: -90,  ring: 'inner' },
    { id: 'evidence',   label: 'Evidence',       subLabel: `${caseItem.evidence.length} Items`,                 icon: '🗂',  category: 'evidence', angle: -30,  ring: 'inner' },
    { id: 'documents',  label: 'Documents',      subLabel: `${caseItem.evidence.filter(e => e.type === 'document' || e.type === 'screenshot').length} Files`, icon: '📄', category: 'evidence', angle: 30,  ring: 'inner' },
    { id: 'linked',     label: 'Linked Cases',   subLabel: `${caseItem.linkedCases.length} Cases`,             icon: '🔗', category: 'location', angle: 90,  ring: 'inner' },
    { id: 'financial',  label: 'Financial Trail',subLabel: `${caseItem.entities.filter(e => e.startsWith('acct')).length || 0} Accounts`, icon: '💳', category: 'assets', angle: 150, ring: 'inner' },
    { id: 'witnesses',  label: 'Witnesses',      subLabel: '2 Persons',                                        icon: '👥', category: 'people',   angle: 210, ring: 'inner' },

    { id: 'timeline',   label: 'Timeline',       subLabel: `${caseItem.timeline.length} Events`,               icon: '🕐', category: 'intel',    angle: -90,  ring: 'outer' },
    { id: 'analysis',   label: 'AI Analysis',    subLabel: 'Insights Ready',                                   icon: '🤖', category: 'intel',    angle: -45,  ring: 'outer' },
    { id: 'network',    label: 'Network Links',  subLabel: '18 Connections',                                   icon: '🕸', category: 'intel',    angle: 0,    ring: 'outer' },
    { id: 'vehicles',   label: 'Vehicles',       subLabel: `${caseItem.entities.filter(e => e.startsWith('veh')).length} Vehicles`, icon: '🚗', category: 'assets', angle: 45, ring: 'outer' },
    { id: 'calls',      label: 'Call Records',   subLabel: '158 Records',                                      icon: '📞', category: 'assets',   angle: 90,   ring: 'outer' },
    { id: 'crimescene', label: 'Crime Scene',    subLabel: caseItem.location.slice(0, 22),                    icon: '📍', category: 'location', angle: 135,  ring: 'outer' },
    { id: 'officer',    label: 'Inv. Officer',   subLabel: caseItem.investigatingOfficer,                     icon: '🎖', category: 'people',   angle: 180,  ring: 'outer' },
    { id: 'cctv',       label: 'CCTV Footage',   subLabel: `${caseItem.evidence.filter(e => e.type === 'cctv').length} Clips`, icon: '📹', category: 'evidence', angle: -135, ring: 'outer' },
  ];

  // ── Layout math ─────────────────────────────────────────────────────────────
  const safeM = 46;
  const maxR  = cW > 0 ? Math.max(0, cW / 2 - safeM) : 0;

  const iW  = Math.min(94, Math.max(70, maxR * 0.30));
  const iH  = iW * 0.82;
  const oW  = Math.min(88, Math.max(64, maxR * 0.26));
  const oH  = oW * 0.8;
  const cNW = Math.min(172, Math.max(140, maxR * 0.52));
  const cNH = cNW * 0.78;

  const halfDiag = (w: number, h: number) => Math.sqrt((w / 2) ** 2 + (h / 2) ** 2);
  const innerR   = halfDiag(cNW, cNH) + halfDiag(iW, iH) + RING_GAP;
  const outerR   = innerR + halfDiag(iW, iH) + halfDiag(oW, oH) + RING_GAP;

  const cx      = cW / 2;
  const cy      = TOP_PAD + outerR + oH / 2;
  const canvasH = cy + outerR + oH / 2 + BOTTOM_PAD;

  const getPos = (angle: number, ring: 'inner' | 'outer') => {
    const r   = ring === 'inner' ? innerR : outerR;
    const rad = (angle * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  };

  // ── Node interaction — toggle: open if closed, close if already open ──────
  const handleNodePress = (node: NodeDef) => {
    const sv = nodePress.current[node.id];
    Animated.sequence([
      Animated.timing(sv, { toValue: 0.88, duration: 70, useNativeDriver: true }),
      Animated.spring(sv, { toValue: 1, friction: 5, tension: 130, useNativeDriver: true }),
    ]).start();
    setOpenedNodes((prev) => {
      const next = new Map(prev);
      if (next.has(node.id)) {
        next.delete(node.id);
      } else {
        next.set(node.id, node);
      }
      return next;
    });
  };

  const closeNode = (nodeId: string) => {
    setOpenedNodes((prev) => {
      const next = new Map(prev);
      next.delete(nodeId);
      return next;
    });
  };

  // ── Pulse ───────────────────────────────────────────────────────────────────
  const pulseScale   = pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.15] });
  const pulseOpacity = pulseAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.08, 0.22, 0.08] });

  // ── SVG connections ─────────────────────────────────────────────────────────
  const renderConnections = () => {
    const isNodeOpen = (id: string) => openedNodes.has(id);
    if (cW === 0) return null;
    return nodeDefs.map((node) => {
      const pos      = getPos(node.angle, node.ring);
      const color    = CAT_COLOR[node.category];
      const isActive = hoveredNode === node.id || openedNodes.has(node.id);
      const dx = pos.x - cx; const dy = pos.y - cy;
      const bx = cx + dx * 0.5 + (-dy) * 0.12;
      const by = cy + dy * 0.5 + dx   * 0.12;
      return (
        <Path
          key={node.id}
          d={`M ${cx} ${cy} Q ${bx} ${by} ${pos.x} ${pos.y}`}
          stroke={color}
          strokeWidth={isActive ? 2 : 1}
          strokeDasharray={node.ring === 'outer' ? '5,9' : '4,7'}
          strokeOpacity={isActive ? 0.70 : 0.22}
          fill="none"
        />
      );
    });
  };

  // ── Satellite node card ─────────────────────────────────────────────────────
  const renderNode = (node: NodeDef) => {
    const pos        = getPos(node.angle, node.ring);
    const nW         = node.ring === 'inner' ? iW : oW;
    const nH         = node.ring === 'inner' ? iH : oH;
    const enter      = nodeEnter.current[node.id] ?? new Animated.Value(1);
    const sc         = nodePress.current[node.id]  ?? new Animated.Value(1);
    const tY         = enter.interpolate({ inputRange: [0, 1], outputRange: [12, 0] });
    const isHov      = hoveredNode === node.id;
    const isSelected = openedNodes.has(node.id);
    const accent     = CAT_COLOR[node.category];
    const tint       = CAT_TINT[node.category];

    return (
      <Animated.View
        key={node.id}
        style={[
          styles.nodeWrapper,
          { left: pos.x - nW / 2, top: pos.y - nH / 2, width: nW, height: nH,
            opacity: enter, transform: [{ translateY: tY }, { scale: sc }] },
        ]}
      >
        <Pressable
          onPress={() => handleNodePress(node)}
          onHoverIn={() => setHoveredNode(node.id)}
          onHoverOut={() => setHoveredNode(null)}
          style={[
            styles.nodeCard,
            {
              borderColor:     isSelected ? accent : isHov ? accent + 'BB' : Colors.line,
              backgroundColor: isSelected ? tint   : isHov ? tint          : Colors.card,
              shadowColor:     accent,
              shadowOpacity:   isSelected ? 0.30 : isHov ? 0.18 : 0.06,
              shadowRadius:    isSelected ? 14   : isHov ? 9    : 3,
              shadowOffset:    { width: 0, height: 2 },
              elevation:       isSelected ? 10   : isHov ? 6    : 2,
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel={`${node.label}: ${node.subLabel}`}
        >
          <View style={[styles.nodeAccentBar, { backgroundColor: accent }]} />
          <Text style={styles.nodeIcon}>{node.icon}</Text>
          <Text style={[styles.nodeLabel, { color: Colors.inkNavy }]} numberOfLines={1} adjustsFontSizeToFit>
            {node.label}
          </Text>
          <Text style={[styles.nodeSubLabel, { color: accent }]} numberOfLines={1}>
            {node.subLabel}
          </Text>
          {isSelected && <View style={[styles.selectedDot, { backgroundColor: accent }]} />}
        </Pressable>
      </Animated.View>
    );
  };

  // ── Center node ─────────────────────────────────────────────────────────────
  const renderCenterNode = () => {
    if (cW === 0) return null;
    return (
      <>
        <Animated.View
          style={[
            styles.pulseRing,
            { width: cNW + 28, height: cNH + 28, borderRadius: 14,
              left: cx - (cNW + 28) / 2, top: cy - (cNH + 28) / 2,
              borderColor: pc, transform: [{ scale: pulseScale }], opacity: pulseOpacity },
          ]}
        />
        <Animated.View
          style={[
            styles.centerWrapper,
            { left: cx - cNW / 2, top: cy - cNH / 2, width: cNW, height: cNH,
              transform: [{ scale: centerScale }] },
          ]}
        >
          <View style={[styles.centerCard, { borderColor: pc + 'BB' }]}>
            <View style={[styles.centerTopBar, { backgroundColor: pc }]}>
              <Text style={styles.centerTopBarLabel}>CASE MASTER ROOT</Text>
            </View>
            <View style={styles.centerBody}>
              <Text style={styles.centerIcon}>📂</Text>
              <Text style={styles.centerFir} numberOfLines={1}>{caseItem.firNumber}</Text>
              <Text style={styles.centerTitle} numberOfLines={2} adjustsFontSizeToFit>
                {caseItem.title}
              </Text>
              <View style={[styles.centerPill, { backgroundColor: pc + '14', borderColor: pc + '44' }]}>
                <View style={[styles.centerPillDot, { backgroundColor: pc }]} />
                <Text style={[styles.centerPillText, { color: pc }]}>
                  {caseItem.status.toUpperCase()}
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>
      </>
    );
  };

  // ── Popup body content (per-node) ────────────────────────────────────────────
  const getPopupBody = (node: NodeDef) => {
    const accent = CAT_COLOR[node.category];

    const KVRow = ({ label, value }: { label: string; value: string }) => (
      <View style={popupStyles.kvRow}>
        <Text style={popupStyles.kvLabel}>{label}</Text>
        <Text style={popupStyles.kvValue}>{value}</Text>
      </View>
    );

    const InsightBox = ({ title, text }: { title?: string; text: string }) => (
      <View style={[popupStyles.insightBox, { borderLeftColor: accent }]}>
        {title && <Text style={[popupStyles.insightTitle, { color: Colors.inkNavy }]}>{title}</Text>}
        <Text style={popupStyles.insightText}>{text}</Text>
      </View>
    );

    switch (node.id) {
      case 'suspects':
        const suspectNames = ['John Doe', 'Mike Johnson', 'Jane Smith'];
        return (
          <View>
            <Text style={popupStyles.sectionHead}>EXTRACTED ENTITIES</Text>
            {caseItem.entities.length === 0
              ? <Text style={popupStyles.emptyText}>No entities recorded.</Text>
              : caseItem.entities.map((e, i) => (
                  <View key={i} style={[popupStyles.chip, { borderColor: accent + '55', backgroundColor: accent + '12', marginBottom: 6 }]}>
                    <Text style={[popupStyles.chipText, { color: accent }]}>{e}</Text>
                  </View>
                ))}
            <Text style={[popupStyles.sectionHead, { marginTop: 15 }]}>SUSPECTS PROFILE FILES</Text>
            {suspectNames.map((name, i) => (
              <Pressable
                key={`sus-${i}`}
                style={popupStyles.listRow}
                onPress={() => {
                  setOpenedNodes(new Map());
                  navigation.navigate('PersonCrimeTracker' as any, { query: name });
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={popupStyles.listTitle}>{name}</Text>
                  <Text style={popupStyles.listSub}>Tap to view intelligence file</Text>
                </View>
                <Text style={[popupStyles.arrow, { color: accent }]}>›</Text>
              </Pressable>
            ))}
          </View>
        );

      case 'evidence':
        return (
          <View>
            <Text style={popupStyles.sectionHead}>EVIDENCE ITEMS ({caseItem.evidence.length})</Text>
            {caseItem.evidence.length === 0
              ? <Text style={popupStyles.emptyText}>No evidence recorded yet.</Text>
              : caseItem.evidence.map((ev) => (
                  <Pressable
                    key={ev.id}
                    style={popupStyles.listRow}
                    onPress={() => { setOpenedNodes(new Map()); navigation.navigate('EvidenceViewer', { caseId, evidenceId: ev.id }); }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={popupStyles.listTitle}>{ev.title}</Text>
                      <Text style={popupStyles.listSub}>{ev.description}</Text>
                    </View>
                    <Text style={[popupStyles.arrow, { color: accent }]}>›</Text>
                  </Pressable>
                ))}
          </View>
        );

      case 'documents':
        return (
          <View>
            <Text style={popupStyles.sectionHead}>CASE DOCUMENTS</Text>
            {caseItem.evidence.filter(e => e.type === 'document' || e.type === 'screenshot' || e.type === 'sketch').map((ev) => (
              <Pressable
                key={ev.id}
                style={popupStyles.listRow}
                onPress={() => { setOpenedNodes(new Map()); navigation.navigate('EvidenceViewer', { caseId, evidenceId: ev.id }); }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={popupStyles.listTitle}>{ev.title}</Text>
                  <Text style={popupStyles.listSub}>{ev.date}</Text>
                </View>
                <Text style={[popupStyles.arrow, { color: accent }]}>›</Text>
              </Pressable>
            ))}
            {caseItem.evidence.filter(e => e.type === 'document' || e.type === 'screenshot').length === 0 && (
              <Text style={popupStyles.emptyText}>No documents on file.</Text>
            )}
          </View>
        );

      case 'linked':
        return (
          <View>
            <Text style={popupStyles.sectionHead}>LINKED CASES ({caseItem.linkedCases.length})</Text>
            {caseItem.linkedCases.length === 0
              ? <Text style={popupStyles.emptyText}>No linked cases found.</Text>
              : caseItem.linkedCases.map((id) => (
                  <Pressable
                    key={id}
                    style={popupStyles.listRow}
                    onPress={() => { setOpenedNodes(new Map()); navigation.push('CaseDetail', { caseId: id }); }}
                  >
                    <Text style={[popupStyles.listTitle, { color: accent }]}>→ {id}</Text>
                    <Text style={[popupStyles.arrow, { color: accent }]}>›</Text>
                  </Pressable>
                ))}
          </View>
        );

      case 'financial':
        return (
          <View>
            <Text style={popupStyles.sectionHead}>FINANCIAL TRAIL</Text>
            {caseItem.entities.filter(e => e.startsWith('acct') || e.startsWith('app')).map((e, i) => (
              <KVRow key={i} label={`Entity ${i + 1}`} value={e} />
            ))}
            {caseItem.entities.filter(e => e.startsWith('acct') || e.startsWith('app')).length === 0 && (
              <Text style={popupStyles.emptyText}>No financial trail identified.</Text>
            )}
            <InsightBox text="Bank account trace may be pending. Check entity connections for financial linkages." />
          </View>
        );

      case 'witnesses':
        return (
          <View>
            <Text style={popupStyles.sectionHead}>WITNESS SUMMARY</Text>
            <KVRow label="Recorded" value="2 Persons" />
            {caseItem.entities.filter(e => e.includes('witness')).map((e, i) => (
              <KVRow key={i} label={`Witness ${i + 1}`} value={e} />
            ))}
            <InsightBox text="Witness statements have been recorded. Cross-verify with CCTV timestamps." />
          </View>
        );

      case 'timeline':
        return (
          <View>
            <Text style={popupStyles.sectionHead}>TIMELINE ({caseItem.timeline.length} EVENTS)</Text>
            {caseItem.timeline.map((entry, i) => (
              <View key={entry.id} style={popupStyles.timelineRow}>
                <View style={[popupStyles.tlDot, i === 0 && { backgroundColor: pc }]} />
                <View style={{ flex: 1 }}>
                  <Text style={popupStyles.tlDate}>{entry.date} · {entry.time}</Text>
                  <Text style={popupStyles.tlEvent}>{entry.event}</Text>
                  <Text style={popupStyles.tlOfficer}>{entry.officer}</Text>
                </View>
              </View>
            ))}
          </View>
        );

      case 'analysis':
        return (
          <View>
            <Text style={popupStyles.sectionHead}>AI ANALYSIS</Text>
            {[
              { title: 'Pattern Match', text: `MO matches ${caseItem.linkedCases.length + 1} cases in the same sector over 30 days. Same time-of-day pattern detected.` },
              { title: 'Entity Extraction', text: `${caseItem.entities.length} entities identified from FIR and statements.` },
              { title: 'Risk Assessment', text: `Case flagged as ${caseItem.priority === 'urgent' ? 'HIGH' : caseItem.priority === 'review' ? 'MEDIUM' : 'LOW'} risk. Escalation recommended if new FIRs are filed in Sector ${caseItem.sector}.` },
            ].map((item) => (
              <InsightBox key={item.title} title={item.title} text={item.text} />
            ))}
          </View>
        );

      case 'network':
        return (
          <View>
            <Text style={popupStyles.sectionHead}>NETWORK LINKS</Text>
            <KVRow label="Total Connections" value="18" />
            <KVRow label="Suspects linked" value={String(caseItem.entities.length)} />
            <KVRow label="Related FIRs" value={String(caseItem.linkedCases.length + 1)} />
            <InsightBox text="Full network graph available in the Network Links module. Associate map shows 18 direct connections." />
          </View>
        );

      case 'vehicles':
        return (
          <View>
            <Text style={popupStyles.sectionHead}>VEHICLES</Text>
            {caseItem.entities.filter(e => e.startsWith('veh')).map((e, i) => (
              <KVRow key={i} label={`Vehicle ${i + 1}`} value={e.replace('veh: ', '')} />
            ))}
            {caseItem.entities.filter(e => e.startsWith('veh')).length === 0 && (
              <Text style={popupStyles.emptyText}>No vehicles registered.</Text>
            )}
          </View>
        );

      case 'calls':
        return (
          <View>
            <Text style={popupStyles.sectionHead}>CALL RECORDS</Text>
            <KVRow label="Total Records" value="158" />
            <KVRow label="Period" value="Last 30 days" />
            <InsightBox text="Call data analysis pending. Request CDR from telecom provider for flagged numbers." />
          </View>
        );

      case 'crimescene':
        return (
          <View>
            <Text style={popupStyles.sectionHead}>CRIME SCENE</Text>
            <KVRow label="Location" value={caseItem.location} />
            <KVRow label="Sector" value={caseItem.sector} />
            {caseItem.latitude !== undefined && (
              <>
                <KVRow label="Latitude"  value={caseItem.latitude.toFixed(5)} />
                <KVRow label="Longitude" value={caseItem.longitude?.toFixed(5) ?? 'N/A'} />
              </>
            )}
          </View>
        );

      case 'officer':
        return (
          <View>
            <Text style={popupStyles.sectionHead}>INVESTIGATION DETAILS</Text>
            <View style={[popupStyles.officerCard, { borderLeftColor: accent }]}>
              <Text style={popupStyles.officerName}>{caseItem.investigatingOfficer}</Text>
              <Text style={popupStyles.officerRole}>Investigating Officer</Text>
            </View>
            {[
              ['FIR Number',  caseItem.firNumber],
              ['Filed',       caseItem.filedDate],
              ['Complainant', caseItem.complainant],
              ['Status',      caseItem.status.toUpperCase()],
              ['Category',    caseItem.category],
              ['Sector',      caseItem.sector],
            ].map(([k, v]) => <KVRow key={k} label={k} value={v} />)}
          </View>
        );

      case 'cctv':
        return (
          <View>
            <Text style={popupStyles.sectionHead}>CCTV FOOTAGE</Text>
            {caseItem.evidence.filter(e => e.type === 'cctv').map((ev) => (
              <Pressable
                key={ev.id}
                style={popupStyles.listRow}
                onPress={() => { setOpenedNodes(new Map()); navigation.navigate('EvidenceViewer', { caseId, evidenceId: ev.id }); }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={popupStyles.listTitle}>{ev.title}</Text>
                  <Text style={popupStyles.listSub}>{ev.description}</Text>
                </View>
                <Text style={[popupStyles.arrow, { color: accent }]}>›</Text>
              </Pressable>
            ))}
            {caseItem.evidence.filter(e => e.type === 'cctv').length === 0 && (
              <Text style={popupStyles.emptyText}>No CCTV footage on file.</Text>
            )}
          </View>
        );

      default:
        return (
          <View>
            <Text style={popupStyles.sectionHead}>{node.label.toUpperCase()}</Text>
            <Text style={popupStyles.emptyText}>{node.subLabel}</Text>
          </View>
        );
    }
  };

  // ── Status color helper ─────────────────────────────────────────────────────
  const statusColor =
    caseItem.status === 'open'    ? Colors.green  :
    caseItem.status === 'closed'  ? Colors.red    :
    Colors.amber;

  // ── Main render ─────────────────────────────────────────────────────────────
  return (
    <Animated.View style={[styles.screen, { paddingTop: insets.top, opacity: globalFade }]}>

      {/* ── Header bar ──────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
          <Text style={styles.backLabel}>Cases</Text>
        </Pressable>
        <View style={styles.headerMid}>
          <Text style={styles.headerFir}>{caseItem.firNumber}</Text>
          <Text style={styles.headerTitle} numberOfLines={1}>{caseItem.title}</Text>
        </View>
        <View style={styles.headerRight}>
          <View style={[styles.headerPriorityPill, { borderColor: pc, backgroundColor: pc + '15' }]}>
            <View style={[styles.headerPriorityDot, { backgroundColor: pc }]} />
            <Text style={[styles.headerPriorityText, { color: pc }]}>{PRIORITY_LABELS[caseItem.priority]}</Text>
          </View>
          <Pressable
            onPress={() => navigation.navigate('ReportPreview', { caseId })}
            style={styles.reportBtn}
          >
            <Text style={styles.reportBtnText}>Report ›</Text>
          </Pressable>
        </View>
      </View>

      {/* ── Body: two-column layout ──────────────────────────────────────── */}
      <View style={styles.body}>

        {/* ── LEFT PANEL: Case Metadata + Description ──────────────────── */}
        <ScrollView style={styles.leftPanel} showsVerticalScrollIndicator={false}>

          {/* Case Metadata Card */}
          <View style={styles.metaCard}>
            <View style={styles.metaCardHeader}>
              <View style={styles.metaCardHeaderIcon}>
                <Text style={{ fontSize: 16 }}>📋</Text>
              </View>
              <Text style={styles.metaCardTitle}>Case Metadata</Text>
            </View>
            <View style={styles.metaDivider} />

            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>FIR Number</Text>
              <Text style={styles.metaValue}>{caseItem.firNumber}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Filed</Text>
              <Text style={styles.metaValue}>{caseItem.filedDate}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Handled By</Text>
              <Text style={styles.metaValue}>{caseItem.investigatingOfficer}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Sector</Text>
              <Text style={styles.metaValue}>{caseItem.sector}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Category</Text>
              <Text style={styles.metaValue}>{caseItem.category}</Text>
            </View>
            <View style={[styles.metaRow, { borderBottomWidth: 0 }]}>
              <Text style={styles.metaLabel}>Status</Text>
              <View style={[styles.statusBadge, { backgroundColor: statusColor + '18', borderColor: statusColor + '44' }]}>
                <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                <Text style={[styles.statusText, { color: statusColor }]}>
                  {caseItem.status.toUpperCase()}
                </Text>
              </View>
            </View>
          </View>

          {/* Case Description Card */}
          <View style={styles.descCard}>
            <View style={styles.metaCardHeader}>
              <View style={styles.metaCardHeaderIcon}>
                <Text style={{ fontSize: 16 }}>📝</Text>
              </View>
              <Text style={styles.metaCardTitle}>Case Description</Text>
            </View>
            <View style={styles.metaDivider} />
            <Text style={styles.descText}>
              {caseItem.description || 'No description provided for this case.'}
            </Text>

            {/* Complainant row */}
            <View style={[styles.descInfoRow, { marginTop: 14 }]}>
              <Text style={styles.descInfoLabel}>Complainant</Text>
              <Text style={styles.descInfoValue}>{caseItem.complainant}</Text>
            </View>
            <View style={styles.descInfoRow}>
              <Text style={styles.descInfoLabel}>Location</Text>
              <Text style={styles.descInfoValue} numberOfLines={2}>{caseItem.location}</Text>
            </View>

            {/* Synopsis badge */}
            <View style={[styles.synopsisBadge, { borderColor: pc + '44', backgroundColor: pc + '0A' }]}>
              <Text style={styles.synopsisBadgeLabel}>INTELLIGENCE SYNOPSIS</Text>
              <Text style={styles.synopsisBadgeText}>
                {caseItem.description || 'No intelligence synopsis available.'}
              </Text>
            </View>
          </View>

          <View style={{ height: 24 }} />
        </ScrollView>

        {/* ── RIGHT PANEL: Network Graph ───────────────────────────────── */}
        <View
          style={styles.graphContainer}
          onLayout={(e: LayoutChangeEvent) => {
            setCW(e.nativeEvent.layout.width);
            setContainerH(e.nativeEvent.layout.height);
          }}
        >
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ width: cW || '100%', minHeight: canvasH }}
            showsVerticalScrollIndicator
            bounces
          >
            <View style={{ width: cW, height: canvasH }}>
              {cW > 0 && (
                <Svg
                  width={cW}
                  height={canvasH}
                  style={StyleSheet.absoluteFill}
                  pointerEvents="none"
                >
                  <Defs>
                    <SvgRadialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
                      <Stop offset="0%"   stopColor={pc} stopOpacity="0.18" />
                      <Stop offset="100%" stopColor={pc} stopOpacity="0" />
                    </SvgRadialGradient>
                  </Defs>
                  <Circle cx={cx} cy={cy} r={cNW * 0.95} fill="url(#centerGlow)" />
                  {renderConnections()}
                  <Circle cx={cx} cy={cy} r={innerR} stroke={Colors.line} strokeWidth="0.5" strokeDasharray="2,6" fill="none" opacity={0.35} />
                  <Circle cx={cx} cy={cy} r={outerR} stroke={Colors.line} strokeWidth="0.5" strokeDasharray="2,10" fill="none" opacity={0.20} />
                  {nodeDefs.filter(n => n.ring === 'inner').map(n => {
                    const p = getPos(n.angle, n.ring);
                    return <Circle key={`dot-${n.id}`} cx={p.x} cy={p.y} r={3} fill={CAT_COLOR[n.category]} opacity={0.42} />;
                  })}
                </Svg>
              )}

              {cW > 0 && nodeDefs.map(renderNode)}
              {renderCenterNode()}
            </View>
          </ScrollView>

          {/* ── Hint text when no nodes are open */}
          {openedNodes.size === 0 && (
            <View style={styles.hintOverlay}>
              <Text style={styles.hintText}>👆 Tap any node to inspect details</Text>
            </View>
          )}

          {/* ── Draggable Popups — one per opened node, staggered so they don't overlap */}
          {containerH > 0 && Array.from(openedNodes.values()).map((node, idx) => (
            <DraggablePopup
              key={node.id}
              node={node}
              onClose={() => closeNode(node.id)}
              containerW={cW}
              containerH={containerH}
              accentColor={CAT_COLOR[node.category]}
              tintColor={CAT_TINT[node.category]}
              offsetIndex={idx}
            >
              {getPopupBody(node)}
            </DraggablePopup>
          ))}
        </View>
      </View>
    </Animated.View>
  );
};

// ─── Popup Styles ─────────────────────────────────────────────────────────────
const popupStyles = StyleSheet.create({
  popup: {
    position: 'absolute',
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1.5,
    shadowColor: Colors.inkNavy,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 24,
    elevation: 20,
    overflow: 'hidden',
    zIndex: 100,
  },
  titleBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    cursor: 'grab' as any,
  },
  titleBarLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  titleBarIcon: { fontSize: 20 },
  titleBarLabel: { fontFamily: FontFamily.display, fontSize: FontSize.lg, color: Colors.white, fontWeight: '600' },
  titleBarSub: { fontFamily: FontFamily.mono, fontSize: FontSize.xs, color: 'rgba(255,255,255,0.75)', marginTop: 1 },
  titleBarRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  catBadge: { borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2 },
  catBadgeText: { fontFamily: FontFamily.mono, fontSize: FontSize.xs, color: Colors.white, letterSpacing: 0.6 },
  closeBtn: { width: 26, height: 26, alignItems: 'center', justifyContent: 'center', borderRadius: 13, backgroundColor: 'rgba(255,255,255,0.2)' },
  closeBtnText: { fontFamily: FontFamily.bodyMedium, fontSize: 13, color: Colors.white },
  accentDivider: { height: 2.5, opacity: 0.6 },
  body: { flex: 1 },
  bodyContent: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 8 },

  resizeHandle: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopLeftRadius: 6,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    backgroundColor: Colors.paperDim,
    cursor: 'se-resize' as any,
  },
  resizeIcon: { fontSize: 11, fontWeight: '700' },
  dragHint: { position: 'absolute', bottom: 6, left: '50%', flexDirection: 'row', gap: 3, transform: [{ translateX: -18 }] },
  dragDot: { width: 4, height: 4, borderRadius: 2 },

  sectionHead: { fontFamily: FontFamily.mono, fontSize: FontSize.xs, letterSpacing: 1.3, color: Colors.gray, marginBottom: 12, textTransform: 'uppercase' },
  emptyText: { fontFamily: FontFamily.body, fontSize: FontSize.md, color: Colors.gray, fontStyle: 'italic', marginBottom: 8 },
  kvRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.line, gap: 8 },
  kvLabel: { fontFamily: FontFamily.bodyMedium, fontSize: FontSize.base, color: Colors.gray, flex: 0.45 },
  kvValue: { fontFamily: FontFamily.body, fontSize: FontSize.base, color: Colors.inkNavy, flex: 0.55, textAlign: 'right' },
  insightBox: { backgroundColor: Colors.paperDim, borderRadius: 8, borderWidth: 1, borderColor: Colors.line, borderLeftWidth: 3, padding: 10, marginVertical: 8 },
  insightTitle: { fontFamily: FontFamily.bodySemiBold, fontSize: FontSize.md, marginBottom: 4 },
  insightText: { fontFamily: FontFamily.body, fontSize: FontSize.md, color: Colors.gray, lineHeight: 19 },
  listRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.line, gap: 8 },
  listTitle: { fontFamily: FontFamily.bodySemiBold, fontSize: FontSize.md, color: Colors.inkNavy },
  listSub: { fontFamily: FontFamily.body, fontSize: FontSize.base, color: Colors.gray, marginTop: 2 },
  arrow: { fontFamily: FontFamily.bodyMedium, fontSize: 20, lineHeight: 24 },
  chip: { borderWidth: 1, borderRadius: 20, alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, marginBottom: 6 },
  chipText: { fontFamily: FontFamily.mono, fontSize: FontSize.xs },
  timelineRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  tlDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.steelLight, marginTop: 4 },
  tlDate: { fontFamily: FontFamily.mono, fontSize: FontSize.xs, color: Colors.gray },
  tlEvent: { fontFamily: FontFamily.bodySemiBold, fontSize: FontSize.md, color: Colors.inkNavy, marginTop: 2 },
  tlOfficer: { fontFamily: FontFamily.body, fontSize: FontSize.base, color: Colors.gray, marginTop: 2 },
  officerCard: { backgroundColor: Colors.paperDim, borderRadius: 8, borderWidth: 1, borderColor: Colors.line, borderLeftWidth: 4, padding: 12, marginBottom: 14 },
  officerName: { fontFamily: FontFamily.display, fontSize: FontSize['2xl'], color: Colors.inkNavy, fontWeight: '600' },
  officerRole: { fontFamily: FontFamily.mono, fontSize: FontSize.xs, color: Colors.gray, marginTop: 3, letterSpacing: 0.5 },
});

// ─── Screen Styles ────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.paper },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
    zIndex: 30,
  },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  backArrow: { fontFamily: FontFamily.bodyMedium, fontSize: FontSize.lg, color: Colors.inkNavy },
  backLabel: { fontFamily: FontFamily.bodyMedium, fontSize: FontSize.md, color: Colors.inkNavy },
  headerMid: { flex: 1 },
  headerFir: { fontFamily: FontFamily.mono, fontSize: FontSize.xs, color: Colors.gray, letterSpacing: 0.6 },
  headerTitle: { fontFamily: FontFamily.display, fontSize: FontSize.md, color: Colors.inkNavy, fontWeight: '600', marginTop: 1 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerPriorityPill: { flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: 1, borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
  headerPriorityDot: { width: 5, height: 5, borderRadius: 3 },
  headerPriorityText: { fontFamily: FontFamily.mono, fontSize: FontSize.xs, letterSpacing: 0.7 },
  reportBtn: { backgroundColor: Colors.inkNavy, paddingHorizontal: 11, paddingVertical: 6, borderRadius: 6 },
  reportBtnText: { fontFamily: FontFamily.bodyMedium, fontSize: FontSize.sm, color: Colors.white },

  // Two-column body
  body: { flex: 1, flexDirection: 'row' },

  // Left panel — 50% split
  leftPanel: {
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: Colors.line,
    backgroundColor: Colors.paper,
    paddingHorizontal: 14,
    paddingTop: 14,
  },

  // Metadata card
  metaCard: {
    backgroundColor: Colors.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.line,
    marginBottom: 12,
    overflow: 'hidden',
  },
  metaCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  metaCardHeaderIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: Colors.inkNavy + '12',
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaCardTitle: {
    fontFamily: FontFamily.display,
    fontSize: FontSize.lg,
    color: Colors.inkNavy,
    fontWeight: '600',
  },
  metaDivider: {
    height: 1,
    backgroundColor: Colors.line,
    marginHorizontal: 0,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
  },
  metaLabel: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.base,
    color: Colors.gray,
    flex: 1,
  },
  metaValue: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.base,
    color: Colors.inkNavy,
    flex: 1.2,
    textAlign: 'right',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statusDot: { width: 5, height: 5, borderRadius: 3 },
  statusText: { fontFamily: FontFamily.mono, fontSize: FontSize.xs, letterSpacing: 0.6 },

  // Description card
  descCard: {
    backgroundColor: Colors.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.line,
    marginBottom: 12,
    overflow: 'hidden',
  },
  descText: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.md,
    color: Colors.inkNavy,
    lineHeight: 20,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  descInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingBottom: 8,
    gap: 8,
  },
  descInfoLabel: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.base,
    color: Colors.gray,
    flex: 0.4,
  },
  descInfoValue: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.base,
    color: Colors.inkNavy,
    flex: 0.6,
    textAlign: 'right',
  },
  synopsisBadge: {
    margin: 14,
    marginTop: 8,
    borderRadius: 8,
    borderWidth: 1,
    padding: 10,
  },
  synopsisBadgeLabel: {
    fontFamily: FontFamily.mono,
    fontSize: FontSize.xs,
    letterSpacing: 1.1,
    color: Colors.inkNavy,
    fontWeight: '700',
    marginBottom: 4,
  },
  synopsisBadgeText: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.base,
    color: Colors.gray,
    lineHeight: 17,
  },

  // Legend card
  legendCard: {
    backgroundColor: Colors.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.line,
    padding: 14,
    gap: 8,
    marginBottom: 12,
  },
  legendCardTitle: {
    fontFamily: FontFamily.mono,
    fontSize: FontSize.xs,
    letterSpacing: 1.2,
    color: Colors.gray,
    marginBottom: 4,
  },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontFamily: FontFamily.body, fontSize: FontSize.md, color: Colors.inkNavy },

  // Graph container
  graphContainer: {
    flex: 1,
    position: 'relative',
    backgroundColor: Colors.paper,
    overflow: 'hidden',
  },

  // Synopsis HUD on top of graph
  synopsisHUD: {
    position: 'absolute',
    top: 14,
    left: 14,
    right: 14,
    flexDirection: 'row',
    backgroundColor: Colors.card + 'FA',
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: 10,
    padding: 12,
    zIndex: 10,
    shadowColor: Colors.inkNavy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
    pointerEvents: 'none' as any,
  },
  synopsisHUDLeft: { flex: 1.6, paddingRight: 12, justifyContent: 'center' },
  synopsisHUDBadge: {
    backgroundColor: Colors.inkNavy + '12',
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
  },
  synopsisHUDBadgeText: { fontFamily: FontFamily.mono, fontSize: 8.5, letterSpacing: 1.1, color: Colors.inkNavy, fontWeight: '700' },
  synopsisHUDText: { fontFamily: FontFamily.body, fontSize: FontSize.xs, color: Colors.inkNavy, lineHeight: 16 },
  synopsisHUDDivider: { width: 1, backgroundColor: Colors.line, marginVertical: 2 },
  synopsisHUDRight: { flex: 0.8, paddingLeft: 12, justifyContent: 'center', gap: 4 },
  synopsisHUDMetaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  synopsisHUDMetaLabel: { fontFamily: FontFamily.mono, fontSize: 9, color: Colors.gray, fontWeight: '600' },
  synopsisHUDMetaVal: { fontFamily: FontFamily.bodySemiBold, fontSize: 10, color: Colors.inkNavy },

  // Hint overlay
  hintOverlay: {
    position: 'absolute',
    bottom: 16,
    alignSelf: 'center',
    left: 0,
    right: 0,
    alignItems: 'center',
    pointerEvents: 'none' as any,
    zIndex: 5,
  },
  hintText: {
    fontFamily: FontFamily.mono,
    fontSize: FontSize.xs,
    color: Colors.gray,
    backgroundColor: Colors.card + 'D0',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.line,
    overflow: 'hidden',
  },

  // Graph node styles (unchanged)
  nodeWrapper: { position: 'absolute' },
  nodeCard: {
    flex: 1, borderWidth: 1, borderRadius: 9, overflow: 'hidden',
    alignItems: 'center', justifyContent: 'center',
    paddingTop: 6, paddingBottom: 5, paddingHorizontal: 4,
    backgroundColor: Colors.card,
  },
  nodeAccentBar: { position: 'absolute', top: 0, left: 0, right: 0, height: 2.5, borderTopLeftRadius: 9, borderTopRightRadius: 9 },
  nodeIcon: { fontSize: 13, marginBottom: 2 },
  nodeLabel: { fontFamily: FontFamily.bodyMedium, fontSize: 9.5, textAlign: 'center', lineHeight: 13 },
  nodeSubLabel: { fontFamily: FontFamily.mono, fontSize: 8.5, textAlign: 'center', marginTop: 1.5 },
  selectedDot: { position: 'absolute', bottom: 4, width: 5, height: 5, borderRadius: 3 },

  // Center node
  centerWrapper: { position: 'absolute' },
  centerCard: {
    flex: 1, borderWidth: 2, borderRadius: 12, overflow: 'hidden',
    backgroundColor: Colors.card,
    shadowColor: Colors.inkNavy, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16, shadowRadius: 18, elevation: 12,
  },
  centerTopBar: { paddingVertical: 6, alignItems: 'center', justifyContent: 'center' },
  centerTopBarLabel: { fontFamily: FontFamily.mono, fontSize: 9, letterSpacing: 1.8, color: Colors.white, fontWeight: '700' },
  centerBody: { flex: 1, alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 10 },
  centerIcon: { fontSize: 22, marginBottom: 2 },
  centerFir: { fontFamily: FontFamily.mono, fontSize: 9, color: Colors.gray, letterSpacing: 0.5 },
  centerTitle: { fontFamily: FontFamily.bodySemiBold, fontSize: 11.5, color: Colors.inkNavy, textAlign: 'center', lineHeight: 15, marginVertical: 4, flex: 1 },
  centerPill: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 20, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 3, marginTop: 2 },
  centerPillDot: { width: 4, height: 4, borderRadius: 2 },
  centerPillText: { fontFamily: FontFamily.mono, fontSize: 8, letterSpacing: 0.8, fontWeight: '600' },
  pulseRing: { position: 'absolute', borderWidth: 1.5 },
});