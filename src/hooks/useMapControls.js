import { useState, useCallback } from 'react';

const useMapControls = () => {
  const [scale, setScale] = useState(0.008);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [mirrorX, setMirrorX] = useState(false);
  const [mirrorY, setMirrorY] = useState(false);

  const handleZoom = useCallback((direction) => {
    setScale(prev => {
      const newScale = direction > 0 ? prev * 1.2 : prev / 1.2;
      return Math.max(0.001, Math.min(0.05, newScale));
    });
  }, []);

  const handleReset = useCallback(() => {
    setScale(0.008);
    setOffset({ x: 0, y: 0 });
    setRotation(0);
    setMirrorX(false);
    setMirrorY(false);
  }, []);

  const handleRotate = useCallback((direction) => {
    setRotation(prev => {
      const newRotation = prev + (direction * 90);
      return newRotation % 360;
    });
  }, []);

  const handleMirrorX = useCallback(() => {
    setMirrorX(prev => !prev);
  }, []);

  const handleMirrorY = useCallback(() => {
    setMirrorY(prev => !prev);
  }, []);

  return {
    scale,
    offset,
    rotation,
    mirrorX,
    mirrorY,
    setOffset,
    handleZoom,
    handleReset,
    handleRotate,
    handleMirrorX,
    handleMirrorY
  };
};

export default useMapControls; 