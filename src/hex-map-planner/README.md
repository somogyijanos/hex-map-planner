# HexMapPlanner

A reusable React component for creating and editing hexagonal tile maps. Perfect for game development, map planning, or any application that needs hexagonal grid layouts.

## Features

- **Interactive Hexagonal Grid**: Create maps using hexagonal tiles
- **Multiple Tile Types**: Define custom tile types with colors, icons, and properties
- **Add-ons System**: Place decorative elements and structures on tiles
- **Multiple Editing Modes**: Add, select, drag, pan, and remove tiles
- **Import/Export**: Save and load maps as JSON files
- **Keyboard Shortcuts**: Efficient workflow with keyboard controls
- **Configurable**: Customizable grid size, colors, and behavior
- **Auto-save**: Automatic saving to localStorage
- **TypeScript Support**: Full type definitions included

## Installation

This component is designed to be easily portable. Simply copy the `hex-map-planner` folder to your project and install the required dependencies:

```bash
npm install react react-dom lucide-react clsx tailwind-merge
npm install @radix-ui/react-dialog @radix-ui/react-label @radix-ui/react-popover
npm install @radix-ui/react-progress @radix-ui/react-select @radix-ui/react-separator
npm install @radix-ui/react-slider @radix-ui/react-slot @radix-ui/react-switch
npm install @radix-ui/react-tabs @radix-ui/react-tooltip
npm install class-variance-authority
```

## Basic Usage

```tsx
import { HexMapPlanner } from './hex-map-planner';

function App() {
  return <HexMapPlanner />;
}
```

## Advanced Usage

```tsx
import { HexMapPlanner, HexMap } from './hex-map-planner';
import { toast } from 'sonner'; // or your preferred toast library

function App() {
  const handleToast = (type: 'success' | 'error', message: string) => {
    if (type === 'success') {
      toast.success(message);
    } else {
      toast.error(message);
    }
  };

  const handleMapChange = (map: HexMap) => {
    console.log('Map updated:', map);
    // Save to your backend, etc.
  };

  return (
    <HexMapPlanner 
      onToast={handleToast}
      onMapChange={handleMapChange}
      className="custom-styling"
    />
  );
}
```

## Props

### HexMapPlannerProps

| Prop | Type | Description |
|------|------|-------------|
| `className?` | `string` | Additional CSS classes to apply to the root element |
| `onToast?` | `(type: 'success' \| 'error', message: string) => void` | Callback for toast notifications |
| `initialMap?` | `HexMap` | Initial map data to load |
| `onMapChange?` | `(map: HexMap) => void` | Callback fired whenever the map changes |

## Keyboard Shortcuts

- **A**: Switch to Add mode
- **S**: Switch to Select mode  
- **M**: Switch to Move/Drag mode
- **P**: Switch to Pan mode
- **X**: Switch to Remove mode

## Types

The component exports comprehensive TypeScript types:

```tsx
import type { 
  HexMap, 
  Tile, 
  TileType, 
  AddOn, 
  MapConfig,
  AxialCoordinate 
} from './hex-map-planner';
```

## Utility Functions

The package also exports utility functions for hex math and map manipulation:

```tsx
import { 
  createNewMap,
  saveMapToStorage,
  loadMapFromStorage,
  hexDistance,
  axialToPixel,
  pixelToAxial 
} from './hex-map-planner';
```

## Styling

The component uses Tailwind CSS classes. Make sure your project has Tailwind CSS configured. The component respects CSS custom properties for theming:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;
  --muted: 210 40% 98%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --border: 214.3 31.8% 91.4%;
  /* ... other CSS variables */
}
```

## Data Structure

### HexMap
```tsx
interface HexMap {
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
```

### Tile
```tsx
interface Tile {
  id: string;
  type: TileType;
  position: AxialCoordinate;
  addOns: AddOn[];
  rotation?: number;
}
```

## Example: Custom Integration

```tsx
import { HexMapPlanner, createNewMap, HexMap } from './hex-map-planner';
import { useState } from 'react';

function MapEditor() {
  const [currentMap, setCurrentMap] = useState<HexMap>(() => 
    createNewMap('My Custom Map')
  );

  const handleSave = async (map: HexMap) => {
    try {
      await fetch('/api/maps', {
        method: 'POST',
        body: JSON.stringify(map),
        headers: { 'Content-Type': 'application/json' }
      });
      alert('Map saved to server!');
    } catch (error) {
      alert('Failed to save map');
    }
  };

  return (
    <div className="h-screen">
      <HexMapPlanner 
        initialMap={currentMap}
        onMapChange={(map) => {
          setCurrentMap(map);
          handleSave(map);
        }}
        onToast={(type, message) => console.log(`${type}: ${message}`)}
      />
    </div>
  );
}
```

## License

This component is designed to be reusable and portable. Feel free to adapt it to your needs. 