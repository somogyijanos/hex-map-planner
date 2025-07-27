'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './dialog';
import { Button } from './button';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { Separator } from './separator';
import { Palette, MapPin, Layers, Plus, Sparkles } from 'lucide-react';
import { TemplateExample } from '../types/template';

// Types
interface Template {
  id: string;
  name: string;
  description?: string;
  tileTypes?: Array<{ id: string; name: string; description?: string }>;
  addOns?: Array<{ id: string; name: string; type?: string; description?: string }>;
  examples: TemplateExample[];
}

interface TemplateSelectorProps {
  availableTemplates: Template[];
  onTemplateSelect: (templateId: string, exampleName?: string) => void;
  trigger?: React.ReactNode;
}

// Utils
import { getTemplateIcon } from './utils/templateUtils';

// Components
function LoadingState() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <Palette className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
        <p className="text-sm text-muted-foreground">Loading templates...</p>
      </div>
    </div>
  );
}

function TemplateStats({ template }: { template: Template }) {
  const tileTypeCount = template.tileTypes?.length || 0;
  const addOnCount = template.addOns?.length || 0;
  const exampleCount = template.examples?.length || 0;
  
  // Count add-on types
  const addOnTypes = template.addOns?.reduce((acc, addOn) => {
    const type = addOn.type || 'other';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  return (
    <div className="flex flex-wrap gap-1 mt-2">
      <Badge variant="secondary" className="text-xs">
        <Layers className="h-3 w-3 mr-1" />
        {tileTypeCount} tiles
      </Badge>
      <Badge variant="secondary" className="text-xs">
        <Plus className="h-3 w-3 mr-1" />
        {addOnCount} add-ons
      </Badge>
      <Badge variant="secondary" className="text-xs">
        <Sparkles className="h-3 w-3 mr-1" />
        {exampleCount} examples
      </Badge>
      {Object.entries(addOnTypes).slice(0, 2).map(([type, count]) => (
        <Badge key={type} variant="outline" className="text-xs">
          {count} {type}
        </Badge>
      ))}
    </div>
  );
}

function ExampleCard({ example, onSelect }: { 
  example: TemplateExample; 
  onSelect: () => void;
}) {
  return (
    <Button
      variant="ghost"
      className="w-full justify-start text-left h-auto p-3 border rounded hover:bg-muted/50"
      onClick={onSelect}
    >
      <div className="min-w-0 w-full space-y-1">
        <div className="flex items-center justify-between">
          <span className="font-medium text-sm truncate">{example.name}</span>
          <Badge variant="outline" className="text-xs ml-2 flex-shrink-0">
            <MapPin className="h-3 w-3 mr-1" />
            {example.tiles?.length || 0} tiles
          </Badge>
        </div>
        {example.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 text-left">
            {example.description}
          </p>
        )}
      </div>
    </Button>
  );
}

function TemplateCard({ template, onSelect, onClose }: { 
  template: Template; 
  onSelect: (templateId: string, exampleName?: string) => void;
  onClose: () => void;
}) {
  const handleSelect = (templateId: string, exampleName?: string) => {
    onSelect(templateId, exampleName);
    onClose();
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded bg-muted/50 flex-shrink-0 mt-0.5">
            {getTemplateIcon(template.id)}
          </div>
          <div className="min-w-0 flex-1">
            <CardTitle className="text-sm truncate">{template.name}</CardTitle>
            {template.description && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {template.description}
              </p>
            )}
            <TemplateStats template={template} />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 space-y-3">
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start text-xs"
          onClick={() => handleSelect(template.id)}
        >
          <Palette className="h-3 w-3 mr-2 flex-shrink-0" />
          <span className="truncate">Start Empty Template</span>
        </Button>
        
        {template.examples?.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-medium">Pre-built Examples:</p>
              <div className="space-y-1">
                {template.examples.map((example, index) => (
                  <ExampleCard
                    key={index}
                    example={example}
                    onSelect={() => handleSelect(template.id, example.name)}
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

// Main Component
export function TemplateSelector({ availableTemplates, onTemplateSelect, trigger }: TemplateSelectorProps) {
  const [open, setOpen] = React.useState(false);
  
  const handleTemplateSelect = (templateId: string, exampleName?: string) => {
    onTemplateSelect(templateId, exampleName);
    setOpen(false);
  };

  const hasTemplates = availableTemplates?.length > 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Palette className="h-4 w-4 mr-2" />
            Templates
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl h-[500px] flex flex-col">
        <DialogHeader className="pb-2 flex-shrink-0">
          <DialogTitle className="text-lg">Choose Template</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Start with a template and tile types, or use a pre-built example
          </p>
        </DialogHeader>
        
        <div className="flex-1 overflow-auto min-h-0">
          {!hasTemplates ? (
            <LoadingState />
          ) : (
            <div className="grid grid-cols-1 gap-4 p-1">
              {availableTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onSelect={handleTemplateSelect}
                  onClose={() => setOpen(false)}
                />
              ))}
            </div>
          )}
        </div>
        
        <div className="text-xs text-muted-foreground pt-3 border-t flex-shrink-0 space-y-1">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Palette className="h-3 w-3" />
              Empty: tile types & add-ons only
            </span>
            <span className="flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              Example: complete pre-built map
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 