
import React, { useEffect, useRef } from 'react';
import { getIconPixelData } from '../constants';

interface IconCanvasProps {
  index: number;
  selected: boolean;
  size?: number;
}

const IconCanvas: React.FC<IconCanvasProps> = ({ index, selected, size = 32 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const pixels = getIconPixelData(index, selected);
    const pSize = size / 8;

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
  }, [index, selected, size]);

  return <canvas ref={canvasRef} width={size} height={size} />;
};

export default IconCanvas;
