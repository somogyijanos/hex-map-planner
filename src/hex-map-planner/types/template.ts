import { TileType, AddOn, AxialCoordinate } from './map';

export interface TemplateExample {
  name: string;
  description: string;
  tiles: {
    type: string; // references tileType id
    position: AxialCoordinate;
    addOns: string[]; // references addOn ids
  }[];
}

export interface MapTemplate {
  name: string;
  description: string;
  tileTypes: TileType[];
  addOns: AddOn[];
  examples: TemplateExample[];
}

export const AVAILABLE_TEMPLATES = [
  'fantasy',
  'modern',
  'sci-fi',
  'nature'
] as const;

export type TemplateId = typeof AVAILABLE_TEMPLATES[number]; 