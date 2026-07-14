// CrimeSphere AI — CaseSummaryChart
// SVG line chart with filter chips: case type, timing, region
// Hover: continuous crosshair + tooltip that tracks mouse/touch position
import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView,
  LayoutChangeEvent, Platform,
} from 'react-native';
import Svg, {
  Path, Circle, Line, Text as SvgText,
  Rect, Defs, LinearGradient, Stop, G,
} from 'react-native-svg';
import { Colors } from '../../constants/colors';
import { FontFamily, FontSize } from '../../constants/typography';

// ── Mock time-series data ──────────────────────────────────────────────────────
const DATA: Record<string, Record<string, number[]>> = {
  all: {
    hourly: [2, 1, 3, 2, 4, 3, 5, 4, 6, 5, 4, 6, 5, 7, 6, 8, 7, 9, 8, 7, 9, 8, 10, 9],
    day:    [4, 6, 3, 7, 5, 8, 5, 7, 6, 9, 8, 10, 7, 11, 9],
    week:   [18, 22, 19, 24, 21, 27, 25],
    month:  [52, 67, 59, 78, 65, 88, 75],
  },
  cyber: {
    hourly: [1, 0, 1, 1, 2, 1, 2, 2, 3, 2, 2, 3, 2, 4, 3, 4, 3, 5, 4, 3, 4, 3, 5, 4],
    day:    [2, 3, 1, 3, 2, 4, 2, 3, 3, 4, 4, 5, 3, 5, 4],
    week:   [8, 10, 9, 11, 10, 13, 12],
    month:  [22, 29, 25, 34, 28, 38, 32],
  },
  property: {
    hourly: [1, 0, 1, 0, 1, 1, 2, 1, 2, 2, 1, 2, 2, 2, 2, 3, 3, 3, 3, 3, 4, 4, 4, 4],
    day:    [1, 2, 1, 2, 2, 3, 2, 3, 2, 4, 3, 4, 3, 5, 4],
    week:   [6, 8, 6, 9, 7, 10, 9],
    month:  [18, 23, 20, 26, 22, 30, 27],
  },
  assault: {
    hourly: [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    day:    [0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
    week:   [1, 2, 1, 2, 1, 2, 1],
    month:  [4, 6, 5, 7, 5, 8, 6],
  },
  vehicle: {
    hourly: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    day:    [0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1],
    week:   [2, 1, 2, 1, 2, 1, 2],
    month:  [5, 7, 5, 8, 6, 8, 7],
  },
};

const LABELS: Record<string, { all: string[]; sub: string[] }> = {
  hourly: {
    all: Array.from({ length: 24 }, (_, i) => `${i}h`),
    sub: ['0h', '4h', '8h', '12h', '16h', '20h', '23h'],
  },
  day: {
    all: ['Jul 1','Jul 2','Jul 3','Jul 4','Jul 5','Jul 6','Jul 7','Jul 8','Jul 9','Jul 10','Jul 11','Jul 12','Jul 13','Jul 14','Jul 15'],
    sub: ['Jul 1', 'Jul 5', 'Jul 9', 'Jul 13'],
  },
  week: {
    all: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7'],
    sub: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7'],
  },
  month: {
    all: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    sub: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
  },
};

const REGIONS = ['All Regions', 'Sector 4', 'Sector 5', 'Sector 6', 'ITPL', 'Hoodi', 'Whitefield'];
const CASE_TYPES = [
  { id: 'all',      label: 'All Types',  color: Colors.inkNavy },
  { id: 'cyber',    label: 'Cyber',      color: Colors.steelLight },
  { id: 'property', label: 'Property',   color: Colors.red },
  { id: 'assault',  label: 'Assault',    color: Colors.amber },
  { id: 'vehicle',  label: 'Vehicle',    color: Colors.green },
];
const TIMINGS = [
  { id: 'hourly', label: 'Hourly' },
  { id: 'day',    label: 'Daily'  },
  { id: 'week',   label: 'Weekly' },
  { id: 'month',  label: 'Monthly'},
];

// Chart geometry constants
const CHART_H = 160;
const PAD_L   = 32;
const PAD_R   = 16;
const PAD_T   = 14;
const PAD_B   = 26;

// ── Bezier path helper ────────────────────────────────────────────────────────
const buildPath = (points: { x: number; y: number }[]): string => {
  if (points.length < 2) return '';
  let d = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const cp1x = ((points[i].x + points[i + 1].x) / 2).toFixed(2);
    const cp1y = points[i].y.toFixed(2);
    const cp2x = ((points[i].x + points[i + 1].x) / 2).toFixed(2);
    const cp2y = points[i + 1].y.toFixed(2);
    d += ` C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${points[i + 1].x.toFixed(2)} ${points[i + 1].y.toFixed(2)}`;
  }
  return d;
};

// ── Tooltip interface ─────────────────────────────────────────────────────────
interface TooltipState { idx: number; x: number; y: number; val: number; label: string }

// ── Main Component ────────────────────────────────────────────────────────────
export const CaseSummaryChart: React.FC = () => {
  const [caseType, setCaseType] = useState('all');
  const [timing,   setTiming]   = useState('day');
  const [region,   setRegion]   = useState('All Regions');
  const [chartW,   setChartW]   = useState(0);
  const [tooltip,  setTooltip]  = useState<TooltipState | null>(null);

  // Derive data & geometry
  const rawData  = DATA[caseType]?.[timing] ?? DATA.all.day;
  const maxVal   = Math.max(...rawData, 1);
  const plotW    = Math.max(0, chartW - PAD_L - PAD_R);
  const plotH    = CHART_H - PAD_T - PAD_B;
  const allLabels = LABELS[timing]?.all ?? [];
  const subLabels = LABELS[timing]?.sub ?? [];

  const pts = rawData.map((v, i) => ({
    x: PAD_L + (rawData.length === 1 ? plotW / 2 : (i / (rawData.length - 1)) * plotW),
    y: PAD_T + plotH - (v / maxVal) * plotH,
    v,
    label: allLabels[i] ?? `${i}`,
  }));

  const linePath = buildPath(pts);
  const areaPath = pts.length > 1
    ? `${linePath} L ${pts[pts.length - 1].x} ${PAD_T + plotH} L ${pts[0].x} ${PAD_T + plotH} Z`
    : '';

  const labelIdxs = subLabels
    .map((l) => allLabels.indexOf(l))
    .filter((i) => i >= 0);

  const yTicks = [0, 0.25, 0.5, 0.75, 1];

  // Active case type color for line
  const activeCT = CASE_TYPES.find((t) => t.id === caseType);
  const lineColor = activeCT?.color ?? Colors.steel;

  // ── Hover handler — find nearest point by x ────────────────────────────────
  const handleHover = useCallback(
    (e: any) => {
      if (!chartW || pts.length === 0) return;
      // On web, locationX is relative to the element
      const mx: number = e?.nativeEvent?.locationX ?? e?.nativeEvent?.offsetX ?? 0;
      let nearestIdx = 0;
      let minDist = Infinity;
      pts.forEach((p, i) => {
        const dist = Math.abs(p.x - mx);
        if (dist < minDist) { minDist = dist; nearestIdx = i; }
      });
      const np = pts[nearestIdx];
      setTooltip({ idx: nearestIdx, x: np.x, y: np.y, val: np.v, label: np.label });
    },
    [chartW, pts],
  );

  const handleHoverEnd = useCallback(() => setTooltip(null), []);

  // Tooltip box positioning — keep within bounds
  const tipW = 80;
  const tipH = 40;
  const tipX = tooltip ? Math.min(Math.max(tooltip.x - tipW / 2, PAD_L), chartW - PAD_R - tipW) : 0;
  const tipY = tooltip ? Math.max(tooltip.y - tipH - 10, PAD_T) : 0;

  // Summary stats
  const latestVal = rawData[rawData.length - 1];
  const peakVal   = Math.max(...rawData);
  const avgVal    = Math.round(rawData.reduce((a, b) => a + b, 0) / rawData.length);
  const diffVal   = latestVal - rawData[0];
  const diffUp    = diffVal >= 0;

  return (
    <View style={styles.container}>

      {/* ── Filter Bar: Row 1 — Type + Timing ──────────────────────── */}
      <View style={styles.filterRow}>

        {/* Type group */}
        <View style={styles.filterGroup}>
          <Text style={styles.filterGroupLabel}>TYPE</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.chipSet}>
              {CASE_TYPES.map((t) => {
                const active = caseType === t.id;
                return (
                  <Pressable
                    key={t.id}
                    onPress={() => { setCaseType(t.id); setTooltip(null); }}
                    style={[
                      styles.chip,
                      active && { backgroundColor: t.color, borderColor: t.color },
                    ]}
                    accessibilityLabel={`Filter by ${t.label}`}
                  >
                    <Text style={[styles.chipText, active && { color: Colors.white }]}>
                      {t.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>
        </View>

        <View style={styles.filterSep} />

        {/* Timing group */}
        <View style={styles.filterGroup}>
          <Text style={styles.filterGroupLabel}>PERIOD</Text>
          <View style={styles.chipSet}>
            {TIMINGS.map((t) => {
              const active = timing === t.id;
              return (
                <Pressable
                  key={t.id}
                  onPress={() => { setTiming(t.id); setTooltip(null); }}
                  style={[
                    styles.chip,
                    active && styles.chipActivePeriod,
                  ]}
                  accessibilityLabel={`Filter by ${t.label}`}
                >
                  <Text style={[styles.chipText, active && styles.chipTextPeriod]}>
                    {t.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

      </View>

      {/* ── Filter Bar: Row 2 — Region ─────────────────────────────── */}
      <View style={styles.filterRow2}>
        <Text style={styles.filterGroupLabel}>REGION</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1 }}>
          <View style={styles.chipSet}>
            {REGIONS.map((r) => {
              const active = region === r;
              return (
                <Pressable
                  key={r}
                  onPress={() => setRegion(r)}
                  style={[styles.chip, active && styles.chipActiveRegion]}
                  accessibilityLabel={`Filter by region ${r}`}
                >
                  <Text style={[styles.chipText, active && styles.chipTextRegion]}>{r}</Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
      </View>

      {/* ── Summary Stats Row ─────────────────────────────────────── */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={[styles.statVal, { color: lineColor }]}>{latestVal}</Text>
          <Text style={styles.statLbl}>Latest</Text>
        </View>
        <View style={styles.statDiv} />
        <View style={styles.statItem}>
          <Text style={[styles.statVal, { color: lineColor }]}>{peakVal}</Text>
          <Text style={styles.statLbl}>Peak</Text>
        </View>
        <View style={styles.statDiv} />
        <View style={styles.statItem}>
          <Text style={[styles.statVal, { color: lineColor }]}>{avgVal}</Text>
          <Text style={styles.statLbl}>Avg</Text>
        </View>
        <View style={styles.statDiv} />
        <View style={[styles.trendBadge, {
          backgroundColor: diffUp ? Colors.red + '14' : Colors.green + '14',
          borderColor:      diffUp ? Colors.red + '40' : Colors.green + '40',
        }]}>
          <Text style={[styles.trendVal, { color: diffUp ? Colors.red : Colors.green }]}>
            {diffUp ? '▲' : '▼'} {Math.abs(diffVal)}
          </Text>
          <Text style={styles.trendLbl}>vs. start</Text>
        </View>

        <View style={{ flex: 1 }} />

        {/* Hover hint */}
        <Text style={styles.hoverHint}>
          {tooltip
            ? `${tooltip.label} · ${tooltip.val} cases`
            : Platform.OS === 'web' ? 'Hover chart for details' : 'Tap chart for details'
          }
        </Text>
      </View>

      {/* ── SVG Chart ─────────────────────────────────────────────── */}
      <View
        style={styles.chartWrap}
        onLayout={(e: LayoutChangeEvent) => setChartW(e.nativeEvent.layout.width)}
        // Web hover events
        {...(Platform.OS === 'web' ? {
          onMouseMove: handleHover,
          onMouseLeave: handleHoverEnd,
        } : {})}
      >
        {chartW > 0 && (
          <Svg
            width={chartW}
            height={CHART_H}
            // Native touch tracking
            onStartShouldSetResponder={() => true}
            {...(Platform.OS !== 'web' ? {
              onResponderMove: handleHover,
              onResponderRelease: handleHoverEnd,
            } : {})}
          >
            <Defs>
              <LinearGradient id="areag" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0%"   stopColor={lineColor} stopOpacity="0.20" />
                <Stop offset="100%" stopColor={lineColor} stopOpacity="0.01" />
              </LinearGradient>
            </Defs>

            {/* Y-axis gridlines + labels */}
            {yTicks.map((t) => {
              const gy = PAD_T + plotH - t * plotH;
              const tickVal = Math.round(maxVal * t);
              return (
                <G key={`yt-${t}`}>
                  <Line
                    x1={PAD_L} y1={gy}
                    x2={chartW - PAD_R} y2={gy}
                    stroke={Colors.line} strokeWidth={0.8}
                    strokeDasharray={t === 0 ? undefined : '3,6'}
                  />
                  <SvgText
                    x={PAD_L - 5} y={gy + 3.5}
                    fontSize={9} fill={Colors.gray}
                    textAnchor="end" fontFamily={FontFamily.mono}
                  >
                    {tickVal}
                  </SvgText>
                </G>
              );
            })}

            {/* Area fill */}
            {areaPath && <Path d={areaPath} fill="url(#areag)" />}

            {/* Line */}
            {linePath && (
              <Path
                d={linePath}
                stroke={lineColor}
                strokeWidth={2.5}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Data point dots (only on compact datasets) */}
            {pts.length <= 15 && pts.map((p, i) => (
              <Circle
                key={`dot-${i}`}
                cx={p.x} cy={p.y} r={4}
                fill={Colors.card}
                stroke={tooltip?.idx === i ? lineColor : lineColor + '88'}
                strokeWidth={tooltip?.idx === i ? 2.5 : 1.5}
              />
            ))}

            {/* Last point accent */}
            {pts.length > 0 && (
              <Circle
                cx={pts[pts.length - 1].x}
                cy={pts[pts.length - 1].y}
                r={5}
                fill={Colors.red}
                stroke={Colors.card}
                strokeWidth={2}
              />
            )}

            {/* X-axis labels */}
            {labelIdxs.map((li) => {
              const p = pts[li];
              if (!p) return null;
              return (
                <SvgText
                  key={`xl-${li}`}
                  x={p.x} y={CHART_H - 6}
                  fontSize={9} fill={Colors.gray}
                  textAnchor="middle"
                  fontFamily={FontFamily.mono}
                >
                  {allLabels[li]}
                </SvgText>
              );
            })}

            {/* ── Hover crosshair + tooltip ───────────────────────── */}
            {tooltip && (
              <G>
                {/* Vertical crosshair line */}
                <Line
                  x1={tooltip.x} y1={PAD_T}
                  x2={tooltip.x} y2={PAD_T + plotH}
                  stroke={lineColor} strokeWidth={1.2}
                  strokeDasharray="4,4"
                  opacity={0.6}
                />

                {/* Highlight ring on current point */}
                <Circle
                  cx={tooltip.x} cy={tooltip.y}
                  r={8}
                  fill={lineColor + '20'}
                  stroke={lineColor} strokeWidth={1.5}
                />
                <Circle
                  cx={tooltip.x} cy={tooltip.y}
                  r={4}
                  fill={lineColor}
                />

                {/* Tooltip bubble */}
                <Rect
                  x={tipX} y={tipY}
                  width={tipW} height={tipH}
                  fill={Colors.inkNavy}
                  rx={6} ry={6}
                />
                {/* Tooltip arrow (triangle) */}
                <Path
                  d={`M ${Math.max(tipX + 8, Math.min(tooltip.x - 5, tipX + tipW - 16))} ${tipY + tipH} L ${Math.max(tipX + 8, Math.min(tooltip.x, tipX + tipW - 8))} ${tipY + tipH + 6} L ${Math.max(tipX + 8, Math.min(tooltip.x + 5, tipX + tipW - 6))} ${tipY + tipH} Z`}
                  fill={Colors.inkNavy}
                />
                {/* Tooltip label (date) */}
                <SvgText
                  x={tipX + tipW / 2} y={tipY + 14}
                  fontSize={9} fill={Colors.sidebarMuted}
                  textAnchor="middle" fontFamily={FontFamily.mono}
                >
                  {tooltip.label}
                </SvgText>
                {/* Tooltip value */}
                <SvgText
                  x={tipX + tipW / 2} y={tipY + 28}
                  fontSize={13} fill={Colors.white}
                  fontWeight="700"
                  textAnchor="middle" fontFamily={FontFamily.display}
                >
                  {tooltip.val} cases
                </SvgText>
              </G>
            )}

            {/* Invisible full-area hover capture overlay — no onPress, hover handled by View wrapper */}
            <Rect
              x={PAD_L} y={PAD_T}
              width={plotW > 0 ? plotW : 1} height={plotH > 0 ? plotH : 1}
              fill="transparent"
            />

          </Svg>
        )}
      </View>
    </View>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 16,
    gap: 10,
  },

  // ── Filter rows
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 0,
  },
  filterRow2: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  filterGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 1,
  },
  filterGroupLabel: {
    fontFamily: FontFamily.mono,
    fontSize: 9,
    color: Colors.gray,
    letterSpacing: 0.8,
    flexShrink: 0,
  },
  filterSep: {
    width: 1,
    height: 20,
    backgroundColor: Colors.line,
    marginHorizontal: 10,
    flexShrink: 0,
  },
  chipSet: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  // ── Chips
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.line,
    backgroundColor: Colors.paper,
  },
  chipText: {
    fontFamily: FontFamily.mono,
    fontSize: FontSize.xs,
    color: Colors.gray,
  },
  chipActivePeriod: {
    backgroundColor: Colors.steel,
    borderColor: Colors.steel,
  },
  chipTextPeriod: {
    color: Colors.white,
    fontWeight: '600',
  },
  chipActiveRegion: {
    backgroundColor: Colors.green + '18',
    borderColor: Colors.green,
  },
  chipTextRegion: {
    color: Colors.green,
    fontWeight: '600',
  },

  // ── Stats row
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'nowrap',
  },
  statItem: {
    alignItems: 'flex-start',
  },
  statVal: {
    fontFamily: FontFamily.display,
    fontSize: FontSize['2xl'],
    fontWeight: '700',
    lineHeight: 24,
  },
  statLbl: {
    fontFamily: FontFamily.mono,
    fontSize: 9,
    color: Colors.gray,
    letterSpacing: 0.4,
    marginTop: 1,
  },
  statDiv: {
    width: 1,
    height: 24,
    backgroundColor: Colors.line,
  },
  trendBadge: {
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignItems: 'center',
  },
  trendVal: {
    fontFamily: FontFamily.mono,
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
  trendLbl: {
    fontFamily: FontFamily.mono,
    fontSize: 9,
    color: Colors.gray,
    marginTop: 1,
  },
  hoverHint: {
    fontFamily: FontFamily.mono,
    fontSize: FontSize.xs,
    color: Colors.gray,
    backgroundColor: Colors.paperDim,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: Colors.line,
  },

  // ── Chart
  chartWrap: {
    width: '100%',
    height: CHART_H,
    marginTop: 4,
  },
});
