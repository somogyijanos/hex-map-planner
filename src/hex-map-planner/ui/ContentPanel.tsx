'use client';

import React, { useState } from 'react';
import { TileType, AddOn, Tile } from '../types/map';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { Badge } from './badge';
import { Separator } from './separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Slider } from './slider';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Palette, 
  Package, 
  Layers,
  X,
  ChevronRight,
  Info
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { cn } from '../lib/utils';
import { generateId } from '../lib/mapStorage';

interface ContentPanelProps {
  tileTypes: TileType[];
  addOns: AddOn[];
  selectedTileType: TileType | null;
  selectedAddOn: AddOn | null;
  selectedTile: Tile | null;
  onTileTypeSelect: (tileType: TileType) => void;
  onTileTypeAdd: (tileType: TileType) => void;
  onTileTypeUpdate: (tileType: TileType) => void;
  onTileTypeDelete: (tileTypeId: string) => void;
  onAddOnSelect: (addOn: AddOn) => void;
  onAddOnAdd: (addOn: AddOn) => void;
  onAddOnUpdate: (addOn: AddOn) => void;
  onAddOnDelete: (addOnId: string) => void;
  onTileAddOnAdd: (tile: Tile, addOn: AddOn) => void;
  onTileAddOnRemove: (tile: Tile, addOnId: string) => void;
  className?: string;
}

// Popular Lucide icon names for tiles
const TILE_ICONS = [
  'TreePine', 'Waves', 'Mountain', 'Sun', 'Snowflake', 'Zap',
  'Flower', 'Leaf', 'Rock', 'Home', 'Castle', 'Building',
  'Trees', 'CloudRain', 'Flame', 'Globe', 'Pickaxe', 'Shield'
];

const PRESET_COLORS = [
  'hsl(120, 60%, 50%)', // Green
  'hsl(210, 100%, 50%)', // Blue  
  'hsl(30, 30%, 40%)', // Brown
  'hsl(45, 80%, 70%)', // Yellow
  'hsl(0, 60%, 50%)', // Red
  'hsl(270, 60%, 60%)', // Purple
  'hsl(180, 60%, 50%)', // Cyan
  'hsl(20, 70%, 50%)', // Orange
];

// Popular Lucide icon names for add-ons
const ADDON_ICONS = [
  'Home', 'Castle', 'Building', 'TreePine', 'Trees', 'Flower',
  'Route', 'Bridge', 'Landmark', 'Church', 'Store', 'Warehouse',
  'Tent', 'Flag', 'Shield', 'Sword', 'Pickaxe', 'Hammer',
  'Coins', 'Gem', 'Crown', 'Key', 'Lock', 'Compass'
];

const ADDON_TYPES = [
  { value: 'building', label: 'Building' },
  { value: 'nature', label: 'Nature' },
  { value: 'decoration', label: 'Decoration' },
  { value: 'structure', label: 'Structure' }
] as const;

export function ContentPanel({
  tileTypes,
  addOns,
  selectedTileType,
  selectedAddOn,
  selectedTile,
  onTileTypeSelect,
  onTileTypeAdd,
  onTileTypeUpdate,
  onTileTypeDelete,
  onAddOnSelect,
  onAddOnAdd,
  onAddOnUpdate,
  onAddOnDelete,
  onTileAddOnAdd,
  onTileAddOnRemove,
  className = ''
}: ContentPanelProps) {
  const [activeTab, setActiveTab] = useState('tiles');
  const [tileDialogOpen, setTileDialogOpen] = useState(false);
  const [addOnDialogOpen, setAddOnDialogOpen] = useState(false);
  const [editingTileType, setEditingTileType] = useState<TileType | null>(null);
  const [editingAddOn, setEditingAddOn] = useState<AddOn | null>(null);
  
  const [tileFormData, setTileFormData] = useState({
    name: '',
    color: 'hsl(120, 60%, 50%)',
    icon: 'TreePine',
    height: 1,
    description: ''
  });

  const [addOnFormData, setAddOnFormData] = useState<{
    name: string;
    icon: string;
    type: 'building' | 'nature' | 'decoration' | 'structure';
    description: string;
  }>({
    name: '',
    icon: 'Home',
    type: 'building',
    description: ''
  });

  // Tile Type Dialog Handlers
  const handleOpenTileDialog = (tileType?: TileType) => {
    if (tileType) {
      setEditingTileType(tileType);
      setTileFormData({
        name: tileType.name,
        color: tileType.color,
        icon: tileType.icon || 'TreePine',
        height: tileType.height,
        description: tileType.description || ''
      });
    } else {
      setEditingTileType(null);
      setTileFormData({
        name: '',
        color: 'hsl(120, 60%, 50%)',
        icon: 'TreePine',
        height: 1,
        description: ''
      });
    }
    setTileDialogOpen(true);
  };

  const handleSaveTileType = () => {
    if (!tileFormData.name.trim()) return;

    const tileType: TileType = {
      id: editingTileType?.id || generateId(),
      name: tileFormData.name.trim(),
      color: tileFormData.color,
      icon: tileFormData.icon,
      height: tileFormData.height,
      description: tileFormData.description.trim() || undefined
    };

    if (editingTileType) {
      onTileTypeUpdate(tileType);
    } else {
      onTileTypeAdd(tileType);
    }

    setTileDialogOpen(false);
  };

  // Add-On Dialog Handlers
  const handleOpenAddOnDialog = (addOn?: AddOn) => {
    if (addOn) {
      setEditingAddOn(addOn);
      setAddOnFormData({
        name: addOn.name,
        icon: addOn.icon,
        type: addOn.type,
        description: addOn.description || ''
      });
    } else {
      setEditingAddOn(null);
      setAddOnFormData({
        name: '',
        icon: 'Home',
        type: 'building',
        description: ''
      });
    }
    setAddOnDialogOpen(true);
  };

  const handleSaveAddOn = () => {
    if (!addOnFormData.name.trim()) return;

    const addOn: AddOn = {
      id: editingAddOn?.id || generateId(),
      name: addOnFormData.name.trim(),
      icon: addOnFormData.icon,
      type: addOnFormData.type,
      description: addOnFormData.description.trim() || undefined
    };

    if (editingAddOn) {
      onAddOnUpdate(addOn);
    } else {
      onAddOnAdd(addOn);
    }

    setAddOnDialogOpen(false);
  };

  const handleDeleteTileType = (tileType: TileType) => {
    if (confirm(`Delete tile type "${tileType.name}"?`)) {
      onTileTypeDelete(tileType.id);
    }
  };

  const handleDeleteAddOn = (addOn: AddOn) => {
    if (confirm(`Delete add-on "${addOn.name}"?`)) {
      onAddOnDelete(addOn.id);
    }
  };

  const handleAddToTile = (addOn: AddOn) => {
    if (selectedTile && !selectedTile.addOns.find(a => a.id === addOn.id)) {
      onTileAddOnAdd(selectedTile, addOn);
    }
  };

  const handleRemoveFromTile = (addOnId: string) => {
    if (selectedTile) {
      onTileAddOnRemove(selectedTile, addOnId);
    }
  };

  const TileIconComponent = (LucideIcons as any)[tileFormData.icon]; // eslint-disable-line @typescript-eslint/no-explicit-any
  const AddOnIconComponent = (LucideIcons as any)[addOnFormData.icon]; // eslint-disable-line @typescript-eslint/no-explicit-any

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Content</CardTitle>
      </CardHeader>
      
      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="px-4 mb-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="tiles" className="flex items-center gap-2 text-xs">
                <Layers className="h-4 w-4" />
                <span className="hidden sm:inline">Tiles</span>
                <Badge variant="secondary" className="text-xs">
                  {tileTypes.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="addons" className="flex items-center gap-2 text-xs">
                <Package className="h-4 w-4" />
                <span className="hidden sm:inline">Add-ons</span>
                <Badge variant="secondary" className="text-xs">
                  {addOns.length}
                </Badge>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Tile Types Tab */}
          <TabsContent value="tiles" className="space-y-4 mt-0">
            <div className="px-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium">Tile Types</h4>
                <Dialog open={tileDialogOpen} onOpenChange={setTileDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleOpenTileDialog()}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>
                        {editingTileType ? 'Edit Tile Type' : 'Create Tile Type'}
                      </DialogTitle>
                    </DialogHeader>
                    
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="tile-name">Name</Label>
                        <Input
                          id="tile-name"
                          value={tileFormData.name}
                          onChange={(e) => setTileFormData(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Tile type name"
                        />
                      </div>

                      <div>
                        <Label htmlFor="tile-description">Description</Label>
                        <Input
                          id="tile-description"
                          value={tileFormData.description}
                          onChange={(e) => setTileFormData(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Optional description"
                        />
                      </div>

                      <div>
                        <Label>Color</Label>
                        <div className="flex gap-2 mt-2">
                          {PRESET_COLORS.map(color => (
                            <button
                              key={color}
                              className={cn(
                                "w-8 h-8 rounded border-2 cursor-pointer transition-all",
                                tileFormData.color === color ? "border-ring scale-110" : "border-border"
                              )}
                              style={{ backgroundColor: color }}
                              onClick={() => setTileFormData(prev => ({ ...prev, color }))}
                            />
                          ))}
                        </div>
                        <Input
                          value={tileFormData.color}
                          onChange={(e) => setTileFormData(prev => ({ ...prev, color: e.target.value }))}
                          placeholder="Custom color (HSL)"
                          className="mt-2"
                        />
                      </div>

                      <div>
                        <Label>Icon</Label>
                        <div className="grid grid-cols-6 gap-2 mt-2 max-h-32 overflow-y-auto pr-2">
                          {TILE_ICONS.map(iconName => {
                            const Icon = (LucideIcons as any)[iconName]; // eslint-disable-line @typescript-eslint/no-explicit-any
                            return Icon ? (
                              <button
                                key={iconName}
                                className={cn(
                                  "p-2 rounded border transition-all hover:bg-muted",
                                  tileFormData.icon === iconName ? "border-ring bg-muted" : "border-border"
                                )}
                                onClick={() => setTileFormData(prev => ({ ...prev, icon: iconName }))}
                              >
                                <Icon className="h-4 w-4" />
                              </button>
                            ) : null;
                          })}
                        </div>
                      </div>

                      <div>
                        <Label>Height: {tileFormData.height}</Label>
                        <Slider
                          value={[tileFormData.height]}
                          onValueChange={([value]) => setTileFormData(prev => ({ ...prev, height: value }))}
                          max={10}
                          min={0}
                          step={1}
                          className="mt-2"
                        />
                      </div>

                      {/* Preview */}
                      <div className="p-4 border rounded-lg bg-muted">
                        <Label className="text-sm">Preview</Label>
                        <div className="flex items-center gap-2 mt-2">
                          <div 
                            className="w-8 h-8 rounded border flex items-center justify-center"
                            style={{ backgroundColor: tileFormData.color }}
                          >
                            {TileIconComponent && <TileIconComponent className="h-4 w-4" />}
                          </div>
                          <div>
                            <div className="font-medium">{tileFormData.name || 'Unnamed'}</div>
                            <div className="text-xs text-muted-foreground">
                              Height: {tileFormData.height}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setTileDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleSaveTileType} disabled={!tileFormData.name.trim()}>
                          {editingTileType ? 'Update' : 'Create'}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="h-64 overflow-y-auto pr-2">
                <div className="space-y-1">
                  {tileTypes.map((tileType) => {
                    const Icon = tileType.icon ? (LucideIcons as any)[tileType.icon] : null; // eslint-disable-line @typescript-eslint/no-explicit-any
                    const isSelected = selectedTileType?.id === tileType.id;
                    
                    return (
                      <div
                        key={tileType.id}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-muted transition-colors border",
                          isSelected ? "bg-muted border-ring" : "border-transparent"
                        )}
                        onClick={() => onTileTypeSelect(tileType)}
                      >
                        <div 
                          className="w-8 h-8 rounded border flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: tileType.color }}
                        >
                          {Icon && <Icon className="h-4 w-4" />}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{tileType.name}</div>
                          <div className="text-xs text-muted-foreground">
                            Height: {tileType.height}
                          </div>
                        </div>
                        
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 opacity-60 hover:opacity-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenTileDialog(tileType);
                            }}
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive opacity-60 hover:opacity-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteTileType(tileType);
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {tileTypes.length === 0 && (
                <div className="p-6 text-center text-muted-foreground">
                  <Palette className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No tile types yet</p>
                  <p className="text-xs">Click + to create your first tile type</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Add-ons Tab */}
          <TabsContent value="addons" className="space-y-4 mt-0">
            <div className="px-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium">Add-ons</h4>
                <Dialog open={addOnDialogOpen} onOpenChange={setAddOnDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleOpenAddOnDialog()}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>
                        {editingAddOn ? 'Edit Add-on' : 'Create Add-on'}
                      </DialogTitle>
                    </DialogHeader>
                    
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="addon-name">Name</Label>
                        <Input
                          id="addon-name"
                          value={addOnFormData.name}
                          onChange={(e) => setAddOnFormData(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Add-on name"
                        />
                      </div>

                      <div>
                        <Label htmlFor="addon-description">Description</Label>
                        <Input
                          id="addon-description"
                          value={addOnFormData.description}
                          onChange={(e) => setAddOnFormData(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Optional description"
                        />
                      </div>

                      <div>
                        <Label htmlFor="addon-type">Type</Label>
                        <Select value={addOnFormData.type} onValueChange={(value: 'building' | 'nature' | 'decoration' | 'structure') => setAddOnFormData(prev => ({ ...prev, type: value }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ADDON_TYPES.map(type => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Icon</Label>
                        <div className="grid grid-cols-6 gap-2 mt-2 max-h-32 overflow-y-auto pr-2">
                          {ADDON_ICONS.map(iconName => {
                            const Icon = (LucideIcons as any)[iconName]; // eslint-disable-line @typescript-eslint/no-explicit-any
                            return Icon ? (
                              <button
                                key={iconName}
                                className={cn(
                                  "p-2 rounded border transition-all hover:bg-muted",
                                  addOnFormData.icon === iconName ? "border-ring bg-muted" : "border-border"
                                )}
                                onClick={() => setAddOnFormData(prev => ({ ...prev, icon: iconName }))}
                              >
                                <Icon className="h-4 w-4" />
                              </button>
                            ) : null;
                          })}
                        </div>
                      </div>

                      {/* Preview */}
                      <div className="p-4 border rounded-lg bg-muted">
                        <Label className="text-sm">Preview</Label>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="w-8 h-8 rounded border flex items-center justify-center bg-background">
                            {AddOnIconComponent && <AddOnIconComponent className="h-4 w-4" />}
                          </div>
                          <div>
                            <div className="font-medium">{addOnFormData.name || 'Unnamed'}</div>
                            <div className="text-xs text-muted-foreground capitalize">
                              {addOnFormData.type}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setAddOnDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleSaveAddOn} disabled={!addOnFormData.name.trim()}>
                          {editingAddOn ? 'Update' : 'Create'}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="h-48 overflow-y-auto pr-2">
                <div className="space-y-1">
                  {addOns.map((addOn) => {
                    const Icon = (LucideIcons as any)[addOn.icon]; // eslint-disable-line @typescript-eslint/no-explicit-any
                    const isSelected = selectedAddOn?.id === addOn.id;
                    
                    return (
                      <div
                        key={addOn.id}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-muted transition-colors border",
                          isSelected ? "bg-muted border-ring" : "border-transparent"
                        )}
                        onClick={() => onAddOnSelect(addOn)}
                      >
                        <div className="w-6 h-6 rounded border flex items-center justify-center flex-shrink-0 bg-background">
                          {Icon && <Icon className="h-3 w-3" />}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate text-sm">{addOn.name}</div>
                          <div className="text-xs text-muted-foreground capitalize">
                            {addOn.type}
                          </div>
                        </div>
                        
                        {selectedTile && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 opacity-60 hover:opacity-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddToTile(addOn);
                            }}
                            disabled={selectedTile.addOns.some(a => a.id === addOn.id)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        )}
                        
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 opacity-60 hover:opacity-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenAddOnDialog(addOn);
                            }}
                          >
                            <Edit2 className="h-2 w-2" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 text-destructive hover:text-destructive opacity-60 hover:opacity-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteAddOn(addOn);
                            }}
                          >
                            <Trash2 className="h-2 w-2" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {addOns.length === 0 && (
                <div className="p-6 text-center text-muted-foreground">
                  <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No add-ons yet</p>
                  <p className="text-xs">Click + to create your first add-on</p>
                </div>
              )}
            </div>

            {/* Selected Tile Add-ons */}
            {selectedTile && (
              <>
                <Separator />
                <div className="px-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Info className="h-4 w-4 text-muted-foreground" />
                    <h4 className="text-sm font-medium">
                      {selectedTile.type.name} Tile
                    </h4>
                  </div>
                  
                  {selectedTile.addOns.length > 0 ? (
                    <div className="space-y-1">
                      {selectedTile.addOns.map(addOn => {
                        const Icon = (LucideIcons as any)[addOn.icon]; // eslint-disable-line @typescript-eslint/no-explicit-any
                        return (
                          <div key={addOn.id} className="flex items-center gap-2 p-2 rounded bg-muted/50">
                            <div className="w-4 h-4 flex items-center justify-center">
                              {Icon && <Icon className="h-3 w-3" />}
                            </div>
                            <span className="flex-1 text-sm">{addOn.name}</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-5 w-5 p-0 text-destructive hover:text-destructive"
                              onClick={() => handleRemoveFromTile(addOn.id)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-muted-foreground rounded-lg bg-muted/30">
                      <Package className="h-6 w-6 mx-auto mb-1 opacity-50" />
                      <p className="text-xs">No add-ons on this tile</p>
                      <p className="text-xs">Click + next to an add-on to add it</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
} 