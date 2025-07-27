import { readdir } from 'fs/promises';
import { join } from 'path';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const templatesDir = join(process.cwd(), 'public', 'templates');
    const files = await readdir(templatesDir);
    
    // Filter for .json files and extract template IDs
    const templateIds = files
      .filter(file => file.endsWith('.json'))
      .map(file => file.replace('.json', ''));
    
    return NextResponse.json({ templates: templateIds });
  } catch (error) {
    console.error('Error reading templates directory:', error);
    return NextResponse.json({ templates: [] });
  }
} 