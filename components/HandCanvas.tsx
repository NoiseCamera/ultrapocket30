
import React, { useEffect, useRef } from 'react';
import { getHandPixelData } from '../constants';

interface HandCanvasProps {
  hand: number; // 0: Rock, 1: Scissors, 2: Paper
  size?: number;
  flip?: boolean;
}

const HandCanvas: React.FC<HandCanvasProps> = ({ hand, size = 64, flip = false }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const pixels = getHandPixelData(hand);
    const pSize = size / 24;

    ctx.clearRect(0, 0, size, size);
    if (flip) {
      ctx.translate(size, 0);
      ctx.scale(-1, 1);
    }

    pixels.forEach((row, y) => {
      row.forEach((pixel, x) => {
        if (pixel === 1) {
          ctx.fillStyle = '#0f380f';
          ctx.fillRect(x * pSize, y * pSize, pSize, pSize);
        }
      });
    });

    if (flip) ctx.setTransform(1, 0, 0, 1, 0, 0);
  }, [hand, size, flip]);

  return <canvas ref={canvasRef} width={size} height={size} className="image-rendering-pixelated" />;
};

export default HandCanvas;
