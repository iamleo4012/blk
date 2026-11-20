/**
 * Central i18n dictionary (Upgrade 12).
 * Every interface label lives here — components never hardcode translated
 * strings. English is the default; other languages fall back to it.
 */

export type Lang = "en" | "ml" | "hi" | "ta" | "ar" | "te";

export const LANGS: ReadonlyArray<{ code: Lang; label: string; default?: boolean }> = [
  { code: "en", label: "English", default: true },
  { code: "ml", label: "മലയാളം" },
  { code: "hi", label: "हिन्दी" },
  { code: "ta", label: "தமிழ்" },
  { code: "ar", label: "العربية" },
  { code: "te", label: "తెలుగు" },
];
export const DEFAULT_LANG: Lang = "en";
export const LANG_STORAGE_KEY = "nassim-lang";

export type TKey =
  | "greetingMorning"
  | "greetingAfternoon"
  | "greetingEvening"
  | "selectLanguage"
  | "apply"
  | "close"
  | "back"
  | "done"
  | "attachments"
  | "addMore"
  | "addAttachments"
  | "end"
  | "completed"
  | "record"
  | "photo"
  | "video"
  | "takePhoto"
  | "startRecording"
  | "stopRecording"
  | "nothingCaptured"
  | "endConfirmTitle"
  | "endConfirmBody"
  | "cancelNo"
  | "endYes"
  | "ending"
  | "endError"
  | "takeSelfie"
  | "positionFace"
  | "startingCamera"
  | "cameraUnavailable"
  | "checkingFace"
  | "noFace"
  | "identityVerified"
  | "deleteTitle"
  | "deleteBodyPhoto"
  | "deleteBodyVideo"
  | "delete"
  | "cancel"
  | "discardTitle"
  | "discardBody"
  | "discard"
  | "micUnavailable"
  | "defaultTag"
  | "langComingSoonNote"
  | "registerTitle"
  | "registerNameLabel"
  | "registerNamePlaceholder"
  | "registerContinue"
  | "registerCapture"
  | "registeredDone"
  | "poseFront"
  | "poseLeft"
  | "poseRight"
  | "yourName"
  | "namePlaceholder"
  | "captureHeading"
  | "captureSub"
  | "stepLabel1"
  | "stepLabel2"
  | "stepLabel3"
  | "stepDesc1"
  | "stepDesc2"
  | "stepDesc3"
  | "capturedImages"
  | "retake"
  | "register";

type Dict = Record<TKey, string>;
/** Non-English dictionaries may omit keys; `translate` falls back to English. */
type PartialDict = Partial<Dict>;

const en: Dict = {
  greetingMorning: "Good Morning",
  greetingAfternoon: "Good Afternoon",
  greetingEvening: "Good Evening",
  selectLanguage: "Select Language",
  apply: "Apply",
  close: "Close",
  back: "Back",
  done: "Done",
  attachments: "Attachments",
  addMore: "Add More",
  addAttachments: "Add Attachments",
  end: "End",
  completed: "Completed",
  record: "Record",
  photo: "Photo",
  video: "Video",
  takePhoto: "Take photo",
  startRecording: "Start recording",
  stopRecording: "Stop recording",
  nothingCaptured: "Nothing captured yet",
  endConfirmTitle: "Are you sure you want to end this task?",
  endConfirmBody: "This will stop the timer and complete the task.",
  cancelNo: "No, Cancel",
  endYes: "Yes, End Task",
  ending: "Ending…",
  endError: "Could not complete the task. Please try again.",
  takeSelfie: "Take a Selfie",
  positionFace: "Position your face within the frame",
  startingCamera: "Starting camera…",
  cameraUnavailable: "Camera unavailable. Check permissions and try again.",
  checkingFace: "Checking for a face…",
  noFace: "No face detected — centre your face in the oval and try again",
  identityVerified: "Identity verified",
  deleteTitle: "Delete this attachment?",
  deleteBodyPhoto: "This photo will be removed from the session.",
  deleteBodyVideo: "This video will be removed from the session.",
  delete: "Delete",
  cancel: "Cancel",
  discardTitle: "Discard this recording?",
  discardBody: "The current unsaved recording will be deleted.",
  discard: "Discard",
  micUnavailable: "Microphone unavailable. Check permissions and try again.",
  defaultTag: "(Default)",
  langComingSoonNote: "",
  registerTitle: "Register Face & Name",
  registerNameLabel: "Enter the staff member's name",
  registerNamePlaceholder: "Full name",
  registerContinue: "Continue",
  registerCapture: "Capture face",
  registeredDone: "Registered",
  poseFront: "Face the camera directly",
  poseLeft: "Slightly look left — keep both eyes visible",
  poseRight: "Slightly look right — keep both eyes visible",
  yourName: "Your Name",
  namePlaceholder: "Enter your full name",
  captureHeading: "Capture 3 face images",
  captureSub: "Follow the angles shown below.",
  stepLabel1: "Step 1",
  stepLabel2: "Step 2",
  stepLabel3: "Step 3",
  stepDesc1: "Look Straight",
  stepDesc2: "Look Slightly Left",
  stepDesc3: "Look Slightly Right",
  capturedImages: "Captured Images",
  retake: "Retake",
  register: "Register",
};

const ml: PartialDict = {
  greetingMorning: "സുപ്രഭാതം",
  greetingAfternoon: "ശുഭ ഉച്ച",
  greetingEvening: "ശുഭ സന്ധ്യ",
  selectLanguage: "ഭാഷ തിരഞ്ഞെടുക്കുക",
  apply: "പ്രയോഗിക്കുക",
  close: "അടയ്ക്കുക",
  back: "തിരികെ",
  done: "പൂർത്തിയായി",
  attachments: "അറ്റാച്ച്മെന്റുകൾ",
  addMore: "കൂടുതൽ ചേർക്കുക",
  addAttachments: "അറ്റാച്ച്മെന്റുകൾ ചേർക്കുക",
  end: "അവസാനിപ്പിക്കുക",
  completed: "പൂർത്തിയായി",
  record: "റെക്കോർഡ് ചെയ്യുക",
  photo: "ഫോട്ടോ",
  video: "വീഡിയോ",
  takePhoto: "ഫോട്ടോ എടുക്കുക",
  startRecording: "റെക്കോർഡിംഗ് ആരംഭിക്കുക",
  stopRecording: "റെക്കോർഡിംഗ് നിർത്തുക",
  nothingCaptured: "ഇതുവരെ ഒന്നും പിടിച്ചിട്ടില്ല",
  endConfirmTitle: "ഈ ജോലി അവസാനിപ്പിക്കണമെന്ന് തീരുമാനിച്ചോ?",
  endConfirmBody: "ടൈമർ നിർത്തി ജോലി പൂർത്തിയാക്കും.",
  cancelNo: "വേണ്ട, റദ്ദാക്കുക",
  endYes: "അതെ, അവസാനിപ്പിക്കുക",
  ending: "അവസാനിപ്പിക്കുന്നു…",
  endError: "ജോലി പൂർത്തിയാക്കാൻ കഴിഞ്ഞില്ല. വീണ്ടും ശ്രമിക്കുക.",
  takeSelfie: "സെൽഫി എടുക്കുക",
  positionFace: "ഫ്രെയിമിനുള്ളിൽ മുഖം വയ്ക്കുക",
  startingCamera: "ക്യാമറ തുറക്കുന്നു…",
  cameraUnavailable: "ക്യാമറ ലഭ്യമല്ല. അനുമതികൾ പരിശോധിച്ച് വീണ്ടും ശ്രമിക്കുക.",
  checkingFace: "മുഖം പരിശോധിക്കുന്നു…",
  noFace: "മുഖം കണ്ടെത്തിയില്ല — മുഖം ഓവലിന്റെ നടുവിൽ വയ്ക്കുക",
  identityVerified: "ഐഡന്റിറ്റി സ്ഥിരീകരിച്ചു",
  deleteTitle: "ഈ അറ്റാച്ച്മെന്റ് ഇല്ലാതാക്കണോ?",
  deleteBodyPhoto: "ഈ ഫോട്ടോ സെഷനിൽ നിന്ന് നീക്കം ചെയ്യും.",
  deleteBodyVideo: "ഈ വീഡിയോ സെഷനിൽ നിന്ന് നീക്കം ചെയ്യും.",
  delete: "ഇല്ലാതാക്കുക",
  cancel: "റദ്ദാക്കുക",
  discardTitle: "ഈ റെക്കോർഡിംഗ് ഉപേക്ഷിക്കണോ?",
  discardBody: "സേവ് ചെയ്യാത്ത റെക്കോർഡിംഗ് നീക്കം ചെയ്യും.",
  discard: "ഉപേക്ഷിക്കുക",
  micUnavailable: "മൈക്ക് ലഭ്യമല്ല. അനുമതികൾ പരിശോധിച്ച് വീണ്ടും ശ്രമിക്കുക.",
  defaultTag: "(സ്ഥിരസ്ഥിതി)",
  langComingSoonNote: "",
};

const hi: PartialDict = {
  greetingMorning: "सुप्रभात",
  greetingAfternoon: "नमस्कार",
  greetingEvening: "शुभ संध्या",
  selectLanguage: "भाषा चुनें",
  apply: "लागू करें",
  close: "बंद करें",
  back: "वापस",
  done: "पूर्ण",
  attachments: "अटैचमेंट",
  addMore: "और जोड़ें",
  addAttachments: "अटैचमेंट जोड़ें",
  end: "समाप्त करें",
  completed: "पूर्ण हुआ",
  record: "रिकॉर्ड करें",
  photo: "फ़ोटो",
  video: "वीडियो",
  takePhoto: "फ़ोटो लें",
  startRecording: "रिकॉर्डिंग शुरू करें",
  stopRecording: "रिकॉर्डिंग रोकें",
  nothingCaptured: "अभी कुछ कैप्चर नहीं किया गया",
  endConfirmTitle: "क्या आप वाकई यह कार्य समाप्त करना चाहते हैं?",
  endConfirmBody: "इससे टाइमर रुकेगा और कार्य पूरा होगा।",
  cancelNo: "नहीं, रद्द करें",
  endYes: "हाँ, कार्य समाप्त करें",
  ending: "समाप्त हो रहा है…",
  endError: "कार्य पूरा नहीं हो सका। पुनः प्रयास करें।",
  takeSelfie: "सेल्फी लें",
  positionFace: "फ्रेम के भीतर अपना चेहरा रखें",
  startingCamera: "कैमरा शुरू हो रहा है…",
  cameraUnavailable: "कैमरा उपलब्ध नहीं है। अनुमतियाँ जाँचें और पुनः प्रयास करें।",
  checkingFace: "चेहरा जाँचा जा रहा है…",
  noFace: "चेहरा नहीं मिला — चेहरे को अंडाकार में केंद्र में रखें",
  identityVerified: "पहचान सत्यापित हुई",
  deleteTitle: "यह अटैचमेंट हटाएँ?",
  deleteBodyPhoto: "यह फ़ोटो सेशन से हटा दी जाएगी।",
  deleteBodyVideo: "यह वीडियो सेशन से हटा दिया जाएगा।",
  delete: "हटाएँ",
  cancel: "रद्द करें",
  discardTitle: "यह रिकॉर्डिंग छोड़ दें?",
  discardBody: "सहेजी न गई वर्तमान रिकॉर्डिंग हटा दी जाएगी।",
  discard: "छोड़ दें",
  micUnavailable: "माइक उपलब्ध नहीं है। अनुमतियाँ जाँचें और पुनः प्रयास करें।",
  defaultTag: "(डिफ़ॉल्ट)",
  langComingSoonNote: "",
};

const ta: PartialDict = {
  greetingMorning: "காலை வணக்கம்",
  greetingAfternoon: "மதிய வணக்கம்",
  greetingEvening: "மாலை வணக்கம்",
  selectLanguage: "மொழியைத் தேர்ந்தெடுக்கவும்",
  apply: "பயன்படுத்து",
  close: "மூடு",
  back: "பின்செல்",
  done: "முடிந்தது",
  attachments: "இணைப்புகள்",
  addMore: "மேலும் சேர்க்க",
  addAttachments: "இணைப்புகளைச் சேர்க்கவும்",
  end: "முடிக்கவும்",
  completed: "முடிந்தது",
  record: "பதிவு செய்க",
  photo: "புகைப்படம்",
  video: "வீடியோ",
  takePhoto: "புகைப்படம் எடுக்கவும்",
  startRecording: "பதிவைத் தொடங்கு",
  stopRecording: "பதிவை நிறுத்து",
  nothingCaptured: "இதுவரை எதுவும் எடுக்கப்படவில்லை",
  endConfirmTitle: "இந்த பணியை முடிக்க விரும்புகிறீர்களா?",
  endConfirmBody: "இது டைமரை நிறுத்தி பணியை முடிக்கும்.",
  cancelNo: "இல்லை, ரத்து செய்",
  endYes: "ஆம், பணியை முடி",
  ending: "முடிக்கப்படுகிறது…",
  endError: "பணியை முடிக்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்.",
  takeSelfie: "சுய படம் எடுங்கள்",
  positionFace: "பிரேமிற்குள் உங்கள் முகத்தை வைக்கவும்",
  startingCamera: "கேமரா திறக்கிறது…",
  cameraUnavailable: "கேமரா கிடைக்கவில்லை. அனுமதிகளை சரிபார்த்து மீண்டும் முயற்சிக்கவும்.",
  checkingFace: "முகம் சரிபார்க்கப்படுகிறது…",
  noFace: "முகம் கண்டறியப்படவில்லை — முகத்தை நடுவில் வைக்கவும்",
  identityVerified: "அடையாளம் உறுதிசெய்யப்பட்டது",
  deleteTitle: "இந்த இணைப்பை நீக்கவா?",
  deleteBodyPhoto: "இந்த புகைப்படம் அமர்விலிருந்து நீக்கப்படும்.",
  deleteBodyVideo: "இந்த வீடியோ அமர்விலிருந்து நீக்கப்படும்.",
  delete: "நீக்கு",
  cancel: "ரத்து செய்",
  discardTitle: "இந்த பதிவை கைவிடவா?",
  discardBody: "சேமிக்கப்படாத தற்போதைய பதிவு நீக்கப்படும்.",
  discard: "கைவிடு",
  micUnavailable: "மைக் கிடைக்கவில்லை. அனுமதிகளை சரிபார்த்து மீண்டும் முயற்சிக்கவும்.",
  defaultTag: "(இயல்புநிலை)",
  langComingSoonNote: "",
};

const ar: PartialDict = {
  greetingMorning: "صباح الخير",
  greetingAfternoon: "طاب يومك",
  greetingEvening: "طاب مساؤك",
  selectLanguage: "اختر اللغة",
  apply: "تطبيق",
  close: "إغلاق",
  back: "رجوع",
  done: "تم",
  attachments: "المرفقات",
  addMore: "إضافة المزيد",
  addAttachments: "إضافة مرفقات",
  end: "إنهاء",
  completed: "مكتمل",
  record: "تسجيل",
  photo: "صورة",
  video: "فيديو",
  takePhoto: "التقاط صورة",
  startRecording: "بدء التسجيل",
  stopRecording: "إيقاف التسجيل",
  nothingCaptured: "لم يتم التقاط أي شيء بعد",
  endConfirmTitle: "هل أنت متأكد أنك تريد إنهاء هذه المهمة؟",
  endConfirmBody: "سيتم إيقاف المؤقت وإكمال المهمة.",
  cancelNo: "لا، إلغاء",
  endYes: "نعم، إنهاء المهمة",
  ending: "جارٍ الإنهاء…",
  endError: "تعذّر إكمال المهمة. حاول مرة أخرى.",
  takeSelfie: "التقط صورة سيلفي",
  positionFace: "ضع وجهك داخل الإطار",
  startingCamera: "جارٍ تشغيل الكاميرا…",
  cameraUnavailable: "الكاميرا غير متوفرة. تحقق من الأذونات وحاول مرة أخرى.",
  checkingFace: "جارٍ التحقق من الوجه…",
  noFace: "لم يُكتشف وجه — ضع وجهك في منتصف الإطار البيضاوي",
  identityVerified: "تم التحقق من الهوية",
  deleteTitle: "حذف هذا المرفق؟",
  deleteBodyPhoto: "ستتم إزالة هذه الصورة من الجلسة.",
  deleteBodyVideo: "سيتم إزالة هذا الفيديو من الجلسة.",
  delete: "حذف",
  cancel: "إلغاء",
  discardTitle: "تجاهل هذا التسجيل؟",
  discardBody: "سيتم حذف التسجيل الحالي غير المحفوظ.",
  discard: "تجاهل",
  micUnavailable: "الميكروفون غير متاح. تحقق من الأذونات وحاول مرة أخرى.",
  defaultTag: "(افتراضي)",
  langComingSoonNote: "",
};

const te: PartialDict = {
  greetingMorning: "శుభోదయం",
  greetingAfternoon: "శుభ మధ్యాహ్నం",
  greetingEvening: "శుభ సాయంత్రం",
  selectLanguage: "భాషను ఎంచుకోండి",
  apply: "వర్తింపు చేయి",
  close: "మూసివేయి",
  back: "వెనుకకు",
  done: "పూర్తయింది",
  attachments: "అటాచ్‌మెంట్‌లు",
  addMore: "మరిన్ని జోడించు",
  addAttachments: "అటాచ్‌మెంట్‌లు జోడించండి",
  end: "ముగించు",
  completed: "పూర్తయింది",
  record: "రికార్డ్ చేయండి",
  photo: "ఫోటో",
  video: "వీడియో",
  takePhoto: "ఫోటో తీయండి",
  startRecording: "రికార్డింగ్ ప్రారంభించు",
  stopRecording: "రికార్డింగ్ ఆపు",
  nothingCaptured: "ఇంకా ఏమీ క్యాప్చర్ చేయలేదు",
  endConfirmTitle: "మీరు ఖచ్చితంగా ఈ పనిని ముగించాలనుకుంటున్నారా?",
  endConfirmBody: "ఇది టైమర్ ఆపి పనిని పూర్తి చేస్తుంది.",
  cancelNo: "లేదు, రద్దు చేయి",
  endYes: "అవును, పనిని ముగించు",
  ending: "ముగించబడుతోంది…",
  endError: "పనిని పూర్తి చేయడం సాధ్యం కాలేదు. మళ్లీ ప్రయత్నించండి.",
  takeSelfie: "సెల్ఫీ తీసుకోండి",
  positionFace: "ఫ్రేమ్‌లో మీ ముఖం ఉంచండి",
  startingCamera: "కెమెరా ప్రారంభమవుతోంది…",
  cameraUnavailable: "కెమెరా అందుబాటులో లేదు. అనుమతులు తనిఖీ చేసి మళ్లీ ప్రయత్నించండి.",
  checkingFace: "ముఖం ధృవీకరిస్తున్నాం…",
  noFace: "ముఖం గుర్తించబడలేదు — ముఖాన్ని మధ్యలో ఉంచండి",
  identityVerified: "గుర్తింపు ధృవీకరించబడింది",
  deleteTitle: "ఈ అటాచ్‌మెంట్‌ను తొలగించాలా?",
  deleteBodyPhoto: "ఈ ఫోటో సెషన్ నుండి తొలగించబడుతుంది.",
  deleteBodyVideo: "ఈ వీడియో సెషన్ నుండి తొలగించబడుతుంది.",
  delete: "తొలగించు",
  cancel: "రద్దు చేయి",
  discardTitle: "ఈ రికార్డింగ్‌ను వదిలివేయాలా?",
  discardBody: "సేవ్ చేయని ప్రస్తుత రికార్డింగ్ తొలగించబడుతుంది.",
  discard: "వదిలివేయి",
  micUnavailable: "మైక్ అందుబాటులో లేదు. అనుమతులు తనిఖీ చేసి మళ్లీ ప్రయత్నించండి.",
  defaultTag: "(డిఫాల్ట్)",
  langComingSoonNote: "",
};

export const DICTS: Record<Lang, PartialDict> = { en, ml, hi, ta, ar, te };

/** Resolves `key` in `lang`, falling back to English. */
export function translate(lang: Lang, key: TKey): string {
  return DICTS[lang]?.[key] ?? en[key] ?? key;
}
