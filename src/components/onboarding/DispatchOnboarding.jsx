import React, { useState, useCallback } from 'react';
import { ArrowRight, ArrowLeft, Info, Check } from 'lucide-react';

/**
 * DISPATCH / DISTRIBUTOR ONBOARDING
 * 
 * Business-style 5-step setup for distributors and logistics operators.
 * 
 * Step 1: Your name & business
 * Step 2: Operating territory & coverage
 * Step 3: How do you move honey? (fleet, channel type)
 * Step 4: Who do you source from and sell to?
 * Step 5: Ready
 * 
 * QR VALIDATION RULE (§74): Valid QR ≠ Quality Certified.
 * The system will display this clearly in dispatch workspace.
 */

const BUSINESS_TYPES = [
  { id: 'INDIVIDUAL_TRADER', emoji: '🧑‍💼', label: 'Individual trader', desc: 'Trading as a sole person or proprietor' },
  { id: 'PARTNERSHIP', emoji: '🤝', label: 'Partnership firm', desc: 'Two or more partners' },
  { id: 'PVTLTD', emoji: '🏢', label: 'Private limited company', desc: 'Registered Pvt. Ltd.' },
  { id: 'COOPERATIVE', emoji: '🌐', label: 'Cooperative / FPO', desc: 'Farmer producer org or cooperative' },
  { id: 'NGO', emoji: '🌿', label: 'NGO / Self-help group', desc: 'Non-profit or SHG' }
];

const FLEET_OPTIONS = [
  { id: 'OWN_VEHICLE', label: 'Own vehicle(s)', desc: 'Truck, van, or bike owned by you' },
  { id: 'THIRD_PARTY', label: 'Third-party logistics', desc: 'Courier or transport company' },
  { id: 'HYBRID', label: 'Both', desc: 'Own + outsourced transport' },
  { id: 'LOCAL_ONLY', label: 'Local delivery only', desc: 'Within one town / district' }
];

const BUYER_TYPES = [
  { id: 'RETAIL', emoji: '🛒', label: 'Retail shops', desc: 'Grocery, kirana, modern retail' },
  { id: 'WHOLESALE', emoji: '📦', label: 'Wholesale dealers', desc: 'Bulk buyers, stockists' },
  { id: 'ECOMMERCE', emoji: '💻', label: 'E-commerce platforms', desc: 'Amazon, Flipkart, Meesho, etc.' },
  { id: 'INSTITUTIONAL', emoji: '🏥', label: 'Institutional buyers', desc: 'Hospitals, hotels, food companies' },
  { id: 'EXPORT', emoji: '✈️', label: 'Export', desc: 'International buyers' },
  { id: 'DIRECT', emoji: '🏡', label: 'Direct to consumer', desc: 'Farm-to-home, local markets' }
];

const SOURCE_TYPES = [
  { id: 'BEEKEEPER', emoji: '🐝', label: 'Beekeepers', desc: 'Direct from bee farmers' },
  { id: 'PROCESSOR', emoji: '🍯', label: 'Processors / producers', desc: 'From extraction or bottling units' },
  { id: 'COOPERATIVE', emoji: '🌐', label: 'Cooperatives / FPOs', desc: 'Farmer org or co-op' },
  { id: 'AUCTION', emoji: '🔨', label: 'Auction / mandi', desc: 'Commodity auctions' },
  { id: 'IMPORT', emoji: '🌍', label: 'Import', desc: 'From other countries' }
];

const STEPS = [
  { id: 1, title: 'About you', icon: '👤' },
  { id: 2, title: 'Your business', icon: '🏢' },
  { id: 3, title: 'How you move honey', icon: '🚚' },
  { id: 4, title: 'Your supply chain', icon: '🔗' },
  { id: 5, title: 'All set', icon: '✅' }
];

const STATES_OF_INDIA = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu & Kashmir', 'Puducherry'
];

export const DispatchOnboarding = ({ onComplete, onBack }) => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    fullName: '',
    mobile: '',
    businessName: '',
    businessType: '',
    gstin: '',
    fssaiNumber: '',
    baseState: '',
    operatingStates: [],
    fleetType: '',
    vehicleCount: '',
    buyerTypes: [],
    sourceTypes: [],
    monthlyVolume: '',
    hasGstin: null
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
    if (step === 2) return form.businessName.trim().length >= 2 && form.businessType && form.baseState;
    if (step === 3) return form.fleetType !== '';
    if (step === 4) return form.buyerTypes.length > 0 && form.sourceTypes.length > 0;
    return true;
  };

  const handleNext = () => { if (step < 5) setStep(s => s + 1); };
  const handleBack = () => {
    if (step > 1) setStep(s => s - 1);
    else onBack && onBack();
  };

  const handleComplete = () => {
    onComplete && onComplete({
      role: 'DISTRIBUTOR',
      designations: ['DISTRIBUTOR'],
      capabilities: [
        'DISPATCH_PLANNING',
        'PACKAGE_QR_VALIDATE',
        'SHIPMENT_CREATE',
        'SHIPMENT_RELEASE',
        'DELIVERY_TRACKING',
        'DELIVERY_CONFIRMATION',
        ...(form.operatingStates.length > 1 ? ['ROUTE_PLANNING'] : []),
        ...(form.buyerTypes.includes('INSTITUTIONAL') || form.buyerTypes.includes('EXPORT')
          ? ['INVENTORY_MANAGEMENT']
          : [])
      ],
      workContexts: {
        areas: ['Warehouse & stock hub', 'Transport / logistics'],
        handles: ['Honey packages', 'Shipments', 'QR validation'],
        fleetType: form.fleetType,
        buyerTypes: form.buyerTypes,
        sourceTypes: form.sourceTypes,
        operatingStates: form.operatingStates,
        monthlyVolume: form.monthlyVolume
      },
      operatorName: form.fullName,
      apiaryName: form.businessName,
      location: { state: form.baseState },
      mobile: form.mobile,
      verificationProfile: {
        primaryRole: 'DISTRIBUTOR',
        requiresRoleVerification: false,
        gstin: form.gstin || null,
        fssaiNumber: form.fssaiNumber || null,
        businessType: form.businessType
      }
    });
  };

  return (
    <div className="role-onboarding-screen dispatch-theme">
      {/* Step Progress */}
      <div className="ob-step-progress">
        {STEPS.map((s) => (
          <div
            key={s.id}
            className={`ob-step-dot dispatch-dot ${s.id === step ? 'active' : s.id < step ? 'done' : ''}`}
          />
        ))}
      </div>

      <div className="ob-step-label dispatch-label">
        <span className="ob-step-emoji">{STEPS[step - 1].icon}</span>
        <span className="ob-step-name">Step {step} of {STEPS.length} — {STEPS[step - 1].title}</span>
      </div>

      {/* ── STEP 1: About You ─────────────────────────────────────────────── */}
      {step === 1 && (
        <div className="ob-step-content fade-in">
          <h2 className="ob-step-question dispatch-accent">What's your name?</h2>
          <div className="ob-field-group">
            <label className="ob-field-label">Your full name</label>
            <input className="ob-field-input dispatch-input" type="text"
              placeholder="E.g. Vijay Mehta"
              value={form.fullName} onChange={e => update('fullName', e.target.value)} autoFocus />
          </div>
          <div className="ob-field-group">
            <label className="ob-field-label">Mobile number</label>
            <div className="ob-phone-row">
              <span className="ob-phone-prefix">+91</span>
              <input className="ob-field-input dispatch-input ob-phone-input" type="tel"
                placeholder="9876543210" maxLength={10}
                value={form.mobile} onChange={e => update('mobile', e.target.value.replace(/\D/g, ''))} />
            </div>
          </div>
        </div>
      )}

      {/* ── STEP 2: Business ──────────────────────────────────────────────── */}
      {step === 2 && (
        <div className="ob-step-content fade-in">
          <h2 className="ob-step-question dispatch-accent">Tell us about your business</h2>

          <div className="ob-field-group">
            <label className="ob-field-label">Business / company name</label>
            <input className="ob-field-input dispatch-input" type="text"
              placeholder="E.g. Mehta Honey Distributors"
              value={form.businessName} onChange={e => update('businessName', e.target.value)} />
          </div>

          <div className="ob-field-group">
            <label className="ob-field-label">Type of business</label>
            <div className="ob-option-grid-small">
              {BUSINESS_TYPES.map(bt => (
                <button key={bt.id} type="button"
                  className={`ob-option-card-sm ${form.businessType === bt.id ? 'selected-dispatch' : ''}`}
                  onClick={() => update('businessType', bt.id)}
                >
                  <span>{bt.emoji}</span>
                  <span className="ob-option-sm-label">{bt.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="ob-field-group">
            <label className="ob-field-label">Base state</label>
            <select className="ob-field-select dispatch-select" value={form.baseState}
              onChange={e => update('baseState', e.target.value)}>
              <option value="">Select state...</option>
              {STATES_OF_INDIA.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="ob-field-group">
            <label className="ob-field-label">GSTIN <span className="ob-optional">(if applicable)</span></label>
            <input className="ob-field-input dispatch-input" type="text"
              placeholder="22AAAAA0000A1Z5"
              value={form.gstin} onChange={e => update('gstin', e.target.value.toUpperCase())} />
          </div>

          <div className="ob-field-group">
            <label className="ob-field-label">FSSAI License number <span className="ob-optional">(if applicable)</span></label>
            <input className="ob-field-input dispatch-input" type="text"
              placeholder="14-digit FSSAI number"
              value={form.fssaiNumber} onChange={e => update('fssaiNumber', e.target.value)} />
          </div>
        </div>
      )}

      {/* ── STEP 3: Fleet / Movement ──────────────────────────────────────── */}
      {step === 3 && (
        <div className="ob-step-content fade-in">
          <h2 className="ob-step-question dispatch-accent">How do you move honey?</h2>

          <div className="ob-field-group">
            <label className="ob-field-label">Transport type</label>
            <div className="ob-option-grid">
              {FLEET_OPTIONS.map(opt => (
                <button key={opt.id} type="button"
                  className={`ob-option-card ${form.fleetType === opt.id ? 'selected-dispatch' : ''}`}
                  onClick={() => update('fleetType', opt.id)}
                >
                  <span className="ob-option-label">{opt.label}</span>
                  <span className="ob-option-desc">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {(form.fleetType === 'OWN_VEHICLE' || form.fleetType === 'HYBRID') && (
            <div className="ob-field-group">
              <label className="ob-field-label">Approximately how many vehicles? <span className="ob-optional">(optional)</span></label>
              <div className="ob-pill-row">
                {['1', '2–5', '5–20', '20+'].map(v => (
                  <button key={v} type="button"
                    className={`ob-pill-btn ${form.vehicleCount === v ? 'selected-dispatch' : ''}`}
                    onClick={() => update('vehicleCount', v)}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="ob-field-group">
            <label className="ob-field-label">How many states do you operate in? <span className="ob-optional">(optional)</span></label>
            <div className="ob-states-multi">
              {STATES_OF_INDIA.slice(0, 10).map(s => (
                <button key={s} type="button"
                  className={`ob-state-chip ${form.operatingStates.includes(s) ? 'selected-dispatch' : ''}`}
                  onClick={() => toggleItem('operatingStates', s)}
                >
                  {s}
                </button>
              ))}
              <span className="ob-states-hint">+ type more states in your profile after setup</span>
            </div>
          </div>

          {/* QR Validation notice — plant the concept early */}
          <div className="ob-dispatch-info-card">
            <Info size={14} />
            <div>
              <p className="ob-dispatch-info-title">About QR validation in HoneyChain</p>
              <p className="ob-dispatch-info-text">
                When you scan a package QR, HoneyChain tells you if it's a <strong>valid, registered QR</strong>.
                A valid QR does <em>not</em> automatically mean the honey is lab-certified.
                Quality certification is a separate lab process.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── STEP 4: Supply Chain ──────────────────────────────────────────── */}
      {step === 4 && (
        <div className="ob-step-content fade-in">
          <h2 className="ob-step-question dispatch-accent">Your supply chain</h2>

          <div className="ob-field-group">
            <label className="ob-field-label">Who do you buy honey from?</label>
            <p className="ob-field-sublabel">Select all that apply</p>
            <div className="ob-supply-grid">
              {SOURCE_TYPES.map(st => {
                const isSelected = form.sourceTypes.includes(st.id);
                return (
                  <button key={st.id} type="button"
                    className={`ob-supply-card ${isSelected ? 'selected-dispatch' : ''}`}
                    onClick={() => toggleItem('sourceTypes', st.id)}
                  >
                    <span>{st.emoji}</span>
                    <span className="ob-supply-label">{st.label}</span>
                    {isSelected && <Check size={12} strokeWidth={3} className="ob-supply-check" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="ob-field-group">
            <label className="ob-field-label">Who do you sell honey to?</label>
            <p className="ob-field-sublabel">Select all that apply</p>
            <div className="ob-supply-grid">
              {BUYER_TYPES.map(bt => {
                const isSelected = form.buyerTypes.includes(bt.id);
                return (
                  <button key={bt.id} type="button"
                    className={`ob-supply-card ${isSelected ? 'selected-dispatch' : ''}`}
                    onClick={() => toggleItem('buyerTypes', bt.id)}
                  >
                    <span>{bt.emoji}</span>
                    <span className="ob-supply-label">{bt.label}</span>
                    {isSelected && <Check size={12} strokeWidth={3} className="ob-supply-check" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="ob-field-group">
            <label className="ob-field-label">Monthly volume (approximate) <span className="ob-optional">(optional)</span></label>
            <div className="ob-pill-row">
              {['< 500 kg', '500 kg – 2 MT', '2–10 MT', '10–50 MT', '50+ MT'].map(v => (
                <button key={v} type="button"
                  className={`ob-pill-btn ${form.monthlyVolume === v ? 'selected-dispatch' : ''}`}
                  onClick={() => update('monthlyVolume', v)}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── STEP 5: All Set ───────────────────────────────────────────────── */}
      {step === 5 && (
        <div className="ob-step-content ob-final-screen fade-in">
          <div className="ob-final-icon">🚚</div>
          <h2 className="ob-final-title dispatch-accent">Ready, {form.fullName.split(' ')[0] || 'distributor'}!</h2>
          <p className="ob-final-subtitle">
            Your Dispatch workspace is set up. You can validate QR packages, create shipments, and track deliveries.
          </p>
          <div className="ob-summary-card dispatch-summary">
            <div className="ob-summary-row">
              <span className="ob-summary-label">👤 Name</span>
              <span className="ob-summary-value">{form.fullName}</span>
            </div>
            <div className="ob-summary-row">
              <span className="ob-summary-label">🏢 Business</span>
              <span className="ob-summary-value">{form.businessName}</span>
            </div>
            <div className="ob-summary-row">
              <span className="ob-summary-label">📍 Base</span>
              <span className="ob-summary-value">{form.baseState || '—'}</span>
            </div>
            <div className="ob-summary-row">
              <span className="ob-summary-label">🚚 Transport</span>
              <span className="ob-summary-value">{FLEET_OPTIONS.find(f => f.id === form.fleetType)?.label || '—'}</span>
            </div>
          </div>
          <div className="ob-dispatch-qr-reminder">
            <Info size={14} />
            <span>
              When you scan a package QR in HoneyChain, it confirms the QR is valid and registered.
              Quality certification is always shown separately.
            </span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="ob-nav-bar">
        <button type="button" className="ob-back-btn" onClick={handleBack}>
          <ArrowLeft size={16} />Back
        </button>
        {step < 5 ? (
          <button type="button"
            className={`ob-next-btn dispatch-accent-btn ${!canProceed() ? 'disabled' : ''}`}
            disabled={!canProceed()} onClick={handleNext}
          >
            Continue <ArrowRight size={16} />
          </button>
        ) : (
          <button type="button" className="ob-next-btn dispatch-accent-btn" onClick={handleComplete}>
            Open dispatch workspace <ArrowRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

export default DispatchOnboarding;
