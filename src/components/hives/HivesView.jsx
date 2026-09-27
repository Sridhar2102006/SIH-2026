import React from 'react';
import { useAppState } from '../../context/AppStateContext';
import { HiveList } from './HiveList';
import { HiveDetail } from './HiveDetail';

export const HivesView = () => {
  const { selectedHiveId, setSelectedHiveId } = useAppState();

  if (selectedHiveId) {
    return (
      <HiveDetail
        hiveId={selectedHiveId}
        onBack={() => setSelectedHiveId(null)}
      />
    );
  }

  return <HiveList />;
};
