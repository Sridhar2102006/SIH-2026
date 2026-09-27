import React, { useState, useCallback } from 'react';
import {
  ArrowRight, ArrowLeft, MapPin, Home, Layers, Droplets,
  Phone, Check, CheckCircle, Info
} from 'lucide-react';

/**
 * BEEKEEPER FIELD ONBOARDING
 * 
 * 5 simple questions. Zero technical jargon.
 * 
 * Step 1: What's your name? Where do you work?
 * Step 2: Where do you keep your bees? (Location)
 * Step 3: How many hives / how long?
 * Step 4: What kind of honey do you collect?
 * Step 5: Ready — confirm & set up workspace
 */

const HONEY_TYPES = [
  { id: 'MULTIFLORAL', emoji: '🌸', label: 'Wild / multifloral', desc: 'From many types of flowers' },
  { id: 'UNIFLORAL', emoji: '🌻', label: 'Single-flower (unifloral)', desc: 'Mustard, sunflower, litchi, etc.' },
  { id: 'FOREST', emoji: '🌲', label: 'Forest / jungle honey', desc: 'From forest forage' },
  { id: 'ORGANIC', emoji: '🍃', label: 'Organic', desc: 'No chemical treatments' },
  { id: 'RAW', emoji: '🍯', label: 'Raw / unprocessed', desc: 'Sold directly from hive' },
  { id: 'BEESWAX', emoji: '🕯️', label: 'Beeswax', desc: 'Comb and wax products' }
];

const SCALE_OPTIONS = [
  { id: 'SMALL', emoji: '🏡', label: '1–10 hives', desc: 'Small home apiary' },
  { id: 'MEDIUM', emoji: '🌾', label: '10–50 hives', desc: 'Small commercial' },
  { id: 'LARGE', emoji: '🚜', label: '50–200 hives', desc: 'Commercial apiary' },
  { id: 'ENTERPRISE', emoji: '🏭', label: '200+ hives', desc: 'Large / enterprise' }
];

const EXPERIENCE_OPTIONS = [
  { id: 'BEGINNER', label: 'Just starting out', desc: 'Less than 1 year' },
  { id: 'INTERMEDIATE', label: 'A few years', desc: '1–5 years' },
  { id: 'EXPERIENCED', label: 'Experienced beekeeper', desc: '5–15 years' },
  { id: 'EXPERT', label: 'Expert / mentor', desc: '15+ years' }
];

const STATES_OF_INDIA = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman & Nicobar', 'Chandigarh', 'Delhi', 'Jammu & Kashmir', 'Ladakh',
  'Lakshadweep', 'Puducherry'
];

const STEPS = [
  { id: 1, title: 'About you', icon: '👤' },
  { id: 2, title: 'Your location', icon: '📍' },
  { id: 3, title: 'Your apiary', icon: '🐝' },
  { id: 4, title: 'Honey you collect', icon: '🍯' },
  { id: 5, title: 'All set', icon: '✅' }
];

export const BeekeeperOnboarding = ({ onComplete, onBack }) => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    // Step 1
    fullName: '',
    mobile: '',
    // Step 2
    state: '',
    district: '',
    apiaryName: '',
    // Step 3
    scale: '',
    experience: '',
    isKvicMember: null,
    // Step 4
    honeyTypes: []
  });

  const update = useCallback((field, value) =>
    setForm(prev => ({ ...prev, [field]: value })), []);

  const toggleHoneyType = useCallback((typeId) =>
    setForm(prev => ({
      ...prev,
      honeyTypes: prev.honeyTypes.includes(typeId)
        ? prev.honeyTypes.filter(t => t !== typeId)
        : [...prev.honeyTypes, typeId]
    })), []);

  const canProceed = () => {
    if (step === 1) return form.fullName.trim().length >= 2;
    if (step === 2) return form.state !== '' && form.apiaryName.trim().length >= 1;
    if (step === 3) return form.scale !== '' && form.experience !== '';
    if (step === 4) return form.honeyTypes.length > 0;
    return true;
  };

  const handleNext = () => {
    if (step < 5) setStep(s => s + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(s => s - 1);
    else onBack && onBack();
  };

  const handleComplete = () => {
    onComplete && onComplete({
      role: 'BEEKEEPER',
      designations: ['BEEKEEPER'],
      capabilities: [
        'HIVE_MANAGEMENT',
        'HIVE_INSPECTION',
        'HONEY_COLLECTION',
        'BEE_OBSERVATION',
        'HIVE_IMAGE_CAPTURE'
      ],
      workContexts: {
        areas: ['Apiary / outdoor farm'],
        handles: ['Bee colonies', 'Honey harvest', 'Hive inspections'],
        honeyTypes: form.honeyTypes,
        scale: form.scale,
        experience: form.experience
      },
      operatorName: form.fullName,
      apiaryName: form.apiaryName || 'My Apiary',
      location: { state: form.state, district: form.district },
      mobile: form.mobile,
      isKvicMember: form.isKvicMember,
      verificationProfile: {
        primaryRole: 'BEEKEEPER',
        kvicRecommended: true
      }
    });
  };

  return (
    <div className="role-onboarding-screen beekeeper-theme">
      {/* Step Progress */}
      <div className="ob-step-progress">
        {STEPS.map((s) => (
          <div
            key={s.id}
            className={`ob-step-dot ${s.id === step ? 'active' : s.id < step ? 'done' : ''}`}
          />
        ))}
      </div>

      {/* Step Label */}
      <div className="ob-step-label">
        <span className="ob-step-emoji">{STEPS[step - 1].icon}</span>
        <span className="ob-step-name">Step {step} of {STEPS.length} — {STEPS[step - 1].title}</span>
      </div>

      {/* ── STEP 1: About You ─────────────────────────────────────────────── */}
      {step === 1 && (
        <div className="ob-step-content fade-in">
          <h2 className="ob-step-question">What's your name?</h2>
          <p className="ob-step-hint">
            This is how you'll appear in HoneyChain records and certificates.
          </p>

          <div className="ob-field-group">
            <label className="ob-field-label">Your full name</label>
            <input
              type="text"
              className="ob-field-input"
              placeholder="E.g. Rajan Kumar"
              value={form.fullName}
              onChange={e => update('fullName', e.target.value)}
              autoFocus
            />
          </div>

          <div className="ob-field-group">
            <label className="ob-field-label">Mobile number <span className="ob-optional">(optional)</span></label>
            <div className="ob-phone-row">
              <span className="ob-phone-prefix">+91</span>
              <input
                type="tel"
                className="ob-field-input ob-phone-input"
                placeholder="9876543210"
                value={form.mobile}
                maxLength={10}
                onChange={e => update('mobile', e.target.value.replace(/\D/g, ''))}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── STEP 2: Location ──────────────────────────────────────────────── */}
      {step === 2 && (
        <div className="ob-step-content fade-in">
          <h2 className="ob-step-question">Where do you keep your bees?</h2>
          <p className="ob-step-hint">
            We use this to match you with local regulations and quality standards.
          </p>

          <div className="ob-field-group">
            <label className="ob-field-label">State / Union Territory</label>
            <select
              className="ob-field-select"
              value={form.state}
              onChange={e => update('state', e.target.value)}
            >
              <option value="">Select state...</option>
              {STATES_OF_INDIA.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="ob-field-group">
            <label className="ob-field-label">District / Town <span className="ob-optional">(optional)</span></label>
            <input
              type="text"
              className="ob-field-input"
              placeholder="E.g. Muzaffarpur"
              value={form.district}
              onChange={e => update('district', e.target.value)}
            />
          </div>

          <div className="ob-field-group">
            <label className="ob-field-label">Name of your apiary or farm</label>
            <input
              type="text"
              className="ob-field-input"
              placeholder="E.g. Rajan Bee Farm"
              value={form.apiaryName}
              onChange={e => update('apiaryName', e.target.value)}
            />
          </div>
        </div>
      )}

      {/* ── STEP 3: Your Apiary ───────────────────────────────────────────── */}
      {step === 3 && (
        <div className="ob-step-content fade-in">
          <h2 className="ob-step-question">Tell us about your apiary</h2>

          <div className="ob-field-group">
            <label className="ob-field-label">How many hives do you have?</label>
            <div className="ob-option-grid">
              {SCALE_OPTIONS.map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  className={`ob-option-card ${form.scale === opt.id ? 'selected' : ''}`}
                  onClick={() => update('scale', opt.id)}
                >
                  <span className="ob-option-emoji">{opt.emoji}</span>
                  <span className="ob-option-label">{opt.label}</span>
                  <span className="ob-option-desc">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="ob-field-group">
            <label className="ob-field-label">How long have you been a beekeeper?</label>
            <div className="ob-pill-row">
              {EXPERIENCE_OPTIONS.map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  className={`ob-pill-btn ${form.experience === opt.id ? 'selected' : ''}`}
                  onClick={() => update('experience', opt.id)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="ob-field-group">
            <label className="ob-field-label">Are you registered with KVIC?</label>
            <p className="ob-field-sublabel">
              Khadi and Village Industries Commission — optional but helps with verification
            </p>
            <div className="ob-pill-row">
              {[
                { id: true, label: 'Yes, I am' },
                { id: false, label: 'No' },
                { id: null, label: 'Not sure' }
              ].map(opt => (
                <button
                  key={String(opt.id)}
                  type="button"
                  className={`ob-pill-btn ${form.isKvicMember === opt.id ? 'selected' : ''}`}
                  onClick={() => update('isKvicMember', opt.id)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── STEP 4: Honey Types ───────────────────────────────────────────── */}
      {step === 4 && (
        <div className="ob-step-content fade-in">
          <h2 className="ob-step-question">What kind of honey do you collect?</h2>
          <p className="ob-step-hint">Select all that apply. This helps HoneyChain suggest the right quality checks.</p>

          <div className="ob-honey-grid">
            {HONEY_TYPES.map(type => {
              const isSelected = form.honeyTypes.includes(type.id);
              return (
                <button
                  key={type.id}
                  type="button"
                  className={`ob-honey-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => toggleHoneyType(type.id)}
                >
                  <div className="ob-honey-top">
                    <span className="ob-honey-emoji">{type.emoji}</span>
                    {isSelected && (
                      <Check size={14} className="ob-honey-check" strokeWidth={3} />
                    )}
                  </div>
                  <span className="ob-honey-label">{type.label}</span>
                  <span className="ob-honey-desc">{type.desc}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── STEP 5: All Set ───────────────────────────────────────────────── */}
      {step === 5 && (
        <div className="ob-step-content ob-final-screen fade-in">
          <div className="ob-final-icon">🐝</div>
          <h2 className="ob-final-title">You're all set, {form.fullName.split(' ')[0] || 'beekeeper'}!</h2>
          <p className="ob-final-subtitle">
            Your Beekeeper workspace is ready. You can inspect hives, record harvests, and track batches.
          </p>

          <div className="ob-summary-card">
            <div className="ob-summary-row">
              <span className="ob-summary-label">👤 Name</span>
              <span className="ob-summary-value">{form.fullName}</span>
            </div>
            <div className="ob-summary-row">
              <span className="ob-summary-label">📍 Location</span>
              <span className="ob-summary-value">{[form.district, form.state].filter(Boolean).join(', ') || '—'}</span>
            </div>
            <div className="ob-summary-row">
              <span className="ob-summary-label">🏡 Apiary</span>
              <span className="ob-summary-value">{form.apiaryName || '—'}</span>
            </div>
            <div className="ob-summary-row">
              <span className="ob-summary-label">🐝 Scale</span>
              <span className="ob-summary-value">{SCALE_OPTIONS.find(s => s.id === form.scale)?.label || '—'}</span>
            </div>
            <div className="ob-summary-row">
              <span className="ob-summary-label">🍯 Honey</span>
              <span className="ob-summary-value">
                {form.honeyTypes.length > 0
                  ? form.honeyTypes.map(id => HONEY_TYPES.find(t => t.id === id)?.label).join(' • ')
                  : '—'}
              </span>
            </div>
          </div>

          <div className="ob-kvic-notice">
            <Info size={14} />
            <span>
              You can complete identity verification later from your Profile. KVIC registration (if applicable) will speed up verification.
            </span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="ob-nav-bar">
        <button
          type="button"
          className="ob-back-btn"
          onClick={handleBack}
        >
          <ArrowLeft size={16} />
          Back
        </button>

        {step < 5 ? (
          <button
            type="button"
            className={`ob-next-btn beekeeper-accent ${!canProceed() ? 'disabled' : ''}`}
            disabled={!canProceed()}
            onClick={handleNext}
          >
            Continue
            <ArrowRight size={16} />
          </button>
        ) : (
          <button
            type="button"
            className="ob-next-btn beekeeper-accent"
            onClick={handleComplete}
          >
            Open my workspace
            <ArrowRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

export default BeekeeperOnboarding;
