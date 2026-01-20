
import React, { useEffect, useRef } from 'react';

interface TimerCanvasProps {
  progress: number; // 0 to 1
  width?: number;
  height?: number;
}

const TimerCanvas: React.FC<TimerCanvasProps> = ({ progress, width = 100, height = 16 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const pixelSize = 2; // ドットの大きさ
    const cols = Math.floor(width / pixelSize);
    const rows = Math.floor(height / pixelSize);

    ctx.clearRect(0, 0, width, height);

    // 外枠の描画 (LCD Black)
    ctx.fillStyle = '#0f380f';
    
    // 上下のライン
    for (let x = 0; x < cols; x++) {
      ctx.fillRect(x * pixelSize, 0, pixelSize, pixelSize);
      ctx.fillRect(x * pixelSize, (rows - 1) * pixelSize, pixelSize, pixelSize);
    }
    // 左右のライン
    for (let y = 0; y < rows; y++) {
      ctx.fillRect(0, y * pixelSize, pixelSize, pixelSize);
      ctx.fillRect((cols - 1) * pixelSize, y * pixelSize, pixelSize, pixelSize);
    }

    // バー内部の描画 (progressに応じたドット)
    const maxFillWidth = cols - 4;
    const fillWidth = Math.floor(maxFillWidth * progress);

    // 背景の点線（ガイド）
    ctx.globalAlpha = 0.2;
    for (let x = 2; x < cols - 2; x += 2) {
      ctx.fillRect(x * pixelSize, 3 * pixelSize, pixelSize, (rows - 6) * pixelSize);
    }
    ctx.globalAlpha = 1.0;

    // 現在の進捗バー
    for (let y = 2; y < rows - 2; y++) {
      for (let x = 2; x < 2 + fillWidth; x++) {
        ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
      }
    }
  }, [progress, width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="image-rendering-pixelated"
    />
  );
};

export default TimerCanvas;
