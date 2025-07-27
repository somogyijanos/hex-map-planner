import React from 'react';
import { 
  Castle, 
  Sword, 
  Users, 
  Sparkles, 
  TreePine, 
  MapPin 
} from 'lucide-react';

export const getTemplateIcon = (templateId: string) => {
  const iconMap: Record<string, React.ReactNode> = {
    'fantasy': <Castle className="h-5 w-5" />,
    'medieval-realm': <Sword className="h-5 w-5" />,
    'modern': <Users className="h-5 w-5" />,
    'sci-fi': <Sparkles className="h-5 w-5" />,
    'nature': <TreePine className="h-5 w-5" />,
  };
  return iconMap[templateId] || <MapPin className="h-5 w-5" />;
};

export const getTemplateCategory = (templateId: string): string => {
  if (templateId.includes('fantasy') || templateId.includes('medieval')) return 'Fantasy';
  if (templateId.includes('modern') || templateId.includes('urban')) return 'Modern';
  if (templateId.includes('sci-fi') || templateId.includes('space')) return 'Sci-Fi';
  if (templateId.includes('nature') || templateId.includes('wilderness')) return 'Nature';
  return 'Other';
};

export const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'Fantasy': <Castle className="h-4 w-4" />,
  'Modern': <Users className="h-4 w-4" />,
  'Sci-Fi': <Sparkles className="h-4 w-4" />,
  'Nature': <TreePine className="h-4 w-4" />,
  'Other': <MapPin className="h-4 w-4" />,
}; 