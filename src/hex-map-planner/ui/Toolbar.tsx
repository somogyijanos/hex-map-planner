'use client';

import React from 'react';
import { MapState, MapConfig, HexMap } from '../types/map';
import { Button } from './button';
import { Switch } from './switch';
import { Label } from './label';
import { Separator } from './separator';

import { 
  MousePointer, 
  Plus, 
  Trash2, 
 
  Download, 
  Upload, 
  Save, 
  RotateCcw,
  Home,
  HelpCircle,
  Hand,
  Move
} from 'lucide-react';
import { cn } from '../lib/utils';
import { exportMapAsJSON, importMapFromJSON } from '../lib/mapStorage';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip';

interface ToolbarProps {
  mapState: MapState;
  config: MapConfig;
  currentMap: HexMap;
  onModeChange: (mode: 'add' | 'select' | 'drag' | 'pan' | 'remove') => void;
  onConfigChange: (config: Partial<MapConfig>) => void;
  onSaveMap: () => void;
  onLoadMap: (map: HexMap) => void;
  onClearMap: () => void;
  onResetView: () => void;
  className?: string;
}

export function Toolbar({
  mapState,
  config,
  currentMap,
  onModeChange,
  onConfigChange,
  onSaveMap,
  onLoadMap,
  onClearMap,
  onResetView,
  className = ''
}: ToolbarProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [showHelp, setShowHelp] = React.useState(false);

  const handleExportJSON = () => {
    try {
      exportMapAsJSON(currentMap);
    } catch (error) {
      alert('Failed to export map: ' + (error as Error).message);
    }
  };

  const handleImportJSON = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const map = await importMapFromJSON(file);
      onLoadMap(map);
    } catch (error) {
      alert('Failed to import map: ' + (error as Error).message);
    } finally {
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleClear = () => {
    if (confirm('Clear all tiles? This action cannot be undone.')) {
      onClearMap();
    }
  };

  return (
    <TooltipProvider>
      <div className={cn("bg-card border rounded-lg p-4 space-y-4", className)}>
        {/* Mode Controls */}
        <div>
          <Label className="text-sm font-medium mb-2 block">Mode</Label>
          <div className="flex gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant={mapState.mode === 'add' ? 'default' : 'outline'}
                  onClick={() => onModeChange('add')}
                  className="flex-1"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Place tiles</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant={mapState.mode === 'select' ? 'default' : 'outline'}
                  onClick={() => onModeChange('select')}
                  className="flex-1"
                >
                  <MousePointer className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Select tiles</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant={mapState.mode === 'drag' ? 'default' : 'outline'}
                  onClick={() => onModeChange('drag')}
                  className="flex-1"
                >
                  <Move className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Drag tiles</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant={mapState.mode === 'pan' ? 'default' : 'outline'}
                  onClick={() => onModeChange('pan')}
                  className="flex-1"
                >
                  <Hand className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Pan view</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant={mapState.mode === 'remove' ? 'default' : 'outline'}
                  onClick={() => onModeChange('remove')}
                  className="flex-1"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Remove tiles</TooltipContent>
            </Tooltip>
          </div>
        </div>

        <Separator />

        {/* Grid Controls */}
        <div>
          <Label className="text-sm font-medium mb-2 block">Grid</Label>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="show-grid" className="text-sm">Show Grid</Label>
              <Switch
                id="show-grid"
                checked={config.showGrid}
                onCheckedChange={(checked) => onConfigChange({ showGrid: checked })}
              />
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="grid-size" className="text-xs text-muted-foreground">
                Visual Size: {config.gridSize}px
              </Label>
              <input
                id="grid-size"
                type="range"
                min="20"
                max="120"
                value={config.gridSize}
                onChange={(e) => onConfigChange({ gridSize: parseInt(e.target.value) })}
                className="w-full"
              />
              <div className="text-xs text-muted-foreground/80">
                Controls the actual visual size of hex tiles
              </div>
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="grid-opacity" className="text-xs text-muted-foreground">
                Opacity: {Math.round(config.gridOpacity * 100)}%
              </Label>
              <input
                id="grid-opacity"
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={config.gridOpacity}
                onChange={(e) => onConfigChange({ gridOpacity: parseFloat(e.target.value) })}
                className="w-full"
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* View Controls */}
        <div>
          <Label className="text-sm font-medium mb-2 block">View</Label>
          <div className="grid grid-cols-2 gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onResetView}
                  className="flex items-center gap-2"
                >
                  <Home className="h-4 w-4" />
                  Reset
                </Button>
              </TooltipTrigger>
              <TooltipContent>Reset camera to center</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleClear}
                  className="flex items-center gap-2 text-destructive"
                >
                  <RotateCcw className="h-4 w-4" />
                  Clear
                </Button>
              </TooltipTrigger>
              <TooltipContent>Clear all tiles</TooltipContent>
            </Tooltip>
          </div>
        </div>

        <Separator />

        {/* Map Info */}
        <div>
          <Label className="text-sm font-medium mb-2 block">Map Info</Label>
          <div className="space-y-1 text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span>Tiles:</span>
              <span className="font-mono">{currentMap.tiles.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Mode:</span>
              <span className="capitalize">{mapState.mode}</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* File Operations */}
        <div>
          <Label className="text-sm font-medium mb-2 block">File</Label>
          <div className="space-y-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onSaveMap}
                  className="w-full flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  Save Map
                </Button>
              </TooltipTrigger>
              <TooltipContent>Save to browser storage</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleExportJSON}
                  className="w-full flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export JSON
                </Button>
              </TooltipTrigger>
              <TooltipContent>Download as JSON file</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleImportJSON}
                  className="w-full flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Import JSON
                </Button>
              </TooltipTrigger>
              <TooltipContent>Load from JSON file</TooltipContent>
            </Tooltip>
          </div>
        </div>
        
        <Separator />

        {/* Navigation Help */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="text-sm font-medium">Navigation</Label>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowHelp(!showHelp)}
              className="h-6 w-6 p-0"
            >
              <HelpCircle className="h-4 w-4" />
            </Button>
          </div>
          
          {showHelp && (
            <div className="space-y-1 text-xs text-muted-foreground">
              <div className="flex justify-between items-center">
                <span>Zoom</span>
                <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Mouse Wheel</kbd>
              </div>
              <div className="flex justify-between items-center">
                <span>Pan</span>
                <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Space + Drag</kbd>
              </div>
              <div className="flex justify-between items-center">
                <span>Pan</span>
                <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Right Click</kbd>
              </div>
              <div className="flex justify-between items-center">
                <span>Reset</span>
                <kbd className="px-1 py-0.5 bg-muted rounded text-xs">R</kbd>
              </div>
              <div className="flex justify-between items-center">
                <span>Zoom</span>
                <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Ctrl + +/-</kbd>
              </div>
              <div className="flex justify-between items-center">
                <span>Fine Pan</span>
                <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Arrow Keys</kbd>
              </div>
            </div>
          )}
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    </TooltipProvider>
  );
} 