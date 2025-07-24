'use client';

import React, { useState } from 'react';
import { AddOn, Tile } from '@/types/map';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit2, Trash2, Package, Home, X } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { cn } from '@/lib/utils';
import { generateId } from '@/lib/mapStorage';

interface AddOnPanelProps {
  addOns: AddOn[];
  selectedTile: Tile | null;
  selectedAddOn: AddOn | null;
  onAddOnSelect: (addOn: AddOn) => void;
  onAddOnAdd: (addOn: AddOn) => void;
  onAddOnUpdate: (addOn: AddOn) => void;
  onAddOnDelete: (addOnId: string) => void;
  onTileAddOnAdd: (tile: Tile, addOn: AddOn) => void;
  onTileAddOnRemove: (tile: Tile, addOnId: string) => void;
  className?: string;
}

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

export function AddOnPanel({
  addOns,
  selectedTile,
  selectedAddOn,
  onAddOnSelect,
  onAddOnAdd,
  onAddOnUpdate,
  onAddOnDelete,
  onTileAddOnAdd,
  onTileAddOnRemove,
  className = ''
}: AddOnPanelProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAddOn, setEditingAddOn] = useState<AddOn | null>(null);
  const [formData, setFormData] = useState<{
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

  const handleOpenDialog = (addOn?: AddOn) => {
    if (addOn) {
      setEditingAddOn(addOn);
      setFormData({
        name: addOn.name,
        icon: addOn.icon,
        type: addOn.type,
        description: addOn.description || ''
      });
    } else {
      setEditingAddOn(null);
      setFormData({
        name: '',
        icon: 'Home',
        type: 'building',
        description: ''
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.name.trim()) return;

    const addOn: AddOn = {
      id: editingAddOn?.id || generateId(),
      name: formData.name.trim(),
      icon: formData.icon,
      type: formData.type,
      description: formData.description.trim() || undefined
    };

    if (editingAddOn) {
      onAddOnUpdate(addOn);
    } else {
      onAddOnAdd(addOn);
    }

    setIsDialogOpen(false);
  };

  const handleDelete = (addOn: AddOn) => {
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

  const IconComponent = (LucideIcons as any)[formData.icon]; // eslint-disable-line @typescript-eslint/no-explicit-any

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          Add-ons
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
                  {editingAddOn ? 'Edit Add-on' : 'Create Add-on'}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="addon-name">Name</Label>
                  <Input
                    id="addon-name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Add-on name"
                  />
                </div>

                <div>
                  <Label htmlFor="addon-description">Description</Label>
                  <Input
                    id="addon-description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Optional description"
                  />
                </div>

                <div>
                  <Label htmlFor="addon-type">Type</Label>
                  <Select value={formData.type} onValueChange={(value: 'building' | 'nature' | 'decoration' | 'structure') => setFormData(prev => ({ ...prev, type: value }))}>
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
                  <div className="grid grid-cols-6 gap-2 mt-2 max-h-32 overflow-y-auto">
                    {ADDON_ICONS.map(iconName => {
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

                {/* Preview */}
                <div className="p-4 border rounded-lg bg-muted">
                  <Label className="text-sm">Preview</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="w-8 h-8 rounded border flex items-center justify-center bg-background">
                      {IconComponent && <IconComponent className="h-4 w-4" />}
                    </div>
                    <div>
                      <div className="font-medium">{formData.name || 'Unnamed'}</div>
                      <div className="text-xs text-muted-foreground capitalize">
                        {formData.type}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={!formData.name.trim()}>
                    {editingAddOn ? 'Update' : 'Create'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-0 space-y-4">
        {/* Available Add-ons */}
        <div>
          <div className="px-3 py-2 text-sm font-medium bg-muted/50">
            Available Add-ons
          </div>
          <div className="max-h-32 overflow-y-auto">
            {addOns.map((addOn, index) => {
              const Icon = (LucideIcons as any)[addOn.icon]; // eslint-disable-line @typescript-eslint/no-explicit-any
              const isSelected = selectedAddOn?.id === addOn.id;
              
              return (
                <div key={addOn.id}>
                  <div
                    className={cn(
                      "flex items-center gap-3 p-3 cursor-pointer hover:bg-muted transition-colors",
                      isSelected && "bg-muted"
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
                        className="h-6 w-6 p-0"
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
                        className="h-6 w-6 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDialog(addOn);
                        }}
                      >
                        <Edit2 className="h-2 w-2" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(addOn);
                        }}
                      >
                        <Trash2 className="h-2 w-2" />
                      </Button>
                    </div>
                  </div>
                  {index < addOns.length - 1 && <Separator />}
                </div>
              );
            })}
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
            <div>
              <div className="px-3 py-2 text-sm font-medium bg-muted/50">
                {selectedTile.type.name} Tile Add-ons
              </div>
              {selectedTile.addOns.length > 0 ? (
                <div className="space-y-1">
                  {selectedTile.addOns.map(addOn => {
                    const Icon = (LucideIcons as any)[addOn.icon]; // eslint-disable-line @typescript-eslint/no-explicit-any
                    return (
                      <div key={addOn.id} className="flex items-center gap-2 p-2 mx-3 rounded bg-muted/50">
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
                <div className="p-4 text-center text-muted-foreground">
                  <Home className="h-6 w-6 mx-auto mb-1 opacity-50" />
                  <p className="text-xs">No add-ons on this tile</p>
                  <p className="text-xs">Click + next to an add-on to add it</p>
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
} 