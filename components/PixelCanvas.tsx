import React, { useEffect, useRef } from 'react';
import { getPixelData } from '../constants';

interface PixelCanvasProps {
  characterId: number;
  frame: number;
  size?: number;
  isEating?: boolean;
}

const PixelCanvas: React.FC<PixelCanvasProps> = ({ characterId, frame, size = 256, isEating = false }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const pixels = getPixelData(characterId, frame, isEating);
    const pixelSize = size / 32;

    ctx.clearRect(0, 0, size, size);

    pixels.forEach((row, y) => {
      row.forEach((pixel, x) => {
        if (pixel === 1) {
          ctx.fillStyle = '#0f380f'; // LCD Black
          ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
        } else if (pixel === 2) {
          ctx.fillStyle = '#9bbc0f'; // LCD Screen Background
          ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
        }
      });
    });
  }, [characterId, frame, size, isEating]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className="image-rendering-pixelated"
    />
  );
};

export default PixelCanvas;