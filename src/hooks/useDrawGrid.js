import { useCallback } from 'react';

const useDrawGrid = () => {
  const drawGrid = useCallback((ctx, data) => {
    const gridSize = 10000;
    ctx.strokeStyle = '#f0f0f0';
    ctx.lineWidth = 300;
    
    for (let x = 0; x <= data.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, data.height);
      ctx.stroke();
    }
    
    for (let y = 0; y <= data.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(data.width, y);
      ctx.stroke();
    }
  }, []);

  return drawGrid;
};

export default useDrawGrid; 