import { MapTemplate, TemplateId, AVAILABLE_TEMPLATES } from '../types/template';
import { HexMap, Tile, AddOn } from '../types/map';
import { generateId, createDefaultMapConfig } from './mapStorage';

export async function loadTemplate(templateId: TemplateId): Promise<MapTemplate> {
  try {
    const response = await fetch(`/templates/${templateId}.json`);
    if (!response.ok) {
      throw new Error(`Failed to load template: ${response.status}`);
    }
    const template = await response.json() as MapTemplate;
    return template;
  } catch (error) {
    console.error(`Error loading template ${templateId}:`, error);
    throw new Error(`Failed to load template ${templateId}`);
  }
}

export async function createMapFromTemplate(
  templateId: TemplateId,
  exampleName?: string,
  mapName?: string
): Promise<HexMap> {
  const template = await loadTemplate(templateId);
  
  // Find the example if specified
  const example = exampleName 
    ? template.examples.find(e => e.name === exampleName)
    : null;
  
  // Create tile types and addons with new IDs to avoid conflicts
  const tileTypes = template.tileTypes.map(tt => ({
    ...tt,
    id: generateId()
  }));
  
  const addOns = template.addOns.map(ao => ({
    ...ao,
    id: generateId()
  }));
  
  // Create lookup maps for converting example data
  const tileTypeMap = new Map<string, string>();
  const addOnMap = new Map<string, string>();
  
  template.tileTypes.forEach((originalTT, index) => {
    tileTypeMap.set(originalTT.id, tileTypes[index].id);
  });
  
  template.addOns.forEach((originalAO, index) => {
    addOnMap.set(originalAO.id, addOns[index].id);
  });
  
  // Convert example tiles if we have an example
  const tiles: Tile[] = example ? example.tiles.map(exampleTile => {
    const tileType = tileTypes.find(tt => tileTypeMap.get(exampleTile.type) === tt.id);
    if (!tileType) {
      throw new Error(`Tile type ${exampleTile.type} not found in template`);
    }
    
    const tileAddOns = exampleTile.addOns
      .map(addOnId => addOns.find(ao => addOnMap.get(addOnId) === ao.id))
      .filter((ao): ao is AddOn => ao !== undefined);
    
    return {
      id: generateId(),
      type: tileType,
      position: exampleTile.position,
      addOns: tileAddOns,
      rotation: 0
    };
  }) : [];
  
  return {
    id: generateId(),
    name: mapName || `New ${template.name} Map`,
    description: example ? `Based on ${example.description}` : `Created from ${template.name} template`,
    config: createDefaultMapConfig(),
    tiles,
    tileTypes,
    addOns,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

export function getAvailableTemplates(): TemplateId[] {
  return [...AVAILABLE_TEMPLATES];
} 