'use client';

import React, { useState, useRef, useCallback, useEffect, useMemo, useLayoutEffect } from 'react';
import { Tile, TileType, AddOn, MapConfig, AxialCoordinate, PixelCoordinate, MapState } from '@/types/map';
import { HexTile } from './HexTile';
import { HexGrid } from './HexGrid';
import { pixelToAxial, axialToPixel, hexEqual } from '@/lib/hexMath';
import { generateId } from '@/lib/mapStorage';

interface MapCanvasProps {
  tiles: Tile[];
  config: MapConfig;
  mapState: MapState;
  onTileAdd: (tile: Tile) => void;
  onTileUpdate: (tile: Tile) => void;
  onTileDelete: (tileId: string) => void;
  onTileSelect: (tile: Tile | null) => void;
  onResetViewRef?: (resetFn: () => void) => void;
  className?: string;
}

export function MapCanvas({
  tiles,
  config,
  mapState,
  onTileAdd,
  onTileUpdate,
  onTileDelete,
  onTileSelect,
  onResetViewRef,
  className = ''
}: MapCanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 }); // Start with 0 to prevent initial misalignment
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<PixelCoordinate | null>(null);
  const [cameraPosition, setCameraPosition] = useState({ x: 0, y: 0 });
  const [zoomLevel, setZoomLevel] = useState(1);
  const [draggedTile, setDraggedTile] = useState<Tile | null>(null);
  const [isInitialized, setIsInitialized] = useState(false); // Track initialization

  // Constants for coordinate system
  const BASE_HEX_SIZE = 40; // Base size for coordinate calculations
  
  // Calculate effective hex size from config (this is what users see)
  const effectiveHexSize = config.gridSize; // config.gridSize is now the visual size
  
  // Calculate zoom multiplier from effective size
  const zoom = effectiveHexSize / BASE_HEX_SIZE;
  
  // Combine user zoom with size-based zoom
  const totalZoom = zoom * zoomLevel;

  // Zoom limits for user zoom (not affecting base grid size)
  const MIN_USER_ZOOM = 0.5;
  const MAX_USER_ZOOM = 3;
  
  // Keyboard state
  const [isSpacePressed, setIsSpacePressed] = useState(false);

  // Update viewport size on mount and resize - use useLayoutEffect for synchronous execution
  useLayoutEffect(() => {
    const updateSize = () => {
      if (svgRef.current) {
        const rect = svgRef.current.getBoundingClientRect();
        const newSize = { width: rect.width, height: rect.height };
        setViewportSize(newSize);
        
        // Mark as initialized once we have proper dimensions
        if (newSize.width > 0 && newSize.height > 0) {
          setIsInitialized(true);
        }
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    
    // Force update after a brief delay to ensure DOM is fully rendered
    const timeoutId = setTimeout(updateSize, 10);
    
    // Cleanup function
    return () => {
      window.removeEventListener('resize', updateSize);
      clearTimeout(timeoutId);
      // Clean up any pending wheel animation frame
      if (wheelThrottleRef.current) {
        cancelAnimationFrame(wheelThrottleRef.current);
        wheelThrottleRef.current = null;
      }
    };
  }, []);

  // Reset view to origin
  const resetView = useCallback(() => {
    setCameraPosition({ x: 0, y: 0 });
    setZoomLevel(1);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.target !== document.body) return; // Only when not in input fields
      
      switch (event.code) {
        case 'Space':
          event.preventDefault();
          setIsSpacePressed(true);
          break;
        case 'KeyR':
          if (!event.ctrlKey && !event.metaKey) {
            event.preventDefault();
            resetView();
          }
          break;
        case 'Equal':
        case 'NumpadAdd':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            setZoomLevel(prev => Math.min(MAX_USER_ZOOM, prev * 1.05)); // Changed from 1.2 to 1.05
          }
          break;
        case 'Minus':
        case 'NumpadSubtract':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            setZoomLevel(prev => Math.max(MIN_USER_ZOOM, prev * 0.95)); // Changed from /1.2 to *0.95
          }
          break;
        case 'ArrowUp':
          if (!event.ctrlKey && !event.metaKey) {
            event.preventDefault();
            setCameraPosition(prev => ({ x: prev.x, y: prev.y + 50 }));
          }
          break;
        case 'ArrowDown':
          if (!event.ctrlKey && !event.metaKey) {
            event.preventDefault();
            setCameraPosition(prev => ({ x: prev.x, y: prev.y - 50 }));
          }
          break;
        case 'ArrowLeft':
          if (!event.ctrlKey && !event.metaKey) {
            event.preventDefault();
            setCameraPosition(prev => ({ x: prev.x + 50, y: prev.y }));
          }
          break;
        case 'ArrowRight':
          if (!event.ctrlKey && !event.metaKey) {
            event.preventDefault();
            setCameraPosition(prev => ({ x: prev.x - 50, y: prev.y }));
          }
          break;
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        setIsSpacePressed(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [resetView]);

  // Expose resetView to parent (for toolbar button)
  useEffect(() => {
    if (onResetViewRef) {
      onResetViewRef(resetView);
    }
  }, [onResetViewRef, resetView]);

  // Create a ref to expose resetView function
  const resetViewRef = useCallback(() => {
    resetView();
  }, [resetView]);

  // Notify parent of resetView function on mount
  useEffect(() => {
    if (onResetViewRef) {
      onResetViewRef(resetView);
    }
  }, []);

  // Use requestAnimationFrame for smoother zooming
  const wheelThrottleRef = useRef<number | null>(null);

  // Handle mouse wheel zoom
  const handleWheel = useCallback((event: React.WheelEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    
    event.preventDefault();
    
    // Use requestAnimationFrame for smooth updates aligned with browser refresh rate
    if (wheelThrottleRef.current) {
      return;
    }
    
    wheelThrottleRef.current = requestAnimationFrame(() => {
      wheelThrottleRef.current = null;
    });
    
    const rect = svgRef.current.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    
    // Calculate zoom change with smaller, smoother increments
    const zoomFactor = event.deltaY > 0 ? 0.95 : 1.05; // Changed from 0.9/1.1 to 0.95/1.05
    const newZoomLevel = Math.max(MIN_USER_ZOOM, Math.min(MAX_USER_ZOOM, zoomLevel * zoomFactor));
    
    if (newZoomLevel !== zoomLevel) {
      // Zoom towards mouse cursor with batch state update for smoothness
      const zoomRatio = newZoomLevel / zoomLevel;
      const centerX = viewportSize.width / 2;
      const centerY = viewportSize.height / 2;
      
      // Use a single state update with functional setState to avoid race conditions
      const newCameraX = cameraPosition.x + (mouseX - centerX) * (1 - zoomRatio);
      const newCameraY = cameraPosition.y + (mouseY - centerY) * (1 - zoomRatio);
      
      // Batch updates using React's automatic batching
      setZoomLevel(newZoomLevel);
      setCameraPosition({ x: newCameraX, y: newCameraY });
    }
  }, [zoomLevel, viewportSize, cameraPosition]);

  // Handle canvas click to place new tiles
  const handleCanvasClick = useCallback((event: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current || isDragging) return;

    const rect = svgRef.current.getBoundingClientRect();
    const clickPos: PixelCoordinate = {
      x: (event.clientX - rect.left - viewportSize.width / 2 - cameraPosition.x) / totalZoom,
      y: (event.clientY - rect.top - viewportSize.height / 2 - cameraPosition.y) / totalZoom
    };

    // Convert to hex coordinates using base size
    const hexPos = pixelToAxial(clickPos, BASE_HEX_SIZE);

    // Check if there's already a tile at this position
    const existingTile = tiles.find(tile => hexEqual(tile.position, hexPos));

    if (mapState.mode === 'add' && mapState.selectedTileType && !existingTile) {
      // Place new tile
      const newTile: Tile = {
        id: generateId(),
        type: mapState.selectedTileType,
        position: hexPos,
        addOns: []
      };
      onTileAdd(newTile);
    } else if (mapState.mode === 'remove' && existingTile) {
      // Delete existing tile
      onTileDelete(existingTile.id);
    } else if (mapState.mode === 'select' && existingTile) {
      // Select tile
      onTileSelect(existingTile);
    } else if (!existingTile && (mapState.mode === 'select' || mapState.mode === 'drag')) {
      // Deselect tile when clicking on empty space in select/drag modes
      onTileSelect(null);
    }
    // In 'pan' mode, do nothing - just allow panning
    // In 'drag' mode, tile dragging is handled by tile mouse handlers
  }, [isDragging, cameraPosition, tiles, mapState, onTileAdd, onTileDelete, onTileSelect, viewportSize, totalZoom]);

  // Handle tile selection
  const handleTileSelect = useCallback((tile: Tile) => {
    onTileSelect(tile);
  }, [onTileSelect]);

  // Handle tile dragging
  const handleTileDragStart = useCallback((tile: Tile, event: React.MouseEvent) => {
    // Only allow dragging in drag mode
    if (mapState.mode !== 'drag') {
      // In select mode, just select the tile
      if (mapState.mode === 'select') {
        onTileSelect(tile);
      }
      return;
    }
    
    event.stopPropagation();
    setIsDragging(true);
    setDragStart({ x: event.clientX, y: event.clientY });
    setDraggedTile(tile);
    onTileSelect(tile);
  }, [onTileSelect, mapState.mode]);

  // Pan the camera
  const handleMouseDown = useCallback((event: React.MouseEvent<SVGSVGElement>) => {
    // Pan conditions: middle mouse, Alt+click, right click, spacebar+left click, or left click in pan mode
    if (event.button === 1 || 
        (event.button === 0 && event.altKey) || 
        event.button === 2 ||
        (event.button === 0 && isSpacePressed) ||
        (event.button === 0 && mapState.mode === 'pan')) {
      event.preventDefault();
      setIsDragging(true);
      setDragStart({ x: event.clientX, y: event.clientY });
    }
  }, [isSpacePressed, mapState.mode]);

  const handleMouseMove = useCallback((event: React.MouseEvent<SVGSVGElement>) => {
    if (isDragging && dragStart) {
      event.preventDefault();
      
      if (draggedTile) {
        // Handle tile dragging - move the tile to new position
        const rect = svgRef.current?.getBoundingClientRect();
        if (rect) {
          const newClickPos: PixelCoordinate = {
            x: (event.clientX - rect.left - viewportSize.width / 2 - cameraPosition.x) / totalZoom,
            y: (event.clientY - rect.top - viewportSize.height / 2 - cameraPosition.y) / totalZoom
          };
          
          const newHexPos = pixelToAxial(newClickPos, BASE_HEX_SIZE);
          
          // Check if the new position is empty (don't allow dropping on existing tiles)
          const existingTileAtNewPos = tiles.find(tile => 
            tile.id !== draggedTile.id && hexEqual(tile.position, newHexPos)
          );
          
          if (!existingTileAtNewPos) {
            // Update the dragged tile's position
            const updatedTile = { ...draggedTile, position: newHexPos };
            onTileUpdate(updatedTile);
            setDraggedTile(updatedTile);
          }
        }
      } else {
        // Handle camera panning
        const deltaX = event.clientX - dragStart.x;
        const deltaY = event.clientY - dragStart.y;
        
        setCameraPosition(prev => ({
          x: prev.x + deltaX,
          y: prev.y + deltaY
        }));
        
        setDragStart({ x: event.clientX, y: event.clientY });
      }
    }
  }, [isDragging, dragStart, draggedTile, tiles, viewportSize, cameraPosition, totalZoom, onTileUpdate]);

  const handleMouseUp = useCallback((event: React.MouseEvent<SVGSVGElement>) => {
    if (isDragging) {
      event.preventDefault();
    }
    setIsDragging(false);
    setDragStart(null);
    setDraggedTile(null);
  }, [isDragging]);

  // Prevent context menu on right click
  const handleContextMenu = useCallback((event: React.MouseEvent<SVGSVGElement>) => {
    event.preventDefault();
  }, []);





  // Transform tiles to screen coordinates
  const transformedTiles = useMemo(() => {
    return tiles.map(tile => {
      const pixelPos = axialToPixel(tile.position, BASE_HEX_SIZE);
      return {
        ...tile,
        screenPosition: {
          x: pixelPos.x * totalZoom + cameraPosition.x + viewportSize.width / 2,
          y: pixelPos.y * totalZoom + cameraPosition.y + viewportSize.height / 2
        }
      };
    });
  }, [tiles, cameraPosition, viewportSize, totalZoom]);

  // Filter visible tiles for performance - memoized
  const visibleTiles = useMemo(() => {
    const cullDistance = effectiveHexSize * zoomLevel * 2;
    return transformedTiles.filter(tile => {
      const pos = tile.screenPosition!;
      return pos.x > -cullDistance && 
             pos.x < viewportSize.width + cullDistance &&
             pos.y > -cullDistance && 
             pos.y < viewportSize.height + cullDistance;
    });
  }, [transformedTiles, effectiveHexSize, zoomLevel, viewportSize]);

  return (
    <div ref={containerRef}
         className={`relative w-full h-full overflow-hidden bg-background ${className}`}>
      <svg
        ref={svgRef}
        className="w-full h-full"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleCanvasClick}
        onContextMenu={handleContextMenu}
        onWheel={handleWheel}
        style={{ 
          backgroundColor: config.backgroundColor,
          willChange: 'transform',
          transform: 'translateZ(0)', // Force hardware acceleration
          backfaceVisibility: 'hidden', // Optimize for 3D transforms
          perspective: '1000px' // Enable 3D context
        }}
      >
        {/* Only render content after proper initialization */}
        {isInitialized && viewportSize.width > 0 && viewportSize.height > 0 && (
          <>
        {/* Background grid layer */}
        <g className="grid-layer">
          {config.showGrid && (
            <HexGrid
              centerPosition={cameraPosition}
              viewportSize={viewportSize}
              hexSize={effectiveHexSize * zoomLevel}
              opacity={config.gridOpacity}
              visible={config.showGrid}
            />
          )}
        </g>

        {/* Tiles layer */}
        <g className="tiles-layer">
          {visibleTiles
            .sort((a, b) => {
              // Render selected tile last (on top)
              const aSelected = mapState.selectedTile?.id === a.id;
              const bSelected = mapState.selectedTile?.id === b.id;
              if (aSelected && !bSelected) return 1;
              if (!aSelected && bSelected) return -1;
              return 0;
            })
            .map(tile => {
              const isSelected = mapState.selectedTile?.id === tile.id;
              return (
                <HexTile
                  key={tile.id}
                  tile={tile} // Pass the full tile with screenPosition
                  isSelected={isSelected}
                  isDragging={mapState.draggedTile?.id === tile.id}
                  onSelect={handleTileSelect}
                  onDragStart={handleTileDragStart}
                  size={effectiveHexSize * zoomLevel}
                />
              );
            })}
        </g>

        {/* Snap indicators when placing tiles */}
        {mapState.mode === 'add' && mapState.selectedTileType && (
          <g className="placement-indicator opacity-50">
            {/* This would show a preview of the tile being placed */}
          </g>
            )}
          </>
        )}
      </svg>


    </div>
  );
}