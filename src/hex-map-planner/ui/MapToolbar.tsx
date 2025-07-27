'use client';

import React from 'react';
import { MapState, HexMap } from '../types/map';
import { Button } from './button';
import { Badge } from './badge';
import { 
  MousePointer, 
  Plus, 
  Trash2, 
  RotateCcw,
  Home,
  Hand,
  Move,
  Download,
  Upload,
  Palette,
  FileText,
  ChevronDown
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { exportMapAsJSON, importMapFromJSON } from '../lib/mapStorage';
import { getAvailableTemplates, loadTemplate } from '../lib/templates';
import { TemplateExample } from '../types/template';
import { TemplateSelector } from './TemplateSelector';

interface MapToolbarProps {
  mapState: MapState;
  currentMap: HexMap;
  onModeChange: (mode: 'add' | 'select' | 'drag' | 'pan' | 'remove') => void;
  onLoadMap: (map: HexMap) => void;
  onLoadTemplate: (templateId: string, exampleName?: string) => void;
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

export function MapToolbar({
  mapState,
  currentMap,
  onModeChange,
  onLoadMap,
  onLoadTemplate,
  onClearMap,
  onResetView,
  className = ''
}: MapToolbarProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [availableTemplates, setAvailableTemplates] = React.useState<Array<{
    id: string, 
    name: string, 
    description?: string,
    tileTypes?: Array<{ id: string; name: string; description?: string }>,
    addOns?: Array<{ id: string; name: string; type?: string; description?: string }>,
    examples: TemplateExample[]
  }>>([]);
  const [fileMenuOpen, setFileMenuOpen] = React.useState(false);
  
  // Load available templates on mount
  React.useEffect(() => {
    const loadTemplateInfo = async () => {
      const templateIds = await getAvailableTemplates();
      const templateInfo = await Promise.all(
        templateIds.map(async (id: string) => {
          try {
            const template = await loadTemplate(id);
            return { 
              id, 
              name: template.name, 
              description: template.description,
              tileTypes: template.tileTypes.map(tt => ({
                id: tt.id,
                name: tt.name,
                description: tt.description
              })),
              addOns: template.addOns.map(ao => ({
                id: ao.id,
                name: ao.name,
                type: ao.type,
                description: ao.description
              })),
              examples: template.examples 
            };
          } catch (error) {
            console.error(`Failed to load template ${id}:`, error);
            return null;
          }
        })
      );
      setAvailableTemplates(templateInfo.filter(t => t !== null));
    };
    
    loadTemplateInfo();
  }, []);

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

  const handleTemplateChange = (value: string) => {
    if (value && value !== '') {
      const [templateId, exampleName] = value.split('|');
      const confirmMessage = exampleName 
        ? `Load "${exampleName}" example? This will replace your current tile types, addons, and tiles.`
        : 'Load template? This will replace your current tile types and addons.';
      
      if (confirm(confirmMessage)) {
        onLoadTemplate(templateId, exampleName || undefined);
      }
    }
  };

  return (
    <TooltipProvider>
      <div className={cn("bg-card border-b shadow-sm p-3", className)}>
        <div className="flex items-center justify-between">
          {/* Left section - Mode selection */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">Mode:</span>
              <Badge variant="outline" className="text-xs">
                {modes.find(m => m.key === mapState.mode)?.label}
              </Badge>
            </div>
            
            <div className="w-px h-6 bg-border" />
            
            <div className="flex items-center gap-1">
              {modes.map((mode) => {
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
                          "h-8 px-3",
                          isActive && mode.color
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        <span className="ml-1.5 hidden sm:inline">{mode.label}</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{mode.tooltip}</TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          </div>

          {/* Templates */}
          <TemplateSelector
            availableTemplates={availableTemplates}
            onTemplateSelect={(templateId, exampleName) => {
              handleTemplateChange(exampleName ? `${templateId}|${exampleName}` : templateId);
            }}
            trigger={
              <Button variant="outline" size="sm" className="h-8" title="Browse templates">
                <Palette className="h-4 w-4" />
                <span className="ml-1.5 hidden lg:inline">Templates</span>
              </Button>
            }
          />

          {/* Right section - Quick actions */}
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Popover open={fileMenuOpen} onOpenChange={setFileMenuOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8"
                    >
                      <FileText className="h-4 w-4" />
                      <span className="ml-1.5 hidden md:inline">File</span>
                      <ChevronDown className="h-3 w-3 ml-1" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 p-2" align="start">
                    <div className="space-y-1">
                      <div className="px-2 py-1.5 text-sm font-medium text-muted-foreground">File Actions</div>
                      
                      <button
                        onClick={() => {
                          handleExportJSON();
                          setFileMenuOpen(false);
                        }}
                        className="flex items-center w-full px-2 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Export Map
                      </button>
                      
                      <button
                        onClick={() => {
                          handleImportJSON();
                          setFileMenuOpen(false);
                        }}
                        className="flex items-center w-full px-2 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Import Map
                      </button>
                      

                    </div>
                  </PopoverContent>
                </Popover>
              </TooltipTrigger>
              <TooltipContent>File operations and templates</TooltipContent>
            </Tooltip>

            <div className="w-px h-6 bg-border" />

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onResetView}
                  className="h-8"
                >
                  <Home className="h-4 w-4" />
                  <span className="ml-1.5 hidden lg:inline">Reset View</span>
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
                  className="h-8 text-destructive hover:text-destructive"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span className="ml-1.5 hidden lg:inline">Clear</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Clear all tiles</TooltipContent>
            </Tooltip>
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