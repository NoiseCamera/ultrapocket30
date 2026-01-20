
import React, { useEffect, useRef } from 'react';
import { getItemPixelData } from '../constants';

interface ItemCanvasProps {
  // Fix: Added missing types that are supported by getItemPixelData but were missing in the interface
  type: 'fruit' | 'bad' | 'poop' | 'sick' | 'heart' | 'hunger';
  size?: number;
}

const ItemCanvas: React.FC<ItemCanvasProps> = ({ type, size = 32 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const pixels = getItemPixelData(type);
    const pSize = size / 16;

    ctx.clearRect(0, 0, size, size);
    pixels.forEach((row, y) => {
      row.forEach((pixel, x) => {
        if (pixel === 1) {
          ctx.fillStyle = '#0f380f';
          ctx.fillRect(x * pSize, y * pSize, pSize, pSize);
        } else if (pixel === 2) {
          ctx.fillStyle = '#9bbc0f';
          ctx.fillRect(x * pSize, y * pSize, pSize, pSize);
        }
      });
    });
  }, [type, size]);

  return <canvas ref={canvasRef} width={size} height={size} className="image-rendering-pixelated" />;
};

export default ItemCanvas;
