export const supportedLanguages = [
  { name: "English", code: "en-NG", currency: "NGN" },
  { name: "Igbo", code: "ig-NG", currency: "NGN" },
  { name: "Hausa", code: "ha-NG", currency: "NGN" },
  { name: "Yoruba", code: "yo-NG", currency: "NGN" },
  { name: "French", code: "fr-FR", currency: "EUR" },
  { name: "Spanish", code: "es-ES", currency: "EUR" },
  { name: "German", code: "de-DE", currency: "EUR" },
  { name: "Italian", code: "it-IT", currency: "EUR" },
  { name: "Portuguese", code: "pt-PT", currency: "EUR" },
  { name: "Dutch", code: "nl-NL", currency: "EUR" },
  { name: "Polish", code: "pl-PL", currency: "EUR" },
  { name: "Arabic", code: "ar-SA", currency: "USD", direction: "rtl" },
  { name: "Hindi", code: "hi-IN", currency: "USD" },
  { name: "Mandarin Chinese", code: "zh-CN", currency: "USD" },
  { name: "Japanese", code: "ja-JP", currency: "USD" },
  { name: "Korean", code: "ko-KR", currency: "USD" },
  { name: "Swahili", code: "sw-KE", currency: "KES" },
  { name: "Afrikaans", code: "af-ZA", currency: "ZAR" },
];

const core = {
  ig: {
    "Settings":"Ntọala", "Assistant":"Onye enyemaka", "Drive":"Ịnya ụgbọala", "Media":"Egwu na vidio",
    "Train My Carmind":"Zụọ Carmind m", "Training Pack":"Ngwugwu ọzụzụ", "Help & Learning":"Enyemaka na mmụta",
    "Payment":"Ịkwụ ụgwọ", "Control Panel":"Ogwe njikwa", "Systems online":"Usoro niile na-arụ ọrụ",
    "Start voice":"Malite olu", "Listening":"Ana m ege ntị", "Stop listening":"Kwụsị ige ntị",
    "Hear welcome again":"Nụrụ nnabata ọzọ", "Live conversation":"Mkparịta ụka ozugbo", "You said":"Ihe ị kwuru",
    "Choose your language":"Họrọ asụsụ gị", "App and voice language":"Asụsụ ngwa na olu", "Personal details":"Nkọwa nkeonwe",
    "Full name":"Aha zuru ezu", "Preferred name":"Aha ị chọrọ ka a kpọọ gị", "Email address":"Adreesị ozi-e",
    "Phone number":"Nọmba ekwentị", "Emergency contact":"Onye a ga-akpọ n'oge mberede", "Car assistant":"Onye enyemaka ụgbọala",
    "Assistant name":"Aha onye enyemaka", "Home address":"Adreesị ụlọ", "Office address":"Adreesị ọfịs",
    "Payment currency":"Ego ịkwụ ụgwọ", "Preferred music service":"Ebe egwu ị họọrọ", "Custom welcome message":"Ozi nnabata nke gị",
    "Save settings and hear welcome":"Chekwaa ntọala ma nụrụ nnabata", "Where are we going?":"Ebee ka anyị na-aga?",
    "Back":"Laghachi", "Home":"Ụlọ", "Office":"Ọfịs", "Fuel":"Mmanụ", "Nothing playing":"Ọ dịghị ihe na-egwu",
    "Question and answer board":"Ogwe ajụjụ na azịza", "Save training":"Chekwaa ọzụzụ", "Saved responses":"Azịza echekwara",
  },
  ha: {
    "Settings":"Saituna", "Assistant":"Mataimaki", "Drive":"Tuki", "Media":"Kiɗa da bidiyo",
    "Train My Carmind":"Horar da Carmind dina", "Training Pack":"Kunshin horo", "Help & Learning":"Taimako da koyo",
    "Payment":"Biyan kuɗi", "Control Panel":"Kwamitin gudanarwa", "Systems online":"Dukkan tsare-tsare suna aiki",
    "Start voice":"Fara murya", "Listening":"Ina sauraro", "Stop listening":"Dakatar da sauraro",
    "Hear welcome again":"Sake jin maraba", "Live conversation":"Tattaunawa kai tsaye", "You said":"Ka ce",
    "Choose your language":"Zaɓi harshenka", "App and voice language":"Harshen manhaja da murya", "Personal details":"Bayanan sirri",
    "Full name":"Cikakken suna", "Preferred name":"Sunan da kake so", "Email address":"Adireshin imel",
    "Phone number":"Lambar waya", "Emergency contact":"Lambar gaggawa", "Car assistant":"Mataimakin mota",
    "Assistant name":"Sunan mataimaki", "Home address":"Adireshin gida", "Office address":"Adireshin ofis",
    "Payment currency":"Kuɗin biyan kuɗi", "Preferred music service":"Sabis ɗin kiɗa da aka fi so", "Custom welcome message":"Saƙon maraba na musamman",
    "Save settings and hear welcome":"Ajiye saituna kuma ji maraba", "Where are we going?":"Ina za mu je?",
    "Back":"Koma baya", "Home":"Gida", "Office":"Ofis", "Fuel":"Mai", "Nothing playing":"Babu abin da ke kunna",
    "Question and answer board":"Akwatin tambaya da amsa", "Save training":"Ajiye horo", "Saved responses":"Amsoshin da aka ajiye",
  },
  yo: {
    "Settings":"Ètò", "Assistant":"Olùrànlọ́wọ́", "Drive":"Ìwakọ̀", "Media":"Orin àti fídíò",
    "Train My Carmind":"Kọ Carmind mi", "Training Pack":"Àkójọpọ̀ ìkẹ́kọ̀ọ́", "Help & Learning":"Ìrànlọ́wọ́ àti ẹ̀kọ́",
    "Payment":"Ìsanwó", "Control Panel":"Pánẹ́ẹ̀lì ìṣàkóso", "Systems online":"Gbogbo ètò ń ṣiṣẹ́",
    "Start voice":"Bẹ̀rẹ̀ ohùn", "Listening":"Mo ń gbọ́", "Stop listening":"Dá gbígbọ́ dúró",
    "Hear welcome again":"Gbọ́ ìkíni lẹ́ẹ̀kan síi", "Live conversation":"Ìjíròrò lẹ́sẹ̀kẹsẹ̀", "You said":"O sọ pé",
    "Choose your language":"Yan èdè rẹ", "App and voice language":"Èdè ohun èlò àti ohùn", "Personal details":"Àlàyé ara ẹni",
    "Full name":"Orúkọ kíkún", "Preferred name":"Orúkọ tí o fẹ́", "Email address":"Àdírẹ́sì ímeèlì",
    "Phone number":"Nọ́mbà fóònù", "Emergency contact":"Olùbásọ̀rọ̀ pàjáwìrì", "Car assistant":"Olùrànlọ́wọ́ ọkọ̀",
    "Assistant name":"Orúkọ olùrànlọ́wọ́", "Home address":"Àdírẹ́sì ilé", "Office address":"Àdírẹ́sì ọ́fíìsì",
    "Payment currency":"Owó ìsanwó", "Preferred music service":"Iṣẹ́ orin tí o fẹ́", "Custom welcome message":"Ọ̀rọ̀ ìkíni tirẹ",
    "Save settings and hear welcome":"Fi ètò pamọ́ kí o sì gbọ́ ìkíni", "Where are we going?":"Ibo ni a ń lọ?",
    "Back":"Padà", "Home":"Ilé", "Office":"Ọ́fíìsì", "Fuel":"Epo", "Nothing playing":"Kò sí ohun tó ń dun",
    "Question and answer board":"Àpótí ìbéèrè àti ìdáhùn", "Save training":"Fi ìkẹ́kọ̀ọ́ pamọ́", "Saved responses":"Àwọn ìdáhùn tí a fipamọ́",
  },
};

export const interfaceTranslations = core;

export const commandAliases = {
  ig: {
    "laghachi":"go back", "gaa na draịvụ":"go to drive", "gaa na ntọala":"go to settings", "gaa na onye enyemaka":"go to assistant",
    "kpọọ egwu":"play music", "kpọọ vidio":"play video", "kwụsị egwu":"pause music", "gaa n'ihu n'egwu":"continue playing",
    "bulie olu":"increase volume", "wetuo olu":"decrease volume", "kpọga m ụlọ":"drive me home", "kpọga m ọfịs":"drive me to my office",
    "kwụsị ntụziaka":"stop navigation", "gbanwuo wifi":"turn on wifi", "gbanyụọ wifi":"turn off wifi",
    "gbanwuo bluetooth":"turn on bluetooth", "gbanyụọ bluetooth":"turn off bluetooth",
  },
  ha: {
    "koma baya":"go back", "je zuwa tuki":"go to drive", "je zuwa saituna":"go to settings", "je wurin mataimaki":"go to assistant",
    "kunna kiɗa":"play music", "kunna bidiyo":"play video", "dakatar da kiɗa":"pause music", "ci gaba da kiɗa":"continue playing",
    "ƙara sauti":"increase volume", "rage sauti":"decrease volume", "kai ni gida":"drive me home", "kai ni ofis":"drive me to my office",
    "dakatar da jagora":"stop navigation", "kunna wifi":"turn on wifi", "kashe wifi":"turn off wifi",
    "kunna bluetooth":"turn on bluetooth", "kashe bluetooth":"turn off bluetooth",
  },
  yo: {
    "padà":"go back", "lọ sí ìwakọ̀":"go to drive", "lọ sí ètò":"go to settings", "lọ sí olùrànlọ́wọ́":"go to assistant",
    "kọ orin":"play music", "kọ fídíò":"play video", "dá orin dúró":"pause music", "tẹ̀síwájú pẹ̀lú orin":"continue playing",
    "gbé ohùn sókè":"increase volume", "dín ohùn kù":"decrease volume", "mú mi lọ sí ilé":"drive me home", "mú mi lọ sí ọ́fíìsì":"drive me to my office",
    "dá ìtọ́sọ́nà dúró":"stop navigation", "tan wifi":"turn on wifi", "pa wifi":"turn off wifi",
    "tan bluetooth":"turn on bluetooth", "pa bluetooth":"turn off bluetooth",
  },
};

export const seededLanguageTraining = {
  ig: [
    {q:"Ndewo",a:"Ndewo, {{user_name}}. Kedu ka m ga-esi nyere gị aka?"},
    {q:"Ndewo {{assistant_name}}",a:"Ndewo, {{user_name}}. Gịnị ka m ga-emere gị?"},
    {q:"Kedu ka ị mere taa?",a:"Adị m mma ma dị njikere inyere gị aka, {{user_name}}. Kedu ka ị mere?"},
    {q:"Obi adịghị m mma",a:"Ọ dị m nwute na obi adịghị gị mma, {{user_name}}. Ị chọrọ ịgwa m ihe mere?"},
    {q:"Owu na-ama m",a:"Ọ dị m nwute na owu na-ama gị. Anọ m ebe a ige gị ntị."},
    {q:"Kpeere m ekpere",a:"Aga m ekpe ekpere maka gị. Ka Chineke nye gị ume, udo na nduzi."},
  ],
  ha: [
    {q:"Sannu",a:"Sannu, {{user_name}}. Yaya zan taimaka maka?"},
    {q:"Sannu {{assistant_name}}",a:"Sannu, {{user_name}}. Me zan yi maka?"},
    {q:"Yaya kake yau?",a:"Ina lafiya kuma a shirye nake in taimaka maka, {{user_name}}. Yaya kake?"},
    {q:"Ba na jin daɗi",a:"Na yi baƙin ciki da jin haka, {{user_name}}. Kana son ka gaya mini abin da ya faru?"},
    {q:"Ina jin kaɗaici",a:"Na yi baƙin ciki cewa kana jin kaɗaici. Ina nan don sauraronka."},
    {q:"Yi mini addu'a",a:"Zan yi maka addu'a. Allah ya ba ka ƙarfi, salama da shiriya."},
  ],
  yo: [
    {q:"Ẹ n lẹ",a:"Ẹ n lẹ, {{user_name}}. Báwo ni mo ṣe lè ràn ọ́ lọ́wọ́?"},
    {q:"Ẹ n lẹ {{assistant_name}}",a:"Ẹ n lẹ, {{user_name}}. Kí ni mo lè ṣe fún ọ?"},
    {q:"Báwo ni o ṣe wà lónìí?",a:"Mo wà dáadáa, mo sì ṣetán láti ràn ọ́ lọ́wọ́, {{user_name}}. Báwo ni o ṣe wà?"},
    {q:"Inú mi kò dùn",a:"Ó bà mí nínú pé inú rẹ kò dùn, {{user_name}}. Ṣé o fẹ́ sọ ohun tó ṣẹlẹ̀ fún mi?"},
    {q:"Mo dá wà",a:"Ó bà mí nínú pé o ń nímọ̀lára ìdánìkan. Mo wà níbí láti gbọ́ ọ."},
    {q:"Gbàdúrà fún mi",a:"Màá gbàdúrà fún ọ. Kí Ọlọ́run fún ọ ní agbára, àlàáfíà àti ìtọ́sọ́nà."},
  ],
};

export const localizedWelcomes = {
  en: "Welcome, {{user_name}}. I’m happy to see you. Where are we going today?",
  ig: "Nnọọ, {{user_name}}. Obi dị m ụtọ ịhụ gị. Ebee ka anyị na-aga taa?",
  ha: "Barka da zuwa, {{user_name}}. Na yi farin cikin ganinka. Ina za mu je yau?",
  yo: "Káàbọ̀, {{user_name}}. Inú mi dùn láti rí ọ. Ibo ni a ń lọ lónìí?",
  fr: "Bienvenue, {{user_name}}. Je suis heureuse de vous voir. Où allons-nous aujourd’hui ?",
  es: "Bienvenido, {{user_name}}. Me alegra verte. ¿Adónde vamos hoy?",
  de: "Willkommen, {{user_name}}. Ich freue mich, dich zu sehen. Wohin fahren wir heute?",
  it: "Benvenuto, {{user_name}}. Sono felice di vederti. Dove andiamo oggi?",
  pt: "Bem-vindo, {{user_name}}. Fico feliz em vê-lo. Para onde vamos hoje?",
  nl: "Welkom, {{user_name}}. Ik ben blij je te zien. Waar gaan we vandaag naartoe?",
  pl: "Witaj, {{user_name}}. Miło cię widzieć. Dokąd jedziemy dzisiaj?",
  ar: "مرحبًا، {{user_name}}. يسعدني رؤيتك. إلى أين سنذهب اليوم؟",
  hi: "स्वागत है, {{user_name}}। आपको देखकर खुशी हुई। आज हम कहाँ जा रहे हैं?",
  zh: "欢迎你，{{user_name}}。很高兴见到你。我们今天要去哪里？",
  ja: "おかえりなさい、{{user_name}}。お会いできてうれしいです。今日はどこへ行きますか？",
  ko: "환영합니다, {{user_name}}. 만나서 반가워요. 오늘은 어디로 갈까요?",
  sw: "Karibu, {{user_name}}. Nimefurahi kukuona. Tunaenda wapi leo?",
  af: "Welkom, {{user_name}}. Ek is bly om jou te sien. Waarheen gaan ons vandag?",
};

export function welcomeForLanguage(code = "en") {
  return localizedWelcomes[languageBase(code)] || localizedWelcomes.en;
}

export function languageBase(code = "en") { return code.toLowerCase().split("-")[0]; }

export function localInterfaceText(text, code) {
  return interfaceTranslations[languageBase(code)]?.[text] || null;
}

export function normalizeLocalCommand(text, code) {
  let value = text.toLocaleLowerCase().trim();
  for (const [local, english] of Object.entries(commandAliases[languageBase(code)] || {})) value = value.replaceAll(local, english);
  if (languageBase(code) === "en") value = normalizeNigerianEnglish(value);
  return value;
}

// Carmind replies in polished English, but this listening layer accepts common
// Nigerian English, Pidgin, omitted words and locally phrased car commands.
// It changes only intent recognition; it never changes the spoken voice/output.
export function normalizeNigerianEnglish(text = "") {
  return String(text).toLocaleLowerCase()
    .replace(/[?!,]+/g, " ")
    .replace(/\b(abeg|biko|please now|please na|na)\b/g, " please ")
    .replace(/\bwetin be (?:the )?name of (?:this|my) (?:car|motor)\b/g, "what is my car name")
    .replace(/\bwetin be your name\b/g, "what is your name")
    .replace(/\bhow body\b/g, "how are you")
    .replace(/\bhow you dey\b/g, "how are you")
    .replace(/\bhow far\b/g, "hello how are you")
    .replace(/\byou dey there\b/g, "are you there")
    .replace(/\bi wan(?:t)? (?:make you )?(?:help me )?(?:to )?/g, "")
    .replace(/\bwetin happen\b/g, "what happened")
    .replace(/\bno wahala\b/g, "no problem")
    .replace(/\bi no dey (?:okay|fine|well)\b/g, "i am not feeling well")
    .replace(/\bmy body no (?:dey )?(?:okay|fine|well)\b/g, "i am not feeling well")
    .replace(/\bbody dey pain me\b/g, "i am sick and in pain")
    .replace(/\bi dey (?:sad|unhappy|bored|sick|tired|stressed)\b/g, "i am $1")
    .replace(/\bi no happy\b/g, "i am unhappy")
    .replace(/\bi tire(?: well well)?\b/g, "i am stressed")
    .replace(/\bmake you (?:help me )?(?:to )?\b/g, "")
    .replace(/\bhelp me (?:to )?(play|open|show|drive|call|connect)\b/g, "$1")
    .replace(/\b(play|put|give|bring) (?:the )?(song|music|video) (?:for me|give me)\b/g, "play $2")
    .replace(/\bput (?:the )?(song|music|video)\b/g, "play $1")
    .replace(/\bopen (?:the )?(song|music)\b/g, "play $1")
    .replace(/\bplay (?:it|am)\b/g, "continue playing")
    .replace(/\b(stop|pause) (?:it|am)\b/g, "$1 music")
    .replace(/\bcontinue (?:it|am)\b/g, "continue playing")
    .replace(/\b(on|start) (?:the )?(song|music|video)\b/g, "play $2")
    .replace(/\boff (?:the )?(song|music|video)\b/g, "stop music")
    .replace(/\b(add|increase|raise) (?:the )?(?:sound|volume)(?: well well| small)?\b/g, "increase volume")
    .replace(/\b(reduce|lower|remove) (?:the )?(?:sound|volume)(?: small)?\b/g, "decrease volume")
    .replace(/\bvolume (?:too )?low\b/g, "increase volume")
    .replace(/\bvolume (?:too )?high\b/g, "decrease volume")
    .replace(/\b(?:carry|take|drive) me (?:go|reach)\s+/g, "drive me to ")
    .replace(/\bmake we (?:dey )?go\s+/g, "drive me to ")
    .replace(/\bwe dey go\s+/g, "drive me to ")
    .replace(/\bi dey go\s+/g, "drive me to ")
    .replace(/\bfind filling station for me\b/g, "find nearest filling station")
    .replace(/\bwhere we dey\b/g, "where are we")
    .replace(/\bwhere we dey go\b/g, "where are we heading")
    .replace(/\bcomot for here|come out from here\b/g, "go back")
    .replace(/\benter (settings|drive|media|assistant|payment)\b/g, "go to $1")
    .replace(/\btrain my (?:camera|carmen|carmine|car mind|car man|common)\b/g, "train my carmind")
    .replace(/\b(?:calm mind|car mine|car man|common mind|karma)\b/g, "carmind")
    .replace(/\b(?:car mind|carmen|carmine) training\b/g, "carmind training")
    .replace(/\b(on|off) (?:the )?(wifi|wi-fi|bluetooth)\b/g, "turn $1 $2")
    .replace(/\bconnect me (?:with|to)\s+/g, "connect me to ")
    .replace(/\bring (?:up )?/g, "call ")
    .replace(/\bgive (?:my )?(.+?) (?:a )?call\b/g, "call my $1")
    .replace(/\s+/g, " ")
    .trim();
}

const screenIntentPatterns = [
  ["Settings", /\b(?:go to|open|click|select|enter|show|visit|take me to)\s+(?:(?:the|my)\s+)?(?:settings|setting|setup|profile|personal settings)\b/],
  ["Assistant", /\b(?:go to|open|click|select|enter|show|visit|take me to)\s+(?:(?:the|my)\s+)?(?:assistant|assistance|voice assistant|carmind assistant)\b/],
  ["Drive", /\b(?:go to|open|click|select|enter|show|visit|take me to)\s+(?:(?:the|my)\s+)?(?:drive|driving|map|navigation|navigator)\b/],
  ["Media", /\b(?:go to|open|click|select|enter|show|visit|take me to)\s+(?:(?:the|my)\s+)?(?:media|music|video|playlist|music player|video player)\b/],
  ["Training Pack", /\b(?:go to|open|click|select|enter|show|visit|take me to)\s+(?:(?:the|my)\s+)?(?:training pack|training package)\b/],
  ["Train My Carmind", /\b(?:go to|open|click|select|enter|show|visit|take me to)\s+(?:(?:the|my)\s+)?(?:train my carmind|carmind training|training board|train carmind|training)\b/],
  ["Help & Learning", /\b(?:go to|open|click|select|enter|show|visit|take me to)\s+(?:(?:the|my)\s+)?(?:help|learning|help and learning|tutorial|tutorials|academy|carmind academy)\b/],
  ["Payment", /\b(?:go to|open|click|select|enter|show|visit|take me to)\s+(?:(?:the|my)\s+)?(?:payment|payments|subscription|renewal|plans)\b/],
];

export function detectScreenIntent(text = "", code = "en-NG") {
  const raw = String(text).toLocaleLowerCase().trim();
  const value = `${raw} ${normalizeLocalCommand(raw, code)}`;
  return screenIntentPatterns.find(([, pattern]) => pattern.test(value))?.[0] || null;
}

const businessSetbackPatterns = [
  /\bi (?:just )?lost (?:a |the |my )?(?:big |major |important )?(?:business )?(?:deal|contract|client|customer|sale|account|tender|opportunity)\b/,
  /\b(?:we|i) (?:did not|didn't|could not|couldn't|failed to) (?:get|win|close|secure|land) (?:the |a )?(?:deal|contract|client|customer|sale|tender)\b/,
  /\b(?:the |my |our )?(?:deal|contract|sale|tender|business opportunity) (?:failed|fell through|collapsed|was cancelled|did not work|didn't work|went bad)\b/,
  /\bi (?:missed|blew|lost out on) (?:the |a )?(?:deal|contract|sale|business opportunity)\b/,
  /\b(?:a |the )?(?:client|customer) (?:left|walked away|cancelled|backed out|rejected (?:me|us|the offer))\b/,
  /\bi lose (?:one |the |my )?(?:big )?(?:deal|contract|customer|client)\b/,
  /\b(?:the |my )?(?:deal|contract|business) no (?:work|enter|happen)\b/,
  /\b(?:the |my )?(?:deal|contract|business) (?:scatter|spoil)\b/,
  /\bclient no (?:agree|pay|continue)\b/,
  /\bbig customer (?:leave|left)\b/,
  /\bbusiness (?:disappoint|disappointed) me\b/,
  /\bi did not get the job\b/,
];

export function detectConversationIntents(text = "") {
  const value = normalizeNigerianEnglish(text, "en-NG");
  const intents = new Set();
  if (businessSetbackPatterns.some((pattern) => pattern.test(value))) intents.add("business_setback");
  return intents;
}

export function trainingToBoard(items = []) {
  return items.map(({q,a}) => `Question: ${q}\nAnswer: ${a}`).join("\n\n");
}

export function boardToTraining(source = "") {
  const blocks = source.split(/\n\s*\n/).map((x) => x.trim()).filter(Boolean);
  return blocks.flatMap((block) => {
    const match = block.match(/Question:\s*(.+?)\nAnswer:\s*([\s\S]+)/i) || block.match(/^(.+?)\s*=>\s*([\s\S]+)$/);
    return match ? [{q:match[1].trim(),a:match[2].trim()}] : [];
  });
}
