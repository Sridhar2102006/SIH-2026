import React, { useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { useAppState } from '../../context/AppStateContext';

/** Field-oriented creation of a beekeeper management cycle, never a processing batch. */
export const HiveBatchModal = ({ isOpen, onClose }) => {
  const { apiaries = [], hives = [], hiveManagementBatches = [], createHiveManagementBatch } = useAppState();
  const [name, setName] = useState('');
  const [apiaryId, setApiaryId] = useState('');
  const [hiveIds, setHiveIds] = useState([]);
  const [interval, setInterval] = useState('7');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const availableHives = useMemo(() => hives.filter(hive => !hive.isArchived && (!apiaryId || hive.apiaryId === apiaryId)), [hives, apiaryId]);
  const activeHiveIds = useMemo(() => new Set(hiveManagementBatches.filter(batch => !['COMPLETED', 'HARVESTED'].includes(batch.status)).flatMap(batch => batch.memberships.map(member => member.hiveId))), [hiveManagementBatches]);
  if (!isOpen) return null;

  const toggleHive = (id) => setHiveIds(current => current.includes(id) ? current.filter(value => value !== id) : [...current, id]);
  const submit = (event) => {
    event.preventDefault();
    const apiary = apiaries.find(item => item.id === apiaryId);
    const result = createHiveManagementBatch({ name, apiaryId, apiaryCode: apiary?.apiaryCode, hiveIds, inspectionIntervalDays: Number(interval), notes });
    if (!result.success) return setError(result.error);
    setName(''); setApiaryId(''); setHiveIds([]); setNotes(''); setError(''); onClose();
  };

  return <div className="bk-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="hive-batch-title">
    <form className="bk-modal-card" onSubmit={submit}>
      <div className="bk-modal-header"><div><h2 id="hive-batch-title" className="bk-modal-title">Create hive batch</h2><p className="bk-modal-sub">A field-management cycle for selected hives—not a processing batch.</p></div><button type="button" className="bk-close-btn" onClick={onClose} aria-label="Close"><X size={20} /></button></div>
      <div className="bk-stepper-body">
        {error && <p className="bk-alert-error" role="alert">{error}</p>}
        <label className="bk-field-label">Batch name<input required className="bk-form-input" value={name} onChange={event => setName(event.target.value)} placeholder="e.g. Autumn nectar cycle" /></label>
        <label className="bk-field-label">Apiary<select required className="bk-form-input" value={apiaryId} onChange={event => { setApiaryId(event.target.value); setHiveIds([]); }}><option value="">Select an apiary</option>{apiaries.map(apiary => <option value={apiary.id} key={apiary.id}>{apiary.name} ({apiary.apiaryCode})</option>)}</select></label>
        <label className="bk-field-label">Inspection interval (days)<input required min="1" max="90" type="number" className="bk-form-input" value={interval} onChange={event => setInterval(event.target.value)} /></label>
        <fieldset className="bk-choice-list"><legend className="bk-field-label">Select hives</legend>{availableHives.map(hive => <label key={hive.id} className="bk-choice-item"><input type="checkbox" disabled={activeHiveIds.has(hive.id)} checked={hiveIds.includes(hive.id)} onChange={() => toggleHive(hive.id)} /> {hive.code} — {hive.name}{activeHiveIds.has(hive.id) ? ' (in an active cycle)' : ''}</label>)}{apiaryId && !availableHives.length && <p>No active hives at this apiary.</p>}</fieldset>
        <label className="bk-field-label">Notes (optional)<textarea className="bk-form-input" value={notes} onChange={event => setNotes(event.target.value)} /></label>
        <div className="bk-step-actions"><button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button><button className="btn btn-primary" type="submit">Create batch</button></div>
      </div>
    </form>
  </div>;
};
