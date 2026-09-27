import React, { useState, useCallback } from 'react';
import {
  ArrowRight, ArrowLeft, Info, AlertTriangle, CheckCircle, Check
} from 'lucide-react';

/**
 * LAB SPECIALIST ONBOARDING
 * 
 * Advanced professional onboarding for lab analysts.
 * 
 * Step 1: Your name & role
 * Step 2: Where is your laboratory? (Accreditation)
 * Step 3: What honey tests do you perform?
 * Step 4: Your equipment
 * Step 5: Verification requirements — identity + lab authorization
 * Step 6: Ready
 * 
 * IMPORTANT RULES (§60, §61):
 * - Test Result ≠ Quality Decision — must be shown clearly at setup
 * - HoneyChain report ≠ Official FSSAI certificate
 * - Lab onboarding requires role verification before accessing sensitive features
 */

const TEST_TYPES = [
  { id: 'MOISTURE', emoji: '💧', label: 'Moisture content', desc: 'Refractometry / water activity' },
  { id: 'PURITY', emoji: '🔎', label: 'Purity / adulteration', desc: 'Sugar syrup, C4 detection, NMR' },
  { id: 'ENZYME', emoji: '⚗️', label: 'Enzyme activity', desc: 'Diastase, invertase activity' },
  { id: 'HMF', emoji: '🌡️', label: 'HMF content', desc: 'Hydroxymethylfurfural levels' },
  { id: 'MICROBIOLOGICAL', emoji: '🦠', label: 'Microbiological', desc: 'Yeast, bacteria, mold counts' },
  { id: 'PESTICIDE', emoji: '🌿', label: 'Pesticide residues', desc: 'Agrochemical screening' },
  { id: 'HEAVY_METALS', emoji: '⚠️', label: 'Heavy metals', desc: 'Lead, cadmium, arsenic' },
  { id: 'ANTIBIOTIC', emoji: '💊', label: 'Antibiotic residues', desc: 'Streptomycin, tetracycline, sulfa' },
  { id: 'FLORAL_SOURCE', emoji: '🌸', label: 'Floral source / botanical', desc: 'Pollen analysis, unifloral verification' },
  { id: 'COLOUR_TASTE', emoji: '🎨', label: 'Colour & sensory', desc: 'Pfund scale, organoleptic tests' }
];

const EQUIPMENT_OPTIONS = [
  { id: 'REFRACTOMETER', label: 'Refractometer', desc: 'Moisture measurement' },
  { id: 'HPLC', label: 'HPLC system', desc: 'High-performance chromatography' },
  { id: 'GCMS', label: 'GC-MS', desc: 'Gas chromatography–mass spectrometry' },
  { id: 'ICP_MS', label: 'ICP-MS', desc: 'Heavy metals trace analysis' },
  { id: 'PCR', label: 'PCR system', desc: 'DNA-based testing' },
  { id: 'MICROSCOPE', label: 'Optical microscope', desc: 'Pollen analysis' },
  { id: 'SPECTROPHOTOMETER', label: 'Spectrophotometer', desc: 'Colorimetric assays' },
  { id: 'STANDARD_KIT', label: 'Standard test kits', desc: 'HMF, enzyme, Lund test kits' }
];

const ACCREDITATION_OPTIONS = [
  { id: 'NABL', label: 'NABL Accredited', desc: 'National Accreditation Board for Testing (ISO 17025)' },
  { id: 'FSSAI_RECOGNISED', label: 'FSSAI Recognised Lab', desc: 'Officially recognised by FSSAI for regulatory testing' },
  { id: 'STATE_APPROVED', label: 'State Government Approved', desc: 'Approved by state agriculture or food department' },
  { id: 'INTERNAL', label: 'In-house / private lab', desc: 'Not externally accredited, used internally' },
  { id: 'UNIVERSITY', label: 'University / research lab', desc: 'Academic institution laboratory' }
];

const STEPS = [
  { id: 1, title: 'About you', icon: '👤' },
  { id: 2, title: 'Your laboratory', icon: '🏛️' },
  { id: 3, title: 'Tests you perform', icon: '🧪' },
  { id: 4, title: 'Your equipment', icon: '🔬' },
  { id: 5, title: 'Verification required', icon: '🔐' },
  { id: 6, title: 'All set', icon: '✅' }
];

export const LabOnboarding = ({ onComplete, onBack }) => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    fullName: '',
    jobTitle: '',
    mobile: '',
    email: '',
    labName: '',
    state: '',
    district: '',
    accreditations: [],
    fssaiLabCode: '',
    nablaCode: '',
    testTypes: [],
    equipment: [],
    hasAcceptedLabDisclaimer: false
  });

  const update = useCallback((field, value) =>
    setForm(prev => ({ ...prev, [field]: value })), []);

  const toggleItem = useCallback((field, id) =>
    setForm(prev => ({
      ...prev,
      [field]: prev[field].includes(id)
        ? prev[field].filter(x => x !== id)
        : [...prev[field], id]
    })), []);

  const canProceed = () => {
    if (step === 1) return form.fullName.trim().length >= 2;
    if (step === 2) return form.labName.trim().length >= 2 && form.accreditations.length > 0;
    if (step === 3) return form.testTypes.length > 0;
    if (step === 4) return form.equipment.length > 0;
    if (step === 5) return form.hasAcceptedLabDisclaimer;
    return true;
  };

  const handleNext = () => { if (step < 6) setStep(s => s + 1); };
  const handleBack = () => {
    if (step > 1) setStep(s => s - 1);
    else onBack && onBack();
  };

  const handleComplete = () => {
    onComplete && onComplete({
      role: 'LAB_SPECIALIST',
      designations: ['LAB_SPECIALIST'],
      capabilities: [
        'LAB_WORKSPACE',
        'SAMPLE_INTAKE',
        'TEST_EXECUTION',
        'TEST_RESULT_ENTRY',
        'RESULT_REVIEW',
        ...(form.accreditations.includes('NABL') || form.accreditations.includes('FSSAI_RECOGNISED')
          ? ['CERTIFICATE_GENERATION']
          : [])
      ],
      workContexts: {
        areas: ['Testing laboratory'],
        handles: ['Honey samples', 'Quality analysis', 'Lab reports'],
        testTypes: form.testTypes,
        equipment: form.equipment,
        accreditations: form.accreditations
      },
      operatorName: form.fullName,
      apiaryName: form.labName,
      location: { state: form.state, district: form.district },
      mobile: form.mobile,
      email: form.email,
      verificationProfile: {
        primaryRole: 'LAB_SPECIALIST',
        requiresRoleVerification: true,
        verificationDocumentsRequired: ['LAB_AUTHORIZATION'],
        fssaiLabCode: form.fssaiLabCode || null,
        nablaCode: form.nablaCode || null,
        accreditations: form.accreditations
      }
    });
  };

  return (
    <div className="role-onboarding-screen lab-theme">
      {/* Step Progress */}
      <div className="ob-step-progress">
        {STEPS.map((s) => (
          <div
            key={s.id}
            className={`ob-step-dot lab-dot ${s.id === step ? 'active' : s.id < step ? 'done' : ''}`}
          />
        ))}
      </div>

      <div className="ob-step-label lab-label">
        <span className="ob-step-emoji">{STEPS[step - 1].icon}</span>
        <span className="ob-step-name">Step {step} of {STEPS.length} — {STEPS[step - 1].title}</span>
      </div>

      {/* ── STEP 1: About You ─────────────────────────────────────────────── */}
      {step === 1 && (
        <div className="ob-step-content fade-in">
          <h2 className="ob-step-question lab-accent">Who are you?</h2>
          <p className="ob-step-hint">
            Lab onboarding requires professional identity. All information is securely handled.
          </p>
          <div className="ob-field-group">
            <label className="ob-field-label">Full name</label>
            <input className="ob-field-input lab-input" type="text" placeholder="Dr. Priya Nair"
              value={form.fullName} onChange={e => update('fullName', e.target.value)} autoFocus />
          </div>
          <div className="ob-field-group">
            <label className="ob-field-label">Your role / designation <span className="ob-optional">(optional)</span></label>
            <input className="ob-field-input lab-input" type="text" placeholder="E.g. Analyst, Lab Incharge, Food Scientist"
              value={form.jobTitle} onChange={e => update('jobTitle', e.target.value)} />
          </div>
          <div className="ob-field-row">
            <div className="ob-field-group ob-field-half">
              <label className="ob-field-label">Mobile</label>
              <input className="ob-field-input lab-input" type="tel" placeholder="9876543210" maxLength={10}
                value={form.mobile} onChange={e => update('mobile', e.target.value.replace(/\D/g, ''))} />
            </div>
            <div className="ob-field-group ob-field-half">
              <label className="ob-field-label">Email <span className="ob-optional">(optional)</span></label>
              <input className="ob-field-input lab-input" type="email" placeholder="email@lab.in"
                value={form.email} onChange={e => update('email', e.target.value)} />
            </div>
          </div>
        </div>
      )}

      {/* ── STEP 2: Laboratory ────────────────────────────────────────────── */}
      {step === 2 && (
        <div className="ob-step-content fade-in">
          <h2 className="ob-step-question lab-accent">Tell us about your laboratory</h2>

          <div className="ob-field-group">
            <label className="ob-field-label">Laboratory name</label>
            <input className="ob-field-input lab-input" type="text"
              placeholder="E.g. Agro Quality Labs Pvt. Ltd."
              value={form.labName} onChange={e => update('labName', e.target.value)} />
          </div>
          <div className="ob-field-row">
            <div className="ob-field-group ob-field-half">
              <label className="ob-field-label">State</label>
              <input className="ob-field-input lab-input" type="text" placeholder="E.g. Maharashtra"
                value={form.state} onChange={e => update('state', e.target.value)} />
            </div>
            <div className="ob-field-group ob-field-half">
              <label className="ob-field-label">City / District</label>
              <input className="ob-field-input lab-input" type="text" placeholder="E.g. Pune"
                value={form.district} onChange={e => update('district', e.target.value)} />
            </div>
          </div>

          <div className="ob-field-group">
            <label className="ob-field-label">Lab accreditation / recognition <span className="ob-required">*</span></label>
            <p className="ob-field-sublabel">Select all that apply</p>
            <div className="ob-accred-list">
              {ACCREDITATION_OPTIONS.map(opt => {
                const isSelected = form.accreditations.includes(opt.id);
                return (
                  <button key={opt.id} type="button"
                    className={`ob-accred-item ${isSelected ? 'selected-lab' : ''}`}
                    onClick={() => toggleItem('accreditations', opt.id)}
                  >
                    <div className="ob-accred-left">
                      <div className={`ob-accred-check ${isSelected ? 'checked-lab' : ''}`}>
                        {isSelected && <Check size={12} strokeWidth={3} color="#fff" />}
                      </div>
                      <div>
                        <div className="ob-accred-name">{opt.label}</div>
                        <div className="ob-accred-desc">{opt.desc}</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {form.accreditations.includes('FSSAI_RECOGNISED') && (
            <div className="ob-field-group">
              <label className="ob-field-label">FSSAI Lab Code <span className="ob-optional">(if known)</span></label>
              <input className="ob-field-input lab-input" type="text" placeholder="FSSAI lab reference"
                value={form.fssaiLabCode} onChange={e => update('fssaiLabCode', e.target.value)} />
            </div>
          )}
          {form.accreditations.includes('NABL') && (
            <div className="ob-field-group">
              <label className="ob-field-label">NABL Accreditation Number <span className="ob-optional">(if known)</span></label>
              <input className="ob-field-input lab-input" type="text" placeholder="TC-XXXX"
                value={form.nablaCode} onChange={e => update('nablaCode', e.target.value)} />
            </div>
          )}
        </div>
      )}

      {/* ── STEP 3: Tests ─────────────────────────────────────────────────── */}
      {step === 3 && (
        <div className="ob-step-content fade-in">
          <h2 className="ob-step-question lab-accent">What honey tests do you perform?</h2>
          <p className="ob-step-hint">Select all that your laboratory offers. This shapes your workspace.</p>
          <div className="ob-test-grid">
            {TEST_TYPES.map(t => {
              const isSelected = form.testTypes.includes(t.id);
              return (
                <button key={t.id} type="button"
                  className={`ob-test-card ${isSelected ? 'selected-lab' : ''}`}
                  onClick={() => toggleItem('testTypes', t.id)}
                >
                  <div className="ob-test-top">
                    <span className="ob-test-emoji">{t.emoji}</span>
                    {isSelected && <Check size={12} strokeWidth={3} className="ob-test-check" />}
                  </div>
                  <span className="ob-test-label">{t.label}</span>
                  <span className="ob-test-desc">{t.desc}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── STEP 4: Equipment ─────────────────────────────────────────────── */}
      {step === 4 && (
        <div className="ob-step-content fade-in">
          <h2 className="ob-step-question lab-accent">What equipment do you use?</h2>
          <p className="ob-step-hint">Helps HoneyChain understand your lab capabilities.</p>
          <div className="ob-equipment-list">
            {EQUIPMENT_OPTIONS.map(eq => {
              const isSelected = form.equipment.includes(eq.id);
              return (
                <button key={eq.id} type="button"
                  className={`ob-equipment-item ${isSelected ? 'selected-lab' : ''}`}
                  onClick={() => toggleItem('equipment', eq.id)}
                >
                  <div className={`ob-equip-check ${isSelected ? 'checked-lab' : ''}`}>
                    {isSelected && <Check size={11} strokeWidth={3} color="#fff" />}
                  </div>
                  <div className="ob-equip-info">
                    <span className="ob-equip-name">{eq.label}</span>
                    <span className="ob-equip-desc">{eq.desc}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── STEP 5: Verification Required ─────────────────────────────────── */}
      {step === 5 && (
        <div className="ob-step-content fade-in">
          <h2 className="ob-step-question lab-accent">Lab access requires verification</h2>
          <div className="ob-lab-verification-notice">
            <div className="ob-lab-notice-icon">🔐</div>
            <p className="ob-lab-notice-text">
              Laboratory accounts handle <strong>quality testing</strong> and may contribute to
              regulatory submissions. Therefore, HoneyChain requires:
            </p>
            <ul className="ob-lab-notice-list">
              <li>✅ Government-issued identity document</li>
              <li>✅ Lab authorization letter or appointment document</li>
              <li>🔵 NABL or FSSAI recognition (if applicable)</li>
            </ul>
            <p className="ob-lab-notice-sub">
              You can complete verification after setup. Until verified, lab features will be in restricted mode.
            </p>
          </div>

          {/* Critical disclaimers */}
          <div className="ob-disclaimer-card">
            <AlertTriangle size={16} className="ob-disclaimer-icon" />
            <div>
              <p className="ob-disclaimer-title">Important: HoneyChain Report ≠ FSSAI Certificate</p>
              <p className="ob-disclaimer-text">
                Test results recorded in HoneyChain are internal quality records.
                They do <strong>not</strong> constitute an official FSSAI certificate or regulatory
                approval. Official certificates must be issued through FSSAI-authorised channels.
              </p>
            </div>
          </div>

          <div className="ob-disclaimer-card ob-disclaimer-secondary">
            <Info size={16} className="ob-disclaimer-icon" />
            <p className="ob-disclaimer-text">
              <strong>Test Result ≠ Quality Decision.</strong> Recording a test result in HoneyChain
              does not automatically certify a batch. A trained analyst must review and approve.
            </p>
          </div>

          <button
            type="button"
            className={`ob-accept-btn ${form.hasAcceptedLabDisclaimer ? 'accepted' : ''}`}
            onClick={() => update('hasAcceptedLabDisclaimer', !form.hasAcceptedLabDisclaimer)}
          >
            <div className={`ob-accept-check ${form.hasAcceptedLabDisclaimer ? 'checked-lab' : ''}`}>
              {form.hasAcceptedLabDisclaimer && <Check size={13} strokeWidth={3} color="#fff" />}
            </div>
            I understand and accept these terms
          </button>
        </div>
      )}

      {/* ── STEP 6: All Set ───────────────────────────────────────────────── */}
      {step === 6 && (
        <div className="ob-step-content ob-final-screen fade-in">
          <div className="ob-final-icon">🔬</div>
          <h2 className="ob-final-title lab-accent">Welcome, {form.jobTitle || 'Analyst'}!</h2>
          <p className="ob-final-subtitle">
            Your Lab workspace is ready. Complete verification from Profile to unlock all lab features.
          </p>
          <div className="ob-summary-card lab-summary">
            <div className="ob-summary-row">
              <span className="ob-summary-label">👤 Name</span>
              <span className="ob-summary-value">{form.fullName}</span>
            </div>
            <div className="ob-summary-row">
              <span className="ob-summary-label">🏛️ Lab</span>
              <span className="ob-summary-value">{form.labName}</span>
            </div>
            <div className="ob-summary-row">
              <span className="ob-summary-label">🔐 Status</span>
              <span className="ob-summary-value ob-status-pending">Verification pending</span>
            </div>
          </div>
          <div className="ob-lab-restricted-note">
            <Info size={14} />
            <span>You are in restricted mode until your identity and lab authorization are verified by HoneyChain admins.</span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="ob-nav-bar">
        <button type="button" className="ob-back-btn" onClick={handleBack}>
          <ArrowLeft size={16} />Back
        </button>
        {step < 6 ? (
          <button type="button"
            className={`ob-next-btn lab-accent-btn ${!canProceed() ? 'disabled' : ''}`}
            disabled={!canProceed()} onClick={handleNext}
          >
            Continue <ArrowRight size={16} />
          </button>
        ) : (
          <button type="button" className="ob-next-btn lab-accent-btn" onClick={handleComplete}>
            Open lab workspace <ArrowRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

export default LabOnboarding;
