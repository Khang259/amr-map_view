import { useCallback } from 'react';

const useParseNodes = () => {
  const parseNodes = useCallback((nodeArr, nodeKeys) => {
    return nodeArr.map(nodeData => {
      const node = {};
      nodeKeys.forEach((key, index) => {
        node[key] = nodeData[index];
      });
      return node;
    });
  }, []);

  return parseNodes;
};

export default useParseNodes; 