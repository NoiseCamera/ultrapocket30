
import React, { useEffect, useRef } from 'react';
import { getArrowPixelData } from '../constants';

interface ArrowCanvasProps {
  dir: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
  size?: number;
  color?: string;
}

const ArrowCanvas: React.FC<ArrowCanvasProps> = ({ dir, size = 24, color = '#9ca3af' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const pixels = getArrowPixelData(dir);
    const pSize = size / 8;

    ctx.clearRect(0, 0, size, size);
    pixels.forEach((row, y) => {
      row.forEach((pixel, x) => {
        if (pixel === 1) {
          ctx.fillStyle = color;
          ctx.fillRect(x * pSize, y * pSize, pSize, pSize);
        }
      });
    });
  }, [dir, size, color]);

  return <canvas ref={canvasRef} width={size} height={size} className="image-rendering-pixelated" />;
};

export default ArrowCanvas;
