import { HexMap, Tile, TileType, AddOn, MapConfig, DEFAULT_TILE_TYPES, DEFAULT_ADDONS } from '@/types/map';

// Generate unique IDs
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

// Create default map configuration
export function createDefaultMapConfig(): MapConfig {
  return {
    showGrid: true,
    gridSize: 50, // Now this is the actual visual size
    gridOpacity: 0.4,
    backgroundColor: 'hsl(var(--background))',
    centerPosition: { x: 400, y: 300 },
    zoom: 1
  };
}

// Create new empty map
export function createNewMap(name: string = 'New Map'): HexMap {
  return {
    id: generateId(),
    name,
    description: '',
    config: createDefaultMapConfig(),
    tiles: [],
    tileTypes: [...DEFAULT_TILE_TYPES],
    addOns: [...DEFAULT_ADDONS],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

// Save map to localStorage
export function saveMapToStorage(map: HexMap): void {
  try {
    const updatedMap = {
      ...map,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(`hex-map-${map.id}`, JSON.stringify(updatedMap));
    
    // Update map list
    const mapList = getMapList();
    const existingIndex = mapList.findIndex(m => m.id === map.id);
    const mapInfo = {
      id: map.id,
      name: map.name,
      description: map.description,
      createdAt: map.createdAt,
      updatedAt: updatedMap.updatedAt
    };
    
    if (existingIndex >= 0) {
      mapList[existingIndex] = mapInfo;
    } else {
      mapList.push(mapInfo);
    }
    
    localStorage.setItem('hex-map-list', JSON.stringify(mapList));
  } catch (error) {
    console.error('Failed to save map:', error);
    throw new Error('Failed to save map to storage');
  }
}

// Load map from localStorage
export function loadMapFromStorage(mapId: string): HexMap | null {
  try {
    const mapData = localStorage.getItem(`hex-map-${mapId}`);
    if (!mapData) return null;
    
    const map = JSON.parse(mapData) as HexMap;
    
    // Ensure map has default tile types and add-ons if missing
    if (!map.tileTypes || map.tileTypes.length === 0) {
      map.tileTypes = [...DEFAULT_TILE_TYPES];
    }
    if (!map.addOns || map.addOns.length === 0) {
      map.addOns = [...DEFAULT_ADDONS];
    }
    
    return map;
  } catch (error) {
    console.error('Failed to load map:', error);
    return null;
  }
}

// Get list of saved maps
export function getMapList(): Array<{
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}> {
  try {
    const listData = localStorage.getItem('hex-map-list');
    return listData ? JSON.parse(listData) : [];
  } catch (error) {
    console.error('Failed to load map list:', error);
    return [];
  }
}

// Delete map from storage
export function deleteMapFromStorage(mapId: string): void {
  try {
    localStorage.removeItem(`hex-map-${mapId}`);
    
    // Update map list
    const mapList = getMapList();
    const filteredList = mapList.filter(m => m.id !== mapId);
    localStorage.setItem('hex-map-list', JSON.stringify(filteredList));
  } catch (error) {
    console.error('Failed to delete map:', error);
    throw new Error('Failed to delete map from storage');
  }
}

// Export map as JSON file
export function exportMapAsJSON(map: HexMap): void {
  try {
    const jsonData = JSON.stringify(map, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${map.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to export map:', error);
    throw new Error('Failed to export map as JSON');
  }
}

// Import map from JSON file
export function importMapFromJSON(file: File): Promise<HexMap> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const jsonData = event.target?.result as string;
        const map = JSON.parse(jsonData) as HexMap;
        
        // Validate required fields
        if (!map.id || !map.name || !map.config || !Array.isArray(map.tiles)) {
          throw new Error('Invalid map format');
        }
        
        // Regenerate ID to avoid conflicts
        map.id = generateId();
        map.updatedAt = new Date().toISOString();
        
        // Ensure default values
        if (!map.tileTypes) map.tileTypes = [...DEFAULT_TILE_TYPES];
        if (!map.addOns) map.addOns = [...DEFAULT_ADDONS];
        
        resolve(map);
      } catch (error) {
        reject(new Error('Failed to parse JSON file'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
} 