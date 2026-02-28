'use client';

import { useEffect, useRef } from 'react';

interface PlotOutputProps {
  images: ImageBitmap[];
}

export default function PlotOutput({ images }: PlotOutputProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || images.length === 0) return;

    const canvas = canvasRef.current;
    const lastImage = images[images.length - 1];

    canvas.width = lastImage.width;
    canvas.height = lastImage.height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(lastImage, 0, 0);
  }, [images]);

  if (images.length === 0) return null;

  return (
    <div className="bg-white rounded-lg p-2 flex items-center justify-center">
      <canvas
        ref={canvasRef}
        className="max-w-full h-auto"
        style={{ maxHeight: '400px' }}
      />
    </div>
  );
}
