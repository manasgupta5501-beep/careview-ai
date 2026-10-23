import { HospitalInfoItem } from '@/types';

export const HOSPITAL_METADATA = {
  name: "St. Jude Memorial Hospital",
  nameHi: "सेंट ज्यूड मेमोरियल अस्पताल",
  defaultWing: "Maple Pavilion - 4th Floor",
  defaultWingHi: "मेपल पवेलियन - चौथी मंजिल",
  defaultRoom: "Room 402",
  emergencyPhone: "Ext 999 (Internal) / 911 (External)",
  nurseStationPhone: "Ext 400",
  receptionPhone: "Ext 101 / 102",
  wifiName: "Hospital-Guest",
  wifiPassword: "No password required (accept terms on browser)",
};

export const HOSPITAL_KNOWLEDGE_BASE: HospitalInfoItem[] = [
  {
    id: "visiting-hours",
    category: "visiting",
    iconName: "Clock",
    title: "Visiting Hours & Policies",
    titleHi: "मुलाकात का समय और नियम",
    summary: "General visiting hours are 10:00 AM – 1:00 PM and 4:00 PM – 8:00 PM daily.",
    summaryHi: "सामान्य मुलाकात का समय प्रतिदिन सुबह 10:00 से दोपहर 1:00 और शाम 4:00 से रात 8:00 बजे तक है।",
    hours: "10:00 AM – 1:00 PM, 4:00 PM – 8:00 PM",
    location: "All Inpatient Wards (Floor 3 & 4)",
    contact: "Nurse Station Ext 400",
    details: [
      "Maximum of 2 visitors at the bedside at any one time to maintain quiet rest for patients.",
      "ICU / CCU visiting hours are strictly limited to 11:00 AM – 12:00 PM and 5:00 PM – 6:00 PM.",
      "Children under 12 may visit with prior nursing supervisor approval.",
      "Quiet hours begin at 9:00 PM across all patient wards."
    ],
    detailsHi: [
      "मरीज़ों के आराम के लिए एक समय में बिस्तर के पास केवल 2 आगंतुकों की अनुमति है।",
      "आईसीयू (ICU) मुलाकात का समय केवल सुबह 11:00 से 12:00 और शाम 5:00 से 6:00 बजे तक है।",
      "12 वर्ष से कम उम्र के बच्चों के लिए नर्सिंग सुपरवाइज़र की अनुमति आवश्यक है।",
      "रात 9:00 बजे से सभी वार्डों में शांत समय (Quiet Hours) शुरू होता है।"
    ],
    importantNote: "Hand sanitizer must be used before entering and exiting all patient rooms.",
    importantNoteHi: "सभी कमरों में प्रवेश करने और बाहर निकलने से पहले हाथों को सैनिटाइज़ करना अनिवार्य है।"
  },
  {
    id: "cafeteria-dining",
    category: "cafeteria",
    iconName: "Utensils",
    title: "Cafeteria & Patient Meals",
    titleHi: "कैफेटेरिया और भोजन व्यवस्था",
    summary: "Located on Ground Floor, Wing B. Open daily 7:00 AM – 9:30 PM.",
    summaryHi: "ग्राउंड फ्लोर, विंग बी में स्थित है। प्रतिदिन सुबह 7:00 से रात 9:30 बजे तक खुला है।",
    hours: "7:00 AM – 9:30 PM (Daily)",
    location: "Ground Floor, Wing B (Near Garden Courtyard)",
    contact: "Dietary Services Ext 220",
    details: [
      "Breakfast served: 7:00 AM – 10:00 AM.",
      "Lunch served: 12:00 PM – 3:00 PM.",
      "Dinner served: 6:30 PM – 9:30 PM.",
      "Prescribed patient meals are delivered directly to your bedside: Breakfast (7:30 AM), Lunch (12:30 PM), Dinner (7:00 PM).",
      "Fresh coffee, tea, soups, and healthy snacks are available between meal hours.",
      "Patients on restricted or diabetic diets must verify with nursing staff before eating outside food."
    ],
    detailsHi: [
      "नाश्ता: सुबह 7:00 से 10:00 बजे तक।",
      "दोपहर का भोजन: दोपहर 12:00 से 3:00 बजे तक।",
      "रात का भोजन: शाम 6:30 से रात 9:30 बजे तक।",
      "मरीजों का भोजन सीधे आपके कमरे में लाया जाता है: नाश्ता (7:30 AM), दोपहर का खाना (12:30 PM), रात का खाना (7:00 PM)।",
      "बाहर का खाना खाने से पहले कृपया डॉक्टर या नर्स से सलाह अवश्य लें।"
    ],
    importantNote: "Need warm water, ice, or dietary adjustment? Press 'Request Assistance' anytime.",
    importantNoteHi: "गर्म पानी, बर्फ या आहार में बदलाव चाहिए? कभी भी 'सहायता का अनुरोध करें' बटन दबाएं।"
  },
  {
    id: "reception-helpdesk",
    category: "reception",
    iconName: "HelpCircle",
    title: "Reception & Information Desk",
    titleHi: "रिसेप्शन और सहायता केंद्र",
    summary: "Main Lobby desk open 24 hours daily. Phone: Ext 101 or 102.",
    summaryHi: "मुख्य लॉबी डेस्क 24 घंटे खुला रहता है। फोन: एक्सटेंशन 101 या 102।",
    hours: "Open 24/7",
    location: "Main Lobby, Ground Floor Entrance",
    contact: "Ext 101 / 102",
    details: [
      "Assistance with hospital admissions, patient discharge paperwork, and billing enquiries.",
      "Free wheelchair escort service for patients moving between departments.",
      "Lost and found property assistance.",
      "Taxi, ambulance, and public transport booking assistance."
    ],
    detailsHi: [
      "अस्पताल में भर्ती, डिस्चार्ज और बिलिंग संबंधी सहायता।",
      "अस्पताल में आने-जाने के लिए निःशुल्क व्हीलचेयर सहायता।",
      "खोया-पाया सामान संबंधी सहायता।",
      "टैक्सी और एम्बुलेंस बुकिंग सहायता।"
    ],
    importantNote: "For room transfers or visitor passes, contact the reception desk or your floor nurse.",
    importantNoteHi: "कमरा बदलने या विज़िटर पास के लिए रिसेप्शन या अपनी नर्स से संपर्क करें।"
  },
  {
    id: "hospital-navigation",
    category: "navigation",
    iconName: "Compass",
    title: "Hospital Navigation & Floor Directory",
    titleHi: "अस्पताल का नक्शा और मंजिल निर्देशिका",
    summary: "Clear floor-by-floor directory of hospital wings and elevators.",
    summaryHi: "अस्पताल के सभी विंगों और लिफ्टों की स्पष्ट मंजिल-दर-मंजिल जानकारी।",
    hours: "Elevators available 24/7",
    location: "Main Hospital Building",
    contact: "Information Desk Ext 101",
    details: [
      "Ground Floor: Main Reception, 24/7 Emergency (ER), Cafeteria (Wing B), Outpatient Pharmacy, Blood Collection Labs.",
      "Floor 1: Diagnostic Imaging (MRI, CT Scan, X-Ray, Ultrasound), Cardiac Catheterization Lab, Pathology.",
      "Floor 2: Specialist Outpatient Clinics, Physiotherapy, Dialysis Center, Multifaith Prayer Room (Room 215).",
      "Floor 3: Surgical Operating Suites (OT), Intensive Care Unit (ICU), Post-Anesthesia Recovery.",
      "Floor 4: Inpatient Rooms (Maple Pavilion Rooms 401–440), Inpatient Nurse Station, Family Rest Lounge."
    ],
    detailsHi: [
      "ग्राउंड फ्लोर: मुख्य रिसेप्शन, 24/7 इमरजेंसी (ER), कैफेटेरिया (विंग बी), फार्मेसी, ब्लड टेस्ट लैब।",
      "पहली मंजिल: एक्स-रे, एमआरआई (MRI), सीटी स्कैन, अल्ट्रासाउंड, हृदय जांच लैब।",
      "दूसरी मंजिल: ओपीडी क्लीनिक, फिजियोथेरेपी, डायलिसिस, प्रार्थना कक्ष (कमरा 215)।",
      "तीसरी मंजिल: ऑपरेशन थिएटर (OT), आईसीयू (ICU), रिकवरी वार्ड।",
      "चौथी मंजिल: मरीज वार्ड (कमरा 401 से 440), नर्स स्टेशन, पारिवारिक लाउंज।"
    ],
    importantNote: "Elevators A & B are passenger elevators; Elevator C is reserved for patient stretcher transport.",
    importantNoteHi: "लिफ्ट A और B यात्रियों के लिए हैं; लिफ्ट C मरीजों के स्ट्रेचर के लिए आरक्षित है।"
  },
  {
    id: "patient-services",
    category: "services",
    iconName: "ShieldPlus",
    title: "Patient Services & Amenities",
    titleHi: "मरीज सेवाएं और सुविधाएं",
    summary: "Complimentary Wi-Fi, 24/7 Pharmacy, Bedside Water, and Pastoral Care.",
    summaryHi: "मुफ्त वाई-फाई, 24/7 फार्मेसी, कमरे में पीने का पानी और प्रार्थना कक्ष।",
    hours: "24/7 for Pharmacy and Emergency Amenities",
    location: "Various Locations",
    contact: "Guest Relations Ext 105",
    details: [
      "24/7 In-Hospital Pharmacy: Ground Floor adjacent to Emergency. Bedside delivery of discharge medicine is available (Ext 108).",
      "Free Patient Wi-Fi: Connect to 'Hospital-Guest'. No password required.",
      "Multifaith Prayer Room: Floor 2, Room 215. Open 24/7 for quiet reflection and prayer.",
      "Bedside Linen & Pillow Requests: Clean pillows, extra blankets, or towels can be requested via CareView AI.",
      "Interpreter Services: On-demand video/audio interpreters available in 18 languages via hospital staff."
    ],
    detailsHi: [
      "24/7 फार्मेसी: ग्राउंड फ्लोर, इमरजेंसी के पास। कमरे में दवा डिलीवरी उपलब्ध (Ext 108)।",
      "मुफ्त वाई-फाई: 'Hospital-Guest' से जुड़ें, किसी पासवर्ड की आवश्यकता नहीं।",
      "प्रार्थना कक्ष: दूसरी मंजिल, कमरा 215, चौबीसों घंटे खुला है।",
      "अतिरिक्त कंबल, तकिया या तौलिया चाहिए तो CareView AI के जरिए मंगा सकते हैं।",
      "भाषा अनुवादक: 18 भाषाओं में अनुवादक सेवा उपलब्ध है।"
    ],
    importantNote: "All amenities are provided free or at standard hospital tariff without surprise charges.",
    importantNoteHi: "सभी सुविधाएं बिना किसी अतिरिक्त शुल्क के अस्पताल के मानकों के अनुसार प्रदान की जाती हैं।"
  },
  {
    id: "emergency-protocol",
    category: "emergency",
    iconName: "AlertTriangle",
    title: "Emergency & Urgent Medical Care",
    titleHi: "आपातकालीन और त्वरित सहायता",
    summary: "CRITICAL: For sudden chest pain, breathing difficulty, or falls, press your bedside nurse call button.",
    summaryHi: "अति महत्वपूर्ण: सीने में तेज दर्द, सांस लेने में तकलीफ या गिरने पर सीधे लाल बटन दबाएं।",
    hours: "Immediate 24/7 Rapid Response",
    location: "Bedside Remote & Bathroom Emergency Pull Cord",
    contact: "Emergency Rapid Response Ext 999",
    details: [
      "CareView AI is an informational assistant, NOT a certified life-support or emergency dispatch monitor.",
      "To reach your on-duty nurse in seconds, press the RED physical button on your pillow remote.",
      "In the bathroom, pull the RED cord hanging on the wall if you feel dizzy or slip.",
      "A registered nurse is stationed 30 seconds away from Room 402 at the Central Floor 4 Station.",
      "Rapid Response medical code team is on standby 24 hours a day."
    ],
    detailsHi: [
      "CareView AI केवल एक सूचना सहायक है, आपातकालीन जीवन-रक्षक प्रणाली नहीं।",
      "तुरंत नर्स को बुलाने के लिए अपने रिमोट पर मौजूद लाल बटन दबाएं।",
      "बाथरूम में चक्कर आने या गिरने पर दीवार पर लटकती लाल रस्सी खींचें।",
      "कमरा 402 के ठीक पास चौथी मंजिल पर सेंट्रल नर्स स्टेशन 24 घंटे सक्रिय है।"
    ],
    importantNote: "NEVER wait for a TV app response during acute pain or medical emergencies. Use the bedside call cord!",
    importantNoteHi: "गंभीर दर्द या आपात स्थिति में कभी टीवी ऐप का इंतज़ार न करें, सीधे लाल बटन दबाएं!"
  }
];

export const FREQUENT_QUESTIONS = [
  {
    en: "Where is the cafeteria and when does it open?",
    hi: "कैफेटेरिया कहाँ है और कब खुलता है?",
    category: "cafeteria"
  },
  {
    en: "What are the visiting hours for my family?",
    hi: "मुलाकात का समय क्या है?",
    category: "visiting"
  },
  {
    en: "How do I connect to the hospital Wi-Fi?",
    hi: "अस्पताल के वाई-फाई से कैसे जुड़ें?",
    category: "services"
  },
  {
    en: "Where is the pharmacy located?",
    hi: "दवा की दुकान (फार्मेसी) कहाँ है?",
    category: "services"
  },
  {
    en: "Can I get an extra blanket or warm water?",
    hi: "क्या मुझे अतिरिक्त कंबल या गर्म पानी मिल सकता है?",
    category: "request"
  },
  {
    en: "I am having severe chest pain right now",
    hi: "मुझे सीने में बहुत तेज दर्द हो रहा है",
    category: "emergency"
  }
];
