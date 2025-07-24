'use client';

import { HexMapPlanner } from '@/hex-map-planner';
import { Toaster, toast } from 'sonner';

export default function Home() {
  const handleToast = (type: 'success' | 'error', message: string) => {
    if (type === 'success') {
      toast.success(message);
    } else {
      toast.error(message);
    }
  };

  return (
    <main>
      <HexMapPlanner onToast={handleToast} />
      <Toaster position="top-right" />
    </main>
  );
}
