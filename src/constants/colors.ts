// CrimeSphere AI — Design Token Colors
// Mirrors the CSS custom properties from the HTML prototype

export const Colors = {
  // Core palette
  inkNavy: '#14213D',
  inkNavy2: '#1B2C50',
  steel: '#2B3A55',
  steelLight: '#3C4E6E',

  // Backgrounds
  paper: '#F3F1EA',
  paperDim: '#E8E4D9',
  card: '#FFFDF8',

  // Status
  red: '#B23A2E',
  redDim: '#F4E2DF',
  green: '#3F6B4F',
  greenDim: '#E1E9E2',
  amber: '#B5811A',
  amberDim: '#F3E6C8',

  // Neutral
  gray: '#6B6F76',
  line: '#D8D3C4',

  // Sidebar
  sidebarBg: '#14213D',
  sidebarText: '#EDEBE2',
  sidebarMuted: '#A9AFC0',
  sidebarLabel: '#7C82A0',
  sidebarItem: '#CBCEDB',
  sidebarItemActive: '#FFFFFF',
  sidebarSeparator: 'rgba(255,255,255,0.1)',
  sidebarHover: 'rgba(255,255,255,0.05)',
  sidebarActiveItem: 'rgba(255,255,255,0.08)',

  // Utility
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',

  // Map specific
  mapBg: '#EDEAE0',
  mapGrid: '#D9D4C4',
  mapRoad: '#C9C2AC',
} as const;

export type ColorKey = keyof typeof Colors;
