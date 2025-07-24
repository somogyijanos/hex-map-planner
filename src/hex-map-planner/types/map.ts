// Hex coordinate types based on Red Blob Games guide
export interface AxialCoordinate {
  q: number; // column
  r: number; // row
}

export interface CubeCoordinate {
  q: number;
  r: number;
  s: number; // s = -q - r (constraint)
}

export interface PixelCoordinate {
  x: number;
  y: number;
}

// Tile type definitions
export interface TileType {
  id: string;
  name: string;
  color: string;
  icon?: string; // Lucide icon name
  height: number; // elevation level (0-10)
  description?: string;
}

// Add-on definitions
export interface AddOn {
  id: string;
  name: string;
  icon: string; // Lucide icon name
  type: 'building' | 'nature' | 'decoration' | 'structure';
  description?: string;
}

// Individual tile instance
export interface Tile {
  id: string;
  type: TileType;
  position: AxialCoordinate;
  addOns: AddOn[];
  rotation?: number; // 0-5 (hex has 6 rotations)
}

// Map configuration
export interface MapConfig {
  showGrid: boolean;
  gridSize: number; // hex size in pixels
  gridOpacity: number;
  backgroundColor: string;
  centerPosition: PixelCoordinate;
  zoom: number;
}

// Complete map data structure for JSON export
export interface HexMap {
  id: string;
  name: string;
  description?: string;
  config: MapConfig;
  tiles: Tile[];
  tileTypes: TileType[];
  addOns: AddOn[];
  createdAt: string;
  updatedAt: string;
}

// UI state types
export interface MapState {
  selectedTileType: TileType | null;
  selectedAddOn: AddOn | null;
  selectedTile: Tile | null;
  isDragging: boolean;
  draggedTile: Tile | null;
  mode: 'add' | 'select' | 'drag' | 'pan' | 'remove';
}

// Default tile types
export const DEFAULT_TILE_TYPES: TileType[] = [
  {
    id: 'grass',
    name: 'Grass',
    color: 'hsl(120, 60%, 50%)',
    icon: 'TreePine',
    height: 1,
    description: 'Basic grass terrain'
  },
  {
    id: 'water',
    name: 'Water',
    color: 'hsl(210, 100%, 50%)',
    icon: 'Waves',
    height: 0,
    description: 'Water tiles'
  },
  {
    id: 'mountain',
    name: 'Mountain',
    color: 'hsl(30, 30%, 40%)',
    icon: 'Mountain',
    height: 5,
    description: 'Mountain terrain'
  },
  {
    id: 'desert',
    name: 'Desert',
    color: 'hsl(45, 80%, 70%)',
    icon: 'Sun',
    height: 1,
    description: 'Desert sand'
  }
];

// Default add-ons
export const DEFAULT_ADDONS: AddOn[] = [
  {
    id: 'house',
    name: 'House',
    icon: 'Home',
    type: 'building',
    description: 'Residential building'
  },
  {
    id: 'tree',
    name: 'Tree',
    icon: 'TreePine',
    type: 'nature',
    description: 'Large tree'
  },
  {
    id: 'tower',
    name: 'Tower',
    icon: 'Castle',
    type: 'structure',
    description: 'Watchtower or castle'
  },
  {
    id: 'road',
    name: 'Road',
    icon: 'Route',
    type: 'structure',
    description: 'Path or road'
  }
]; 