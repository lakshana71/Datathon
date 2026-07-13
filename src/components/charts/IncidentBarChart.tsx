// CrimeSphere AI — IncidentBarChart Component
// Custom native bar chart layout matching the HTML prototype
import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Colors } from '../../constants/colors';
import { FontFamily, FontSize } from '../../constants/typography';
import type { BarDataPoint } from '../../types';

interface IncidentBarChartProps {
  data: BarDataPoint[];
  title?: string;
  subtitle?: string;
}

export const IncidentBarChart: React.FC<IncidentBarChartProps> = ({
  data,
  title,
  subtitle,
}) => {
  return (
    <View style={styles.container}>
      {title && (
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      )}
      <SimpleBars data={data} />
    </View>
  );
};


// Simple CSS-style fallback bar chart (no external deps)
export const SimpleBars: React.FC<{ data: BarDataPoint[] }> = ({ data }) => {
  const maxVal = Math.max(...data.map((d) => d.y), 1);
  return (
    <View style={simpleStyles.bars}>
      {data.map((d, i) => {
        const isLast = i === data.length - 1;
        const heightPct = (d.y / maxVal) * 110;
        return (
          <View key={d.x} style={simpleStyles.col}>
            <View
              style={[
                simpleStyles.fill,
                { height: heightPct, backgroundColor: isLast ? Colors.red : Colors.steelLight },
              ]}
            />
            <Text style={simpleStyles.day}>{d.x}</Text>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontFamily: FontFamily.display,
    fontSize: FontSize.xl,
    fontWeight: '600',
    color: Colors.inkNavy,
  },
  subtitle: {
    fontFamily: FontFamily.mono,
    fontSize: FontSize.xs,
    color: Colors.gray,
  },
});

const simpleStyles = StyleSheet.create({
  bars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    height: 130,
    marginTop: 8,
    paddingBottom: 4,
  },
  col: {
    flex: 1,
    alignItems: 'center',
    gap: 5,
    justifyContent: 'flex-end',
  },
  fill: {
    width: '80%',
    borderRadius: 4,
    minHeight: 4,
  },
  day: {
    fontFamily: FontFamily.mono,
    fontSize: FontSize.xs,
    color: Colors.gray,
  },
});
