'use client';

import React, { useState } from 'react';
import { MapConfig, HexMap } from '../types/map';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Switch } from './switch';
import { Label } from './label';
import { Separator } from './separator';
import { Slider } from './slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { 
  Grid3X3, 
  Settings, 
  HelpCircle,
  ChevronDown,
  ChevronRight,
  Info
} from 'lucide-react';
import { TooltipProvider } from './tooltip';

interface SettingsPanelProps {
  config: MapConfig;
  currentMap: HexMap;
  onConfigChange: (config: Partial<MapConfig>) => void;
  className?: string;
}

export function SettingsPanel({
  config,
  currentMap,
  onConfigChange,
  className = ''
}: SettingsPanelProps) {
  const [openSections, setOpenSections] = useState({
    grid: false,
    help: false
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
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
                    <Label className="text-xs text-muted-foreground">
                      Opacity: {Math.round(config.gridOpacity * 100)}%
                    </Label>
                    <Slider
                      value={[config.gridOpacity]}
                      onValueChange={([value]) => onConfigChange({ gridOpacity: value })}
                      max={1}
                      min={0}
                      step={0.1}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">
                        Background Color
                      </Label>
                      <Select
                        value={config.backgroundColor || '#ffffff'}
                        onValueChange={(value) => onConfigChange({ backgroundColor: value })}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[
                            { value: '#ffffff', label: 'Pure White' },
                            { value: '#f8fafc', label: 'Slate 50' },
                            { value: '#f1f5f9', label: 'Slate 100' },
                            { value: '#e2e8f0', label: 'Slate 200' },
                            { value: '#64748b', label: 'Slate 500' },
                            { value: '#475569', label: 'Slate 600' },
                            { value: '#334155', label: 'Slate 700' },
                            { value: '#1e293b', label: 'Slate 800' },
                            { value: '#0f172a', label: 'Slate 900' },
                            { value: '#18181b', label: 'Zinc 900' },
                            { value: '#27272a', label: 'Zinc 800' },
                            { value: '#3f3f46', label: 'Zinc 700' }
                          ].map((color) => (
                            <SelectItem key={color.value} value={color.value}>
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-4 h-4 rounded border border-border"
                                  style={{ backgroundColor: color.value }}
                                />
                                <span>{color.label}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">
                        Grid Color
                      </Label>
                      <Select
                        value={config.gridColor || '#e2e8f0'}
                        onValueChange={(value) => onConfigChange({ gridColor: value })}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[
                            { value: '#e2e8f0', label: 'Light Gray' },
                            { value: '#cbd5e1', label: 'Gray' },
                            { value: '#94a3b8', label: 'Medium Gray' },
                            { value: '#64748b', label: 'Dark Gray' },
                            { value: '#475569', label: 'Darker Gray' },
                            { value: '#334155', label: 'Very Dark Gray' },
                            { value: '#000000', label: 'Black' },
                            { value: '#ffffff', label: 'White' },
                            { value: '#3b82f6', label: 'Blue' },
                            { value: '#10b981', label: 'Green' },
                            { value: '#f59e0b', label: 'Orange' },
                            { value: '#ef4444', label: 'Red' }
                          ].map((color) => (
                            <SelectItem key={color.value} value={color.value}>
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-4 h-4 rounded border border-border"
                                  style={{ backgroundColor: color.value }}
                                />
                                <span>{color.label}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
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
                      <p>• Use Export to save maps as files</p>
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
      </Card>
    </TooltipProvider>
  );
} 