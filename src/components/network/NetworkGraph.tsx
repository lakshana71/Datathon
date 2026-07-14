import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Circle, Line, G, Text as SvgText } from 'react-native-svg';
import * as d3 from 'd3-force';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle } from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type Node = {
  id: string;
  group: string;
  label: string;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
  vx?: number;
  vy?: number;
};

type Link = {
  source: string | Node;
  target: string | Node;
  value: number;
};

type NetworkGraphProps = {
  nodes: Node[];
  links: Link[];
  onNodePress: (node: Node) => void;
};

export const NetworkGraph: React.FC<NetworkGraphProps> = ({ nodes: initialNodes, links: initialLinks, onNodePress }) => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [links, setLinks] = useState<Link[]>([]);
  const simulationRef = useRef<d3.Simulation<Node, Link> | null>(null);

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const offsetX = useSharedValue(0);
  const offsetY = useSharedValue(0);
  const scale = useSharedValue(1);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      offsetX.value = translateX.value;
      offsetY.value = translateY.value;
    })
    .onUpdate((event) => {
      translateX.value = offsetX.value + event.translationX;
      translateY.value = offsetY.value + event.translationY;
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value }
      ]
    };
  });

  useEffect(() => {
    const d3Nodes = initialNodes.map(d => ({ ...d }));
    const d3Links = initialLinks.map(d => ({ ...d }));

    const simulation = d3.forceSimulation(d3Nodes)
      .force('link', d3.forceLink(d3Links).id((d: any) => d.id).distance(110))
      .force('charge', d3.forceManyBody().strength(-400))
      .force('center', d3.forceCenter(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2))
      .on('tick', () => {
        setNodes([...d3Nodes]);
        setLinks([...d3Links]);
      });

    simulationRef.current = simulation;
    return () => {
      simulation.stop();
    };
  }, [initialNodes, initialLinks]);

  const getColor = (group: string) => {
    switch (group) {
      case 'person': return '#ff4757'; // red
      case 'phone': return '#1e90ff';  // blue
      case 'vehicle': return '#ffa502'; // orange
      case 'fir': return '#2ed573'; // green
      case 'account': return '#eccc68'; // yellow
      default: return '#ffffff';
    }
  };

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.container, animatedStyle]}>
        <Svg width="100%" height="100%">
          <G>
            {links.map((link, index) => {
              const source = link.source as Node;
              const target = link.target as Node;
              return (
                <Line
                  key={`link-${index}`}
                  x1={source.x || 0}
                  y1={source.y || 0}
                  x2={target.x || 0}
                  y2={target.y || 0}
                  stroke="#57606f"
                  strokeWidth="1.5"
                  opacity={0.6}
                />
              );
            })}
            {nodes.map((node) => (
              <G key={`node-${node.id}`} x={node.x || 0} y={node.y || 0} onPress={() => onNodePress(node)}>
                <Circle r="20" fill={getColor(node.group)} stroke="#2f3542" strokeWidth="2" />
                <SvgText y="32" fontSize="12" fill="#dfe4ea" textAnchor="middle" fontWeight="bold">
                  {node.label}
                </SvgText>
              </G>
            ))}
          </G>
        </Svg>
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});
