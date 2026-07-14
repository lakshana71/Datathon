// CrimeSphere AI — CaseDetailScreen (Investigation Workspace)
import React, { useRef, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, Pressable, Animated,
  ScrollView, LayoutChangeEvent,
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
  angle: number;   // degrees: -90 = top, 0 = right, 90 = bottom, 180 = left
  ring: 'inner' | 'outer';
}

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

// Category → stroke / accent colors (all from existing CrimeSphere palette)
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

// Fixed node IDs for stable animation ref init
const ALL_NODE_IDS = [
  'suspects','evidence','documents','linked','financial','witnesses',   // inner
  'timeline','analysis','network','vehicles','calls','crimescene','officer','cctv', // outer
];

const PANEL_W = 308;

// Fixed vertical breathing room reserved above/below the ring diagram so the
// synopsis HUD (top) and legend HUD (bottom) never sit on top of a node.
// IMPORTANT: the synopsis/legend HUDs are position:absolute overlays drawn on
// top of the ScrollView, not inside its scrollable content — so at scroll
// position 0 the first ring node must clear the HUD's actual rendered
// height, not just an arbitrary small gap, or it renders hidden underneath.
// Synopsis HUD: top offset 14 + ~12 padding + 2-line description + sector
// row ≈ 95-100px tall → TOP_PAD gives it just enough clearance.
// Legend HUD: bottom offset 14 + padding + 5 category rows ≈ 90-95px tall.
const TOP_PAD    = 108;
const BOTTOM_PAD = 96;
// Minimum gap enforced between the center card, inner ring, and outer ring
// so bigger center-card content can never get hidden behind satellite nodes.
const RING_GAP = 8;

// ─── Component ────────────────────────────────────────────────────────────────
export const CaseDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { caseId } = route.params;
  const getCaseById = useCaseStore((s) => s.getCaseById);
  const caseItem = getCaseById(caseId);
  const insets = useSafeAreaInsets();

  // Only the canvas WIDTH is measured from layout. Height is derived from the
  // diagram's own content (ring radius + node sizes) so nodes are never
  // clipped — instead the diagram scrolls if it's taller than the screen.
  const [cW, setCW] = useState(0);

  // Interaction state
  const [selectedNode, setSelectedNode] = useState<NodeDef | null>(null);
  const [panelVisible, setPanelVisible] = useState(false);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // ── Animation refs ─────────────────────────────────────────────────────────
  const globalFade  = useRef(new Animated.Value(0)).current;
  const centerScale = useRef(new Animated.Value(0.72)).current;
  const pulseAnim   = useRef(new Animated.Value(0)).current;
  const panelAnim   = useRef(new Animated.Value(PANEL_W)).current;

  // Per-node entrance + press scale (stable across renders)
  const nodeEnter = useRef<Record<string, Animated.Value>>({});
  const nodePress = useRef<Record<string, Animated.Value>>({});

  // Initialise per-node anim values (before conditional returns)
  ALL_NODE_IDS.forEach((id) => {
    if (!nodeEnter.current[id]) nodeEnter.current[id] = new Animated.Value(0);
    if (!nodePress.current[id])  nodePress.current[id]  = new Animated.Value(1);
  });

  useEffect(() => {
    // Global fade-in + center spring
    Animated.timing(globalFade,  { toValue: 1, duration: 480, useNativeDriver: true }).start();
    Animated.spring(centerScale, { toValue: 1, friction: 6, tension: 80, useNativeDriver: true }).start();

    // Pulse loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 2200, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0, duration: 2200, useNativeDriver: true }),
      ])
    ).start();

    // Staggered node entrance
    ALL_NODE_IDS.forEach((id, i) => {
      Animated.sequence([
        Animated.delay(280 + i * 55),
        Animated.spring(nodeEnter.current[id], { toValue: 1, friction: 7, tension: 85, useNativeDriver: true }),
      ]).start();
    });
  }, []);

  // ── Empty guard ───────────────────────────────────────────────────────────
  if (!caseItem) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <EmptyState icon="📂" title="Case not found" subtitle={`No case with ID ${caseId}`} />
      </View>
    );
  }

  const pc = PRIORITY_COLORS[caseItem.priority];

  // ── Node definitions (dynamic counts from real case data) ─────────────────
  const nodeDefs: NodeDef[] = [
    // ── Inner ring: 6 nodes, 60° apart from -90° (top)
    { id: 'suspects',  label: 'Suspects',       subLabel: `${Math.max(1, caseItem.entities.length)} Persons`, icon: '👤', category: 'people',   angle: -90,  ring: 'inner' },
    { id: 'evidence',  label: 'Evidence',        subLabel: `${caseItem.evidence.length} Items`,                icon: '🗂',  category: 'evidence', angle: -30,  ring: 'inner' },
    { id: 'documents', label: 'Documents',        subLabel: `${caseItem.evidence.filter(e => e.type === 'document' || e.type === 'screenshot').length} Files`, icon: '📄', category: 'evidence', angle: 30, ring: 'inner' },
    { id: 'linked',    label: 'Linked Cases',     subLabel: `${caseItem.linkedCases.length} Cases`,            icon: '🔗', category: 'location', angle: 90,  ring: 'inner' },
    { id: 'financial', label: 'Financial Trail',  subLabel: `${caseItem.entities.filter(e => e.startsWith('acct')).length || 0} Accounts`, icon: '💳', category: 'assets', angle: 150, ring: 'inner' },
    { id: 'witnesses', label: 'Witnesses',         subLabel: '2 Persons',                                      icon: '👥', category: 'people',   angle: 210, ring: 'inner' },

    // ── Outer ring: 8 nodes, 45° apart from -90° (top)
    { id: 'timeline',   label: 'Timeline',       subLabel: `${caseItem.timeline.length} Events`,               icon: '🕐', category: 'intel',    angle: -90,  ring: 'outer' },
    { id: 'analysis',   label: 'AI Analysis',    subLabel: 'Insights Ready',                                   icon: '🤖', category: 'intel',    angle: -45,  ring: 'outer' },
    { id: 'network',    label: 'Network Links',  subLabel: '18 Connections',                                   icon: '🕸', category: 'intel',    angle: 0,    ring: 'outer' },
    { id: 'vehicles',   label: 'Vehicles',       subLabel: `${caseItem.entities.filter(e => e.startsWith('veh')).length} Vehicles`, icon: '🚗', category: 'assets', angle: 45, ring: 'outer' },
    { id: 'calls',      label: 'Call Records',   subLabel: '158 Records',                                      icon: '📞', category: 'assets',   angle: 90,   ring: 'outer' },
    { id: 'crimescene', label: 'Crime Scene',    subLabel: caseItem.location.slice(0, 22),                     icon: '📍', category: 'location', angle: 135,  ring: 'outer' },
    { id: 'officer',    label: 'Inv. Officer',   subLabel: caseItem.investigatingOfficer,                      icon: '🎖', category: 'people',   angle: 180,  ring: 'outer' },
    { id: 'cctv',       label: 'CCTV Footage',   subLabel: `${caseItem.evidence.filter(e => e.type === 'cctv').length} Clips`, icon: '📹', category: 'evidence', angle: -135, ring: 'outer' },
  ];

  // ── Layout math ─────────────────────────────────────────────────────────
  // Node/card sizes are derived from width only (no longer capped by screen
  // height), so they stay consistent regardless of how tall the diagram ends
  // up being.
  const safeM = 46;
  const maxR  = cW > 0 ? Math.max(0, cW / 2 - safeM) : 0;

  const iW  = Math.min(94, Math.max(70, maxR * 0.30));
  const iH  = iW * 0.82;
  const oW  = Math.min(88, Math.max(64, maxR * 0.26));
  const oH  = oW * 0.8;
  const cNW = Math.min(172, Math.max(140, maxR * 0.52));
  const cNH = cNW * 0.78;

  // Half-diagonals — the true "radius" a rectangular card occupies at any angle.
  const halfDiag = (w: number, h: number) => Math.sqrt((w / 2) ** 2 + (h / 2) ** 2);
  const centerHalfDiag = halfDiag(cNW, cNH);
  const innerHalfDiag  = halfDiag(iW, iH);
  const outerHalfDiag  = halfDiag(oW, oH);

  // Ring radius is driven purely by the actual card sizes plus RING_GAP —
  // no maxR-based floor. A floor like `maxR * 0.46` would win out over the
  // tight sum on wider screens and silently reintroduce a big gap no matter
  // how small RING_GAP is set, which is what was happening before.
  const innerR = centerHalfDiag + innerHalfDiag + RING_GAP;
  const outerR = innerR + innerHalfDiag + outerHalfDiag + RING_GAP;

  const cx = cW / 2;
  // FIX: cy (and overall canvas height) are now derived from the diagram's
  // own content instead of the visible screen height, so the topmost node
  // (Timeline) and bottommost node (Call Records) always have room and are
  // never clipped — the canvas simply becomes taller and scrolls instead.
  const cy = TOP_PAD + outerR + oH / 2;
  const canvasH = cy + outerR + oH / 2 + BOTTOM_PAD;

  const getPos = (angle: number, ring: 'inner' | 'outer') => {
    const r   = ring === 'inner' ? innerR : outerR;
    const rad = (angle * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  };

  // ── Panel helpers ─────────────────────────────────────────────────────────
  const openPanel = (node: NodeDef) => {
    setSelectedNode(node);
    setPanelVisible(true);
    panelAnim.setValue(PANEL_W);
    Animated.spring(panelAnim, { toValue: 0, friction: 8, tension: 100, useNativeDriver: true }).start();
  };

  const closePanel = () => {
    Animated.timing(panelAnim, { toValue: PANEL_W, duration: 200, useNativeDriver: true }).start(() => {
      setPanelVisible(false);
      setSelectedNode(null);
    });
  };

  const handleNodePress = (node: NodeDef) => {
    const sv = nodePress.current[node.id];
    Animated.sequence([
      Animated.timing(sv, { toValue: 0.88, duration: 70, useNativeDriver: true }),
      Animated.spring(sv, { toValue: 1, friction: 5, tension: 130, useNativeDriver: true }),
    ]).start();
    if (selectedNode?.id === node.id) { closePanel(); return; }
    openPanel(node);
  };

  // ── Pulse interpolations ──────────────────────────────────────────────────
  const pulseScale   = pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.15] });
  const pulseOpacity = pulseAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.08, 0.22, 0.08] });

  // ─── SVG: bezier curves from center to each node ─────────────────────────
  const renderConnections = () => {
    if (cW === 0) return null;
    return nodeDefs.map((node) => {
      const pos   = getPos(node.angle, node.ring);
      const color = CAT_COLOR[node.category];
      const isActive = hoveredNode === node.id || selectedNode?.id === node.id;

      const dx = pos.x - cx;
      const dy = pos.y - cy;
      const bx = cx + dx * 0.5 + (-dy) * 0.12;
      const by = cy + dy * 0.5 + dx  * 0.12;

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

  // ─── Satellite node card ─────────────────────────────────────────────────
  const renderNode = (node: NodeDef) => {
    const pos       = getPos(node.angle, node.ring);
    const nW        = node.ring === 'inner' ? iW : oW;
    const nH        = node.ring === 'inner' ? iH : oH;
    const enter     = nodeEnter.current[node.id] ?? new Animated.Value(1);
    const sc        = nodePress.current[node.id]  ?? new Animated.Value(1);
    const tY        = enter.interpolate({ inputRange: [0, 1], outputRange: [12, 0] });
    const isHov     = hoveredNode === node.id;
    const isSelected = selectedNode?.id === node.id;
    const accent    = CAT_COLOR[node.category];
    const tint      = CAT_TINT[node.category];

    return (
      <Animated.View
        key={node.id}
        style={[
          styles.nodeWrapper,
          {
            left:      pos.x - nW / 2,
            top:       pos.y - nH / 2,
            width:     nW,
            height:    nH,
            opacity:   enter,
            transform: [{ translateY: tY }, { scale: sc }],
          },
        ]}
      >
        <Pressable
          onPress={() => handleNodePress(node)}
          onHoverIn={() => setHoveredNode(node.id)}
          onHoverOut={() => setHoveredNode(null)}
          style={[
            styles.nodeCard,
            {
              borderColor:    isSelected ? accent : isHov ? accent + 'BB' : Colors.line,
              backgroundColor: isSelected ? tint   : isHov ? tint        : Colors.card,
              shadowColor:    accent,
              shadowOpacity:  isSelected ? 0.30 : isHov ? 0.18 : 0.06,
              shadowRadius:   isSelected ? 14   : isHov ? 9    : 3,
              shadowOffset:   { width: 0, height: 2 },
              elevation:      isSelected ? 10   : isHov ? 6    : 2,
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

  // ─── Center "Case File" node ──────────────────────────────────────────────
  const renderCenterNode = () => {
    if (cW === 0) return null;
    return (
      <>
        <Animated.View
          style={[
            styles.pulseRing,
            {
              width:        cNW + 28,
              height:       cNH + 28,
              borderRadius: 14,
              left:         cx - (cNW + 28) / 2,
              top:          cy - (cNH + 28) / 2,
              borderColor:  pc,
              transform:    [{ scale: pulseScale }],
              opacity:      pulseOpacity,
            },
          ]}
        />
        <Animated.View
          style={[
            styles.centerWrapper,
            {
              left:      cx - cNW / 2,
              top:       cy - cNH / 2,
              width:     cNW,
              height:    cNH,
              transform: [{ scale: centerScale }],
            },
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

  // ─── Panel detail content (per-node) ─────────────────────────────────────
  const getPanelBody = (node: NodeDef) => {
    const accent = CAT_COLOR[node.category];

    switch (node.id) {
      case 'suspects':
        return (
          <View>
            <Text style={styles.panelSectionHead}>Extracted Entities</Text>
            {caseItem.entities.length === 0
              ? <Text style={styles.panelEmpty}>No entities recorded.</Text>
              : caseItem.entities.map((e, i) => (
                  <View key={i} style={styles.panelChipRow}>
                    <View style={[styles.panelChip, { borderColor: accent + '55', backgroundColor: accent + '12' }]}>
                      <Text style={[styles.panelChipText, { color: accent }]}>{e}</Text>
                    </View>
                  </View>
                ))}
          </View>
        );

      case 'evidence':
        return (
          <View>
            <Text style={styles.panelSectionHead}>Evidence Items ({caseItem.evidence.length})</Text>
            {caseItem.evidence.length === 0
              ? <Text style={styles.panelEmpty}>No evidence recorded yet.</Text>
              : caseItem.evidence.map((ev) => (
                  <Pressable
                    key={ev.id}
                    style={styles.panelListRow}
                    onPress={() => {
                      closePanel();
                      navigation.navigate('EvidenceViewer', { caseId, evidenceId: ev.id });
                    }}
                  >
                    <View style={styles.panelListRowLeft}>
                      <Text style={styles.panelListTitle}>{ev.title}</Text>
                      <Text style={styles.panelListSub}>{ev.description}</Text>
                    </View>
                    <Text style={[styles.panelArrow, { color: accent }]}>›</Text>
                  </Pressable>
                ))}
          </View>
        );

      case 'documents':
        return (
          <View>
            <Text style={styles.panelSectionHead}>Case Documents</Text>
            {caseItem.evidence
              .filter(e => e.type === 'document' || e.type === 'screenshot' || e.type === 'sketch')
              .map((ev) => (
                <Pressable
                  key={ev.id}
                  style={styles.panelListRow}
                  onPress={() => {
                    closePanel();
                    navigation.navigate('EvidenceViewer', { caseId, evidenceId: ev.id });
                  }}
                >
                  <View style={styles.panelListRowLeft}>
                    <Text style={styles.panelListTitle}>{ev.title}</Text>
                    <Text style={styles.panelListSub}>{ev.date}</Text>
                  </View>
                  <Text style={[styles.panelArrow, { color: accent }]}>›</Text>
                </Pressable>
              ))}
            {caseItem.evidence.filter(e => e.type === 'document' || e.type === 'screenshot').length === 0 && (
              <Text style={styles.panelEmpty}>No documents on file.</Text>
            )}
          </View>
        );

      case 'linked':
        return (
          <View>
            <Text style={styles.panelSectionHead}>Linked Cases ({caseItem.linkedCases.length})</Text>
            {caseItem.linkedCases.length === 0
              ? <Text style={styles.panelEmpty}>No linked cases found.</Text>
              : caseItem.linkedCases.map((id) => (
                  <Pressable
                    key={id}
                    style={styles.panelListRow}
                    onPress={() => { closePanel(); navigation.push('CaseDetail', { caseId: id }); }}
                  >
                    <Text style={[styles.panelListTitle, { color: accent }]}>→ {id}</Text>
                    <Text style={[styles.panelArrow, { color: accent }]}>›</Text>
                  </Pressable>
                ))}
          </View>
        );

      case 'financial':
        return (
          <View>
            <Text style={styles.panelSectionHead}>Financial Trail</Text>
            {caseItem.entities
              .filter(e => e.startsWith('acct') || e.startsWith('app'))
              .map((e, i) => (
                <View key={i} style={styles.panelKV}>
                  <Text style={styles.panelKVLabel}>Entity {i + 1}</Text>
                  <Text style={styles.panelKVValue}>{e}</Text>
                </View>
              ))}
            {caseItem.entities.filter(e => e.startsWith('acct') || e.startsWith('app')).length === 0 && (
              <Text style={styles.panelEmpty}>No financial trail identified.</Text>
            )}
            <View style={[styles.panelInsight, { borderLeftColor: accent }]}>
              <Text style={styles.panelInsightText}>Bank account trace may be pending. Check entity connections for financial linkages.</Text>
            </View>
          </View>
        );

      case 'witnesses':
        return (
          <View>
            <Text style={styles.panelSectionHead}>Witness Summary</Text>
            <View style={styles.panelKV}>
              <Text style={styles.panelKVLabel}>Recorded</Text>
              <Text style={styles.panelKVValue}>2 Persons</Text>
            </View>
            {caseItem.entities.filter(e => e.includes('witness')).map((e, i) => (
              <View key={i} style={styles.panelKV}>
                <Text style={styles.panelKVLabel}>Witness {i + 1}</Text>
                <Text style={styles.panelKVValue}>{e}</Text>
              </View>
            ))}
            <View style={[styles.panelInsight, { borderLeftColor: accent }]}>
              <Text style={styles.panelInsightText}>Witness statements have been recorded. Cross-verify with CCTV timestamps.</Text>
            </View>
          </View>
        );

      case 'timeline':
        return (
          <View>
            <Text style={styles.panelSectionHead}>Timeline ({caseItem.timeline.length} Events)</Text>
            {caseItem.timeline.map((entry, i) => (
              <View key={entry.id} style={styles.panelTimelineRow}>
                <View style={[styles.panelTLDot, i === 0 && { backgroundColor: pc }]} />
                <View style={styles.panelTLContent}>
                  <Text style={styles.panelTLDate}>{entry.date} · {entry.time}</Text>
                  <Text style={styles.panelTLEvent}>{entry.event}</Text>
                  <Text style={styles.panelTLOfficer}>{entry.officer}</Text>
                </View>
              </View>
            ))}
          </View>
        );

      case 'analysis':
        return (
          <View>
            <Text style={styles.panelSectionHead}>AI Analysis</Text>
            {[
              {
                title: 'Pattern Match',
                text: `MO matches ${caseItem.linkedCases.length + 1} cases in the same sector over 30 days. Same time-of-day pattern detected.`,
              },
              {
                title: 'Entity Extraction',
                text: `${caseItem.entities.length} entities identified from FIR and statements.`,
              },
              {
                title: 'Risk Assessment',
                text: `Case flagged as ${caseItem.priority === 'urgent' ? 'HIGH' : caseItem.priority === 'review' ? 'MEDIUM' : 'LOW'} risk. Escalation recommended if new FIRs are filed in Sector ${caseItem.sector}.`,
              },
            ].map((item) => (
              <View key={item.title} style={[styles.panelInsight, { borderLeftColor: accent }]}>
                <Text style={[styles.panelInsightHead, { color: Colors.inkNavy }]}>{item.title}</Text>
                <Text style={styles.panelInsightText}>{item.text}</Text>
              </View>
            ))}
          </View>
        );

      case 'network':
        return (
          <View>
            <Text style={styles.panelSectionHead}>Network Links</Text>
            <View style={styles.panelKV}>
              <Text style={styles.panelKVLabel}>Total Connections</Text>
              <Text style={styles.panelKVValue}>18</Text>
            </View>
            <View style={styles.panelKV}>
              <Text style={styles.panelKVLabel}>Suspects linked</Text>
              <Text style={styles.panelKVValue}>{caseItem.entities.length}</Text>
            </View>
            <View style={styles.panelKV}>
              <Text style={styles.panelKVLabel}>Related FIRs</Text>
              <Text style={styles.panelKVValue}>{caseItem.linkedCases.length + 1}</Text>
            </View>
            <View style={[styles.panelInsight, { borderLeftColor: accent }]}>
              <Text style={styles.panelInsightText}>Full network graph available in the Network Links module. Associate map shows 18 direct connections.</Text>
            </View>
          </View>
        );

      case 'vehicles':
        return (
          <View>
            <Text style={styles.panelSectionHead}>Vehicles</Text>
            {caseItem.entities
              .filter(e => e.startsWith('veh'))
              .map((e, i) => (
                <View key={i} style={styles.panelKV}>
                  <Text style={styles.panelKVLabel}>Vehicle {i + 1}</Text>
                  <Text style={styles.panelKVValue}>{e.replace('veh: ', '')}</Text>
                </View>
              ))}
            {caseItem.entities.filter(e => e.startsWith('veh')).length === 0 && (
              <Text style={styles.panelEmpty}>No vehicles registered.</Text>
            )}
          </View>
        );

      case 'calls':
        return (
          <View>
            <Text style={styles.panelSectionHead}>Call Records</Text>
            <View style={styles.panelKV}>
              <Text style={styles.panelKVLabel}>Total Records</Text>
              <Text style={styles.panelKVValue}>158</Text>
            </View>
            <View style={styles.panelKV}>
              <Text style={styles.panelKVLabel}>Period</Text>
              <Text style={styles.panelKVValue}>Last 30 days</Text>
            </View>
            <View style={[styles.panelInsight, { borderLeftColor: accent }]}>
              <Text style={styles.panelInsightText}>Call data analysis pending. Request CDR from telecom provider for flagged numbers.</Text>
            </View>
          </View>
        );

      case 'crimescene':
        return (
          <View>
            <Text style={styles.panelSectionHead}>Crime Scene</Text>
            <View style={styles.panelKV}>
              <Text style={styles.panelKVLabel}>Location</Text>
              <Text style={styles.panelKVValue}>{caseItem.location}</Text>
            </View>
            <View style={styles.panelKV}>
              <Text style={styles.panelKVLabel}>Sector</Text>
              <Text style={styles.panelKVValue}>{caseItem.sector}</Text>
            </View>
            {caseItem.latitude !== undefined && (
              <>
                <View style={styles.panelKV}>
                  <Text style={styles.panelKVLabel}>Latitude</Text>
                  <Text style={styles.panelKVValue}>{caseItem.latitude.toFixed(5)}</Text>
                </View>
                <View style={styles.panelKV}>
                  <Text style={styles.panelKVLabel}>Longitude</Text>
                  <Text style={styles.panelKVValue}>{caseItem.longitude?.toFixed(5)}</Text>
                </View>
              </>
            )}
          </View>
        );

      case 'officer':
        return (
          <View>
            <Text style={styles.panelSectionHead}>Investigation Details</Text>
            <View style={[styles.panelOfficerCard, { borderLeftColor: accent }]}>
              <Text style={styles.panelOfficerName}>{caseItem.investigatingOfficer}</Text>
              <Text style={styles.panelOfficerRole}>Investigating Officer</Text>
            </View>
            {[
              ['FIR Number',   caseItem.firNumber],
              ['Filed',        caseItem.filedDate],
              ['Complainant',  caseItem.complainant],
              ['Status',       caseItem.status.toUpperCase()],
              ['Category',     caseItem.category],
              ['Sector',       caseItem.sector],
            ].map(([k, v]) => (
              <View key={k} style={styles.panelKV}>
                <Text style={styles.panelKVLabel}>{k}</Text>
                <Text style={styles.panelKVValue}>{v}</Text>
              </View>
            ))}
          </View>
        );

      case 'cctv':
        return (
          <View>
            <Text style={styles.panelSectionHead}>CCTV Footage</Text>
            {caseItem.evidence.filter(e => e.type === 'cctv').map((ev) => (
              <Pressable
                key={ev.id}
                style={styles.panelListRow}
                onPress={() => {
                  closePanel();
                  navigation.navigate('EvidenceViewer', { caseId, evidenceId: ev.id });
                }}
              >
                <View style={styles.panelListRowLeft}>
                  <Text style={styles.panelListTitle}>{ev.title}</Text>
                  <Text style={styles.panelListSub}>{ev.description}</Text>
                </View>
                <Text style={[styles.panelArrow, { color: accent }]}>›</Text>
              </Pressable>
            ))}
            {caseItem.evidence.filter(e => e.type === 'cctv').length === 0 && (
              <Text style={styles.panelEmpty}>No CCTV footage on file.</Text>
            )}
          </View>
        );

      default:
        return (
          <View>
            <Text style={styles.panelSectionHead}>{node.label}</Text>
            <Text style={styles.panelEmpty}>{node.subLabel}</Text>
          </View>
        );
    }
  };

  // ─── Right detail panel ───────────────────────────────────────────────────
  const renderPanel = () => {
    if (!panelVisible || !selectedNode) return null;
    const accent = CAT_COLOR[selectedNode.category];
    const tint   = CAT_TINT[selectedNode.category];
    return (
      <Animated.View style={[styles.panel, { transform: [{ translateX: panelAnim }] }]}>
        <View style={[styles.panelHeader, { borderLeftColor: accent }]}>
          <View style={styles.panelHeaderRow}>
            <View style={[styles.panelIconBadge, { backgroundColor: tint, borderColor: accent + '55' }]}>
              <Text style={styles.panelIconBadgeText}>{selectedNode.icon}</Text>
            </View>
            <View style={styles.panelHeaderText}>
              <Text style={styles.panelHeaderTitle}>{selectedNode.label}</Text>
              <Text style={[styles.panelHeaderSub, { color: accent }]}>{selectedNode.subLabel}</Text>
            </View>
            <Pressable onPress={closePanel} style={styles.panelCloseBtn} accessibilityLabel="Close panel">
              <Text style={styles.panelCloseText}>✕</Text>
            </Pressable>
          </View>
          <View style={[styles.panelCatTag, { backgroundColor: accent + '18', borderColor: accent + '44' }]}>
            <View style={[styles.panelCatDot, { backgroundColor: accent }]} />
            <Text style={[styles.panelCatLabel, { color: accent }]}>{CAT_LABEL[selectedNode.category].toUpperCase()}</Text>
          </View>
        </View>

        <View style={[styles.panelDivider, { backgroundColor: accent }]} />

        {/* minHeight: 0 is required so this flex child can actually shrink and
            let its ScrollView scroll, instead of growing to fit all content. */}
        <View style={styles.panelBodyContainer}>
          <ScrollView
            style={styles.panelScroll}
            showsVerticalScrollIndicator={true}
            contentContainerStyle={styles.panelScrollContent}
            nestedScrollEnabled
            bounces
          >
            {getPanelBody(selectedNode)}
            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </Animated.View>
    );
  };

  // ─── Main render ──────────────────────────────────────────────────────────
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

      {/* ── Graph canvas + panel ────────────────────────────────────────── */}
      <View
        style={styles.canvasContainer}
        onLayout={(e: LayoutChangeEvent) => setCW(e.nativeEvent.layout.width)}
      >
        {/* FIX: the ring diagram now lives inside its own vertical ScrollView,
            sized to canvasH (its real content height) rather than the visible
            screen height. On short screens it scrolls; on tall screens it just
            fits — either way nothing gets clipped. */}
        <ScrollView
          style={styles.diagramScroll}
          contentContainerStyle={{ width: cW || '100%', minHeight: canvasH }}
          showsVerticalScrollIndicator={true}
          bounces
        >
          <View style={{ width: cW, height: canvasH }}>
            {cW > 0 && (
              <Svg
                width={cW}
                height={canvasH}
                style={StyleSheet.absoluteFillObject}
                pointerEvents="none"
              >
                <Defs>
                  <SvgRadialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
                    <Stop offset="0%"   stopColor={pc} stopOpacity="0.18" />
                    <Stop offset="100%" stopColor={pc} stopOpacity="0" />
                  </SvgRadialGradient>
                </Defs>
                <Circle
                  cx={cx} cy={cy}
                  r={cNW * 0.95}
                  fill="url(#centerGlow)"
                />
                {renderConnections()}
                <Circle
                  cx={cx} cy={cy}
                  r={innerR}
                  stroke={Colors.line}
                  strokeWidth="0.5"
                  strokeDasharray="2,6"
                  fill="none"
                  opacity={0.35}
                />
                <Circle
                  cx={cx} cy={cy}
                  r={outerR}
                  stroke={Colors.line}
                  strokeWidth="0.5"
                  strokeDasharray="2,10"
                  fill="none"
                  opacity={0.20}
                />
                {nodeDefs.filter(n => n.ring === 'inner').map(n => {
                  const p = getPos(n.angle, n.ring);
                  return <Circle key={`dot-${n.id}`} cx={p.x} cy={p.y} r={3} fill={CAT_COLOR[n.category]} opacity={0.42} />;
                })}
              </Svg>
            )}

            {/* Satellite nodes */}
            {cW > 0 && nodeDefs.map(renderNode)}

            {/* Center node */}
            {renderCenterNode()}
          </View>
        </ScrollView>

        {/* ── HUD: Legend (bottom-left) — now a fixed overlay, not part of the
             scrollable diagram, so it's always visible. ─────────────────── */}
        <View style={styles.legendHUD}>
          {(Object.entries(CAT_COLOR) as [Category, string][]).map(([cat, color]) => (
            <View key={cat} style={styles.legendRow}>
              <View style={[styles.legendDot, { backgroundColor: color }]} />
              <Text style={styles.legendText}>{CAT_LABEL[cat]}</Text>
            </View>
          ))}
        </View>

        {/* ── Synopsis HUD — also a fixed overlay above the scrollable diagram. */}
        <View style={styles.summaryTopDashboard}>
          <View style={styles.summaryLeftCol}>
            <View style={styles.summaryLabelBadge}>
              <Text style={styles.summaryLabelBadgeText}>INTELLIGENCE SYNOPSIS</Text>
            </View>
            <Text style={styles.summaryMainText} numberOfLines={2}>
              {caseItem.description || "No core description provided for this case sequence profile."}
            </Text>
          </View>
          <View style={styles.summaryDividerLine} />
          <View style={styles.summaryRightCol}>
            <View style={styles.summaryMetaGridRow}>
              <Text style={styles.summaryMetaLabel}>SECTOR:</Text>
              <Text style={styles.summaryMetaVal}>{caseItem.sector || 'N/A'}</Text>
            </View>
            <View style={styles.summaryMetaGridRow}>
              <Text style={styles.summaryMetaLabel}>FILED:</Text>
              <Text style={styles.summaryMetaVal}>{caseItem.filedDate || 'N/A'}</Text>
            </View>
            <View style={styles.summaryMetaGridRow}>
              <Text style={styles.summaryMetaLabel}>OFFICER:</Text>
              <Text style={styles.summaryMetaVal} numberOfLines={1}>
                {caseItem.investigatingOfficer ? caseItem.investigatingOfficer.split(' ').pop() : 'N/A'}
              </Text>
            </View>
          </View>
        </View>

        {/* ── Right detail panel (overlay, slides from right) ──────────── */}
        {renderPanel()}
      </View>
    </Animated.View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.paper },

  // ── Header
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

  // ── Canvas
  canvasContainer: {
    flex: 1,
    position: 'relative',
    backgroundColor: Colors.paper,
    overflow: 'hidden',
  },
  // FIX: bounded scroll area for the ring diagram itself.
  diagramScroll: {
    flex: 1,
  },

  // ── Satellite node
  nodeWrapper: { position: 'absolute' },
  nodeCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 9,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 6,
    paddingBottom: 5,
    paddingHorizontal: 4,
    backgroundColor: Colors.card,
  },
  nodeAccentBar: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 2.5,
    borderTopLeftRadius: 9,
    borderTopRightRadius: 9,
  },
  nodeIcon: { fontSize: 13, marginBottom: 2 },
  nodeLabel: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: 9.5,
    textAlign: 'center',
    lineHeight: 13,
  },
  nodeSubLabel: {
    fontFamily: FontFamily.mono,
    fontSize: 8.5,
    textAlign: 'center',
    marginTop: 1.5,
  },
  selectedDot: {
    position: 'absolute',
    bottom: 4,
    width: 5, height: 5,
    borderRadius: 3,
  },

  // ── Center node
  centerWrapper: { position: 'absolute' },
  centerCard: {
    flex: 1,
    borderWidth: 2,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: Colors.card,
    shadowColor: Colors.inkNavy,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 18,
    elevation: 12,
  },
  centerTopBar: {
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerTopBarLabel: {
    fontFamily: FontFamily.mono,
    fontSize: 9,
    letterSpacing: 1.8,
    color: Colors.white,
    fontWeight: '700',
  },
  centerBody: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  centerIcon: { fontSize: 22, marginBottom: 2 },
  centerFir: {
    fontFamily: FontFamily.mono,
    fontSize: 9,
    color: Colors.gray,
    letterSpacing: 0.5,
  },
  centerTitle: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 11.5,
    color: Colors.inkNavy,
    textAlign: 'center',
    lineHeight: 15,
    marginVertical: 4,
    flex: 1,
  },
  centerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginTop: 2,
  },
  centerPillDot: { width: 4, height: 4, borderRadius: 2 },
  centerPillText: { fontFamily: FontFamily.mono, fontSize: 8, letterSpacing: 0.8, fontWeight: '600' },

  // ── Pulse ring
  pulseRing: { position: 'absolute', borderWidth: 1.5 },

  // ── HUD: Legend (fixed overlay)
  legendHUD: {
    position: 'absolute',
    bottom: 14,
    left: 14,
    gap: 5,
    backgroundColor: Colors.card + 'E8',
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    zIndex: 10,
  },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 6, height: 6, borderRadius: 3 },
  legendText: { fontFamily: FontFamily.mono, fontSize: FontSize.xs, color: Colors.gray, letterSpacing: 0.2 },

  // ── Synopsis HUD (fixed overlay)
  summaryTopDashboard: {
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
  },
  summaryLeftCol: {
    flex: 1.6,
    paddingRight: 12,
    justifyContent: 'center',
  },
  summaryLabelBadge: {
    backgroundColor: Colors.inkNavy + '12',
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
  },
  summaryLabelBadgeText: {
    fontFamily: FontFamily.mono,
    fontSize: 8.5,
    letterSpacing: 1.1,
    color: Colors.inkNavy,
    fontWeight: '700',
  },
  summaryMainText: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.xs,
    color: Colors.inkNavy,
    lineHeight: 16,
  },
  summaryDividerLine: {
    width: 1,
    backgroundColor: Colors.line,
    marginVertical: 2,
  },
  summaryRightCol: {
    flex: 0.8,
    paddingLeft: 12,
    justifyContent: 'center',
    gap: 4,
  },
  summaryMetaGridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryMetaLabel: {
    fontFamily: FontFamily.mono,
    fontSize: 9,
    color: Colors.gray,
    fontWeight: '600',
  },
  summaryMetaVal: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 10,
    color: Colors.inkNavy,
  },

  // ── Right detail panel
  panel: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: PANEL_W,
    backgroundColor: Colors.card,
    borderLeftWidth: 1,
    borderLeftColor: Colors.line,
    shadowColor: Colors.inkNavy,
    shadowOffset: { width: -6, height: 0 },
    shadowOpacity: 0.14,
    shadowRadius: 20,
    elevation: 16,
    display: 'flex',
    flexDirection: 'column',
    zIndex: 25,
  },
  panelHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
    borderLeftWidth: 4,
    gap: 10,
  },
  panelHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  panelIconBadge: {
    width: 36, height: 36, borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  panelIconBadgeText: { fontSize: 18 },
  panelHeaderText: { flex: 1 },
  panelHeaderTitle: { fontFamily: FontFamily.display, fontSize: FontSize.lg, color: Colors.inkNavy, fontWeight: '600' },
  panelHeaderSub: { fontFamily: FontFamily.mono, fontSize: FontSize.xs, marginTop: 2 },
  panelCloseBtn: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  panelCloseText: { fontFamily: FontFamily.bodyMedium, fontSize: 16, color: Colors.gray },
  panelCatTag: {
    alignSelf: 'flex-start',
    flexDirection: 'row', alignItems: 'center', gap: 5,
    borderRadius: 20, borderWidth: 1,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  panelCatDot: { width: 5, height: 5, borderRadius: 3 },
  panelCatLabel: { fontFamily: FontFamily.mono, fontSize: FontSize.xs, letterSpacing: 0.6 },
  panelDivider: { height: 2, opacity: 0.55 },

  // Bounded parent so the ScrollView below it can actually scroll instead of
  // growing to fit all content.
  panelBodyContainer: {
    flex: 1,
    minHeight: 0,
    width: '100%',
    overflow: 'hidden',
  },
  panelScroll: { flex: 1 },
  panelScrollContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 32, flexGrow: 1 },

  // Panel internals
  panelSectionHead: {
    fontFamily: FontFamily.mono,
    fontSize: FontSize.xs,
    letterSpacing: 1.3,
    color: Colors.gray,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  panelEmpty: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.md,
    color: Colors.gray,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  panelKV: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
    gap: 8,
  },
  panelKVLabel: { fontFamily: FontFamily.bodyMedium, fontSize: FontSize.base, color: Colors.gray, flex: 0.45 },
  panelKVValue: { fontFamily: FontFamily.body, fontSize: FontSize.base, color: Colors.inkNavy, flex: 0.55, textAlign: 'right' },
  panelInsight: {
    backgroundColor: Colors.paperDim,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.line,
    borderLeftWidth: 3,
    padding: 10,
    marginVertical: 8,
  },
  panelInsightHead: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.md,
    marginBottom: 4,
  },
  panelInsightText: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.md,
    color: Colors.gray,
    lineHeight: 19,
  },
  panelListRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
    gap: 8,
  },
  panelListRowLeft: { flex: 1 },
  panelListTitle: { fontFamily: FontFamily.bodySemiBold, fontSize: FontSize.md, color: Colors.inkNavy },
  panelListSub: { fontFamily: FontFamily.body, fontSize: FontSize.base, color: Colors.gray, marginTop: 2 },
  panelArrow: { fontFamily: FontFamily.bodyMedium, fontSize: 20, lineHeight: 24 },
  panelChipRow: { marginBottom: 6 },
  panelChip: {
    borderWidth: 1,
    borderRadius: 20,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  panelChipText: { fontFamily: FontFamily.mono, fontSize: FontSize.xs },
  panelTimelineRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  panelTLDot: {
    width: 8, height: 8,
    borderRadius: 4,
    backgroundColor: Colors.steelLight,
    marginTop: 4,
  },
  panelTLContent: { flex: 1 },
  panelTLDate: { fontFamily: FontFamily.mono, fontSize: FontSize.xs, color: Colors.gray },
  panelTLEvent: { fontFamily: FontFamily.bodySemiBold, fontSize: FontSize.md, color: Colors.inkNavy, marginTop: 2 },
  panelTLOfficer: { fontFamily: FontFamily.body, fontSize: FontSize.base, color: Colors.gray, marginTop: 2 },
  panelOfficerCard: {
    backgroundColor: Colors.paperDim,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.line,
    borderLeftWidth: 4,
    padding: 12,
    marginBottom: 14,
  },
  panelOfficerName: { fontFamily: FontFamily.display, fontSize: FontSize['2xl'], color: Colors.inkNavy, fontWeight: '600' },
  panelOfficerRole: { fontFamily: FontFamily.mono, fontSize: FontSize.xs, color: Colors.gray, marginTop: 3, letterSpacing: 0.5 },
});