import React, { useState, useRef, useEffect } from 'react';
import { useAppState } from '../../context/AppStateContext';
import {
  ArrowLeft,
  MoreVertical,
  ClipboardCheck,
  Camera,
  MessageSquarePlus,
  Image as ImageIcon,
  Info,
  ArrowRight,
  Thermometer,
  Droplets,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Clock,
  MapPin,
  Tag,
  ChevronRight,
  Shield,
  Edit2,
  Archive,
  Trash2,
  Settings
} from 'lucide-react';
import { HiveTechnicalSheet } from './HiveTechnicalSheet';
import { HiveTechnicalDetails } from './HiveTechnicalDetails';
import { RecordObservationModal } from './RecordObservationModal';

export const HiveDetail = ({ hiveId, onBack }) => {
  const {
    hives,
    batches,
    openSheet,
    archiveHive,
    deleteHive,
    openScanModal,
    openInspectionResult,
    setSelectedBatchId,
    setActiveTab,
    showToast
  } = useAppState();

  const hive = hives.find(h => h.id === hiveId) || hives[0];

  const [isTechSheetOpen, setIsTechSheetOpen] = useState(false);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  const [isRecordObsOpen, setIsRecordObsOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const historyRef = useRef(null);

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  if (!hive) return null;

  const isHealthy = hive.status === 'healthy';
  const isAttention = hive.status === 'attention';
  const isMonitoringUnavailable = hive.status === 'monitoring_unavailable' || (hive.monitoring && !hive.monitoring.isDeviceOnline);

  // Linked honey batches for traceability
  const linkedBatches = (batches || []).filter(b =>
    (hive.linkedHoneyBatches || []).includes(b.batchNumber) ||
    (b.sourceHives || []).some(h => h.includes(hive.name) || h.includes(hive.code))
  );

  const handleArchive = () => {
    setIsMenuOpen(false);
    if (window.confirm(`Archive ${hive.name}? Its history will remain available, but it will no longer appear in your active hive list.`)) {
      archiveHive(hive.id);
      onBack();
    }
  };

  const handleTrash = () => {
    setIsMenuOpen(false);
    if (window.confirm(`Permanently trash and delete ${hive.name} (${hive.code || 'colony'})? This will remove this hive and its frames from your database.`)) {
      deleteHive(hive.id);
      onBack();
    }
  };

  const handleOpenBatch = (batchId) => {
    setSelectedBatchId(batchId);
    setActiveTab('honey');
  };

  const scrollToHistory = () => {
    if (historyRef.current) {
      historyRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Determine latest scan or frame result
  const latestScan = hive.healthTimeline && hive.healthTimeline.length > 0 ? hive.healthTimeline[0] : null;

  // If Screen 17 Technical Details is requested
  if (showTechnicalDetails) {
    return (
      <HiveTechnicalDetails
        hive={hive}
        onBack={() => setShowTechnicalDetails(false)}
      />
    );
  }

  return (
    <div className="hd-viewport">
      {/* ─────────────────────────────────────────────────────────────
          1. HEADER (Section 2)
          ← Back | Title | Subtitle | ••• Menu
      ───────────────────────────────────────────────────────────── */}
      <header className="hd-header">
        <button
          type="button"
          className="hd-back-btn"
          onClick={onBack}
          aria-label="Return to all hives"
        >
          <ArrowLeft size={18} />
          <span>All hives</span>
        </button>

        <div className="hd-header-main">
          <div>
            <h1 className="hd-title">{hive.name}</h1>
            <p className="hd-subtitle">
              {hive.location || 'North Apiary'} · Updated {hive.lastUpdate || 'Just now'}
            </p>
          </div>

          <div className="hd-menu-wrap" ref={menuRef}>
            <button
              type="button"
              className="hd-menu-trigger"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Hive options menu"
              aria-expanded={isMenuOpen}
            >
              <MoreVertical size={20} />
            </button>

            {isMenuOpen && (
              <div className="hd-dropdown-menu" role="menu">
                <button
                  type="button"
                  className="hd-menu-item"
                  onClick={() => {
                    setIsMenuOpen(false);
                    showToast(`Editing ${hive.name}`);
                  }}
                  role="menuitem"
                >
                  <Edit2 size={15} />
                  <span>Edit hive</span>
                </button>

                <button
                  type="button"
                  className="hd-menu-item"
                  onClick={() => {
                    setIsMenuOpen(false);
                    showToast('Colony settings');
                  }}
                  role="menuitem"
                >
                  <Settings size={15} />
                  <span>Hive settings</span>
                </button>

                <div className="hd-menu-divider" />

                <button
                  type="button"
                  className="hd-menu-item"
                  onClick={handleArchive}
                  role="menuitem"
                >
                  <Archive size={15} />
                  <span>Archive hive</span>
                </button>

                <button
                  type="button"
                  className="hd-menu-item danger"
                  onClick={handleTrash}
                  role="menuitem"
                >
                  <Trash2 size={15} color="#D9383A" />
                  <span>Trash hive (delete)</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────
          2. HERO HEALTH STATUS (Sections 3 & 4)
          Human-readable condition statement
      ───────────────────────────────────────────────────────────── */}
      <section className={`hd-hero-card ${hive.status}`}>
        <div className="hd-hero-top">
          <div className="hd-status-pill">
            <span className={`hd-hero-dot ${hive.status}`} />
            <strong className="hd-status-name">
              {isHealthy ? 'Healthy' : isAttention ? 'Needs attention' : 'Monitoring unavailable'}
            </strong>
          </div>
          <span className="hd-inspected-date">
            Last inspected {hive.lastInspected || 'Today'}
          </span>
        </div>

        <p className="hd-hero-sentence">
          {isHealthy
            ? (hive.statusText || 'Conditions look stable.')
            : isAttention
            ? (hive.conditionSummary || hive.statusText || 'A recent observation may need a closer look.')
            : 'Live observations aren\'t available right now.'}
        </p>

        {isAttention && (
          <button
            type="button"
            className="hd-hero-action-link"
            onClick={() => openInspectionResult({ hiveId: hive.id, hive, scanData: latestScan })}
          >
            <span>Review latest inspection</span>
            <ArrowRight size={14} />
          </button>
        )}

        {isMonitoringUnavailable && (
          <button
            type="button"
            className="hd-hero-action-link"
            onClick={() => setIsTechSheetOpen(true)}
          >
            <span>Check device</span>
            <ArrowRight size={14} />
          </button>
        )}
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. PRIMARY ACTIONS (Section 5)
          Two prominent buttons: [Inspect hive] [Scan a frame]
      ───────────────────────────────────────────────────────────── */}
      <section className="hd-primary-actions">
        <div className="hd-actions-grid">
          <button
            type="button"
            className="btn btn-primary hd-action-btn"
            onClick={() => openSheet('hive-inspect', { hiveId: hive.id })}
          >
            <ClipboardCheck size={18} strokeWidth={2} />
            <span>Inspect hive</span>
          </button>

          <button
            type="button"
            className="btn btn-honey hd-action-btn"
            onClick={() => openScanModal(hive.id)}
          >
            <Camera size={18} strokeWidth={2} />
            <span>Scan a frame</span>
          </button>
        </div>

        <div className="hd-secondary-actions-row">
          <button
            type="button"
            className="hd-sec-pill-btn"
            onClick={() => setIsRecordObsOpen(true)}
          >
            <MessageSquarePlus size={15} />
            <span>Add observation</span>
          </button>

          <button
            type="button"
            className="hd-sec-pill-btn"
            onClick={() => openScanModal(hive.id)}
          >
            <ImageIcon size={15} />
            <span>Capture image</span>
          </button>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          4. BEE HEALTH SCAN SECTION (Section 6 & 7)
          Signature feature: Scan a frame + Previous scans link
      ───────────────────────────────────────────────────────────── */}
      <section className="hd-section hd-scan-section">
        <div className="hd-section-header">
          <div>
            <h2 className="hd-section-title">Bee Health Scan</h2>
            <p className="hd-section-sub">
              Capture a clear brood-frame image to check for possible visual signs of common bee health conditions.
            </p>
          </div>
        </div>

        <div className="hd-scan-cta-card">
          <div className="hd-scan-cta-left">
            <div className="hd-scan-icon-wrap">
              <Camera size={20} color="#B87316" />
            </div>
            <div>
              <strong className="hd-scan-cta-title">Brood comb inspection</strong>
              <span className="hd-scan-cta-sub">Assistive optical screening aid</span>
            </div>
          </div>

          <div className="hd-scan-buttons-group">
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => openScanModal(hive.id)}
            >
              Scan a frame
            </button>
            <button
              type="button"
              className="hd-text-link-btn"
              onClick={scrollToHistory}
            >
              View previous scans
            </button>
          </div>
        </div>

        {/* 5. LATEST INSPECTION IMAGE (Section 7 & 41) */}
        {hive.inspectionImage ? (
          <div className="hd-latest-frame-card">
            <div className="hd-latest-frame-head">
              <span className="hd-frame-meta-lbl">Latest inspection image</span>
              <span className="hd-frame-timestamp">Captured {hive.lastInspected || 'Today'}</span>
            </div>

            <div className="hd-latest-frame-media">
              <img
                src={hive.inspectionImage}
                alt={`${hive.name} brood frame captured during inspection`}
                className="hd-frame-img"
              />
              <div className={`hd-frame-result-pill ${isAttention ? 'attention' : 'healthy'}`}>
                <span className={`hd-pill-dot ${isAttention ? 'attention' : 'healthy'}`} />
                <span>{latestScan?.title || (isAttention ? 'Possible signs detected' : 'No concerning signs detected')}</span>
              </div>
            </div>

            <div className="hd-latest-frame-foot">
              <p className="hd-frame-foot-desc">
                {latestScan?.condition || (isAttention ? 'Visual patterns flagged for closer look.' : 'Solid brood pattern without abnormalities.')}
              </p>
              <button
                type="button"
                className="hd-frame-cta-link"
                onClick={() => openInspectionResult({ hiveId: hive.id, hive, scanData: latestScan })}
              >
                <span>View analysis</span>
                <ArrowRight size={13} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        ) : (
          <div className="hd-empty-frame-card">
            <div className="hd-empty-icon-wrap">
              <Camera size={22} color="var(--color-warm-gray)" />
            </div>
            <div>
              <strong className="hd-empty-title">No frame images yet</strong>
              <p className="hd-empty-sub">Capture your first frame when you inspect this hive.</p>
            </div>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => openScanModal(hive.id)}
            >
              Scan a frame
            </button>
          </div>
        )}
      </section>

      {/* ─────────────────────────────────────────────────────────────
          6. HIVE CONDITIONS (Sections 8, 9, 10, 11)
          Environmental conditions presented as human observations
      ───────────────────────────────────────────────────────────── */}
      <section className="hd-section hd-conditions-section">
        <div className="hd-section-header">
          <div>
            <h2 className="hd-section-title">Hive conditions</h2>
            <p className="hd-section-sub">
              {isMonitoringUnavailable
                ? 'Live observations unavailable'
                : `Updated ${hive.lastUpdate || '2 min ago'}`}
            </p>
          </div>
        </div>

        <div className="hd-conditions-grid">
          {/* Temperature */}
          <div className="hd-condition-tile">
            <div className="hd-tile-icon-row">
              <Thermometer size={16} color="var(--color-sage)" />
              <span className="hd-tile-label">Temperature</span>
            </div>
            <div className="hd-tile-value">
              {hive.temp ? `${hive.temp}°C` : '29.1°C'}
            </div>
            <span className="hd-tile-human-state">
              {isMonitoringUnavailable ? 'Paused' : 'Stable'}
            </span>
          </div>

          {/* Humidity */}
          <div className="hd-condition-tile">
            <div className="hd-tile-icon-row">
              <Droplets size={16} color="var(--color-sage)" />
              <span className="hd-tile-label">Humidity</span>
            </div>
            <div className="hd-tile-value">
              {hive.humidity ? `${hive.humidity}%` : '56%'}
            </div>
            <span className="hd-tile-human-state">
              {isMonitoringUnavailable ? 'Paused' : 'Stable'}
            </span>
          </div>

          {/* Activity / Acoustics */}
          <div className="hd-condition-tile">
            <div className="hd-tile-icon-row">
              <Activity size={16} color="var(--color-primary-honey)" />
              <span className="hd-tile-label">Activity</span>
            </div>
            <div className="hd-tile-value" style={{ fontSize: '16px' }}>
              {isAttention ? 'Shift detected' : 'Normal'}
            </div>
            <span className="hd-tile-human-state">
              {hive.acousticText || 'Steady worker hum'}
            </span>
          </div>
        </div>

        {/* Section 10: Technical Hardware Details Disclosure */}
        <div className="hd-tech-trigger-row">
          <button
            type="button"
            className="hd-tech-trigger-btn"
            onClick={() => setShowTechnicalDetails(true)}
          >
            <span>View technical details</span>
            <ChevronRight size={15} />
          </button>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          7. HEALTH HISTORY (Sections 12, 13, 14, 15, 16)
          Chronological longitudinal timeline
      ───────────────────────────────────────────────────────────── */}
      <section className="hd-section hd-history-section" ref={historyRef}>
        <div className="hd-section-header">
          <div>
            <h2 className="hd-section-title">Health history</h2>
            <p className="hd-section-sub">
              Screening observations, manual comb checks, and colony milestones.
            </p>
          </div>
        </div>

        {hive.healthTimeline && hive.healthTimeline.length > 0 ? (
          <div className="hd-timeline-vertical">
            {hive.healthTimeline.map((item, index) => {
              const isItemAttention = item.resultType === 'concerning';
              return (
                <div key={item.id || index} className="hd-timeline-entry">
                  {/* Left timeline track */}
                  <div className="hd-timeline-track">
                    <span className={`hd-timeline-marker ${item.resultType}`} />
                    {index < hive.healthTimeline.length - 1 && <span className="hd-timeline-line" />}
                  </div>

                  {/* Right content card */}
                  <div className={`hd-timeline-card ${item.resultType}`}>
                    <div className="hd-tl-head">
                      <span className="hd-tl-date">
                        {item.date} {item.time && `· ${item.time}`}
                      </span>
                      <span className={`hd-tl-type-badge ${item.resultType}`}>
                        {item.title}
                      </span>
                    </div>

                    <strong className="hd-tl-condition-title">{item.condition}</strong>

                    {item.findings && item.findings.length > 0 && (
                      <ul className="hd-tl-findings-list">
                        {item.findings.map((f, i) => (
                          <li key={i}>{f}</li>
                        ))}
                      </ul>
                    )}

                    {item.observerNotes && (
                      <div className="hd-tl-observer-quote">
                        <em>Beekeeper observation:</em> "{item.observerNotes}"
                      </div>
                    )}

                    {item.image && (
                      <div className="hd-tl-media-preview">
                        <img src={item.image} alt="Brood frame thumbnail" className="hd-tl-img" />
                        <span className="hd-tl-media-label">Brood frame recorded</span>
                      </div>
                    )}

                    <div className="hd-tl-footer">
                      <span className="hd-tl-screening-tag">
                        {item.modelVersion ? 'Image screening result' : 'Manual inspection'}
                      </span>
                      <button
                        type="button"
                        className="hd-tl-view-link"
                        onClick={() => openInspectionResult({ hiveId: hive.id, hive, scanData: item })}
                      >
                        View details →
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="hd-empty-history-box">
            <Clock size={20} color="var(--color-warm-gray)" />
            <p>No health history recorded yet. Complete an inspection or scan to start the timeline.</p>
          </div>
        )}
      </section>

      {/* ─────────────────────────────────────────────────────────────
          8. MANUAL OBSERVATIONS (Sections 17 & 18)
          Free-form field notes from beekeepers
      ───────────────────────────────────────────────────────────── */}
      <section className="hd-section hd-observations-section">
        <div className="hd-section-header with-action">
          <div>
            <h2 className="hd-section-title">Observations</h2>
            <p className="hd-section-sub">Field notes and observations from beekeepers.</p>
          </div>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setIsRecordObsOpen(true)}
          >
            + Add observation
          </button>
        </div>

        {hive.observations && hive.observations.length > 0 ? (
          <div className="hd-observations-list">
            {hive.observations.map((obs, idx) => (
              <div key={obs.id || idx} className="hd-observation-item">
                <div className="hd-obs-head">
                  <span className="hd-obs-meta">
                    <strong>{obs.author || 'Sarah L.'}</strong> · {obs.timestamp}
                  </span>
                  {obs.category && (
                    <span className="hd-obs-tag">{obs.category}</span>
                  )}
                </div>
                <p className="hd-obs-text">"{obs.text}"</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="hd-empty-history-box">
            <p>No observations recorded yet. Tap "Add observation" to log what you notice.</p>
          </div>
        )}
      </section>

      {/* ─────────────────────────────────────────────────────────────
          9. HIVE DETAILS (Sections 19, 20, 21)
          Static colony specifications, apiary link, tags & honey
      ───────────────────────────────────────────────────────────── */}
      <section className="hd-section hd-details-section">
        <h2 className="hd-section-title">Hive details</h2>

        <div className="hd-details-table">
          <div className="hd-detail-row">
            <span className="hd-detail-lbl">Colony Name</span>
            <strong className="hd-detail-val">{hive.name} (#{hive.code})</strong>
          </div>

          <div className="hd-detail-row">
            <span className="hd-detail-lbl">Apiary Location</span>
            <div className="hd-detail-val-col">
              <span>{hive.location || 'Meadowbrook Apiary'}</span>
              <button
                type="button"
                className="hd-inline-link"
                onClick={() => showToast('Opening apiary overview')}
              >
                View apiary →
              </button>
            </div>
          </div>

          <div className="hd-detail-row">
            <span className="hd-detail-lbl">Colony Breed</span>
            <span className="hd-detail-val">{hive.breed || 'Italian (Apis mellifera ligustica)'}</span>
          </div>

          <div className="hd-detail-row">
            <span className="hd-detail-lbl">Hive Architecture</span>
            <span className="hd-detail-val">{hive.type || 'Langstroth'} 10-frame</span>
          </div>

          <div className="hd-detail-row">
            <span className="hd-detail-lbl">Established</span>
            <span className="hd-detail-val">{hive.established || 'Spring 2024'}</span>
          </div>

          {hive.tags && hive.tags.length > 0 && (
            <div className="hd-detail-row">
              <span className="hd-detail-lbl">Colony Tags</span>
              <div className="hd-tags-wrap">
                {hive.tags.map((t, i) => (
                  <span key={i} className="hd-colony-tag">
                    <Tag size={11} /> {t}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Honey Traceability Connection (Linked Batches) */}
        {linkedBatches.length > 0 && (
          <div className="hd-linked-batches-block">
            <span className="hd-linked-label">Traceability Connection</span>
            <h4 className="hd-linked-heading">Honey Batches from this Colony</h4>
            <div className="hd-linked-list">
              {linkedBatches.map(b => (
                <div
                  key={b.id}
                  className="hd-batch-row"
                  onClick={() => handleOpenBatch(b.id)}
                  role="button"
                  tabIndex={0}
                >
                  <div>
                    <strong className="hd-batch-num">{b.batchNumber}</strong>
                    <span className="hd-batch-name">{b.name}</span>
                  </div>
                  <ChevronRight size={16} color="var(--color-warm-gray)" />
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ─────────────────────────────────────────────────────────────
          10. TECHNICAL DETAILS DISCLOSURE (Bottom)
      ───────────────────────────────────────────────────────────── */}
      <section className="hd-section hd-tech-footer-section">
        <div className="hd-tech-summary-box">
          <div>
            <strong className="hd-tech-title">Hardware Telemetry Layer</strong>
            <p className="hd-tech-sub">
              ESP32 wireless bridge, temperature probe, humidity seal, and camera module diagnostics.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-secondary btn-block"
            onClick={() => setShowTechnicalDetails(true)}
          >
            View technical details
          </button>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SHEETS & MODALS
      ───────────────────────────────────────────────────────────── */}
      <HiveTechnicalSheet
        isOpen={isTechSheetOpen}
        onClose={() => setIsTechSheetOpen(false)}
        hive={hive}
      />

      <RecordObservationModal
        isOpen={isRecordObsOpen}
        onClose={() => setIsRecordObsOpen(false)}
        hive={hive}
      />

      {/* ─────────────────────────────────────────────────────────────
          COMPONENT STYLES (Strict palette, card discipline & mobile-first)
      ───────────────────────────────────────────────────────────── */}
      <style>{`
        .hd-viewport {
          padding: 16px var(--mobile-pad) 36px;
          background-color: var(--color-warm-cream);
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        /* 1. Header */
        .hd-header {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .hd-back-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: none;
          border: none;
          color: var(--color-warm-gray);
          font-size: 13.5px;
          font-weight: 600;
          cursor: pointer;
          padding: 4px 0;
          align-self: flex-start;
          transition: color 0.15s ease;
        }

        .hd-back-btn:hover {
          color: var(--color-deep-cocoa);
        }

        .hd-header-main {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
        }

        .hd-title {
          font-size: 26px;
          font-weight: 800;
          color: var(--color-deep-cocoa);
          line-height: 1.2;
          margin-bottom: 3px;
        }

        .hd-subtitle {
          font-size: 13px;
          color: var(--color-warm-gray);
          line-height: 1.4;
        }

        .hd-menu-wrap {
          position: relative;
        }

        .hd-menu-trigger {
          width: 36px;
          height: 36px;
          border-radius: 9px;
          background-color: var(--color-soft-ivory);
          border: 1px solid var(--color-divider);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-deep-cocoa);
          cursor: pointer;
        }

        .hd-dropdown-menu {
          position: absolute;
          top: 42px;
          right: 0;
          width: 170px;
          background-color: #FFFFFF;
          border: 1px solid var(--color-divider);
          border-radius: 12px;
          box-shadow: 0 10px 24px rgba(52, 38, 27, 0.12);
          z-index: 50;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .hd-menu-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          font-size: 13px;
          font-weight: 500;
          background: none;
          border: none;
          text-align: left;
          color: var(--color-deep-cocoa);
          cursor: pointer;
          transition: background-color 0.15s ease;
        }

        .hd-menu-item:hover {
          background-color: var(--color-warm-cream);
        }

        .hd-menu-item.danger {
          color: var(--color-critical);
        }

        .hd-menu-divider {
          height: 1px;
          background-color: var(--color-divider);
        }

        /* 2. Hero Health Status */
        .hd-hero-card {
          background-color: var(--color-soft-ivory);
          border: 1px solid var(--color-divider);
          border-radius: var(--radius-card);
          padding: 16px 18px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          box-shadow: var(--shadow-sm);
        }

        .hd-hero-card.attention {
          border-color: rgba(217, 130, 43, 0.4);
          background-color: #FFFDF9;
        }

        .hd-hero-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 13px;
        }

        .hd-status-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .hd-hero-dot {
          width: 9px;
          height: 9px;
          border-radius: 50%;
        }

        .hd-hero-dot.healthy {
          background-color: var(--color-healthy);
        }

        .hd-hero-dot.attention {
          background-color: var(--color-attention);
        }

        .hd-hero-dot.monitoring_unavailable {
          background-color: var(--color-warm-gray);
        }

        .hd-status-name {
          font-size: 14.5px;
          font-weight: 700;
          color: var(--color-deep-cocoa);
        }

        .hd-inspected-date {
          font-size: 12.5px;
          color: var(--color-warm-gray);
        }

        .hd-hero-sentence {
          font-size: 14.5px;
          color: var(--color-deep-cocoa);
          line-height: 1.45;
        }

        .hd-hero-action-link {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: none;
          border: none;
          color: var(--color-deep-honey);
          font-size: 13.5px;
          font-weight: 700;
          cursor: pointer;
          align-self: flex-start;
          padding: 0;
        }

        /* 3. Primary Actions */
        .hd-primary-actions {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .hd-actions-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .hd-action-btn {
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 14.5px;
          font-weight: 700;
          border-radius: var(--radius-button);
        }

        .btn-honey {
          background-color: #FAF2E2;
          color: var(--color-deep-honey);
          border: 1.5px solid rgba(217, 154, 36, 0.4);
        }

        .btn-honey:hover {
          background-color: #F6E9CF;
        }

        .hd-secondary-actions-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .hd-sec-pill-btn {
          flex: 1;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          height: 38px;
          background-color: var(--color-soft-ivory);
          border: 1px solid var(--color-divider);
          border-radius: 9px;
          font-size: 12.5px;
          font-weight: 600;
          color: var(--color-deep-cocoa);
          cursor: pointer;
          transition: background-color 0.15s ease;
        }

        .hd-sec-pill-btn:hover {
          background-color: #F8EFE0;
        }

        /* General Section Typography */
        .hd-section {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .hd-section-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
        }

        .hd-section-title {
          font-size: 18px;
          font-weight: 700;
          color: var(--color-deep-cocoa);
          margin-bottom: 2px;
        }

        .hd-section-sub {
          font-size: 13px;
          color: var(--color-warm-gray);
          line-height: 1.4;
        }

        /* 4. Bee Health Scan Banner & Latest Frame */
        .hd-scan-cta-card {
          background-color: #FAF4E9;
          border: 1px solid rgba(217, 154, 36, 0.3);
          border-radius: var(--radius-card);
          padding: 14px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .hd-scan-cta-left {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .hd-scan-icon-wrap {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          background-color: #FFFFFF;
          border: 1px solid var(--color-divider);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .hd-scan-cta-title {
          display: block;
          font-size: 14px;
          font-weight: 700;
          color: var(--color-deep-cocoa);
        }

        .hd-scan-cta-sub {
          display: block;
          font-size: 12px;
          color: var(--color-warm-gray);
        }

        .hd-scan-buttons-group {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 6px;
        }

        .hd-text-link-btn {
          background: none;
          border: none;
          font-size: 12px;
          font-weight: 600;
          color: var(--color-deep-honey);
          cursor: pointer;
          padding: 0;
        }

        .hd-text-link-btn:hover {
          text-decoration: underline;
        }

        .hd-latest-frame-card {
          background-color: var(--color-soft-ivory);
          border: 1px solid var(--color-divider);
          border-radius: var(--radius-card);
          overflow: hidden;
        }

        .hd-latest-frame-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 14px;
          font-size: 12px;
          background-color: #FAF4E9;
          border-bottom: 1px solid var(--color-divider);
        }

        .hd-frame-meta-lbl {
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--color-deep-cocoa);
        }

        .hd-frame-timestamp {
          color: var(--color-warm-gray);
        }

        .hd-latest-frame-media {
          position: relative;
          width: 100%;
          height: 160px;
          background-color: #2B2117;
          overflow: hidden;
        }

        .hd-frame-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .hd-frame-result-pill {
          position: absolute;
          bottom: 10px;
          left: 12px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          border-radius: 9999px;
          background-color: rgba(35, 26, 19, 0.85);
          backdrop-filter: blur(4px);
          font-size: 12px;
          font-weight: 700;
          color: #FFFFFF;
        }

        .hd-pill-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
        }

        .hd-pill-dot.healthy {
          background-color: #4F7A52;
        }

        .hd-pill-dot.attention {
          background-color: #D9822B;
        }

        .hd-latest-frame-foot {
          padding: 12px 14px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .hd-frame-foot-desc {
          font-size: 13px;
          color: var(--color-deep-cocoa);
          line-height: 1.4;
          margin: 0;
        }

        .hd-frame-cta-link {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: none;
          border: none;
          color: var(--color-deep-honey);
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          white-space: nowrap;
          padding: 0;
        }

        .hd-empty-frame-card {
          background-color: var(--color-soft-ivory);
          border: 1px dashed var(--color-divider);
          border-radius: var(--radius-card);
          padding: 16px;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .hd-empty-icon-wrap {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background-color: #FAF4E9;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .hd-empty-title {
          display: block;
          font-size: 13.5px;
          font-weight: 600;
          color: var(--color-deep-cocoa);
        }

        .hd-empty-sub {
          display: block;
          font-size: 12px;
          color: var(--color-warm-gray);
          margin-top: 2px;
        }

        /* 5. Hive Conditions */
        .hd-conditions-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
        }

        .hd-condition-tile {
          background-color: var(--color-soft-ivory);
          border: 1px solid var(--color-divider);
          border-radius: 12px;
          padding: 10px 12px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .hd-tile-icon-row {
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .hd-tile-label {
          font-size: 11.5px;
          color: var(--color-warm-gray);
          font-weight: 600;
        }

        .hd-tile-value {
          font-size: 18px;
          font-weight: 800;
          color: var(--color-deep-cocoa);
          line-height: 1.2;
        }

        .hd-tile-human-state {
          font-size: 11.5px;
          color: var(--color-healthy);
          font-weight: 600;
        }

        .hd-tech-trigger-row {
          display: flex;
          justify-content: flex-end;
          margin-top: -4px;
        }

        .hd-tech-trigger-btn {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: none;
          border: none;
          font-size: 13px;
          font-weight: 600;
          color: var(--color-deep-honey);
          cursor: pointer;
          padding: 2px 0;
        }

        /* 6. Health History (Timeline) */
        .hd-timeline-vertical {
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        .hd-timeline-entry {
          display: flex;
          align-items: stretch;
          gap: 12px;
        }

        .hd-timeline-track {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 16px;
        }

        .hd-timeline-marker {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          margin-top: 6px;
          flex-shrink: 0;
        }

        .hd-timeline-marker.healthy {
          background-color: var(--color-healthy);
          box-shadow: 0 0 0 3px rgba(79, 122, 82, 0.2);
        }

        .hd-timeline-marker.concerning {
          background-color: var(--color-attention);
          box-shadow: 0 0 0 3px rgba(217, 130, 43, 0.2);
        }

        .hd-timeline-line {
          width: 2px;
          background-color: var(--color-divider);
          flex: 1;
          margin: 4px 0;
        }

        .hd-timeline-card {
          flex: 1;
          background-color: var(--color-soft-ivory);
          border: 1px solid var(--color-divider);
          border-radius: 12px;
          padding: 12px 14px;
          margin-bottom: 12px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .hd-timeline-card.concerning {
          border-left: 3px solid var(--color-attention);
        }

        .hd-tl-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 12px;
        }

        .hd-tl-date {
          color: var(--color-warm-gray);
          font-weight: 500;
        }

        .hd-tl-type-badge {
          font-size: 11.5px;
          font-weight: 700;
          padding: 2px 7px;
          border-radius: 9999px;
        }

        .hd-tl-type-badge.healthy {
          background-color: var(--color-healthy-tint);
          color: var(--color-healthy);
        }

        .hd-tl-type-badge.concerning {
          background-color: var(--color-attention-tint);
          color: var(--color-attention);
        }

        .hd-tl-condition-title {
          font-size: 14.5px;
          font-weight: 700;
          color: var(--color-deep-cocoa);
        }

        .hd-tl-findings-list {
          padding-left: 18px;
          margin: 2px 0 4px;
          font-size: 12.5px;
          color: var(--color-deep-cocoa);
          line-height: 1.45;
        }

        .hd-tl-observer-quote {
          font-size: 12.5px;
          color: var(--color-deep-cocoa);
          background-color: #FAF4E9;
          padding: 6px 10px;
          border-radius: 8px;
          border-left: 2px solid var(--color-primary-honey);
        }

        .hd-tl-media-preview {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 2px;
        }

        .hd-tl-img {
          width: 44px;
          height: 44px;
          border-radius: 6px;
          object-fit: cover;
          border: 1px solid var(--color-divider);
        }

        .hd-tl-media-label {
          font-size: 12px;
          color: var(--color-warm-gray);
        }

        .hd-tl-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-top: 1px solid rgba(237, 226, 209, 0.5);
          padding-top: 8px;
          margin-top: 4px;
          font-size: 11.5px;
        }

        .hd-tl-screening-tag {
          color: var(--color-warm-gray);
          font-style: italic;
        }

        .hd-tl-view-link {
          background: none;
          border: none;
          color: var(--color-deep-honey);
          font-weight: 700;
          cursor: pointer;
          padding: 0;
        }

        .hd-empty-history-box {
          display: flex;
          align-items: center;
          gap: 10px;
          background-color: var(--color-soft-ivory);
          border: 1px dashed var(--color-divider);
          border-radius: 12px;
          padding: 14px;
          font-size: 13px;
          color: var(--color-warm-gray);
        }

        /* 7. Observations */
        .hd-observations-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .hd-observation-item {
          background-color: var(--color-soft-ivory);
          border: 1px solid var(--color-divider);
          border-radius: 12px;
          padding: 12px 14px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .hd-obs-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 12px;
        }

        .hd-obs-meta {
          color: var(--color-warm-gray);
        }

        .hd-obs-meta strong {
          color: var(--color-deep-cocoa);
        }

        .hd-obs-tag {
          font-size: 11px;
          font-weight: 600;
          padding: 2px 6px;
          border-radius: 4px;
          background-color: #F8EFE0;
          color: var(--color-deep-cocoa);
        }

        .hd-obs-text {
          font-size: 13.5px;
          color: var(--color-deep-cocoa);
          line-height: 1.45;
          margin: 0;
        }

        /* 8. Hive Details */
        .hd-details-table {
          background-color: var(--color-soft-ivory);
          border: 1px solid var(--color-divider);
          border-radius: var(--radius-card);
          padding: 10px 14px;
          display: flex;
          flex-direction: column;
        }

        .hd-detail-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          padding: 9px 0;
          border-bottom: 1px solid rgba(237, 226, 209, 0.4);
          font-size: 13.5px;
        }

        .hd-detail-row:last-child {
          border-bottom: none;
        }

        .hd-detail-lbl {
          color: var(--color-warm-gray);
          flex-shrink: 0;
        }

        .hd-detail-val {
          font-weight: 600;
          color: var(--color-deep-cocoa);
          text-align: right;
        }

        .hd-detail-val-col {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 2px;
        }

        .hd-inline-link {
          background: none;
          border: none;
          color: var(--color-deep-honey);
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          padding: 0;
        }

        .hd-tags-wrap {
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
          justify-content: flex-end;
        }

        .hd-colony-tag {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          font-weight: 600;
          padding: 2px 7px;
          border-radius: 6px;
          background-color: #FAF4E9;
          border: 1px solid var(--color-divider);
          color: var(--color-deep-cocoa);
        }

        .hd-linked-batches-block {
          background-color: var(--color-soft-ivory);
          border: 1px solid var(--color-divider);
          border-radius: var(--radius-card);
          padding: 14px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .hd-linked-label {
          font-size: 11.5px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--color-warm-gray);
        }

        .hd-linked-heading {
          font-size: 14.5px;
          font-weight: 700;
          color: var(--color-deep-cocoa);
          margin-bottom: 2px;
        }

        .hd-linked-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .hd-batch-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 10px;
          background-color: #FAF4E9;
          border-radius: 8px;
          cursor: pointer;
          transition: background-color 0.15s ease;
        }

        .hd-batch-row:hover {
          background-color: #F6E9CF;
        }

        .hd-batch-num {
          display: block;
          font-size: 13px;
          font-weight: 700;
          color: var(--color-deep-cocoa);
        }

        .hd-batch-name {
          display: block;
          font-size: 11.5px;
          color: var(--color-warm-gray);
        }

        /* 9. Technical Details Footer */
        .hd-tech-summary-box {
          background-color: #FAF4E9;
          border: 1px solid var(--color-divider);
          border-radius: var(--radius-card);
          padding: 14px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .hd-tech-title {
          display: block;
          font-size: 13.5px;
          font-weight: 700;
          color: var(--color-deep-cocoa);
        }

        .hd-tech-sub {
          display: block;
          font-size: 12px;
          color: var(--color-warm-gray);
          line-height: 1.4;
          margin-top: 2px;
        }
      `}</style>
    </div>
  );
};
