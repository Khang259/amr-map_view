import { useCallback } from 'react';
import useDrawGrid from './useDrawGrid';
import useDrawPaths from './useDrawPaths';
import useDrawNodes from './useDrawNodes';
import useDrawChargeStations from './useDrawChargeStations';
import useDrawRobot from './useDrawRobot';

const useDrawMap = () => {
  const drawGrid = useDrawGrid();
  const drawPaths = useDrawPaths();
  const drawNodes = useDrawNodes();
  const drawChargeStations = useDrawChargeStations();
  const drawRobot = useDrawRobot();

  const drawMap = useCallback((ctx, data, security, offset, scale, rotation, mirrorX, mirrorY, robotPosition, showNodes, showPaths, showChargeStations, amrImage, selectedAvoidanceMode, nodeRadius = 100, nodeStrokeWidth = 20, nodeFontSize = 500) => {
    if (!data) return;

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    ctx.save();
    ctx.translate(offset.x + ctx.canvas.width/2, offset.y + ctx.canvas.height/2);
    ctx.scale(scale, scale);
    ctx.translate(-data.width/2, -data.height/2);

    // Apply transformations
    if (rotation !== 0) {
      ctx.rotate((rotation * Math.PI) / 180);
    }
    if (mirrorX) {
      ctx.scale(-1, 1);
    }
    if (mirrorY) {
      ctx.scale(1, -1);
    }

    drawGrid(ctx, data);
    
    if (showPaths) {
      drawPaths(ctx, data);
    }
    
    if (showNodes) {
      drawNodes(ctx, data, nodeRadius, nodeStrokeWidth, nodeFontSize);
    }
    
    if (showChargeStations) {
      drawChargeStations(ctx, data);
    }
    
    drawRobot(ctx, robotPosition, security, amrImage, selectedAvoidanceMode);
    
    ctx.restore();
  }, [drawGrid, drawPaths, drawNodes, drawChargeStations, drawRobot]);

  return drawMap;
};

export default useDrawMap; 