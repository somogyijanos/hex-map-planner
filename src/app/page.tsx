import { HexMapPlanner } from '@/components/HexMapPlanner';
import { Toaster } from 'sonner';

export default function Home() {
  return (
    <main>
      <HexMapPlanner />
      <Toaster position="top-right" />
    </main>
  );
}
