import React, { useState } from 'react';
import { 
  X, 
  Check, 
  FlaskConical, 
  Building2, 
  UserCheck, 
  FileText, 
  ShieldCheck, 
  Award, 
  Cpu, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft,
  AlertCircle
} from 'lucide-react';
import { LabRegistrationService, LAB_TYPES, LAB_ROLES } from '../../services/labRegistrationService';

export const LabRegistrationModal = ({
  isOpen,
  onClose,
  onComplete,
  showToast
}) => {
  if (!isOpen) return null;

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Lab Identity
    labName: '',
    labType: 'FOOD_TESTING_LAB',
    
    // Step 2: Lab Organization
    legalEntityName: '',
    contactPerson: '',
    officialEmail: '',
    contactPhone: '',
    website: '',
    address: '',
    state: 'Tamil Nadu',
    district: 'Chennai',
    pinCode: '600032',
    
    // Step 3: Responsible Persons
    responsiblePersons: [
      { name: '', role: 'TECHNICAL_MANAGER', email: '' }
    ],
    
    // Step 4: Documents checklist
    uploadedDocs: {},
    
    // Step 5: NABL Accreditation
    accreditationStatus: 'ACCREDITED',
    accreditationBody: 'NABL',
    accreditationNumber: 'TC-8841',
    accreditationExpiry: '2027-12-31',
    testMethods: ['MOISTURE', 'HMF', 'DIASTASE', 'ELECTRICAL_CONDUCTIVITY', 'POLLEN'],
    
    // Step 6: Regulatory Status
    fssaiStatus: 'SUBMITTED',
    fssaiRef: 'FL-2026-TN-09',
    fssaiRecognitionDate: '2026-01-15',
    fssaiValidUntil: '2028-01-14',
    
    // Step 7: Facilities
    facilities: ['Sample Intake & Inspection Room', 'Analytical Chemistry Room', 'Spectrophotometry Bay', 'Controlled Sample Storage (4-8°C)'],
    
    // Step 8: Initial Equipment
    equipment: ['EQ-REFR-01', 'EQ-SPEC-02', 'EQ-COND-01', 'EQ-MICR-03']
  });

  const [validationError, setValidationError] = useState(null);

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setValidationError(null);
  };

  const handleNext = () => {
    if (step === 1) {
      if (!formData.labName.trim()) {
        setValidationError('Laboratory name is required.');
        return;
      }
    }
    if (step === 2) {
      if (!formData.officialEmail.includes('@') || !formData.contactPhone.trim()) {
        setValidationError('Valid official email and contact telephone are required.');
        return;
      }
    }
    setStep(prev => Math.min(prev + 1, 6));
  };

  const handleBack = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const result = LabRegistrationService.submitRegistration(formData);
    if (!result.success) {
      setValidationError(result.errors.join(', '));
      return;
    }

    if (onComplete) {
      onComplete(result.registrationRecord);
    }
    if (showToast) {
      showToast(result.message);
    }
    onClose();
  };

  return (
    <div 
      className="modal-overlay"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.7)',
        backdropFilter: 'blur(5px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={onClose}
    >
      <div 
        className="card modal-content"
        style={{
          width: '100%',
          maxWidth: '680px',
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)',
          border: '1px solid #CBD5E1',
          maxHeight: '90vh',
          overflowY: 'auto',
          color: '#0F172A',
          fontFamily: "'Inter', -apple-system, sans-serif"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #E2E8F0', paddingBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div 
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: '#EFF6FF',
                color: '#1D4ED8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <FlaskConical size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: '#0F172A' }}>
                Controlled Laboratory Registration
              </h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748B' }}>
                ISO/IEC 17025 & FSSAI InFoLNeT Laboratory Accessioning Workflow
              </p>
            </div>
          </div>
          <button 
            className="btn btn-secondary btn-sm"
            onClick={onClose}
            style={{ borderRadius: '50%', width: '32px', height: '32px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderColor: '#E2E8F0' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Step Progress Indicators */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '20px' }}>
          {[
            { n: 1, label: 'Identity' },
            { n: 2, label: 'Organization' },
            { n: 3, label: 'Accreditation' },
            { n: 4, label: 'Regulatory' },
            { n: 5, label: 'Facility & Equipment' },
            { n: 6, label: 'Verification' }
          ].map(s => (
            <div 
              key={s.n}
              style={{
                flex: 1,
                padding: '6px',
                borderRadius: '6px',
                backgroundColor: step === s.n ? '#1D4ED8' : (step > s.n ? '#F0FDF4' : '#F1F5F9'),
                color: step === s.n ? '#FFFFFF' : (step > s.n ? '#15803D' : '#64748B'),
                textAlign: 'center',
                fontSize: '11px',
                fontWeight: 600,
                transition: 'all 0.15s ease'
              }}
            >
              {s.n}. {s.label}
            </div>
          ))}
        </div>

        {validationError && (
          <div style={{ padding: '10px 14px', borderRadius: '8px', backgroundColor: '#FEF2F2', border: '1px solid #FECACA', color: '#B91C1C', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <AlertCircle size={16} />
            <span>{validationError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* STEP 1: LAB IDENTITY (§4) */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  What's your laboratory called?
                </label>
                <input 
                  type="text"
                  placeholder="e.g. Apex Honey Analytical Testing Laboratory"
                  value={formData.labName}
                  onChange={(e) => updateField('labName', e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  What type of laboratory is this? (§4)
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {LAB_TYPES.map(type => (
                    <div 
                      key={type.id}
                      onClick={() => updateField('labType', type.id)}
                      style={{
                        padding: '12px',
                        borderRadius: '10px',
                        border: formData.labType === type.id ? '2px solid #1D4ED8' : '1px solid #E2E8F0',
                        backgroundColor: formData.labType === type.id ? '#EFF6FF' : '#F8FAFC',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{ fontWeight: 600, fontSize: '13px', color: '#0F172A' }}>{type.label}</div>
                      <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>{type.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: LAB ORGANIZATION (§5, §6) */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                    Legal Registered Organization
                  </label>
                  <input 
                    type="text"
                    placeholder="e.g. Apex Analytical Diagnostics Pvt Ltd"
                    value={formData.legalEntityName}
                    onChange={(e) => updateField('legalEntityName', e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                    Lead Technical Contact Person
                  </label>
                  <input 
                    type="text"
                    placeholder="e.g. Dr. Elena Vance"
                    value={formData.contactPerson}
                    onChange={(e) => updateField('contactPerson', e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                    Official Laboratory Email
                  </label>
                  <input 
                    type="email"
                    placeholder="lab@apexanalysis.org"
                    value={formData.officialEmail}
                    onChange={(e) => updateField('officialEmail', e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                    Direct Contact Phone
                  </label>
                  <input 
                    type="tel"
                    placeholder="+91 44 2839 0041"
                    value={formData.contactPhone}
                    onChange={(e) => updateField('contactPhone', e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Laboratory Physical Address
                </label>
                <input 
                  type="text"
                  placeholder="Plot 42, Analytical Science Park, Guindy"
                  value={formData.address}
                  onChange={(e) => updateField('address', e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                    State
                  </label>
                  <input 
                    type="text"
                    value={formData.state}
                    onChange={(e) => updateField('state', e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                    District
                  </label>
                  <input 
                    type="text"
                    value={formData.district}
                    onChange={(e) => updateField('district', e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                    PIN Code
                  </label>
                  <input 
                    type="text"
                    value={formData.pinCode}
                    onChange={(e) => updateField('pinCode', e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1' }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: ACCREDITATION & SCOPE MATRIX (§8, §9) */}
          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Are you accredited under ISO/IEC 17025? (§8)
                </label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {[
                    { id: 'ACCREDITED', label: 'Accredited (NABL)' },
                    { id: 'APPLICATION_IN_PROGRESS', label: 'Application in Progress' },
                    { id: 'NOT_YET', label: 'Not Accredited' }
                  ].map(opt => (
                    <button
                      type="button"
                      key={opt.id}
                      onClick={() => updateField('accreditationStatus', opt.id)}
                      style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: '8px',
                        border: formData.accreditationStatus === opt.id ? '2px solid #1D4ED8' : '1px solid #CBD5E1',
                        backgroundColor: formData.accreditationStatus === opt.id ? '#EFF6FF' : '#FFFFFF',
                        fontWeight: 600,
                        fontSize: '12px',
                        color: formData.accreditationStatus === opt.id ? '#1D4ED8' : '#334155'
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {formData.accreditationStatus === 'ACCREDITED' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', padding: '12px', backgroundColor: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                      NABL Certificate / Scope Number
                    </label>
                    <input 
                      type="text"
                      placeholder="TC-8841"
                      value={formData.accreditationNumber}
                      onChange={(e) => updateField('accreditationNumber', e.target.value)}
                      style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid #CBD5E1' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                      Certificate Valid Until
                    </label>
                    <input 
                      type="date"
                      value={formData.accreditationExpiry}
                      onChange={(e) => updateField('accreditationExpiry', e.target.value)}
                      style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid #CBD5E1' }}
                    />
                  </div>
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Accreditation Scope Matrix (§9: Check only methods included in your scope)
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {[
                    { key: 'MOISTURE', label: 'Moisture (AOAC 969.38)', cat: 'Physical' },
                    { key: 'HMF', label: 'HMF (Winkler Spectrophotometry)', cat: 'Chemical' },
                    { key: 'DIASTASE', label: 'Diastase Enzyme (Phadebas Assay)', cat: 'Chemical' },
                    { key: 'ELECTRICAL_CONDUCTIVITY', label: 'Electrical Conductivity', cat: 'Physical' },
                    { key: 'POLLEN', label: 'Pollen Spectrum Melissopalynology', cat: 'Microscopical' },
                    { key: 'C4_SUGARS', label: 'C4 Sugar Stable Isotopes (EA-IRMS)', cat: 'Adulteration' }
                  ].map(m => {
                    const isChecked = formData.testMethods.includes(m.key);
                    return (
                      <label 
                        key={m.key}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 12px',
                          backgroundColor: isChecked ? '#EFF6FF' : '#F8FAFC',
                          borderRadius: '8px',
                          border: isChecked ? '1px solid #BFDBFE' : '1px solid #E2E8F0',
                          cursor: 'pointer'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <input 
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                updateField('testMethods', [...formData.testMethods, m.key]);
                              } else {
                                updateField('testMethods', formData.testMethods.filter(k => k !== m.key));
                              }
                            }}
                            style={{ accentColor: '#1D4ED8' }}
                          />
                          <span style={{ fontSize: '13px', fontWeight: 500, color: '#0F172A' }}>{m.label}</span>
                        </div>
                        <span style={{ fontSize: '11px', color: '#64748B' }}>{m.cat}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: FSSAI REGULATORY STATUS (§10, §11) */}
          {step === 4 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  FSSAI InFoLNeT Laboratory Recognition Standing (§10)
                </label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {[
                    { id: 'SUBMITTED', label: 'Recognized / Notified' },
                    { id: 'UNDER_REVIEW', label: 'Under Review' },
                    { id: 'PREPARING', label: 'Preparing Submission' },
                    { id: 'NOT_SUBMITTED', label: 'Not Submitted' }
                  ].map(opt => (
                    <button
                      type="button"
                      key={opt.id}
                      onClick={() => updateField('fssaiStatus', opt.id)}
                      style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: '8px',
                        border: formData.fssaiStatus === opt.id ? '2px solid #1D4ED8' : '1px solid #CBD5E1',
                        backgroundColor: formData.fssaiStatus === opt.id ? '#EFF6FF' : '#FFFFFF',
                        fontWeight: 600,
                        fontSize: '12px',
                        color: formData.fssaiStatus === opt.id ? '#1D4ED8' : '#334155'
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ padding: '14px', backgroundColor: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                    InFoLNeT / Gazette Recognition Reference
                  </label>
                  <input 
                    type="text"
                    placeholder="FL-2026-TN-09"
                    value={formData.fssaiRef}
                    onChange={(e) => updateField('fssaiRef', e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                      Recognition Date
                    </label>
                    <input 
                      type="date"
                      value={formData.fssaiRecognitionDate}
                      onChange={(e) => updateField('fssaiRecognitionDate', e.target.value)}
                      style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid #CBD5E1' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                      Valid Until
                    </label>
                    <input 
                      type="date"
                      value={formData.fssaiValidUntil}
                      onChange={(e) => updateField('fssaiValidUntil', e.target.value)}
                      style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid #CBD5E1' }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ fontSize: '12px', color: '#64748B', lineHeight: '1.5' }}>
                Note: HoneyChain verifies regulatory identifiers directly through official gazette lists. Never enter unauthoritative or provisional claims.
              </div>
            </div>
          )}

          {/* STEP 5: FACILITY & EQUIPMENT (§12, §13) */}
          {step === 5 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Controlled Laboratory Environments (§12)
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {[
                    'Sample Intake & Receiving Bay',
                    'Physical Refractometry Bench',
                    'Spectrophotometry Dark Room',
                    'Microbiology Class II Biosafety',
                    'Melissopalynology Optical Lab',
                    'Cold Sample Storage (4°C)'
                  ].map(fac => (
                    <div 
                      key={fac}
                      style={{ padding: '8px 10px', backgroundColor: '#F8FAFC', borderRadius: '6px', border: '1px solid #E2E8F0', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Check size={14} color="#15803D" />
                      <span>{fac}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Calibrated Analytical Instruments (§13)
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {[
                    { id: 'EQ-REFR-01', name: 'Atago PAL-22S Refractometer', cal: '20-Oct-2026' },
                    { id: 'EQ-SPEC-02', name: 'Shimadzu UV-1800 Dual-Beam Spectrophotometer', cal: '18-Oct-2026' },
                    { id: 'EQ-COND-01', name: 'Hanna HI-98311 Conductivity Tester', cal: '22-Oct-2026' },
                    { id: 'EQ-MICR-03', name: 'Olympus CX33 Trinocular Microscope', cal: '15-Oct-2026' }
                  ].map(eq => (
                    <div 
                      key={eq.id}
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px' }}
                    >
                      <div>
                        <strong>{eq.name}</strong>
                        <div style={{ fontSize: '11px', color: '#64748B' }}>ID: {eq.id} • Calibrated</div>
                      </div>
                      <span style={{ fontSize: '11px', color: '#15803D', fontWeight: 600 }}>Next Due: {eq.cal}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: VERIFICATION SUMMARY (§3, §14) */}
          {step === 6 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ padding: '16px', borderRadius: '10px', backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <ShieldCheck size={20} color="#1D4ED8" />
                  <strong style={{ fontSize: '15px', color: '#1E3A8A' }}>Review & Submit Registration</strong>
                </div>
                <div style={{ fontSize: '13px', color: '#3B82F6', lineHeight: '1.5' }}>
                  Your laboratory accession dossier will be placed under controlled technical review. Full laboratory capabilities will activate upon credential verification.
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '6px' }}>
                  <span style={{ color: '#64748B' }}>Laboratory Name</span>
                  <strong>{formData.labName || 'Apex Honey Analytical Laboratory'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '6px' }}>
                  <span style={{ color: '#64748B' }}>Laboratory Type</span>
                  <strong>{formData.labType}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '6px' }}>
                  <span style={{ color: '#64748B' }}>NABL Accreditation</span>
                  <strong style={{ color: '#15803D' }}>{formData.accreditationNumber} (Scope: {formData.testMethods.length} Methods)</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748B' }}>FSSAI Standing</span>
                  <strong>{formData.fssaiRef || 'FL-2026-TN-09'}</strong>
                </div>
              </div>
            </div>
          )}

          {/* Modal Actions */}
          <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #E2E8F0', paddingTop: '16px' }}>
            {step > 1 ? (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleBack}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <ArrowLeft size={14} /> Back
              </button>
            ) : <div />}

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
              >
                Cancel
              </button>

              {step < 6 ? (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleNext}
                  style={{ backgroundColor: '#1D4ED8', borderColor: '#1D4ED8', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  Continue <ArrowRight size={14} />
                </button>
              ) : (
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ backgroundColor: '#1D4ED8', borderColor: '#1D4ED8', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <ShieldCheck size={16} /> Submit Laboratory Registration
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
