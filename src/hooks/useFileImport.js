import { useState, useCallback } from 'react';

const useFileImport = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mapFileName, setMapFileName] = useState('');
  const [securityFileName, setSecurityFileName] = useState('');

  const handleFileImport = useCallback((file, type, setMapData, setSecurityConfig, setSelectedAvoidanceMode) => {
    if (!file) return;
    setLoading(true);
    setError(null);

    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target.result);
        
        if (type === 'map') {
          if (!jsonData.nodeKeys || !jsonData.lineKeys || !jsonData.nodeArr) {
            throw new Error('Invalid map file format. Missing required fields: nodeKeys, lineKeys, or nodeArr');
          }
          setMapData(jsonData);
          setMapFileName(file.name);
        } else if (type === 'security') {
          if (!jsonData.AvoidSceneSet) {
            throw new Error('Invalid security file format. Missing AvoidSceneSet field');
          }
          setSecurityConfig(jsonData);
          setSecurityFileName(file.name);
          if (jsonData.AvoidSceneSet.length > 0) {
            setSelectedAvoidanceMode(jsonData.AvoidSceneSet[0].id);
          }
        }
      } catch (error) {
        setError(`Error parsing ${type} file: ${error.message}`);
        console.error('File parsing error:', error);
      } finally {
        setLoading(false);
      }
    };

    reader.onerror = () => {
      setError(`Error reading ${type} file`);
      setLoading(false);
    };

    reader.readAsText(file);
  }, []);

  return {
    loading,
    error,
    mapFileName,
    securityFileName,
    handleFileImport
  };
};

export default useFileImport; 