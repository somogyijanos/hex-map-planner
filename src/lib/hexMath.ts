import { AxialCoordinate, CubeCoordinate, PixelCoordinate } from '@/types/map';

// Hex constants for flat-top hexagons (easier orientation)
export const HEX_SIZE = 40; // radius in pixels
export const HEX_WIDTH = Math.sqrt(3) * HEX_SIZE;
export const HEX_HEIGHT = 2 * HEX_SIZE;

// Conversion between coordinate systems
export function axialToCube(axial: AxialCoordinate): CubeCoordinate {
  return {
    q: axial.q,
    r: axial.r,
    s: -axial.q - axial.r
  };
}

export function cubeToAxial(cube: CubeCoordinate): AxialCoordinate {
  return {
    q: cube.q,
    r: cube.r
  };
}

// Convert axial coordinates to pixel coordinates (flat-top hex)
export function axialToPixel(axial: AxialCoordinate, size: number = HEX_SIZE): PixelCoordinate {
  const x = size * (Math.sqrt(3) * axial.q + Math.sqrt(3) / 2 * axial.r);
  const y = size * (3 / 2 * axial.r);
  return { x, y };
}

// Convert pixel coordinates to axial coordinates
export function pixelToAxial(pixel: PixelCoordinate, size: number = HEX_SIZE): AxialCoordinate {
  const q = (Math.sqrt(3) / 3 * pixel.x - 1 / 3 * pixel.y) / size;
  const r = (2 / 3 * pixel.y) / size;
  return hexRound({ q, r });
}

// Round fractional hex coordinates to nearest integer hex
export function hexRound(hex: AxialCoordinate): AxialCoordinate {
  const cube = axialToCube(hex);
  let rq = Math.round(cube.q);
  let rr = Math.round(cube.r);
  let rs = Math.round(cube.s);

  const qDiff = Math.abs(rq - cube.q);
  const rDiff = Math.abs(rr - cube.r);
  const sDiff = Math.abs(rs - cube.s);

  if (qDiff > rDiff && qDiff > sDiff) {
    rq = -rr - rs;
  } else if (rDiff > sDiff) {
    rr = -rq - rs;
  } else {
    rs = -rq - rr;
  }

  return { q: rq, r: rr };
}

// Calculate distance between two hex tiles
export function hexDistance(a: AxialCoordinate, b: AxialCoordinate): number {
  const ac = axialToCube(a);
  const bc = axialToCube(b);
  return Math.max(Math.abs(ac.q - bc.q), Math.abs(ac.r - bc.r), Math.abs(ac.s - bc.s));
}

// Get neighboring hex coordinates
export function hexNeighbors(center: AxialCoordinate): AxialCoordinate[] {
  const directions = [
    { q: 1, r: 0 }, { q: 1, r: -1 }, { q: 0, r: -1 },
    { q: -1, r: 0 }, { q: -1, r: 1 }, { q: 0, r: 1 }
  ];
  
  return directions.map(dir => ({
    q: center.q + dir.q,
    r: center.r + dir.r
  }));
}

// Generate hex coordinates in a radius around center
export function hexRange(center: AxialCoordinate, radius: number): AxialCoordinate[] {
  const results: AxialCoordinate[] = [];
  
  for (let q = -radius; q <= radius; q++) {
    const r1 = Math.max(-radius, -q - radius);
    const r2 = Math.min(radius, -q + radius);
    
    for (let r = r1; r <= r2; r++) {
      results.push({
        q: center.q + q,
        r: center.r + r
      });
    }
  }
  
  return results;
}

// Generate hex ring at specific distance
export function hexRing(center: AxialCoordinate, radius: number): AxialCoordinate[] {
  if (radius === 0) return [center];
  
  const results: AxialCoordinate[] = [];
  const directions = [
    { q: 1, r: 0 }, { q: 1, r: -1 }, { q: 0, r: -1 },
    { q: -1, r: 0 }, { q: -1, r: 1 }, { q: 0, r: 1 }
  ];
  
  let current = {
    q: center.q + directions[4].q * radius,
    r: center.r + directions[4].r * radius
  };
  
  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < radius; j++) {
      results.push({ ...current });
      current = {
        q: current.q + directions[i].q,
        r: current.r + directions[i].r
      };
    }
  }
  
  return results;
}

// Check if two hex coordinates are equal
export function hexEqual(a: AxialCoordinate, b: AxialCoordinate): boolean {
  return a.q === b.q && a.r === b.r;
}

// Get hex vertices for rendering (flat-top orientation)
export function getHexVertices(center: PixelCoordinate, size: number = HEX_SIZE): PixelCoordinate[] {
  const vertices: PixelCoordinate[] = [];
  
  for (let i = 0; i < 6; i++) {
    const angle = (60 * i - 30) * Math.PI / 180; // flat-top orientation
    const x = center.x + size * Math.cos(angle);
    const y = center.y + size * Math.sin(angle);
    vertices.push({ x, y });
  }
  
  return vertices;
}

// Generate SVG path for hexagon
export function hexToSVGPath(center: PixelCoordinate, size: number = HEX_SIZE): string {
  const vertices = getHexVertices(center, size);
  const path = vertices.map((vertex, index) => 
    `${index === 0 ? 'M' : 'L'} ${vertex.x} ${vertex.y}`
  ).join(' ') + ' Z';
  
  return path;
}

// Check if point is inside hexagon
export function pointInHex(point: PixelCoordinate, hexCenter: PixelCoordinate, size: number = HEX_SIZE): boolean {
  const hex = pixelToAxial({
    x: point.x - hexCenter.x,
    y: point.y - hexCenter.y
  }, size);
  
  const rounded = hexRound(hex);
  return hexEqual(rounded, { q: 0, r: 0 });
} 