'use client';

import React, { useState } from 'react';
import { MapConfig, HexMap } from '../types/map';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { Switch } from './switch';
import { Label } from './label';
import { Separator } from './separator';
import { Input } from './input';
import { 
  Grid3X3, 
  Download, 
  Upload, 
  Settings, 
  HelpCircle,
  ChevronDown,
  ChevronRight,
  FileText,
  Info
} from 'lucide-react';
import { cn } from '../lib/utils';
import { exportMapAsJSON, importMapFromJSON } from '../lib/mapStorage';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip';

interface SettingsPanelProps {
  config: MapConfig;
  currentMap: HexMap;
  onConfigChange: (config: Partial<MapConfig>) => void;
  onLoadMap: (map: HexMap) => void;
  className?: string;
}

export function SettingsPanel({
  config,
  currentMap,
  onConfigChange,
  onLoadMap,
  className = ''
}: SettingsPanelProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [openSections, setOpenSections] = useState({
    grid: false,
    file: false,
    help: false
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

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

  return (
    <TooltipProvider>
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-0 space-y-0">
          {/* Grid Settings */}
          <div>
            <button 
              className="flex items-center justify-between w-full p-4 hover:bg-muted transition-colors"
              onClick={() => toggleSection('grid')}
            >
              <div className="flex items-center gap-2">
                <Grid3X3 className="h-4 w-4" />
                <span className="text-sm font-medium">Grid Settings</span>
              </div>
              {openSections.grid ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
            {openSections.grid && (
              <div className="px-4 pb-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-grid" className="text-sm">Show Grid</Label>
                    <Switch
                      id="show-grid"
                      checked={config.showGrid}
                      onCheckedChange={(checked) => onConfigChange({ showGrid: checked })}
                    />
                  </div>
                  
                  <div className="space-y-2">
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
                  
                  <div className="space-y-2">
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

                  <div className="space-y-2">
                    <Label htmlFor="bg-color" className="text-xs text-muted-foreground">
                      Background Color
                    </Label>
                    <Input
                      id="bg-color"
                      value={config.backgroundColor || '#ffffff'}
                      onChange={(e) => onConfigChange({ backgroundColor: e.target.value })}
                      placeholder="Background color"
                      className="text-xs"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* File Operations */}
          <div>
            <button 
              className="flex items-center justify-between w-full p-4 hover:bg-muted transition-colors"
              onClick={() => toggleSection('file')}
            >
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span className="text-sm font-medium">File Operations</span>
              </div>
              {openSections.file ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
            {openSections.file && (
              <div className="px-4 pb-4">
                <div className="space-y-2">
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
                    <TooltipContent>Download map as JSON file</TooltipContent>
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
                    <TooltipContent>Load map from JSON file</TooltipContent>
                  </Tooltip>

                  <div className="pt-2 text-xs text-muted-foreground">
                    <p>Export your map to share or backup.</p>
                    <p>Import to load saved maps.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Help & Navigation */}
          <div>
            <button 
              className="flex items-center justify-between w-full p-4 hover:bg-muted transition-colors"
              onClick={() => toggleSection('help')}
            >
              <div className="flex items-center gap-2">
                <HelpCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Help & Navigation</span>
              </div>
              {openSections.help ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
            {openSections.help && (
              <div className="px-4 pb-4">
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Keyboard Shortcuts</Label>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <div className="flex justify-between items-center">
                        <span>Place Mode</span>
                        <kbd className="px-1 py-0.5 bg-muted rounded text-xs">A</kbd>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Select Mode</span>
                        <kbd className="px-1 py-0.5 bg-muted rounded text-xs">S</kbd>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Move Mode</span>
                        <kbd className="px-1 py-0.5 bg-muted rounded text-xs">M</kbd>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Pan Mode</span>
                        <kbd className="px-1 py-0.5 bg-muted rounded text-xs">P</kbd>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Remove Mode</span>
                        <kbd className="px-1 py-0.5 bg-muted rounded text-xs">X</kbd>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <Label className="text-sm font-medium mb-2 block">Navigation</Label>
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
                        <span>Reset View</span>
                        <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Ctrl + R</kbd>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Fine Pan</span>
                        <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Arrow Keys</kbd>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <Label className="text-sm font-medium mb-2 block">Tips</Label>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <p>• Create tile types first, then place them on the map</p>
                      <p>• Add-ons can be placed on existing tiles</p>
                      <p>• Use different heights for 3D visual effects</p>
                      <p>• Auto-save runs every 30 seconds</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Map Information */}
          <div className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Info className="h-4 w-4 text-muted-foreground" />
              <Label className="text-sm font-medium">Map Information</Label>
            </div>
            <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Tiles:</span>
                  <span className="font-mono font-medium">{currentMap.tiles.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Types:</span>
                  <span className="font-mono font-medium">{currentMap.tileTypes.length}</span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Add-ons:</span>
                  <span className="font-mono font-medium">{currentMap.addOns.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Grid Size:</span>
                  <span className="font-mono font-medium">{config.gridSize}px</span>
                </div>
              </div>
            </div>
            <div className="mt-3 text-xs text-muted-foreground">
              <p>Created: {new Date(currentMap.createdAt).toLocaleDateString()}</p>
              <p>Updated: {new Date(currentMap.updatedAt).toLocaleDateString()}</p>
            </div>
          </div>
        </CardContent>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileChange}
          className="hidden"
        />
      </Card>
    </TooltipProvider>
  );
} 