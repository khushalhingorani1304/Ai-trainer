'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function Dashboard() {
  const [loading, setLoading] = useState(false);

  const startExercise = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/start-exercise', {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to start exercise');
      }
      alert('Exercise started successfully!');
    } catch (error) {
      console.error('Error:', error);
      alert('Error starting exercise');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold mb-4">AI Workout Dashboard</h1>
      <Button onClick={startExercise} disabled={loading}>
        {loading ? 'Starting...' : 'Start Exercise'}
      </Button>
    </div>
  );
}
