import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  ArrowLeft,
  Check,
  MapPin,
  Sparkles,
  Info,
  ShieldCheck,
  Edit2,
  CheckCircle2,
  Languages,
  SlidersHorizontal,
  Inbox,
  Cpu,
  Send,
  Package,
  Layers
} from 'lucide-react';
import {
  CommonProcessorOnboardingService,
  SUPPORTED_LANGUAGES
} from '../../services/commonProcessorOnboardingService';
import './CommonProcessorOnboarding.css';

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

export const CommonProcessorOnboarding = ({
  initialData = {},
  onComplete,
  onCancel,
  onSwitchToAdvanced
}) => {
  // Load draft or default
  const savedDraft = CommonProcessorOnboardingService.loadDraft();

  const [lang, setLang] = useState(savedDraft?.lang || 'en');
  const [stage, setStage] = useState(savedDraft?.currentStep || 1); // 1 to 4: About, Sources, Process, Summary, 5: Ready
  const [answers, setAnswers] = useState(
    savedDraft?.answers || {
      ...CommonProcessorOnboardingService.getDefaultAnswers(),
      ...initialData
    }
  );

  const [locationAutoDetected, setLocationAutoDetected] = useState(false);

  // Helper for localization
  const t = (key) => CommonProcessorOnboardingService.t(key, lang);

  // Auto-save draft on changes (§41)
  useEffect(() => {
    CommonProcessorOnboardingService.saveDraft(answers, stage, lang);
  }, [answers, stage, lang]);

  // Answer updater
  const updateAnswer = (field, value) => {
    setAnswers(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const toggleArrayItem = (field, item) => {
    setAnswers(prev => {
      const current = prev[field] || [];
      if (item === 'NOT_SURE' || item === 'DONT_KNOW') {
        return current.includes(item) ? [] : [item];
      }
      const filtered = current.filter(x => x !== 'NOT_SURE' && x !== 'DONT_KNOW');
      return filtered.includes(item)
        ? filtered.filter(x => x !== item)
        : [...filtered, item];
    });
  };

  const handleUseLocation = () => {
    // Graceful GPS or state fallback
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => {
          updateAnswer('location', { state: 'Maharashtra', district: 'Pune', town: 'Hadapsar Agro Hub' });
          setLocationAutoDetected(true);
        },
        () => {
          updateAnswer('location', { state: 'Maharashtra', district: 'Pune', town: 'Hadapsar Agro Hub' });
          setLocationAutoDetected(true);
        },
        { timeout: 3000 }
      );
    } else {
      updateAnswer('location', { state: 'Maharashtra', district: 'Pune', town: 'Hadapsar Agro Hub' });
      setLocationAutoDetected(true);
    }
  };

  const handleFinish = () => {
    const authoritative = CommonProcessorOnboardingService.confirmAndSave(answers);
    if (onComplete) {
      onComplete({
        organization: authoritative.confirmedOrganization,
        facility: authoritative.confirmedFacility,
        capabilities: authoritative.confirmedCapabilities,
        workDescription: answers.activity,
        profileCode: authoritative.systemInterpretation.profileCode,
        rawAnswers: answers
      });
    }
  };

  const humanSummary = CommonProcessorOnboardingService.getHumanSummary(answers, lang);

  return (
    <div className="cproc-viewport">
      {/* 1. Header with Mode Badge & Language Switcher (§37) */}
      <div className="cproc-top-bar">
        <span className="cproc-mode-badge">
          <Sparkles size={13} />
          <span>{t('badge_simple_mode')}</span>
        </span>

        <div className="cproc-lang-pills">
          <Languages size={13} color="#7C6D5B" />
          {SUPPORTED_LANGUAGES.map(l => (
            <button
              key={l.code}
              type="button"
              className={`cproc-lang-btn ${lang === l.code ? 'active' : ''}`}
              onClick={() => setLang(l.code)}
            >
              {l.native}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Human Stage Progress Bar (§40) */}
      {stage <= 4 && (
        <div className="cproc-stages-track">
          <div className="cproc-track-line" />
          <div
            className={`cproc-stage-node ${stage === 1 ? 'active' : ''} ${stage > 1 ? 'completed' : ''}`}
            onClick={() => stage > 1 && setStage(1)}
          >
            <div className="cproc-node-dot" />
            <span className="cproc-node-label">{t('stage_about')}</span>
          </div>

          <div
            className={`cproc-stage-node ${stage === 2 ? 'active' : ''} ${stage > 2 ? 'completed' : ''}`}
            onClick={() => stage > 2 && setStage(2)}
          >
            <div className="cproc-node-dot" />
            <span className="cproc-node-label">{t('stage_sources')}</span>
          </div>

          <div
            className={`cproc-stage-node ${stage === 3 ? 'active' : ''} ${stage > 3 ? 'completed' : ''}`}
            onClick={() => stage > 3 && setStage(3)}
          >
            <div className="cproc-node-dot" />
            <span className="cproc-node-label">{t('stage_process')}</span>
          </div>

          <div
            className={`cproc-stage-node ${stage === 4 ? 'active' : ''}`}
          >
            <div className="cproc-node-dot" />
            <span className="cproc-node-label">{t('stage_summary')}</span>
          </div>
        </div>
      )}

      {/* =========================================================================
          STAGE 1: ABOUT YOU & YOUR WORKPLACE (§5, §6, §8, §9)
         ========================================================================= */}
      {stage === 1 && (
        <div className="cproc-stage-container" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Q1: What do you do with honey? */}
          <div className="cproc-q-block" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div className="cproc-q-header">
              <h2 className="cproc-q-title">{t('q1_title')}</h2>
              <p className="cproc-q-subtitle">{t('q1_subtitle')}</p>
            </div>

            <div className="cproc-options-grid">
              {[
                { id: 'PROCESS', label: t('q1_process'), sub: t('q1_process_sub') },
                { id: 'PACK', label: t('q1_pack'), sub: t('q1_pack_sub') },
                { id: 'DISTRIBUTE', label: t('q1_distribute'), sub: t('q1_distribute_sub') },
                { id: 'COLLECT', label: t('q1_collect'), sub: t('q1_collect_sub') },
                { id: 'TEST', label: t('q1_test'), sub: t('q1_test_sub') },
                { id: 'MANAGE', label: t('q1_manage'), sub: t('q1_manage_sub') }
              ].map(opt => (
                <div
                  key={opt.id}
                  className={`cproc-card-option ${answers.activity === opt.id ? 'selected' : ''}`}
                  onClick={() => updateAnswer('activity', opt.id)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="cproc-opt-left">
                    <div className="cproc-opt-info">
                      <span className="cproc-opt-label">{opt.label}</span>
                      <span className="cproc-opt-sub">{opt.sub}</span>
                    </div>
                  </div>
                  <div className={`cproc-radio-circle ${answers.activity === opt.id ? 'checked' : ''}`}>
                    {answers.activity === opt.id && <div className="cproc-radio-dot" />}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Q2: Where do you process honey? */}
          <div className="cproc-q-block" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div className="cproc-q-header">
              <h2 className="cproc-q-title">{t('q2_title')}</h2>
              <p className="cproc-q-subtitle">{t('q2_subtitle')}</p>
            </div>

            <div className="cproc-options-grid">
              {[
                { id: 'OWN_PLACE', label: t('q2_own_place'), sub: t('q2_own_place_sub') },
                { id: 'PROCESSING_UNIT', label: t('q2_processing_unit'), sub: t('q2_processing_unit_sub') },
                { id: 'COOPERATIVE', label: t('q2_cooperative'), sub: t('q2_cooperative_sub') },
                { id: 'COMPANY', label: t('q2_company'), sub: t('q2_company_sub') },
                { id: 'CONTRACT', label: t('q2_contract'), sub: t('q2_contract_sub') },
                { id: 'NOT_SURE', label: t('q2_not_sure'), sub: '' }
              ].map(opt => (
                <div
                  key={opt.id}
                  className={`cproc-card-option ${answers.workPlace === opt.id ? 'selected' : ''}`}
                  onClick={() => updateAnswer('workPlace', opt.id)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="cproc-opt-left">
                    <div className="cproc-opt-info">
                      <span className="cproc-opt-label">{opt.label}</span>
                      {opt.sub && <span className="cproc-opt-sub">{opt.sub}</span>}
                    </div>
                  </div>
                  <div className={`cproc-radio-circle ${answers.workPlace === opt.id ? 'checked' : ''}`}>
                    {answers.workPlace === opt.id && <div className="cproc-radio-dot" />}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Q3: Location (§8) */}
          <div className="cproc-q-block" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div className="cproc-q-header">
              <h2 className="cproc-q-title">{t('q3_title')}</h2>
              <p className="cproc-q-subtitle">{t('q3_subtitle')}</p>
            </div>

            <div className="cproc-loc-card">
              <button
                type="button"
                className="cproc-loc-autobtn"
                onClick={handleUseLocation}
              >
                <MapPin size={14} />
                <span>{locationAutoDetected ? t('q3_location_detected') : t('q3_use_location')}</span>
              </button>

              <div className="cproc-field-group">
                <label>{t('q3_state')}</label>
                <select
                  value={answers.location.state}
                  onChange={e => updateAnswer('location', { ...answers.location, state: e.target.value })}
                >
                  {INDIAN_STATES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="cproc-field-group">
                <label>{t('q3_district')}</label>
                <input
                  type="text"
                  value={answers.location.district}
                  onChange={e => updateAnswer('location', { ...answers.location, district: e.target.value })}
                  placeholder="e.g. Pune, Pulwama, The Nilgiris, Muzaffarpur"
                />
              </div>

              <div className="cproc-field-group">
                <label>{t('q3_town')}</label>
                <input
                  type="text"
                  value={answers.location.town}
                  onChange={e => updateAnswer('location', { ...answers.location, town: e.target.value })}
                  placeholder="e.g. Hadapsar, Pampore, Kotagiri"
                />
              </div>
            </div>
          </div>

          {/* Q4: Scale (§9) */}
          <div className="cproc-q-block" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div className="cproc-q-header">
              <h2 className="cproc-q-title">{t('q4_title')}</h2>
              <p className="cproc-q-subtitle">{t('q4_subtitle')}</p>
            </div>

            <div className="cproc-options-grid">
              {[
                { id: 'SMALL', label: t('q4_small'), sub: t('q4_small_sub') },
                { id: 'MEDIUM', label: t('q4_medium'), sub: t('q4_medium_sub') },
                { id: 'LARGE', label: t('q4_large'), sub: t('q4_large_sub') },
                { id: 'NOT_SURE', label: t('q4_not_sure'), sub: '' }
              ].map(opt => (
                <div
                  key={opt.id}
                  className={`cproc-card-option ${answers.scale === opt.id ? 'selected' : ''}`}
                  onClick={() => updateAnswer('scale', opt.id)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="cproc-opt-left">
                    <div className="cproc-opt-info">
                      <span className="cproc-opt-label">{opt.label}</span>
                      {opt.sub && <span className="cproc-opt-sub">{opt.sub}</span>}
                    </div>
                  </div>
                  <div className={`cproc-radio-circle ${answers.scale === opt.id ? 'checked' : ''}`}>
                    {answers.scale === opt.id && <div className="cproc-radio-dot" />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          STAGE 2: YOUR HONEY & SOURCES (§10, §11)
         ========================================================================= */}
      {stage === 2 && (
        <div className="cproc-stage-container" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Q5: Sources (§10) */}
          <div className="cproc-q-block" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div className="cproc-q-header">
              <h2 className="cproc-q-title">{t('q5_title')}</h2>
              <p className="cproc-q-subtitle">{t('q5_subtitle')}</p>
            </div>

            <div className="cproc-options-grid">
              {[
                { id: 'LOCAL_BEEKEEPERS', label: t('q5_local_beekeepers') },
                { id: 'OWN_HIVES', label: t('q5_own_hives') },
                { id: 'BEEKEEPER_GROUPS', label: t('q5_groups') },
                { id: 'OTHER_SUPPLIERS', label: t('q5_suppliers') },
                { id: 'VARIOUS', label: t('q5_various') },
                { id: 'NOT_SURE', label: t('q5_not_sure') }
              ].map(opt => {
                const isChecked = (answers.sources || []).includes(opt.id);
                return (
                  <div
                    key={opt.id}
                    className={`cproc-card-option ${isChecked ? 'selected' : ''}`}
                    onClick={() => toggleArrayItem('sources', opt.id)}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="cproc-opt-left">
                      <span className="cproc-opt-label">{opt.label}</span>
                    </div>
                    <div className={`cproc-checkbox ${isChecked ? 'checked' : ''}`}>
                      {isChecked && <Check size={14} color="#FFF" strokeWidth={3} />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Q6: Honey Types (§11) */}
          <div className="cproc-q-block" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div className="cproc-q-header">
              <h2 className="cproc-q-title">{t('q6_title')}</h2>
              <p className="cproc-q-subtitle">{t('q6_subtitle')}</p>
            </div>

            <div className="cproc-options-grid grid-2">
              {[
                { id: 'FLOWER_BLOSSOM', label: t('q6_flower') },
                { id: 'FOREST_WILD', label: t('q6_forest') },
                { id: 'MUSTARD', label: t('q6_mustard') },
                { id: 'EUCALYPTUS', label: t('q6_eucalyptus') },
                { id: 'LITCHI', label: t('q6_litchi') },
                { id: 'MULTIFLORAL', label: t('q6_mixed') },
                { id: 'NOT_SURE', label: t('q6_not_sure') }
              ].map(opt => {
                const isChecked = (answers.honeyTypes || []).includes(opt.id);
                return (
                  <div
                    key={opt.id}
                    className={`cproc-card-option ${isChecked ? 'selected' : ''}`}
                    onClick={() => toggleArrayItem('honeyTypes', opt.id)}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="cproc-opt-left">
                      <span className="cproc-opt-label">{opt.label}</span>
                    </div>
                    <div className={`cproc-checkbox ${isChecked ? 'checked' : ''}`}>
                      {isChecked && <Check size={14} color="#FFF" strokeWidth={3} />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          STAGE 3: YOUR PROCESS & TOOLS (§12, §13, §14, §16, §17, §18)
         ========================================================================= */}
      {stage === 3 && (
        <div className="cproc-stage-container" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Q7: What do you do after receiving? (§12) */}
          <div className="cproc-q-block" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div className="cproc-q-header">
              <h2 className="cproc-q-title">{t('q7_title')}</h2>
              <p className="cproc-q-subtitle">{t('q7_subtitle')}</p>
            </div>

            <div className="cproc-options-grid">
              {[
                { id: 'CHECK', label: t('q7_check') },
                { id: 'REMOVE_DEBRIS', label: t('q7_debris') },
                { id: 'FILTER', label: t('q7_filter') },
                { id: 'WARM', label: t('q7_warm') },
                { id: 'REDUCE_MOISTURE', label: t('q7_moisture') },
                { id: 'SETTLE', label: t('q7_settle') },
                { id: 'BLEND', label: t('q7_blend') },
                { id: 'PACK', label: t('q7_pack') },
                { id: 'STORE', label: t('q7_store') },
                { id: 'SOMETHING_ELSE', label: t('q7_something_else') }
              ].map(opt => {
                const isChecked = (answers.processActions || []).includes(opt.id);
                return (
                  <div
                    key={opt.id}
                    className={`cproc-card-option ${isChecked ? 'selected' : ''}`}
                    onClick={() => toggleArrayItem('processActions', opt.id)}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="cproc-opt-left">
                      <span className="cproc-opt-label">{opt.label}</span>
                    </div>
                    <div className={`cproc-checkbox ${isChecked ? 'checked' : ''}`}>
                      {isChecked && <Check size={14} color="#FFF" strokeWidth={3} />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Q8: Equipment (§13) */}
          <div className="cproc-q-block" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div className="cproc-q-header">
              <h2 className="cproc-q-title">{t('q8_title')}</h2>
              <p className="cproc-q-subtitle">{t('q8_subtitle')}</p>
            </div>

            <div className="cproc-options-grid grid-2">
              {[
                { id: 'STORAGE_TANK', label: t('q8_storage_tank') },
                { id: 'SETTLING_TANK', label: t('q8_settling_tank') },
                { id: 'FILTER', label: t('q8_filter') },
                { id: 'FINE_FILTER', label: t('q8_fine_filter') },
                { id: 'WARMING_EQUIPMENT', label: t('q8_warming') },
                { id: 'MOISTURE_DEVICE', label: t('q8_moisture_device') },
                { id: 'WEIGHING_SCALE', label: t('q8_weighing_scale') },
                { id: 'FILLING_MACHINE', label: t('q8_filling') },
                { id: 'SEALING_MACHINE', label: t('q8_sealing') },
                { id: 'DONT_KNOW', label: t('q8_not_sure') }
              ].map(opt => {
                const isChecked = (answers.equipment || []).includes(opt.id);
                return (
                  <div
                    key={opt.id}
                    className={`cproc-card-option ${isChecked ? 'selected' : ''}`}
                    onClick={() => toggleArrayItem('equipment', opt.id)}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="cproc-opt-left">
                      <span className="cproc-opt-label">{opt.label}</span>
                    </div>
                    <div className={`cproc-checkbox ${isChecked ? 'checked' : ''}`}>
                      {isChecked && <Check size={14} color="#FFF" strokeWidth={3} />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Q9: Existing Method (§14) */}
          <div className="cproc-q-block" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div className="cproc-q-header">
              <h2 className="cproc-q-title">{t('q9_title')}</h2>
              <p className="cproc-q-subtitle">{t('q9_subtitle')}</p>
            </div>

            <div className="cproc-options-grid">
              {[
                { id: 'OWN_METHOD', label: t('q9_own_method') },
                { id: 'WRITTEN_PROCEDURE', label: t('q9_written') },
                { id: 'EXPERT_ADVICE', label: t('q9_experienced') },
                { id: 'VARIABLE_METHOD', label: t('q9_depends') },
                { id: 'NO_FIXED_METHOD', label: t('q9_no_fixed') },
                { id: 'NOT_SURE', label: t('q9_not_sure') }
              ].map(opt => (
                <div
                  key={opt.id}
                  className={`cproc-card-option ${answers.method === opt.id ? 'selected' : ''}`}
                  onClick={() => updateAnswer('method', opt.id)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="cproc-opt-left">
                    <span className="cproc-opt-label">{opt.label}</span>
                  </div>
                  <div className={`cproc-radio-circle ${answers.method === opt.id ? 'checked' : ''}`}>
                    {answers.method === opt.id && <div className="cproc-radio-dot" />}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Q10: Quality Check (§16) */}
          <div className="cproc-q-block" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div className="cproc-q-header">
              <h2 className="cproc-q-title">{t('q10_title')}</h2>
              <p className="cproc-q-subtitle">{t('q10_subtitle')}</p>
            </div>

            <div className="cproc-options-grid">
              {[
                { id: 'OWN_CHECKS', label: t('q10_own_checks') },
                { id: 'LAB_TESTS', label: t('q10_lab_tests') },
                { id: 'BOTH', label: t('q10_both') },
                { id: 'SOMETIMES', label: t('q10_sometimes') },
                { id: 'NO', label: t('q10_no') },
                { id: 'NOT_SURE', label: t('q10_not_sure') }
              ].map(opt => (
                <div
                  key={opt.id}
                  className={`cproc-card-option ${answers.qualityCheck === opt.id ? 'selected' : ''}`}
                  onClick={() => updateAnswer('qualityCheck', opt.id)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="cproc-opt-left">
                    <span className="cproc-opt-label">{opt.label}</span>
                  </div>
                  <div className={`cproc-radio-circle ${answers.qualityCheck === opt.id ? 'checked' : ''}`}>
                    {answers.qualityCheck === opt.id && <div className="cproc-radio-dot" />}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Q11: Packaging (§17) */}
          <div className="cproc-q-block" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div className="cproc-q-header">
              <h2 className="cproc-q-title">{t('q11_title')}</h2>
              <p className="cproc-q-subtitle">{t('q11_subtitle')}</p>
            </div>

            <div className="cproc-options-grid">
              {[
                { id: 'BOTTLES', label: t('q11_bottles') },
                { id: 'BULK', label: t('q11_bulk') },
                { id: 'BOTH', label: t('q11_both') },
                { id: 'SEND_TO_ANOTHER', label: t('q11_send_another') },
                { id: 'NOT_SURE', label: t('q11_not_sure') }
              ].map(opt => (
                <div
                  key={opt.id}
                  className={`cproc-card-option ${answers.packaging === opt.id ? 'selected' : ''}`}
                  onClick={() => updateAnswer('packaging', opt.id)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="cproc-opt-left">
                    <span className="cproc-opt-label">{opt.label}</span>
                  </div>
                  <div className={`cproc-radio-circle ${answers.packaging === opt.id ? 'checked' : ''}`}>
                    {answers.packaging === opt.id && <div className="cproc-radio-dot" />}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Q12: Market (§18) */}
          <div className="cproc-q-block" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div className="cproc-q-header">
              <h2 className="cproc-q-title">{t('q12_title')}</h2>
              <p className="cproc-q-subtitle">{t('q12_subtitle')}</p>
            </div>

            <div className="cproc-options-grid">
              {[
                { id: 'LOCAL', label: t('q12_local') },
                { id: 'RETAIL', label: t('q12_retail') },
                { id: 'BUSINESSES', label: t('q12_businesses') },
                { id: 'DISTRIBUTORS', label: t('q12_distributors') },
                { id: 'EXPORT', label: t('q12_export') },
                { id: 'VARIOUS', label: t('q12_various') },
                { id: 'NOT_SURE', label: t('q12_not_sure') }
              ].map(opt => (
                <div
                  key={opt.id}
                  className={`cproc-card-option ${answers.market === opt.id ? 'selected' : ''}`}
                  onClick={() => updateAnswer('market', opt.id)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="cproc-opt-left">
                    <span className="cproc-opt-label">{opt.label}</span>
                  </div>
                  <div className={`cproc-radio-circle ${answers.market === opt.id ? 'checked' : ''}`}>
                    {answers.market === opt.id && <div className="cproc-radio-dot" />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          STAGE 4: "HERE'S WHAT HONEYCHAIN UNDERSTOOD" (§19, §20)
         ========================================================================= */}
      {stage === 4 && (
        <div className="cproc-stage-container" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="cproc-q-header">
            <h2 className="cproc-q-title">{t('summary_title')}</h2>
            <p className="cproc-q-subtitle">{t('summary_subtitle')}</p>
          </div>

          <div className="cproc-summary-card">
            <div className="cproc-sum-section">
              <span className="cproc-sum-label">{t('summary_your_work')}</span>
              <span className="cproc-sum-value">{humanSummary.work} · {humanSummary.scale}</span>
            </div>

            <div className="cproc-sum-divider" />

            <div className="cproc-sum-section">
              <span className="cproc-sum-label">{t('summary_your_setup')}</span>
              <span className="cproc-sum-value">{humanSummary.setup}</span>
            </div>

            <div className="cproc-sum-divider" />

            <div className="cproc-sum-section">
              <span className="cproc-sum-label">{t('summary_your_sources')}</span>
              <span className="cproc-sum-value">{humanSummary.sources}</span>
            </div>

            <div className="cproc-sum-divider" />

            <div className="cproc-sum-section">
              <span className="cproc-sum-label">{t('summary_your_process')}</span>
              <span className="cproc-sum-value" style={{ color: 'var(--color-primary-honey, #D97706)' }}>
                {humanSummary.processFlow}
              </span>
            </div>

            <div className="cproc-sum-divider" />

            <div className="cproc-sum-section">
              <span className="cproc-sum-label">{t('summary_your_equipment')}</span>
              <span className="cproc-sum-value">{humanSummary.equipment}</span>
            </div>

            <div className="cproc-sum-divider" />

            <div className="cproc-sum-section">
              <span className="cproc-sum-label">{t('summary_your_quality')}</span>
              <span className="cproc-sum-value">{humanSummary.quality}</span>
            </div>

            <div className="cproc-sum-divider" />

            <div className="cproc-sum-section">
              <span className="cproc-sum-label">{t('summary_your_market')}</span>
              <span className="cproc-sum-value">{humanSummary.market}</span>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          STAGE 5: READY SCREEN & TASK ORIENTED WORKSPACE (§30, §48)
         ========================================================================= */}
      {stage === 5 && (
        <div className="cproc-stage-container" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="cproc-q-header text-center" style={{ textAlign: 'center', alignItems: 'center' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: '#DEF7EC',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '10px'
            }}>
              <Check size={36} color="var(--color-healthy, #10B981)" strokeWidth={2.6} />
            </div>
            <h2 className="cproc-q-title">{t('ready_title')}</h2>
            <p className="cproc-q-subtitle">{t('ready_subtitle')}</p>
          </div>

          <div className="cproc-ready-tasks">
            <div className="cproc-task-item">
              <div className="cproc-task-icon-box">🍯</div>
              <div className="cproc-task-details">
                <span className="cproc-task-title">Receive Honey</span>
                <span className="cproc-task-desc">Record incoming honey deliveries and check lot weights</span>
              </div>
            </div>

            <div className="cproc-task-item">
              <div className="cproc-task-icon-box">⚙️</div>
              <div className="cproc-task-details">
                <span className="cproc-task-title">Start Processing</span>
                <span className="cproc-task-desc">Execute your routine steps: {humanSummary.processFlow}</span>
              </div>
            </div>

            <div className="cproc-task-item">
              <div className="cproc-task-icon-box">🔬</div>
              <div className="cproc-task-details">
                <span className="cproc-task-title">Send for Testing</span>
                <span className="cproc-task-desc">Coordinate sample collection and verify purity compliance</span>
              </div>
            </div>

            <div className="cproc-task-item">
              <div className="cproc-task-icon-box">📦</div>
              <div className="cproc-task-details">
                <span className="cproc-task-title">Prepare for Packing</span>
                <span className="cproc-task-desc">Fill retail jars or bulk drums with digital batch tags</span>
              </div>
            </div>

            <div className="cproc-task-item">
              <div className="cproc-task-icon-box">📋</div>
              <div className="cproc-task-details">
                <span className="cproc-task-title">View My Batches</span>
                <span className="cproc-task-desc">Monitor live tank status, lineage, and compliance certificates</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          BOTTOM DOCK ACTIONS (§27, §47)
         ========================================================================= */}
      <div className="cproc-bottom-dock">
        <div className="cproc-action-row">
          {stage > 1 && stage < 5 && (
            <button
              type="button"
              className="cproc-btn-secondary"
              onClick={() => setStage(prev => prev - 1)}
            >
              <ArrowLeft size={16} />
              <span>{t('btn_back')}</span>
            </button>
          )}

          {stage < 4 && (
            <button
              type="button"
              className="cproc-btn-primary"
              onClick={() => setStage(prev => prev + 1)}
            >
              <span>{t('btn_continue')}</span>
              <ArrowRight size={16} />
            </button>
          )}

          {stage === 4 && (
            <>
              <button
                type="button"
                className="cproc-btn-secondary"
                onClick={() => setStage(1)}
              >
                <Edit2 size={15} />
                <span>{t('btn_change')}</span>
              </button>
              <button
                type="button"
                className="cproc-btn-primary"
                onClick={() => setStage(5)}
              >
                <CheckCircle2 size={18} />
                <span>{t('btn_looks_right')}</span>
              </button>
            </>
          )}

          {stage === 5 && (
            <button
              type="button"
              className="cproc-btn-primary"
              onClick={handleFinish}
            >
              <span>{t('btn_confirm')}</span>
              <ArrowRight size={18} />
            </button>
          )}
        </div>

        {/* Optional Skip or Advanced Switch (§27, §28, §49) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {stage < 4 && (
            <button
              type="button"
              className="cproc-btn-text"
              onClick={() => setStage(prev => prev + 1)}
            >
              {t('btn_skip')}
            </button>
          )}
          {onSwitchToAdvanced && (
            <button
              type="button"
              className="cproc-btn-text"
              onClick={onSwitchToAdvanced}
            >
              <SlidersHorizontal size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
              <span>{t('btn_advanced_switch')}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommonProcessorOnboarding;
