'use client';

import React from 'react';
import { Tile } from '../../types/map';
import { axialToPixel, hexToSVGPath, HEX_SIZE } from '../../lib/hexMath';
import { Badge } from '../../ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../ui/tooltip';
import * as LucideIcons from 'lucide-react';
import { cn } from '../../lib/utils';

interface HexTileProps {
  tile: Tile;
  isSelected?: boolean;
  isHovered?: boolean;
  isDragging?: boolean;
  onSelect?: (tile: Tile) => void;
  onDragStart?: (tile: Tile, event: React.DragEvent) => void;

  size?: number;
}

export function HexTile({
  tile,
  isSelected = false,
  isHovered = false,
  isDragging = false,
  onSelect,
  onDragStart,
  size = HEX_SIZE
}: HexTileProps) {
  // Use the screen position passed from the canvas if available, otherwise calculate
  const pixelPos = (tile as any).screenPosition || axialToPixel(tile.position, size); // eslint-disable-line @typescript-eslint/no-explicit-any
  const hexPath = hexToSVGPath(pixelPos, size);
  
  // Get icon component dynamically - disable lint for dynamic import
  const IconComponent = tile.type.icon 
    ? (LucideIcons as any)[tile.type.icon] // eslint-disable-line @typescript-eslint/no-explicit-any
    : null;

  // Calculate shadow offset based on height for 3D effect
  const shadowOffset = tile.type.height * 2;
  const shadowOpacity = Math.min(0.3, tile.type.height * 0.05);

  // Calculate a more intensive/contrasted version of the tile color
  const getSelectionColor = () => {
    try {
      let r, g, b;
      
      if (tile.type.color.startsWith('hsl')) {
        // Parse HSL format: hsl(h, s%, l%)
        const hslMatch = tile.type.color.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
        if (hslMatch) {
          const h = parseInt(hslMatch[1]) / 360;
          const s = parseInt(hslMatch[2]) / 100;
          const l = parseInt(hslMatch[3]) / 100;
          
          // Convert HSL to RGB
          const hslToRgb = (h: number, s: number, l: number) => {
            let r, g, b;
            if (s === 0) {
              r = g = b = l; // achromatic
            } else {
              const hue2rgb = (p: number, q: number, t: number) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1/6) return p + (q - p) * 6 * t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
              };
              const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
              const p = 2 * l - q;
              r = hue2rgb(p, q, h + 1/3);
              g = hue2rgb(p, q, h);
              b = hue2rgb(p, q, h - 1/3);
            }
            return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
          };
          
          [r, g, b] = hslToRgb(h, s, l);
        } else {
          throw new Error('Invalid HSL format');
        }
      } else {
        // Handle hex format
        let hex = tile.type.color.replace('#', '');
        if (hex.length === 3) {
          hex = hex.split('').map(char => char + char).join('');
        }
        r = parseInt(hex.substr(0, 2), 16);
        g = parseInt(hex.substr(2, 2), 16);
        b = parseInt(hex.substr(4, 2), 16);
      }
      
      // Calculate luminance to determine if we should go darker or lighter
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      
      let selectionColor;
      // If tile is light, make selection darker; if dark, make it lighter
      if (luminance > 0.5) {
        // Make darker and more saturated
        const factor = 0.3;
        selectionColor = `rgb(${Math.floor(r * factor)}, ${Math.floor(g * factor)}, ${Math.floor(b * factor)})`;
      } else {
        // Make lighter and more vibrant
        const factor = 2.0;
        selectionColor = `rgb(${Math.min(255, Math.floor(r * factor))}, ${Math.min(255, Math.floor(g * factor))}, ${Math.min(255, Math.floor(b * factor))})`;
      }
      
      return selectionColor;
      
    } catch {
      // Fallback to a bright blue if color parsing fails
      return '#3b82f6';
    }
  };

  const handleClick = () => {
    onSelect?.(tile);
  };

  // Drag handlers will be implemented at canvas level
  const handleMouseDown = (event: React.MouseEvent) => {
    if (event.button === 0) { // Left click only
      onDragStart?.(tile, event as any); // eslint-disable-line @typescript-eslint/no-explicit-any
    }
  };

  const tileContent = (
    <g
      className={cn(
        isSelected && "drop-shadow-lg",
        isHovered && "filter brightness-110",
        isDragging && "opacity-50"
      )}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
    >
            {/* Shadow for height effect */}
            {tile.type.height > 0 && size > 25 && ( // Only render shadow when zoomed in enough
              <path
                d={hexPath}
                fill="black"
                opacity={shadowOpacity}
                transform={`translate(${shadowOffset}, ${shadowOffset})`}
                style={{ pointerEvents: 'none' }}
              />
            )}
            
            {/* Main hex tile */}
            <path
              d={hexPath}
              fill={tile.type.color}
              stroke="hsl(var(--border))"
              strokeWidth="1"
            />

            {/* Selection outline - rendered after main tile */}
            {isSelected && (
              <path
                d={hexPath}
                fill="none"
                stroke={getSelectionColor()}
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  pointerEvents: 'none'
                }}
              />
            )}

            {/* Tile type icon - top center, scaled with size */}
            {IconComponent && size > 30 && (
              <foreignObject
                x={pixelPos.x - size * 0.3}
                y={pixelPos.y - size * 0.45} // Scale with hex size
                width={size * 0.6}
                height={size * 0.6}
                style={{ pointerEvents: 'none' }}
              >
                <IconComponent 
                  size={Math.max(16, size * 0.5)} 
                  className="text-foreground/80 drop-shadow-sm"
                />
              </foreignObject>
            )}

            {/* Height indicator - center, scaled positioning */}
            {tile.type.height > 0 && size > 25 && (
              <text
                x={pixelPos.x}
                y={IconComponent && size > 30 ? pixelPos.y + size * 0.15 : pixelPos.y}
                fill="hsl(var(--background))"
                stroke="hsl(var(--foreground))"
                strokeWidth="0.5"
                fontSize={Math.max(8, size / 4)}
                textAnchor="middle"
                dominantBaseline="middle"
                className="font-bold"
                style={{ 
                  pointerEvents: 'none',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.7)'
                }}
              >
                {tile.type.height}
              </text>
            )}

            {/* Add-ons display - bottom area, scaled positioning */}
            {tile.addOns.length > 0 && size > 40 && (
              <g>
                {tile.addOns.slice(0, 2).map((addOn, index) => {
                  const AddOnIcon = (LucideIcons as any)[addOn.icon]; // eslint-disable-line @typescript-eslint/no-explicit-any
                  const offsetX = (index - 0.5) * size * 0.3; // Scale spacing with size
                  const offsetY = size * 0.55; // Scale position with size
                  
                  return AddOnIcon ? (
                    <foreignObject
                      key={addOn.id}
                      x={pixelPos.x + offsetX - size * 0.15}
                      y={pixelPos.y + offsetY - size * 0.15}
                      width={size * 0.3}
                      height={size * 0.3}
                      style={{ pointerEvents: 'none' }}
                    >
                      <AddOnIcon 
                        size={Math.max(6, size * 0.2)} 
                        className="text-foreground drop-shadow-sm"
                      />
                    </foreignObject>
                  ) : null;
                })}
                
                {/* Show count if more than 2 add-ons, scaled positioning */}
                {tile.addOns.length > 2 && size > 50 && (
                  <foreignObject
                    x={pixelPos.x + size * 0.4}
                    y={pixelPos.y + size * 0.4}
                    width={size * 0.5}
                    height={size * 0.3}
                    style={{ pointerEvents: 'none' }}
                  >
                    <Badge 
                      variant="secondary" 
                      className="text-xs px-1 py-0 h-auto"
                      style={{ fontSize: Math.max(8, size * 0.12) }}
                    >
                      +{tile.addOns.length - 2}
                    </Badge>
                  </foreignObject>
                )}
              </g>
            )}
          </g>
  );

  // Don't show tooltip during dragging to prevent rendering interference
  if (isDragging) {
    return tileContent;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {tileContent}
        </TooltipTrigger>
        
        <TooltipContent side="top" className="max-w-48">
          <div className="space-y-1">
            <div className="font-semibold">{tile.type.name}</div>
            {tile.type.description && (
              <div className="text-xs text-muted-foreground">
                {tile.type.description}
              </div>
            )}
            <div className="text-xs">
              Height: {tile.type.height} | Position: ({tile.position.q}, {tile.position.r})
            </div>
            {tile.addOns.length > 0 && (
              <div className="text-xs">
                Add-ons: {tile.addOns.map(a => a.name).join(', ')}
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
} 