import { useCallback } from 'react';
import useParseLines from './useParseLines';

const useDrawPaths = () => {
  const parseLines = useParseLines();

  const drawPaths = useCallback((ctx, data) => {
    const lines = parseLines(data.lineArr, data.lineKeys);
    
    ctx.save();
    ctx.lineWidth = 500;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.shadowColor = "rgba(0,0,0,0.3)";
    ctx.shadowBlur = 12;

    lines.forEach(line => {
      if (line.path && line.path.length > 1) {
        // Gradient cho mỗi path
        const [x1, y1] = line.path[0];
        const [x2, y2] = line.path[line.path.length - 1];
        const grad = ctx.createLinearGradient(x1, y1, x2, y2);
        grad.addColorStop(0, "#74b9ff");
        grad.addColorStop(1, "#0984e3");
        ctx.strokeStyle = grad;

        ctx.beginPath();
        ctx.moveTo(line.path[0][0], line.path[0][1]);
        if (line.path.length === 2) {
          ctx.lineTo(line.path[1][0], line.path[1][1]);
        } else {
          for (let i = 1; i < line.path.length - 2; i++) {
            const xc = (line.path[i][0] + line.path[i + 1][0]) / 2;
            const yc = (line.path[i][1] + line.path[i + 1][1]) / 2;
            ctx.quadraticCurveTo(line.path[i][0], line.path[i][1], xc, yc);
          }
          ctx.quadraticCurveTo(
            line.path[line.path.length - 2][0], line.path[line.path.length - 2][1],
            line.path[line.path.length - 1][0], line.path[line.path.length - 1][1]
          );
        }
        ctx.stroke();
      }
    });
    ctx.restore();
  }, [parseLines]);

  return drawPaths;
};

export default useDrawPaths; 