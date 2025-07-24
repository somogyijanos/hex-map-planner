'use client';

import React from 'react';
import { MapState, HexMap } from '../types/map';
import { Button } from './button';
import { Badge } from './badge';
import { Separator } from './separator';
import { 
  MousePointer, 
  Plus, 
  Trash2, 
  RotateCcw,
  Home,
  Hand,
  Move,
  Download,
  Upload
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip';
import { exportMapAsJSON, importMapFromJSON } from '../lib/mapStorage';

interface QuickActionsProps {
  mapState: MapState;
  currentMap: HexMap;
  onModeChange: (mode: 'add' | 'select' | 'drag' | 'pan' | 'remove') => void;
  onLoadMap: (map: HexMap) => void;
  onClearMap: () => void;
  onResetView: () => void;
  className?: string;
}

const modes = [
  { 
    key: 'add' as const, 
    icon: Plus, 
    label: 'Place', 
    tooltip: 'Place tiles (A)',
    color: 'bg-green-500/10 text-green-700 border-green-200 hover:bg-green-500/20'
  },
  { 
    key: 'select' as const, 
    icon: MousePointer, 
    label: 'Select', 
    tooltip: 'Select tiles (S)',
    color: 'bg-blue-500/10 text-blue-700 border-blue-200 hover:bg-blue-500/20'
  },
  { 
    key: 'drag' as const, 
    icon: Move, 
    label: 'Move', 
    tooltip: 'Move tiles (M)',
    color: 'bg-purple-500/10 text-purple-700 border-purple-200 hover:bg-purple-500/20'
  },
  { 
    key: 'pan' as const, 
    icon: Hand, 
    label: 'Pan', 
    tooltip: 'Pan view (P)',
    color: 'bg-yellow-500/10 text-yellow-700 border-yellow-200 hover:bg-yellow-500/20'
  },
  { 
    key: 'remove' as const, 
    icon: Trash2, 
    label: 'Remove', 
    tooltip: 'Remove tiles (X)',
    color: 'bg-red-500/10 text-red-700 border-red-200 hover:bg-red-500/20'
  }
];

export function QuickActions({
  mapState,
  currentMap,
  onModeChange,
  onLoadMap,
  onClearMap,
  onResetView,
  className = ''
}: QuickActionsProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleClear = () => {
    if (confirm('Clear all tiles? This action cannot be undone.')) {
      onClearMap();
    }
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
      <div className={cn("bg-card border rounded-lg p-4 space-y-4", className)}>
        {/* Mode Selection */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">Mode</h3>
            <Badge variant="outline" className="text-xs">
              {modes.find(m => m.key === mapState.mode)?.label}
            </Badge>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            {modes.slice(0, 3).map((mode) => {
              const Icon = mode.icon;
              const isActive = mapState.mode === mode.key;
              
              return (
                <Tooltip key={mode.key}>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant={isActive ? 'default' : 'outline'}
                      onClick={() => onModeChange(mode.key)}
                      className={cn(
                        "flex flex-col gap-1 h-auto py-2",
                        isActive && mode.color
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="text-xs">{mode.label}</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{mode.tooltip}</TooltipContent>
                </Tooltip>
              );
            })}
          </div>
          
          <div className="grid grid-cols-2 gap-2 mt-2">
            {modes.slice(3).map((mode) => {
              const Icon = mode.icon;
              const isActive = mapState.mode === mode.key;
              
              return (
                <Tooltip key={mode.key}>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant={isActive ? 'default' : 'outline'}
                      onClick={() => onModeChange(mode.key)}
                      className={cn(
                        "flex flex-col gap-1 h-auto py-2",
                        isActive && mode.color
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="text-xs">{mode.label}</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{mode.tooltip}</TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </div>

        <Separator />

        {/* Quick Actions */}
        <div>
          <h3 className="text-sm font-semibold mb-3">Quick Actions</h3>
          <div className="space-y-2">
            {/* First row - File operations */}
            <div className="grid grid-cols-2 gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleExportJSON}
                    className="flex flex-col gap-1 h-auto py-2"
                  >
                    <Download className="h-4 w-4" />
                    <span className="text-xs">Export</span>
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
                    className="flex flex-col gap-1 h-auto py-2"
                  >
                    <Upload className="h-4 w-4" />
                    <span className="text-xs">Import</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Load map from JSON file</TooltipContent>
              </Tooltip>
            </div>

            {/* Second row - View and edit operations */}
            <div className="grid grid-cols-2 gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={onResetView}
                    className="flex flex-col gap-1 h-auto py-2"
                  >
                    <Home className="h-4 w-4" />
                    <span className="text-xs">Reset</span>
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
                    className="flex flex-col gap-1 h-auto py-2 text-destructive hover:text-destructive"
                  >
                    <RotateCcw className="h-4 w-4" />
                    <span className="text-xs">Clear</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Clear all tiles</TooltipContent>
              </Tooltip>
            </div>
          </div>
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