import type { SupportedLanguage } from '../types/agent.ts';
import { isSupportedLanguage } from '../types/agent.ts';

export { isSupportedLanguage };

export interface UiTranslations {
  // Common / Header
  appTitle: string;
  appSubtitle: string;
  offlineBadge: string;
  collegeDemoBadge: string;

  // Hero Section
  heroTitle: string;
  heroSubtitle: string;

  // Search Form
  searchPlaceholder: string;
  searchButton: string;
  searchingButton: string;
  clearInput: string;
  targetLanguageLabel: string;
  showFilters: string;
  hideFilters: string;
  filterStrength: string;
  filterUnit: string;
  filterFormulation: string;
  exampleQueriesLabel: string;

  // Medicine Fact Card
  verifiedMonographBadge: string;
  sourceReferenceNotice: string;
  sourceReferenceExplainer: string;
  noDosageTitle: string;
  noDosageNotice: string;
  verifiedBrandNames: string;
  aliasesLabel: string;
  activeIngredients: string;
  availableFormulations: string;
  therapeuticCategory: string;
  documentedUses: string;
  mechanismOfAction: string;
  seriousWarnings: string;
  contraindications: string;
  commonSideEffects: string;
  precautions: string;
  knownInteractions: string;
  storageHandling: string;
  missingParametersTitle: string;
  missingParametersNotice: string;
  missingDataReminder: string;
  monographSource: string;
  auditReview: string;
  explicitlyAbsent: string;
  unassessedInLabel: string;

  // AI Explanation Card
  aiExplanationTitle: string;
  aiExplanationSubtitle: string;
  experimentalAdvisoryTitle: string;
  experimentalAdvisoryBody: string;
  experimentalAdvisoryWarning: string;
  disclaimerFootnote: string;
  modelStatusTitle: string;

  // Ambiguity and Not Found Panels
  ambiguousTitle: string;
  ambiguousSubtitle: string;
  selectFormulationButton: string;
  notFoundTitle: string;
  notFoundSubtitle: string;
  suggestionsLabel: string;

  // Safety Disclaimer
  disclaimerTitle: string;
  disclaimerBody: string;
  emergencyTitle: string;
  emergencyBody: string;
}

export const TRANSLATIONS: Record<SupportedLanguage, UiTranslations> = {
  en: {
    appTitle: 'MediGuide AI',
    appSubtitle: 'Offline Medical Intelligence Agent',
    offlineBadge: 'Local Mode (100% Offline)',
    collegeDemoBadge: 'College Hackathon Demonstration Edition',
    heroTitle: 'Verified Medicine Information & Local AI Agent',
    heroSubtitle:
      'Search drug monographs with deterministic safety guards. Verified reference monographs are retrieved locally, and grounded clinical summaries are generated on device by MedGemma 4B IT (Q8_0) without cloud dependencies.',
    searchPlaceholder: 'Enter medicine name, active ingredient, or brand (e.g. Cetirizine)...',
    searchButton: 'Verify & Explain',
    searchingButton: 'Searching...',
    clearInput: 'Clear search input',
    targetLanguageLabel: 'Target Explanation Language',
    showFilters: '+ Add Specific Strength or Formulation Filter',
    hideFilters: '− Hide Disambiguation Filters',
    filterStrength: 'Specific Strength',
    filterUnit: 'Unit',
    filterFormulation: 'Dosage Form',
    exampleQueriesLabel: 'Quick Verified Queries:',
    verifiedMonographBadge: 'Verified Monograph',
    sourceReferenceNotice: 'Official Regulatory Source Record (English Original)',
    sourceReferenceExplainer:
      'The regulatory monograph facts below are preserved verbatim in their official published text to prevent translation ambiguity. A clear explanation in your selected language is generated below.',
    noDosageTitle: 'No Dosage Recommendations',
    noDosageNotice:
      'MediGuide AI identifies medicines and explains what they are in simple language. It does not provide dosage amounts, schedules, or individualized administration advice. Consult a licensed physician or pharmacist for clinical treatment.',
    verifiedBrandNames: 'Verified Brand Names',
    aliasesLabel: 'Aliases / Other Names',
    activeIngredients: 'Active Ingredients',
    availableFormulations: 'Available Formulation Forms',
    therapeuticCategory: 'Therapeutic Category',
    documentedUses: 'Documented General Uses',
    mechanismOfAction: 'Mechanism of Action',
    seriousWarnings: 'Serious Warnings & Boxed Warnings',
    contraindications: 'Contraindications',
    commonSideEffects: 'Common Side Effects',
    precautions: 'Precautions',
    knownInteractions: 'Known Drug Interactions',
    storageHandling: 'Storage & Safe Handling',
    missingParametersTitle: 'Unassessed / Missing Parameters in Primary Monograph:',
    missingParametersNotice: 'The official reviewed document does not contain documented data for:',
    missingDataReminder: 'Reminder: Missing data must never be interpreted as evidence that a risk does not exist.',
    monographSource: 'Monograph Source',
    auditReview: 'Audit / Review',
    explicitlyAbsent: 'Explicitly verified absent:',
    unassessedInLabel: 'Unassessed / Unavailable in verified label:',
    aiExplanationTitle: 'Grounded AI Explanation',
    aiExplanationSubtitle: 'Generated locally on device via',
    experimentalAdvisoryTitle: 'Experimental Non-English Translation Advisory',
    experimentalAdvisoryBody:
      'Local 4B language models for non-English languages (Telugu, Hindi, Tamil, Kannada, Malayalam) are experimental. Benchmark evaluations indicate potential phrasing inaccuracies, code-switching, or awkward translations.',
    experimentalAdvisoryWarning:
      'Always rely primarily on the verified source monograph above and consult a licensed healthcare professional.',
    disclaimerFootnote:
      'Note: This explanation is synthesized solely from verified reference facts. No outside facts or personalized dosages were permitted.',
    modelStatusTitle: 'Local Model Explanation Status',
    ambiguousTitle: 'Ambiguous Query Matches',
    ambiguousSubtitle: 'Your search matches multiple distinct medicine formulations. Please select your specific formulation below:',
    selectFormulationButton: 'Select This Formulation',
    notFoundTitle: 'Medicine Not Found in Verified Dataset',
    notFoundSubtitle:
      'No verified reference records matched your search query. MediGuide AI refuses to hallucinate unverified medicines.',
    suggestionsLabel: 'Did you mean:',
    disclaimerTitle: 'Clinical Reference Disclaimer',
    disclaimerBody:
      'MediGuide AI provides factual clinical reference summaries for educational and informational purposes only. It is not a substitute for professional clinical judgment, diagnosis, or personalized medical care. Never alter, commence, or discontinue medication regimens without consulting a qualified healthcare provider.',
    emergencyTitle: 'Poison Control / Emergency:',
    emergencyBody: 'In the event of a suspected adverse drug reaction or medical emergency, contact emergency medical services or poison control immediately.',
  },

  hi: {
    appTitle: 'MediGuide AI',
    appSubtitle: 'ऑफ़लाइन मेडिकल इंटेलिजेंस एजेंट',
    offlineBadge: 'लोकल मोड (100% ऑफ़लाइन)',
    collegeDemoBadge: 'कॉलेज हैकाथॉन प्रदर्शन संस्करण',
    heroTitle: 'सत्यापित दवा की जानकारी और लोकल एआई एजेंट',
    heroSubtitle:
      'सुरक्षा मानकों के साथ दवा मोनोग्राफ खोजें। सत्यापित संदर्भ रिकॉर्ड स्थानीय रूप से प्राप्त किए जाते हैं, और MedGemma 4B IT (Q8_0) द्वारा डिवाइस पर ही स्पष्टीकरण तैयार किया जाता है।',
    searchPlaceholder: 'दवा का नाम, सक्रिय घटक या ब्रांड दर्ज करें (उदा. Cetirizine)...',
    searchButton: 'सत्यापित करें और समझें',
    searchingButton: 'खोज रहे हैं...',
    clearInput: 'खोज इनपुट साफ़ करें',
    targetLanguageLabel: 'स्पष्टीकरण भाषा चुनें',
    showFilters: '+ विशिष्ट क्षमता या निर्माण फ़िल्टर जोड़ें',
    hideFilters: '− फ़िल्टर छुपाएं',
    filterStrength: 'विशिष्ट क्षमता (Strength)',
    filterUnit: 'इकाई (Unit)',
    filterFormulation: 'दवा का रूप (Dosage Form)',
    exampleQueriesLabel: 'त्वरित सत्यापित दवाएं:',
    verifiedMonographBadge: 'सत्यापित मोनोग्राफ',
    sourceReferenceNotice: 'आधिकारिक नियामक स्रोत रिकॉर्ड (मूल अंग्रेजी संदर्भ)',
    sourceReferenceExplainer:
      'नैदानिक सटीकता बनाए रखने और अनुवाद विकृति से बचने के लिए आधिकारिक नियामक मोनोग्राफ तथ्यों को मूल भाषा में रखा गया है। आपकी चुनी गई भाषा में सरल व्याख्या नीचे दी गई है।',
    noDosageTitle: 'खुराक की कोई सिफारिश नहीं',
    noDosageNotice:
      'MediGuide AI केवल दवा की पहचान करता है और सरल भाषा में बताता है कि वह क्या है। यह खुराक की मात्रा, समय-सारणी या व्यक्तिगत उपयोग की सलाह नहीं देता। उपचार के लिए हमेशा डॉक्टर या फार्मासिस्ट से परामर्श लें।',
    verifiedBrandNames: 'सत्यापित ब्रांड नाम',
    aliasesLabel: 'अन्य नाम / उपनाम',
    activeIngredients: 'सक्रिय घटक (Active Ingredients)',
    availableFormulations: 'उपलब्ध निर्माण रूप',
    therapeuticCategory: 'चिकित्सीय श्रेणी (Category)',
    documentedUses: 'प्रलेखित सामान्य उपयोग (Approved Uses)',
    mechanismOfAction: 'कार्य प्रणाली (Mechanism of Action)',
    seriousWarnings: 'गंभीर चेतावनियाँ (Warnings)',
    contraindications: 'निषेध और मतभेद (Contraindications)',
    commonSideEffects: 'सामान्य दुष्प्रभाव (Side Effects)',
    precautions: 'सावधानियां (Precautions)',
    knownInteractions: 'दवाओं का पारस्परिक प्रभाव (Interactions)',
    storageHandling: 'भंडारण और सुरक्षित रख-रखाव',
    missingParametersTitle: 'प्राथमिक मोनोग्राफ में अनुपेक्षित / अनुपलब्ध जानकारी:',
    missingParametersNotice: 'आधिकारिक समीक्षा दस्तावेज़ में निम्नलिखित के लिए प्रलेखित डेटा नहीं है:',
    missingDataReminder: 'स्मरण रहे: अनुपलब्ध डेटा को कभी भी जोखिम न होने का प्रमाण न मानें।',
    monographSource: 'मोनोग्राफ स्रोत',
    auditReview: 'समीक्षा / ऑडिट',
    explicitlyAbsent: 'स्पष्ट रूप से अनुपस्थित सत्यापित:',
    unassessedInLabel: 'सत्यापित लेबल में अनुपेक्षित / अनुपलब्ध:',
    aiExplanationTitle: 'लोकल एआई स्पष्टीकरण (Grounded Explanation)',
    aiExplanationSubtitle: 'डिवाइस पर स्थानीय रूप से निर्मित via',
    experimentalAdvisoryTitle: 'प्रायोगिक गैर-अंग्रेजी अनुवाद सूचना',
    experimentalAdvisoryBody:
      'क्षेत्रीय भाषाओं (हिंदी, तेलुगु, तमिल, कन्नड़, मलयालम) के लिए स्थानीय 4B भाषा मॉडल प्रायोगिक हैं। अनुवाद में शब्दावली अंतर या वाक्य रचना विसंगतियाँ हो सकती हैं।',
    experimentalAdvisoryWarning:
      'हमेशा ऊपर दिए गए सत्यापित स्रोत मोनोग्राफ पर प्राथमिक भरोसा करें और स्वास्थ्य पेशेवर से सलाह लें।',
    disclaimerFootnote:
      'नोट: यह स्पष्टीकरण केवल सत्यापित संदर्भ तथ्यों से तैयार किया गया है। कोई बाहरी तथ्य या खुराक शामिल नहीं है।',
    modelStatusTitle: 'लोकल मॉडल स्पष्टीकरण स्थिति',
    ambiguousTitle: 'अस्पष्ट खोज मिलान (कई रिकॉर्ड मिले)',
    ambiguousSubtitle: 'आपकी खोज कई अलग-अलग दवाओं से मेल खाती है। कृपया अपना विशिष्ट विकल्प चुनें:',
    selectFormulationButton: 'यह विकल्प चुनें',
    notFoundTitle: 'सत्यापित डेटाबेस में दवा नहीं मिली',
    notFoundSubtitle: 'आपकी खोज से कोई सत्यापित रिकॉर्ड मेल नहीं खाता। MediGuide AI अपुष्ट दवाओं का अनुमान नहीं लगाता।',
    suggestionsLabel: 'क्या आपका मतलब था:',
    disclaimerTitle: 'नैदानिक संदर्भ अस्वीकरण (Disclaimer)',
    disclaimerBody:
      'MediGuide AI केवल शैक्षिक और सूचनात्मक उद्देश्यों के लिए तथ्यात्मक संदर्भ प्रदान करता है। यह पेशेवर चिकित्सा निर्णय, निदान या व्यक्तिगत उपचार का विकल्प नहीं है। डॉक्टर की सलाह के बिना कभी भी दवा न बदलें।',
    emergencyTitle: 'आपातकालीन सहायता / विष नियंत्रण:',
    emergencyBody: 'किसी भी संदिग्ध प्रतिकूल दवा प्रतिक्रिया या आपात स्थिति में तुरंत आपातकालीन चिकित्सा सेवाओं से संपर्क करें।',
  },

  te: {
    appTitle: 'MediGuide AI',
    appSubtitle: 'ఆఫ్‌లైన్ మెడికల్ ఇంటెలిజెన్స్ ఏజెంట్',
    offlineBadge: 'లోకల్ మోడ్ (100% ఆఫ్‌లైన్)',
    collegeDemoBadge: 'కాలేజ్ హ్యాకథాన్ డెమో ఎడిషన్',
    heroTitle: 'ధృవీకరించబడిన ఔషధ సమాచారం & లోకల్ AI ఏజెంట్',
    heroSubtitle:
      'ఖచ్చితమైన భద్రతా నియమాలతో ఔషధ సమాచారాన్ని శోధించండి. ధృవీకరించబడిన మోనోగ్రాఫ్‌లు స్థానికంగా నిల్వ చేయబడతాయి మరియు MedGemma 4B IT (Q8_0) ద్వారా స్థానికంగా వివరణ లభిస్తుంది.',
    searchPlaceholder: 'ఔషధం పేరు, క్రియాశీల పదార్థం లేదా బ్రాండ్ నమోదు చేయండి (ఉదా. Cetirizine)...',
    searchButton: 'ధృవీకరించండి & వివరించండి',
    searchingButton: 'శోధిస్తోంది...',
    clearInput: 'శోధనను క్లియర్ చేయండి',
    targetLanguageLabel: 'వివరణ భాషను ఎంచుకోండి',
    showFilters: '+ నిర్దిష్ట మోతాదు లేదా రూపం ఫిల్టర్ జోడించండి',
    hideFilters: '− ఫిల్టర్లను దాచండి',
    filterStrength: 'నిర్దిష్ట సామర్థ్యం (Strength)',
    filterUnit: 'ప్రమాణం (Unit)',
    filterFormulation: 'ఔషధ రూపం (Dosage Form)',
    exampleQueriesLabel: 'ధృవీకరించబడిన ఉదాహరణలు:',
    verifiedMonographBadge: 'ధృవీకరించబడిన మోనోగ్రాఫ్',
    sourceReferenceNotice: 'అధికారిక రెగ్యులేటరీ మూల రికార్డు (ఆంగ్ల మూలం)',
    sourceReferenceExplainer:
      'వైద్య ఖచ్చితత్వాన్ని కాపాడటానికి అధికారిక మోనోగ్రాఫ్ వాస్తవాలు మూల భాషలోనే భద్రపరచబడ్డాయి. మీ ఎంపిక చేసుకున్న భాషలో సులభమైన వివరణ క్రింద ఇవ్వబడింది.',
    noDosageTitle: 'మోతాదు సిఫార్సులు లేవు',
    noDosageNotice:
      'MediGuide AI ఔషధాన్ని గుర్తిస్తుంది మరియు అది ఏమిటో సులభమైన భాషలో వివరిస్తుంది. ఇది మోతాదు పరిమాణాలు, షెడ్యూళ్ళు లేదా వ్యక్తిగత చికిత్స సలహాలను అందించదు. చికిత్స కోసం వైద్యుడిని సంప్రదించండి.',
    verifiedBrandNames: 'ధృవీకరించబడిన బ్రాండ్ పేర్లు',
    aliasesLabel: 'ఇతర పేర్లు / మారుపేర్లు',
    activeIngredients: 'క్రియాశీల పదార్థాలు (Active Ingredients)',
    availableFormulations: 'లభ్యమయ్యే ఔషధ రూపాలు',
    therapeuticCategory: 'చికిత్సా విభాగం (Therapeutic Category)',
    documentedUses: 'నిరూపిత సాధారణ ఉపయోగాలు (Documented Uses)',
    mechanismOfAction: 'పనిచేసే విధానం (Mechanism of Action)',
    seriousWarnings: 'తీవ్రమైన హెచ్చరికలు (Serious Warnings)',
    contraindications: 'వాడకూడని పరిస్థితులు (Contraindications)',
    commonSideEffects: 'సాధారణ దుష్ప్రభావాలు (Side Effects)',
    precautions: 'ముందుజాగ్రత్తలు (Precautions)',
    knownInteractions: 'ఇతర ఔషధాలతో పరస్పర చర్యలు (Interactions)',
    storageHandling: 'నిల్వ మరియు సురక్షిత నిర్వహణ',
    missingParametersTitle: 'ప్రాథమిక మోనోగ్రాఫ్‌లో లభ్యంకాని సమాచారం:',
    missingParametersNotice: 'అధికారిక సమీక్ష పత్రంలో క్రింది సమాచారం నమోదు కాలేదు:',
    missingDataReminder: 'గుర్తుంచుకోండి: నమోదుకాని సమాచారాన్ని ప్రమాదం లేదని భావించకూడదు.',
    monographSource: 'మోనోగ్రాఫ్ మూలం',
    auditReview: 'సమీక్ష / ఆడిట్',
    explicitlyAbsent: 'ఖచ్చితంగా లేదని ధృవీకరించబడింది:',
    unassessedInLabel: 'ధృవీకరించబడిన లేబుల్‌లో నమోదు కాలేదు:',
    aiExplanationTitle: 'స్థానిక AI వివరణ (Grounded Explanation)',
    aiExplanationSubtitle: 'పరికరంలో స్థానికంగా రూపొందించబడింది via',
    experimentalAdvisoryTitle: 'ప్రయోగాత్మక తెలుగు అనువాద సూచన',
    experimentalAdvisoryBody:
      'ప్రాంతీయ భాషల (తెలుగు, హిందీ మొదలైనవి) కోసం స్థానిక 4B మోడల్స్ ప్రయోగాత్మకమైనవి. అనువాదంలో కొన్ని పదాలు లేదా వాక్యాల అమరికలో తేడాలు ఉండవచ్చు.',
    experimentalAdvisoryWarning:
      'ఎల్లప్పుడూ పైన ఉన్న ధృవీకరించబడిన మూల మోనోగ్రాఫ్‌పై ఆధారపడండి మరియు అర్హత కలిగిన వైద్యుడిని సంప్రదించండి.',
    disclaimerFootnote:
      'గమనిక: ఈ వివరణ కేవలం ధృవీకరించబడిన వాస్తవాల ఆధారంగా మాత్రమే రూపొందించబడింది. ఎలాంటి మోతాదు వివరాలు అనుమతించబడవు.',
    modelStatusTitle: 'స్థానిక మోడల్ వివరణ స్థితి',
    ambiguousTitle: 'సందిగ్ధ ఔషధ సరిపోలికలు',
    ambiguousSubtitle: 'మీ శోధన బహుళ ఔషధ రకాలతో సరిపోలింది. దయచేసి నిర్దిష్ట రకాన్ని ఎంచుకోండి:',
    selectFormulationButton: 'ఈ రకాన్ని ఎంచుకోండి',
    notFoundTitle: 'ఔషధం డేటాబేస్‌లో కనుగొనబడలేదు',
    notFoundSubtitle: 'మీ శోధనకు సరిపోలే ధృవీకరించబడిన రికార్డులు లేవు. MediGuide AI తప్పుడు సమాచారాన్ని ఇవ్వదు.',
    suggestionsLabel: 'మీరు వెతుకుతున్నది ఇదేనా:',
    disclaimerTitle: 'వైద్య సూచన నిరాకరణ (Disclaimer)',
    disclaimerBody:
      'MediGuide AI కేవలం విద్యా మరియు సమాచార ప్రయోజనాల కోసం మాత్రమే వాస్తవిక సూచనలను అందిస్తుంది. ఇది వృత్తిపరమైన వైద్య నిర్ణయం లేదా వ్యక్తిగత చికిత్సకు ప్రత్యామ్నాయం కాదు.',
    emergencyTitle: 'అత్యవసర సహాయం / విష నియంత్రణ:',
    emergencyBody: 'ఏదైనా అనుమానాస్పద ఔషధ దుష్ప్రభావం లేదా అత్యవసర పరిస్థితిలో వెంటనే అత్యవసర వైద్య సేవలను సంప్రదించండి.',
  },

  ta: {
    appTitle: 'MediGuide AI',
    appSubtitle: 'ஆஃப்லைன் மருத்துவ தகவல் முகவர்',
    offlineBadge: 'உள்ளூர் பயன்முறை (100% ஆஃப்லைன்)',
    collegeDemoBadge: 'கல்லூரி ஹேக்கத்தான் பதிப்பு',
    heroTitle: 'சரிபார்க்கப்பட்ட மருந்து தகவல் & உள்ளூர் AI',
    heroSubtitle:
      'பாதுகாப்பு விதிகளுடன் மருந்து விவரங்களைத் தேடுங்கள். சரிபார்க்கப்பட்ட மோனோகிராஃப்கள் உள்ளூரில் சேமிக்கப்பட்டு MedGemma 4B IT (Q8_0) மூலம் விளக்கமளிக்கப்படுகின்றன.',
    searchPlaceholder: 'மருந்தின் பெயர் அல்லது பிராண்டை உள்ளிடவும் (எ.கா. Cetirizine)...',
    searchButton: 'சரிபார்த்து விவரிக்கவும்',
    searchingButton: 'தேடுகிறது...',
    clearInput: 'தேடலை அழிக்கவும்',
    targetLanguageLabel: 'விளக்க மொழியைத் தேர்ந்தெடுக்கவும்',
    showFilters: '+ குறிப்பிட்ட அளவு அல்லது வடிவமைப்பு வடிப்பானைச் சேர்க்கவும்',
    hideFilters: '− வடிப்பான்களை மறைக்கவும்',
    filterStrength: 'குறிப்பிட்ட அளவு (Strength)',
    filterUnit: 'அலகு (Unit)',
    filterFormulation: 'மருந்து வடிவம் (Dosage Form)',
    exampleQueriesLabel: 'சரிபார்க்கப்பட்ட உதாரணங்கள்:',
    verifiedMonographBadge: 'சரிபார்க்கப்பட்ட மோனோகிராஃப்',
    sourceReferenceNotice: 'அதிகாரப்பூர்வ ஒழுங்குமுறை மூல பதிவு (ஆங்கில மூலம்)',
    sourceReferenceExplainer:
      'மருத்துவ துல்லியத்தை உறுதிப்படுத்த அதிகாரப்பூர்வ மோனோகிராஃப் தகவல்கள் மூல மொழியில் பாதுகாக்கப்பட்டுள்ளன. உங்கள் மொழியில் எளிய விளக்கம் கீழே வழங்கப்பட்டுள்ளது.',
    noDosageTitle: 'அளவு பரிந்துரைகள் இல்லை',
    noDosageNotice:
      'MediGuide AI மருந்துகளை அடையாளம் கண்டு அவை என்னவென்று எளிய மொழியில் விளக்குகிறது. இது மருந்தளவு அல்லது சிகிச்சை பரிந்துரைகளை வழங்குவதில்லை. மருத்துவரை அணுகவும்.',
    verifiedBrandNames: 'சரிபார்க்கப்பட்ட பிராண்ட் பெயர்கள்',
    aliasesLabel: 'மாற்றுப் பெயர்கள்',
    activeIngredients: 'செயலில் உள்ள பொருட்கள்',
    availableFormulations: 'கிடைக்கும் வடிவங்கள்',
    therapeuticCategory: 'சிகிச்சை பிரிவு',
    documentedUses: 'ஆவணப்படுத்தப்பட்ட பயன்கள்',
    mechanismOfAction: 'செயல்படும் விதம்',
    seriousWarnings: 'முக்கிய எச்சரிக்கைகள்',
    contraindications: 'பயன்படுத்தக்கூடாத சூழ்நிலைகள்',
    commonSideEffects: 'பொதுவான பக்கவிளைவுகள்',
    precautions: 'முன்னெச்சரிக்கைகள்',
    knownInteractions: 'மருந்து இடைவினைகள்',
    storageHandling: 'சேமிப்பு மற்றும் பாதுகாப்பு',
    missingParametersTitle: 'மோனோகிராஃபில் ஆவணப்படுத்தப்படாத தகவல்கள்:',
    missingParametersNotice: 'அதிகாரப்பூர்வ ஆவணத்தில் பின்வரும் தகவல்கள் பதிவு செய்யப்படவில்லை:',
    missingDataReminder: 'நினைவூட்டல்: ஆவணப்படுத்தப்படாத தரவு ஆபத்து இல்லை என்பதற்கான ஆதாரமல்ல.',
    monographSource: 'மோனோகிராஃப் மூலம்',
    auditReview: 'மதிப்பாய்வு',
    explicitlyAbsent: 'வெளிப்படையாக இல்லை என சரிபார்க்கப்பட்டது:',
    unassessedInLabel: 'சரிபார்க்கப்பட்ட லேபிளில் கிடைக்கவில்லை:',
    aiExplanationTitle: 'உள்ளூர் AI விளக்கம்',
    aiExplanationSubtitle: 'சாதனத்தில் உள்ளூரில் உருவாக்கப்பட்டது via',
    experimentalAdvisoryTitle: 'சோதனை தமிழ் மொழிபெயர்ப்பு ஆலோசனை',
    experimentalAdvisoryBody:
      'தமிழ் மொழிக்கான உள்ளூர் 4B மொழி மாதிரிகள் சோதனைக்குரியவை. மொழிபெயர்ப்பில் சிறு சொல் முரண்பாடுகள் இருக்கலாம்.',
    experimentalAdvisoryWarning: 'எப்போதும் மேலே உள்ள சரிபார்க்கப்பட்ட மூல மோனோகிராஃபை நம்பி மருத்துவரை அணுகவும்.',
    disclaimerFootnote: 'குறிப்பு: இந்த விளக்கம் சரிபார்க்கப்பட்ட தகவல்களிலிருந்து மட்டுமே தொகுக்கப்பட்டது.',
    modelStatusTitle: 'உள்ளூர் மாதிரி விளக்கம் நிலை',
    ambiguousTitle: 'பல மருந்துப் பொருத்தங்கள்',
    ambiguousSubtitle: 'உங்கள் தேடல் பல மருந்து வகைகளுடன் பொருந்துகிறது. சரியானதைத் தேர்ந்தெடுக்கவும்:',
    selectFormulationButton: 'இதைத் தேர்ந்தெடுக்கவும்',
    notFoundTitle: 'மருந்து தரவுத்தளத்தில் கிடைக்கவில்லை',
    notFoundSubtitle: 'உங்கள் தேடலுடன் பொருந்தும் பதிவுகள் இல்லை. MediGuide AI தவறான தகவல்களை வழங்காது.',
    suggestionsLabel: 'நீங்கள் தேடியது இதையா:',
    disclaimerTitle: 'மருத்துவ மறுப்புரை',
    disclaimerBody: 'MediGuide AI கல்வி மற்றும் தகவல் நோக்கங்களுக்காக மட்டுமே தகவல்களை வழங்குகிறது.',
    emergencyTitle: 'அவசர உதவி:',
    emergencyBody: 'மருந்து ஒவ்வாமை அல்லது அவசர மருத்துவ தேவைக்கு உடனடியாக அவசர சேவைகளைத் தொடர்பு கொள்ளவும்.',
  },

  kn: {
    appTitle: 'MediGuide AI',
    appSubtitle: 'ಆಫ್‌ಲೈನ್ ವೈದ್ಯಕೀಯ ಮಾಹಿತಿ ಸಹಾಯಕ',
    offlineBadge: 'ಲೋಕಲ್ ಮೋಡ್ (100% ಆಫ್‌ಲೈನ್)',
    collegeDemoBadge: 'ಕಾಲೇಜು ಹ್ಯಾಕಥಾನ್ ಆವೃತ್ತಿ',
    heroTitle: 'ದೃಢೀಕರಿಸಿದ ಔಷಧ ಮಾಹಿತಿ ಮತ್ತು ಲೋಕಲ್ AI',
    heroSubtitle:
      'ಸುರಕ್ಷತಾ ಮಾನದಂಡಗಳೊಂದಿಗೆ ಔಷಧ ಮಾಹಿತಿಯನ್ನು ಹುಡುಕಿ. ಅಧಿಕೃತ ಮೊನೊಗ್ರಾಫ್‌ಗಳು ಸ್ಥಳೀಯವಾಗಿರುತ್ತವೆ ಮತ್ತು MedGemma 4B IT (Q8_0) ನಿಂದ ವಿವರಣೆ ನೀಡಲಾಗುತ್ತದೆ.',
    searchPlaceholder: 'ಔಷಧದ ಹೆಸರು, ಸಕ್ರಿಯ ಪದಾರ್ಥ ಅಥವಾ ಬ್ರಾಂಡ್ ನಮೂದಿಸಿ (ಉದಾ. Cetirizine)...',
    searchButton: 'ಪರಿಶೀಲಿಸಿ ಮತ್ತು ವಿವರಿಸಿ',
    searchingButton: 'ಹುಡುಕಲಾಗುತ್ತಿದೆ...',
    clearInput: 'ಹುಡುಕಾಟ ತೆರವುಗೊಳಿಸಿ',
    targetLanguageLabel: 'ವಿವರಣೆಯ ಭಾಷೆ ಆಯ್ಕೆಮಾಡಿ',
    showFilters: '+ ನಿರ್ದಿಷ್ಟ ಸಾಮರ್ಥ್ಯ ಅಥವಾ ರೂಪದ ಫಿಲ್ಟರ್ ಸೇರಿಸಿ',
    hideFilters: '− ಫಿಲ್ಟರ್‌ಗಳನ್ನು ಮರೆಮಾಡಿ',
    filterStrength: 'ನಿರ್ದಿಷ್ಟ ಸಾಮರ್ಥ್ಯ (Strength)',
    filterUnit: 'ಘಟಕ (Unit)',
    filterFormulation: 'ಔಷಧ ರೂಪ (Dosage Form)',
    exampleQueriesLabel: 'ಪರಿಶೀಲಿಸಿದ ಉದಾಹರಣೆಗಳು:',
    verifiedMonographBadge: 'ದೃಢೀಕರಿಸಿದ ಮೊನೊಗ್ರಾಫ್',
    sourceReferenceNotice: 'ಅಧಿಕೃತ ನಿಯಂತ್ರಕ ಮೂಲ ದಾಖಲೆ (ಮೂಲ ಇಂಗ್ಲಿಷ್)',
    sourceReferenceExplainer:
      'ವೈದ್ಯಕೀಯ ನಿಖರತೆಗಾಗಿ ಅಧಿಕೃತ ಮೊನೊಗ್ರಾಫ್ ಅಂಶಗಳನ್ನು ಮೂಲ ಭಾಷೆಯಲ್ಲೇ ಸಂರಕ್ಷಿಸಲಾಗಿದೆ. ನಿಮ್ಮ ಆಯ್ಕೆಯ ಭಾಷೆಯಲ್ಲಿ ಸರಳ ವಿವರಣೆಯನ್ನು ಕೆಳಗೆ ನೀಡಲಾಗಿದೆ.',
    noDosageTitle: 'ಯಾವುದೇ ಡೋಸೇಜ್ ಶಿಫಾರಸುಗಳಿಲ್ಲ',
    noDosageNotice:
      'MediGuide AI ಔಷಧವನ್ನು ಗುರುತಿಸುತ್ತದೆ ಮತ್ತು ಅದು ಏನೆಂದು ಸರಳವಾಗಿ ವಿವರಿಸುತ್ತದೆ. ಇದು ಡೋಸೇಜ್ ಪ್ರಮಾಣ ಅಥವಾ ಚಿಕಿತ್ಸಾ ಸಲಹೆ ನೀಡುವುದಿಲ್ಲ. ವೈದ್ಯರನ್ನು ಸಂಪರ್ಕಿಸಿ.',
    verifiedBrandNames: 'ದೃಢೀಕರಿಸಿದ ಬ್ರಾಂಡ್ ಹೆಸರುಗಳು',
    aliasesLabel: 'ಇತರ ಹೆಸರುಗಳು',
    activeIngredients: 'ಸಕ್ರಿಯ ಪದಾರ್ಥಗಳು',
    availableFormulations: 'ಲಭ್ಯವಿರುವ ಔಷಧ ರೂಪಗಳು',
    therapeuticCategory: 'ಚಿಕಿತ್ಸಾ ವರ್ಗ',
    documentedUses: 'ದಾಖಲಿತ ಸಾಮಾನ್ಯ ಉಪಯೋಗಗಳು',
    mechanismOfAction: 'ಕಾರ್ಯವಿಧಾನ (Mechanism of Action)',
    seriousWarnings: 'ಗಂಭೀರ ಎಚ್ಚರಿಕೆಗಳು',
    contraindications: 'ಬಳಸಬಾರದ ಸಂದರ್ಭಗಳು',
    commonSideEffects: 'ಸಾಮಾನ್ಯ ಅಡ್ಡಪರಿಣಾಮಗಳು',
    precautions: 'ಮುನ್ನೆಚ್ಚರಿಕೆಗಳು',
    knownInteractions: 'ಔಷಧ ಪರಸ್ಪರ ಕ್ರಿಯೆಗಳು',
    storageHandling: 'ಶೇಖರಣೆ ಮತ್ತು ಸುರಕ್ಷತೆ',
    missingParametersTitle: 'ಮೊನೊಗ್ರಾಫ್‌ನಲ್ಲಿ ದಾಖಲಾಗದ ಮಾಹಿತಿಗಳು:',
    missingParametersNotice: 'ಅಧಿಕೃತ ದಾಖಲೆಯಲ್ಲಿ ಈ ಕೆಳಗಿನ ಮಾಹಿತಿಯನ್ನು ದಾಖಲಿಸಲಾಗಿಲ್ಲ:',
    missingDataReminder: 'ನೆನಪಿಡಿ: ದಾಖಲಾಗದ ಮಾಹಿತಿಯು ಅಪಾಯವಿಲ್ಲ ಎಂಬ ಪುರಾವೆಯಲ್ಲ.',
    monographSource: 'ಮೊನೊಗ್ರಾಫ್ ಮೂಲ',
    auditReview: 'ಪರಿಶೀಲನೆ',
    explicitlyAbsent: 'ಇಲ್ಲವೆಂದು ಸ್ಪಷ್ಟವಾಗಿ ಪರಿಶೀಲಿಸಲಾಗಿದೆ:',
    unassessedInLabel: 'ದೃಢೀಕರಿಸಿದ ಲೇಬಲ್‌ನಲ್ಲಿ ಲಭ್ಯವಿಲ್ಲ:',
    aiExplanationTitle: 'ಸ್ಥಳೀಯ AI ವಿವರಣೆ',
    aiExplanationSubtitle: 'ಸಾಧನದಲ್ಲಿ ಸ್ಥಳೀಯವಾಗಿ ರಚಿಸಲಾಗಿದೆ via',
    experimentalAdvisoryTitle: 'ಪ್ರಾಯೋಗಿಕ ಕನ್ನಡ ಅನುವಾದ ಸೂಚನೆ',
    experimentalAdvisoryBody:
      'ಕನ್ನಡ ಭಾಷೆಗೆ ಸ್ಥಳೀಯ 4B ಮಾದರಿಗಳು ಪ್ರಾಯೋಗಿಕವಾಗಿವೆ. ಅನುವಾದದಲ್ಲಿ ಸಣ್ಣ ವ್ಯತ್ಯಾಸಗಳಿರಬಹುದು.',
    experimentalAdvisoryWarning: 'ಯಾವಾಗಲೂ ಮೇಲಿನ ದೃಢೀಕರಿಸಿದ ಮೂಲ ಮೊನೊಗ್ರಾಫ್ ಮೇಲೆ ಅವಲಂಬಿತವಾಗಿರಿ ಮತ್ತು ವೈದ್ಯರನ್ನು ಸಂಪರ್ಕಿಸಿ.',
    disclaimerFootnote: 'ಗಮನಿಸಿ: ಈ ವಿವರಣೆಯನ್ನು ಪರಿಶೀಲಿಸಿದ ಸತ್ಯಗಳಿಂದ ಮಾತ್ರ ಸಂಯೋಜಿಸಲಾಗಿದೆ.',
    modelStatusTitle: 'ಸ್ಥಳೀಯ ಮಾದರಿ ವಿವರಣೆಯ ಸ್ಥಿತಿ',
    ambiguousTitle: 'ಬಹು ಔಷಧ ಫಲಿತಾಂಶಗಳು',
    ambiguousSubtitle: 'ನಿಮ್ಮ ಹುಡುಕಾಟವು ಹಲವು ರೂಪಗಳಿಗೆ ಹೊಂದಿಕೆಯಾಗುತ್ತದೆ. ನಿರ್ದಿಷ್ಟವಾದದ್ದನ್ನು ಆಯ್ಕೆಮಾಡಿ:',
    selectFormulationButton: 'ಈ ರೂಪವನ್ನು ಆಯ್ಕೆಮಾಡಿ',
    notFoundTitle: 'ಔಷಧವು ಡೇಟಾಬೇಸ್‌ನಲ್ಲಿ ಕಂಡುಬಂದಿಲ್ಲ',
    notFoundSubtitle: 'ನಿಮ್ಮ ಹುಡುಕಾಟಕ್ಕೆ ಯಾವುದೇ ದಾಖಲೆಗಳು ಹೊಂದಿಕೆಯಾಗುತ್ತಿಲ್ಲ. MediGuide AI ಕಾಲ್ಪನಿಕ ಮಾಹಿತಿ ನೀಡುವುದಿಲ್ಲ.',
    suggestionsLabel: 'ನೀವು ಹುಡುಕುತ್ತಿರುವುದು ಇದೇನಾ:',
    disclaimerTitle: 'ವೈದ್ಯಕೀಯ ಹಕ್ಕುತ್ಯಾಗ',
    disclaimerBody: 'MediGuide AI ಕೇವಲ ಶೈಕ್ಷಣಿಕ ಮತ್ತು ಮಾಹಿತಿ ಉದ್ದೇಶಗಳಿಗಾಗಿ ಮಾತ್ರ ಸತ್ಯಗಳನ್ನು ಒದಗಿಸುತ್ತದೆ.',
    emergencyTitle: 'ತುರ್ತು ನೆರವು:',
    emergencyBody: 'ಯಾವುದೇ ಅಡ್ಡಪರಿಣಾಮ ಅಥವಾ ತುರ್ತು ಪರಿಸ್ಥಿತಿಯಲ್ಲಿ ತಕ್ಷಣ ತುರ್ತು ವೈದ್ಯಕೀಯ ಸೇವೆಗಳನ್ನು ಸಂಪರ್ಕಿಸಿ.',
  },

  ml: {
    appTitle: 'MediGuide AI',
    appSubtitle: 'ഓഫ്‌ലൈൻ മെഡിക്കൽ ഇൻ്റലിജൻസ് അസിസ്റ്റൻ്റ്',
    offlineBadge: 'ലോക്കൽ മോഡ് (100% ഓഫ്‌ലൈൻ)',
    collegeDemoBadge: 'കോളേജ് ഹാക്കത്തോൺ എഡിഷൻ',
    heroTitle: 'സ്ഥിരീകരിച്ച മരുന്ന് വിവരങ്ങളും ലോക്കൽ AI യും',
    heroSubtitle:
      'സുരക്ഷാ മാനദണ്ഡങ്ങളോടെ മരുന്ന് വിവരങ്ങൾ തിരയുക. പരിശോധിച്ച മോണോഗ്രാഫുകൾ ലോക്കലായി സൂക്ഷിക്കുകയും MedGemma 4B IT (Q8_0) വഴി വിശദീകരിക്കുകയും ചെയ്യുന്നു.',
    searchPlaceholder: 'മരുന്നിന്റെ പേര്, ചേരുവ അല്ലെങ്കിൽ ബ്രാൻഡ് നൽകുക (ഉദാ. Cetirizine)...',
    searchButton: 'പരിശോധിച്ച് വിശദീകരിക്കുക',
    searchingButton: 'തിരയുന്നു...',
    clearInput: 'തിരയൽ മായ്ക്കുക',
    targetLanguageLabel: 'വിശദീകരണ ഭാഷ തിരഞ്ഞെടുക്കുക',
    showFilters: '+ നിർദ്ദിഷ്ട അളവ് അല്ലെങ്കിൽ ഫോർമുലേഷൻ ഫിൽട്ടർ ചേർക്കുക',
    hideFilters: '− ഫിൽട്ടറുകൾ മറയ്ക്കുക',
    filterStrength: 'നിർദ്ദിഷ്ട അളവ് (Strength)',
    filterUnit: 'യൂണിറ്റ് (Unit)',
    filterFormulation: 'മരുന്ന് രൂപം (Dosage Form)',
    exampleQueriesLabel: 'സ്ഥിരീകരിച്ച ഉദാഹരണങ്ങൾ:',
    verifiedMonographBadge: 'സ്ഥിരീകരിച്ച മോണോഗ്രാഫ്',
    sourceReferenceNotice: 'ഔദ്യോഗിക റെഗുലേറ്ററി റെക്കോർഡ് (യഥാർത്ഥ ഇംഗ്ലീഷ്)',
    sourceReferenceExplainer:
      'ക്ലിനിക്കൽ കൃത്യത ഉറപ്പാക്കാൻ ഔദ്യോഗിക വിവരങ്ങൾ അതേപടി നിലനിർത്തിയിരിക്കുന്നു. നിങ്ങൾ തിരഞ്ഞെടുത്ത ഭാഷയിലുള്ള വിശദീകരണം താഴെ നൽകിയിട്ടുണ്ട്.',
    noDosageTitle: 'ഡോസേജ് നിർദ്ദേശങ്ങൾ ഇല്ല',
    noDosageNotice:
      'MediGuide AI മരുന്നുകളെ തിരിച്ചറിയുകയും ലളിതമായ ഭാഷയിൽ വിശദീകരിക്കുകയും ചെയ്യുന്നു. ഇത് ഡോസ് അളവോ നിർദ്ദേശങ്ങളോ നൽകുന്നില്ല. ഡോക്ടറെ സമീപിക്കുക.',
    verifiedBrandNames: 'സ്ഥിരീകരിച്ച ബ്രാൻഡ് പേരുകൾ',
    aliasesLabel: 'മറ്റു പേരുകൾ',
    activeIngredients: 'പ്രധാന ചേരുവകൾ',
    availableFormulations: 'ലഭ്യമായ രൂപങ്ങൾ',
    therapeuticCategory: 'ചികിത്സാ വിഭാഗം',
    documentedUses: 'അംഗീകൃത ഉപയോഗങ്ങൾ',
    mechanismOfAction: 'പ്രവർത്തനരീതി',
    seriousWarnings: 'പ്രധാന മുന്നറിയിപ്പുകൾ',
    contraindications: 'ഉപയോഗിക്കാൻ പാടില്ലാത്ത സാഹചര്യങ്ങൾ',
    commonSideEffects: 'സാധാരണ പാർശ്വഫലങ്ങൾ',
    precautions: 'മുൻകരുതലുകൾ',
    knownInteractions: 'മരുന്ന് പ്രതിപ്രവർത്തനങ്ങൾ',
    storageHandling: 'സൂക്ഷിക്കേണ്ട രീതി',
    missingParametersTitle: 'രേഖപ്പെടുത്താത്ത വിവരങ്ങൾ:',
    missingParametersNotice: 'ഔദ്യോഗിക രേഖയിൽ താഴെ പറയുന്ന വിവരങ്ങൾ ലഭ്യമല്ല:',
    missingDataReminder: 'ഓർക്കുക: രേഖപ്പെടുത്താത്ത വിവരം അപകടസാധ്യതയില്ല എന്നതിന് തെളിവല്ല.',
    monographSource: 'ഉറവിടം',
    auditReview: 'പരിശോധന',
    explicitlyAbsent: 'ഇല്ലെന്ന് വ്യക്തമായി സ്ഥിരീകരിച്ചു:',
    unassessedInLabel: 'രേഖകളിൽ ലഭ്യമല്ല:',
    aiExplanationTitle: 'ലോക്കൽ AI വിശദീകരണം',
    aiExplanationSubtitle: 'ഉപകരണത്തിൽ ലോക്കലായി നിർമ്മിച്ചത് via',
    experimentalAdvisoryTitle: 'പരീക്ഷണാടിസ്ഥാനത്തിലുള്ള മലയാളം വിവർത്തന മുന്നറിയിപ്പ്',
    experimentalAdvisoryBody:
      'മലയാളം പോലെയുള്ള പ്രാദേശിക ഭാഷകൾക്കുള്ള 4B മോഡലുകൾ പരീക്ഷണാടിസ്ഥാനത്തിലുള്ളതാണ്. വിവർത്തനത്തിൽ വ്യത്യാസങ്ങൾ ഉണ്ടാകാം.',
    experimentalAdvisoryWarning: 'എപ്പോഴും മുകളിലുള്ള അംഗീകൃത മോണോഗ്രാഫിനെ ആശ്രയിക്കുകയും ഡോക്ടറെ സമീപിക്കുകയും ചെയ്യുക.',
    disclaimerFootnote: 'ശ്രദ്ധിക്കുക: ഈ വിവരണം പരിശോധിച്ച വസ്തുതകളിൽ നിന്ന് മാത്രം തയ്യാറാക്കിയതാണ്.',
    modelStatusTitle: 'ലോക്കൽ മോഡൽ വിശദീകരണ നില',
    ambiguousTitle: 'ഒന്നിലധികം മരുന്ന് ഫലങ്ങൾ',
    ambiguousSubtitle: 'നിങ്ങൾ തിരഞ്ഞത് ഒന്നിലധികം ഇനങ്ങളുമായി പൊരുത്തപ്പെടുന്നു. ശരിയായത് തിരഞ്ഞെടുക്കുക:',
    selectFormulationButton: 'ഇത് തിരഞ്ഞെടുക്കുക',
    notFoundTitle: 'മരുന്ന് ഡാറ്റാബേസിൽ കണ്ടെത്തിയില്ല',
    notFoundSubtitle: 'നിങ്ങൾ തിരഞ്ഞ മരുന്നിന്റെ വിവരങ്ങൾ ലഭ്യമല്ല. തെറ്റായ വിവരങ്ങൾ MediGuide AI നൽകില്ല.',
    suggestionsLabel: 'ഇതാണോ ഉദ്ദേശിച്ചത്:',
    disclaimerTitle: 'മെഡിക്കൽ നിരാകരണം',
    disclaimerBody: 'MediGuide AI അറിവിലേക്കായി മാത്രമുള്ള വിവരങ്ങൾ നൽകുന്നു. ഇത് ഡോക്ടറുടെ ഉപദേശത്തിന് പകരമല്ല.',
    emergencyTitle: 'അടിയന്തര സഹായം:',
    emergencyBody: 'പാർശ്വഫലങ്ങളോ അടിയന്തര സാഹചര്യങ്ങളോ ഉണ്ടായാൽ ഉടൻ അടിയന്തര വൈദ്യസഹായം തേടുക.',
  },

  es: {
    appTitle: 'MediGuide AI',
    appSubtitle: 'Agente de Inteligencia Médica Offline',
    offlineBadge: 'Modo Local (100% Offline)',
    collegeDemoBadge: 'Edición de Demostración para Hackathon Universitario',
    heroTitle: 'Información Verificada de Medicamentos y Agente IA Local',
    heroSubtitle:
      'Busque monografías de medicamentos con protección determinista. Las monografías de referencia verificadas se recuperan localmente y los resúmenes clínicos se generan en el dispositivo mediante MedGemma 4B IT (Q8_0) sin dependencias en la nube.',
    searchPlaceholder: 'Ingrese nombre del medicamento, ingrediente activo o marca (ej. Cetirizina)...',
    searchButton: 'Verificar y Explicar',
    searchingButton: 'Buscando...',
    clearInput: 'Borrar búsqueda',
    targetLanguageLabel: 'Idioma de Explicación',
    showFilters: '+ Agregar Filtro de Concentración o Forma Farmacéutica',
    hideFilters: '− Ocultar Filtros de Desambiguación',
    filterStrength: 'Concentración Específica',
    filterUnit: 'Unidad',
    filterFormulation: 'Forma Farmacéutica',
    exampleQueriesLabel: 'Consultas Verificadas Rápidas:',
    verifiedMonographBadge: 'Monografía Verificada',
    sourceReferenceNotice: 'Registro Regulatorio Oficial de Origen (Inglés Original)',
    sourceReferenceExplainer:
      'Los datos de la monografía regulatoria se conservan textualmente en su idioma oficial de publicación para evitar distorsiones en la traducción. A continuación se genera una explicación accesible en el idioma seleccionado.',
    noDosageTitle: 'Sin Recomendaciones de Dosificación',
    noDosageNotice:
      'MediGuide AI identifica medicamentos y explica qué son en lenguaje sencillo. No proporciona cantidades de dosificación, horarios ni consejos de administración personalizados. Consulte a un médico o farmacéutico con licencia para el tratamiento clínico.',
    verifiedBrandNames: 'Marcas Comerciales Verificadas',
    aliasesLabel: 'Alias / Otros Nombres',
    activeIngredients: 'Ingredientes Activos',
    availableFormulations: 'Formas Farmacéuticas Disponibles',
    therapeuticCategory: 'Categoría Terapéutica',
    documentedUses: 'Usos Generales Documentados',
    mechanismOfAction: 'Mecanismo de Acción',
    seriousWarnings: 'Advertencias Graves y Advertencias en Recuadro',
    contraindications: 'Contraindicaciones',
    commonSideEffects: 'Efectos Secundarios Comunes',
    precautions: 'Precauciones',
    knownInteractions: 'Interacciones Medicamentosas Conocidas',
    storageHandling: 'Almacenamiento y Manipulación Segura',
    missingParametersTitle: 'Parámetros no evaluados o faltantes en la monografía principal:',
    missingParametersNotice: 'El documento oficial revisado no contiene datos documentados para:',
    missingDataReminder: 'Recordatorio: Los datos faltantes nunca deben interpretarse como evidencia de que un riesgo no existe.',
    monographSource: 'Fuente de la Monografía',
    auditReview: 'Auditoría / Revisión',
    explicitlyAbsent: 'Explícitamente verificado ausente:',
    unassessedInLabel: 'No evaluado / no disponible en la etiqueta verificada:',
    aiExplanationTitle: 'Explicación de IA Basada en Evidencia',
    aiExplanationSubtitle: 'Generada localmente en el dispositivo mediante',
    experimentalAdvisoryTitle: 'Aviso de Traducción Experimental',
    experimentalAdvisoryBody:
      'Los modelos de lenguaje locales para idiomas distintos del inglés son experimentales. Siempre consulte la monografía de referencia original anterior.',
    experimentalAdvisoryWarning:
      'Confíe siempre principalmente en la monografía verificada anterior y consulte a un profesional de la salud.',
    disclaimerFootnote:
      'Nota: Esta explicación se sintetiza únicamente a partir de hechos de referencia verificados. No se permitieron hechos externos ni dosis personalizadas.',
    modelStatusTitle: 'Estado de la Explicación del Modelo Local',
    ambiguousTitle: 'Coincidencias Ambiguas en la Consulta',
    ambiguousSubtitle:
      'Su búsqueda coincide con múltiples formulaciones de medicamentos distintas. Por favor seleccione su formulación específica a continuación:',
    selectFormulationButton: 'Seleccionar Esta Formulación',
    notFoundTitle: 'Medicamento No Encontrado en el Conjunto de Datos Verificado',
    notFoundSubtitle:
      'Ningún registro de referencia verificado coincidió con su consulta de búsqueda. MediGuide AI se niega a inventar medicamentos no verificados.',
    suggestionsLabel: '¿Quiso decir:',
    disclaimerTitle: 'Descargo de Responsabilidad de Referencia Clínica',
    disclaimerBody:
      'MediGuide AI proporciona resúmenes de referencia clínica fácticos únicamente con fines educativos e informativos. No sustituye el juicio clínico profesional, el diagnóstico ni la atención médica personalizada.',
    emergencyTitle: 'Control de Envenenamiento / Emergencias:',
    emergencyBody:
      'En caso de sospecha de reacción adversa a un medicamento o emergencia médica, comuníquese de inmediato con los servicios médicos de emergencia o con el centro de control de envenenamiento.',
  },

  fr: {
    appTitle: 'MediGuide AI',
    appSubtitle: "Agent d'Intelligence Médicale Hors Ligne",
    offlineBadge: 'Mode Local (100% Hors Ligne)',
    collegeDemoBadge: 'Édition de Démonstration pour Hackathon Universitaire',
    heroTitle: 'Informations Médicamenteuses Vérifiées et Agent IA Local',
    heroSubtitle:
      "Recherchez des monographies de médicaments avec des protections déterministes. Les monographies de référence vérifiées sont récupérées localement et les résumés cliniques sont générés sur l'appareil par MedGemma 4B IT (Q8_0) sans dépendance cloud.",
    searchPlaceholder: 'Entrez le nom du médicament, le principe actif ou la marque (ex. Cétirizine)...',
    searchButton: 'Vérifier et Expliquer',
    searchingButton: 'Recherche en cours...',
    clearInput: 'Effacer la recherche',
    targetLanguageLabel: "Langue de l'explication",
    showFilters: '+ Ajouter un Filtre de Dosage ou de Forme Pharmaceutique',
    hideFilters: '− Masquer les Filtres de Désambiguïsation',
    filterStrength: 'Dosage Spécifique',
    filterUnit: 'Unité',
    filterFormulation: 'Forme Pharmaceutique',
    exampleQueriesLabel: 'Requêtes Vérifiées Rapides :',
    verifiedMonographBadge: 'Monographie Vérifiée',
    sourceReferenceNotice: 'Dossier Réglementaire Officiel Source (Original Anglais)',
    sourceReferenceExplainer:
      "Les faits de la monographie réglementaire sont conservés textuellement dans leur langue officielle de publication afin d'éviter toute ambiguïté de traduction. Une explication claire dans la langue sélectionnée est générée ci-dessous.",
    noDosageTitle: 'Aucune Recommandation de Dosage',
    noDosageNotice:
      "MediGuide AI identifie les médicaments et explique ce qu'ils sont en langage simple. Il ne fournit pas de quantités de dosage, d'horaires ni de conseils d'administration individualisés. Consultez un médecin ou un pharmacien agréé pour tout traitement clinique.",
    verifiedBrandNames: 'Noms Commerciaux Vérifiés',
    aliasesLabel: 'Alias / Autres Noms',
    activeIngredients: 'Principes Actifs',
    availableFormulations: 'Formes Pharmaceutiques Disponibles',
    therapeuticCategory: 'Classe Thérapeutique',
    documentedUses: 'Indications Générales Documentées',
    mechanismOfAction: "Mécanisme d'Action",
    seriousWarnings: 'Mises en Garde Graves et Avertissements Encadrés',
    contraindications: 'Contre-indications',
    commonSideEffects: 'Effets Indésirables Fréquents',
    precautions: 'Précautions',
    knownInteractions: 'Interactions Médicamenteuses Connues',
    storageHandling: 'Stockage et Manipulation Sécurisée',
    missingParametersTitle: 'Paramètres non évalués ou manquants dans la monographie principale :',
    missingParametersNotice: 'Le document officiel révisé ne contient pas de données documentées pour :',
    missingDataReminder: "Rappel : Les données manquantes ne doivent jamais être interprétées comme la preuve de l'absence de risque.",
    monographSource: 'Source de la Monographie',
    auditReview: 'Audit / Révision',
    explicitlyAbsent: 'Explicitement vérifié absent :',
    unassessedInLabel: 'Non évalué / indisponible sur la notice vérifiée :',
    aiExplanationTitle: 'Explication IA Basée sur les Faits',
    aiExplanationSubtitle: "Générée localement sur l'appareil via",
    experimentalAdvisoryTitle: 'Avis de Traduction Expérimentale',
    experimentalAdvisoryBody:
      'Les modèles de langage locaux pour les langues autres que l’anglais sont expérimentaux. Fiez-vous toujours principalement à la monographie de référence ci-dessus.',
    experimentalAdvisoryWarning:
      'Fiez-vous toujours principalement à la monographie vérifiée ci-dessus et consultez un professionnel de la santé agréé.',
    disclaimerFootnote:
      'Remarque : Cette explication est synthétisée uniquement à partir de faits de référence vérifiés. Aucun fait extérieur ni dosage personnalisé n’a été autorisé.',
    modelStatusTitle: "Statut de l'Explication du Modèle Local",
    ambiguousTitle: 'Correspondances de Requête Ambiguës',
    ambiguousSubtitle:
      'Votre recherche correspond à plusieurs formulations de médicaments distinctes. Veuillez sélectionner votre formulation spécifique ci-dessous :',
    selectFormulationButton: 'Sélectionner Cette Formulation',
    notFoundTitle: 'Médicament Non Trouvé dans la Base de Données Vérifiée',
    notFoundSubtitle:
      'Aucun enregistrement de référence vérifié ne correspond à votre recherche. MediGuide AI refuse d’inventer des médicaments non vérifiés.',
    suggestionsLabel: 'Vouliez-vous dire :',
    disclaimerTitle: 'Avis de Non-Responsabilité Médicale',
    disclaimerBody:
      "MediGuide AI fournit des résumés de référence clinique factuels à des fins éducatives et informatives uniquement. Il ne remplace pas le jugement clinique professionnel, le diagnostic ni les soins médicaux personnalisés.",
    emergencyTitle: 'Centre Antipoison / Urgences :',
    emergencyBody:
      "En cas de suspicion d'effet indésirable ou d'urgence médicale, contactez immédiatement les services médicaux d'urgence ou le centre antipoison.",
  },
};

export function getTranslation(language: SupportedLanguage): UiTranslations {
  return TRANSLATIONS[language] || TRANSLATIONS.en;
}
