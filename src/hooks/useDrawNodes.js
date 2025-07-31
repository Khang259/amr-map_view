import { useCallback } from 'react';
import useParseNodes from './useParseNodes';

const useDrawNodes = () => {
  const parseNodes = useParseNodes();

  const drawNodes = useCallback((ctx, data, nodeRadius = 100, nodeStrokeWidth = 20, nodeFontSize = 500) => {
    const nodes = parseNodes(data.nodeArr, data.nodeKeys);
    
    nodes.forEach(node => {
      ctx.beginPath();
      ctx.arc(node.x, node.y, nodeRadius, 0, 2 * Math.PI);
      
      switch (node.type) {
        case 0:
          ctx.fillStyle = '#00b894';
          break;
        case 6:
          ctx.fillStyle = '#e17055';
          break;
        default:
          ctx.fillStyle = '#636e72';
      }
      
      ctx.fill();
      ctx.strokeStyle = '#2d3436';
      ctx.lineWidth = nodeStrokeWidth;
      ctx.stroke();
      
      ctx.fillStyle = '#2d3436';
      ctx.font = `${nodeFontSize}px Arial`;
      ctx.textAlign = 'center';
      ctx.fillText(node.name.slice(-3), node.x, node.y - nodeRadius - 200);
    });
  }, [parseNodes]);

  return drawNodes;
};

export default useDrawNodes; 