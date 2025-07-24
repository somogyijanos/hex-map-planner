'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { HexMap, Tile, TileType, AddOn, MapState, MapConfig } from '@/types/map';
import { MapCanvas } from './map/MapCanvas';
import { QuickActions } from './ui/QuickActions';
import { ContentPanel } from './ui/ContentPanel';
import { SettingsPanel } from './ui/SettingsPanel';
import { createNewMap, saveMapToStorage, createDefaultMapConfig } from '@/lib/mapStorage';
import { toast } from 'sonner';

export function HexMapPlanner() {
  // Main map data
  const [currentMap, setCurrentMap] = useState<HexMap>(() => createNewMap('My Hex Map'));
  
  // UI state
  const [mapState, setMapState] = useState<MapState>({
    selectedTileType: currentMap.tileTypes[0] || null,
    selectedAddOn: currentMap.addOns[0] || null,
    selectedTile: null,
    isDragging: false,
    draggedTile: null,
    mode: 'add'
  });

  const [config, setConfig] = useState<MapConfig>(currentMap.config);
  
  // Reference to MapCanvas reset function
  const [mapResetView, setMapResetView] = useState<(() => void) | null>(null);

  // Tile operations
  const handleTileAdd = useCallback((tile: Tile) => {
    setCurrentMap(prev => ({
      ...prev,
      tiles: [...prev.tiles, tile],
      updatedAt: new Date().toISOString()
    }));
  }, []);

  const handleTileUpdate = useCallback((updatedTile: Tile) => {
    setCurrentMap(prev => ({
      ...prev,
      tiles: prev.tiles.map(tile => 
        tile.id === updatedTile.id ? updatedTile : tile
      ),
      updatedAt: new Date().toISOString()
    }));

    // Update selected tile if it's the one being updated
    setMapState(prev => ({
      ...prev,
      selectedTile: prev.selectedTile?.id === updatedTile.id ? updatedTile : prev.selectedTile
    }));
  }, []);

  const handleTileDelete = useCallback((tileId: string) => {
    setCurrentMap(prev => ({
      ...prev,
      tiles: prev.tiles.filter(tile => tile.id !== tileId),
      updatedAt: new Date().toISOString()
    }));
    
    // Clear selection if deleted tile was selected
    setMapState(prev => ({
      ...prev,
      selectedTile: prev.selectedTile?.id === tileId ? null : prev.selectedTile
    }));
  }, []);

  const handleTileSelect = useCallback((tile: Tile | null) => {
    setMapState(prev => ({
      ...prev,
      selectedTile: tile
    }));
  }, []);

  // Tile type operations
  const handleTileTypeAdd = useCallback((tileType: TileType) => {
    setCurrentMap(prev => ({
      ...prev,
      tileTypes: [...prev.tileTypes, tileType],
      updatedAt: new Date().toISOString()
    }));
    
    // Auto-select the new tile type
    setMapState(prev => ({
      ...prev,
      selectedTileType: tileType
    }));
  }, []);

  const handleTileTypeUpdate = useCallback((updatedTileType: TileType) => {
    setCurrentMap(prev => ({
      ...prev,
      tileTypes: prev.tileTypes.map(type => 
        type.id === updatedTileType.id ? updatedTileType : type
      ),
      // Update existing tiles that use this type
      tiles: prev.tiles.map(tile => 
        tile.type.id === updatedTileType.id 
          ? { ...tile, type: updatedTileType }
          : tile
      ),
      updatedAt: new Date().toISOString()
    }));

    // Update selected tile type if it was the one being edited
    setMapState(prev => ({
      ...prev,
      selectedTileType: prev.selectedTileType?.id === updatedTileType.id 
        ? updatedTileType 
        : prev.selectedTileType
    }));
  }, []);

  const handleTileTypeDelete = useCallback((tileTypeId: string) => {
    const tileType = currentMap.tileTypes.find(t => t.id === tileTypeId);
    const tilesUsingType = currentMap.tiles.filter(tile => tile.type.id === tileTypeId);
    
    if (tilesUsingType.length > 0) {
      if (!confirm(`Delete tile type "${tileType?.name}"? This will also delete ${tilesUsingType.length} tiles using this type.`)) {
        return;
      }
    }

    setCurrentMap(prev => ({
      ...prev,
      tileTypes: prev.tileTypes.filter(type => type.id !== tileTypeId),
      tiles: prev.tiles.filter(tile => tile.type.id !== tileTypeId),
      updatedAt: new Date().toISOString()
    }));

    // Clear selection if deleted type was selected
    setMapState(prev => ({
      ...prev,
      selectedTileType: prev.selectedTileType?.id === tileTypeId ? null : prev.selectedTileType,
      selectedTile: prev.selectedTile?.type.id === tileTypeId ? null : prev.selectedTile
    }));
  }, [currentMap]);

  const handleTileTypeSelect = useCallback((tileType: TileType) => {
    setMapState(prev => ({
      ...prev,
      selectedTileType: tileType,
      mode: 'add' // Auto-switch to add mode when selecting a tile type
    }));
  }, []);

  // Add-on operations
  const handleAddOnAdd = useCallback((addOn: AddOn) => {
    setCurrentMap(prev => ({
      ...prev,
      addOns: [...prev.addOns, addOn],
      updatedAt: new Date().toISOString()
    }));
  }, []);

  const handleAddOnUpdate = useCallback((updatedAddOn: AddOn) => {
    setCurrentMap(prev => ({
      ...prev,
      addOns: prev.addOns.map(addOn => 
        addOn.id === updatedAddOn.id ? updatedAddOn : addOn
      ),
      // Update tiles that use this add-on
      tiles: prev.tiles.map(tile => ({
        ...tile,
        addOns: tile.addOns.map(addOn => 
          addOn.id === updatedAddOn.id ? updatedAddOn : addOn
        )
      })),
      updatedAt: new Date().toISOString()
    }));
  }, []);

  const handleAddOnDelete = useCallback((addOnId: string) => {
    const addOn = currentMap.addOns.find(a => a.id === addOnId);
    const tilesUsingAddOn = currentMap.tiles.filter(tile => 
      tile.addOns.some(a => a.id === addOnId)
    );
    
    if (tilesUsingAddOn.length > 0) {
      if (!confirm(`Delete add-on "${addOn?.name}"? This will remove it from ${tilesUsingAddOn.length} tiles.`)) {
        return;
      }
    }

    setCurrentMap(prev => ({
      ...prev,
      addOns: prev.addOns.filter(addOn => addOn.id !== addOnId),
      tiles: prev.tiles.map(tile => ({
        ...tile,
        addOns: tile.addOns.filter(addOn => addOn.id !== addOnId)
      })),
      updatedAt: new Date().toISOString()
    }));

    // Clear selection if deleted add-on was selected
    setMapState(prev => ({
      ...prev,
      selectedAddOn: prev.selectedAddOn?.id === addOnId ? null : prev.selectedAddOn
    }));
  }, [currentMap]);

  const handleAddOnSelect = useCallback((addOn: AddOn) => {
    setMapState(prev => ({
      ...prev,
      selectedAddOn: addOn
    }));
  }, []);

  const handleTileAddOnAdd = useCallback((tile: Tile, addOn: AddOn) => {
    const updatedTile = {
      ...tile,
      addOns: [...tile.addOns, addOn]
    };
    handleTileUpdate(updatedTile);
  }, [handleTileUpdate]);

  const handleTileAddOnRemove = useCallback((tile: Tile, addOnId: string) => {
    const updatedTile = {
      ...tile,
      addOns: tile.addOns.filter(addOn => addOn.id !== addOnId)
    };
    handleTileUpdate(updatedTile);
  }, [handleTileUpdate]);

  // Map operations
  const handleModeChange = useCallback((mode: 'add' | 'select' | 'drag' | 'pan' | 'remove') => {
    setMapState(prev => ({
      ...prev,
      mode,
      // Clear selection when switching to modes that don't use it
      selectedTile: (mode === 'select' || mode === 'drag') ? prev.selectedTile : null
    }));
  }, []);

  // Keyboard shortcuts for mode switching
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle shortcuts when not typing in input fields
      if (event.target instanceof HTMLInputElement || 
          event.target instanceof HTMLTextAreaElement || 
          event.target instanceof HTMLSelectElement) {
        return;
      }

      // Handle shortcuts without preventing default browser behavior
      switch (event.key.toLowerCase()) {
        case 'a':
          handleModeChange('add');
          break;
        case 's':
          handleModeChange('select');
          break;
        case 'm':
          handleModeChange('drag');
          break;
        case 'p':
          handleModeChange('pan');
          break;
        case 'x': // Changed from 'r' to 'x' to avoid conflict with reset view
          handleModeChange('remove');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleModeChange]);

  const handleConfigChange = useCallback((configUpdate: Partial<MapConfig>) => {
    const newConfig = { ...config, ...configUpdate };
    setConfig(newConfig);
    setCurrentMap(prev => ({
      ...prev,
      config: newConfig,
      updatedAt: new Date().toISOString()
    }));
  }, [config]);

  const handleSaveMap = useCallback(() => {
    try {
      saveMapToStorage(currentMap);
      toast.success('Map saved successfully!');
    } catch (error) {
      toast.error('Failed to save map: ' + (error as Error).message);
    }
  }, [currentMap]);

  const handleLoadMap = useCallback((map: HexMap) => {
    setCurrentMap(map);
    setConfig(map.config);
    setMapState(prev => ({
      ...prev,
      selectedTileType: map.tileTypes[0] || null,
      selectedAddOn: map.addOns[0] || null,
      selectedTile: null,
      mode: 'add'
    }));
    toast.success(`Loaded map: ${map.name}`);
  }, []);

  const handleClearMap = useCallback(() => {
    setCurrentMap(prev => ({
      ...prev,
      tiles: [],
      updatedAt: new Date().toISOString()
    }));
    setMapState(prev => ({
      ...prev,
      selectedTile: null
    }));
    toast.success('Map cleared');
  }, []);

  const handleResetView = useCallback(() => {
    if (mapResetView) {
      mapResetView();
    }
  }, [mapResetView]);

  const handleMapResetViewRef = useCallback((resetFn: () => void) => {
    setMapResetView(() => resetFn);
  }, []);



  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (currentMap.tiles.length > 0) {
        try {
          saveMapToStorage(currentMap);
          console.log('Auto-saved map');
        } catch (error) {
          console.error('Auto-save failed:', error);
        }
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [currentMap]);

  return (
    <div className="flex h-screen bg-background">
      {/* Optimized Left Sidebar */}
      <div className="w-96 border-r bg-card/50 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b bg-card">
          <h1 className="text-xl font-bold text-foreground">Hex Map Planner</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create beautiful hexagonal maps
          </p>
        </div>
        
        {/* Scrollable Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-4 space-y-4">
            {/* Quick Actions - Most frequently used */}
            <QuickActions
              mapState={mapState}
              currentMap={currentMap}
              onModeChange={handleModeChange}
              onSaveMap={handleSaveMap}
              onClearMap={handleClearMap}
              onResetView={handleResetView}
            />

            {/* Content Panel - Tile types and add-ons with better organization */}
            <ContentPanel
              tileTypes={currentMap.tileTypes}
              addOns={currentMap.addOns}
              selectedTileType={mapState.selectedTileType}
              selectedAddOn={mapState.selectedAddOn}
              selectedTile={
                mapState.selectedTile 
                  ? currentMap.tiles.find(t => t.id === mapState.selectedTile?.id) || mapState.selectedTile
                  : null
              }
              onTileTypeSelect={handleTileTypeSelect}
              onTileTypeAdd={handleTileTypeAdd}
              onTileTypeUpdate={handleTileTypeUpdate}
              onTileTypeDelete={handleTileTypeDelete}
              onAddOnSelect={handleAddOnSelect}
              onAddOnAdd={handleAddOnAdd}
              onAddOnUpdate={handleAddOnUpdate}
              onAddOnDelete={handleAddOnDelete}
              onTileAddOnAdd={handleTileAddOnAdd}
              onTileAddOnRemove={handleTileAddOnRemove}
            />

            {/* Settings Panel - Less frequently used, collapsible */}
            <SettingsPanel
              config={config}
              currentMap={currentMap}
              onConfigChange={handleConfigChange}
              onLoadMap={handleLoadMap}
            />
          </div>
        </div>
      </div>

      {/* Main Canvas */}
      <div className="flex-1 relative">
        <MapCanvas
          tiles={currentMap.tiles}
          config={config}
          mapState={mapState}
          onTileAdd={handleTileAdd}
          onTileUpdate={handleTileUpdate}
          onTileDelete={handleTileDelete}
          onTileSelect={handleTileSelect}
          onResetViewRef={handleMapResetViewRef}
        />
      </div>
    </div>
  );
} 