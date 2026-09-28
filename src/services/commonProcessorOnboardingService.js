/**
 * HONEYCHAIN — COMMON-MAN PROCESSOR ONBOARDING SERVICE
 *
 * Human-First • India-First • Zero-Technical-Knowledge • Progressive Intelligence
 *
 * Core Principles (§2, §7, §22, §23, §26, §37, §50):
 * 1. Simple human questions -> background technical inference
 * 2. Never expose system concepts (SOP, Capability, Processing Profile, Regulatory Rules) to normal users
 * 3. Separate raw user answers from system interpretation
 * 4. Deterministic authorization from confirmed profiles
 * 5. Full India-first multilingual readiness (English, Hindi, Tamil)
 * 6. Progress recovery via draft persistence
 */

import { ProcessorProfileService } from './processorProfileService.js';
import { PROCESSING_PROFILES } from '../data/processor/processingProfiles.js';
import { INITIAL_EQUIPMENT_REGISTRY } from '../data/processor/processorSeedData.js';

export const PROCESSOR_DRAFT_KEY = 'hc_common_processor_draft_v1';
export const PROCESSOR_AUTHORITATIVE_KEY = 'hc_common_processor_profile_v1';

// Supported Languages
export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்' }
];

// Multilingual Dictionary (§37)
export const PROCESSOR_I18N = {
  en: {
    // Navigation & Stages
    stage_about: 'About You',
    stage_sources: 'Your Honey',
    stage_process: 'Your Process',
    stage_summary: 'Understanding',
    btn_continue: 'Continue',
    btn_back: 'Back',
    btn_skip: 'Skip for now',
    btn_confirm: 'Start Processing',
    btn_looks_right: '✓ Looks right',
    btn_change: '✎ Change something',
    badge_simple_mode: 'Simple Setup',
    btn_advanced_switch: 'Advanced Technical Mode',

    // Q1: What do you do with honey?
    q1_title: 'What do you do with honey?',
    q1_subtitle: 'Tell us how you work with honey so we can set up your workspace.',
    q1_process: '🍯 I process honey',
    q1_process_sub: 'Extraction, settling, filtering, or refining honey',
    q1_pack: '📦 I pack honey',
    q1_pack_sub: 'Bottling, labeling, and jar filling',
    q1_distribute: '🚚 I distribute honey',
    q1_distribute_sub: 'Logistics, delivery, and wholesale dispatch',
    q1_collect: '🌱 I collect honey',
    q1_collect_sub: 'Harvesting from hives or gathering from beekeepers',
    q1_test: '🔬 I test honey',
    q1_test_sub: 'Laboratory testing and quality checks',
    q1_manage: '👥 I manage a honey business',
    q1_manage_sub: 'Coordination, cooperative lead, or enterprise oversight',
    q1_other: 'Other',

    // Q2: Where do you process honey?
    q2_title: 'Where do you process honey?',
    q2_subtitle: 'This helps HoneyChain understand your operational setup.',
    q2_own_place: '🏠 At my own place',
    q2_own_place_sub: 'Home, farm shed, or artisanal processing room',
    q2_processing_unit: '🏭 At a processing unit',
    q2_processing_unit_sub: 'Dedicated facility with equipment',
    q2_cooperative: '👥 At our group / cooperative',
    q2_cooperative_sub: 'Shared community facility or FPO / SHG center',
    q2_company: '🏢 At a company',
    q2_company_sub: 'Commercial food or agro enterprise',
    q2_contract: '🤝 I process honey for others',
    q2_contract_sub: 'Third-party job-work processing',
    q2_not_sure: "🤷 I'm not sure",

    // Q3: Location
    q3_title: 'Where is your processing place?',
    q3_subtitle: 'Helps track regional honey flora, local climate, and moisture dynamics.',
    q3_state: 'State / Union Territory',
    q3_district: 'District',
    q3_town: 'Town / Village / Industrial Area',
    q3_use_location: '📍 Use my current location',
    q3_location_detected: 'Location detected: Pune, Maharashtra',

    // Q4: Scale
    q4_title: 'How much honey do you usually handle?',
    q4_subtitle: 'Select the approximate amount per batch or harvest season.',
    q4_small: '🪣 Small amounts',
    q4_small_sub: 'Up to a few tins or buckets (up to 50 kg/day)',
    q4_medium: '📦 A few containers at a time',
    q4_medium_sub: 'Several drums or tanks (50 – 500 kg/day)',
    q4_large: '🏭 Large quantities',
    q4_large_sub: 'Commercial bulk processing (500+ kg/day)',
    q4_not_sure: "🤷 I'm not sure",

    // Q5: Sources
    q5_title: 'Where does your honey usually come from?',
    q5_subtitle: 'Select all sources that apply to your honey intake.',
    q5_own_hives: '🐝 My own bee colonies',
    q5_local_beekeepers: '👨‍🌾 Local beekeepers',
    q5_groups: "👥 Beekeepers' groups / cooperatives",
    q5_suppliers: '🏢 Other processors or suppliers',
    q5_various: '🌿 Different wild or gathered sources',
    q5_not_sure: "🤷 I'm not sure",

    // Q6: Honey Types
    q6_title: 'What kind of honey do you usually handle?',
    q6_subtitle: 'No scientific terms needed. Select the types you recognize.',
    q6_flower: '🌼 Flower / blossom honey',
    q6_forest: '🌿 Forest / wild-flower honey',
    q6_mustard: '🌾 Mustard honey',
    q6_eucalyptus: '🌳 Eucalyptus honey',
    q6_litchi: '🌸 Litchi honey',
    q6_mixed: '🍯 Mixed / multifloral honey',
    q6_not_sure: "🤷 I don't know",

    // Q7: What do you do after receiving?
    q7_title: 'What do you normally do after receiving the honey?',
    q7_subtitle: 'Select the activities you perform. None of these are mandatory.',
    q7_check: 'Check the honey condition & weight',
    q7_debris: 'Remove wax and visible particles',
    q7_filter: 'Filter or strain the honey',
    q7_warm: 'Warm the honey gently',
    q7_moisture: 'Reduce moisture if needed',
    q7_settle: 'Keep it in tanks for settling',
    q7_blend: 'Mix different honey lots',
    q7_pack: 'Pack the honey into jars or tins',
    q7_store: 'Store in drums or tanks',
    q7_something_else: 'Something else',

    // Q8: Equipment
    q8_title: 'What equipment do you have?',
    q8_subtitle: 'Choose tools or machines you have at your place.',
    q8_storage_tank: 'Storage tank',
    q8_settling_tank: 'Settling tank',
    q8_filter: 'Coarse filter / strainer',
    q8_fine_filter: 'Fine mesh filter',
    q8_warming: 'Warming / heating equipment',
    q8_moisture_device: 'Moisture measuring meter (Refractometer)',
    q8_weighing_scale: 'Weighing scale',
    q8_filling: 'Bottle filling machine',
    q8_sealing: 'Cap sealing machine',
    q8_not_sure: "🤷 I don't know",

    // Q9: Existing Method
    q9_title: 'Do you already follow a regular way of processing honey?',
    q9_subtitle: 'This helps HoneyChain match your routine.',
    q9_own_method: '✅ Yes, we follow our own proven method',
    q9_written: '📄 Yes, we follow a written recipe or procedure',
    q9_experienced: '👨‍🏫 We follow advice from experienced elders or experts',
    q9_depends: '🔄 We change the method depending on the honey',
    q9_no_fixed: '❌ No fixed method yet',
    q9_not_sure: "🤷 I'm not sure",

    // Q10: Quality Check
    q10_title: 'Do you check the honey before packing?',
    q10_subtitle: 'How do you ensure honey quality and purity?',
    q10_own_checks: 'Yes, we do our own visual / aroma / refractometer checks',
    q10_lab_tests: 'Yes, we send samples to an external lab for testing',
    q10_both: 'Both — own screening plus external lab tests',
    q10_sometimes: 'Sometimes, when requested by buyers',
    q10_no: 'No special testing done',
    q10_not_sure: "🤷 I'm not sure",

    // Q11: Packaging
    q11_title: 'What do you usually do after processing?',
    q11_subtitle: 'How is the honey prepared for downstream sale?',
    q11_bottles: '🍯 Pack into consumer glass / PET bottles',
    q11_bulk: '🪣 Pack into bulk tins or barrels',
    q11_both: '📦 Both retail bottles and bulk containers',
    q11_send_another: '➡️ Send it to another facility for packing',
    q11_not_sure: "🤷 I'm not sure",

    // Q12: Market
    q12_title: 'Where does your honey usually go?',
    q12_subtitle: 'Helps configure downstream traceability and invoices.',
    q12_local: '🏪 Local village / town customers',
    q12_retail: '🏬 Retail shops, organic stores & supermarkets',
    q12_businesses: '🤝 Other food businesses / Ayurvedic brands',
    q12_distributors: '🚚 Regional wholesale distributors',
    q12_export: '🌍 Export markets abroad',
    q12_various: '📦 Multiple diverse markets',
    q12_not_sure: "🤷 I'm not sure",

    // Summary Screen
    summary_title: "Here's what HoneyChain understood",
    summary_subtitle: "Review your setup. HoneyChain has prepared your workspace around the way you work.",
    summary_your_work: 'Your Work Focus',
    summary_your_setup: 'Your Processing Setup',
    summary_your_sources: 'Your Honey Sources',
    summary_your_process: 'Your Routine Process Flow',
    summary_your_equipment: 'Your Equipment & Tools',
    summary_your_quality: 'Your Quality Process',
    summary_your_market: 'Your Markets',

    // Ready Screen
    ready_title: "You're all set to start 🍯",
    ready_subtitle: 'Your workspace is ready. HoneyChain will adapt as your work evolves.',
    ready_task_receive: '🍯 Receive Honey — Record incoming honey from beekeepers',
    ready_task_process: '⚙️ Start Processing — Execute your routine processing steps',
    ready_task_quality: '🔬 Send for Testing — Coordinate lab samples & test records',
    ready_task_pack: '📦 Prepare for Packing — Finish lots and label containers',
    ready_task_batches: '📋 View My Batches — Monitor all active and historical lots'
  },

  hi: {
    // Navigation & Stages
    stage_about: 'आपके बारे में',
    stage_sources: 'शहद के स्रोत',
    stage_process: 'आपकी प्रक्रिया',
    stage_summary: 'समझ',
    btn_continue: 'आगे बढ़ें',
    btn_back: 'पीछे जाएँ',
    btn_skip: 'अभी छोड़ें',
    btn_confirm: 'प्रसंस्करण शुरू करें',
    btn_looks_right: '✓ सब सही है',
    btn_change: '✎ कुछ बदलाव करें',
    badge_simple_mode: 'सरल मोड',
    btn_advanced_switch: 'उन्नत तकनीकी मोड',

    // Q1
    q1_title: 'आप शहद के साथ क्या काम करते हैं?',
    q1_subtitle: 'हमें अपने काम के बारे में बताएं ताकि हम आपका कार्यक्षेत्र तैयार कर सकें।',
    q1_process: '🍯 मैं शहद का प्रसंस्करण (प्रोसेसिंग) करता हूँ',
    q1_process_sub: 'निष्कर्षण, छानना, निथारना या शुद्ध करना',
    q1_pack: '📦 मैं शहद पैक करता हूँ',
    q1_pack_sub: 'बोतलों में भरना और लेबल लगाना',
    q1_distribute: '🚚 मैं शहद का वितरण करता हूँ',
    q1_distribute_sub: 'थोक आपूर्ति और परिवहन',
    q1_collect: '🌱 मैं शहद एकत्र करता हूँ',
    q1_collect_sub: 'छत्तों से काटना या मधुमक्खी पालकों से लेना',
    q1_test: '🔬 मैं शहद की जाँच करता हूँ',
    q1_test_sub: 'प्रयोगशाला परीक्षण और गुणवत्ता जाँच',
    q1_manage: '👥 मैं शहद व्यवसाय का प्रबंधन करता हूँ',
    q1_manage_sub: 'सहकारी समिति या उद्यम संचालन',
    q1_other: 'अन्य',

    // Q2
    q2_title: 'आप शहद कहाँ प्रोसेस करते हैं?',
    q2_subtitle: 'इससे हनीचेन आपकी कार्यप्रणाली को समझ पाएगा।',
    q2_own_place: '🏠 अपनी स्वयं की जगह पर',
    q2_own_place_sub: 'घर, खेत या निजी इकाई में',
    q2_processing_unit: '🏭 एक प्रसंस्करण इकाई में',
    q2_processing_unit_sub: 'उपकरणों से युक्त समर्पित केंद्र',
    q2_cooperative: '👥 हमारे समूह / सहकारी समिति में',
    q2_cooperative_sub: 'साझा केंद्र, एफपीओ या स्वयं सहायता समूह',
    q2_company: '🏢 किसी कंपनी में',
    q2_company_sub: 'वाणिज्यिक खाद्य या कृषि उद्यम',
    q2_contract: '🤝 मैं दूसरों के लिए जॉब-वर्क करता हूँ',
    q2_contract_sub: 'अन्य ब्रांडों के लिए प्रसंस्करण',
    q2_not_sure: '🤷 मुझे ठीक से पता नहीं',

    // Q3
    q3_title: 'आपकी प्रसंस्करण जगह कहाँ स्थित है?',
    q3_subtitle: 'स्थानीय वनस्पतियों और जलवायु को समझने में मदद करता है।',
    q3_state: 'राज्य / केंद्र शासित प्रदेश',
    q3_district: 'ज़िला',
    q3_town: 'कस्बा / गाँव / क्षेत्र',
    q3_use_location: '📍 मेरा वर्तमान स्थान उपयोग करें',
    q3_location_detected: 'स्थान पहचाना गया: पुणे, महाराष्ट्र',

    // Q4
    q4_title: 'आप सामान्यतः कितना शहद संभालते हैं?',
    q4_subtitle: 'अपने औसत बैच या मौसम के अनुसार चुनें।',
    q4_small: '🪣 कम मात्रा',
    q4_small_sub: 'कुछ बाल्टियां या पीपे (50 किग्रा/दिन तक)',
    q4_medium: '📦 कुछ कंटेनर या ड्रम',
    q4_medium_sub: 'मध्यम स्तर (50 से 500 किग्रा/दिन)',
    q4_large: '🏭 बड़ी मात्रा',
    q4_large_sub: 'वाणिज्यिक बड़े पैमाने पर (500+ किग्रा/दिन)',
    q4_not_sure: '🤷 मुझे ठीक से पता नहीं',

    // Q5
    q5_title: 'आपका शहद सामान्यतः कहाँ से आता है?',
    q5_subtitle: 'सभी लागू स्रोत चुनें।',
    q5_own_hives: '🐝 मेरी अपनी मधुमक्खी कॉलोनियां',
    q5_local_beekeepers: '👨‍🌾 स्थानीय मधुमक्खी पालक',
    q5_groups: '👥 मधुमक्खी पालक समूह / समितियां',
    q5_suppliers: '🏢 अन्य आपूर्तिकर्ता या व्यापारी',
    q5_various: '🌿 जंगली या विविध स्रोत',
    q5_not_sure: '🤷 मुझे ठीक से पता नहीं',

    // Q6
    q6_title: 'आप किस प्रकार का शहद संभालते हैं?',
    q6_subtitle: 'वैज्ञानिक नाम की आवश्यकता नहीं है। जो पहचानते हैं उन्हें चुनें।',
    q6_flower: '🌼 फूलों का शहद',
    q6_forest: '🌿 जंगल / जंगली फूलों का शहद',
    q6_mustard: '🌾 सरसों का शहद',
    q6_eucalyptus: '🌳 नीलगिरी (सफेदा) शहद',
    q6_litchi: '🌸 लीची शहद',
    q6_mixed: '🍯 मिश्रित / मल्टीफ्लोरल शहद',
    q6_not_sure: '🤷 मुझे ठीक से पता नहीं',

    // Q7
    q7_title: 'शहद प्राप्त करने के बाद आप सामान्यतः क्या करते हैं?',
    q7_subtitle: 'अपनी सामान्य गतिविधियां चुनें। कोई भी अनिवार्य नहीं है।',
    q7_check: 'शहद की स्थिति और वजन की जाँच',
    q7_debris: 'मोम और कणों को हटाना',
    q7_filter: 'शहद को छानना',
    q7_warm: 'शहद को हल्का गर्म करना',
    q7_moisture: 'नमी (मॉइस्चर) कम करना',
    q7_settle: 'टैंक में निथारने (सेटलिंग) के लिए रखना',
    q7_blend: 'विभिन्न लॉट को मिलाना (ब्लेंड)',
    q7_pack: 'बोतलों या पीपों में भरना',
    q7_store: 'ड्रम या टैंक में सुरक्षित रखना',
    q7_something_else: 'कुछ अन्य कदम',

    // Q8
    q8_title: 'आपके पास कौन-से उपकरण हैं?',
    q8_subtitle: 'अपनी इकाई में उपलब्ध उपकरण चुनें।',
    q8_storage_tank: 'स्टोरेज टैंक',
    q8_settling_tank: 'सेटलिंग टैंक',
    q8_filter: 'छलनी / फिल्टर',
    q8_fine_filter: 'बारीक मेश फिल्टर',
    q8_warming: 'गर्म करने का उपकरण',
    q8_moisture_device: 'नमी मापने का यंत्र (रिफ्रैक्टोमीटर)',
    q8_weighing_scale: 'वजन कांटा',
    q8_filling: 'बॉटल फिलिंग मशीन',
    q8_sealing: 'ढक्कन सील करने की मशीन',
    q8_not_sure: '🤷 मुझे ठीक से पता नहीं',

    // Q9
    q9_title: 'क्या आप पहले से कोई निश्चित तरीका अपनाते हैं?',
    q9_subtitle: 'इससे हनीचेन आपकी पद्धति को आसानी से अपना सकता है।',
    q9_own_method: '✅ हाँ, हम अपना सिद्ध तरीका अपनाते हैं',
    q9_written: '📄 हाँ, हमारे पास लिखित प्रक्रिया है',
    q9_experienced: '👨‍🏫 हम अनुभवी लोगों या जानकारों की सलाह मानते हैं',
    q9_depends: '🔄 हम शहद के अनुसार तरीका बदलते हैं',
    q9_no_fixed: '❌ कोई निश्चित तरीका नहीं है',
    q9_not_sure: '🤷 मुझे ठीक से पता नहीं',

    // Q10
    q10_title: 'क्या आप पैकिंग से पहले शहद की जाँच करते हैं?',
    q10_subtitle: 'आप शहद की शुद्धता कैसे सुनिश्चित करते हैं?',
    q10_own_checks: 'हाँ, हम अपनी जाँच (रंग, गंध, रिफ्रैक्टोमीटर) करते हैं',
    q10_lab_tests: 'हाँ, हम बाहरी प्रयोगशाला (लैब) में सैंपल भेजते हैं',
    q10_both: 'दोनों — अपनी जाँच और बाहरी लैब परीक्षण',
    q10_sometimes: 'कभी-कभी, जब ग्राहक मांग करते हैं',
    q10_no: 'कोई विशेष परीक्षण नहीं होता',
    q10_not_sure: '🤷 मुझे ठीक से पता नहीं',

    // Q11
    q11_title: 'प्रोसेसिंग के बाद आप क्या करते हैं?',
    q11_subtitle: 'शहद को आगे की बिक्री के लिए कैसे तैयार किया जाता है?',
    q11_bottles: '🍯 खुदरा बोतलों में पैक करना',
    q11_bulk: '🪣 बड़े पीपों या ड्रमों में पैक करना',
    q11_both: '📦 दोनों (बोतलें और थोक)',
    q11_send_another: '➡️ पैकिंग के लिए दूसरी इकाई में भेजना',
    q11_not_sure: '🤷 मुझे ठीक से पता नहीं',

    // Q12
    q12_title: 'आपका शहद सामान्यतः कहाँ जाता है?',
    q12_subtitle: 'ट्रेसेबिलिटी और चालान तैयार करने में मदद करता है।',
    q12_local: '🏪 स्थानीय गाँव / कस्बा ग्राहक',
    q12_retail: '🏬 खुदरा दुकानें और जैविक स्टोर',
    q12_businesses: '🤝 अन्य खाद्य व्यवसाय या आयुर्वेदिक ब्रांड',
    q12_distributors: '🚚 क्षेत्रीय थोक वितरक',
    q12_export: '🌍 विदेश निर्यात',
    q12_various: '📦 विविध बाज़ार',
    q12_not_sure: '🤷 मुझे ठीक से पता नहीं',

    // Summary Screen
    summary_title: 'हनीचेन ने आपके काम को समझा',
    summary_subtitle: 'अपने सेटअप की समीक्षा करें। हनीचेन ने आपके काम के अनुसार कार्यक्षेत्र तैयार कर दिया है।',
    summary_your_work: 'आपका मुख्य कार्य',
    summary_your_setup: 'आपकी इकाई की व्यवस्था',
    summary_your_sources: 'शहद के स्रोत',
    summary_your_process: 'आपकी नियमित प्रक्रिया',
    summary_your_equipment: 'आपके उपकरण',
    summary_your_quality: 'गुणवत्ता जाँच व्यवस्था',
    summary_your_market: 'आपके ग्राहक व बाज़ार',

    // Ready Screen
    ready_title: 'आप काम शुरू करने के लिए पूरी तरह तैयार हैं 🍯',
    ready_subtitle: 'आपका कार्यक्षेत्र तैयार है। हनीचेन आपके काम के अनुसार अनुकूलित रहेगा।',
    ready_task_receive: '🍯 शहद प्राप्त करें — पालकों से आवक दर्ज करें',
    ready_task_process: '⚙️ प्रोसेसिंग शुरू करें — अपनी नियमित प्रक्रिया चलाएं',
    ready_task_quality: '🔬 लैब परीक्षण — सैंपलिंग और परिणाम दर्ज करें',
    ready_task_pack: '📦 पैकिंग तैयार करें — लॉट पूरा करें और लेबल लगाएं',
    ready_task_batches: '📋 मेरे बैच देखें — सक्रिय और पुराने लॉट ट्रैक करें'
  },

  ta: {
    // Navigation & Stages
    stage_about: 'உங்களைப் பற்றி',
    stage_sources: 'தேன் மூலங்கள்',
    stage_process: 'உங்கள் செயல்முறை',
    stage_summary: 'புரிதல்',
    btn_continue: 'தொடரவும்',
    btn_back: 'பின்செல்ல',
    btn_skip: 'இப்போதைக்கு தவிர்க்க',
    btn_confirm: 'பதப்படுத்தலைத் தொடங்கவும்',
    btn_looks_right: '✓ எல்லாம் சரியாய் உள்ளது',
    btn_change: '✎ மாற்றியமைக்க',
    badge_simple_mode: 'எளிய முறை',
    btn_advanced_switch: 'தொழில்நுட்ப முறை',

    // Q1
    q1_title: 'நீங்கள் தேனுடன் என்ன பணி செய்கிறீர்கள்?',
    q1_subtitle: 'உங்கள் பணிக்கு ஏற்ப ஹனிசெயின் திரையை அமைக்க உதவும்.',
    q1_process: '🍯 நான் தேனைப் பதப்படுத்துகிறேன்',
    q1_process_sub: 'பிரித்தெடுத்தல், வடித்தல் அல்லது சுத்திகரித்தல்',
    q1_pack: '📦 நான் தேனை பாட்டில்களில் அடைக்கிறேன்',
    q1_pack_sub: 'பாட்டில் நிரப்புதல் மற்றும் லேபிளிடுதல்',
    q1_distribute: '🚚 நான் தேனை விநியோகம் செய்கிறேன்',
    q1_distribute_sub: 'மொத்த விற்பனை மற்றும் போக்குவரத்து',
    q1_collect: '🌱 நான் தேன் சேகரிக்கிறேன்',
    q1_collect_sub: 'கூடுகளிலிருந்து அறுவடை செய்தல்',
    q1_test: '🔬 நான் தேனை பரிசோதிக்கிறேன்',
    q1_test_sub: 'ஆய்வக தரம் மற்றும் தூய்மை சோதனை',
    q1_manage: '👥 நான் தேன் வணிகத்தை நிர்வகிக்கிறேன்',
    q1_manage_sub: 'கூட்டுறவு அல்லது வணிக மேற்பார்வை',
    q1_other: 'மற்றவை',

    // Q2
    q2_title: 'தேனை நீங்கள் எங்கு பதப்படுத்துகிறீர்கள்?',
    q2_subtitle: 'உங்கள் செயல்பாட்டு முறையை அறிய இது உதவும்.',
    q2_own_place: '🏠 எனது சொந்த இடத்தில்',
    q2_own_place_sub: 'வீடு, பண்ணை அல்லது சொந்த அறை',
    q2_processing_unit: '🏭 ஒரு பதப்படுத்தும் கூடத்தில்',
    q2_processing_unit_sub: 'இயந்திரங்கள் உள்ள பிரத்யேக கூடம்',
    q2_cooperative: '👥 கூட்டுறவு / குழு அமைப்பில்',
    q2_cooperative_sub: 'உழவர் உற்பத்தியாளர் நிறுவனம் அல்லது மகளிர் குழு',
    q2_company: '🏢 ஒரு நிறுவனத்தில்',
    q2_company_sub: 'வணிக உணவு நிறுவனம்',
    q2_contract: '🤝 பிறருக்காக வேலை செய்கிறேன்',
    q2_contract_sub: 'மூன்றாம் தரப்பு பணி ஒப்பந்தம்',
    q2_not_sure: '🤷 எனக்கு உறுதியாக தெரியவில்லை',

    // Q3
    q3_title: 'உங்கள் பதப்படுத்தும் இடம் எங்குள்ளது?',
    q3_subtitle: 'பகுதி தாவரங்கள் மற்றும் காலநிலையை அறிந்து கொள்ள உதவும்.',
    q3_state: 'மாநிலம் / யூனியன் பிரதேசம்',
    q3_district: 'மாவட்டம்',
    q3_town: 'ஊர் / கிராமம் / பகுதி',
    q3_use_location: '📍 எனது தற்போதைய இருப்பிடத்தைப் பயன்படுத்து',
    q3_location_detected: 'இருப்பிடம் கண்டறியப்பட்டது: உதகமண்டலம், நீலகிரி',

    // Q4
    q4_title: 'பொதுவாக எவ்வளவு தேன் கையாள்கிறீர்கள்?',
    q4_subtitle: 'உங்கள் சராசரி அறுவடை அல்லது தொகுப்பு அளவு.',
    q4_small: '🪣 குறைந்த அளவு',
    q4_small_sub: 'சில வாளிகள் (நாள் ஒன்றுக்கு 50 கிலோ வரை)',
    q4_medium: '📦 நடுத்தர அளவு',
    q4_medium_sub: 'சில பேரல்கள் (50 - 500 கிலோ)',
    q4_large: '🏭 அதிக அளவு',
    q4_large_sub: 'வணிக ரீதியான பெருமளவு (500+ கிலோ)',
    q4_not_sure: '🤷 எனக்கு உறுதியாக தெரியவில்லை',

    // Q5
    q5_title: 'உங்கள் தேன் எங்கிருந்து கிடைக்கிறது?',
    q5_subtitle: 'பொருந்தும் மூலங்களைத் தேர்ந்தெடுக்கவும்.',
    q5_own_hives: '🐝 எனது சொந்த தேனீப் பெட்டிகள்',
    q5_local_beekeepers: '👨‍🌾 உள்ளூர் தேனீ வளர்ப்பாளர்கள்',
    q5_groups: '👥 வளர்ப்பாளர் சங்கங்கள்',
    q5_suppliers: '🏢 பிற விற்பனையாளர்கள்',
    q5_various: '🌿 காட்டுத் தேன் மூலங்கள்',
    q5_not_sure: '🤷 எனக்கு உறுதியாக தெரியவில்லை',

    // Q6
    q6_title: 'நீங்கள் கையாளும் தேன் வகைகள் என்ன?',
    q6_subtitle: 'அறிவியல் பெயர்கள் தேவையில்லை. தெரிந்தவற்றைத் தேர்ந்தெடுக்கவும்.',
    q6_flower: '🌼 பூக்கள் தேன்',
    q6_forest: '🌿 காட்டுத் தேன்',
    q6_mustard: '🌾 கடுகுப் பூ தேன்',
    q6_eucalyptus: '🌳 தைல மரம் தேன்',
    q6_litchi: '🌸 லிச்சி தேன்',
    q6_mixed: '🍯 பல மலர் கலவை தேன்',
    q6_not_sure: '🤷 எனக்கு தெரியாது',

    // Q7
    q7_title: 'தேன் பெற்ற பிறகு நீங்கள் என்ன செய்வீர்கள்?',
    q7_subtitle: 'உங்கள் வழக்கமான செயல்களைத் தேர்ந்தெடுக்கவும்.',
    q7_check: 'தேனின் நிலை மற்றும் எடையைச் சரிபார்த்தல்',
    q7_debris: 'மெழுகு மற்றும் அசுத்தங்களை நீக்குதல்',
    q7_filter: 'தேனை வடித்தல்',
    q7_warm: 'லேசாக சூடாக்குதல்',
    q7_moisture: 'ஈரப்பதத்தைக் குறைத்தல்',
    q7_settle: 'வண்டல் படிய தொட்டியில் வைத்தல்',
    q7_blend: 'வெவ்வேறு தேன்களைக் கலக்குதல்',
    q7_pack: 'பாட்டில்களில் அடைத்தல்',
    q7_store: 'தொட்டிகளில் பாதுகாப்பாக வைத்தல்',
    q7_something_else: 'பிற செயல்கள்',

    // Q8
    q8_title: 'உங்களிடம் என்னென்ன உபகரணங்கள் உள்ளன?',
    q8_subtitle: 'உங்கள் கூடத்தில் உள்ள கருவிகளைத் தேர்ந்தெடுக்கவும்.',
    q8_storage_tank: 'சேமிப்புத் தொட்டி',
    q8_settling_tank: 'படிய வைக்கும் தொட்டி',
    q8_filter: 'வடிகட்டி / சல்லடை',
    q8_fine_filter: 'நுண் வடிகட்டி',
    q8_warming: 'சூடாக்கும் கருவி',
    q8_moisture_device: 'ஈரப்பதம் அளவிடும் கருவி',
    q8_weighing_scale: 'எடை இயந்திரம்',
    q8_filling: 'பாட்டில் நிரப்பும் இயந்திரம்',
    q8_sealing: 'மூடி சீலிங் இயந்திரம்',
    q8_not_sure: '🤷 எனக்கு தெரியாது',

    // Q9
    q9_title: 'ஏற்கனவே ஒரு வழக்கமான முறையைப் பின்பற்றுகிறீர்களா?',
    q9_subtitle: 'உங்கள் வழக்கத்திற்கு ஏற்ப ஹனிசெயின் அமைப்பை உருவாக்கும்.',
    q9_own_method: '✅ ஆம், எங்கள் சொந்த அனுபவ முறை உள்ளது',
    q9_written: '📄 ஆம், எழுதப்பட்ட செய்முறை உள்ளது',
    q9_experienced: '👨‍🏫 மூத்தவர்களின் வழிகாட்டுதலைப் பின்பற்றுகிறோம்',
    q9_depends: '🔄 தேனின் வகைக்கு ஏற்ப மாற்றுவோம்',
    q9_no_fixed: '❌ நிலையான முறை இல்லை',
    q9_not_sure: '🤷 எனக்கு உறுதியாக தெரியவில்லை',

    // Q10
    q10_title: 'பேக்கிங் செய்வதற்கு முன் தேனைப் பரிசோதிக்கிறீர்களா?',
    q10_subtitle: 'தேனின் தரத்தை நீங்கள் எவ்வாறு உறுதி செய்கிறீர்கள்?',
    q10_own_checks: 'ஆம், நாங்களே சுவை, மணம், ஈரப்பதம் பார்க்கிறோம்',
    q10_lab_tests: 'ஆம், வெளி ஆய்வகத்திற்கு மாதிரி அனுப்புகிறோம்',
    q10_both: 'இரண்டும் — எங்கள் சோதனையும் ஆய்வக சோதனையும்',
    q10_sometimes: 'சில நேரங்களில் மட்டும்',
    q10_no: 'தனிப்பட்ட சோதனை இல்லை',
    q10_not_sure: '🤷 எனக்கு உறுதியாக தெரியவில்லை',

    // Q11
    q11_title: 'பதப்படுத்திய பிறகு என்ன செய்வீர்கள்?',
    q11_subtitle: 'தேன் எவ்வாறு விற்பனைக்குத் தயாராகிறது?',
    q11_bottles: '🍯 பாட்டில்களில் அடைத்தல்',
    q11_bulk: '🪣 பெரிய கேன்களில் அடைத்தல்',
    q11_both: '📦 இரண்டும் செய்கிறோம்',
    q11_send_another: '➡️ பேக்கிங்கிற்கு வேறு இடத்திற்கு அனுப்புதல்',
    q11_not_sure: '🤷 எனக்கு உறுதியாக தெரியவில்லை',

    // Q12
    q12_title: 'உங்கள் தேன் வழக்கமாக எங்கு விற்பனையாகிறது?',
    q12_subtitle: 'விநியோகத் தடமறிதலை அமைக்க உதவும்.',
    q12_local: '🏪 உள்ளூர் மக்கள் மற்றும் நுகர்வோர்',
    q12_retail: '🏬 சில்லறை கடைகள் மற்றும் இயற்கை அங்காடிகள்',
    q12_businesses: '🤝 பிற நிறுவனங்கள் மற்றும் ஆயுர்வேத பிராண்டுகள்',
    q12_distributors: '🚚 மொத்த விநியோகஸ்தர்கள்',
    q12_export: '🌍 வெளிநாட்டு ஏற்றுமதி',
    q12_various: '📦 பலதரப்பட்ட சந்தைகள்',
    q12_not_sure: '🤷 எனக்கு உறுதியாக தெரியவில்லை',

    // Summary Screen
    summary_title: 'ஹனிசெயின் உங்கள் பணியை புரிந்து கொண்டது',
    summary_subtitle: 'உங்கள் அமைப்பைச் சரிபார்க்கவும். நீங்கள் பணிபுரியும் விதத்தில் உங்கள் பணிப்பகுதி தயாராகியுள்ளது.',
    summary_your_work: 'உங்கள் முதன்மைப் பணி',
    summary_your_setup: 'உங்கள் பதப்படுத்தும் அமைப்பு',
    summary_your_sources: 'தேன் மூலங்கள்',
    summary_your_process: 'வழக்கமான படிநிலைகள்',
    summary_your_equipment: 'உங்கள் உபகரணங்கள்',
    summary_your_quality: 'தரப் பரிசோதனை முறை',
    summary_your_market: 'விற்பனைச் சந்தை',

    // Ready Screen
    ready_title: 'நீங்கள் பணியைத் தொடங்க தயார் 🍯',
    ready_subtitle: 'உங்கள் பணிப்பகுதி தயார். உங்கள் தேவைகளுக்கு ஏற்ப ஹனிசெயின் மாறும்.',
    ready_task_receive: '🍯 தேன் பெறுதல் — உள்ளூர் வளர்ப்பாளர்களிடமிருந்து வரவு பதிவுசெய்க',
    ready_task_process: '⚙️ பதப்படுத்தல் — உங்கள் வழக்கமான படிகளை நடத்துங்கள்',
    ready_task_quality: '🔬 ஆய்வக சோதனை — மாதிரி அனுப்பி தரச்சான்று பதிவுசெய்க',
    ready_task_pack: '📦 பேக்கிங் செய்தல் — பாட்டில் லேபிளிங் மற்றும் தொகுப்பு',
    ready_task_batches: '📋 தொகுப்புகளைக் காண்க — நடப்பு மற்றும் பழைய தொகுப்புகள்'
  }
};

export const CommonProcessorOnboardingService = {
  /**
   * Returns default initial answers
   */
  getDefaultAnswers() {
    return {
      activity: 'PROCESS',
      workPlace: 'OWN_PLACE',
      location: {
        state: 'Maharashtra',
        district: 'Pune',
        town: 'Hadapsar'
      },
      scale: 'SMALL',
      sources: ['LOCAL_BEEKEEPERS', 'OWN_HIVES'],
      honeyTypes: ['FLOWER_BLOSSOM', 'MULTIFLORAL'],
      processActions: ['CHECK', 'REMOVE_DEBRIS', 'FILTER', 'SETTLE', 'PACK'],
      equipment: ['STORAGE_TANK', 'SETTLING_TANK', 'FILTER', 'WEIGHING_SCALE'],
      method: 'OWN_METHOD',
      qualityCheck: 'OWN_CHECKS',
      packaging: 'BOTTLES',
      market: 'LOCAL'
    };
  },

  /**
   * Retrieves localized text for given key and language
   */
  t(key, lang = 'en') {
    const langDict = PROCESSOR_I18N[lang] || PROCESSOR_I18N.en;
    return langDict[key] || PROCESSOR_I18N.en[key] || key;
  },

  /**
   * Saves draft to localStorage for recovery (§41)
   */
  saveDraft(answers, currentStep = 1, lang = 'en') {
    try {
      localStorage.setItem(PROCESSOR_DRAFT_KEY, JSON.stringify({
        answers,
        currentStep,
        lang,
        updatedAt: new Date().toISOString()
      }));
    } catch (_) {}
  },

  /**
   * Loads draft from localStorage
   */
  loadDraft() {
    try {
      const data = localStorage.getItem(PROCESSOR_DRAFT_KEY);
      if (data) return JSON.parse(data);
    } catch (_) {}
    return null;
  },

  /**
   * Clears draft
   */
  clearDraft() {
    try {
      localStorage.removeItem(PROCESSOR_DRAFT_KEY);
    } catch (_) {}
  },

  /**
   * Normalize user answers (§50)
   */
  normalizeAnswers(raw) {
    const defaults = this.getDefaultAnswers();
    return {
      activity: raw.activity || defaults.activity,
      workPlace: raw.workPlace || defaults.workPlace,
      location: {
        state: raw.location?.state?.trim() || defaults.location.state,
        district: raw.location?.district?.trim() || defaults.location.district,
        town: raw.location?.town?.trim() || defaults.location.town
      },
      scale: raw.scale || defaults.scale,
      sources: Array.isArray(raw.sources) && raw.sources.length > 0 ? raw.sources : defaults.sources,
      honeyTypes: Array.isArray(raw.honeyTypes) && raw.honeyTypes.length > 0 ? raw.honeyTypes : defaults.honeyTypes,
      processActions: Array.isArray(raw.processActions) && raw.processActions.length > 0 ? raw.processActions : defaults.processActions,
      equipment: Array.isArray(raw.equipment) ? raw.equipment : defaults.equipment,
      method: raw.method || defaults.method,
      qualityCheck: raw.qualityCheck || defaults.qualityCheck,
      packaging: raw.packaging || defaults.packaging,
      market: raw.market || defaults.market
    };
  },

  /**
   * Background Intelligence: Inferred Technical Profile (§7, §21, §22, §43, §50)
   * Converts plain human answers into structured technical configuration behind the scenes.
   */
  interpretAnswers(rawAnswers) {
    const answers = this.normalizeAnswers(rawAnswers);

    // 1. Organization inference (§7)
    let orgType = 'INDIVIDUAL';
    let orgName = `${answers.location.district || 'Local'} Honey Unit`;
    if (answers.workPlace === 'COOPERATIVE') {
      orgType = 'COOPERATIVE';
      orgName = `${answers.location.district || 'Regional'} Beekeepers Co-operative Society`;
    } else if (answers.workPlace === 'COMPANY') {
      orgType = 'ENTERPRISE';
      orgName = `${answers.location.district || 'Indian'} Agro Food Processing Enterprise`;
    } else if (answers.workPlace === 'PROCESSING_UNIT') {
      orgType = 'PROCESSING_UNIT';
      orgName = `${answers.location.town || answers.location.district || 'Central'} Honey Processing Unit`;
    } else if (answers.workPlace === 'CONTRACT') {
      orgType = 'CONTRACT_PROCESSOR';
      orgName = `${answers.location.district || 'Specialized'} Contract Honey Processing Services`;
    }

    // 2. Facility Scale & Capacities
    let scaleCode = 'SMALL';
    let capPerDay = 60;
    let storageCap = 1500;
    if (answers.scale === 'MEDIUM') {
      scaleCode = 'MEDIUM';
      capPerDay = 350;
      storageCap = 8000;
    } else if (answers.scale === 'LARGE') {
      scaleCode = 'LARGE';
      capPerDay = 1500;
      storageCap = 30000;
    }

    const facilityName = `${answers.location.town || answers.location.district || 'Village'} Processing Facility`;

    // 3. Equipment Resolution (§13, §36)
    const matchedEquipmentIds = [];
    const equipRegistry = INITIAL_EQUIPMENT_REGISTRY;

    if (answers.equipment.includes('FILTER') || answers.equipment.includes('FINE_FILTER')) {
      matchedEquipmentIds.push('eq-flt-01');
    }
    if (answers.equipment.includes('SETTLING_TANK')) {
      matchedEquipmentIds.push('eq-tnk-01');
    }
    if (answers.equipment.includes('STORAGE_TANK')) {
      matchedEquipmentIds.push('eq-tnk-02');
    }
    if (answers.equipment.includes('MOISTURE_DEVICE')) {
      matchedEquipmentIds.push('eq-ref-01');
    }
    if (answers.equipment.includes('WEIGHING_SCALE')) {
      matchedEquipmentIds.push('eq-scl-01');
    }
    if (answers.equipment.includes('FILLING_MACHINE')) {
      matchedEquipmentIds.push('eq-bot-01');
    }
    if (answers.equipment.includes('SEALING_MACHINE')) {
      matchedEquipmentIds.push('eq-sel-01');
    }

    // 4. Processing Profile & Workflow Selection (§32, §43)
    let profileCode = 'COMMERCIAL_RETAIL';
    const hasMoisture = answers.processActions.includes('REDUCE_MOISTURE');
    const hasWarm = answers.processActions.includes('WARM');
    const isMinimal = !hasMoisture && !hasWarm && answers.processActions.includes('FILTER') && answers.processActions.includes('PACK');
    const isExport = answers.market === 'EXPORT';

    if (isExport) {
      profileCode = 'PREMIUM_EXPORT_FSSAI_PLUS';
    } else if (hasMoisture) {
      profileCode = 'MOISTURE_MANAGED_STANDARD';
    } else if (isMinimal) {
      profileCode = 'MINIMAL_RAW_FILTER';
    } else {
      profileCode = 'COMMERCIAL_RETAIL';
    }

    // 5. Canonical Step Sequence from User's Routine
    const sequence = ['RECEIVING', 'SOURCE_VERIFICATION'];
    if (answers.processActions.includes('CHECK')) sequence.push('INCOMING_INSPECTION');
    if (answers.processActions.includes('REMOVE_DEBRIS') || answers.processActions.includes('FILTER')) sequence.push('COARSE_STRAINING');
    if (answers.processActions.includes('WARM')) sequence.push('WARMING');
    if (answers.processActions.includes('REDUCE_MOISTURE')) sequence.push('MOISTURE_REDUCTION');
    if (answers.processActions.includes('SETTLE')) sequence.push('SETTLING');
    if (answers.processActions.includes('BLEND')) sequence.push('LOT_HOMOGENIZATION');
    if (answers.qualityCheck !== 'NO') sequence.push('QUALITY_CHECK');
    if (answers.processActions.includes('PACK') || answers.packaging !== 'NOT_SURE') sequence.push('PACKAGING_PREPARATION');

    // 6. Quality Laboratory Access
    let labAccess = 'ON_SITE_SCREENING_ONLY';
    if (answers.qualityCheck === 'LAB_TESTS' || answers.qualityCheck === 'BOTH') {
      labAccess = 'ON_SITE_SCREENING_PLUS_EXTERNAL_ACCREDITED';
    } else if (answers.qualityCheck === 'NO') {
      labAccess = 'MINIMAL_SENSORY_ONLY';
    }

    // 7. Authoritative Capabilities to Grant (§23)
    const capabilities = [
      'PROCESSING_MANAGEMENT',
      'BATCH_INTAKE',
      'PROCESSING_STEP_RECORD',
      'PROCESSING_PARAMETERS',
      'PROCESSING_EVIDENCE',
      'PROCESSING_COMPLETION',
      'BATCH_TRACEABILITY',
      'QUALITY_HANDOFF',
      'PACKAGING_HANDOFF',
      'HOLD_RELEASE_MANAGEMENT'
    ];
    if (answers.qualityCheck !== 'NO') capabilities.push('SAMPLE_INTAKE');
    if (answers.sources.includes('OWN_HIVES')) capabilities.push('HIVE_MANAGEMENT');
    if (answers.processActions.includes('PACK')) {
      capabilities.push('INVENTORY_MANAGEMENT');
      capabilities.push('PACKAGE_HONEY');
    }

    return {
      organization: {
        type: orgType,
        name: orgName,
        scale: scaleCode,
        state: answers.location.state,
        district: answers.location.district
      },
      facility: {
        name: facilityName,
        state: answers.location.state,
        district: answers.location.district,
        town: answers.location.town,
        scale: scaleCode,
        capacityKgPerDay: capPerDay,
        storageCapacityKg: storageCap,
        laboratoryAccess: labAccess
      },
      profileCode,
      suggestedSequence: sequence,
      equipmentIds: matchedEquipmentIds,
      inferredCapabilities: capabilities,
      sourcesSummary: answers.sources,
      productsSummary: answers.honeyTypes
    };
  },

  /**
   * Authoritative Confirmation & System Setup (§50, §51)
   * Saves into ProcessorProfileService and stores persistent audit record.
   */
  confirmAndSave(rawAnswers) {
    const answers = this.normalizeAnswers(rawAnswers);
    const interpretation = this.interpretAnswers(answers);

    // 1. Register organization & facility in system
    const saved = ProcessorProfileService.saveCustomOrganizationAndFacility({
      organizationName: interpretation.organization.name,
      organizationType: interpretation.organization.type,
      workDescription: answers.activity === 'PACK' ? 'RETAIL_PACKAGING' : 'HONEY_PROCESSING',
      businessScale: interpretation.facility.scale,
      state: interpretation.facility.state,
      district: interpretation.facility.district,
      facilityName: interpretation.facility.name,
      selectedEquipment: interpretation.equipmentIds,
      selectedProfileCode: interpretation.profileCode
    });

    // 2. Persist audit trail of raw answers vs system interpretation
    const auditRecord = {
      rawAnswers,
      normalizedAnswers: answers,
      systemInterpretation: interpretation,
      confirmedOrganization: saved.organization,
      confirmedFacility: saved.facility,
      confirmedCapabilities: interpretation.inferredCapabilities,
      savedAt: new Date().toISOString()
    };

    try {
      localStorage.setItem(PROCESSOR_AUTHORITATIVE_KEY, JSON.stringify(auditRecord));
    } catch (_) {}

    // Clear draft
    this.clearDraft();

    return auditRecord;
  },

  /**
   * Generates a readable human summary of what the system understood (§19, §20)
   */
  getHumanSummary(rawAnswers, lang = 'en') {
    const a = this.normalizeAnswers(rawAnswers);
    const interp = this.interpretAnswers(a);

    // Human Work Title
    let workText = 'Honey Processing';
    if (a.activity === 'PACK') workText = 'Honey Packaging & Bottling';
    else if (a.activity === 'DISTRIBUTE') workText = 'Honey Distribution & Wholesale';
    else if (a.activity === 'COLLECT') workText = 'Beekeeping & Honey Aggregation';

    // Human Setup Title
    let setupText = `${a.location.town ? a.location.town + ', ' : ''}${a.location.district}, ${a.location.state}`;
    if (a.workPlace === 'OWN_PLACE') setupText += ' (Private / Farm Setup)';
    else if (a.workPlace === 'COOPERATIVE') setupText += ' (Cooperative / Group Setup)';
    else if (a.workPlace === 'PROCESSING_UNIT') setupText += ' (Dedicated Processing Unit)';

    // Sources Text
    const sourceLabels = {
      OWN_HIVES: 'Own Colonies',
      LOCAL_BEEKEEPERS: 'Local Beekeepers',
      BEEKEEPER_GROUPS: "Beekeepers' Groups",
      OTHER_SUPPLIERS: 'Suppliers',
      VARIOUS: 'Forest/Wild Sources',
      NOT_SURE: 'General Sources'
    };
    const sourcesText = a.sources.map(s => sourceLabels[s] || s).join(' + ');

    // Process Routine Flow
    const actionLabels = {
      CHECK: 'Check',
      REMOVE_DEBRIS: 'Clean',
      FILTER: 'Filter',
      WARM: 'Warm',
      REDUCE_MOISTURE: 'Moisture Control',
      SETTLE: 'Settle',
      BLEND: 'Homogenize',
      PACK: 'Pack',
      STORE: 'Store'
    };
    const processFlow = a.processActions.map(p => actionLabels[p] || p).join(' → ');

    // Equipment Text
    const equipLabels = {
      STORAGE_TANK: 'Storage Tank',
      SETTLING_TANK: 'Settling Tank',
      FILTER: 'Filter',
      FINE_FILTER: 'Fine Mesh Filter',
      WARMING_EQUIPMENT: 'Warming Unit',
      MOISTURE_METER: 'Refractometer',
      WEIGHING_SCALE: 'Weighing Scale',
      FILLING_MACHINE: 'Filling Machine',
      SEALING_MACHINE: 'Sealer'
    };
    const equipList = a.equipment.filter(e => e !== 'NOT_SURE' && e !== 'DONT_KNOW').map(e => equipLabels[e] || e);
    const equipText = equipList.length > 0 ? equipList.join(' + ') : 'Standard manual apiculture tools';

    // Quality Text
    let qualityText = 'Visual check & refractometer screening';
    if (a.qualityCheck === 'LAB_TESTS' || a.qualityCheck === 'BOTH') {
      qualityText = 'Own screening + external NABL lab testing';
    } else if (a.qualityCheck === 'NO') {
      qualityText = 'Basic sensory inspection';
    }

    // Market Text
    const marketLabels = {
      LOCAL: 'Local village/town customers',
      RETAIL: 'Retail shops & supermarkets',
      BUSINESSES: 'Commercial brands & food units',
      DISTRIBUTORS: 'Wholesale distributors',
      EXPORT: 'Export markets',
      VARIOUS: 'Diverse channels'
    };
    const marketText = marketLabels[a.market] || 'Direct & local markets';

    return {
      work: workText,
      setup: setupText,
      sources: sourcesText,
      processFlow,
      equipment: equipText,
      quality: qualityText,
      market: marketText,
      scale: a.scale === 'SMALL' ? 'Small (~50 kg/day)' : a.scale === 'MEDIUM' ? 'Medium (50 - 500 kg/day)' : 'Commercial (500+ kg/day)',
      inferredCapabilitiesCount: interp.inferredCapabilities.length
    };
  }
};
