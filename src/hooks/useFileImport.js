import { useState, useCallback } from 'react';

const useFileImport = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mapFileName, setMapFileName] = useState('');
  const [securityFileName, setSecurityFileName] = useState('');

  // Helper function to convert array format to object format
  const convertMapData = (jsonData) => {
    if (!jsonData.nodeKeys || !jsonData.lineKeys || !jsonData.nodeArr) {
      throw new Error('Invalid map file format. Missing required fields: nodeKeys, lineKeys, or nodeArr');
    }

    // Convert nodeArr from array of arrays to array of objects
    const convertedNodeArr = jsonData.nodeArr.map(nodeArray => {
      if (!Array.isArray(nodeArray) || nodeArray.length < 4) {
        console.warn('Invalid node array:', nodeArray);
        return null;
      }
      
      return {
        x: nodeArray[0], // x coordinate
        y: nodeArray[1], // y coordinate
        type: nodeArray[2], // type
        content: nodeArray[3], // content
        key: nodeArray[3], // use content as key for compatibility
        name: nodeArray[4] || nodeArray[3], // name or content
        isTurn: nodeArray[5] || 0,
        shelfIsTurn: nodeArray[6] || 0,
        extraTypes: nodeArray[7] || []
      };
    }).filter(node => node !== null);

    // Convert lineArr from array of arrays to array of objects
    const convertedLineArr = jsonData.lineArr.map(lineArray => {
      if (!Array.isArray(lineArray) || lineArray.length < 2) {
        console.warn('Invalid line array:', lineArray);
        return null;
      }
      
      return {
        startNode: lineArray[0], // from
        endNode: lineArray[1], // to
        leftWidth: lineArray[2] || 0,
        rightWidth: lineArray[3] || 0,
        startExpandDistance: lineArray[4] || 0,
        endExpandDistance: lineArray[5] || 0,
        path: lineArray[6] || []
      };
    }).filter(line => line !== null);

    return {
      ...jsonData,
      nodeArr: convertedNodeArr,
      lineArr: convertedLineArr
    };
  };

  const handleFileImport = useCallback((file, type, setMapData, setSecurityConfig, setSelectedAvoidanceMode) => {
    if (!file) return;
    setLoading(true);
    setError(null);

    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target.result);
        
        if (type === 'map') {
          // Convert the data format for LeafletMap compatibility
          const convertedData = convertMapData(jsonData);
          setMapData(convertedData);
          setMapFileName(file.name);
          // Lưu vào localStorage
          localStorage.setItem('mapData', JSON.stringify(convertedData));
          localStorage.setItem('mapFileName', file.name);
        } else if (type === 'security') {
          if (!jsonData.AvoidSceneSet) {
            throw new Error('Invalid security file format. Missing AvoidSceneSet field');
          }
          setSecurityConfig(jsonData);
          setSecurityFileName(file.name);
          // Lưu vào localStorage
          localStorage.setItem('securityData', JSON.stringify(jsonData));
          localStorage.setItem('securityFileName', file.name);
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