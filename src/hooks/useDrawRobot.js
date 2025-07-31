import { useCallback } from 'react';

const useDrawRobot = () => {
  const drawRobot = useCallback((ctx, robot, security, amrImg, selectedAvoidanceMode) => {
    ctx.save();
    ctx.translate(robot.x, robot.y);
    ctx.rotate(robot.angle);
    
    const currentConfig = security?.AvoidSceneSet?.find(scene => scene.id === selectedAvoidanceMode);
    const avoidanceRadius = currentConfig?.config?.noload?.forward || 500;
    
    // Draw avoidance zone
    ctx.strokeStyle = 'rgba(255, 107, 107, 0.3)';
    ctx.fillStyle = 'rgba(255, 107, 107, 0.1)';
    ctx.lineWidth = 200;
    ctx.beginPath();
    ctx.arc(0, 0, avoidanceRadius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
    
    // Draw AMR robot image if loaded, otherwise fallback to rectangle
    if (amrImg) {
      // Calculate image size (adjust as needed)
      const imageSize = 3000; // Same size as the original rectangle
      ctx.drawImage(amrImg, -imageSize/2, -imageSize/2, imageSize, imageSize);
    } else {
      // Fallback to original rectangle drawing
      ctx.fillStyle = '#0984e3';
      ctx.fillRect(-1500, -1000, 3000, 2000);
      
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(1200, 0);
      ctx.lineTo(800, -600);
      ctx.lineTo(800, 600);
      ctx.closePath();
      ctx.fill();
    }
    
    ctx.restore();
    
    ctx.fillStyle = '#2d3436';
    ctx.font = '1000px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`(${Math.round(robot.x/1000)}k, ${Math.round(robot.y/1000)}k)`, robot.x, robot.y - 1500);
    
    if (currentConfig) {
      ctx.fillStyle = '#e17055';
      ctx.font = '800px Arial';
      ctx.fillText(currentConfig.name, robot.x, robot.y + 2000);
    }
  }, []);

  return drawRobot;
};

export default useDrawRobot; 