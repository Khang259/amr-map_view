import { useCallback } from 'react';
import useParseNodes from './useParseNodes';

const useDrawChargeStations = () => {
  const parseNodes = useParseNodes();

  const drawChargeStations = useCallback((ctx, data) => {
    if (!data.chargeCoor) return;
    
    const nodes = parseNodes(data.nodeArr, data.nodeKeys);
    const nodeMap = {};
    nodes.forEach(node => {
      nodeMap[node.name] = node;
    });

    data.chargeCoor.forEach(([nodeId, offset]) => {
      const node = nodeMap[nodeId];
      if (node) {
        ctx.fillStyle = '#ffeaa7';
        ctx.beginPath();
        ctx.arc(node.x, node.y, 1200, 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.fillStyle = '#fdcb6e';
        ctx.font = '2000px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('⚡', node.x, node.y + 600);
      }
    });
  }, [parseNodes]);

  return drawChargeStations;
};

export default useDrawChargeStations; 