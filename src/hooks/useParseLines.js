import { useCallback } from 'react';

const useParseLines = () => {
  const parseLines = useCallback((lineArr, lineKeys) => {
    return lineArr.map(lineData => {
      const line = {};
      lineKeys.forEach((key, index) => {
        line[key] = lineData[index];
      });
      return line;
    });
  }, []);

  return parseLines;
};

export default useParseLines; 