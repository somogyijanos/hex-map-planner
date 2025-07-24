'use client';

import React, { useState } from 'react';
import { TileType } from '../types/map';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { Badge } from './badge';
import { Separator } from './separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './dialog';
import { Slider } from './slider';
import { Plus, Edit2, Trash2, Palette } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { cn } from '../lib/utils';
import { generateId } from '../lib/mapStorage';

interface TileTypePanelProps {
  tileTypes: TileType[];
  selectedTileType: TileType | null;
  onTileTypeSelect: (tileType: TileType) => void;
  onTileTypeAdd: (tileType: TileType) => void;
  onTileTypeUpdate: (tileType: TileType) => void;
  onTileTypeDelete: (tileTypeId: string) => void;
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

export function TileTypePanel({
  tileTypes,
  selectedTileType,
  onTileTypeSelect,
  onTileTypeAdd,
  onTileTypeUpdate,
  onTileTypeDelete,
  className = ''
}: TileTypePanelProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingType, setEditingType] = useState<TileType | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    color: 'hsl(120, 60%, 50%)',
    icon: 'TreePine',
    height: 1,
    description: ''
  });

  const handleOpenDialog = (tileType?: TileType) => {
    if (tileType) {
      setEditingType(tileType);
      setFormData({
        name: tileType.name,
        color: tileType.color,
        icon: tileType.icon || 'TreePine',
        height: tileType.height,
        description: tileType.description || ''
      });
    } else {
      setEditingType(null);
      setFormData({
        name: '',
        color: 'hsl(120, 60%, 50%)',
        icon: 'TreePine',
        height: 1,
        description: ''
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.name.trim()) return;

    const tileType: TileType = {
      id: editingType?.id || generateId(),
      name: formData.name.trim(),
      color: formData.color,
      icon: formData.icon,
      height: formData.height,
      description: formData.description.trim() || undefined
    };

    if (editingType) {
      onTileTypeUpdate(tileType);
    } else {
      onTileTypeAdd(tileType);
    }

    setIsDialogOpen(false);
  };

  const handleDelete = (tileType: TileType) => {
    if (confirm(`Delete tile type "${tileType.name}"?`)) {
      onTileTypeDelete(tileType.id);
    }
  };

  const IconComponent = (LucideIcons as any)[formData.icon]; // eslint-disable-line @typescript-eslint/no-explicit-any

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          Tile Types
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleOpenDialog()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingType ? 'Edit Tile Type' : 'Create Tile Type'}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Tile type name"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
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
                          formData.color === color ? "border-ring scale-110" : "border-border"
                        )}
                        style={{ backgroundColor: color }}
                        onClick={() => setFormData(prev => ({ ...prev, color }))}
                      />
                    ))}
                  </div>
                  <Input
                    value={formData.color}
                    onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                    placeholder="Custom color (HSL)"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Icon</Label>
                  <div className="grid grid-cols-6 gap-2 mt-2">
                    {TILE_ICONS.map(iconName => {
                      const Icon = (LucideIcons as any)[iconName]; // eslint-disable-line @typescript-eslint/no-explicit-any
                      return Icon ? (
                        <button
                          key={iconName}
                          className={cn(
                            "p-2 rounded border transition-all hover:bg-muted",
                            formData.icon === iconName ? "border-ring bg-muted" : "border-border"
                          )}
                          onClick={() => setFormData(prev => ({ ...prev, icon: iconName }))}
                        >
                          <Icon className="h-4 w-4" />
                        </button>
                      ) : null;
                    })}
                  </div>
                </div>

                <div>
                  <Label>Height: {formData.height}</Label>
                  <Slider
                    value={[formData.height]}
                    onValueChange={([value]) => setFormData(prev => ({ ...prev, height: value }))}
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
                      style={{ backgroundColor: formData.color }}
                    >
                      {IconComponent && <IconComponent className="h-4 w-4" />}
                    </div>
                    <div>
                      <div className="font-medium">{formData.name || 'Unnamed'}</div>
                      <div className="text-xs text-muted-foreground">
                        Height: {formData.height}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={!formData.name.trim()}>
                    {editingType ? 'Update' : 'Create'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="max-h-48 overflow-y-auto">
          {tileTypes.map((tileType, index) => {
            const Icon = tileType.icon ? (LucideIcons as any)[tileType.icon] : null; // eslint-disable-line @typescript-eslint/no-explicit-any
            const isSelected = selectedTileType?.id === tileType.id;
            
            return (
              <div key={tileType.id}>
                <div
                  className={cn(
                    "flex items-center gap-3 p-3 cursor-pointer hover:bg-muted transition-colors",
                    isSelected && "bg-muted"
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
                      className="h-8 w-8 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenDialog(tileType);
                      }}
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(tileType);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                {index < tileTypes.length - 1 && <Separator />}
              </div>
            );
          })}
        </div>
        
        {tileTypes.length === 0 && (
          <div className="p-6 text-center text-muted-foreground">
            <Palette className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No tile types yet</p>
            <p className="text-xs">Click + to create your first tile type</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 