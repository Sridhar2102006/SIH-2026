/**
 * SCREEN — LABORATORY TESTING WORKSPACE
 *
 * Dedicated Canonical Destination for Lab Assay Execution
 * Route: /tests
 *
 * Primary Purpose: Execute analytical tests (moisture, HMF, diastase, conductivity, pollen spectrum),
 * record calibrated instrument readings, validate physical ranges, attach evidence, and complete tests.
 */

import React, { useState } from 'react';
import { useAppState } from '../../context/AppStateContext';
import {
  TestTube,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ChevronRight,
  Plus,
  Activity,
  FileText,
  Sliders,
  Play,
  Camera,
  X,
  ShieldCheck,
  AlertCircle,
  Search,
  Send
} from 'lucide-react';
import {
  LAB_TEST_CATALOG,
  LAB_EQUIPMENT_CATALOG,
  SAMPLE_STATUS_LABELS,
  TEST_STATUSES,
  TEST_STATUS_LABELS,
  TEST_PRIORITIES,
  TEST_PRIORITY_LABELS
} from '../../services/labDomainService';

export const TestsView = () => {
  const {
    labTests,
    labSamples,
    assignLabTest,
    startLabTest,
    recordTestMeasurement,
    sendLabReportToProcessorAndDispatch,
    showToast,
    session
  } = useAppState();

  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'RETEST_REQUIRED'
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [targetTestForRecord, setTargetTestForRecord] = useState(null);

  // Assign Form States
  const [assignSampleId, setAssignSampleId] = useState('');
  const [assignTestKey, setAssignTestKey] = useState('MOISTURE');
  const [assignPriority, setAssignPriority] = useState('ROUTINE');
  const [assignAnalyst, setAssignAnalyst] = useState(session?.operator || 'Elena Vance');
  const [assignEquipment, setAssignEquipment] = useState('EQ-REFR-01');

  // Record Measurement Form States
  const [recordRawValue, setRecordRawValue] = useState('');
  const [recordCalculatedValue, setRecordCalculatedValue] = useState('');
  const [recordEquipmentId, setRecordEquipmentId] = useState('');
  const [recordEvidenceType, setRecordEvidenceType] = useState('INSTRUMENT_READING');
  const [recordRemarks, setRecordRemarks] = useState('');
  const [validationError, setValidationError] = useState(null);

  // Filtered tests
  const filteredTests = labTests.filter(t => {
    if (activeTab !== 'ALL') {
      if (t.status !== activeTab) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchSample = t.sampleId.toLowerCase().includes(q);
      const matchName = t.testName.toLowerCase().includes(q);
      const matchKey = t.testKey.toLowerCase().includes(q);
      return matchSample || matchName || matchKey;
    }
    return true;
  });

  const handleAssignSubmit = (e) => {
    e.preventDefault();
    const targetSample = assignSampleId || (labSamples[0]?.id);
    if (!targetSample) {
      showToast('No active sample available for assignment');
      return;
    }

    const res = assignLabTest({
      sampleId: targetSample,
      testKey: assignTestKey,
      priority: assignPriority,
      assignedAnalyst: assignAnalyst,
      equipmentId: assignEquipment
    });

    if (res.success) {
      setIsAssignModalOpen(false);
    } else if (res.errors) {
      showToast(res.errors[0]);
    }
  };

  const openRecordModal = (test) => {
    setTargetTestForRecord(test);
    setRecordRawValue(test.rawMeasurement !== null ? String(test.rawMeasurement) : '');
    setRecordCalculatedValue(test.result !== null ? String(test.result) : '');
    setRecordEquipmentId(test.equipmentId || '');
    setRecordRemarks(test.remarks || '');
    setValidationError(null);
    setIsRecordModalOpen(true);
  };

  const handleRecordSubmit = (e) => {
    e.preventDefault();
    if (!targetTestForRecord) return;

    const testDef = LAB_TEST_CATALOG[targetTestForRecord.testKey];
    const num = Number(recordRawValue);
    if (isNaN(num)) {
      setValidationError('Please enter a valid numeric measurement.');
      return;
    }
    if (num < testDef.minAllowedInput || num > testDef.maxAllowedInput) {
      setValidationError(
        `This value is outside the configured physical boundary (${testDef.minAllowedInput} – ${testDef.maxAllowedInput} ${testDef.unit}).`
      );
      return;
    }

    const res = recordTestMeasurement({
      testId: targetTestForRecord.id,
      rawMeasurement: num,
      calculatedResult: recordCalculatedValue !== '' ? Number(recordCalculatedValue) : num,
      equipmentId: recordEquipmentId,
      evidenceType: recordEvidenceType,
      remarks: recordRemarks,
      operator: session?.operator || 'Elena Vance'
    });

    if (res.success) {
      setIsRecordModalOpen(false);
      setTargetTestForRecord(null);
    } else if (res.errors) {
      setValidationError(res.errors[0]);
    }
  };

  return (
    <div className="tests-view-container" style={{ padding: '16px 20px', maxWidth: '1000px', margin: '0 auto' }}>
      {/* 1. Header Banner */}
      <div
        className="card"
        style={{
          padding: '20px 24px',
          backgroundColor: '#FFFFFF',
          borderRadius: '14px',
          border: '1px solid #E2E8F0',
          marginBottom: '20px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  backgroundColor: '#EFF6FF',
                  color: '#2563EB',
                  border: '1px solid #BFDBFE'
                }}
              >
                Analytical Chemistry & Microscopy
              </span>
              <span style={{ fontSize: '12px', color: '#16A34A', fontWeight: 600 }}>
                AOAC / ISO / Codex Methods
              </span>
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#172033', margin: '8px 0 4px', letterSpacing: '-0.015em' }}>
              Laboratory Assay & Analytical Testing
            </h2>
            <p style={{ fontSize: '13.5px', color: '#64748B', margin: 0 }}>
              Execute analytical testing protocols, log raw spectrometer & refractometer values, and attach instrument proof.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => {
                if (labSamples.length > 0) {
                  setAssignSampleId(labSamples[0].id);
                }
                setIsAssignModalOpen(true);
              }}
              style={{ backgroundColor: '#2563EB', borderColor: '#2563EB', fontSize: '13px' }}
            >
              <Plus size={15} style={{ marginRight: '6px' }} />
              <span>Assign New Assay</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Filter Tabs & Search */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '11px', color: '#94A3B8' }} />
          <input
            type="text"
            placeholder="Search sample, assay name or method..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '9px 12px 9px 36px',
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
              fontSize: '13px',
              color: '#172033',
              boxSizing: 'border-box',
              backgroundColor: '#FFFFFF'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
          {[
            { id: 'ALL', label: `All Assays (${labTests.length})` },
            { id: TEST_STATUSES.ASSIGNED, label: `Assigned (${labTests.filter(t => t.status === TEST_STATUSES.ASSIGNED).length})` },
            { id: TEST_STATUSES.IN_PROGRESS, label: `In Testing (${labTests.filter(t => t.status === TEST_STATUSES.IN_PROGRESS).length})` },
            { id: TEST_STATUSES.COMPLETED, label: `Completed (${labTests.filter(t => t.status === TEST_STATUSES.COMPLETED).length})` },
            { id: TEST_STATUSES.RETEST_REQUIRED, label: `Retests (${labTests.filter(t => t.status === TEST_STATUSES.RETEST_REQUIRED).length})` }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: activeTab === tab.id ? 700 : 500,
                border: '1px solid',
                borderColor: activeTab === tab.id ? '#2563EB' : '#E2E8F0',
                backgroundColor: activeTab === tab.id ? '#2563EB' : '#FFFFFF',
                color: activeTab === tab.id ? '#FFFFFF' : '#475569',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Assays List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filteredTests.length === 0 ? (
          <div
            className="card"
            style={{
              padding: '40px 20px',
              textAlign: 'center',
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              border: '1px dashed #CBD5E1'
            }}
          >
            <TestTube size={36} color="#94A3B8" style={{ margin: '0 auto 12px' }} />
            <h4 style={{ margin: '0 0 6px', fontSize: '15px', fontWeight: 600, color: '#34261B' }}>
              No laboratory assays in this queue
            </h4>
            <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>
              Select an accepted sample to assign analytical protocols.
            </p>
          </div>
        ) : (
          filteredTests.map(test => {
            const isCompleted = test.status === TEST_STATUSES.COMPLETED;
            const isInProgress = test.status === TEST_STATUSES.IN_PROGRESS;
            const isAssigned = test.status === TEST_STATUSES.ASSIGNED;
            const isRetest = test.status === TEST_STATUSES.RETEST_REQUIRED;

            return (
              <div
                key={test.id}
                style={{
                  padding: '16px',
                  borderRadius: '12px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}
              >
                {/* Header Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '10px',
                        backgroundColor: '#EFF6FF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#2563EB',
                        border: '1px solid #BFDBFE'
                      }}
                    >
                      <TestTube size={18} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <strong style={{ fontSize: '14.5px', color: '#172033' }}>
                          {test.testName}
                        </strong>
                        <span
                          style={{
                            fontSize: '10.5px',
                            fontWeight: 700,
                            padding: '2px 6px',
                            borderRadius: '4px',
                            backgroundColor: test.priority === 'URGENT' ? '#FEF2F2' : '#F1F5F9',
                            color: test.priority === 'URGENT' ? '#DC2626' : '#64748B'
                          }}
                        >
                          {test.priority}
                        </span>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            padding: '2px 6px',
                            borderRadius: '4px',
                            backgroundColor: isCompleted ? '#F0FDF4' : isRetest ? '#FEF2F2' : '#EFF6FF',
                            color: isCompleted ? '#16A34A' : isRetest ? '#DC2626' : '#2563EB',
                            border: `1px solid ${isCompleted ? '#BBF7D0' : isRetest ? '#FECACA' : '#BFDBFE'}`
                          }}
                        >
                          {TEST_STATUS_LABELS[test.status] || test.status}
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span>Sample: <strong style={{ color: '#172033' }}>{test.sampleId}</strong> · Method: {test.method}</span>
                        {(() => {
                          const parentSample = labSamples.find(s => s.id === test.sampleId);
                          if (parentSample?.coaDocumentId) {
                            return (
                              <span
                                style={{
                                  fontSize: '11px',
                                  fontWeight: 600,
                                  color: '#059669',
                                  backgroundColor: '#ECFDF5',
                                  padding: '1px 6px',
                                  borderRadius: '4px',
                                  border: '1px solid #A7F3D0',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '3px'
                                }}
                              >
                                <ShieldCheck size={12} />
                                CoA Sent ({parentSample.coaDocumentId})
                              </span>
                            );
                          }
                          return null;
                        })()}
                      </div>
                    </div>
                  </div>

                  {/* Right Action buttons */}
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                    {isAssigned && (
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => startLabTest({ testId: test.id, operator: session?.operator })}
                        style={{ fontSize: '12px', padding: '5px 10px', backgroundColor: '#2563EB', borderColor: '#2563EB' }}
                      >
                        <Play size={13} style={{ marginRight: '4px' }} />
                        <span>Start Assay</span>
                      </button>
                    )}

                    {isInProgress && (
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => openRecordModal(test)}
                        style={{ fontSize: '12px', padding: '5px 10px', backgroundColor: '#16A34A', borderColor: '#16A34A' }}
                      >
                        <Sliders size={13} style={{ marginRight: '4px' }} />
                        <span>Record Result</span>
                      </button>
                    )}

                    {isCompleted && (
                      <>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => openRecordModal(test)}
                          style={{ fontSize: '12px', padding: '5px 10px' }}
                        >
                          <span>Edit / View Finding</span>
                        </button>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => {
                            if (sendLabReportToProcessorAndDispatch) {
                              sendLabReportToProcessorAndDispatch({
                                sampleId: test.sampleId,
                                notes: `Assay completed: ${test.testName} (${test.result} ${test.unit}). Official Lab Report transmitted to Processor and Dispatch Unit.`
                              });
                            }
                          }}
                          style={{
                            fontSize: '12px',
                            padding: '5px 10px',
                            backgroundColor: '#059669',
                            borderColor: '#059669',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                          title="Transmit official lab report and CoA to both Processor & Dispatch Unit"
                        >
                          <Send size={12} />
                          <span>Send Report to Processor & Dispatch</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Findings & Measurement Row */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                    gap: '10px',
                    padding: '10px 14px',
                    backgroundColor: '#F8FAFC',
                    borderRadius: '8px',
                    fontSize: '12.5px',
                    border: '1px solid #F1F5F9'
                  }}
                >
                  <div>
                    <span style={{ color: '#64748B' }}>Result Value:</span>{' '}
                    {test.result !== null ? (
                      <strong style={{ color: test.isWithinSpecification ? '#2E7D32' : '#B91C1C', fontSize: '13.5px' }}>
                        {test.result} {test.unit}
                      </strong>
                    ) : (
                      <span style={{ color: '#94A3B8', fontStyle: 'italic' }}>Pending Measurement</span>
                    )}
                  </div>
                  <div>
                    <span style={{ color: '#64748B' }}>Raw Reading:</span>{' '}
                    <strong>{test.rawMeasurement !== null ? `${test.rawMeasurement} ${test.unit}` : 'None'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748B' }}>Standard Spec:</span>{' '}
                    <strong style={{ color: '#34261B' }}>{test.referenceStandard}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748B' }}>Instrument:</span>{' '}
                    <span>{test.equipmentName || 'Calibrated Bench'}</span>
                  </div>
                </div>

                {test.remarks && (
                  <div style={{ fontSize: '12px', color: '#475569', fontStyle: 'italic' }}>
                    Observations: {test.remarks}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* MODAL 1: ASSIGN NEW TEST */}
      {isAssignModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsAssignModalOpen(false)} style={{ zIndex: 1200 }}>
          <div
            className="modal-card"
            onClick={e => e.stopPropagation()}
            style={{
              maxWidth: '520px',
              width: '90%',
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              padding: '24px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: '#34261B' }}>
                Assign Laboratory Assay Protocol
              </h3>
              <button
                onClick={() => setIsAssignModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAssignSubmit}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Target Honey Sample
                </label>
                <select
                  value={assignSampleId}
                  onChange={(e) => setAssignSampleId(e.target.value)}
                  required
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }}
                >
                  {labSamples.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.id} · Batch {s.sourceBatchNumber || 'N/A'} ({SAMPLE_STATUS_LABELS?.[s.intakeStatus] || s.intakeStatus || 'Pending'})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Test Protocol & Parameter
                </label>
                <select
                  value={assignTestKey}
                  onChange={(e) => {
                    setAssignTestKey(e.target.value);
                    const def = LAB_TEST_CATALOG[e.target.value];
                    if (def?.recommendedEquipment) {
                      setAssignEquipment(def.recommendedEquipment);
                    }
                  }}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }}
                >
                  {Object.values(LAB_TEST_CATALOG).map(t => (
                    <option key={t.key} value={t.key}>
                      {t.name} ({t.unit}) — {t.referenceLimitText}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                    Priority
                  </label>
                  <select
                    value={assignPriority}
                    onChange={(e) => setAssignPriority(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }}
                  >
                    {Object.values(TEST_PRIORITIES).map(p => (
                      <option key={p} value={p}>{TEST_PRIORITY_LABELS[p]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                    Assigned Analyst
                  </label>
                  <input
                    type="text"
                    value={assignAnalyst}
                    onChange={(e) => setAssignAnalyst(e.target.value)}
                    required
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Laboratory Instrument
                </label>
                <select
                  value={assignEquipment}
                  onChange={(e) => setAssignEquipment(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }}
                >
                  {LAB_EQUIPMENT_CATALOG.map(eq => (
                    <option key={eq.id} value={eq.id}>
                      {eq.name} ({eq.status})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setIsAssignModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  style={{ backgroundColor: '#2563EB', borderColor: '#2563EB' }}
                >
                  Assign Assay
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: RECORD TEST RESULT */}
      {isRecordModalOpen && targetTestForRecord && (
        <div className="modal-backdrop" onClick={() => setIsRecordModalOpen(false)} style={{ zIndex: 1200 }}>
          <div
            className="modal-card"
            onClick={e => e.stopPropagation()}
            style={{
              maxWidth: '540px',
              width: '90%',
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              padding: '24px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '16.5px', fontWeight: 700, color: '#34261B' }}>
                  Record Result: {targetTestForRecord.testName}
                </h3>
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748B' }}>
                  Sample: {targetTestForRecord.sampleId} · Unit: <strong>{targetTestForRecord.unit}</strong>
                </p>
              </div>
              <button
                onClick={() => setIsRecordModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Reference Specification Badge */}
            <div
              style={{
                padding: '10px 14px',
                backgroundColor: '#FFF9EF',
                border: '1px solid #F1E5D1',
                borderRadius: '8px',
                marginBottom: '14px',
                fontSize: '12px',
                color: '#8C7A6B'
              }}
            >
              Standard specification: <strong style={{ color: '#34261B' }}>{targetTestForRecord.referenceStandard}</strong>
            </div>

            {validationError && (
              <div
                style={{
                  padding: '10px 14px',
                  backgroundColor: '#FEF2F2',
                  border: '1px solid #FECACA',
                  borderRadius: '8px',
                  marginBottom: '14px',
                  fontSize: '12.5px',
                  color: '#B91C1C',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <AlertCircle size={16} />
                <span>{validationError}</span>
              </div>
            )}

            <form onSubmit={handleRecordSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                    Raw Measurement ({targetTestForRecord.unit})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={recordRawValue}
                    onChange={(e) => {
                      setRecordRawValue(e.target.value);
                      if (recordCalculatedValue === '' || recordCalculatedValue === recordRawValue) {
                        setRecordCalculatedValue(e.target.value);
                      }
                      setValidationError(null);
                    }}
                    placeholder={`e.g. 17.5`}
                    required
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                    Calculated Result ({targetTestForRecord.unit})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={recordCalculatedValue}
                    onChange={(e) => setRecordCalculatedValue(e.target.value)}
                    placeholder={`Final interpreted value`}
                    required
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Calibrated Instrument Used
                </label>
                <select
                  value={recordEquipmentId}
                  onChange={(e) => setRecordEquipmentId(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }}
                >
                  <option value="">Select laboratory instrument...</option>
                  {LAB_EQUIPMENT_CATALOG.map(eq => (
                    <option key={eq.id} value={eq.id}>
                      {eq.name} (Cal: {eq.lastCalibrationDate})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Evidence Attachment
                </label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button
                    type="button"
                    onClick={() => showToast('Evidence image captured from laboratory instrument')}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '12px', padding: '6px 12px' }}
                  >
                    <Camera size={14} style={{ marginRight: '6px' }} />
                    <span>Attach Instrument Reading Photo</span>
                  </button>
                  <span style={{ fontSize: '11.5px', color: '#2E7D32', fontWeight: 600 }}>
                    ✓ reading_capture.png
                  </span>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Assay Observations / Remarks
                </label>
                <textarea
                  value={recordRemarks}
                  onChange={(e) => setRecordRemarks(e.target.value)}
                  placeholder="Notes on sharp boundary, sample equilibration, incubation timing..."
                  rows={2}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setIsRecordModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  style={{ backgroundColor: '#16A34A', borderColor: '#16A34A' }}
                >
                  Save & Complete Test
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
