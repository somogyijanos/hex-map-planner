// Main HexMapPlanner component
export { HexMapPlanner, type HexMapPlannerProps } from './components/HexMapPlanner';

// Type definitions
export type {
  HexMap,
  Tile,
  TileType,
  AddOn,
  MapConfig,
  MapState,
  AxialCoordinate,
  CubeCoordinate,
  PixelCoordinate
} from './types/map';

// Utility functions for external use
export {
  createNewMap,
  saveMapToStorage,
  loadMapFromStorage,
  getMapList,
  deleteMapFromStorage,
  exportMapAsJSON,
  importMapFromJSON,
  generateId,
  createDefaultMapConfig
} from './lib/mapStorage';

export {
  axialToCube,
  cubeToAxial,
  axialToPixel,
  pixelToAxial,
  hexRound,
  hexDistance,
  hexNeighbors,
  hexRange,
  hexRing,
  hexEqual,
  getHexVertices,
  hexToSVGPath,
  pointInHex,
  HEX_SIZE
} from './lib/hexMath';

// Default data
export { DEFAULT_TILE_TYPES, DEFAULT_ADDONS } from './types/map'; 