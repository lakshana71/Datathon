// CrimeSphere AI — CrimeMapScreen (Jurisdiction-Aware Operational Map)
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Animated,
  Image,
  Platform,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, {
  Path,
  Circle,
  Rect,
  Text as SvgText,
  Defs,
  RadialGradient,
  Stop,
  G,
  Polygon,
  Polyline,
} from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import type { DrawerNavigationProp } from '@react-navigation/drawer';
import type { DrawerParamList } from '../../types/navigation';
import { Colors } from '../../constants/colors';
import { FontFamily, FontSize } from '../../constants/typography';
import { useAuthStore } from '../../store/authStore';
import { MOCK_OFFICER, MOCK_CASES } from '../../constants/mockData';

// ─── Types ────────────────────────────────────────────────────────────────────
type SimulatedRank = 'Inspector' | 'ACP' | 'DCP' | 'Commissioner';

interface MapAsset {
  id: string;
  type: 'station' | 'patrol' | 'cctv' | 'checkpoint' | 'incident' | 'fir';
  label: string;
  x: number;
  y: number;
  status?: string;
  details?: Record<string, any>;
  severity?: 'red' | 'amber' | 'green';
}

interface CrimeHotspot {
  id: string;
  name: string;
  severity: 'red' | 'amber' | 'green';
  x: number;
  y: number;
  radius: number;
  firCount: number;
  crimeTypes: string;
  riskLevel: string;
  recentIncidents: string[];
  nearbyPatrols: string[];
}

interface BoundaryRegion {
  id: string;
  name: string;
  points: string;
  fillColor: string;
  borderColor: string;
  labelX: number;
  labelY: number;
}

interface MapRoad {
  id: string;
  points: string;
  width: number;
  isHighway?: boolean;
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export const CrimeMapScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<DrawerNavigationProp<DrawerParamList>>();
  const { officer } = useAuthStore();

  // Active simulated rank (Defaults to Inspector based on Kumaraswamy's role, but fully togglable)
  const [activeRank, setActiveRank] = useState<SimulatedRank>('Inspector');

  // Layer filters
  const [activeLayers, setActiveLayers] = useState<Record<string, boolean>>({
    hotspots: true,
    fir: true,
    patrol: true,
    cctv: true,
    checkpoint: true,
    station: true,
    incident: true,
  });

  // Selected item states
  const [selectedPatrol, setSelectedPatrol] = useState<any>(null);
  const [selectedHotspot, setSelectedHotspot] = useState<CrimeHotspot | null>(null);
  const [selectedCctv, setSelectedCctv] = useState<any>(null);
  const [selectedCheckpoint, setSelectedCheckpoint] = useState<any>(null);
  const [selectedIncident, setSelectedIncident] = useState<any>(null);
  const [selectedFir, setSelectedFir] = useState<any>(null);

  // Secure Communications dialog overlay
  const [commsTarget, setCommsTarget] = useState<string | null>(null);
  const [commsCountdown, setCommsCountdown] = useState(3);
  const commsTimer = useRef<any>(null);

  // Live CCTV modal video noise
  const [cctvFrame, setCctvFrame] = useState(0);
  const cctvTimer = useRef<any>(null);

  // Route overlay on the map
  const [highlightRouteId, setHighlightRouteId] = useState<string | null>(null);

  // UI Animations
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const overlayFade = useRef(new Animated.Value(0)).current;

  // Pulse effect for hotspots and active incidents
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1.0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, []);

  // Animate CCTV static noise frame
  useEffect(() => {
    if (selectedCctv) {
      cctvTimer.current = setInterval(() => {
        setCctvFrame((prev) => (prev + 1) % 4);
      }, 150);
    } else {
      if (cctvTimer.current) clearInterval(cctvTimer.current);
      setCctvFrame(0);
    }
    return () => {
      if (cctvTimer.current) clearInterval(cctvTimer.current);
    };
  }, [selectedCctv]);

  // Secure comms call countdown effect
  useEffect(() => {
    if (commsTarget) {
      setCommsCountdown(3);
      commsTimer.current = setInterval(() => {
        setCommsCountdown((prev) => {
          if (prev <= 1) {
            if (commsTimer.current) clearInterval(commsTimer.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (commsTimer.current) clearInterval(commsTimer.current);
    }
    return () => {
      if (commsTimer.current) clearInterval(commsTimer.current);
    };
  }, [commsTarget]);

  // Reset selected telemetry cards when swapping jurisdictions
  const handleRankChange = (rank: SimulatedRank) => {
    setActiveRank(rank);
    setSelectedPatrol(null);
    setSelectedHotspot(null);
    setSelectedCctv(null);
    setSelectedCheckpoint(null);
    setSelectedIncident(null);
    setSelectedFir(null);
    setHighlightRouteId(null);
  };

  // Toggle specific layers
  const toggleLayer = (layer: string) => {
    setActiveLayers((prev) => ({ ...prev, [layer]: !prev[layer] }));
    // Deselect if layer is hidden
    if (layer === 'patrol') { setSelectedPatrol(null); setHighlightRouteId(null); }
    if (layer === 'hotspots') setSelectedHotspot(null);
    if (layer === 'cctv') setSelectedCctv(null);
    if (layer === 'checkpoint') setSelectedCheckpoint(null);
    if (layer === 'incident') setSelectedIncident(null);
    if (layer === 'fir') setSelectedFir(null);
  };

  // Start Call Simulation
  const triggerComms = (targetName: string) => {
    setCommsTarget(targetName);
  };

  // ─── Real Bangalore Geographic Data (pixel-calibrated to Bengaluru_map.png 874×1122) ───
  // All x/y coordinates are pixel positions on the 874×1122 Bengaluru_map.png image.
  // The SVG overlay uses viewBox="0 0 874 1122" to match the image exactly.

  // 1. BOUNDARIES — Real Bengaluru Police District Zones
  const BOUNDARIES: Record<SimulatedRank, BoundaryRegion[]> = {
    // Inspector level: Whitefield PS beat sectors — pixel coords on Bengaluru_map.png (874×1122)
    Inspector: [
      {
        id: 'sec-hoodi',
        name: 'Hoodi Beat',
        // Hoodi junction area on map
        points: '590,530 640,490 700,520 680,590 620,600 590,530',
        fillColor: '#B5811A0C',
        borderColor: Colors.amber,
        labelX: 645,
        labelY: 550,
      },
      {
        id: 'sec-itpl',
        name: 'ITPL Beat',
        // ITPL / Whitefield area
        points: '680,470 760,440 800,520 770,600 700,580 680,470',
        fillColor: '#3C4E6E12',
        borderColor: Colors.steel,
        labelX: 740,
        labelY: 525,
      },
      {
        id: 'sec-marathahalli',
        name: 'Marathahalli Beat',
        // Marathahalli bridge area
        points: '600,590 680,580 710,670 640,700 580,660 600,590',
        fillColor: '#B23A2E0A',
        borderColor: Colors.red,
        labelX: 650,
        labelY: 645,
      },
      {
        id: 'sec-varthur',
        name: 'Varthur Beat',
        // Varthur lake area
        points: '700,580 780,550 820,650 770,720 700,690 700,580',
        fillColor: '#3F6B4F0F',
        borderColor: Colors.green,
        labelX: 760,
        labelY: 640,
      },
    ],
    // ACP level: Whitefield Sub-Division circles
    ACP: [
      {
        id: 'c-whitefield',
        name: 'Whitefield Circle',
        // Eastern Whitefield sub-division
        points: '580,460 800,400 840,680 710,720 580,660 580,460',
        fillColor: '#14213D08',
        borderColor: Colors.inkNavy,
        labelX: 710,
        labelY: 565,
      },
      {
        id: 'c-mahadevapura',
        name: 'Mahadevapura Circle',
        // Mahadevapura / Hoodi / Kadugodi
        points: '490,440 580,420 580,580 490,600 430,530 490,440',
        fillColor: '#B5811A0C',
        borderColor: Colors.amber,
        labelX: 520,
        labelY: 515,
      },
      {
        id: 'c-krpuram',
        name: 'KR Puram Circle',
        // KR Puram railway area
        points: '540,380 650,350 680,470 590,500 510,460 540,380',
        fillColor: '#B23A2E0A',
        borderColor: Colors.red,
        labelX: 600,
        labelY: 430,
      },
      {
        id: 'c-hal',
        name: 'HAL / Old Airport Circle',
        // HAL / Indiranagar
        points: '410,490 510,460 520,590 430,620 360,560 410,490',
        fillColor: '#3F6B4F0C',
        borderColor: Colors.green,
        labelX: 460,
        labelY: 545,
      },
    ],
    // DCP level: Bengaluru East Sub-Divisions
    DCP: [
      {
        id: 'd-east-subdiv',
        name: 'East Sub-Division (Whitefield)',
        points: '530,340 840,300 860,740 700,780 530,700 530,340',
        fillColor: '#14213D0C',
        borderColor: Colors.inkNavy,
        labelX: 700,
        labelY: 540,
      },
      {
        id: 'd-central-subdiv',
        name: 'Central Sub-Division (HAL/Indiranagar)',
        points: '290,390 530,350 530,700 390,740 260,650 290,390',
        fillColor: '#B5811A0A',
        borderColor: Colors.amber,
        labelX: 420,
        labelY: 540,
      },
      {
        id: 'd-south-subdiv',
        name: 'South-East Sub-Division (Koramangala)',
        points: '330,710 600,680 640,900 480,950 290,870 330,710',
        fillColor: '#B23A2E0A',
        borderColor: Colors.red,
        labelX: 470,
        labelY: 800,
      },
    ],
    // Commissioner level: Bengaluru Police District Zones
    Commissioner: [
      {
        id: 'z-north',
        name: 'North District',
        // North: Yelahanka, Hebbal, Thanisandra
        points: '160,130 550,80 600,380 440,420 250,400 140,300 160,130',
        fillColor: '#3C4E6E0A',
        borderColor: Colors.steel,
        labelX: 390,
        labelY: 250,
      },
      {
        id: 'z-east',
        name: 'East District (Bengaluru East)',
        // East: Whitefield, KR Puram, Marathahalli
        points: '530,340 840,300 870,750 660,800 530,720 530,340',
        fillColor: '#14213D0E',
        borderColor: Colors.inkNavy,
        labelX: 700,
        labelY: 540,
      },
      {
        id: 'z-south',
        name: 'South District',
        // South: Koramangala, Jayanagar, Electronic City
        points: '260,700 640,660 700,1000 500,1060 240,980 260,700',
        fillColor: '#B23A2E08',
        borderColor: Colors.red,
        labelX: 480,
        labelY: 860,
      },
      {
        id: 'z-west',
        name: 'West District',
        // West: Rajajinagar, Yeshwanthpur, Peenya, Kengeri
        points: '100,300 250,290 300,700 170,780 70,620 100,300',
        fillColor: '#3F6B4F0A',
        borderColor: Colors.green,
        labelX: 185,
        labelY: 540,
      },
      {
        id: 'z-central',
        name: 'Central District',
        // Central: MG Road, Shivajinagar, Cubbon Park, Majestic
        points: '250,400 530,350 530,700 330,740 240,660 250,400',
        fillColor: '#B5811A0A',
        borderColor: Colors.amber,
        labelX: 390,
        labelY: 550,
      },
    ],
  };

  // 2. ROADS — Not drawn: real roads are visible on Bengaluru_map.png background
  // Kept as empty arrays to satisfy type requirements
  const ROADS: Record<SimulatedRank, MapRoad[]> = {
    Inspector: [],
    ACP: [],
    DCP: [],
    Commissioner: [],
  };

  // 3. HOTSPOTS — Real Bangalore Crime Hotspot Locations (pixel coords on 874×1122 map)
  const HOTSPOTS: Record<SimulatedRank, CrimeHotspot[]> = {
    Inspector: [
      {
        id: 'h-hoodi',
        name: 'Hoodi Circle Junction',
        severity: 'red',
        // Hoodi Circle on map image
        x: 628,
        y: 554,
        radius: 42,
        firCount: 4,
        crimeTypes: 'Snatching (75%), Vehicle Theft (25%)',
        riskLevel: 'Critical Risk Level (High)',
        recentIncidents: [
          'FIR KA-CR-1142: Gold chain snatched near Hoodi bus stop (2h ago)',
          'FIR KA-CR-1098: Snatching near Hoodi Lake gate (1d ago)',
          'Compl-104: Two-wheeler theft outside Hoodi hotel (2d ago)',
        ],
        nearbyPatrols: ['PCR-14 (120m away) - On Patrol', 'PCR-09 (450m away) - Responding'],
      },
      {
        id: 'h-itpl',
        name: 'ITPL Main Road Parking Zone',
        severity: 'amber',
        // ITPL area on map image
        x: 735,
        y: 498,
        radius: 36,
        firCount: 2,
        crimeTypes: 'Vehicle Theft (100%)',
        riskLevel: 'Moderate Warning (Medium)',
        recentIncidents: [
          'FIR KA-CR-1149: Pulsar motorcycle stolen from ITPL basement (1d ago)',
          'Compl-189: Bicycle theft from campus cycle dock (4d ago)',
        ],
        nearbyPatrols: ['PCR-09 (180m away) - Responding'],
      },
      {
        id: 'h-marathahalli',
        name: 'Marathahalli Bridge Junction',
        severity: 'amber',
        // Marathahalli on map image
        x: 648,
        y: 638,
        radius: 34,
        firCount: 3,
        crimeTypes: 'Assault (66%), Snatching (34%)',
        riskLevel: 'Moderate Warning (Medium)',
        recentIncidents: [
          'FIR KA-CR-1076: Pedestrian assaulted on Marathahalli flyover ramp (3d ago)',
          'FIR KA-CR-1138: Brawl near Marathahalli bridge (5d ago)',
        ],
        nearbyPatrols: ['PCR-03 (90m away) - Available'],
      },
    ],
    ACP: [
      {
        id: 'h-whitefield-cluster',
        name: 'Whitefield Central (EPIP Zone)',
        severity: 'red',
        // Whitefield on map image
        x: 746,
        y: 556,
        radius: 52,
        firCount: 9,
        crimeTypes: 'Chain Snatching (50%), Cyber Fraud (30%), Assault (20%)',
        riskLevel: 'Critical Risk Level (High)',
        recentIncidents: [
          'FIR 1142: Chain snatching near Hoodi Circle (2h ago)',
          'FIR 1156: Loan app harassment complaint (1d ago)',
        ],
        nearbyPatrols: ['PCR-14 - On Patrol', 'PCR-09 - Responding'],
      },
      {
        id: 'h-mahadevapura',
        name: 'Mahadevapura IT Hub',
        severity: 'red',
        // Mahadevapura on map image
        x: 580,
        y: 510,
        radius: 45,
        firCount: 7,
        crimeTypes: 'Cyber Fraud (80%), Extortion (20%)',
        riskLevel: 'Critical Risk Level (High)',
        recentIncidents: [
          'Cyber Complaint: Fake call center hub busted near Mahadevapura (1d ago)',
          'Extortion: IT merchant threatened by local gang (3d ago)',
        ],
        nearbyPatrols: ['PCR-05 - Available'],
      },
      {
        id: 'h-varthur-lake',
        name: 'Varthur Lake Area',
        severity: 'amber',
        // Varthur lake on map image
        x: 770,
        y: 654,
        radius: 38,
        firCount: 4,
        crimeTypes: 'Illegal Dumping (60%), Vehicle Theft (40%)',
        riskLevel: 'Moderate Warning (Medium)',
        recentIncidents: ['Enviro-Alert: Chemical truck dumping in Varthur Lake (4h ago)'],
        nearbyPatrols: ['PCR-21 - On Patrol'],
      },
    ],
    DCP: [
      {
        id: 'h-whitefield-dist',
        name: 'Whitefield Tech Corridor',
        severity: 'red',
        // Whitefield corridor on map image
        x: 740,
        y: 570,
        radius: 62,
        firCount: 18,
        crimeTypes: 'Property Crime (45%), Cyber Crime (40%), Bodily Harm (15%)',
        riskLevel: 'Critical Risk Level (High)',
        recentIncidents: ['High volume of tech corridor property crimes in Whitefield–ITPL stretch.'],
        nearbyPatrols: ['6 active PCR units in vicinity'],
      },
      {
        id: 'h-krpuram',
        name: 'KR Puram Railway Junction',
        severity: 'red',
        // KR Puram on map image
        x: 598,
        y: 460,
        radius: 48,
        firCount: 14,
        crimeTypes: 'Pickpocketing (60%), Luggage Theft (40%)',
        riskLevel: 'Critical Risk Level (High)',
        recentIncidents: ['Active gangs flagged around KR Puram railway/bus stations.'],
        nearbyPatrols: ['4 active PCR units in vicinity'],
      },
      {
        id: 'h-indiranagar',
        name: 'Indiranagar 100 Feet Road',
        severity: 'amber',
        // Indiranagar on map image
        x: 518,
        y: 582,
        radius: 36,
        firCount: 8,
        crimeTypes: 'Drunk Driving (50%), Snatching (30%), Assault (20%)',
        riskLevel: 'Moderate Warning (Medium)',
        recentIncidents: ['Weekend night incidents rising near Indiranagar pubs.'],
        nearbyPatrols: ['PCR-11 - On Patrol'],
      },
    ],
    Commissioner: [
      {
        id: 'h-east-zone',
        name: 'East Zone — Whitefield/Marathahalli Cluster',
        severity: 'red',
        // East zone on map image
        x: 700,
        y: 590,
        radius: 80,
        firCount: 36,
        crimeTypes: 'Cyber Fraud (40%), Snatching (30%), Burglary (30%)',
        riskLevel: 'Critical Risk Level (High)',
        recentIncidents: ['City-wide cyber fraud center coordinates identified in East District (Whitefield area).'],
        nearbyPatrols: ['18 patrol vehicles active in East Zone'],
      },
      {
        id: 'h-south-zone',
        name: 'South Zone — Koramangala/BTM Layout',
        severity: 'red',
        // Koramangala on map image
        x: 512,
        y: 742,
        radius: 60,
        firCount: 28,
        crimeTypes: 'Robbery (35%), Drug Offences (30%), Vehicle Theft (35%)',
        riskLevel: 'Critical Risk Level (High)',
        recentIncidents: ['Coordinated robbery spree in Koramangala-BTM Layout belt.'],
        nearbyPatrols: ['14 patrol vehicles active in South Zone'],
      },
      {
        id: 'h-central',
        name: 'Central — MG Road / Shivajinagar',
        severity: 'amber',
        // MG Road on map image
        x: 470,
        y: 624,
        radius: 55,
        firCount: 22,
        crimeTypes: 'Traffic Altercations (50%), Snatching (50%)',
        riskLevel: 'Moderate Warning (Medium)',
        recentIncidents: ['Peak hour traffic incidents & pickpocketing near MG Road metro.'],
        nearbyPatrols: ['12 patrol vehicles active in Central Zone'],
      },
    ],
  };

  // 4. MAP ASSETS — Real Bangalore Police Stations (pixel coords on 874×1122 Bengaluru_map.png)
  const ASSETS: Record<SimulatedRank, MapAsset[]> = {
    Inspector: [
      // Whitefield PS (near Whitefield on map)
      { id: 'ps-wf', type: 'station', label: 'Whitefield PS', x: 710, y: 578,
        details: { name: 'Whitefield Police Station', inCharge: 'Insp. R. Kumaraswamy', staff: '32 Personnel', phone: '+91-80-2845-0001' } },
      // Hoodi checkpoint
      { id: 'chk-hoodi', type: 'checkpoint', label: 'Hoodi Chk', x: 612, y: 538,
        status: 'Active Search', details: { name: 'Hoodi Circle Checkpoint', dutyOfficer: 'HC Prakash', status: 'Active Barricading', vehiclesScreened: 142 } },
      // ITPL Gate
      { id: 'chk-itpl', type: 'checkpoint', label: 'ITPL Gate', x: 748, y: 480,
        status: 'Manned', details: { name: 'ITPL North Gate Point', dutyOfficer: 'PC Gowda', status: 'Routine Watch', vehiclesScreened: 89 } },
      // CCTVs
      { id: 'cctv-101', type: 'cctv', label: 'CCTV-101', x: 625, y: 565,
        status: 'Online', details: { id: 'CCTV-101', area: 'Hoodi Junction West', status: 'Online', resolution: '4K Dome', rotation: 'Panning' } },
      { id: 'cctv-102', type: 'cctv', label: 'CCTV-102', x: 748, y: 495,
        status: 'Online', details: { id: 'CCTV-102', area: 'ITPL Tech Park Entry Gate', status: 'Online', resolution: '1080p Dome', rotation: 'Static North' } },
      { id: 'cctv-103', type: 'cctv', label: 'CCTV-103', x: 645, y: 650,
        status: 'Online', details: { id: 'CCTV-103', area: 'Marathahalli Flyover East', status: 'Online', resolution: '4K Traffic Cam', rotation: 'Panning' } },
      // Incidents
      { id: 'inc-1', type: 'incident', label: 'Chain Snatching', x: 620, y: 548, severity: 'red',
        details: { title: 'Red Alert: Chain Snatching', reporter: 'Lakshmi N.', time: '2 mins ago', details: 'Two suspects on a black Pulsar snatched gold chain near Hoodi Bus Stop. Fled towards Hoodi Junction.' } },
      { id: 'inc-2', type: 'incident', label: 'Vehicle Theft', x: 742, y: 490, severity: 'amber',
        details: { title: 'Amber Alert: Vehicle Theft', reporter: 'R. Fernandes', time: '11 mins ago', details: 'Motorcycle stolen from ITPL basement parking. Guard reported black helmet rider.' } },
      // FIRs
      { id: 'fir-1142', type: 'fir', label: 'FIR 1142', x: 608, y: 560,
        details: { firNo: 'KA-CR-1142', title: 'Chain snatching — Hoodi Circle', date: '07 Jul 2026', officer: 'SI Manjunath', complainant: 'Lakshmi N.' } },
      { id: 'fir-1149', type: 'fir', label: 'FIR 1149', x: 740, y: 505,
        details: { firNo: 'KA-CR-1149', title: 'Vehicle theft — ITPL Parking', date: '05 Jul 2026', officer: 'HC Prakash', complainant: 'R. Fernandes' } },
      // Patrol units
      {
        id: 'PCR-14', type: 'patrol', label: 'PCR-14', x: 618, y: 552, status: 'On Patrol',
        details: {
          patrolId: 'PCR-14', vehicleNo: 'KA-03-GP-1204', dutyOfficer: 'Sub-Inspector Manjunath',
          assignedCrew: 'HC Prakash, PC Gowda', status: 'On Patrol', shift: '08:00 - 20:00 (Day Shift)',
          lastUpdated: '1 min ago (GPS Lock)', area: 'Hoodi–Whitefield Beat',
          phone: '+91-98450-12345', route: '618,552 628,565 612,540 618,552',
        },
      },
      {
        id: 'PCR-09', type: 'patrol', label: 'PCR-09', x: 738, y: 488, status: 'Responding',
        details: {
          patrolId: 'PCR-09', vehicleNo: 'KA-03-GP-5512', dutyOfficer: 'SI Deepa R.',
          assignedCrew: 'HC Mahesh, PC Harish', status: 'Responding', shift: '08:00 - 20:00 (Day Shift)',
          lastUpdated: 'Just now (Active Siren)', area: 'ITPL–Kadugodi Beat',
          phone: '+91-98450-55122', route: '738,488 748,498 735,498 738,488',
        },
      },
      {
        id: 'PCR-03', type: 'patrol', label: 'PCR-03', x: 640, y: 648, status: 'Available',
        details: {
          patrolId: 'PCR-03', vehicleNo: 'KA-03-GP-9833', dutyOfficer: 'HC Nagaraj',
          assignedCrew: 'PC Anand, PC Somesh', status: 'Available', shift: '08:00 - 20:00 (Day Shift)',
          lastUpdated: '4 mins ago (Stationary)', area: 'Marathahalli Beat',
          phone: '+91-98450-98334', route: '640,648 648,638 635,650 640,648',
        },
      },
    ],
    ACP: [
      { id: 'ps-wf', type: 'station', label: 'Whitefield PS', x: 710, y: 578 },
      { id: 'ps-varthur', type: 'station', label: 'Varthur PS', x: 778, y: 664 },
      { id: 'ps-kadugodi', type: 'station', label: 'Kadugodi PS', x: 748, y: 460 },
      { id: 'ps-mahadevapura', type: 'station', label: 'Mahadevapura PS', x: 574, y: 516 },
      { id: 'ps-krpuram', type: 'station', label: 'KR Puram PS', x: 600, y: 460 },
      { id: 'chk-east', type: 'checkpoint', label: 'Varthur Border Chk', x: 820, y: 660, status: 'Active Guarding' },
      { id: 'inc-acp-1', type: 'incident', label: 'Cyber Syndicate Flagged', x: 574, y: 510, severity: 'red' },
      {
        id: 'PCR-14', type: 'patrol', label: 'PCR-14', x: 640, y: 545, status: 'On Patrol',
        details: {
          patrolId: 'PCR-14', vehicleNo: 'KA-03-GP-1204', dutyOfficer: 'Sub-Inspector Manjunath',
          assignedCrew: 'HC Prakash, PC Gowda', status: 'On Patrol', shift: '08:00 - 20:00 (Day Shift)',
          lastUpdated: '1 min ago (GPS Lock)', area: 'Whitefield Circle', phone: '+91-98450-12345',
          route: '640,545 710,578 748,460 640,545',
        },
      },
      {
        id: 'PCR-21', type: 'patrol', label: 'PCR-21', x: 772, y: 660, status: 'On Patrol',
        details: {
          patrolId: 'PCR-21', vehicleNo: 'KA-03-GP-7721', dutyOfficer: 'SI Shivakumar',
          assignedCrew: 'HC Swamy, PC Venkatesh', status: 'On Patrol', shift: '20:00 - 08:00 (Night Shift)',
          lastUpdated: '2 mins ago (GPS Lock)', area: 'Varthur Circle', phone: '+91-98450-77211',
          route: '772,660 778,664 766,664 772,660',
        },
      },
    ],
    DCP: [
      { id: 'hq-wf-acp', type: 'station', label: 'Whitefield ACP Office', x: 710, y: 578 },
      { id: 'hq-krpuram-acp', type: 'station', label: 'KR Puram ACP Office', x: 600, y: 460 },
      { id: 'hq-hal-acp', type: 'station', label: 'HAL/Indiranagar ACP', x: 510, y: 580 },
      { id: 'hq-koramangala', type: 'station', label: 'Koramangala ACP', x: 500, y: 740 },
      { id: 'chk-hosur-toll', type: 'checkpoint', label: 'Hosur Toll Gate', x: 580, y: 920, status: 'Active Guarding' },
      { id: 'inc-dcp-1', type: 'incident', label: 'Critical Protest Blockade', x: 600, y: 455, severity: 'red' },
      {
        id: 'PCR-EAST-1', type: 'patrol', label: 'PCR-EAST-1', x: 660, y: 562, status: 'Responding',
        details: {
          patrolId: 'PCR-EAST-1', vehicleNo: 'KA-03-GP-0001', dutyOfficer: 'Inspector R. Kumaraswamy',
          assignedCrew: 'HC Somanna, PC Swamy', status: 'Responding', shift: '24 hrs (Command Coord)',
          lastUpdated: 'Just now (Coord Siren)', area: 'Whitefield–KR Puram Corridor',
          phone: '+91-80-2845-0001', route: '660,562 710,578 600,460 660,562',
        },
      },
    ],
    Commissioner: [
      // Commissioner's HQ — Cubbon Park / MG Road
      { id: 'hq-commissioner', type: 'station', label: "Commissioner's HQ", x: 466, y: 620 },
      // East District HQ — Whitefield area
      { id: 'hq-east', type: 'station', label: 'East District HQ', x: 700, y: 580 },
      // West District HQ — Rajajinagar
      { id: 'hq-west', type: 'station', label: 'West District HQ', x: 270, y: 588 },
      // South District HQ — Jayanagar
      { id: 'hq-south', type: 'station', label: 'South District HQ', x: 432, y: 756 },
      // North District HQ — Yelahanka
      { id: 'hq-north', type: 'station', label: 'North District HQ', x: 396, y: 280 },
      // Checkpoints
      { id: 'chk-hosur', type: 'checkpoint', label: 'Hosur Toll Gate', x: 584, y: 928, status: 'Active Search' },
      { id: 'chk-tumkur', type: 'checkpoint', label: 'Tumkur Road Naka', x: 204, y: 398, status: 'Manned' },
      // City-wide incident
      { id: 'inc-city-1', type: 'incident', label: 'City-wide Cyber Spike', x: 700, y: 578, severity: 'red' },
      {
        id: 'VAJRA-01', type: 'patrol', label: 'VAJRA-01', x: 466, y: 630, status: 'Available',
        details: {
          patrolId: 'VAJRA-01', vehicleNo: 'KA-03-MP-9999', dutyOfficer: 'ACP Command Liaison',
          assignedCrew: '5 SWAT Personnel', status: 'Available', shift: 'Emergency Command Duty',
          lastUpdated: '5 mins ago (GPS Active)', area: 'Central Command — Cubbon Park HQ',
          phone: '+91-99999-88888', route: '466,630 470,620 462,620 466,630',
        },
      },
    ],
  };

  // Quick statistics calculated per level
  const JURISDICTION_STATS = {
    Inspector: { area: 'Whitefield PS Circle', inCharge: 'Insp. R. Kumaraswamy', hotspots: 3, patrols: 3, checkpoints: 2, incidents: 2, cases: 4 },
    ACP: { area: 'Whitefield Sub-Division', inCharge: 'ACP Swaminathan S.', hotspots: 3, patrols: 2, checkpoints: 1, incidents: 1, cases: 16 },
    DCP: { area: 'Bengaluru East District', inCharge: 'DCP Divya Thomas IPS', hotspots: 2, patrols: 1, checkpoints: 1, incidents: 1, cases: 32 },
    Commissioner: { area: 'Bengaluru Metropolitan City', inCharge: 'Comm. B. Dayananda IPS', hotspots: 2, patrols: 1, checkpoints: 1, incidents: 1, cases: 58 },
  };

  // Helper render styling for markers
  const renderMarkerIcon = (type: string, severity?: string) => {
    switch (type) {
      case 'station':
        return '🏛️';
      case 'patrol':
        return '🚔';
      case 'cctv':
        return '📹';
      case 'checkpoint':
        return '🛑';
      case 'incident':
        return '⚠️';
      case 'fir':
        return '📁';
      default:
        return '📌';
    }
  };

  // Render color pills for statuses
  const getStatusColor = (status: string) => {
    if (status === 'On Patrol' || status === 'Online' || status === 'Manned' || status === 'Available') return Colors.green;
    if (status === 'Responding' || status === 'Active Search' || status === 'Active Barricading') return Colors.red;
    return Colors.amber;
  };

  // View Case File and navigate
  const handleViewCase = (caseId: string) => {
    navigation.navigate('CaseDetail', { caseId });
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* ── Header Row ────────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuBtn} onPress={() => navigation.openDrawer()} accessibilityLabel="Open Menu">
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.headerEyebrow}>FIELD OPERATIONS HUB · KSP</Text>
          <Text style={styles.headerTitle}>Jurisdiction Map Dashboard</Text>
        </View>
        <View style={styles.officerBadge}>
          <View style={styles.liveDot} />
          <View>
            <Text style={styles.officerName}>{officer?.name ?? 'Insp. R. Kumaraswamy'}</Text>
            <Text style={styles.officerStation}>{officer?.station ?? 'Whitefield PS'}</Text>
          </View>
        </View>
      </View>

      {/* ── Jurisdiction Selector Tabs (Simulates different levels of logged-in officer) ── */}
      <View style={styles.tabBar}>
        <Text style={styles.tabBarLabel}>Simulate Jurisdiction Scope:</Text>
        <View style={styles.tabRow}>
          {(['Inspector', 'ACP', 'DCP', 'Commissioner'] as SimulatedRank[]).map((rank) => {
            const active = activeRank === rank;
            let label = '';
            if (rank === 'Inspector') label = '👮 Circle (Inspector)';
            if (rank === 'ACP') label = '🏢 Sub-Div (ACP)';
            if (rank === 'DCP') label = '🛡️ District (DCP)';
            if (rank === 'Commissioner') label = '🗺️ City (Commissioner)';

            return (
              <Pressable
                key={rank}
                style={[styles.tabItem, active && styles.tabItemActive]}
                onPress={() => handleRankChange(rank)}
              >
                <Text style={[styles.tabText, active && styles.tabTextActive]}>{label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* ── Main Container ─────────────────────────────────────────────────────── */}
      <View style={styles.mainContainer}>
        <View style={styles.dashboardGrid}>
          {/* ── Left Sidebar: Stats & Layer Controls (its own scroll) ───────── */}
          <ScrollView
            style={styles.sidebarPanel}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.sidebarContent}
          >
            {/* Stats Card */}
            <View style={styles.statsCard}>
              <Text style={styles.sidebarSectionTitle}>
                {JURISDICTION_STATS[activeRank].area} Summary
              </Text>
              <View style={styles.inChargeRow}>
                <Text style={styles.inChargeLabel}>Commander: </Text>
                <Text style={styles.inChargeValue}>{JURISDICTION_STATS[activeRank].inCharge}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.statGrid}>
                <View style={styles.statBox}>
                  <Text style={styles.statVal}>{JURISDICTION_STATS[activeRank].hotspots}</Text>
                  <Text style={styles.statLbl}>Hotspots</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statVal}>{JURISDICTION_STATS[activeRank].patrols}</Text>
                  <Text style={styles.statLbl}>Patrols</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statVal}>{JURISDICTION_STATS[activeRank].checkpoints}</Text>
                  <Text style={styles.statLbl}>Checkpoints</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statVal}>{JURISDICTION_STATS[activeRank].incidents}</Text>
                  <Text style={styles.statLbl}>Incidents</Text>
                </View>
              </View>
            </View>

            {/* Layer Control Card */}
            <View style={styles.layersCard}>
              <Text style={styles.sidebarSectionTitle}>Map Layer Visibility</Text>
              <View style={styles.layerCheckboxList}>
                {[
                  { key: 'hotspots', label: '🔴 Crime Hotspots Heatmap' },
                  { key: 'fir', label: '📁 Case File Pins (FIRs)' },
                  { key: 'patrol', label: '🚔 Patrol Units Live GPS' },
                  { key: 'incident', label: '⚠️ Active Incidents' },
                  { key: 'cctv', label: '📹 CCTV Cameras' },
                  { key: 'checkpoint', label: '🛑 Border Checkpoints' },
                  { key: 'station', label: '🏛️ Police Stations/HQs' },
                ].map((layer) => (
                  <TouchableOpacity
                    key={layer.key}
                    style={styles.layerCheckboxRow}
                    onPress={() => toggleLayer(layer.key)}
                  >
                    <View style={[styles.checkbox, activeLayers[layer.key] && styles.checkboxActive]}>
                      {activeLayers[layer.key] && <Text style={styles.checkboxCheck}>✓</Text>}
                    </View>
                    <Text style={styles.layerCheckboxLabel}>{layer.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          {/* ── Main Map Canvas Panel ────────────────────────────────────────── */}
          <View style={styles.mapContainer}>
            <View style={styles.mapHeaderRow}>
              <View style={styles.mapStatusPill}>
                <View style={styles.pulsingLiveDot} />
                <Text style={styles.mapStatusText}>
                  LIVE SECURE FEED · {JURISDICTION_STATS[activeRank].area.toUpperCase()}
                </Text>
              </View>
              <Text style={styles.mapHintText}>Tap any marker for detailed telemetry and operations</Text>
            </View>

            {/* Map Canvas — Bengaluru_map.png with scrollable SVG overlay */}
            <View style={styles.canvasFrame}>
              {/* Scrollable map area — nestedScrollEnabled for Android */}
              <ScrollView
                style={styles.mapScrollView}
                contentContainerStyle={styles.mapScrollContent}
                showsVerticalScrollIndicator={true}
                showsHorizontalScrollIndicator={false}
                nestedScrollEnabled={true}
                bounces={false}
              >
                {/* Real Bengaluru map image — rendered at natural aspect ratio */}
                <View style={styles.mapImageWrapper}>
                  <Image
                    source={require('../../../Bengaluru_map.png')}
                    style={styles.mapBaseImage}
                    resizeMode="stretch"
                  />
                  {/* SVG overlay — viewBox matches image 874×1122, sits exactly on top */}
                  <Svg viewBox="0 0 874 1122" style={StyleSheet.absoluteFill}>
                    {/* Defs block for heatmap gradients */}
                    <Defs>
                      <RadialGradient id="redHeat" cx="50%" cy="50%" r="50%">
                        <Stop offset="0%" stopColor={Colors.red} stopOpacity="0.65" />
                        <Stop offset="50%" stopColor={Colors.red} stopOpacity="0.3" />
                        <Stop offset="100%" stopColor={Colors.red} stopOpacity="0" />
                      </RadialGradient>
                      <RadialGradient id="amberHeat" cx="50%" cy="50%" r="50%">
                        <Stop offset="0%" stopColor={Colors.amber} stopOpacity="0.65" />
                        <Stop offset="50%" stopColor={Colors.amber} stopOpacity="0.28" />
                        <Stop offset="100%" stopColor={Colors.amber} stopOpacity="0" />
                      </RadialGradient>
                      <RadialGradient id="greenHeat" cx="50%" cy="50%" r="50%">
                        <Stop offset="0%" stopColor={Colors.green} stopOpacity="0.6" />
                        <Stop offset="50%" stopColor={Colors.green} stopOpacity="0.25" />
                        <Stop offset="100%" stopColor={Colors.green} stopOpacity="0" />
                      </RadialGradient>
                    </Defs>

                    {/* ─────────────────────────────────────────────────────────── */}
                    {/* HOTSPOT HEATMAPS — semi-transparent radial glow circles      */}
                    {/* These are clearly crime-data overlays, not map features        */}
                    {/* ─────────────────────────────────────────────────────────── */}
                    {activeLayers.hotspots &&
                      HOTSPOTS[activeRank].map((hotspot) => {
                        const grad =
                          hotspot.severity === 'red'
                            ? 'url(#redHeat)'
                            : hotspot.severity === 'amber'
                            ? 'url(#amberHeat)'
                            : 'url(#greenHeat)';
                        const dotColor =
                          hotspot.severity === 'red' ? Colors.red
                          : hotspot.severity === 'amber' ? Colors.amber
                          : Colors.green;
                        return (
                          <G key={hotspot.id}>
                            {/* Radial heatmap glow */}
                            <Circle
                              cx={hotspot.x}
                              cy={hotspot.y}
                              r={hotspot.radius}
                              fill={grad}
                              onPress={() => setSelectedHotspot(hotspot)}
                            />
                            {/* Solid center dot with white ring — clearly our data overlay */}
                            <Circle cx={hotspot.x} cy={hotspot.y} r="9" fill="white" opacity="0.85" />
                            <Circle
                              cx={hotspot.x}
                              cy={hotspot.y}
                              r="7"
                              fill={dotColor}
                              onPress={() => setSelectedHotspot(hotspot)}
                            />
                            {/* Hotspot label badge — white pill so it's clearly our overlay */}
                            <Rect
                              x={hotspot.x - 36}
                              y={hotspot.y + 11}
                              width="72"
                              height="13"
                              rx="3"
                              fill="white"
                              opacity="0.88"
                            />
                            <SvgText
                              x={hotspot.x}
                              y={hotspot.y + 21}
                              fontSize="8"
                              fill={dotColor}
                              fontFamily={FontFamily.bodyMedium}
                              textAnchor="middle"
                              fontWeight="bold"
                            >
                              {hotspot.name.length > 14 ? hotspot.name.slice(0, 13) + '…' : hotspot.name}
                            </SvgText>
                          </G>
                        );
                      })}

                    {/* ─────────────────────────────────────────────────────────── */}
                    {/* PATROL ROUTE HIGHLIGHT (when selected)                         */}
                    {/* ─────────────────────────────────────────────────────────── */}
                    {highlightRouteId && (() => {
                      const unit = ASSETS[activeRank].find((a) => a.id === highlightRouteId);
                      if (unit && unit.details?.route) {
                        return (
                          <Polyline
                            points={unit.details.route}
                            fill="none"
                            stroke={Colors.red}
                            strokeWidth="3"
                            strokeDasharray="6,4"
                            strokeOpacity="0.95"
                          />
                        );
                      }
                      return null;
                    })()}

                    {/* ─────────────────────────────────────────────────────────── */}
                    {/* MAP ASSET MARKERS (stations, patrols, CCTVs, checkpoints etc.) */}
                    {/* Pin-drop style: big solid colored circle + icon + white label   */}
                    {/* Visually distinct from map background by design                 */}
                    {/* ─────────────────────────────────────────────────────────── */}
                    {ASSETS[activeRank].map((asset) => {
                      if (!activeLayers[asset.type]) return null;

                      const isPatrol = asset.type === 'patrol';
                      const isStation = asset.type === 'station';
                      const icon = renderMarkerIcon(asset.type, asset.severity);

                      // Pin color by type
                      const pinFill =
                        isPatrol ? Colors.inkNavy
                        : isStation ? '#1a5276'
                        : asset.type === 'incident' ? Colors.red
                        : asset.type === 'checkpoint' ? '#7D5A1E'
                        : asset.type === 'cctv' ? '#2E4057'
                        : asset.type === 'fir' ? '#8E44AD'
                        : Colors.steel;

                      const pinR = isPatrol ? 14 : isStation ? 13 : 11;

                      return (
                        <G
                          key={asset.id}
                          onPress={() => {
                            if (isPatrol) setSelectedPatrol(asset.details);
                            else if (asset.type === 'cctv') setSelectedCctv(asset.details);
                            else if (asset.type === 'checkpoint') setSelectedCheckpoint(asset.details);
                            else if (asset.type === 'incident') setSelectedIncident(asset.details);
                            else if (asset.type === 'fir') setSelectedFir(asset.details);
                          }}
                        >
                          {/* Outer white ring — makes pin pop against any map background */}
                          <Circle cx={asset.x} cy={asset.y} r={pinR + 2} fill="white" opacity="0.9" />
                          {/* Colored pin body */}
                          <Circle cx={asset.x} cy={asset.y} r={pinR} fill={pinFill} />
                          {/* Icon */}
                          <SvgText
                            x={asset.x}
                            y={asset.y + (pinR * 0.38)}
                            fontSize={isPatrol ? '12' : '10'}
                            textAnchor="middle"
                          >
                            {icon}
                          </SvgText>
                          {/* White label badge below pin */}
                          <Rect
                            x={asset.x - 34}
                            y={asset.y + pinR + 3}
                            width="68"
                            height="13"
                            rx="3"
                            fill="white"
                            opacity="0.92"
                            stroke={pinFill}
                            strokeWidth="0.8"
                          />
                          <SvgText
                            x={asset.x}
                            y={asset.y + pinR + 13}
                            fontSize="7.5"
                            fill={pinFill}
                            fontFamily={FontFamily.bodyMedium}
                            textAnchor="middle"
                            fontWeight="bold"
                          >
                            {asset.label.length > 12 ? asset.label.slice(0, 11) + '…' : asset.label}
                          </SvgText>
                        </G>
                      );
                    })}
                  </Svg>
                </View>
              </ScrollView>
            </View>

            {/* ─── Floating info cards (rendered below the map, scroll to view) ── */}

            {/* 1. Patrol Unit Telemetry Card */}
            {selectedPatrol && (
              <View style={styles.floatingOverlayCard}>
                <View style={styles.cardHeaderRow}>
                  <Text style={styles.cardHeading}>🚔 Patrol Telemetry Live</Text>
                  <TouchableOpacity onPress={() => { setSelectedPatrol(null); setHighlightRouteId(null); }}>
                    <Text style={styles.closeBtnText}>✕</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.cardBody}>
                  <View style={styles.telemetryRow}>
                    <View style={styles.telemetryCol}>
                      <Text style={styles.cardLabel}>PATROL ID</Text>
                      <Text style={styles.cardValBold}>{selectedPatrol.patrolId}</Text>
                    </View>
                    <View style={styles.telemetryCol}>
                      <Text style={styles.cardLabel}>VEHICLE NO</Text>
                      <Text style={styles.cardValMono}>{selectedPatrol.vehicleNo}</Text>
                    </View>
                    <View style={styles.telemetryCol}>
                      <Text style={styles.cardLabel}>STATUS</Text>
                      <View style={[styles.statusPill, { backgroundColor: getStatusColor(selectedPatrol.status) + '15' }]}>
                        <Text style={[styles.statusText, { color: getStatusColor(selectedPatrol.status) }]}>
                          {selectedPatrol.status.toUpperCase()}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.telemetryRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cardLabel}>DUTY OFFICER</Text>
                      <Text style={styles.cardValText}>{selectedPatrol.dutyOfficer}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cardLabel}>ASSIGNED OFFICERS</Text>
                      <Text style={styles.cardValText}>{selectedPatrol.assignedCrew}</Text>
                    </View>
                  </View>
                  <View style={styles.telemetryRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cardLabel}>BEAT AREA / ROUTE</Text>
                      <Text style={styles.cardValText}>{selectedPatrol.area}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cardLabel}>SHIFT TIMINGS</Text>
                      <Text style={styles.cardValText}>{selectedPatrol.shift}</Text>
                    </View>
                  </View>
                  <View style={styles.telemetryRow}>
                    <Text style={styles.cardLabel}>TELEMETRY LAST UPDATED: </Text>
                    <Text style={styles.cardValMono}>{selectedPatrol.lastUpdated}</Text>
                  </View>
                  <View style={styles.cardActionsRow}>
                    <TouchableOpacity
                      style={[styles.actionBtn, highlightRouteId === selectedPatrol.patrolId && styles.actionBtnActive]}
                      onPress={() => setHighlightRouteId(highlightRouteId === selectedPatrol.patrolId ? null : selectedPatrol.patrolId)}
                    >
                      <Text style={styles.actionBtnText}>
                        {highlightRouteId === selectedPatrol.patrolId ? '✓ Route Highlighted' : '🗺 View Route'}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionBtn, styles.actionBtnNavy]} onPress={() => triggerComms(selectedPatrol.dutyOfficer)}>
                      <Text style={styles.actionBtnTextWhite}>📞 Contact Officer</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}

            {/* 2. Crime Hotspot Analytics Card */}
            {selectedHotspot && (
              <View style={styles.floatingOverlayCard}>
                <View style={styles.cardHeaderRow}>
                  <Text style={styles.cardHeading}>🔴 Hotspot Analytics: {selectedHotspot.name}</Text>
                  <TouchableOpacity onPress={() => setSelectedHotspot(null)}>
                    <Text style={styles.closeBtnText}>✕</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.cardBody}>
                  <View style={styles.telemetryRow}>
                    <View style={styles.telemetryCol}>
                      <Text style={styles.cardLabel}>CRITICAL RISK LEVEL</Text>
                      <Text style={[styles.cardValBold, { color: selectedHotspot.severity === 'red' ? Colors.red : Colors.amber }]}>
                        {selectedHotspot.riskLevel}
                      </Text>
                    </View>
                    <View style={styles.telemetryCol}>
                      <Text style={styles.cardLabel}>ACTIVE FIR COUNT</Text>
                      <Text style={styles.cardValBold}>{selectedHotspot.firCount} cases</Text>
                    </View>
                  </View>
                  <View style={styles.telemetryRow}>
                    <Text style={styles.cardLabel}>CRIME TYPE RATIO</Text>
                    <Text style={styles.cardValText}>{selectedHotspot.crimeTypes}</Text>
                  </View>
                  <View style={styles.incidentListBlock}>
                    <Text style={styles.cardLabel}>RECENT REPORTS IN SECTOR</Text>
                    {selectedHotspot.recentIncidents.map((inc, idx) => (
                      <Text key={idx} style={styles.incidentBullet}>• {inc}</Text>
                    ))}
                  </View>
                  <View style={styles.incidentListBlock}>
                    <Text style={styles.cardLabel}>CLOSEST PATROL ASSETS</Text>
                    {selectedHotspot.nearbyPatrols.map((p, idx) => (
                      <Text key={idx} style={styles.incidentBullet}>📌 {p}</Text>
                    ))}
                  </View>
                  <View style={styles.cardActionsRow}>
                    <TouchableOpacity style={styles.actionBtn} onPress={() => triggerComms('Station Dispatch Coordinator')}>
                      <Text style={styles.actionBtnText}>🚔 Dispatch Patrols</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionBtn, styles.actionBtnNavy]} onPress={() => { setSelectedHotspot(null); navigation.navigate('CaseFiles'); }}>
                      <Text style={styles.actionBtnTextWhite}>📁 Open Sector Cases</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}

            {/* 3. CCTV Feed Popup Card */}
            {selectedCctv && (
              <View style={styles.floatingOverlayCard}>
                <View style={styles.cardHeaderRow}>
                  <Text style={styles.cardHeading}>📹 CCTV Live Feed: {selectedCctv.id}</Text>
                  <TouchableOpacity onPress={() => setSelectedCctv(null)}>
                    <Text style={styles.closeBtnText}>✕</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.cardBody}>
                  <Text style={styles.cardLabel}>LOCATION: {selectedCctv.area.toUpperCase()}</Text>
                  <View style={styles.cctvStreamWindow}>
                    {cctvFrame === 0 && <View style={styles.noiseLine1} />}
                    {cctvFrame === 1 && <View style={styles.noiseLine2} />}
                    {cctvFrame === 2 && <View style={styles.noiseLine3} />}
                    {cctvFrame === 3 && <View style={styles.noiseLine4} />}
                    <View style={styles.cctvOverlayTextRow}>
                      <View style={styles.recBlinkRow}>
                        <View style={styles.recDot} />
                        <Text style={styles.recText}>REC</Text>
                      </View>
                      <Text style={styles.cctvTimestamp}>
                        {new Date().toISOString().replace('T', ' ').substring(0, 19)} IST
                      </Text>
                    </View>
                    <View style={styles.cctvWatermark}>
                      <Text style={styles.watermarkText}>KSP SECURE INTERNAL FEED</Text>
                      <Text style={styles.watermarkTextSub}>{selectedCctv.resolution} · {selectedCctv.rotation}</Text>
                    </View>
                  </View>
                  <View style={styles.cardActionsRow}>
                    <TouchableOpacity style={styles.actionBtn} onPress={() => triggerComms('Traffic Command Control')}>
                      <Text style={styles.actionBtnText}>📞 Contact Traffic Control</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionBtn, styles.actionBtnNavy]} onPress={() => setSelectedCctv(null)}>
                      <Text style={styles.actionBtnTextWhite}>Close Feed</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}

            {/* 4. Checkpoint Popup Card */}
            {selectedCheckpoint && (
              <View style={styles.floatingOverlayCard}>
                <View style={styles.cardHeaderRow}>
                  <Text style={styles.cardHeading}>🛑 Checkpoint Detail: {selectedCheckpoint.name}</Text>
                  <TouchableOpacity onPress={() => setSelectedCheckpoint(null)}>
                    <Text style={styles.closeBtnText}>✕</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.cardBody}>
                  <View style={styles.telemetryRow}>
                    <View style={styles.telemetryCol}>
                      <Text style={styles.cardLabel}>OFFICER IN CHARGE</Text>
                      <Text style={styles.cardValBold}>{selectedCheckpoint.dutyOfficer}</Text>
                    </View>
                    <View style={styles.telemetryCol}>
                      <Text style={styles.cardLabel}>STATUS</Text>
                      <View style={[styles.statusPill, { backgroundColor: getStatusColor(selectedCheckpoint.status) + '15' }]}>
                        <Text style={[styles.statusText, { color: getStatusColor(selectedCheckpoint.status) }]}>
                          {selectedCheckpoint.status.toUpperCase()}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.telemetryRow}>
                    <View style={styles.telemetryCol}>
                      <Text style={styles.cardLabel}>TOTAL VEHICLES SCREENED</Text>
                      <Text style={styles.cardValBold}>{selectedCheckpoint.vehiclesScreened} today</Text>
                    </View>
                  </View>
                  <View style={styles.cardActionsRow}>
                    <TouchableOpacity style={styles.actionBtn} onPress={() => triggerComms(selectedCheckpoint.dutyOfficer)}>
                      <Text style={styles.actionBtnText}>📞 Contact Checkpoint</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}

            {/* 5. Incident Card */}
            {selectedIncident && (
              <View style={styles.floatingOverlayCard}>
                <View style={styles.cardHeaderRow}>
                  <Text style={styles.cardHeading}>⚠️ Active Incident Report</Text>
                  <TouchableOpacity onPress={() => setSelectedIncident(null)}>
                    <Text style={styles.closeBtnText}>✕</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.cardBody}>
                  <Text style={[styles.cardValBold, { color: Colors.red, marginBottom: 8 }]}>{selectedIncident.title}</Text>
                  <View style={styles.telemetryRow}>
                    <View style={styles.telemetryCol}>
                      <Text style={styles.cardLabel}>REPORTER</Text>
                      <Text style={styles.cardValText}>{selectedIncident.reporter}</Text>
                    </View>
                    <View style={styles.telemetryCol}>
                      <Text style={styles.cardLabel}>TIME FILED</Text>
                      <Text style={styles.cardValMono}>{selectedIncident.time}</Text>
                    </View>
                  </View>
                  <View style={styles.incidentListBlock}>
                    <Text style={styles.cardLabel}>INCIDENT REPORT DETAILS</Text>
                    <Text style={styles.cardValText}>{selectedIncident.details}</Text>
                  </View>
                  <View style={styles.cardActionsRow}>
                    <TouchableOpacity style={styles.actionBtn} onPress={() => triggerComms('Command Dispatch Center')}>
                      <Text style={styles.actionBtnText}>🚔 Dispatch Nearest Unit</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}

            {/* 6. FIR Case Card */}
            {selectedFir && (
              <View style={styles.floatingOverlayCard}>
                <View style={styles.cardHeaderRow}>
                  <Text style={styles.cardHeading}>📁 Case File Quickview</Text>
                  <TouchableOpacity onPress={() => setSelectedFir(null)}>
                    <Text style={styles.closeBtnText}>✕</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.cardBody}>
                  <Text style={styles.cardValBold}>{selectedFir.firNo}: {selectedFir.title}</Text>
                  <View style={styles.telemetryRow}>
                    <View style={styles.telemetryCol}>
                      <Text style={styles.cardLabel}>INVESTIGATING OFFICER</Text>
                      <Text style={styles.cardValText}>{selectedFir.officer}</Text>
                    </View>
                    <View style={styles.telemetryCol}>
                      <Text style={styles.cardLabel}>FILED DATE</Text>
                      <Text style={styles.cardValMono}>{selectedFir.date}</Text>
                    </View>
                  </View>
                  <View style={styles.telemetryRow}>
                    <Text style={styles.cardLabel}>COMPLAINANT: </Text>
                    <Text style={styles.cardValText}>{selectedFir.complainant}</Text>
                  </View>
                  <View style={styles.cardActionsRow}>
                    <TouchableOpacity style={[styles.actionBtn, styles.actionBtnNavy]} onPress={() => handleViewCase(selectedFir.firNo)}>
                      <Text style={styles.actionBtnTextWhite}>📁 Open Case Files</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* ── Comms Call Modal Dialog ───────────────────────────────────────────── */}
      {commsTarget && (
        <View style={styles.modalOverlay}>
          <View style={styles.commsModal}>
            <Text style={styles.commsTitle}>Initiating Secure Voice Link</Text>
            <Text style={styles.commsTargetName}>{commsTarget.toUpperCase()}</Text>
            <Text style={styles.commsFreq}>Frequency: 412.85 MHz VPN-Encrypted</Text>

            <View style={styles.commsPulseCenter}>
              {commsCountdown > 0 ? (
                <View style={styles.connectingCircle}>
                  <Text style={styles.countdownText}>{commsCountdown}</Text>
                  <Text style={styles.connectingSubText}>Connecting...</Text>
                </View>
              ) : (
                <View style={[styles.connectingCircle, styles.connectedCircle]}>
                  <Text style={styles.connectedText}>📞 LINE ACTIVE</Text>
                  <Text style={styles.connectingSubText}>Secure VPN Connected</Text>
                </View>
              )}
            </View>

            <TouchableOpacity style={styles.commsDisconnectBtn} onPress={() => setCommsTarget(null)}>
              <Text style={styles.commsDisconnectText}>Disconnect</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.paper,
  },
  scroll: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    zIndex: 5,
  },
  menuBtn: {
    padding: 6,
  },
  menuIcon: {
    fontSize: 20,
    color: Colors.inkNavy,
  },
  headerText: {
    flex: 1,
  },
  headerEyebrow: {
    fontFamily: FontFamily.mono,
    fontSize: FontSize.xs,
    color: Colors.red,
    letterSpacing: 0.8,
  },
  headerTitle: {
    fontFamily: FontFamily.display,
    fontSize: FontSize['2xl'],
    fontWeight: '600',
    color: Colors.inkNavy,
  },
  officerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.paperDim,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.line,
    gap: 8,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: Colors.green,
  },
  officerName: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.md,
    color: Colors.inkNavy,
    lineHeight: 14,
  },
  officerStation: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.xs,
    color: Colors.gray,
    marginTop: 2,
  },
  tabBar: {
    backgroundColor: Colors.paperDim,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  tabBarLabel: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.md,
    color: Colors.gray,
  },
  tabRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  tabItem: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.line,
  },
  tabItemActive: {
    backgroundColor: Colors.red,
    borderColor: Colors.red,
  },
  tabText: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.smPlus,
    color: Colors.inkNavy,
  },
  tabTextActive: {
    color: Colors.white,
  },
  mainContainer: {
    flex: 1,
    padding: 16,
  },
  mainLayout: {
    padding: 16,
  },
  dashboardGrid: {
    flex: 1,
    flexDirection: Platform.OS === 'web' && Dimensions.get('window').width >= 992 ? 'row' : 'column',
    gap: 16,
    alignItems: 'stretch',
  },
  sidebarPanel: {
    flex: Platform.OS === 'web' && Dimensions.get('window').width >= 992 ? 0 : 0,
    width: Platform.OS === 'web' && Dimensions.get('window').width >= 992 ? 280 : '100%',
    maxHeight: Platform.OS === 'web' && Dimensions.get('window').width >= 992 ? undefined : 320,
    minWidth: 260,
  },
  sidebarContent: {
    gap: 16,
    paddingBottom: 8,
  },
  statsCard: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: 8,
    padding: 14,
  },
  sidebarSectionTitle: {
    fontFamily: FontFamily.display,
    fontSize: FontSize.lgPlus,
    fontWeight: '600',
    color: Colors.inkNavy,
    marginBottom: 6,
  },
  inChargeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inChargeLabel: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.sm,
    color: Colors.gray,
  },
  inChargeValue: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.sm,
    color: Colors.inkNavy,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.line,
    marginVertical: 10,
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statBox: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.paper,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  statVal: {
    fontFamily: FontFamily.monoMedium,
    fontSize: FontSize.xl,
    color: Colors.red,
    fontWeight: '600',
  },
  statLbl: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.xs,
    color: Colors.gray,
    marginTop: 2,
  },
  layersCard: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: 8,
    padding: 14,
  },
  layerCheckboxList: {
    gap: 10,
    marginTop: 8,
  },
  layerCheckboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkbox: {
    width: 16,
    height: 16,
    borderWidth: 1.5,
    borderColor: Colors.steel,
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: Colors.red,
    borderColor: Colors.red,
  },
  checkboxCheck: {
    color: Colors.white,
    fontSize: FontSize.xs,
    fontWeight: '700',
    lineHeight: 12,
  },
  layerCheckboxLabel: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.md,
    color: Colors.inkNavy,
  },
  mapContainer: {
    flex: 1,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: 8,
    overflow: 'hidden',
  },
  mapHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
    backgroundColor: Colors.paperDim,
    flexWrap: 'wrap',
    gap: 6,
  },
  mapStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.inkNavy,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  pulsingLiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.red,
  },
  mapStatusText: {
    fontFamily: FontFamily.mono,
    fontSize: FontSize.xs,
    color: Colors.white,
    letterSpacing: 0.5,
  },
  mapHintText: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.sm,
    color: Colors.gray,
  },
  canvasFrame: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: '#f0ede6',
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
  },
  mapScrollView: {
    flex: 1,
  },
  mapScrollContent: {
    flexGrow: 1,
  },
  mapImageWrapper: {
    width: '100%',
    aspectRatio: 874 / 1122,
    position: 'relative',
  },
  mapBaseImage: {
    width: '100%',
    height: '100%',
  },
  svgOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  svgMap: {
    width: '100%',
    height: 620,
    backgroundColor: Colors.mapBg,
  },
  floatingOverlayCard: {
    marginHorizontal: 12,
    marginTop: 10,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: 8,
    padding: 12,
    shadowColor: Colors.inkNavy,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
    paddingBottom: 8,
    marginBottom: 8,
  },
  cardHeading: {
    fontFamily: FontFamily.display,
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.inkNavy,
  },
  closeBtnText: {
    fontSize: 16,
    color: Colors.gray,
    padding: 2,
  },
  cardBody: {
    gap: 8,
  },
  telemetryRow: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  telemetryCol: {
    flex: 1,
    minWidth: 90,
  },
  cardLabel: {
    fontFamily: FontFamily.mono,
    fontSize: 9,
    color: Colors.gray,
    letterSpacing: 0.5,
  },
  cardValBold: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.md,
    color: Colors.inkNavy,
    marginTop: 2,
  },
  cardValMono: {
    fontFamily: FontFamily.monoMedium,
    fontSize: FontSize.xs,
    color: Colors.steel,
    marginTop: 2,
  },
  cardValText: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.md,
    color: Colors.inkNavy,
    marginTop: 2,
  },
  statusPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 2,
  },
  statusText: {
    fontFamily: FontFamily.mono,
    fontSize: 8.5,
    fontWeight: '700',
  },
  incidentListBlock: {
    gap: 4,
    backgroundColor: Colors.paperDim + '50',
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.line + '50',
  },
  incidentBullet: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.smPlus,
    color: Colors.steel,
    lineHeight: 14,
  },
  cardActionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: Colors.paperDim,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: 6,
    paddingVertical: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnActive: {
    backgroundColor: Colors.red + '15',
    borderColor: Colors.red,
  },
  actionBtnNavy: {
    backgroundColor: Colors.inkNavy,
    borderColor: Colors.inkNavy,
  },
  actionBtnText: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.md,
    color: Colors.inkNavy,
  },
  actionBtnTextWhite: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.md,
    color: Colors.white,
  },
  cctvStreamWindow: {
    height: 180,
    backgroundColor: '#0F1626',
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.steel,
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 4,
  },
  noiseLine1: { position: 'absolute', width: '100%', height: 2, backgroundColor: 'rgba(255,255,255,0.06)', top: '15%' },
  noiseLine2: { position: 'absolute', width: '100%', height: 4, backgroundColor: 'rgba(255,255,255,0.08)', top: '45%' },
  noiseLine3: { position: 'absolute', width: '100%', height: 2, backgroundColor: 'rgba(255,255,255,0.04)', top: '70%' },
  noiseLine4: { position: 'absolute', width: '100%', height: 3, backgroundColor: 'rgba(255,255,255,0.07)', top: '90%' },
  cctvOverlayTextRow: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 2,
  },
  recBlinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  recDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.red,
  },
  recText: {
    fontFamily: FontFamily.mono,
    fontSize: 9,
    color: Colors.red,
    fontWeight: '700',
  },
  cctvTimestamp: {
    fontFamily: FontFamily.mono,
    fontSize: 9,
    color: '#00FF66',
  },
  cctvWatermark: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    zIndex: 2,
  },
  watermarkText: {
    fontFamily: FontFamily.mono,
    fontSize: 9,
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 0.5,
  },
  watermarkTextSub: {
    fontFamily: FontFamily.mono,
    fontSize: 8,
    color: 'rgba(255,255,255,0.3)',
    marginTop: 1,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(20, 33, 61, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  commsModal: {
    backgroundColor: Colors.card,
    borderWidth: 2,
    borderColor: Colors.inkNavy,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    width: '85%',
    maxWidth: 360,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  commsTitle: {
    fontFamily: FontFamily.mono,
    fontSize: FontSize.xs,
    color: Colors.red,
    letterSpacing: 0.8,
  },
  commsTargetName: {
    fontFamily: FontFamily.display,
    fontSize: FontSize['2xl'],
    fontWeight: '600',
    color: Colors.inkNavy,
    marginVertical: 6,
    textAlign: 'center',
  },
  commsFreq: {
    fontFamily: FontFamily.mono,
    fontSize: FontSize.xs,
    color: Colors.gray,
    marginBottom: 20,
  },
  commsPulseCenter: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  connectingCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: Colors.red,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.red + '08',
  },
  connectedCircle: {
    borderColor: Colors.green,
    borderStyle: 'solid',
    backgroundColor: Colors.green + '08',
  },
  countdownText: {
    fontFamily: FontFamily.monoMedium,
    fontSize: FontSize.display,
    color: Colors.red,
    fontWeight: '700',
  },
  connectedText: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.lg,
    color: Colors.green,
    fontWeight: '700',
  },
  connectingSubText: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.xs,
    color: Colors.gray,
    marginTop: 4,
  },
  commsDisconnectBtn: {
    backgroundColor: Colors.red,
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 28,
    alignItems: 'center',
  },
  commsDisconnectText: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.md,
    color: Colors.white,
  },
});
