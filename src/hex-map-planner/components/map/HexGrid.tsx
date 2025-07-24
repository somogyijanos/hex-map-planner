'use client';

import React from 'react';
import { PixelCoordinate } from '../../types/map';
import { axialToPixel, hexToSVGPath, hexRange, pixelToAxial } from '../../lib/hexMath';

interface HexGridProps {
  centerPosition: PixelCoordinate;
  viewportSize: { width: number; height: number };
  hexSize: number; // This is the visual size (effectiveHexSize * totalZoom)
  opacity?: number;
  visible?: boolean;
  gridColor?: string;
}

export function HexGrid({
  centerPosition,
  viewportSize,
  hexSize,
  opacity = 0.3,
  visible = true,
  gridColor = '#e2e8f0'
}: HexGridProps) {
  if (!visible) return null;

  // Constants
  const BASE_HEX_SIZE = 40; // Must match MapCanvas
  
  // Calculate zoom from visual size
  const totalZoom = hexSize / BASE_HEX_SIZE;
  
  // Calculate which hexes should be visible based on current camera position
  const viewCenterInWorldSpace = {
    x: -centerPosition.x / totalZoom,
    y: -centerPosition.y / totalZoom
  };
  
  const centerHex = pixelToAxial(viewCenterInWorldSpace, BASE_HEX_SIZE);
  
  // Calculate how many hexes we need to cover the viewport plus some buffer
  const hexWidth = Math.sqrt(3) * hexSize;
  const hexHeight = 2 * hexSize;
  const radiusX = Math.ceil(viewportSize.width / hexWidth) + 3;
  const radiusY = Math.ceil(viewportSize.height / hexHeight) + 3;
  const radius = Math.max(radiusX, radiusY, 10); // Ensure minimum radius
  
  const gridHexes = hexRange(centerHex, radius);

  return (
    <g className="hex-grid" opacity={opacity}>
      {gridHexes.map(hex => {
        const pixelPos = axialToPixel(hex, BASE_HEX_SIZE);
        const screenPos = {
          x: pixelPos.x * totalZoom + centerPosition.x + viewportSize.width / 2,
          y: pixelPos.y * totalZoom + centerPosition.y + viewportSize.height / 2
        };
        
        const hexPath = hexToSVGPath(screenPos, hexSize);
        
        // Calculate stroke width that scales with hex size for consistent appearance
        const strokeWidth = Math.max(0.5, hexSize / 50); // Scale stroke width with hex size
        
        return (
          <path
            key={`grid-${hex.q}-${hex.r}`}
            d={hexPath}
            fill="none"
            stroke={gridColor}
            strokeWidth={strokeWidth}
            className="pointer-events-none"
          />
        );
      })}
      
      {/* Grid coordinate labels (for debugging in development) */}
      {process.env.NODE_ENV === 'development' && hexSize > 30 && gridHexes.slice(0, 20).map(hex => {
        const pixelPos = axialToPixel(hex, BASE_HEX_SIZE);
        const screenPos = {
          x: pixelPos.x * totalZoom + centerPosition.x + viewportSize.width / 2,
          y: pixelPos.y * totalZoom + centerPosition.y + viewportSize.height / 2
        };
        
        // Only show labels for hexes near center of screen and when zoomed in enough
        if (
          screenPos.x > viewportSize.width * 0.2 && 
          screenPos.x < viewportSize.width * 0.8 &&
          screenPos.y > viewportSize.height * 0.2 && 
          screenPos.y < viewportSize.height * 0.8
        ) {
          return (
            <text
              key={`label-${hex.q}-${hex.r}`}
              x={screenPos.x}
              y={screenPos.y + 3}
              fill="currentColor"
              fontSize={Math.max(8, hexSize / 6)}
              textAnchor="middle"
              className="pointer-events-none font-mono opacity-40 text-muted-foreground"
              style={{ color: 'hsl(var(--muted-foreground))' }}
            >
              {hex.q},{hex.r}
            </text>
          );
        }
        return null;
      })}
    </g>
  );
} 