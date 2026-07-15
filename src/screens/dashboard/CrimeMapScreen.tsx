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
  Line,
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

  // ─── Mock Datasets representing the 4 Jurisdiction Levels ────────────────────

  // 1. BOUNDARIES
  const BOUNDARIES: Record<SimulatedRank, BoundaryRegion[]> = {
    Inspector: [
      { id: 'sec-1', name: 'Sector 1 (ITPL)', points: '380,250 500,80 720,150 620,290 380,250', fillColor: '#3C4E6E12', borderColor: Colors.steel, labelX: 520, labelY: 170 },
      { id: 'sec-2', name: 'Sector 2 (Hoodi)', points: '180,220 380,80 380,250 180,220', fillColor: '#B5811A0C', borderColor: Colors.amber, labelX: 280, labelY: 150 },
      { id: 'sec-3', name: 'Sector 3 (Marathahalli)', points: '180,220 380,250 280,430 140,360 180,220', fillColor: '#B23A2E0A', borderColor: Colors.red, labelX: 250, labelY: 310 },
      { id: 'sec-4', name: 'Sector 4 (Kadugodi Rd)', points: '380,250 620,290 560,450 280,430 380,250', fillColor: '#3F6B4F0F', borderColor: Colors.green, labelX: 470, labelY: 360 },
    ],
    ACP: [
      { id: 'c-wf', name: 'Whitefield Circle', points: '140,120 450,80 480,280 180,320 140,120', fillColor: '#14213D08', borderColor: Colors.inkNavy, labelX: 290, labelY: 180 },
      { id: 'c-vt', name: 'Varthur Circle', points: '480,280 720,240 680,450 380,460 480,280', fillColor: '#3F6B4F0C', borderColor: Colors.green, labelX: 560, labelY: 360 },
      { id: 'c-kg', name: 'Kadugodi Circle', points: '450,80 720,60 720,240 480,280 450,80', fillColor: '#B5811A0C', borderColor: Colors.amber, labelX: 590, labelY: 150 },
      { id: 'c-mp', name: 'Mahadevapura Circle', points: '80,140 140,120 180,320 60,350 80,140', fillColor: '#B23A2E0A', borderColor: Colors.red, labelX: 110, labelY: 230 },
    ],
    DCP: [
      { id: 'd-wf', name: 'Whitefield Sub-Division', points: '300,100 680,60 640,420 340,440 300,100', fillColor: '#14213D0C', borderColor: Colors.inkNavy, labelX: 490, labelY: 260 },
      { id: 'd-kr', name: 'KR Puram Sub-Division', points: '80,60 300,100 340,300 120,320 80,60', fillColor: '#B5811A0A', borderColor: Colors.amber, labelX: 200, labelY: 160 },
      { id: 'd-hal', name: 'HAL Sub-Division', points: '120,320 340,300 340,440 140,460 120,320', fillColor: '#B23A2E0A', borderColor: Colors.red, labelX: 220, labelY: 380 },
    ],
    Commissioner: [
      { id: 'z-east', name: 'East District (Bengaluru East)', points: '380,160 700,120 660,420 380,440 380,160', fillColor: '#14213D0E', borderColor: Colors.inkNavy, labelX: 520, labelY: 280 },
      { id: 'z-west', name: 'West District', points: '80,140 280,160 300,380 60,340 80,140', fillColor: '#3F6B4F0A', borderColor: Colors.green, labelX: 160, labelY: 240 },
      { id: 'z-south', name: 'South District', points: '280,160 380,160 380,440 280,440 280,160', fillColor: '#B5811A0A', borderColor: Colors.amber, labelX: 330, labelY: 300 },
      { id: 'z-central', name: 'Central District', points: '280,100 380,100 380,160 280,160 280,100', fillColor: '#B23A2E08', borderColor: Colors.red, labelX: 330, labelY: 130 },
      { id: 'z-north', name: 'North District', points: '160,40 580,30 380,160 280,160 160,40', fillColor: '#3C4E6E0A', borderColor: Colors.steel, labelX: 340, labelY: 80 },
    ],
  };

  // 2. MAIN ROADS (Grid Overlay)
  const ROADS: Record<SimulatedRank, MapRoad[]> = {
    Inspector: [
      { id: 'r1', points: '100,220 380,250 750,290', width: 3, isHighway: true }, // ITPL Main Road
      { id: 'r2', points: '280,80 380,250 480,450', width: 2 }, // Hoodi-Varthur Link
      { id: 'r3', points: '180,350 380,250 680,200', width: 1.5 }, // Outer Ring Connector
    ],
    ACP: [
      { id: 'r1', points: '60,180 380,250 720,300', width: 4, isHighway: true }, // Old Airport Road
      { id: 'r2', points: '300,50 380,250 420,460', width: 3, isHighway: true }, // Outer Ring Road
      { id: 'r3', points: '100,110 450,80 700,140', width: 2 }, // Kadugodi Highway
      { id: 'r4', points: '180,320 480,280 680,420', width: 1.5 }, // Varthur Main Road
    ],
    DCP: [
      { id: 'r1', points: '50,150 400,220 750,280', width: 4, isHighway: true }, // National Highway 75
      { id: 'r2', points: '250,40 340,300 380,460', width: 4, isHighway: true }, // Outer Ring Road (East)
      { id: 'r3', points: '80,320 340,300 700,200', width: 3 }, // Old Airport Expressway
    ],
    Commissioner: [
      { id: 'r1', points: '50,250 380,250 750,250', width: 5, isHighway: true }, // East-West Expressway
      { id: 'r2', points: '380,50 380,250 380,450', width: 5, isHighway: true }, // North-South Corridor
      { id: 'r3', points: '100,100 380,250 680,400', width: 3 }, // Diagonal Ring Link
    ],
  };

  // 3. HOTSPOTS (Colored Radial Gradients)
  const HOTSPOTS: Record<SimulatedRank, CrimeHotspot[]> = {
    Inspector: [
      {
        id: 'h1',
        name: 'Hoodi Circle Junction',
        severity: 'red',
        x: 300,
        y: 180,
        radius: 48,
        firCount: 4,
        crimeTypes: 'Snatching (75%), Vehicle Theft (25%)',
        riskLevel: 'Critical Risk Level (High)',
        recentIncidents: [
          'FIR KA-CR-1142: Gold chain snatched near bus stop (2h ago)',
          'FIR KA-CR-1098: Snatching near Hoodi Lake gate (1d ago)',
          'Compl-104: Two-wheeler theft outside hotel (2d ago)',
        ],
        nearbyPatrols: ['PCR-14 (120m away) - On Patrol', 'PCR-09 (450m away) - Responding'],
      },
      {
        id: 'h2',
        name: 'ITPL Main Parking Lot B2',
        severity: 'amber',
        x: 460,
        y: 120,
        radius: 36,
        firCount: 2,
        crimeTypes: 'Vehicle Theft (100%)',
        riskLevel: 'Moderate Warning (Medium)',
        recentIncidents: [
          'FIR KA-CR-1149: Pulsar motorcycle stolen from B2 basement (1d ago)',
          'Compl-189: Bicycle theft from campus cycle dock (4d ago)',
        ],
        nearbyPatrols: ['PCR-09 (180m away) - Responding'],
      },
      {
        id: 'h3',
        name: 'Marathahalli Flyover Bridge',
        severity: 'amber',
        x: 250,
        y: 340,
        radius: 32,
        firCount: 3,
        crimeTypes: 'Assault (66%), Snatching (34%)',
        riskLevel: 'Moderate Warning (Medium)',
        recentIncidents: [
          'FIR KA-CR-1076: Pedestrian assaulted on ramp (3d ago)',
          'FIR KA-CR-1138: Neighborhood brawl near bridge (5d ago)',
        ],
        nearbyPatrols: ['PCR-03 (90m away) - Available'],
      },
    ],
    ACP: [
      {
        id: 'h-wf',
        name: 'Whitefield Central Cluster',
        severity: 'red',
        x: 330,
        y: 200,
        radius: 54,
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
        id: 'h-mp',
        name: 'Mahadevapura IT Hub Zone',
        severity: 'red',
        x: 130,
        y: 230,
        radius: 46,
        firCount: 7,
        crimeTypes: 'Cyber Fraud (80%), Extortion (20%)',
        riskLevel: 'Critical Risk Level (High)',
        recentIncidents: [
          'Cyber Complaint: Fake call center hub busted (1d ago)',
          'Extortion: Merchant threatened by local gang (3d ago)',
        ],
        nearbyPatrols: ['PCR-05 - Available'],
      },
      {
        id: 'h-vt',
        name: 'Varthur Lake Border Area',
        severity: 'amber',
        x: 580,
        y: 380,
        radius: 38,
        firCount: 4,
        crimeTypes: 'Illegal Dumping (60%), Vehicle Theft (40%)',
        riskLevel: 'Moderate Warning (Medium)',
        recentIncidents: ['Enviro-Alert: Chemical truck dumping in lake (4h ago)'],
        nearbyPatrols: ['PCR-21 - On Patrol'],
      },
    ],
    DCP: [
      {
        id: 'h-dist-wf',
        name: 'Whitefield Tech Corridor Hotspot',
        severity: 'red',
        x: 480,
        y: 260,
        radius: 64,
        firCount: 18,
        crimeTypes: 'Property Crime (45%), Cyber Crime (40%), Bodily Harm (15%)',
        riskLevel: 'Critical Risk Level (High)',
        recentIncidents: ['High volume of tech corridor property crimes reported.'],
        nearbyPatrols: ['6 active PCR units in vicinity'],
      },
      {
        id: 'h-dist-kr',
        name: 'KR Puram Junction Transit Hotspot',
        severity: 'red',
        x: 220,
        y: 150,
        radius: 50,
        firCount: 14,
        crimeTypes: 'Pickpocketing (60%), Luggage Theft (40%)',
        riskLevel: 'Critical Risk Level (High)',
        recentIncidents: ['Active gangs flagged around railway/bus stations.'],
        nearbyPatrols: ['4 active PCR units in vicinity'],
      },
    ],
    Commissioner: [
      {
        id: 'h-city-east',
        name: 'East Zone Crime Cluster (Aggregated)',
        severity: 'red',
        x: 540,
        y: 280,
        radius: 80,
        firCount: 36,
        crimeTypes: 'Cyber Fraud (40%), Snatching (30%), Burglary (30%)',
        riskLevel: 'Critical Risk Level (High)',
        recentIncidents: ['City-wide cyber center coordinates identified in East District.'],
        nearbyPatrols: ['18 patrol vehicles active in Zone'],
      },
      {
        id: 'h-city-central',
        name: 'Central Business District',
        severity: 'amber',
        x: 330,
        y: 140,
        radius: 60,
        firCount: 22,
        crimeTypes: 'Traffic Altercations (50%), Snatching (50%)',
        riskLevel: 'Moderate Warning (Medium)',
        recentIncidents: ['Peak hour traffic incidents leading to physical altercations.'],
        nearbyPatrols: ['12 patrol vehicles active in Zone'],
      },
    ],
  };

  // 4. MAP ASSETS (Markers)
  const ASSETS: Record<SimulatedRank, MapAsset[]> = {
    Inspector: [
      { id: 'ps-wf', type: 'station', label: 'Whitefield PS', x: 380, y: 250, details: { name: 'Whitefield Police Station', inCharge: 'Insp. R. Kumaraswamy', staff: '32 Personnel', phone: '+91-80-2845-0001' } },
      { id: 'chk-hoodi', type: 'checkpoint', label: 'Hoodi Checkpoint', x: 290, y: 140, status: 'Active Search', details: { name: 'Hoodi Circle Checkpoint', dutyOfficer: 'HC Prakash', status: 'Active Barricading', vehiclesScreened: 142 } },
      { id: 'chk-itpl', type: 'checkpoint', label: 'ITPL Gate Checkpoint', x: 470, y: 100, status: 'Manned', details: { name: 'ITPL North Gate Point', dutyOfficer: 'PC Gowda', status: 'Routine Watch', vehiclesScreened: 89 } },
      { id: 'cctv-101', type: 'cctv', label: 'CCTV-101 (Hoodi Jn)', x: 310, y: 160, status: 'Online', details: { id: 'CCTV-101', area: 'Hoodi Jn West', status: 'Online', resolution: '4K Dome', rotation: 'Panning' } },
      { id: 'cctv-102', type: 'cctv', label: 'CCTV-102 (ITPL Entry)', x: 460, y: 130, status: 'Online', details: { id: 'CCTV-102', area: 'ITPL Tech Park Entry', status: 'Online', resolution: '1080p Dome', rotation: 'Static North' } },
      { id: 'cctv-103', type: 'cctv', label: 'CCTV-103 (Flyover Ramp)', x: 240, y: 350, status: 'Online', details: { id: 'CCTV-103', area: 'Marathahalli Flyover East', status: 'Online', resolution: '4K Traffic Cam', rotation: 'Panning' } },
      { id: 'inc-1', type: 'incident', label: 'Chain snatching (Just now)', x: 320, y: 190, severity: 'red', details: { title: 'Red Alert: Chain Snatching', reporter: 'Lakshmi N.', time: '2 mins ago', details: 'Two suspects on a black Pulsar snatched gold chain. Fled towards Hoodi Junction.' } },
      { id: 'inc-2', type: 'incident', label: 'Vehicle Theft Reported', x: 450, y: 110, severity: 'amber', details: { title: 'Amber Alert: Vehicle Theft', reporter: 'R. Fernandes', time: '11 mins ago', details: 'Motorcycle stolen from basement parking. Guard reported black helmet rider.' } },
      { id: 'fir-1142', type: 'fir', label: 'FIR 1142', x: 280, y: 180, details: { firNo: 'KA-CR-1142', title: 'Chain snatching — Hoodi Circle', date: '07 Jul 2026', officer: 'SI Manjunath', complainant: 'Lakshmi N.' } },
      { id: 'fir-1149', type: 'fir', label: 'FIR 1149', x: 480, y: 140, details: { firNo: 'KA-CR-1149', title: 'Vehicle theft — ITPL Parking', date: '05 Jul 2026', officer: 'HC Prakash', complainant: 'R. Fernandes' } },
      {
        id: 'PCR-14',
        type: 'patrol',
        label: 'PCR-14',
        x: 280,
        y: 220,
        status: 'On Patrol',
        details: {
          patrolId: 'PCR-14',
          vehicleNo: 'KA-03-GP-1204',
          dutyOfficer: 'Sub-Inspector Manjunath',
          assignedCrew: 'HC Prakash, PC Gowda',
          status: 'On Patrol',
          shift: '08:00 - 20:00 (Day Shift)',
          lastUpdated: '1 min ago (GPS Lock)',
          area: 'Sector 2 (Hoodi)',
          phone: '+91-98450-12345',
          route: '280,220 300,180 320,190 290,140 280,220',
        },
      },
      {
        id: 'PCR-09',
        type: 'patrol',
        label: 'PCR-09',
        x: 440,
        y: 150,
        status: 'Responding',
        details: {
          patrolId: 'PCR-09',
          vehicleNo: 'KA-03-GP-5512',
          dutyOfficer: 'SI Deepa R.',
          assignedCrew: 'HC Mahesh, PC Harish',
          status: 'Responding',
          shift: '08:00 - 20:00 (Day Shift)',
          lastUpdated: 'Just now (Active Siren)',
          area: 'Sector 1 (ITPL)',
          phone: '+91-98450-55122',
          route: '440,150 460,130 450,110 440,150',
        },
      },
      {
        id: 'PCR-03',
        type: 'patrol',
        label: 'PCR-03',
        x: 230,
        y: 320,
        status: 'Available',
        details: {
          patrolId: 'PCR-03',
          vehicleNo: 'KA-03-GP-9833',
          dutyOfficer: 'HC Nagaraj',
          assignedCrew: 'PC Anand, PC Somesh',
          status: 'Available',
          shift: '08:00 - 20:00 (Day Shift)',
          lastUpdated: '4 mins ago (Stationary)',
          area: 'Sector 3 (Marathahalli)',
          phone: '+91-98450-98334',
          route: '230,320 240,350 250,340 230,320',
        },
      },
    ],
    ACP: [
      { id: 'ps-wf', type: 'station', label: 'Whitefield PS', x: 380, y: 250 },
      { id: 'ps-vt', type: 'station', label: 'Varthur PS', x: 550, y: 360 },
      { id: 'ps-kg', type: 'station', label: 'Kadugodi PS', x: 600, y: 130 },
      { id: 'ps-mp', type: 'station', label: 'Mahadevapura PS', x: 160, y: 210 },
      { id: 'chk-east', type: 'checkpoint', label: 'East Sub-Div Border Chk', x: 680, y: 220, status: 'Active Guarding' },
      { id: 'inc-acp-1', type: 'incident', label: 'Cyber Syndicate Flagged', x: 140, y: 220, severity: 'red' },
      {
        id: 'PCR-14',
        type: 'patrol',
        label: 'PCR-14',
        x: 350,
        y: 230,
        status: 'On Patrol',
        details: {
          patrolId: 'PCR-14',
          vehicleNo: 'KA-03-GP-1204',
          dutyOfficer: 'Sub-Inspector Manjunath',
          assignedCrew: 'HC Prakash, PC Gowda',
          status: 'On Patrol',
          shift: '08:00 - 20:00 (Day Shift)',
          lastUpdated: '1 min ago (GPS Lock)',
          area: 'Whitefield Circle',
          phone: '+91-98450-12345',
          route: '350,230 380,250 480,280 350,230',
        },
      },
      {
        id: 'PCR-21',
        type: 'patrol',
        label: 'PCR-21',
        x: 520,
        y: 340,
        status: 'On Patrol',
        details: {
          patrolId: 'PCR-21',
          vehicleNo: 'KA-03-GP-7721',
          dutyOfficer: 'SI Shivakumar',
          assignedCrew: 'HC Swamy, PC Venkatesh',
          status: 'On Patrol',
          shift: '20:00 - 08:00 (Night Shift)',
          lastUpdated: '2 mins ago (GPS Lock)',
          area: 'Varthur Circle',
          phone: '+91-98450-77211',
          route: '520,340 550,360 580,380 520,340',
        },
      },
    ],
    DCP: [
      { id: 'hq-wf', type: 'station', label: 'Whitefield ACP Office', x: 480, y: 250 },
      { id: 'hq-kr', type: 'station', label: 'KR Puram ACP Office', x: 220, y: 160 },
      { id: 'hq-hal', type: 'station', label: 'HAL ACP Office', x: 220, y: 380 },
      { id: 'chk-dist-1', type: 'checkpoint', label: 'District Toll Chk', x: 610, y: 380, status: 'Active Guarding' },
      { id: 'inc-dcp-1', type: 'incident', label: 'Critical Protest Blockade', x: 450, y: 220, severity: 'red' },
      {
        id: 'PCR-COORD-1',
        type: 'patrol',
        label: 'PCR-EAST-1',
        x: 440,
        y: 280,
        status: 'Responding',
        details: {
          patrolId: 'PCR-EAST-1',
          vehicleNo: 'KA-03-GP-0001',
          dutyOfficer: 'Inspector R. Kumaraswamy',
          assignedCrew: 'HC Somanna, PC Swamy',
          status: 'Responding',
          shift: '24 hrs (Command Coord)',
          lastUpdated: 'Just now (Coord Siren)',
          area: 'Whitefield Division Coordinator',
          phone: '+91-80-2845-0001',
          route: '440,280 480,250 450,220 440,280',
        },
      },
    ],
    Commissioner: [
      { id: 'hq-city', type: 'station', label: 'Commissioner HQ', x: 340, y: 140 },
      { id: 'hq-east-dist', type: 'station', label: 'East District HQ', x: 500, y: 260 },
      { id: 'hq-west-dist', type: 'station', label: 'West District HQ', x: 180, y: 240 },
      { id: 'chk-city-border', type: 'checkpoint', label: 'Hosur Toll Gate Point', x: 480, y: 410, status: 'Active Search' },
      { id: 'inc-city-1', type: 'incident', label: 'City-wide Cyber Spike', x: 510, y: 290, severity: 'red' },
      {
        id: 'VAJRA-01',
        type: 'patrol',
        label: 'VAJRA-01',
        x: 360,
        y: 200,
        status: 'Available',
        details: {
          patrolId: 'VAJRA-01',
          vehicleNo: 'KA-03-MP-9999',
          dutyOfficer: 'ACP Command Liaison',
          assignedCrew: '5 SWAT Personnel',
          status: 'Available',
          shift: 'Emergency Command Duty',
          lastUpdated: '5 mins ago (GPS Active)',
          area: 'Zonal Command Center',
          phone: '+91-99999-88888',
          route: '360,200 380,160 340,140 360,200',
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

      {/* ── Main Container ────────────────────────────────────────────────────── */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.mainLayout}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.dashboardGrid}>
          {/* ── Left Sidebar: Stats & Layer Controls ─────────────────────────── */}
          <View style={styles.sidebarPanel}>
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
          </View>

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

            {/* SVG Render Container */}
            <View style={styles.canvasFrame}>
              <Svg viewBox="0 0 800 500" style={styles.svgMap}>
                {/* Defs block for heatmap gradients */}
                <Defs>
                  <RadialGradient id="redHeat" cx="50%" cy="50%" r="50%">
                    <Stop offset="0%" stopColor={Colors.red} stopOpacity="0.55" />
                    <Stop offset="45%" stopColor={Colors.red} stopOpacity="0.25" />
                    <Stop offset="100%" stopColor={Colors.red} stopOpacity="0" />
                  </RadialGradient>
                  <RadialGradient id="amberHeat" cx="50%" cy="50%" r="50%">
                    <Stop offset="0%" stopColor={Colors.amber} stopOpacity="0.55" />
                    <Stop offset="45%" stopColor={Colors.amber} stopOpacity="0.22" />
                    <Stop offset="100%" stopColor={Colors.amber} stopOpacity="0" />
                  </RadialGradient>
                  <RadialGradient id="greenHeat" cx="50%" cy="50%" r="50%">
                    <Stop offset="0%" stopColor={Colors.green} stopOpacity="0.5" />
                    <Stop offset="45%" stopColor={Colors.green} stopOpacity="0.2" />
                    <Stop offset="100%" stopColor={Colors.green} stopOpacity="0" />
                  </RadialGradient>
                </Defs>

                {/* Radar Grid Line Overlay */}
                {Array.from({ length: 9 }).map((_, i) => (
                  <Line
                    key={`h-${i}`}
                    x1="0"
                    y1={String((i + 1) * 50)}
                    x2="800"
                    y2={String((i + 1) * 50)}
                    stroke={Colors.mapGrid}
                    strokeWidth="0.5"
                    strokeOpacity="0.3"
                  />
                ))}
                {Array.from({ length: 15 }).map((_, i) => (
                  <Line
                    key={`v-${i}`}
                    x1={String((i + 1) * 50)}
                    y1="0"
                    x2={String((i + 1) * 50)}
                    y2="500"
                    stroke={Colors.mapGrid}
                    strokeWidth="0.5"
                    strokeOpacity="0.3"
                  />
                ))}

                {/* Draw Boundaries of Sub-regions */}
                {BOUNDARIES[activeRank].map((region) => (
                  <Polygon
                    key={region.id}
                    points={region.points}
                    fill={region.fillColor}
                    stroke={region.borderColor}
                    strokeWidth="1.5"
                    strokeDasharray="4,4"
                  />
                ))}

                {/* Draw Major Road Network */}
                {ROADS[activeRank].map((road) => (
                  <Polyline
                    key={road.id}
                    points={road.points}
                    fill="none"
                    stroke={Colors.mapRoad}
                    strokeWidth={road.width}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeOpacity="0.8"
                  />
                ))}

                {/* Draw Hotspot Heatmaps */}
                {activeLayers.hotspots &&
                  HOTSPOTS[activeRank].map((hotspot) => {
                    const grad =
                      hotspot.severity === 'red'
                        ? 'url(#redHeat)'
                        : hotspot.severity === 'amber'
                        ? 'url(#amberHeat)'
                        : 'url(#greenHeat)';
                    return (
                      <G key={hotspot.id}>
                        {/* Glowing Radial Circle */}
                        <Circle
                          cx={hotspot.x}
                          cy={hotspot.y}
                          r={hotspot.radius}
                          fill={grad}
                          onPress={() => setSelectedHotspot(hotspot)}
                        />
                        {/* Heatmap center indicator */}
                        <Circle
                          cx={hotspot.x}
                          cy={hotspot.y}
                          r="5"
                          fill={
                            hotspot.severity === 'red'
                              ? Colors.red
                              : hotspot.severity === 'amber'
                              ? Colors.amber
                              : Colors.green
                          }
                          stroke="#FFFDF8"
                          strokeWidth="1"
                          onPress={() => setSelectedHotspot(hotspot)}
                        />
                      </G>
                    );
                  })}

                {/* Draw Highlighted Route for selected patrol vehicle */}
                {highlightRouteId && (() => {
                  const unit = ASSETS[activeRank].find((a) => a.id === highlightRouteId);
                  if (unit && unit.details?.route) {
                    return (
                      <Polyline
                        points={unit.details.route}
                        fill="none"
                        stroke={Colors.red}
                        strokeWidth="2.5"
                        strokeDasharray="5,5"
                        strokeOpacity="0.9"
                      />
                    );
                  }
                  return null;
                })()}

                {/* Labels for Regions */}
                {BOUNDARIES[activeRank].map((region) => (
                  <SvgText
                    key={`lbl-${region.id}`}
                    x={region.labelX}
                    y={region.labelY}
                    fill={Colors.steel}
                    fontSize="9.5"
                    fontFamily={FontFamily.mono}
                    textAnchor="middle"
                    opacity="0.65"
                  >
                    {region.name.toUpperCase()}
                  </SvgText>
                ))}

                {/* Draw Markers (Map Assets) */}
                {ASSETS[activeRank].map((asset) => {
                  // Check layer visibility
                  if (!activeLayers[asset.type]) return null;

                  // Render asset icon
                  const icon = renderMarkerIcon(asset.type, asset.severity);
                  const isPatrol = asset.type === 'patrol';

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
                      {/* Marker Icon Shield */}
                      <Circle
                        cx={asset.x}
                        cy={asset.y}
                        r={isPatrol ? '12' : '10'}
                        fill={isPatrol ? Colors.inkNavy : Colors.card}
                        stroke={
                          asset.severity === 'red'
                            ? Colors.red
                            : asset.severity === 'amber'
                            ? Colors.amber
                            : Colors.steel
                        }
                        strokeWidth="1.5"
                      />
                      {/* Emoji Icon overlay */}
                      <SvgText
                        x={asset.x}
                        y={asset.y + 4}
                        fontSize={isPatrol ? '10' : '9'}
                        textAnchor="middle"
                      >
                        {icon}
                      </SvgText>
                      {/* Short label */}
                      <SvgText
                        x={asset.x}
                        y={asset.y + 20}
                        fontSize="8.5"
                        fill={Colors.inkNavy}
                        fontFamily={FontFamily.bodyMedium}
                        textAnchor="middle"
                      >
                        {asset.label}
                      </SvgText>
                    </G>
                  );
                })}
              </Svg>

              {/* Map Floating Card Overlays */}

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
                        onPress={() => setHighlightRouteId(
                          highlightRouteId === selectedPatrol.patrolId ? null : selectedPatrol.patrolId
                        )}
                      >
                        <Text style={styles.actionBtnText}>
                          {highlightRouteId === selectedPatrol.patrolId ? '✓ Route Highlighted' : '🗺 View Route'}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionBtn, styles.actionBtnNavy]}
                        onPress={() => triggerComms(selectedPatrol.dutyOfficer)}
                      >
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
                      {selectedHotspot.recentIncidents.map((incident, idx) => (
                        <Text key={idx} style={styles.incidentBullet}>
                          • {incident}
                        </Text>
                      ))}
                    </View>

                    <View style={styles.incidentListBlock}>
                      <Text style={styles.cardLabel}>CLOSEST PATROL ASSETS</Text>
                      {selectedHotspot.nearbyPatrols.map((patrol, idx) => (
                        <Text key={idx} style={styles.incidentBullet}>
                          📌 {patrol}
                        </Text>
                      ))}
                    </View>

                    <View style={styles.cardActionsRow}>
                      <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={() => triggerComms('Station Dispatch Coordinator')}
                      >
                        <Text style={styles.actionBtnText}>🚔 Dispatch Patrols</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionBtn, styles.actionBtnNavy]}
                        onPress={() => {
                          setSelectedHotspot(null);
                          // Force navigation to case files
                          navigation.navigate('CaseFiles');
                        }}
                      >
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

                    {/* Simulating Video Frame with static noise lines */}
                    <View style={styles.cctvStreamWindow}>
                      {cctvFrame === 0 && <View style={styles.noiseLine1} />}
                      {cctvFrame === 1 && <View style={styles.noiseLine2} />}
                      {cctvFrame === 2 && <View style={styles.noiseLine3} />}
                      {cctvFrame === 3 && <View style={styles.noiseLine4} />}

                      {/* Moving timestamps & REC blinker */}
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
                      <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={() => triggerComms('Traffic Command Control')}
                      >
                        <Text style={styles.actionBtnText}>📞 Contact Traffic Control</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionBtn, styles.actionBtnNavy]}
                        onPress={() => setSelectedCctv(null)}
                      >
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
                    <Text style={[styles.cardValBold, { color: Colors.red, marginBottom: 8 }]}>
                      {selectedIncident.title}
                    </Text>
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
                      <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={() => triggerComms('Command Dispatch Center')}
                      >
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
                      <TouchableOpacity
                        style={[styles.actionBtn, styles.actionBtnNavy]}
                        onPress={() => handleViewCase(selectedFir.firNo)}
                      >
                        <Text style={styles.actionBtnTextWhite}>📁 Open Case Files</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              )}
            </View>
          </View>
        </View>
      </ScrollView>

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
  mainLayout: {
    padding: 16,
  },
  dashboardGrid: {
    flexDirection: Platform.OS === 'web' && Dimensions.get('window').width >= 992 ? 'row' : 'column',
    gap: 16,
  },
  sidebarPanel: {
    flex: 1,
    minWidth: 260,
    gap: 16,
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
    flex: 3,
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
    position: 'relative',
    backgroundColor: Colors.mapBg,
  },
  svgMap: {
    width: '100%',
    height: 500,
    backgroundColor: Colors.mapBg,
  },
  floatingOverlayCard: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    left: 12,
    backgroundColor: 'rgba(255, 253, 248, 0.96)',
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: 8,
    padding: 12,
    zIndex: 10,
    shadowColor: Colors.inkNavy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
    maxWidth: Platform.OS === 'web' ? 420 : undefined,
    alignSelf: Platform.OS === 'web' ? 'flex-end' : undefined,
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
