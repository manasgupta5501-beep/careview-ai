import { AskResponse, Language } from '@/types';
import { HOSPITAL_KNOWLEDGE_BASE, HOSPITAL_METADATA } from './hospitalKnowledge';

// Medical emergency keywords that must trigger urgent escalation immediately
const EMERGENCY_KEYWORDS = [
  'chest pain', 'heart attack', 'cant breathe', "can't breathe", 'cannot breathe',
  'breathless', 'shortness of breath', 'bleeding', 'fell', 'fallen', 'seizure',
  'unconscious', 'fainted', 'emergency', 'dying', 'stroke', 'headache severe',
  'दर्द', 'सीने', 'सांस', 'खून', 'गिर गया', 'चक्कर', 'इमरजेंसी'
];

// Clinical diagnostic questions that should be redirected to medical staff
const MEDICAL_ADVICE_KEYWORDS = [
  'medication', 'medicine should i take', 'dosage', 'prescription', 'side effect',
  'diagnose', 'blood pressure reading', 'glucose reading', 'is my fever bad',
  'दवा', 'गोली', 'बुखार'
];

export async function processHospitalQuestion(
  question: string,
  language: Language = 'en',
  roomNumber: string = HOSPITAL_METADATA.defaultRoom
): Promise<AskResponse> {
  const cleanQuery = (question || '').trim().toLowerCase();

  // 1. Safety Guardrail: Immediate Acute Emergency Escalation
  const isEmergency = EMERGENCY_KEYWORDS.some(kw => cleanQuery.includes(kw));
  if (isEmergency) {
    if (language === 'hi') {
      return {
        answer: "अति महत्वपूर्ण आपातकालीन चेतावनी: यह गंभीर लग रहा है। कृपया अपने बिस्तर के पास लगे लाल नर्स कॉल बटन को तुरंत दबाएं या आपातकालीन कॉर्ड खींचें। CareView AI मेडिकल आपात स्थिति का इलाज नहीं कर सकता।",
        spokenAnswer: "कृपया अपने बिस्तर के पास लगे लाल नर्स कॉल बटन को तुरंत दबाएं। अस्पताल की मेडिकल टीम तुरंत आ रही है।",
        category: "emergency",
        source: "local-knowledge-base",
        modelUsed: "Emergency Safety Triage",
        escalation: true,
        emergencyWarning: "RED ALERT: Use bedside nurse call button immediately."
      };
    }

    return {
      answer: "CRITICAL ALERT: This requires immediate medical attention. Press the RED emergency nurse call button right beside your pillow or pull the bathroom emergency cord now. CareView AI is not an emergency response monitor.",
      spokenAnswer: "Please press your red nurse call button right now. The floor nurse and emergency team are stationed nearby to assist you immediately.",
      category: "emergency",
      source: "local-knowledge-base",
      modelUsed: "Emergency Safety Triage",
      escalation: true,
      emergencyWarning: "RED ALERT: Bedside emergency call button required."
    };
  }

  // 2. Safety Guardrail: Medical Advice / Drug Prescription Request
  const isMedicalAdvice = MEDICAL_ADVICE_KEYWORDS.some(kw => cleanQuery.includes(kw));
  if (isMedicalAdvice) {
    if (language === 'hi') {
      return {
        answer: "चिकित्सा सुरक्षा सूचना: CareView AI दवाइयों की सलाह या रोग निदान प्रदान नहीं कर सकता। कृपया अपनी फ्लोर नर्स (Ext 400) या डॉक्टर से परामर्श करें।",
        spokenAnswer: "कृपया अपनी नर्स या डॉक्टर से दवा के बारे में पूछें। मैं सीधे दवा की सलाह नहीं दे सकता।",
        category: "services",
        source: "local-knowledge-base",
        modelUsed: "Clinical Safety Policy",
        escalation: true
      };
    }

    return {
      answer: "Medical Safety Policy: CareView AI cannot recommend medications, alter dosages, or diagnose symptoms. Please speak directly with your attending physician or floor nurse (Ext 400).",
      spokenAnswer: "For your safety, please ask your doctor or nurse about your medications. I cannot provide medical advice.",
      category: "services",
      source: "local-knowledge-base",
      modelUsed: "Clinical Safety Policy",
      escalation: true
    };
  }

  // 3. Check for Live AI Provider (OpenAI, Gemini, Anthropic)
  const openAiKey = process.env.OPENAI_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  if (openAiKey) {
    try {
      return await queryOpenAI(question, language, roomNumber, openAiKey);
    } catch (err) {
      console.warn("OpenAI API call failed, falling back to local knowledge engine:", err);
    }
  } else if (geminiKey) {
    try {
      return await queryGemini(question, language, roomNumber, geminiKey);
    } catch (err) {
      console.warn("Gemini API call failed, falling back to local knowledge engine:", err);
    }
  } else if (anthropicKey) {
    try {
      return await queryAnthropic(question, language, roomNumber, anthropicKey);
    } catch (err) {
      console.warn("Anthropic API call failed, falling back to local knowledge engine:", err);
    }
  }

  // 4. Built-in Deterministic Knowledge Engine (Demo Mode)
  return runDeterministicKnowledgeEngine(cleanQuery, language, roomNumber);
}

/**
 * Built-in Knowledge Base Engine
 * Accurately answers hospital queries from configured facts without external dependencies.
 */
function runDeterministicKnowledgeEngine(
  query: string,
  language: Language,
  roomNumber: string
): AskResponse {
  const isHi = language === 'hi';

  // Cafeteria / Food / Meals / Drinks
  if (
    query.includes('cafeteria') || query.includes('food') || query.includes('lunch') ||
    query.includes('dinner') || query.includes('breakfast') || query.includes('coffee') ||
    query.includes('eat') || query.includes('tea') || query.includes('कैफेटेरिया') ||
    query.includes('खाना') || query.includes('नाश्ता') || query.includes('चाय')
  ) {
    const item = HOSPITAL_KNOWLEDGE_BASE.find(k => k.id === 'cafeteria-dining')!;
    if (isHi) {
      return {
        answer: `${item.titleHi}: अस्पताल का कैफेटेरिया ग्राउंड फ्लोर, विंग बी (बगीचे के पास) में है। यह प्रतिदिन सुबह 7:00 से रात 9:30 बजे तक खुला रहता है। मरीजों का नियमित भोजन सीधे आपके कमरे ${roomNumber} में नाश्ता 7:30 AM, दोपहर 12:30 PM, और रात 7:00 PM पर दिया जाता है।`,
        spokenAnswer: `कैफेटेरिया ग्राउंड फ्लोर पर विंग बी में है। यह सुबह सात से रात साढ़े नौ बजे तक खुला है। मरीजों का खाना सीधे कमरे में पहुंचाया जाता है।`,
        category: "cafeteria",
        source: "local-knowledge-base",
        modelUsed: "Hospital Knowledge Base (Demo Engine)",
        suggestedFollowUpsHi: ["कैफेटेरिया का मेनू क्या है?", "क्या मुझे गर्म पानी मिल सकता है?"]
      };
    }
    return {
      answer: `${item.title}: The cafeteria is located on the Ground Floor, Wing B (near the garden courtyard). It is open daily from 7:00 AM to 9:30 PM. For inpatients in ${roomNumber}, prescribed meals are served directly at bedside at 7:30 AM (Breakfast), 12:30 PM (Lunch), and 7:00 PM (Dinner).`,
      spokenAnswer: `The cafeteria is on the Ground Floor in Wing B. It is open from 7 AM to 9:30 PM daily. Inpatient meals are delivered directly to your room.`,
      category: "cafeteria",
      source: "local-knowledge-base",
      modelUsed: "Hospital Knowledge Base (Demo Engine)",
      suggestedFollowUps: ["When is breakfast served?", "Can I get warm water at bedside?"]
    };
  }

  // Visiting Hours / Family / Visitors
  if (
    query.includes('visit') || query.includes('hours') || query.includes('family') ||
    query.includes('guest') || query.includes('see me') || query.includes('time') ||
    query.includes('मुलाकात') || query.includes('मिलने') || query.includes('समय')
  ) {
    const item = HOSPITAL_KNOWLEDGE_BASE.find(k => k.id === 'visiting-hours')!;
    if (isHi) {
      return {
        answer: `${item.titleHi}: सामान्य वार्डों में मुलाकात का समय प्रतिदिन सुबह 10:00 से दोपहर 1:00 और शाम 4:00 से रात 8:00 बजे तक है। मरीजों के आराम के लिए एक समय में बिस्तर के पास केवल 2 आगंतुकों की अनुमति है। रात 9:00 बजे से शांत समय शुरू होता है।`,
        spokenAnswer: `मुलाकात का समय सुबह दस से दोपहर एक बजे तक और शाम चार से रात आठ बजे तक है। एक समय में दो लोगों की अनुमति है।`,
        category: "visiting",
        source: "local-knowledge-base",
        modelUsed: "Hospital Knowledge Base (Demo Engine)",
        suggestedFollowUpsHi: ["आईसीयू में मिलने का समय क्या है?", "क्या बच्चे आ सकते हैं?"]
      };
    }
    return {
      answer: `${item.title}: General visiting hours are 10:00 AM – 1:00 PM and 4:00 PM – 8:00 PM daily. To ensure quiet rest, a maximum of 2 visitors are permitted at bedside at any time. Quiet hours commence at 9:00 PM across all wards.`,
      spokenAnswer: `General visiting hours are 10 AM to 1 PM, and 4 PM to 8 PM daily. Up to two visitors are welcome at your bedside.`,
      category: "visiting",
      source: "local-knowledge-base",
      modelUsed: "Hospital Knowledge Base (Demo Engine)",
      suggestedFollowUps: ["What are ICU visiting hours?", "Can children visit?"]
    };
  }

  // Wi-Fi / Internet
  if (
    query.includes('wifi') || query.includes('wi-fi') || query.includes('internet') ||
    query.includes('network') || query.includes('password') || query.includes('इंटरनेट') ||
    query.includes('वाई-फाई')
  ) {
    if (isHi) {
      return {
        answer: `मुफ्त रोगी वाई-फाई: अपने फोन या टैबलेट पर नेटवर्क '${HOSPITAL_METADATA.wifiName}' से जुड़ें। किसी पासवर्ड की आवश्यकता नहीं है। ब्राउज़र खुलने पर नियम स्वीकार करें।`,
        spokenAnswer: `अस्पताल का मुफ्त वाई-फाई नेटवर्क हॉस्पिटल-गेस्ट है। इसमें किसी पासवर्ड की जरूरत नहीं है।`,
        category: "services",
        source: "local-knowledge-base",
        modelUsed: "Hospital Knowledge Base (Demo Engine)",
        suggestedFollowUpsHi: ["क्या टीवी पर यूट्यूब देख सकते हैं?", "रिसेप्शन का फोन नंबर क्या है?"]
      };
    }
    return {
      answer: `Complimentary High-Speed Wi-Fi: Connect your mobile device to the '${HOSPITAL_METADATA.wifiName}' network. No password is required. Simply accept the hospital usage policy on the pop-up browser screen.`,
      spokenAnswer: `You can connect to the hospital guest Wi-Fi network named Hospital-Guest. No password is required.`,
      category: "services",
      source: "local-knowledge-base",
      modelUsed: "Hospital Knowledge Base (Demo Engine)",
      suggestedFollowUps: ["How do I call the nurse?", "Where is the pharmacy?"]
    };
  }

  // Pharmacy / Chemist / Medication Pickup
  if (
    query.includes('pharmacy') || query.includes('chemist') || query.includes('drugstore') ||
    query.includes('medicine shop') || query.includes('फार्मेसी') || query.includes('दवा की दुकान')
  ) {
    if (isHi) {
      return {
        answer: `24/7 फार्मेसी: अस्पताल की मुख्य फार्मेसी ग्राउंड फ्लोर पर इमरजेंसी वार्ड के पास स्थित है। यदि आप डिस्चार्ज की दवाएं अपने कमरे में मंगाना चाहते हैं, तो एक्सटेंशन 108 पर संपर्क करें।`,
        spokenAnswer: `फार्मेसी ग्राउंड फ्लोर पर इमरजेंसी के पास है। यह चौबीसों घंटे खुली रहती है। कमरे में डिलीवरी के लिए एक्सटेंशन 108 पर कॉल करें।`,
        category: "services",
        source: "local-knowledge-base",
        modelUsed: "Hospital Knowledge Base (Demo Engine)",
        suggestedFollowUpsHi: ["क्या दवा कमरे में मिल सकती है?", "कैफेटेरिया कहाँ है?"]
      };
    }
    return {
      answer: `24/7 In-Hospital Pharmacy: Located on the Ground Floor adjacent to the Emergency Entrance. It is open 24 hours daily. For bedside delivery of discharge prescriptions to ${roomNumber}, dial Ext 108.`,
      spokenAnswer: `The hospital pharmacy is on the Ground Floor next to Emergency. It is open 24 hours. You can dial extension 108 for bedside delivery.`,
      category: "services",
      source: "local-knowledge-base",
      modelUsed: "Hospital Knowledge Base (Demo Engine)",
      suggestedFollowUps: ["Can medicine be delivered to my room?", "Where is the cafeteria?"]
    };
  }

  // Reception / Help Desk / Admission / Billing
  if (
    query.includes('reception') || query.includes('help desk') || query.includes('front desk') ||
    query.includes('lobby') || query.includes('admission') || query.includes('bill') ||
    query.includes('wheelchair') || query.includes('रिसेप्शन') || query.includes('बिलिंग')
  ) {
    if (isHi) {
      return {
        answer: `रिसेप्शन और सहायता केंद्र: मुख्य रिसेप्शन ग्राउंड फ्लोर लॉबी में स्थित है और 24 घंटे खुला रहता है। आप अपने कमरे के फोन से एक्सटेंशन 101 या 102 डायल कर सकते हैं। अस्पताल में आने-जाने के लिए व्हीलचेयर सेवा भी उपलब्ध है।`,
        spokenAnswer: `मुख्य रिसेप्शन ग्राउंड फ्लोर लॉबी में है और चौबीसों घंटे खुला है। अपने फोन से एक्सटेंशन 101 डायल करें।`,
        category: "reception",
        source: "local-knowledge-base",
        modelUsed: "Hospital Knowledge Base (Demo Engine)",
        suggestedFollowUpsHi: ["व्हीलचेयर कैसे मंगाएं?", "डिस्चार्ज का समय क्या है?"]
      };
    }
    return {
      answer: `Reception & Help Desk: Located in the Main Lobby on the Ground Floor, open 24 hours daily. You can reach the front desk from your room phone by dialing Ext 101 or 102. Free wheelchair escort service is available on request.`,
      spokenAnswer: `The main reception is in the Ground Floor lobby, open 24 hours. You can call them from your room phone at extension 101.`,
      category: "reception",
      source: "local-knowledge-base",
      modelUsed: "Hospital Knowledge Base (Demo Engine)",
      suggestedFollowUps: ["How to request a wheelchair?", "What is the nurse station number?"]
    };
  }

  // Navigation / Floor Directory / Where is X / Radiology / Prayer Room
  if (
    query.includes('where is') || query.includes('floor') || query.includes('elevator') ||
    query.includes('x-ray') || query.includes('mri') || query.includes('prayer') ||
    query.includes('chapel') || query.includes('icu') || query.includes('नक्शा') ||
    query.includes('मंजिल') || query.includes('कहाँ')
  ) {
    if (isHi) {
      return {
        answer: `मंजिल निर्देशिका: ग्राउंड फ्लोर: रिसेप्शन, इमरजेंसी, फार्मेसी और कैफेटेरिया (विंग बी)। मंजिल 1: एक्स-रे, एमआरआई (MRI), और ब्लड टेस्ट। मंजिल 2: ओपीडी और प्रार्थना कक्ष (कमरा 215)। मंजिल 3: आईसीयू और सर्जरी। मंजिल 4: आपका कमरा ${roomNumber} और नर्स स्टेशन (Ext 400)।`,
        spokenAnswer: `आप अभी चौथी मंजिल पर हैं। कैफेटेरिया ग्राउंड फ्लोर पर है और एक्स-रे पहली मंजिल पर है। लिफ्ट कॉरिडोर के अंत में है।`,
        category: "navigation",
        source: "local-knowledge-base",
        modelUsed: "Hospital Knowledge Base (Demo Engine)",
        suggestedFollowUpsHi: ["कैफेटेरिया कहाँ है?", "नर्स स्टेशन का फोन नंबर क्या है?"]
      };
    }
    return {
      answer: `Floor Guide: Ground Floor houses Reception, ER, Pharmacy, and Cafeteria (Wing B). Floor 1 houses Diagnostic Imaging (X-Ray, MRI, CT Scan). Floor 2 has Outpatient Clinics & Multifaith Prayer Room (Room 215). Floor 3 is ICU and Surgery. Floor 4 houses Inpatient Rooms including your room (${roomNumber}) and Central Nurse Station (Ext 400).`,
      spokenAnswer: `You are currently on Floor 4. Cafeteria and Reception are on the Ground Floor, and X-Ray is on Floor 1. Elevators are down the hall.`,
      category: "navigation",
      source: "local-knowledge-base",
      modelUsed: "Hospital Knowledge Base (Demo Engine)",
      suggestedFollowUps: ["Where is the prayer room?", "Where is the cafeteria?"]
    };
  }

  // Bedside Comfort / Water / Blanket / Ice / Towel
  if (
    query.includes('water') || query.includes('blanket') || query.includes('pillow') ||
    query.includes('ice') || query.includes('towel') || query.includes('cold') ||
    query.includes('पानी') || query.includes('कंबल') || query.includes('तकिया')
  ) {
    if (isHi) {
      return {
        answer: `कमरे की सुविधा सेवा: अतिरिक्त कंबल, तकिया, गर्म पानी या बर्फ मंगाने के लिए आप सीधे रिमोट पर 'सहायता का अनुरोध करें' बटन दबा सकते हैं। फ्लोर नर्स या केयरटेकर तुरंत सहायता करेंगे।`,
        spokenAnswer: `अतिरिक्त कंबल या पानी के लिए कृपया मुख्य स्क्रीन पर सहायता का अनुरोध करें बटन दबाएं। स्टाफ आपके कमरे में तुरंत आ जाएगा।`,
        category: "services",
        source: "local-knowledge-base",
        modelUsed: "Hospital Knowledge Base (Demo Engine)",
        suggestedFollowUpsHi: ["सहायता का अनुरोध करें", "मुलाकात का समय क्या है?"]
      };
    }
    return {
      answer: `Bedside Comfort Service: Extra warm blankets, pillows, drinking water, or ice can be requested right here on your TV by selecting 'Request Assistance'. Our nursing support staff will bring items directly to ${roomNumber}.`,
      spokenAnswer: `To request extra blankets, pillows, or drinking water, select Request Assistance on your TV screen. Staff will deliver it to your room promptly.`,
      category: "services",
      source: "local-knowledge-base",
      modelUsed: "Hospital Knowledge Base (Demo Engine)",
      suggestedFollowUps: ["Open Request Assistance", "What are the visiting hours?"]
    };
  }

  // Default: Unknown queries - DO NOT INVENT INFORMATION
  if (isHi) {
    return {
      answer: `अस्पताल मार्गदर्शिका में इस प्रश्न की विशिष्ट जानकारी उपलब्ध नहीं है। कृपया कोई गलत जानकारी लेने से बचने के लिए मुख्य रिसेप्शन डेस्क (Ext 101) या अपनी फ्लोर नर्स (Ext 400) से संपर्क करें।`,
      spokenAnswer: `मेरे पास इसकी सटीक जानकारी नहीं है। कृपया अपनी फ्लोर नर्स से संपर्क करें या रिसेप्शन एक्सटेंशन 101 पर बात करें।`,
      category: "reception",
      source: "local-knowledge-base",
      modelUsed: "Hospital Knowledge Base (Demo Engine)",
      suggestedFollowUpsHi: ["रिसेप्शन से कैसे बात करें?", "कैफेटेरिया कहाँ है?"]
    };
  }

  return {
    answer: `I do not have specific hospital information on that topic in the current guide. To ensure accurate details, please contact the Main Reception Desk at Ext 101 or call the Floor Nurse Station at Ext 400.`,
    spokenAnswer: `I do not have specific details on that topic in the hospital guide. Please contact reception at extension 101 or speak with your floor nurse.`,
    category: "reception",
    source: "local-knowledge-base",
    modelUsed: "Hospital Knowledge Base (Demo Engine)",
    suggestedFollowUps: ["Where is the reception?", "How do I call the nurse?"]
  };
}

/**
 * OpenAI Live Integration (when user configures OPENAI_API_KEY)
 */
async function queryOpenAI(
  question: string,
  language: Language,
  roomNumber: string,
  apiKey: string
): Promise<AskResponse> {
  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

  const systemPrompt = `You are CareView AI, an accessible hospital television assistant for elderly patients in ${HOSPITAL_METADATA.name}, Room ${roomNumber}.
SOURCE OF TRUTH (Do not contradict or invent facts):
- Hospital: ${HOSPITAL_METADATA.name}
- Inpatient Ward: Floor 4, Maple Pavilion
- Visiting Hours: 10:00 AM – 1:00 PM and 4:00 PM – 8:00 PM daily (ICU: 11-12 AM, 5-6 PM). Max 2 visitors at bedside.
- Cafeteria: Ground Floor, Wing B. Open 7:00 AM – 9:30 PM. Inpatient meals delivered at 7:30 AM, 12:30 PM, 7:00 PM.
- Pharmacy: Ground Floor next to Emergency. Open 24/7. Bedside delivery Ext 108.
- Wi-Fi: "Hospital-Guest", no password needed.
- Reception: Ground Floor Main Lobby, open 24/7, Ext 101 / 102.
- Floor Guide: Ground (ER, Cafeteria, Reception), Floor 1 (Imaging, MRI, X-Ray), Floor 2 (Clinics, Prayer Room 215), Floor 3 (Surgery, ICU), Floor 4 (Patient Wards, Rooms 401-440).

RULES:
1. Answer in language: ${language === 'hi' ? 'Hindi (हिंदी)' : 'English'}.
2. Keep sentences short, warm, respectful, and crystal-clear for elderly patients viewing from a 10-foot TV distance.
3. NEVER prescribe medications or give diagnostic advice. If asked medical symptoms, escalate to nursing staff immediately.
4. If facts are not in the guide, instruct the patient to contact Reception (Ext 101) or Nurse Station (Ext 400).
5. Output strict JSON with:
{
  "answer": "Clear on-screen display text (2-3 short sentences)",
  "spokenAnswer": "Concise spoken text for voice synthesis (1-2 sentences)",
  "category": "cafeteria" | "visiting" | "services" | "reception" | "navigation" | "emergency",
  "suggestedFollowUps": ["Question 1", "Question 2"]
}`;

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: question }
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
      max_tokens: 350
    })
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`OpenAI API error ${res.status}: ${errorText}`);
  }

  const data = await res.json();
  const parsed = JSON.parse(data.choices[0].message.content);

  return {
    answer: parsed.answer,
    spokenAnswer: parsed.spokenAnswer || parsed.answer,
    category: parsed.category || "services",
    source: "ai",
    modelUsed: `OpenAI (${model})`,
    suggestedFollowUps: parsed.suggestedFollowUps
  };
}

/**
 * Google Gemini Live Integration (when user configures GEMINI_API_KEY)
 */
async function queryGemini(
  question: string,
  language: Language,
  roomNumber: string,
  apiKey: string
): Promise<AskResponse> {
  const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const prompt = `You are CareView AI, an accessible hospital television assistant for elderly patients in ${HOSPITAL_METADATA.name}, Room ${roomNumber}.
Hospital facts:
- Inpatient Ward: Floor 4, Maple Pavilion
- Visiting Hours: 10:00 AM – 1:00 PM and 4:00 PM – 8:00 PM daily. Max 2 visitors.
- Cafeteria: Ground Floor, Wing B. Open 7:00 AM – 9:30 PM.
- Pharmacy: Ground Floor, open 24/7. Bedside delivery Ext 108.
- Wi-Fi: "Hospital-Guest", no password needed.
- Reception: Ground Floor Main Lobby, Ext 101.
- Language required: ${language === 'hi' ? 'Hindi (हिंदी)' : 'English'}.
Short, calm sentences for TV screen. Never invent data. Never give medical diagnosis or drug advice.
Respond ONLY with a JSON object: {"answer": "...", "spokenAnswer": "...", "category": "..."}.
User question: ${question}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.2,
        maxOutputTokens: 350
      }
    })
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Gemini API error ${res.status}: ${errorText}`);
  }

  const data = await res.json();
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
  const parsed = JSON.parse(rawText);

  return {
    answer: parsed.answer,
    spokenAnswer: parsed.spokenAnswer || parsed.answer,
    category: parsed.category || "services",
    source: "ai",
    modelUsed: `Google Gemini (${model})`
  };
}

/**
 * Anthropic Live Integration (when user configures ANTHROPIC_API_KEY)
 */
async function queryAnthropic(
  question: string,
  language: Language,
  roomNumber: string,
  apiKey: string
): Promise<AskResponse> {
  const model = process.env.ANTHROPIC_MODEL || 'claude-3-5-haiku-20241022';

  const system = `You are CareView AI for elderly hospital patients in ${HOSPITAL_METADATA.name}, Room ${roomNumber}.
Visiting hours: 10 AM-1 PM, 4-8 PM. Cafeteria: Ground Floor, Wing B (7 AM-9:30 PM). Wi-Fi: Hospital-Guest (no password).
Floor 4 is Inpatient Ward. Ground Floor has ER & Pharmacy 24/7.
Answer in ${language === 'hi' ? 'Hindi' : 'English'}. Return ONLY valid JSON with keys: "answer", "spokenAnswer", "category".`;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model,
      max_tokens: 350,
      temperature: 0.2,
      system,
      messages: [{ role: 'user', content: question }]
    })
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Anthropic API error ${res.status}: ${errorText}`);
  }

  const data = await res.json();
  const rawText = data.content?.[0]?.text || '{}';
  const parsed = JSON.parse(rawText);

  return {
    answer: parsed.answer,
    spokenAnswer: parsed.spokenAnswer || parsed.answer,
    category: parsed.category || "services",
    source: "ai",
    modelUsed: `Anthropic Claude (${model})`
  };
}
