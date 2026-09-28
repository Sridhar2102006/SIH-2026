/**
 * SCREEN — LABORATORY SAMPLES WORKSPACE
 *
 * Dedicated Canonical Destination for Lab Intake & Sample Custody
 * Route: /samples
 *
 * Primary Purpose: Receive honey samples, verify tamper seals, inspect condition,
 * accept or reject intake, maintain chain of custody, and assign analytical protocols.
 */

import React, { useState } from 'react';
import { useAppState } from '../../context/AppStateContext';
import {
  FlaskConical,
  ShieldCheck,
  Search,
  Filter,
  Plus,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  Tag,
  ChevronRight,
  X,
  FileText,
  AlertCircle,
  Lock,
  Layers
} from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';
import {
  SAMPLE_STATUS_LABELS,
  SAMPLE_REJECTION_REASONS,
  SAMPLE_HOLD_REASONS
} from '../../services/labDomainService';
import { SampleDetailModal } from './SampleDetailModal';
import { LabReportModal } from './LabReportModal';

export const SamplesView = () => {
  const {
    labSamples,
    labTests,
    processingBatches,
    receiveSampleIntake,
    acceptSampleIntake,
    rejectSampleIntake,
    putSampleOnHold,
    showToast,
    session
  } = useAppState();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL'); // 'ALL' | 'AWAITING_INTAKE' | 'ACCEPTED' | 'IN_TESTING' | 'AWAITING_REVIEW' | 'ON_HOLD' | 'COMPLETED'
  const [selectedSample, setSelectedSample] = useState(null);
  const [activeReportSample, setActiveReportSample] = useState(null);

  // Modals
  const [isIntakeModalOpen, setIsIntakeModalOpen] = useState(false);
  const [isAcceptModalOpen, setIsAcceptModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isHoldModalOpen, setIsHoldModalOpen] = useState(false);
  const [targetSampleForAction, setTargetSampleForAction] = useState(null);

  // Form States for Intake
  const [intakeBatchNumber, setIntakeBatchNumber] = useState('PB-2026-00041');
  const [intakeQtyMl, setIntakeQtyMl] = useState(250);
  const [intakeCondition, setIntakeCondition] = useState('Intact glass container, ambient 22°C');
  const [intakeContainerType, setIntakeContainerType] = useState('Food-Grade Amber Glass Jar (250 mL)');
  const [intakeSeal, setIntakeSeal] = useState('Tamper-Evident Hologram Seal Intact');
  const [intakeStorage, setIntakeStorage] = useState('Specimen Cabinet B · Shelf 02');
  const [intakeRemarks, setIntakeRemarks] = useState('');

  // Form States for Accept / Reject / Hold
  const [acceptStorage, setAcceptStorage] = useState('Specimen Cabinet A · Shelf 01');
  const [acceptRemarks, setAcceptRemarks] = useState('');
  const [rejectionReason, setRejectionReason] = useState('CONTAINER_DAMAGED');
  const [rejectionRemarks, setRejectionRemarks] = useState('');
  const [holdReason, setHoldReason] = useState('SUSPECTED_TAMPERING');
  const [holdRemarks, setHoldRemarks] = useState('');

  // Filtered samples
  const filteredSamples = labSamples.filter(s => {
    if (filterStatus !== 'ALL') {
      if (filterStatus === 'AWAITING_INTAKE' && s.intakeStatus !== 'AWAITING_INTAKE') return false;
      if (filterStatus === 'ACCEPTED' && s.intakeStatus !== 'ACCEPTED') return false;
      if (filterStatus === 'IN_TESTING' && s.intakeStatus !== 'IN_TESTING' && s.intakeStatus !== 'TEST_ASSIGNED') return false;
      if (filterStatus === 'AWAITING_REVIEW' && s.intakeStatus !== 'AWAITING_REVIEW') return false;
      if (filterStatus === 'ON_HOLD' && s.intakeStatus !== 'ON_HOLD') return false;
      if (filterStatus === 'COMPLETED' && s.intakeStatus !== 'COMPLETED') return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = (s.id || '').toLowerCase().includes(q);
      const matchBatch = (s.sourceBatchNumber || '').toLowerCase().includes(q);
      const matchTrace = (s.sourceTraceabilityCodes || []).some(c => (c || '').toLowerCase().includes(q));
      return matchId || matchBatch || matchTrace;
    }
    return true;
  });

  const handleIntakeSubmit = (e) => {
    e.preventDefault();
    const res = receiveSampleIntake({
      sourceBatchNumber: intakeBatchNumber,
      sourceTraceabilityCodes: ['AP1H001F1'],
      sampleCondition: intakeCondition,
      quantityMl: intakeQtyMl,
      containerType: intakeContainerType,
      sealCondition: intakeSeal,
      storageLocation: intakeStorage,
      remarks: intakeRemarks,
      receivedBy: session?.operator || 'Elena Vance'
    });

    if (res.success) {
      setIsIntakeModalOpen(false);
      setIntakeRemarks('');
    } else if (res.errors) {
      showToast(res.errors[0]);
    }
  };

  const handleAcceptSubmit = (e) => {
    e.preventDefault();
    if (!targetSampleForAction) return;
    const res = acceptSampleIntake({
      sampleId: targetSampleForAction.id,
      verifiedStorageLocation: acceptStorage,
      operator: session?.operator || 'Elena Vance',
      remarks: acceptRemarks
    });
    if (res.success) {
      setIsAcceptModalOpen(false);
      setTargetSampleForAction(null);
    }
  };

  const handleRejectSubmit = (e) => {
    e.preventDefault();
    if (!targetSampleForAction) return;
    const res = rejectSampleIntake({
      sampleId: targetSampleForAction.id,
      reason: rejectionReason,
      remarks: rejectionRemarks,
      operator: session?.operator || 'Elena Vance'
    });
    if (res.success) {
      setIsRejectModalOpen(false);
      setTargetSampleForAction(null);
    } else if (res.errors) {
      showToast(res.errors[0]);
    }
  };

  const handleHoldSubmit = (e) => {
    e.preventDefault();
    if (!targetSampleForAction) return;
    const res = putSampleOnHold({
      sampleId: targetSampleForAction.id,
      reason: holdReason,
      remarks: holdRemarks,
      operator: session?.operator || 'Elena Vance'
    });
    if (res.success) {
      setIsHoldModalOpen(false);
      setTargetSampleForAction(null);
    } else if (res.errors) {
      showToast(res.errors[0]);
    }
  };

  return (
    <div className="samples-view-container" style={{ padding: '16px 20px', maxWidth: '1000px', margin: '0 auto' }}>
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
                Sample Custody & Verification
              </span>
              <span style={{ fontSize: '12px', color: '#16A34A', fontWeight: 600 }}>
                Chain of Custody Active
              </span>
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#172033', margin: '8px 0 4px', letterSpacing: '-0.015em' }}>
              Laboratory Sample Intake & Custody Queue
            </h2>
            <p style={{ fontSize: '13.5px', color: '#64748B', margin: 0 }}>
              Inspect incoming honey vials from extraction bays, verify tamper seals, and enforce chain of custody.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setIsIntakeModalOpen(true)}
              style={{ backgroundColor: '#2563EB', borderColor: '#2563EB', fontSize: '13px' }}
            >
              <Plus size={15} style={{ marginRight: '6px' }} />
              <span>Intake New Sample</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Search & Filter Bar */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '11px', color: '#94A3B8' }} />
          <input
            type="text"
            placeholder="Search Sample ID, Batch Number, or Trace Code..."
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
            { id: 'ALL', label: `All (${labSamples.length})` },
            { id: 'AWAITING_INTAKE', label: `Awaiting (${labSamples.filter(s => s.intakeStatus === 'AWAITING_INTAKE').length})` },
            { id: 'ACCEPTED', label: `Accepted (${labSamples.filter(s => s.intakeStatus === 'ACCEPTED').length})` },
            { id: 'IN_TESTING', label: `Testing (${labSamples.filter(s => s.intakeStatus === 'IN_TESTING' || s.intakeStatus === 'TEST_ASSIGNED').length})` },
            { id: 'AWAITING_REVIEW', label: `Review (${labSamples.filter(s => s.intakeStatus === 'AWAITING_REVIEW').length})` },
            { id: 'ON_HOLD', label: `On Hold (${labSamples.filter(s => s.intakeStatus === 'ON_HOLD').length})` },
            { id: 'COMPLETED', label: `Completed (${labSamples.filter(s => s.intakeStatus === 'COMPLETED').length})` }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: filterStatus === tab.id ? 700 : 500,
                border: '1px solid',
                borderColor: filterStatus === tab.id ? '#2563EB' : '#E2E8F0',
                backgroundColor: filterStatus === tab.id ? '#2563EB' : '#FFFFFF',
                color: filterStatus === tab.id ? '#FFFFFF' : '#475569',
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

      {/* 3. Samples List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filteredSamples.length === 0 ? (
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
            <FlaskConical size={36} color="#94A3B8" style={{ margin: '0 auto 12px' }} />
            <h4 style={{ margin: '0 0 6px', fontSize: '15px', fontWeight: 600, color: '#34261B' }}>
              No samples match your current filter
            </h4>
            <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>
              Incoming samples submitted by processing will appear here for intake and verification.
            </p>
          </div>
        ) : (
          filteredSamples.map(sample => {
            const tests = labTests.filter(t => t.sampleId === sample.id);
            const completedCount = tests.filter(t => t.status === 'COMPLETED').length;

            return (
              <div
                key={sample.id}
                style={{
                  padding: '16px',
                  borderRadius: '12px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}
              >
                {/* Header row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        backgroundColor: '#EFF6FF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#2563EB',
                        border: '1px solid #BFDBFE'
                      }}
                    >
                      <FlaskConical size={20} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <strong
                          onClick={() => setSelectedSample(sample)}
                          style={{ fontSize: '15px', color: '#172033', cursor: 'pointer', textDecoration: 'underline' }}
                        >
                          {sample.id}
                        </strong>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            padding: '2px 7px',
                            borderRadius: '4px',
                            backgroundColor: sample.intakeStatus === 'COMPLETED' ? '#F0FDF4' : sample.intakeStatus === 'ON_HOLD' ? '#FEF2F2' : '#EFF6FF',
                            color: sample.intakeStatus === 'COMPLETED' ? '#16A34A' : sample.intakeStatus === 'ON_HOLD' ? '#DC2626' : '#2563EB',
                            border: `1px solid ${sample.intakeStatus === 'COMPLETED' ? '#BBF7D0' : sample.intakeStatus === 'ON_HOLD' ? '#FECACA' : '#BFDBFE'}`
                          }}
                        >
                          {SAMPLE_STATUS_LABELS[sample.intakeStatus] || sample.intakeStatus}
                        </span>
                      </div>
                      <div style={{ fontSize: '12.5px', color: '#64748B', marginTop: '2px' }}>
                        Source Batch: <strong style={{ color: '#2563EB' }}>{sample.sourceBatchNumber}</strong> · Lineage: {(sample.sourceTraceabilityCodes || []).join(', ') || 'Direct'}
                      </div>
                    </div>
                  </div>

                  {/* Actions for this sample */}
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {sample.intakeStatus === 'AWAITING_INTAKE' && (
                      <>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => {
                            setTargetSampleForAction(sample);
                            setIsAcceptModalOpen(true);
                          }}
                          style={{ fontSize: '12px', padding: '5px 10px', backgroundColor: '#16A34A', borderColor: '#16A34A' }}
                        >
                          <CheckCircle2 size={13} style={{ marginRight: '4px' }} />
                          <span>Accept</span>
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => {
                            setTargetSampleForAction(sample);
                            setIsRejectModalOpen(true);
                          }}
                          style={{ fontSize: '12px', padding: '5px 10px', borderColor: '#FECACA', color: '#DC2626' }}
                        >
                          <X size={13} style={{ marginRight: '4px' }} />
                          <span>Reject</span>
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => {
                            setTargetSampleForAction(sample);
                            setIsHoldModalOpen(true);
                          }}
                          style={{ fontSize: '12px', padding: '5px 10px', borderColor: '#FED7AA', color: '#D97706' }}
                        >
                          <AlertTriangle size={13} style={{ marginRight: '4px' }} />
                          <span>Hold</span>
                        </button>
                      </>
                    )}

                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => setSelectedSample(sample)}
                      style={{ fontSize: '12px', padding: '5px 10px' }}
                    >
                      <span>Details & Lineage</span>
                    </button>
                  </div>
                </div>

                {/* Metadata Row */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                    gap: '8px',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    backgroundColor: '#F8FAFC',
                    fontSize: '12px',
                    border: '1px solid #F1F5F9'
                  }}
                >
                  <div>
                    <span style={{ color: '#64748B' }}>Volume:</span> <strong>{sample.quantityMl} mL</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748B' }}>Seal:</span> <strong style={{ color: '#2E7D32' }}>{sample.sealCondition}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748B' }}>Storage:</span> <strong>{sample.storageLocation}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748B' }}>Assays:</span> <strong>{tests.length > 0 ? `${completedCount}/${tests.length} Done` : 'None assigned'}</strong>
                  </div>
                </div>

                {sample.remarks && (
                  <div style={{ fontSize: '12px', color: '#475569', fontStyle: 'italic' }}>
                    Remarks: {sample.remarks}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* MODAL 1: INTAKE NEW SAMPLE */}
      {isIntakeModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsIntakeModalOpen(false)} style={{ zIndex: 1200 }}>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: '#34261B' }}>
                Receive & Intake Sample
              </h3>
              <button
                onClick={() => setIsIntakeModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleIntakeSubmit}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Source Processing Batch
                </label>
                <input
                  type="text"
                  value={intakeBatchNumber}
                  onChange={(e) => setIntakeBatchNumber(e.target.value)}
                  placeholder="PB-2026-XXXXX"
                  required
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                    Sample Volume (mL)
                  </label>
                  <input
                    type="number"
                    value={intakeQtyMl}
                    onChange={(e) => setIntakeQtyMl(e.target.value)}
                    min={50}
                    max={5000}
                    required
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                    Storage Shelf / Cabinet
                  </label>
                  <input
                    type="text"
                    value={intakeStorage}
                    onChange={(e) => setIntakeStorage(e.target.value)}
                    required
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Container Condition & Temperature
                </label>
                <input
                  type="text"
                  value={intakeCondition}
                  onChange={(e) => setIntakeCondition(e.target.value)}
                  placeholder="e.g. Sealed glass container, ambient 22°C"
                  required
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Tamper Custody Seal Status
                </label>
                <input
                  type="text"
                  value={intakeSeal}
                  onChange={(e) => setIntakeSeal(e.target.value)}
                  required
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Intake Remarks (Optional)
                </label>
                <textarea
                  value={intakeRemarks}
                  onChange={(e) => setIntakeRemarks(e.target.value)}
                  placeholder="Any delivery or visual notes..."
                  rows={2}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setIsIntakeModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  style={{ backgroundColor: '#2563EB', borderColor: '#2563EB' }}
                >
                  Confirm Intake
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ACCEPT SAMPLE */}
      {isAcceptModalOpen && targetSampleForAction && (
        <div className="modal-backdrop" onClick={() => setIsAcceptModalOpen(false)} style={{ zIndex: 1200 }}>
          <div
            className="modal-card"
            onClick={e => e.stopPropagation()}
            style={{
              maxWidth: '460px',
              width: '90%',
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              padding: '24px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#34261B' }}>
                Accept Sample into Custody: {targetSampleForAction.id}
              </h3>
              <button
                onClick={() => setIsAcceptModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAcceptSubmit}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Confirm Specimen Cabinet Location
                </label>
                <input
                  type="text"
                  value={acceptStorage}
                  onChange={(e) => setAcceptStorage(e.target.value)}
                  required
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Verification Remarks
                </label>
                <textarea
                  value={acceptRemarks}
                  onChange={(e) => setAcceptRemarks(e.target.value)}
                  placeholder="Confirming seal intact, volume verified, temperature equilibrated..."
                  rows={2}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setIsAcceptModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  style={{ backgroundColor: '#2E7D32', borderColor: '#2E7D32' }}
                >
                  Accept into Custody
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: REJECT SAMPLE (MANDATORY REASON + REMARKS) */}
      {isRejectModalOpen && targetSampleForAction && (
        <div className="modal-backdrop" onClick={() => setIsRejectModalOpen(false)} style={{ zIndex: 1200 }}>
          <div
            className="modal-card"
            onClick={e => e.stopPropagation()}
            style={{
              maxWidth: '480px',
              width: '90%',
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              padding: '24px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#B91C1C' }}>
                Reject Sample Intake: {targetSampleForAction.id}
              </h3>
              <button
                onClick={() => setIsRejectModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '12.5px', color: '#64748B', margin: '0 0 12px' }}>
              Laboratory protocol requires explicit deviation documentation. Never silently reject incoming test material.
            </p>

            <form onSubmit={handleRejectSubmit}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Rejection Reason Code (Mandatory)
                </label>
                <select
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }}
                >
                  {SAMPLE_REJECTION_REASONS.map(r => (
                    <option key={r.id} value={r.id}>{r.label}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Detailed Rejection Explanation (Min 5 chars)
                </label>
                <textarea
                  value={rejectionRemarks}
                  onChange={(e) => setRejectionRemarks(e.target.value)}
                  placeholder="Specify evidence of container damage, volume shortfall or seal tampering..."
                  rows={3}
                  required
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setIsRejectModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  style={{ backgroundColor: '#B91C1C', borderColor: '#B91C1C' }}
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: PLACE ON HOLD */}
      {isHoldModalOpen && targetSampleForAction && (
        <div className="modal-backdrop" onClick={() => setIsHoldModalOpen(false)} style={{ zIndex: 1200 }}>
          <div
            className="modal-card"
            onClick={e => e.stopPropagation()}
            style={{
              maxWidth: '480px',
              width: '90%',
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              padding: '24px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#D97706' }}>
                Place Sample on Hold: {targetSampleForAction.id}
              </h3>
              <button
                onClick={() => setIsHoldModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleHoldSubmit}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Hold / Quarantine Reason
                </label>
                <select
                  value={holdReason}
                  onChange={(e) => setHoldReason(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }}
                >
                  {SAMPLE_HOLD_REASONS.map(r => (
                    <option key={r.id} value={r.id}>{r.label}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Hold Remarks & Action Items (Min 5 chars)
                </label>
                <textarea
                  value={holdRemarks}
                  onChange={(e) => setHoldRemarks(e.target.value)}
                  placeholder="Reason for holding sample pending verification..."
                  rows={3}
                  required
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setIsHoldModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  style={{ backgroundColor: '#D97706', borderColor: '#D97706' }}
                >
                  Place on Quarantine Hold
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail & Report Modals */}
      {selectedSample && (
        <SampleDetailModal
          sampleId={selectedSample.id}
          isOpen={true}
          onClose={() => setSelectedSample(null)}
          onOpenReport={(s) => setActiveReportSample(s)}
        />
      )}

      {activeReportSample && (
        <LabReportModal
          sample={activeReportSample}
          isOpen={true}
          onClose={() => setActiveReportSample(null)}
        />
      )}
    </div>
  );
};
