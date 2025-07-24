'use client';

import React from 'react';
import { MapState, HexMap } from '@/types/map';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  MousePointer, 
  Plus, 
  Trash2, 
  Save, 
  RotateCcw,
  Home,
  Hand,
  Move,
  Play
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface QuickActionsProps {
  mapState: MapState;
  currentMap: HexMap;
  onModeChange: (mode: 'add' | 'select' | 'drag' | 'pan' | 'remove') => void;
  onSaveMap: () => void;
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
  onSaveMap,
  onClearMap,
  onResetView,
  className = ''
}: QuickActionsProps) {
  const handleClear = () => {
    if (confirm('Clear all tiles? This action cannot be undone.')) {
      onClearMap();
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
          <div className="grid grid-cols-3 gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onSaveMap}
                  className="flex flex-col gap-1 h-auto py-2"
                >
                  <Save className="h-4 w-4" />
                  <span className="text-xs">Save</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Save map to browser storage</TooltipContent>
            </Tooltip>

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

        <Separator />

        {/* Status */}
        <div>
          <h3 className="text-sm font-semibold mb-2">Status</h3>
          <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span>Tiles:</span>
              <span className="font-mono font-medium">{currentMap.tiles.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Types:</span>
              <span className="font-mono font-medium">{currentMap.tileTypes.length}</span>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
} 