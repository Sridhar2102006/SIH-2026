import React from 'react';
import { useAppState } from '../../context/AppStateContext';
import { BatchList } from './BatchList';
import { BatchDetail } from './BatchDetail';

export const HoneyView = () => {
  const { selectedBatchId, setSelectedBatchId } = useAppState();

  if (selectedBatchId) {
    return (
      <BatchDetail
        batchId={selectedBatchId}
        onBack={() => setSelectedBatchId(null)}
      />
    );
  }

  return <BatchList />;
};
