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

// Templates are now dynamically discovered from the public/templates directory
// No need for static template definitions 