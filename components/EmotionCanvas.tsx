
import React, { useEffect, useRef } from 'react';
import { getEmotionPixelData } from '../constants';
import { EmotionType } from '../types';

interface EmotionCanvasProps {
  type: EmotionType;
  size?: number;
}

const EmotionCanvas: React.FC<EmotionCanvasProps> = ({ type, size = 32 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !type) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const pixels = getEmotionPixelData(type);
    const pSize = size / 16;

    ctx.clearRect(0, 0, size, size);
    pixels.forEach((row, y) => {
      row.forEach((pixel, x) => {
        if (pixel === 1) {
          ctx.fillStyle = '#0f380f';
          ctx.fillRect(x * pSize, y * pSize, pSize, pSize);
        }
      });
    });
  }, [type, size]);

  if (!type) return null;

  return <canvas ref={canvasRef} width={size} height={size} className="image-rendering-pixelated" />;
};

export default EmotionCanvas;
