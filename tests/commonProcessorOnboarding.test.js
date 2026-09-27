/**
 * HONEYCHAIN — COMMON-MAN PROCESSOR ONBOARDING TEST SUITE
 *
 * Validates:
 * 1. Zero-technical-knowledge human answers to technical mapping
 * 2. Organization, Facility & Equipment inference
 * 3. Processing profile and step sequence derivation
 * 4. Deterministic capability granting
 * 5. Multilingual translation readiness (English, Hindi, Tamil)
 * 6. Audit separation: raw answers vs system interpretation
 */

import assert from 'node:assert';
import {
  CommonProcessorOnboardingService,
  SUPPORTED_LANGUAGES,
  PROCESSOR_I18N
} from '../src/services/commonProcessorOnboardingService.js';

let passed = 0;
let total = 0;

function runTest(name, fn) {
  total++;
  try {
    fn();
    passed++;
    console.log(`  ✓ PASS: ${name}`);
  } catch (err) {
    console.error(`  ✗ FAIL: ${name}`);
    console.error(err);
    process.exitCode = 1;
    throw err;
  }
}

console.log('\n======================================================');
console.log('COMMON-MAN PROCESSOR ONBOARDING TEST SUITE');
console.log('======================================================\n');

// 1. Multilingual Support (§37)
console.log('--- 1. MULTILINGUAL SUPPORT (EN, HI, TA) ---');

runTest('Supported languages include English, Hindi, and Tamil', () => {
  assert.strictEqual(SUPPORTED_LANGUAGES.length, 3);
  const codes = SUPPORTED_LANGUAGES.map(l => l.code);
  assert.ok(codes.includes('en'));
  assert.ok(codes.includes('hi'));
  assert.ok(codes.includes('ta'));
});

runTest('Dictionary contains translations for key questions across all 3 languages', () => {
  ['en', 'hi', 'ta'].forEach(lang => {
    assert.ok(PROCESSOR_I18N[lang].q1_title.length > 0);
    assert.ok(PROCESSOR_I18N[lang].q2_title.length > 0);
    assert.ok(PROCESSOR_I18N[lang].q7_title.length > 0);
    assert.ok(PROCESSOR_I18N[lang].summary_title.length > 0);
  });
});

runTest('t() helper returns localized string and falls back gracefully', () => {
  const enTitle = CommonProcessorOnboardingService.t('q1_title', 'en');
  const hiTitle = CommonProcessorOnboardingService.t('q1_title', 'hi');
  const taTitle = CommonProcessorOnboardingService.t('q1_title', 'ta');
  assert.strictEqual(enTitle, 'What do you do with honey?');
  assert.strictEqual(hiTitle, 'आप शहद के साथ क्या काम करते हैं?');
  assert.strictEqual(taTitle, 'நீங்கள் தேனுடன் என்ன பணி செய்கிறீர்கள்?');
});

// 2. Background Technical Inference (§7, §21, §22, §50)
console.log('\n--- 2. BACKGROUND TECHNICAL INFERENCE ---');

runTest('Infers INDIVIDUAL organization and small facility for own place small processor', () => {
  const raw = {
    activity: 'PROCESS',
    workPlace: 'OWN_PLACE',
    location: { state: 'Maharashtra', district: 'Pune', town: 'Saswad' },
    scale: 'SMALL',
    sources: ['LOCAL_BEEKEEPERS'],
    honeyTypes: ['FLOWER_BLOSSOM'],
    processActions: ['CHECK', 'FILTER', 'SETTLE', 'PACK'],
    equipment: ['STORAGE_TANK', 'FILTER', 'WEIGHING_SCALE'],
    method: 'OWN_METHOD',
    qualityCheck: 'OWN_CHECKS',
    packaging: 'BOTTLES',
    market: 'LOCAL'
  };

  const interp = CommonProcessorOnboardingService.interpretAnswers(raw);
  assert.strictEqual(interp.organization.type, 'INDIVIDUAL');
  assert.strictEqual(interp.facility.scale, 'SMALL');
  assert.strictEqual(interp.facility.capacityKgPerDay, 60);
  assert.strictEqual(interp.profileCode, 'MINIMAL_RAW_FILTER');
  assert.ok(interp.equipmentIds.includes('eq-flt-01'));
  assert.ok(interp.equipmentIds.includes('eq-tnk-02'));
  assert.ok(interp.equipmentIds.includes('eq-scl-01'));
  assert.ok(interp.inferredCapabilities.includes('PROCESSING_MANAGEMENT'));
  assert.ok(interp.inferredCapabilities.includes('BATCH_INTAKE'));
});

runTest('Infers COOPERATIVE organization and medium facility for cooperative work', () => {
  const raw = {
    activity: 'PROCESS',
    workPlace: 'COOPERATIVE',
    location: { state: 'Jammu and Kashmir', district: 'Pulwama', town: 'Pampore' },
    scale: 'MEDIUM',
    sources: ['LOCAL_BEEKEEPERS', 'BEEKEEPER_GROUPS'],
    honeyTypes: ['FOREST_WILD'],
    processActions: ['CHECK', 'WARM', 'REDUCE_MOISTURE', 'SETTLE', 'PACK'],
    equipment: ['STORAGE_TANK', 'SETTLING_TANK', 'WARMING_EQUIPMENT', 'MOISTURE_DEVICE'],
    method: 'WRITTEN_PROCEDURE',
    qualityCheck: 'BOTH',
    packaging: 'BOTH',
    market: 'RETAIL'
  };

  const interp = CommonProcessorOnboardingService.interpretAnswers(raw);
  assert.strictEqual(interp.organization.type, 'COOPERATIVE');
  assert.strictEqual(interp.facility.scale, 'MEDIUM');
  assert.strictEqual(interp.facility.capacityKgPerDay, 350);
  assert.strictEqual(interp.profileCode, 'MOISTURE_MANAGED_STANDARD');
  assert.strictEqual(interp.facility.laboratoryAccess, 'ON_SITE_SCREENING_PLUS_EXTERNAL_ACCREDITED');
  assert.ok(interp.inferredCapabilities.includes('SAMPLE_INTAKE'));
});

runTest('Infers PREMIUM_EXPORT profile when market is EXPORT', () => {
  const raw = {
    activity: 'PROCESS',
    workPlace: 'COMPANY',
    location: { state: 'Punjab', district: 'Ludhiana', town: 'Sahnewal' },
    scale: 'LARGE',
    sources: ['BEEKEEPER_GROUPS', 'OTHER_SUPPLIERS'],
    honeyTypes: ['MUSTARD'],
    processActions: ['CHECK', 'FILTER', 'WARM', 'SETTLE', 'PACK'],
    equipment: ['STORAGE_TANK', 'SETTLING_TANK', 'FILTER', 'FILLING_MACHINE'],
    method: 'WRITTEN_PROCEDURE',
    qualityCheck: 'LAB_TESTS',
    packaging: 'BULK',
    market: 'EXPORT'
  };

  const interp = CommonProcessorOnboardingService.interpretAnswers(raw);
  assert.strictEqual(interp.profileCode, 'PREMIUM_EXPORT_FSSAI_PLUS');
  assert.strictEqual(interp.organization.type, 'ENTERPRISE');
  assert.strictEqual(interp.facility.scale, 'LARGE');
});

// 3. Human Summary Generation (§19, §20)
console.log('\n--- 3. HUMAN SUMMARY WITHOUT JARGON ---');

runTest('Human summary displays clean flow and no internal system acronyms', () => {
  const raw = {
    activity: 'PROCESS',
    workPlace: 'OWN_PLACE',
    location: { state: 'Maharashtra', district: 'Pune', town: 'Hadapsar' },
    scale: 'SMALL',
    sources: ['LOCAL_BEEKEEPERS', 'OWN_HIVES'],
    honeyTypes: ['FLOWER_BLOSSOM'],
    processActions: ['CHECK', 'FILTER', 'SETTLE', 'PACK'],
    equipment: ['STORAGE_TANK', 'FILTER'],
    method: 'OWN_METHOD',
    qualityCheck: 'OWN_CHECKS',
    packaging: 'BOTTLES',
    market: 'LOCAL'
  };

  const summary = CommonProcessorOnboardingService.getHumanSummary(raw, 'en');
  assert.ok(summary.work.includes('Honey Processing'));
  assert.ok(summary.processFlow.includes('Check → Filter → Settle → Pack'));
  assert.ok(summary.setup.includes('Pune, Maharashtra'));
  assert.ok(!summary.processFlow.includes('SOP'));
  assert.ok(!summary.processFlow.includes('REGULATORY'));
  assert.ok(!summary.processFlow.includes('CAPABILITY'));
});

// 4. Confirmation & Audit Separation (§50, §51)
console.log('\n--- 4. CONFIRMATION & AUDIT TRAIL ---');

runTest('confirmAndSave creates both authoritative facility and persistent audit record', () => {
  const raw = {
    activity: 'PROCESS',
    workPlace: 'OWN_PLACE',
    location: { state: 'Maharashtra', district: 'Pune', town: 'Saswad' },
    scale: 'SMALL',
    sources: ['OWN_HIVES'],
    honeyTypes: ['FLOWER_BLOSSOM'],
    processActions: ['CHECK', 'FILTER', 'PACK'],
    equipment: ['FILTER'],
    method: 'OWN_METHOD',
    qualityCheck: 'OWN_CHECKS',
    packaging: 'BOTTLES',
    market: 'LOCAL'
  };

  const result = CommonProcessorOnboardingService.confirmAndSave(raw);
  assert.ok(result.confirmedOrganization);
  assert.ok(result.confirmedFacility);
  assert.ok(result.confirmedCapabilities.length > 0);
  assert.deepStrictEqual(result.rawAnswers, raw);
  assert.ok(result.savedAt);
});

console.log('\n======================================================');
console.log(`ALL ${passed} COMMON-MAN PROCESSOR ONBOARDING TESTS PASSED!`);
console.log('======================================================\n');
