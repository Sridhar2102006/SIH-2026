import React, { useState } from 'react';
import {
  Factory,
  Building2,
  MapPin,
  Cpu,
  Package,
  FileCheck,
  Check,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Info
} from 'lucide-react';
import {
  WORK_DESCRIPTION_OPTIONS,
  ORGANIZATION_TYPE_OPTIONS,
  INITIAL_FACILITIES,
  INITIAL_ORGANIZATIONS,
  INITIAL_EQUIPMENT_REGISTRY
} from '../../data/processor/processorSeedData';
import { PROCESSING_PROFILES } from '../../data/processor/processingProfiles';
import { ProcessorProfileService } from '../../services/processorProfileService';

const INDIAN_STATES = [
  'Maharashtra',
  'Jammu and Kashmir',
  'Punjab',
  'Himachal Pradesh',
  'Uttarakhand',
  'Uttar Pradesh',
  'Bihar',
  'West Bengal',
  'Tamil Nadu',
  'Kerala',
  'Karnataka',
  'Assam',
  'Meghalaya',
  'Madhya Pradesh',
  'Rajasthan',
  'Gujarat'
];

export const ProcessorSetupScreen = ({
  initialData = {},
  onComplete,
  onCancel
}) => {
  const [activeStep, setActiveStep] = useState(1);

  // Step 1: Work Description
  const [workDescription, setWorkDescription] = useState(initialData.workDescription || 'COMMERCIAL_PROCESSING');

  // Step 2: Organization Context
  const [orgType, setOrgType] = useState(initialData.orgType || 'COOPERATIVE');
  const [orgName, setOrgName] = useState(initialData.orgName || 'Sahyadri Bio-Honey Producer Co-operative');
  const [businessScale, setBusinessScale] = useState(initialData.businessScale || 'MEDIUM');
  const [locationsCount, setLocationsCount] = useState(initialData.locationsCount || '1');

  // Step 3: Location Hierarchy
  const [state, setState] = useState(initialData.state || 'Maharashtra');
  const [district, setDistrict] = useState(initialData.district || 'Pune');
  const [subdistrict, setSubdistrict] = useState(initialData.subdistrict || 'Haveli');
  const [locality, setLocality] = useState(initialData.locality || 'Hadapsar Agro-Industrial Zone');

  // Step 4: Facility & Capacity
  const [facilityName, setFacilityName] = useState(initialData.facilityName || 'HoneyHouse Central Processing #2');
  const [capacityKgPerDay, setCapacityKgPerDay] = useState(initialData.capacityKgPerDay || '800');
  const [storageCapacityKg, setStorageCapacityKg] = useState(initialData.storageCapacityKg || '15000');
  const [labAccess, setLabAccess] = useState(initialData.labAccess || 'ON_SITE_SCREENING_PLUS_EXTERNAL_ACCREDITED');

  // Step 5: Equipment Multi-Select
  const [selectedEquipmentIds, setSelectedEquipmentIds] = useState(
    initialData.selectedEquipmentIds || ['eq-ext-01', 'eq-flt-01', 'eq-tnk-02', 'eq-scl-01', 'eq-ref-01']
  );

  // Step 6: Profile & SOP
  const [selectedProfileCode, setSelectedProfileCode] = useState(initialData.profileCode || 'COMMERCIAL_RETAIL');

  const toggleEquipment = (eqId) => {
    setSelectedEquipmentIds(prev =>
      prev.includes(eqId) ? prev.filter(id => id !== eqId) : [...prev, eqId]
    );
  };

  const handleFinish = () => {
    const saved = ProcessorProfileService.saveCustomOrganizationAndFacility({
      organizationName: orgName,
      organizationType: orgType,
      workDescription,
      businessScale,
      state,
      district,
      facilityName,
      selectedEquipment: selectedEquipmentIds,
      selectedProfileCode
    });

    if (onComplete) {
      onComplete({
        organization: saved.organization,
        facility: saved.facility,
        workDescription,
        profileCode: selectedProfileCode,
        equipmentCount: selectedEquipmentIds.length
      });
    }
  };

  return (
    <div className="proc-setup-wizard">
      {/* Wizard Progress Bar */}
      <div className="proc-wizard-header">
        <div className="proc-wz-title-row">
          <Factory size={20} color="#D97706" />
          <span className="proc-wz-title">Processor Facility & Operating Profile</span>
        </div>
        <div className="proc-step-indicator">
          <span>Step {activeStep} of 4</span>
          <div className="proc-step-pills">
            {[1, 2, 3, 4].map(s => (
              <div
                key={s}
                className={`proc-step-pill ${s <= activeStep ? 'active' : ''}`}
                onClick={() => s < activeStep && setActiveStep(s)}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="proc-wizard-body">
        {/* STEP 1: Work Description & Org Context */}
        {activeStep === 1 && (
          <div className="proc-wz-step-content">
            <h2 className="proc-wz-heading">What best describes your processing work?</h2>
            <p className="proc-wz-desc">
              HoneyChain adapts its workflow to your operational reality rather than forcing a generic process.
            </p>

            <div className="proc-work-desc-grid">
              {WORK_DESCRIPTION_OPTIONS.map(opt => (
                <div
                  key={opt.id}
                  className={`proc-opt-card ${workDescription === opt.id ? 'selected' : ''}`}
                  onClick={() => setWorkDescription(opt.id)}
                >
                  <div className="proc-opt-radio">
                    {workDescription === opt.id && <div className="proc-radio-dot" />}
                  </div>
                  <div className="proc-opt-info">
                    <strong>{opt.label}</strong>
                    <span>{opt.description}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="proc-form-divider" />

            <h3 className="proc-sub-heading">Organization Type & Scale</h3>
            <div className="proc-field-row">
              <div className="proc-field-col">
                <label>Organization Type</label>
                <select value={orgType} onChange={e => setOrgType(e.target.value)}>
                  {ORGANIZATION_TYPE_OPTIONS.map(t => (
                    <option key={t.id} value={t.id}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div className="proc-field-col">
                <label>Business Operating Scale</label>
                <select value={businessScale} onChange={e => setBusinessScale(e.target.value)}>
                  <option value="MICRO">Micro (Up to 50 kg/day)</option>
                  <option value="SMALL">Small (50 - 300 kg/day)</option>
                  <option value="MEDIUM">Medium (300 - 1,500 kg/day)</option>
                  <option value="COMMERCIAL">Commercial Bulk (1,500+ kg/day)</option>
                </select>
              </div>
            </div>

            <div className="proc-field-row">
              <div className="proc-field-col full">
                <label>Organization Legal / Trade Name</label>
                <input
                  type="text"
                  value={orgName}
                  onChange={e => setOrgName(e.target.value)}
                  placeholder="e.g. Sahyadri Bio-Honey Producer Co-operative"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Location & Facility Context */}
        {activeStep === 2 && (
          <div className="proc-wz-step-content">
            <h2 className="proc-wz-heading">Facility Location & Operating Profile</h2>
            <p className="proc-wz-desc">
              Location provides context on regional flora, climate, and source honey moisture dynamics.
            </p>

            <div className="proc-field-row">
              <div className="proc-field-col">
                <label>State / UT</label>
                <select value={state} onChange={e => setState(e.target.value)}>
                  {INDIAN_STATES.map(st => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              <div className="proc-field-col">
                <label>District</label>
                <input
                  type="text"
                  value={district}
                  onChange={e => setDistrict(e.target.value)}
                  placeholder="e.g. Pune, Pulwama, The Nilgiris"
                />
              </div>
            </div>

            <div className="proc-field-row">
              <div className="proc-field-col">
                <label>Subdistrict / Taluk / Block</label>
                <input
                  type="text"
                  value={subdistrict}
                  onChange={e => setSubdistrict(e.target.value)}
                  placeholder="e.g. Haveli, Pampore, Kotagiri"
                />
              </div>

              <div className="proc-field-col">
                <label>Village / Locality / Industrial Area</label>
                <input
                  type="text"
                  value={locality}
                  onChange={e => setLocality(e.target.value)}
                  placeholder="e.g. Hadapsar MIDC Zone"
                />
              </div>
            </div>

            <div className="proc-form-divider" />

            <h3 className="proc-sub-heading">Primary Facility Specification</h3>
            <div className="proc-field-row">
              <div className="proc-field-col full">
                <label>Primary Processing Facility Name</label>
                <input
                  type="text"
                  value={facilityName}
                  onChange={e => setFacilityName(e.target.value)}
                  placeholder="e.g. HoneyHouse Central Processing #2"
                />
              </div>
            </div>

            <div className="proc-field-row">
              <div className="proc-field-col">
                <label>Daily Processing Capacity (kg/day)</label>
                <input
                  type="number"
                  value={capacityKgPerDay}
                  onChange={e => setCapacityKgPerDay(e.target.value)}
                />
              </div>

              <div className="proc-field-col">
                <label>Bulk Storage Holding Capacity (kg)</label>
                <input
                  type="number"
                  value={storageCapacityKg}
                  onChange={e => setStorageCapacityKg(e.target.value)}
                />
              </div>
            </div>

            <div className="proc-field-row">
              <div className="proc-field-col full">
                <label>Laboratory & Quality Testing Access</label>
                <select value={labAccess} onChange={e => setLabAccess(e.target.value)}>
                  <option value="ON_SITE_SCREENING_PLUS_EXTERNAL_ACCREDITED">
                    On-Site Screening (Refractometry) + External NABL Lab for HMF/Diastase
                  </option>
                  <option value="IN_HOUSE_ACCREDITED_LAB">
                    Complete In-House Testing Laboratory (Enzyme & HPLC equipped)
                  </option>
                  <option value="PARTNER_LAB_TRANSFER">
                    Sample Transfer to HoneyChain Co-operative Hub Laboratory
                  </option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Equipment Registry */}
        {activeStep === 3 && (
          <div className="proc-wz-step-content">
            <h2 className="proc-wz-heading">Select Available Facility Equipment</h2>
            <p className="proc-wz-desc">
              Your workflow steps and parameter entries will be tailored to the equipment installed at this facility.
            </p>

            <div className="proc-equip-grid">
              {INITIAL_EQUIPMENT_REGISTRY.map(eq => {
                const isSelected = selectedEquipmentIds.includes(eq.id);
                return (
                  <div
                    key={eq.id}
                    className={`proc-eq-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => toggleEquipment(eq.id)}
                  >
                    <div className="proc-eq-top">
                      <span className="proc-eq-type">{eq.type.replace(/_/g, ' ')}</span>
                      <div className={`proc-eq-check ${isSelected ? 'checked' : ''}`}>
                        {isSelected && <Check size={14} color="#FFF" strokeWidth={3} />}
                      </div>
                    </div>
                    <strong className="proc-eq-name">{eq.name}</strong>
                    <div className="proc-eq-meta">
                      <span>Cap: {eq.capacity} {eq.capacityUnit}</span>
                      <span className={`proc-calib-pill ${eq.calibrationStatus.toLowerCase()}`}>
                        {eq.calibrationStatus}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 4: Processing Profile & SOP Selection */}
        {activeStep === 4 && (
          <div className="proc-wz-step-content">
            <h2 className="proc-wz-heading">Choose Base Processing Profile & SOP</h2>
            <p className="proc-wz-desc">
              Select the operational profile that defines how your batches are extracted, clarified, and tested.
            </p>

            <div className="proc-profile-cards">
              {PROCESSING_PROFILES.map(prof => {
                const isSelected = selectedProfileCode === prof.code;
                return (
                  <div
                    key={prof.id}
                    className={`proc-prof-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => setSelectedProfileCode(prof.code)}
                  >
                    <div className="proc-prof-header">
                      <div className="proc-prof-radio">
                        {isSelected && <div className="proc-radio-dot" />}
                      </div>
                      <div className="proc-prof-titles">
                        <strong className="proc-prof-name">{prof.name}</strong>
                        <span className="proc-prof-tagline">{prof.tagline}</span>
                      </div>
                    </div>

                    <p className="proc-prof-desc">{prof.description}</p>

                    <div className="proc-prof-steps-preview">
                      <span className="proc-steps-lbl">Workflow Sequence ({prof.steps.length} steps):</span>
                      <div className="proc-steps-tags">
                        {prof.steps.map((st, i) => (
                          <span key={st.stepKey} className="proc-step-tag">
                            {i + 1}. {st.stepKey.replace(/_/g, ' ').toLowerCase()}
                            {st.requirement === 'OPTIONAL' && ' (opt)'}
                            {st.requirement === 'CONDITIONAL' && ' (cond)'}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="proc-sop-notice">
              <Info size={16} color="#D97706" />
              <span>
                Every batch created under this profile will automatically snapshot the active SOP version (e.g. <code>SOP-HNY-2026 v3.2</code>) for audit integrity.
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Footer Navigation Buttons */}
      <div className="proc-wizard-footer">
        {activeStep > 1 ? (
          <button
            type="button"
            className="btn btn-secondary proc-btn-back"
            onClick={() => setActiveStep(prev => prev - 1)}
          >
            <ArrowLeft size={16} />
            <span>Previous</span>
          </button>
        ) : onCancel ? (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
          >
            Cancel
          </button>
        ) : <div />}

        {activeStep < 4 ? (
          <button
            type="button"
            className="btn btn-primary proc-btn-next"
            onClick={() => setActiveStep(prev => prev + 1)}
          >
            <span>Continue</span>
            <ArrowRight size={16} />
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-primary proc-btn-finish"
            onClick={handleFinish}
          >
            <Sparkles size={16} />
            <span>Confirm Setup & Enter Workspace</span>
          </button>
        )}
      </div>

      <style>{`
        .proc-setup-wizard {
          display: flex;
          flex-direction: column;
          background: #FFFDF8;
          border-radius: var(--radius-sheet, 16px);
          overflow: hidden;
          max-width: 680px;
          margin: 0 auto;
          box-shadow: 0 8px 32px rgba(92, 64, 51, 0.12);
          border: 1px solid var(--color-divider, #E5DCCB);
        }

        .proc-wizard-header {
          padding: 16px 20px;
          border-bottom: 1px solid var(--color-divider, #E5DCCB);
          background: #FAF6ED;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .proc-wz-title-row {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .proc-wz-title {
          font-weight: 700;
          font-size: 15px;
          color: var(--color-deep-cocoa, #2E1F14);
        }

        .proc-step-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: var(--color-warm-gray, #6B5B4E);
        }

        .proc-step-pills {
          display: flex;
          gap: 4px;
        }

        .proc-step-pill {
          width: 14px;
          height: 6px;
          border-radius: 3px;
          background: #DDD4C2;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .proc-step-pill.active {
          background: #D97706;
          width: 22px;
        }

        .proc-wizard-body {
          padding: 20px;
          max-height: 70vh;
          overflow-y: auto;
        }

        .proc-wz-heading {
          font-size: 19px;
          font-weight: 800;
          color: var(--color-deep-cocoa, #2E1F14);
          margin-bottom: 6px;
        }

        .proc-wz-desc {
          font-size: 13.5px;
          color: var(--color-warm-gray, #6B5B4E);
          line-height: 1.45;
          margin-bottom: 18px;
        }

        .proc-work-desc-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 10px;
        }

        .proc-opt-card {
          border: 1.5px solid #E5DCCB;
          border-radius: 10px;
          padding: 12px;
          display: flex;
          align-items: flex-start;
          gap: 10px;
          background: #FFFFFF;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .proc-opt-card:hover {
          border-color: #D97706;
          background: #FFFDF8;
        }

        .proc-opt-card.selected {
          border-color: #D97706;
          background: #FFFBEB;
          box-shadow: 0 2px 8px rgba(217, 119, 6, 0.12);
        }

        .proc-opt-radio {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          border: 2px solid #D97706;
          margin-top: 2px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .proc-radio-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #D97706;
        }

        .proc-opt-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .proc-opt-info strong {
          font-size: 13.5px;
          color: var(--color-deep-cocoa, #2E1F14);
        }

        .proc-opt-info span {
          font-size: 12px;
          color: var(--color-warm-gray, #6B5B4E);
          line-height: 1.35;
        }

        .proc-form-divider {
          height: 1px;
          background: var(--color-divider, #E5DCCB);
          margin: 20px 0;
        }

        .proc-sub-heading {
          font-size: 15px;
          font-weight: 700;
          color: var(--color-deep-cocoa, #2E1F14);
          margin-bottom: 12px;
        }

        .proc-field-row {
          display: flex;
          gap: 12px;
          margin-bottom: 12px;
          flex-wrap: wrap;
        }

        .proc-field-col {
          flex: 1;
          min-width: 220px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .proc-field-col.full {
          flex: 100%;
        }

        .proc-field-col label {
          font-size: 12px;
          font-weight: 600;
          color: var(--color-deep-cocoa, #2E1F14);
        }

        .proc-field-col input,
        .proc-field-col select {
          padding: 8px 12px;
          border-radius: 8px;
          border: 1px solid #D1C7B7;
          background: #FFF;
          font-size: 13.5px;
          color: var(--color-deep-cocoa, #2E1F14);
          outline: none;
        }

        .proc-field-col input:focus,
        .proc-field-col select:focus {
          border-color: #D97706;
          box-shadow: 0 0 0 2px rgba(217, 119, 6, 0.15);
        }

        .proc-equip-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 12px;
        }

        .proc-eq-card {
          border: 1.5px solid #E5DCCB;
          border-radius: 10px;
          padding: 12px;
          background: #FFFFFF;
          cursor: pointer;
          transition: all 0.15s ease;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .proc-eq-card.selected {
          border-color: #D97706;
          background: #FFFDF5;
          box-shadow: 0 2px 8px rgba(217, 119, 6, 0.1);
        }

        .proc-eq-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .proc-eq-type {
          font-size: 11px;
          font-weight: 700;
          color: #B45309;
          text-transform: uppercase;
        }

        .proc-eq-check {
          width: 20px;
          height: 20px;
          border-radius: 6px;
          border: 1.5px solid #C4B9A7;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .proc-eq-check.checked {
          background: #D97706;
          border-color: #D97706;
        }

        .proc-eq-name {
          font-size: 13px;
          color: var(--color-deep-cocoa, #2E1F14);
        }

        .proc-eq-meta {
          display: flex;
          justify-content: space-between;
          font-size: 11.5px;
          color: var(--color-warm-gray, #6B5B4E);
        }

        .proc-calib-pill {
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 700;
        }

        .proc-calib-pill.calibrated {
          background: #ECFDF5;
          color: #059669;
        }

        .proc-calib-pill.not_required {
          background: #F3F4F6;
          color: #6B7280;
        }

        .proc-profile-cards {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .proc-prof-card {
          border: 1.5px solid #E5DCCB;
          border-radius: 12px;
          padding: 14px;
          background: #FFF;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .proc-prof-card.selected {
          border-color: #D97706;
          background: #FFFBEB;
          box-shadow: 0 4px 12px rgba(217, 119, 6, 0.12);
        }

        .proc-prof-header {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          margin-bottom: 6px;
        }

        .proc-prof-radio {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          border: 2px solid #D97706;
          margin-top: 2px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .proc-prof-titles {
          display: flex;
          flex-direction: column;
        }

        .proc-prof-name {
          font-size: 14.5px;
          color: var(--color-deep-cocoa, #2E1F14);
        }

        .proc-prof-tagline {
          font-size: 12px;
          color: #D97706;
          font-weight: 600;
        }

        .proc-prof-desc {
          font-size: 12.5px;
          color: var(--color-warm-gray, #6B5B4E);
          line-height: 1.4;
          margin-bottom: 10px;
        }

        .proc-prof-steps-preview {
          background: #FAF6ED;
          padding: 8px 10px;
          border-radius: 8px;
        }

        .proc-steps-lbl {
          font-size: 11px;
          font-weight: 700;
          color: var(--color-deep-cocoa, #2E1F14);
          display: block;
          margin-bottom: 4px;
        }

        .proc-steps-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
        }

        .proc-step-tag {
          font-size: 11px;
          background: #FFF;
          border: 1px solid #E5DCCB;
          padding: 2px 6px;
          border-radius: 4px;
          color: var(--color-deep-cocoa, #2E1F14);
        }

        .proc-sop-notice {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #FFFBEB;
          border: 1px solid #FCD34D;
          border-radius: 8px;
          padding: 10px 12px;
          margin-top: 14px;
          font-size: 12px;
          color: #92400E;
        }

        .proc-sop-notice code {
          background: #FEF3C7;
          padding: 1px 4px;
          border-radius: 4px;
          font-weight: 700;
        }

        .proc-wizard-footer {
          padding: 14px 20px;
          background: #FAF6ED;
          border-top: 1px solid var(--color-divider, #E5DCCB);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .proc-btn-next,
        .proc-btn-finish {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 9px 18px;
          font-size: 13.5px;
          font-weight: 700;
        }
      `}</style>
    </div>
  );
};
