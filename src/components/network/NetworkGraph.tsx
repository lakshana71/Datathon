// CrimeSphere AI — NetworkGraph SVG Component
// Preserves the exact SVG network graph from the HTML prototype
import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import Svg, { Circle, Line, Text as SvgText } from 'react-native-svg';
import { Colors } from '../../constants/colors';
import type { NetworkNode, NetworkEdge } from '../../types';

interface NetworkGraphProps {
  nodes: NetworkNode[];
  edges: NetworkEdge[];
  width?: number;
  height?: number;
  onNodePress?: (nodeId: string) => void;
}

export const NetworkGraph: React.FC<NetworkGraphProps> = ({
  nodes,
  edges,
  width = 560,
  height = 440,
  onNodePress,
}) => {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ minWidth: width }}
      >
        <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
          {/* Edges */}
          {edges.map((edge) => {
            const fromNode = nodes.find((n) => n.id === edge.from);
            const toNode = nodes.find((n) => n.id === edge.to);
            if (!fromNode || !toNode) return null;
            return (
              <Line
                key={edge.id}
                x1={fromNode.x}
                y1={fromNode.y}
                x2={toNode.x}
                y2={toNode.y}
                stroke={edge.color}
                strokeWidth={edge.width}
              />
            );
          })}
          {/* Nodes */}
          {nodes.map((node) => (
            <React.Fragment key={node.id}>
              <Circle
                cx={node.x}
                cy={node.y}
                r={node.radius}
                fill={node.color}
                onPress={() => onNodePress?.(node.id)}
              />
              <SvgText
                x={node.x}
                y={node.y + 4}
                textAnchor="middle"
                fill="#fff"
                fontFamily="monospace"
                fontSize={node.radius > 20 ? 10 : 9}
              >
                {node.label}
              </SvgText>
            </React.Fragment>
          ))}
        </Svg>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: 10,
    overflow: 'hidden',
    flex: 1,
    minHeight: 320,
  },
});
