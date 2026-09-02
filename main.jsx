import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Mic,
  MicOff,
  MapPin,
  Navigation,
  Music,
  Car,
  Settings,
  LogOut,
  Home,
  Briefcase,
  ShieldCheck,
  Plus,
  Trash2,
  Play,
  Pause,
  Volume2,
  Gauge,
  Fuel,
  Thermometer,
  AlertTriangle,
  ChevronRight,
  Menu,
  X,
  Radio,
  CloudSun,
  Clock,
  User,
  Save,
  KeyRound,
  CreditCard,
  Wifi,
  Bluetooth,
  Lock,
  CheckCircle2,
  BookOpen,
  GraduationCap,
  FileText,
  ExternalLink,
  ArrowLeft,
  SkipBack,
  SkipForward,
  RotateCcw,
  Maximize2,
} from "lucide-react";
import "./style.css";
import demoBeatUrl from "./assets/carmind-demo-beat.mp3";
import demoVideoUrl from "./assets/carmind-demo-video.mp4";
import { globalTraining } from "./globalTraining.js";
import { baseLanguage, languageAvailability, translateAnswer, translateBetween, translateVisiblePage, watchPageLanguage } from "./translation.js";
import { redeemTreatmentFromUrl } from "./treatmentSession.js";
import { supportedLanguages, seededLanguageTraining, normalizeLocalCommand, detectConversationIntents, detectScreenIntent, trainingToBoard, boardToTraining, localizedWelcomes, welcomeForLanguage } from "./languagePacks.js";
import { serverApi, serverConfigured } from "./serverApi.js";

const languageOptions = supportedLanguages.map(({name, code, currency}) => [name, code, currency]);
const currencyOptions = ["NGN", "USD", "EUR", "GBP", "CAD", "AUD", "ZAR", "KES", "GHS"];
const VOICE_PROFILE_VERSION = 2;

function repairMojibake(value = "") {
  return String(value)
    .replaceAll("â€™", "’")
    .replaceAll("â€˜", "‘")
    .replaceAll("â€œ", "“")
    .replaceAll("â€", "”")
    .replaceAll("â€¦", "…")
    .replaceAll("â€“", "–")
    .replaceAll("â€”", "—")
    .replaceAll("Â", "");
}

function applyVoiceProfile(text = "", samples = []) {
  let value = String(text).toLocaleLowerCase().trim();
  for (const sample of samples || []) {
    const target = String(sample.target || "").toLocaleLowerCase().trim();
    if (!target) continue;
    for (const variant of [sample.heard, ...(sample.alternatives || [])]) {
      const heard = String(variant || "").toLocaleLowerCase().trim();
      if (!heard) continue;
      if (value === heard || value.includes(heard)) value = value.replaceAll(heard, target);
      const heardWords = heard.split(/\s+/), targetWords = target.split(/\s+/);
      if (heardWords.length === targetWords.length) {
        heardWords.forEach((word, index) => {
          if (word.length >= 4 && word !== targetWords[index]) value = value.replace(new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "g"), targetWords[index]);
        });
      }
    }
  }
  return value;
}

function chooseVoiceTranscript(alternatives = [], profile = {}) {
  const candidates = [...new Set(alternatives.filter(Boolean))];
  const score = (candidate) => {
    const corrected = applyVoiceProfile(candidate, profile.voiceSamples || []);
    const normalized = normalizeLocalCommand(corrected, profile.languageCode || "en-NG");
    let points = 0;
    if (detectScreenIntent(normalized, "en-NG")) points += 80;
    if (/\b(play|pause|resume|continue|drive|navigate|call|phone|dial|volume|wifi|wi-fi|bluetooth|back|home|office|hospital)\b/.test(normalized)) points += 35;
    if (/\b(carmind|demo|audio|video|music|settings|training|payment|assistant|map|playlist)\b/.test(normalized)) points += 18;
    if (/\b(sad|unhappy|bored|sick|stressed|lost|business|deal|wife|husband|father|mother|pray)\b/.test(normalized)) points += 12;
    if (assistantWasCalled(candidate, normalized, profile.assistant)) points += 25;
    return points;
  };
  return candidates.sort((a, b) => score(b) - score(a))[0] || "";
}

function wakeForm(value = "") {
  return String(value).toLocaleLowerCase()
    .replace(/\bsixty[ -]?three\b/g, "63")
    .replace(/\bsixty[ -]?two\b/g, "62")
    .replace(/\bsixty[ -]?five\b/g, "65")
    .replace(/\bforty[ -]?five\b/g, "45")
    .replace(/\s+/g, " ").trim();
}
function assistantWasCalled(raw, translated, assistantName) {
  const name = wakeForm(assistantName || "Mercedes");
  const heard = wakeForm(`${raw} ${translated}`);
  const compact = (value) => value.replace(/[^\p{L}\p{N}]/gu, "");
  if (compact(heard).includes(compact(name))) return true;
  const shortName = name.split(/\s+/)[0];
  return shortName.length >= 4 && new RegExp(`(^|\\s)${shortName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?=\\s|$)`, "u").test(heard);
}

function asksAssistantName(value = "") {
  const text = wakeForm(value);
  return [
    /\bwhat(?: is|'s) (?:your|my (?:car|vehicle)(?:'s)?) name\b/,
    /\bwhat name did i give (?:you|my (?:car|vehicle))\b/,
    /\bwhat did i name (?:you|my (?:car|vehicle))\b/,
    /\btell me (?:your|my (?:car|vehicle)(?:'s)?) name\b/,
    /\bname of (?:you|my (?:car|vehicle)|the (?:car|vehicle))\b/,
    /\bwhat is my (?:car|vehicle) called\b/,
    /\bwhat do i call (?:you|my (?:car|vehicle))\b/,
  ].some((pattern) => pattern.test(text));
}

// These phrases give Carmind a local meaning layer even when Chrome has not
// downloaded a translation model yet. Normal translation then expands this
// further to unrestricted phrasing in the selected language.
const emotionPhrases = {
  unhappy: [
    "i feel very bad", "i feel bad", "i am not okay", "i'm not okay", "my heart is heavy", "today is difficult", "nothing feels right",
    "je me sens mal", "je suis triste", "no estoy bien", "me siento mal", "estoy triste", "mir geht es schlecht", "ich bin traurig",
    "mi sento male", "sono triste", "sinto-me mal", "estou triste", "ik voel me slecht", "ik ben verdrietig", "źle się czuję", "jestem smutny",
    "أشعر بالسوء", "أنا حزين", "मुझे बुरा लग रहा है", "मैं उदास हूँ", "我感觉很糟", "我很难过", "気分が悪い", "悲しい",
    "기분이 안 좋아", "슬퍼", "najisikia vibaya", "nina huzuni", "ek voel sleg", "ek is hartseer", "obi adịghị m mma", "ọ na-ewute m",
    "inu mi ko dun", "mo banuje", "ina jin ba dadi", "ina cikin bakin ciki",
  ],
  bored: [
    "i have nothing to do", "this day is boring", "i am tired of sitting", "je m'ennuie", "estoy aburrido", "mir ist langweilig", "mi annoio",
    "estou entediado", "ik verveel me", "nudzi mi się", "أشعر بالملل", "मैं ऊब गया हूँ", "我很无聊", "退屈です", "심심해",
    "nimechoka", "ek is verveeld", "ike agwụla m", "o sun mi", "na gaji da zaman banza",
  ],
  sick: [
    "my body is not fine", "my body no well", "i feel feverish", "i am in pain", "je suis malade", "me siento enfermo", "estoy enfermo",
    "ich bin krank", "sono malato", "estou doente", "ik ben ziek", "jestem chory", "أنا مريض", "मैं बीमार हूँ", "我生病了", "具合が悪い",
    "아파요", "ninaumwa", "ek is siek", "ahụ adịghị m", "ara mi ko ya", "ba ni da lafiya",
  ],
  stressed: [
    "too much is happening", "i cannot cope", "my mind is full", "je suis stressé", "estoy estresado", "ich bin gestresst", "sono stressato",
    "estou estressado", "ik ben gestrest", "jestem zestresowany", "أنا متوتر", "मैं तनाव में हूँ", "压力很大", "ストレスがたまっている",
    "스트레스 받아", "nina msongo", "ek is gestres", "uche m juru", "wahala po ju", "ina cikin damuwa",
  ],
  positive: [
    "today went well", "i feel much better", "i am doing great", "je vais bien", "estoy bien", "mir geht es gut", "sto bene", "estou bem",
    "het gaat goed", "czuję się dobrze", "أنا بخير", "मैं ठीक हूँ", "我很好", "元気です", "잘 지내요", "niko vizuri", "dit gaan goed",
    "adị m mma", "mo wa daadaa", "ina lafiya",
  ],
};

function phraseMeaning(original, translated) {
  const combined = `${original} ${translated}`.toLocaleLowerCase();
  return new Set(Object.entries(emotionPhrases).filter(([, phrases]) => phrases.some((phrase) => combined.includes(phrase))).map(([meaning]) => meaning));
}

const TEMP_EMAIL = "",
  TEMP_PASS = "";
const routes = {
  office: {
    name: "CBS Office, Victoria Island",
    eta: "34 min",
    distance: "22.4 km",
  },
  home: { name: "Home, Lekki Phase 1", eta: "18 min", distance: "11.2 km" },
  lagos: { name: "Lagos City Centre", eta: "42 min", distance: "29.7 km" },
  station: {
    name: "TotalEnergies Filling Station",
    eta: "6 min",
    distance: "2.8 km",
  },
  hospital: { name: "Lagoon Hospital", eta: "12 min", distance: "7.1 km" },
};
const billingDefaults = {
  ownerEmail: "",
  monthlyPrice: 59000,
  yearlyPrice: 590000,
  currency: "NGN",
  trialHours: 3,
  graceDays: 0,
  checkoutMinutes: 15,
  provider: "Not selected",
  payoutName: "",
  payoutBank: "",
  payoutAccount: "",
  merchantReference: "",
  enforceSubscription: true,
  trainingPackPrice: 15000,
  youtubeChannelUrl: "",
  trainingPackCheckoutUrl: "",
  internationalPrices: {
    NGN: { monthly: 59000, yearly: 590000, personal: 15000 },
    USD: { monthly: 39, yearly: 390, personal: 10 },
    EUR: { monthly: 35, yearly: 350, personal: 9 },
    GBP: { monthly: 30, yearly: 300, personal: 8 },
    CAD: { monthly: 55, yearly: 550, personal: 14 },
    AUD: { monthly: 59, yearly: 590, personal: 15 },
    ZAR: { monthly: 699, yearly: 6990, personal: 180 },
    KES: { monthly: 4999, yearly: 49990, personal: 1250 },
    GHS: { monthly: 599, yearly: 5990, personal: 150 },
  },
};
function speak(text, setState, onDone, languageCode = "en-NG") {
  text = repairMojibake(text);
  speechSynthesis.cancel();
  speechSynthesis.resume();
  const u = new SpeechSynthesisUtterance(text);
  u.rate = 0.96;
  u.pitch = 1.02;
  u.volume = 1;
  u.lang = languageCode;
  const voices = speechSynthesis.getVoices();
  const matchingVoices = voices.filter((v) => v.lang.toLowerCase().startsWith(languageCode.split("-")[0].toLowerCase()));
  const naturalVoice = matchingVoices.find((v) => /Samantha|Google|Microsoft|Daniel|Neural|Natural/i.test(v.name)) || matchingVoices[0];
  if (naturalVoice) u.voice = naturalVoice;
  let completed = false;
  const finish = () => {
    if (completed) return;
    completed = true;
    setState?.("ready");
    onDone?.();
  };
  u.onstart = () => setState?.("speaking");
  u.onend = finish;
  u.onerror = () => {
    setState?.("speaker-error");
    finish();
  };
  if (!naturalVoice && serverConfigured()) {
    serverApi.speech(text, languageCode).then(async (response) => {
      const audio = new Audio(URL.createObjectURL(await response.blob()));
      audio.onplay = () => setState?.("speaking");
      audio.onended = finish;
      audio.onerror = finish;
      await audio.play();
    }).catch(() => speechSynthesis.speak(u));
  } else speechSynthesis.speak(u);
  // Some mobile WebKit versions occasionally omit the end event.
  setTimeout(finish, Math.max(3500, text.length * 95));
}
function Login({ onLogin }) {
  const [e, setE] = useState(""),
    [p, setP] = useState(""),
    [err, setErr] = useState(""),
    [show, setShow] = useState(false);
  function go(x) {
    x.preventDefault();
    const saved = JSON.parse(localStorage.getItem("cm-owner") || "null") || {
      email: TEMP_EMAIL,
      password: TEMP_PASS,
    };
    const email = e.trim().toLowerCase(),
      password = p.trim();
    if (
      email === saved.email.trim().toLowerCase() &&
      (password === saved.password || password === TEMP_PASS)
    )
      onLogin();
    else
      setErr(
        "Email or password is not correct. Use the owner details shown below.",
      );
  }
  return (
    <div className="login">
      <div className="glow g1" />
      <div className="glow g2" />
      <form className="login-card" onSubmit={go}>
        <div className="brand big">
          <span className="logo">
            <Navigation />
          </span>
          <div>
            Carmind <b>AI</b>
          </div>
        </div>
        <p className="eyebrow">INTELLIGENT MOBILITY</p>
        <h1>Welcome back</h1>
        <p className="muted">Sign in to your smart driving companion.</p>
        <label>
          Email address
          <input
            type="email"
            value={e}
            onChange={(x) => setE(x.target.value)}
            placeholder="you@example.com"
            autoCapitalize="none"
            required
          />
        </label>
        <label>
          Password
          <div className="password-field">
            <input
              type={show ? "text" : "password"}
              value={p}
              onChange={(x) => setP(x.target.value)}
              placeholder="Enter your password"
              required
            />
            <button type="button" onClick={() => setShow(!show)}>
              {show ? "Hide" : "Show"}
            </button>
          </div>
        </label>
        {err && <p className="error">{err}</p>}
        <button className="primary wide">
          Sign in <ChevronRight size={18} />
        </button>
        <div className="login-help">
          <b>Owner email:</b> {TEMP_EMAIL}
          <br />
          <b>Password:</b> {TEMP_PASS}
        </div>
        <div className="secure">
          <ShieldCheck size={16} /> Protected owner access
        </div>
      </form>
    </div>
  );
}
function App() {
  const adminMode = window.location.pathname.replace(/\/$/, "") === "/control";
  const expiredPreview = new URLSearchParams(window.location.search).get("access") === "expired";
  const startsLocked = !adminMode && expiredPreview;
  const [logged, setLogged] = useState(true),
    [tab, setTab] = useState(adminMode ? "Control Panel" : startsLocked ? "Assistant" : "Settings"),
    [menu, setMenu] = useState(false),
    [profile, setProfile] = useState(
      () =>
        JSON.parse(localStorage.getItem("cm-profile") || "null") || {
          fullName: "",
          name: "",
          email: "",
          phone: "",
          assistant: "Mercedes",
          home: "",
          office: "",
          emergency: "",
          wifePhone: "",
          husbandPhone: "",
          fatherPhone: "",
          motherPhone: "",
          language: "English",
          languageCode: "en-NG",
          currency: "NGN",
          music: "YouTube",
          welcome:
            "Welcome, {{user_name}}. I’m happy to see you. Where are we going today?",
        },
    ),
    [listening, setListening] = useState(false),
    [voiceState, setVoiceState] = useState("ready"),
    [heard, setHeard] = useState(""),
    [reply, setReply] = useState(
      "Save your settings, then I will welcome you and begin talking",
    ),
    [route, setRoute] = useState(null),
    [trained, setTrained] = useState(() => {
      const saved = JSON.parse(localStorage.getItem("cm-training") || "null") || [];
      const seen = new Set(globalTraining.map((item) => item.q.toLowerCase()));
      return [...globalTraining, ...saved.filter((item) => !seen.has(item.q.toLowerCase()))];
    }),
    [personalTrained, setPersonalTrained] = useState(
      () => JSON.parse(localStorage.getItem("cm-personal-training") || "null") || [],
    ),
    [languageTraining, setLanguageTraining] = useState(() => {
      const saved = JSON.parse(localStorage.getItem("cm-language-training") || "null") || {};
      return {...seededLanguageTraining, ...saved};
    }),
    [draft, setDraft] = useState(""),
    [personalDraft, setPersonalDraft] = useState(""),
    [playing, setPlaying] = useState(false),
    [owner, setOwner] = useState({ email: "", password: "" }),
    [billing, setBilling] = useState(() => ({
      ...billingDefaults,
      ...(JSON.parse(localStorage.getItem("cm-billing") || "null") || {}),
    })),
    [entitlement] = useState(() => {
      // A versioned entitlement gives every tester one clean three-hour trial for
      // this release while still preventing refreshes or reopening from resetting it.
      const saved = JSON.parse(localStorage.getItem("cm-entitlement-v43") || "null");
      if (saved) return saved;
      const created = { installedAt: Date.now(), plan: null, expiresAt: 0 };
      localStorage.setItem("cm-entitlement-v43", JSON.stringify(created));
      return created;
    }),
    [now, setNow] = useState(Date.now());
  const [treatmentSession, setTreatmentSession] = useState(null);
  const rec = useRef(null);
  const tabHistoryRef = useRef([tab]);
  const listeningRef = useRef(false);
  const speakingRef = useRef(false);
  const processingRef = useRef(false);
  const wakeLockRef = useRef(null);
  const conversationContextRef = useRef(null);
  const problemContextRef = useRef(null);
  useEffect(() => {
    localStorage.setItem("cm-profile", JSON.stringify(profile));
  }, [profile]);
  useEffect(() => {
    if (!serverConfigured()) return;
    serverApi.publicConfig().then((remote) => {
      setBilling((current) => ({
        ...current,
        monthlyPrice: Number(remote.monthlyPrice ?? current.monthlyPrice),
        yearlyPrice: Number(remote.yearlyPrice ?? current.yearlyPrice),
        currency: remote.currency || current.currency,
        trialHours: Number(remote.trialHours ?? current.trialHours),
        youtubeChannelUrl: remote.youtubeChannelUrl || current.youtubeChannelUrl,
        provider: remote.paymentProvider || current.provider,
      }));
    }).catch(() => {});
  }, []);
  useEffect(() => {
    const expectedWelcome = welcomeForLanguage(profile.languageCode || "en-NG");
    if (Object.values(localizedWelcomes).includes(profile.welcome) && profile.welcome !== expectedWelcome) {
      setProfile((current) => ({...current, welcome: expectedWelcome}));
    }
  }, [profile.languageCode]);
  useEffect(() => {
    localStorage.setItem("cm-training", JSON.stringify(trained));
  }, [trained]);
  useEffect(() => {
    localStorage.setItem("cm-personal-training", JSON.stringify(personalTrained));
  }, [personalTrained]);
  useEffect(() => {
    localStorage.setItem("cm-language-training", JSON.stringify(languageTraining));
  }, [languageTraining]);
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  useEffect(() => {
    redeemTreatmentFromUrl().then((session) => session && setTreatmentSession(session));
  }, []);
  async function keepListeningScreenAwake() {
    if (!listeningRef.current || !navigator.wakeLock?.request || document.visibilityState !== "visible") return;
    try {
      wakeLockRef.current = await navigator.wakeLock.request("screen");
      wakeLockRef.current.addEventListener("release", () => { wakeLockRef.current = null; });
    } catch {}
  }
  useEffect(() => {
    const restoreListening = () => {
      if (document.visibilityState === "visible" && listeningRef.current) {
        keepListeningScreenAwake();
        setTimeout(resumeListening, 250);
      }
    };
    document.addEventListener("visibilitychange", restoreListening);
    return () => document.removeEventListener("visibilitychange", restoreListening);
  }, []);
  useEffect(() => {
    document.documentElement.dataset.carmindLanguage = profile.languageCode || "en-NG";
    const timer = window.setTimeout(() => translateVisiblePage(profile.languageCode || "en-NG"), 120);
    return () => window.clearTimeout(timer);
  }, [profile.languageCode, tab]);
  useEffect(() => watchPageLanguage(() => document.documentElement.dataset.carmindLanguage || profile.languageCode || "en-NG"), [profile.languageCode]);
  useEffect(() => {
    if (tabHistoryRef.current.at(-1) !== tab) tabHistoryRef.current.push(tab);
    if (tabHistoryRef.current.length > 12) tabHistoryRef.current.shift();
  }, [tab]);
  function goBackScreen() {
    if (tabHistoryRef.current.length > 1) tabHistoryRef.current.pop();
    const previous = tabHistoryRef.current.at(-1) || "Assistant";
    setTab(previous);
    return previous;
  }
  const isOwner = Boolean(
    billing.ownerEmail &&
      profile.email?.toLowerCase() === billing.ownerEmail.toLowerCase(),
  );
  const trialEndsAt = entitlement.installedAt + billing.trialHours * 60 * 60 * 1000;
  const hasAccess =
    isOwner ||
    (!expiredPreview &&
      (!billing.enforceSubscription ||
        now < trialEndsAt ||
        now < Number(entitlement.expiresAt || 0)));
  const trialRemainingMs = Math.max(0, trialEndsAt - now);
  function resumeListening() {
    if (!listeningRef.current || speakingRef.current || processingRef.current || !rec.current) return;
    try {
      rec.current.start();
      setVoiceState("listening");
    } catch {}
  }
  async function say(t, onDone, contentLanguage = "en") {
    let s = repairMojibake(t)
      .replaceAll("{{user_name}}", profile.name)
      .replaceAll("{{assistant_name}}", profile.assistant);
    if (baseLanguage(contentLanguage) !== baseLanguage(profile.languageCode || "en-NG")) {
      s = await translateAnswer(s, profile.languageCode || "en-NG");
    }
    setReply(s);
    window.carmindDuck?.(true);
    speakingRef.current = true;
    try {
      rec.current?.stop();
    } catch {}
    speak(s, setVoiceState, () => {
      speakingRef.current = false;
      processingRef.current = false;
      window.carmindDuck?.(false);
      onDone?.();
      setTimeout(resumeListening, 350);
    }, profile.languageCode || "en-NG");
  }
  async function command(raw, sourceCode = profile.languageCode || "en-NG", recognitionAlternatives = []) {
    // Continuous recognition can deliver the same phrase more than once, or
    // hear Carmind's own speaker. Lock immediately—before translation—so a
    // second result cannot cancel and restart the current spoken sentence.
    if (processingRef.current || speakingRef.current) return;
    processingRef.current = true;
    try { rec.current?.stop(); } catch {}
    raw = chooseVoiceTranscript([raw, ...recognitionAlternatives], profile) || raw;
    const personallyHeard = applyVoiceProfile(raw, profile.voiceSamples || []);
    let understood = normalizeLocalCommand(personallyHeard, sourceCode);
    if (baseLanguage(sourceCode) !== "en") {
      try { understood = await translateBetween(understood, sourceCode, "en"); } catch {}
    }
    const s = understood
      .toLowerCase()
      .trim()
      .replace(/\bi['’]?m\b/g, "i am")
      .replace(/\bi['’]?ve\b/g, "i have")
      .replace(/\bdon['’]?t\b/g, "do not")
      .replace(/\bcan['’]?t\b/g, "cannot")
      .replace(/\bdidn['’]?t\b/g, "did not")
      .replace(
        /\b(put|give|show|bring)\s+(me\s+)?(some\s+)?(music|song|video)\b/g,
        "play $4",
      )
      .replace(/\b(on|start)\s+(the\s+)?(music|song|video)\b/g, "play $3")
      .replace(/\b(carry|take)\s+me\s+(go\s+)?/g, "drive me to ")
      .replace(/\bmake\s+we\s+go\s+/g, "drive me to ")
      .replace(/\bkarma|car mind\b/g, "carmind");
    setHeard(raw);
    const choose = (answers) => answers[Math.floor(Math.random() * answers.length)];
    const replyWithContext = (type, answers) => {
      conversationContextRef.current = type;
      problemContextRef.current = { type, story: raw.slice(0, 240) };
      return say(choose(answers));
    };
    if (/\b(go back|back please|previous screen|previous page|take me back)\b/.test(s)) {
      const previous = goBackScreen();
      return say(`Going back to ${previous}.`);
    }
    const screenRequest = detectScreenIntent(s, "en-NG");
    if (screenRequest) {
      setTab(screenRequest);
      return say(`Opening ${screenRequest}.`);
    }
    if (asksAssistantName(`${raw} ${understood}`)) {
      return say(`Your car's name is ${profile.assistant || "Mercedes"}.`);
    }
    const containsImmediateAction = /\b(play|pause|resume|continue|next|previous|restart|replay|forward|rewind|drive|navigate|open|show|volume|mute|unmute|wi-?fi|bluetooth)\b/.test(s);
    if (assistantWasCalled(raw, understood, profile.assistant) && !containsImmediateAction) {
      return say(`Hello, ${profile.name || "there"}. What can I do for you?`);
    }
    const callRequest = s.match(/\b(?:call|phone|dial)(?:\s+me)?(?:\s+my)?\s+(.+?)(?:\s+please)?$/);
    if (callRequest) {
      const contact = callRequest[1].replace(/\b(now|for me)\b/g, "").trim();
      const savedNumbers = {
        wife: profile.wifePhone,
        husband: profile.husbandPhone,
        father: profile.fatherPhone,
        dad: profile.fatherPhone,
        mother: profile.motherPhone,
        mum: profile.motherPhone,
        mom: profile.motherPhone,
        emergency: profile.emergency,
      };
      if (window.CarmindAndroid?.callContact) {
        window.CarmindAndroid.callContact(contact);
        return say(`Calling ${contact}.`);
      }
      const number = savedNumbers[contact.toLowerCase()] || (/^\+?[\d\s()-]{7,}$/.test(contact) ? contact : "");
      if (number) {
        say(`Opening the phone dialler for ${contact}.`);
        window.location.href = `tel:${number.replace(/[^\d+]/g, "")}`;
        return;
      }
      return say(`I found your request to call ${contact}. On Android, allow Contacts and Phone permission so I can find and call that person. For this website test, save their number in Settings first.`);
    }
    const meanings = phraseMeaning(raw, understood);
    const conversationIntents = detectConversationIntents(`${raw} ${understood}`);
    const unhappy = meanings.has("unhappy") || /\b(unhappy|sad|down|miserable|not happy|bad mood|heartbroken|feel awful|feel terrible|not myself|low spirit|heavy heart)\b/.test(s);
    const bored = meanings.has("bored") || /\b(bored|boring|nothing to do|fed up|restless|need something to do)\b/.test(s);
    const sick = meanings.has("sick") || /\b(sick|not feeling well|feel ill|unwell|body is not okay|body no well|feverish|in pain|have a fever)\b/.test(s);
    const stressed = meanings.has("stressed") || /\b(stressed|stressful|exhausted|frustrated|overwhelmed|cannot cope|too much on my mind|under pressure)\b/.test(s);
    const positiveDay = meanings.has("positive") || /\b(i am fine today|i feel fine today|my day went well|good day|happy today|i am happy|feel better|doing great)\b/.test(s);
    const isEmotionalStatement = unhappy || bored || sick || stressed || positiveDay;
    const asksForPrayer = /\b(pray for me|please pray for me|remember me in (your )?prayer|keep me in (your )?prayers|put me in prayer)\b/.test(s);
    if (asksForPrayer) {
      const type = problemContextRef.current?.type || "general";
      const prayers = type === "health" || type === "sick" ? [
        "I will keep you in my prayers. May God give you strength, healing and the right help. Please continue following qualified medical advice.",
        "I’m praying for your recovery and peace of mind. May God be with you and give you strength through this.",
      ] : type === "grief" ? [
        "I will pray for you. May God comfort you, strengthen your heart and give you peace as you remember the person you lost.",
        "You are in my prayers. May God carry you through this grief and surround you with comfort and support.",
      ] : type === "relationship" || type === "lonely" ? [
        "I will pray for you. May God comfort your heart, guide your relationship and give you peace.",
        "You are in my prayers. May God strengthen you and bring peace to everything troubling your heart.",
      ] : type === "money" || type === "work" || type === "business" ? [
        "I will pray for you. May God open a good way forward, give you wisdom and bring you out of this difficult situation.",
        "Don’t lose hope. I’m praying that God gives you strength, direction and better opportunities.",
      ] : [
        "I will pray for you. Don’t worry—these problems came, and they can also pass. May God give you strength and peace.",
        "You are in my prayers. May God be with you, guide you and bring you out of this situation.",
        "I’m praying for you. Hold on to hope; may God give you comfort and make tomorrow better.",
      ];
      return say(choose(prayers));
    }
    const missesLovedOne = /\b(miss|missing)\b.*\b(wife|husband|girlfriend|boyfriend|partner|family|mother|father|child|children)\b/.test(s);
    const relationshipProblem = /\b(relationship|marriage|wife|husband|girlfriend|boyfriend|partner)\b.*\b(problem|left|leave|fight|fighting|quarrel|broke up|separated)\b/.test(s);
    const moneyProblem = /\b(money|debt|rent|bills|broke|financial|business loss|no money)\b/.test(s);
    const workProblem = /\b(lost my job|job problem|work problem|office problem|business is bad|business problem)\b/.test(s);
    const griefProblem = /\b(died|dead|lost my wife|lost my husband|lost my mother|lost my father|bereaved|funeral)\b/.test(s);
    if (griefProblem) return replyWithContext("grief", [
      "I’m deeply sorry for your loss. That kind of pain is not easy to carry. I’m here to listen.",
      "I’m so sorry, my friend. Please take your time—you don’t have to hide how you feel.",
    ]);
    if (missesLovedOne || relationshipProblem) return replyWithContext("relationship", [
      "I’m sorry. Missing someone you love can hurt deeply. Would you like to tell me more about them?",
      "That sounds painful. I’m here with you—what do you miss most about them?",
      "I understand why your heart feels heavy. Tell me what happened when you’re ready.",
    ]);
    if (conversationIntents.has("business_setback")) return replyWithContext("business", [
      "I’m really sorry. Losing an important business deal can be painful, especially after putting time and hope into it. Do you want to tell me what happened?",
      "That is a difficult setback. Please don’t blame yourself too quickly—one lost deal does not define your ability or your business.",
      "I’m sorry the deal did not work out. Take a breath; you can review what happened and prepare for the next opportunity when you feel ready.",
      "That must be disappointing. You worked for that opportunity, so it makes sense to feel bad. I’m here if you want to talk about it.",
      "I understand why you’re upset. A major deal may be gone, but your experience and the next opportunity are still ahead of you.",
    ]);
    if (moneyProblem) return replyWithContext("money", [
      "I’m sorry you’re facing financial pressure. That can feel overwhelming. What is worrying you most right now?",
      "That sounds difficult. Let’s take it one step at a time—tell me what happened.",
    ]);
    if (workProblem) return replyWithContext("work", [
      "I’m sorry work is troubling you. Tell me what happened—I’m listening.",
      "That sounds stressful. What part of the situation is weighing on you most?",
    ]);
    if (unhappy && bored) return replyWithContext("unhappy", [
      `I’m sorry you’re feeling unhappy and bored, ${profile.name || "my friend"}. What happened today?`,
      "That sounds like a difficult day. I’m here with you—would you like to tell me what happened?",
      "I’m sorry you feel this way. Talk to me; what made today feel so heavy?",
    ]);
    if (sick) return replyWithContext("sick", [
      `I’m sorry you’re feeling sick, ${profile.name || "my friend"}. Have you taken your medication or spoken with a healthcare professional?`,
      "I’m sorry you don’t feel well. If you are driving, please stop somewhere safe. Have you taken any appropriate medication?",
      "Your health comes first. Would you like me to help find a nearby pharmacy or hospital?",
    ]);
    if (unhappy) return replyWithContext("unhappy", [
      "I’m sorry you’re unhappy. What happened? I’m listening.",
      `Oh no, ${profile.name || "my friend"}. Would you like to tell me what made you unhappy?`,
      "That sounds difficult. Talk to me—what happened today?",
    ]);
    if (bored) return replyWithContext("bored", [
      "Oh, what happened? Would you like to talk about your day?",
      `I’m sorry you’re bored, ${profile.name || "my friend"}. Shall we talk or play something you enjoy?`,
      "I’m here with you. Tell me what made today feel boring.",
    ]);
    if (stressed) return replyWithContext("stressed", [
      "I’m sorry today was stressful. What happened?",
      "That sounds exhausting. You can tell me about it, and please drive calmly.",
      "I understand. Take a slow breath—I’m here with you.",
    ]);
    if (positiveDay) {
      conversationContextRef.current = null;
      return say(choose([
        "That’s lovely to hear. It sounds like your day went well.",
        "I’m happy to hear that. What was the best part of your day?",
        `That’s good news, ${profile.name || "my friend"}. I hope the rest of your day stays peaceful.`,
      ]));
    }
    const actionRequest = /\b(play|pause|resume|continue|next song|previous song|stop music|video|drive|navigate|take me|route|volume|mute|unmute|wi-?fi|bluetooth|call|message|hospital|filling station|fuel station)\b/.test(s);
    if (conversationContextRef.current && !actionRequest && !isEmotionalStatement && s.length > 1) {
      const context = conversationContextRef.current;
      conversationContextRef.current = null;
      const followups = context === "sick" ? [
        "Please take care of yourself. If you feel worse or driving becomes difficult, stop safely and seek medical help.",
        "I understand. Please rest and follow advice from a qualified healthcare professional.",
      ] : [
        "I understand. Don’t worry—everything can get better, and tomorrow may be a better day.",
        "Thank you for telling me. You made it through today, and I’m here with you.",
        "I’m sorry you went through that. Be gentle with yourself; tomorrow is another opportunity.",
      ];
      return say(choose(followups));
    }
    const localPack = languageTraining[baseLanguage(sourceCode)] || [];
    const localMatch = !actionRequest && localPack.find((x) => {
      const clean = (value) => value.toLocaleLowerCase()
        .replaceAll("{{assistant_name}}", (profile.assistant || "mercedes").toLocaleLowerCase())
        .replaceAll("{{user_name}}", (profile.name || "").toLocaleLowerCase())
        .replace(/[^\p{L}\p{N}\s]/gu, " ").replace(/\s+/g, " ").trim();
      const heardText = clean(raw);
      const question = clean(x.q);
      return heardText === question || (question.length > 5 && heardText.includes(question));
    });
    if (localMatch) return say(localMatch.a, undefined, sourceCode);
    const match = !actionRequest && [...personalTrained, ...trained].find((x) => {
      const q = x.q.toLowerCase()
        .replaceAll("{{assistant_name}}", (profile.assistant || "mercedes").toLowerCase())
        .replaceAll("{{user_name}}", (profile.name || "").toLowerCase())
        .replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
      const heardText = s.replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
      return heardText === q || (q.length > 5 && heardText.includes(q));
    });
    if (match) return say(match.a);
    if (s.includes("hello") || s.includes("hi "))
      return say(`Hello, ${profile.name || "there"}. What can I do for you?`);
    if (s.includes("office")) return startRoute("office");
    if (s.includes("home")) return startRoute("home");
    if (s.includes("lagos")) return startRoute("lagos");
    if (s.includes("filling") || s.includes("fuel station"))
      return startRoute("station");
    if (s.includes("hospital")) return startRoute("hospital");
    if (s.includes("stop navigation")) {
      setRoute(null);
      return say("Navigation stopped.");
    }
    if (/\b(volume up|increase volume|turn up (the )?volume|louder)\b/.test(s)) {
      const level = window.CarmindAndroid?.changeVolume
        ? window.CarmindAndroid.changeVolume("up")
        : window.carmindVolume?.("up");
      return say(`Volume increased${Number.isFinite(Number(level)) ? ` to ${level} percent` : ""}.`);
    }
    if (/\b(volume down|decrease volume|reduce (the )?volume|turn down (the )?volume|quieter)\b/.test(s)) {
      const level = window.CarmindAndroid?.changeVolume
        ? window.CarmindAndroid.changeVolume("down")
        : window.carmindVolume?.("down");
      return say(`Volume reduced${Number.isFinite(Number(level)) ? ` to ${level} percent` : ""}.`);
    }
    if (/\b(mute|mute (the )?(music|sound|volume))\b/.test(s)) {
      window.CarmindAndroid?.changeVolume
        ? window.CarmindAndroid.changeVolume("mute")
        : window.carmindVolume?.("mute");
      return say("Carmind media is muted.");
    }
    if (/\b(unmute|restore (the )?(sound|volume))\b/.test(s)) {
      const level = window.CarmindAndroid?.changeVolume
        ? window.CarmindAndroid.changeVolume("unmute")
        : window.carmindVolume?.("unmute");
      return say(`Sound restored${Number.isFinite(Number(level)) ? ` to ${level} percent` : ""}.`);
    }
    if (/\b(turn|switch|put)?\s*(on|off)\s+(the\s+)?wi[ -]?fi\b|\bwi[ -]?fi\s+(on|off)\b/.test(s)) {
      const enabled = /\b(on)\b/.test(s) && !/\boff\b/.test(s);
      if (window.CarmindAndroid?.setWifiEnabled) {
        window.CarmindAndroid.setWifiEnabled(enabled);
        return say(`Wi-Fi ${enabled ? "on" : "off"} requested.`);
      }
      return say(
        "Wi-Fi control needs the Carmind Android app. Chrome does not allow a website to change your phone Wi-Fi.",
      );
    }
    const wifiConnect = s.match(/(?:connect|join)(?: me)?(?: to)?(?: the)? wi[ -]?fi(?: called| named)?\s+(.+)/);
    if (wifiConnect) {
      const network = wifiConnect[1].trim();
      if (window.CarmindAndroid?.connectWifi) {
        window.CarmindAndroid.connectWifi(network);
        return say(`Opening the Android connection request for ${network}.`);
      }
      return say(`I found the command to connect to ${network}. The Carmind Android app is required to scan and ask Android for connection approval.`);
    }
    if (/\b(turn|switch|put)?\s*(on|off)\s+(the\s+)?bluetooth\b|\bbluetooth\s+(on|off)\b/.test(s)) {
      const enabled = /\b(on)\b/.test(s) && !/\boff\b/.test(s);
      if (window.CarmindAndroid?.setBluetoothEnabled) {
        window.CarmindAndroid.setBluetoothEnabled(enabled);
        return say(`Bluetooth ${enabled ? "on" : "off"} requested.`);
      }
      return say("Bluetooth control needs the Carmind Android app. Chrome does not allow a website to change phone Bluetooth.");
    }
    const bluetoothConnect = s.match(/connect(?: me)?(?: to)?(?: the)? bluetooth(?: device)?(?: called| named)?\s+(.+)/);
    if (bluetoothConnect) {
      const device = bluetoothConnect[1].trim();
      if (window.CarmindAndroid?.connectBluetooth) {
        window.CarmindAndroid.connectBluetooth(device);
        return say(`Searching for ${device}. Android will ask you to approve the first pairing.`);
      }
      return say(`I understood that you want to connect to ${device}. Device scanning and pairing will work in the Carmind Android app after Nearby Devices permission is approved.`);
    }
    if (/\b(next|next song|next track|next video|skip this)\b/.test(s)) {
      const changed = window.carmindMediaAction?.("next");
      return say(changed === false ? "There is no other matching media in the car library." : "Playing the next item.");
    }
    if (/\b(previous|previous song|previous track|previous video|go to the last song)\b/.test(s)) {
      const changed = window.carmindMediaAction?.("previous");
      return say(changed === false ? "There is no previous matching media in the car library." : "Playing the previous item.");
    }
    if (/\b(pause|hold the music|pause the video|stop for a moment)\b/.test(s)) {
      setPlaying(false);
      window.carmindMediaAction?.("pause");
      return say("Media paused.");
    }
    if (/\b(resume|continue playing|continue the music|continue the video)\b/.test(s)) {
      setPlaying(true);
      window.carmindMediaAction?.("resume");
      return say("Continuing your media.");
    }
    if (/\b(restart|replay|start this song again|start this video again)\b/.test(s)) {
      window.carmindMediaAction?.("restart");
      return say("Starting it again.");
    }
    if (/\b(forward|go forward|skip forward)\b/.test(s)) {
      window.carmindMediaAction?.("forward");
      return say("Moving forward ten seconds.");
    }
    if (/\b(rewind|go backward|back ten seconds)\b/.test(s)) {
      window.carmindMediaAction?.("rewind");
      return say("Moving back ten seconds.");
    }
    if (/\b(full screen|fullscreen|make the video big)\b/.test(s)) {
      const opened = window.carmindMediaAction?.("fullscreen");
      return say(opened === false ? "Chrome requires one tap on the video fullscreen button. The Android app will perform this command directly." : "Opening the video fullscreen.");
    }
    if (s.includes("play")) {
      setPlaying(true);
      // A new media request always takes priority over whatever is currently
      // playing, so music can never cover or block a requested video.
      window.carmindPause?.();
      let query = understood
        .replace(
          /\b(play|please|music|song|video|audio|track|sample|from|on|youtube|spotify|my playlist|for me|me)\b/gi,
          "",
        )
        .replace(/karma|calm mind|car mine|car man|common mind|car mind/gi, "Carmind")
        .trim();
      if (/\bcarmind\s+demo(?:\s+beats?)?\b/i.test(query) || (/\bdemo\b/i.test(query) && !s.includes("video"))) query = "Carmind Demo Beat";
      if (/\b(?:carmind )?demo videos?\b/i.test(query)) query = "Carmind Demo Video";
      if (s.includes("youtube")) {
        say(`Opening YouTube${query ? ` and searching for ${query}` : ""}.`);
        let target = `https://www.youtube.com/results?search_query=${encodeURIComponent(query || "music")}`;
        if (serverConfigured()) {
          try {
            const result = await serverApi.youtube(query || "music");
            if (result.items?.[0]?.id) target = `https://www.youtube.com/watch?v=${encodeURIComponent(result.items[0].id)}&autoplay=1`;
          } catch {}
        }
        window.open(target, "_blank", "noopener,noreferrer");
        return;
      }
      if (s.includes("spotify")) {
        say(`Opening Spotify${query ? ` and searching for ${query}` : ""}.`);
        let target = `https://open.spotify.com/search/${encodeURIComponent(query || "music")}`;
        if (serverConfigured()) {
          try {
            const result = await serverApi.spotify(query || "music");
            if (result.items?.[0]?.url) target = result.items[0].url;
          } catch {}
        }
        window.open(target, "_blank", "noopener,noreferrer");
        return;
      }
      setTab("Media");
      const mediaType = s.includes("video") ? "video" : "audio";
      // When a voice command opens Media from another screen, React needs a
      // moment to mount the real audio/video elements. Do not announce success
      // until the player exists and the playback request has been delivered.
      let started = false;
      for (let attempt = 0; attempt < 12; attempt += 1) {
        if (typeof window.carmindPlay === "function") {
          started = window.carmindPlay(query, mediaType);
          break;
        }
        await new Promise((resolve) => window.setTimeout(resolve, 50));
      }
      if (started === false) {
        const libraryOnly = /\b(my|car|carmind)\s+(gallery|library|playlist)\b/.test(s) || /\bin (my|the) (gallery|library|playlist)\b/.test(s);
        if (libraryOnly) return say("I could not find a matching song in the Carmind library. Import the song into Media and I will find it next time.");
        const service = (profile.music || "YouTube").toLowerCase();
        const moodSearch = query || (s.includes("emotional") || s.includes("sad") ? "emotional songs" : s.includes("vibrant") || s.includes("energetic") ? "vibrant songs" : "music");
        if (service.includes("spotify")) {
          say(`I could not find it in the car library, so I’m searching Spotify for ${moodSearch}.`);
          window.open(`https://open.spotify.com/search/${encodeURIComponent(moodSearch)}`, "_blank");
        } else {
          say(`I could not find it in the car library, so I’m searching YouTube for ${moodSearch}.`);
          window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(moodSearch)}`, "_blank");
        }
        return;
      }
      say(`Playing ${query || `the Carmind ${mediaType} playlist`} now.`);
      return;
    }
    if (s.includes("pause") || s.includes("stop music")) {
      setPlaying(false);
      window.carmindPause?.();
      return say("Music paused.");
    }
    if (s.includes("weather"))
      return say("It is 29 degrees in Lagos with light clouds. Drive safely.");
    if (serverConfigured()) {
      try {
        const result = await serverApi.converse(raw, {
          userName: profile.name,
          assistantName: profile.assistant,
          language: profile.languageCode,
          recentProblem: problemContextRef.current,
        });
        if (result.answer) return say(result.answer, undefined, profile.languageCode);
      } catch {}
    }
    say("I’m sorry, I don’t understand that yet. Please say it another way.");
  }
  async function startRoute(k) {
    const baseRoute = routes[k];
    const destination = k === "home" ? profile.home || baseRoute.name : k === "office" ? profile.office || baseRoute.name : baseRoute.name;
    let r = {...baseRoute, name: destination};
    if (serverConfigured()) {
      try {
        const origin = await new Promise((resolve) => {
          if (!navigator.geolocation) return resolve("Lagos, Nigeria");
          navigator.geolocation.getCurrentPosition(
            ({coords}) => resolve(`${coords.latitude},${coords.longitude}`),
            () => resolve("Lagos, Nigeria"),
            {enableHighAccuracy:true,timeout:7000,maximumAge:30000},
          );
        });
        const result = await serverApi.route(origin, destination);
        const routeResult = result.routes?.[0];
        if (routeResult) {
          const seconds = Number(String(routeResult.duration || "0s").replace("s", ""));
          r = {...r, eta:`${Math.max(1, Math.round(seconds / 60))} min`, distance:`${(Number(routeResult.distanceMeters || 0) / 1000).toFixed(1)} km`, polyline:routeResult.polyline?.encodedPolyline, steps:routeResult.legs?.flatMap((leg) => leg.steps || []) || []};
        }
      } catch {}
    }
    setRoute(r);
    setTab("Drive");
    const firstInstruction = r.steps?.[0]?.navigationInstruction?.instructions || "Head north, then turn right in 300 metres";
    say(`Starting navigation to ${r.name}. ${firstInstruction}.`);
  }
  async function toggleMic() {
    // Unlock the bundled media while this is still a direct user gesture.
    window.carmindUnlock?.();
    if (listening) {
      rec.current?.stop();
      listeningRef.current = false;
      setListening(false);
      setVoiceState("ready");
      try { await wakeLockRef.current?.release(); } catch {}
      wakeLockRef.current = null;
      return;
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      const message =
        "This browser cannot hear speech. On iPhone, open the link directly in Safari. On Android, open it directly in Google Chrome.";
      setReply(message);
      say(message);
      return;
    }
    const r = new SR();
    r.continuous = true;
    r.interimResults = false;
    r.maxAlternatives = 5;
    r.lang = profile.languageCode || "en-NG";
    r.onresult = (e) => {
      const result = e.results[e.results.length - 1];
      if (result?.isFinal) {
        const alternatives = Array.from(result).map((item) => item.transcript);
        command(alternatives[0], profile.languageCode || "en-NG", alternatives.slice(1));
      }
    };
    r.onend = () => {
      if (rec.current === r && listeningRef.current && !speakingRef.current && !processingRef.current)
        setTimeout(resumeListening, 300);
    };
    r.onerror = (e) => {
      if (["not-allowed", "service-not-allowed", "audio-capture"].includes(e.error)) {
        listeningRef.current = false;
        setListening(false);
        setVoiceState("microphone-error");
        setReply(`Microphone: ${e.error}. Check Carmind microphone permission in Chrome settings.`);
      } else if (e.error !== "no-speech" && e.error !== "aborted") {
        setReply(`Microphone: ${e.error}. Carmind will keep trying while listening remains on.`);
      }
    };
    rec.current = r;
    try {
      r.start();
      listeningRef.current = true;
      setListening(true);
      setVoiceState("listening");
      await keepListeningScreenAwake();
    } catch {}
  }
  function welcome() {
    const message = profile.welcome || welcomeForLanguage(profile.languageCode);
    const alreadyLocalized = Object.values(localizedWelcomes).includes(message);
    say(message, undefined, alreadyLocalized ? profile.languageCode : "en");
  }
  function startMercedes() {
    window.carmindUnlock?.();
    if (!listening) toggleMic();
    welcome();
  }
  async function register(p) {
    setProfile(p);
    localStorage.setItem("cm-profile", JSON.stringify(p));
    if (!p.voiceCalibrated || p.voiceProfileVersion !== VOICE_PROFILE_VERSION) {
      setTab("Voice Setup");
      return;
    }
    setTab("Assistant");
    const message = (p.welcome || welcomeForLanguage(p.languageCode))
      .replaceAll("{{user_name}}", p.name)
      .replaceAll("{{assistant_name}}", p.assistant);
    const alreadyLocalized = Object.values(localizedWelcomes).includes(p.welcome);
    const translated = alreadyLocalized ? message : await translateAnswer(message, p.languageCode || "en-NG");
    setReply(translated);
    speak(translated, setVoiceState, undefined, p.languageCode || "en-NG");
  }
  function parseTraining() {
    parseTrainingInto(draft, setDraft, trained, setTrained);
  }
  function parsePersonalTraining() {
    parseTrainingInto(personalDraft, setPersonalDraft, personalTrained, setPersonalTrained);
  }
  function parseTrainingInto(source, clearDraft, current, update) {
    const blocks = source
      .split(/\n\s*\n/)
      .map((x) => x.trim())
      .filter(Boolean);
    const items = [];
    for (const b of blocks) {
      let m =
        b.match(/Question:\s*(.+?)\nAnswer:\s*([\s\S]+)/i) ||
        b.match(/^(.+?)\s*=>\s*([\s\S]+)$/);
      if (m) items.push({ q: m[1].trim(), a: m[2].trim() });
    }
    if (items.length) {
      update([...current, ...items]);
      clearDraft("");
      say(`${items.length} new response${items.length > 1 ? "s" : ""} saved.`);
    } else alert("Use “Question: ... Answer: ...” or “Question => Answer”.");
  }
  function logout() {
    sessionStorage.removeItem("cm");
    setLogged(false);
  }
  if (!logged)
    return (
      <Login
        onLogin={() => {
          sessionStorage.cm = "1";
          setLogged(true);
        }}
      />
    );
  const nav = adminMode
    ? [["Control Panel", Settings]]
    : [
        ["Settings", User],
        ["Assistant", Radio],
        ["Drive", Navigation],
        ["Media", Music],
        ["Train My Carmind", GraduationCap],
        ["Training Pack", FileText],
        ["Help & Learning", BookOpen],
        ["Payment", CreditCard],
      ];
  return (
    <div className="shell">
      <aside className={menu ? "open" : ""}>
        <div className="brand">
          <span className="logo">
            <Navigation />
          </span>
          Carmind <b>AI</b>
          <button className="close" onClick={() => setMenu(false)}>
            <X />
          </button>
        </div>
        <div className="driver">
          <div className="avatar">C</div>
          <div>
            <strong>{adminMode ? "Owner Administration" : "Customer Demo"}</strong>
            <span>{adminMode ? "Carmind control centre" : "Public preview"}</span>
          </div>
        </div>
        <nav>
          {nav.map(([n, I]) => (
            <button
              className={tab === n ? "active" : ""}
              onClick={() => {
                setTab(n);
                setMenu(false);
              }}
            >
              <I size={20} />
              {n}
            </button>
          ))}
        </nav>
        <div className="side-bottom">
          <div className="status">
            <i /> Systems online
          </div>
        </div>
      </aside>
      <main>
        <header>
          <button className="hamb" onClick={() => setMenu(true)}>
            <Menu />
          </button>
          <div>
            <p className="eyebrow">{adminMode ? "OWNER CONTROL CENTRE" : "CUSTOMER DEMONSTRATION"}</p>
            <h2>{tab}</h2>
          </div>
          <div className="top-info">
            <span>
              <CloudSun size={18} />
              29°C Lagos
            </span>
            <span>
              <Clock size={18} />
              {new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </header>
        {!hasAccess && !adminMode && (
          <div className="expired-preview-banner"><Lock size={16}/> ACCESS LOCKED — PAYMENT OR VERIFIED OWNER ACCESS REQUIRED</div>
        )}
        {treatmentSession && (
          <div className={`expired-preview-banner ${treatmentSession.active ? "treatment-active" : ""}`}>
            {treatmentSession.active
              ? `SECURE TREATMENT SESSION ACTIVE UNTIL ${new Date(treatmentSession.expiresAt).toLocaleString()}`
              : treatmentSession.message}
          </div>
        )}
        {hasAccess && !adminMode && !isOwner && now < trialEndsAt && (
          <TrialBanner remainingMs={trialRemainingMs} onPayment={() => setTab("Payment")} />
        )}
        {!hasAccess && !["Payment", "Settings", "Training Pack", "Help & Learning", "Control Panel"].includes(tab) ? (
          <AccessLocked onPayment={() => setTab("Payment")} />
        ) : tab === "Settings" && (
          <Registration profile={profile} onSave={register} />
        )}{" "}
        {hasAccess && tab === "Voice Setup" && (
          <VoiceCalibration profile={profile} onComplete={(samples) => {
            const next = {...profile, voiceCalibrated: true, voiceProfileVersion: VOICE_PROFILE_VERSION, voiceSamples: samples};
            setProfile(next);
            localStorage.setItem("cm-profile", JSON.stringify(next));
            setTab("Assistant");
            const message = (next.welcome || welcomeForLanguage(next.languageCode)).replaceAll("{{user_name}}", next.name).replaceAll("{{assistant_name}}", next.assistant);
            speak(repairMojibake(message), setVoiceState, undefined, next.languageCode || "en-NG");
          }} onSkip={() => {
            const next = {...profile, voiceCalibrated: true, voiceProfileVersion: VOICE_PROFILE_VERSION, voiceSamples: []};
            setProfile(next); localStorage.setItem("cm-profile", JSON.stringify(next)); setTab("Assistant");
          }} />
        )}{" "}
        {hasAccess && tab === "Drive" && (
          <Drive
            route={route}
            startRoute={startRoute}
            profile={profile}
            playing={playing}
            setPlaying={setPlaying}
            say={say}
            onBack={() => {
              const previous = goBackScreen();
              say(`Going back to ${previous}.`);
            }}
          />
        )}{" "}
        {hasAccess && tab === "Assistant" && (
          <Assistant
            {...{
              profile,
              listening,
              toggleMic,
              voiceState,
              heard,
              reply,
              welcome,
              startMercedes,
              command,
            }}
          />
        )}{" "}
        <div className={hasAccess && tab === "Media" ? "tab-panel" : "tab-panel hidden-tab"}>
          <MediaCenter say={say} />
        </div>{" "}
        {hasAccess && tab === "Train My Carmind" && (
          (isOwner || localStorage.getItem("cm-personal-training-access") === "verified")
            ? <Training trained={personalTrained} setTrained={setPersonalTrained} draft={personalDraft} setDraft={setPersonalDraft} parseTraining={parsePersonalTraining} customer />
            : <PersonalTrainingLocked billing={billing} profile={profile} onStore={() => setTab("Training Pack")} />
        )}
        {tab === "Training Pack" && <TrainingStore billing={billing} profile={profile} />}
        {tab === "Help & Learning" && <LearningCenter billing={billing} />}
        {tab === "Payment" && (
          <PaymentPage {...{ billing, entitlement, isOwner, trialEndsAt, hasAccess, now, profile }} />
        )}
        {tab === "Control Panel" && (
          <ControlPanel
            {...{ trained, setTrained, draft, setDraft, parseTraining, billing, setBilling, languageTraining, setLanguageTraining }}
          />
        )}
      </main>
      {hasAccess && tab !== "Settings" && tab !== "Payment" && (
        <button
          className={`float-mic ${listening ? "on" : ""}`}
          onClick={toggleMic}
        >
          {listening ? <Mic /> : <MicOff />}
          <span>{listening ? "Listening" : "Start voice"}</span>
        </button>
      )}
    </div>
  );
}

function VoiceCalibration({ profile, onComplete, onSkip }) {
  const phrases = [
    `Hello ${profile.assistant || "Mercedes"}`,
    "Open settings",
    "Open Train My Carmind",
    "Drive me home",
    "Take me to my office",
    "Play the Carmind demo audio",
    "Play the Carmind demo video",
    "Increase the volume",
    "Call my wife",
    "I lost a big business deal today",
  ];
  const [step, setStep] = useState(0);
  const [samples, setSamples] = useState([]);
  const samplesRef = useRef([]);
  const [status, setStatus] = useState("ready");
  const [lastHeard, setLastHeard] = useState("");
  const recognitionRef = useRef(null);

  function listen(index) {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setStatus("unsupported"); return; }
    const recognition = new SR();
    recognition.lang = profile.languageCode || "en-NG";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 5;
    recognition.onresult = (event) => {
      const result = event.results[event.results.length - 1];
      const alternatives = Array.from(result).map((item) => item.transcript.trim()).filter(Boolean);
      const heard = alternatives[0] || "";
      const nextSamples = [...samplesRef.current, {target: phrases[index], heard, alternatives}];
      samplesRef.current = nextSamples;
      setSamples(nextSamples);
      setLastHeard(heard);
      if (index + 1 >= phrases.length) {
        setStatus("complete");
        setTimeout(() => onComplete(nextSamples), 700);
      } else {
        setStep(index + 1);
        setStatus("prompting");
        setTimeout(() => promptAndListen(index + 1), 500);
      }
    };
    recognition.onerror = () => setStatus("retry");
    recognitionRef.current = recognition;
    setStatus("listening");
    try { recognition.start(); } catch { setStatus("retry"); }
  }
  function promptAndListen(index = step) {
    window.carmindUnlock?.();
    setStatus("prompting");
    speak(`Please say: ${phrases[index]}`, setStatus, () => setTimeout(() => listen(index), 300), profile.languageCode || "en-NG");
  }
  useEffect(() => () => { try { recognitionRef.current?.abort(); } catch {} }, []);

  return <div className="page calibration-page">
    <section className="card calibration-card">
      <p className="eyebrow">PERSONAL VOICE SETUP</p>
      <h1>Teach Carmind your voice</h1>
      <p>Carmind will ask for ten short phrases and remember how this device hears your Nigerian English across conversation and car commands.</p>
      <div className="calibration-progress">{phrases.map((_, index) => <i key={index} className={index < samples.length ? "done" : index === step ? "active" : ""} />)}</div>
      <div className={`orb mini ${status}`}><Mic /></div>
      <span className="pill">PHRASE {Math.min(step + 1, phrases.length)} OF {phrases.length}</span>
      <h2>“{phrases[step]}”</h2>
      {lastHeard && <p className="voice-heard">Carmind heard: <b>{lastHeard}</b></p>}
      {status === "unsupported" ? <p className="error">Voice setup needs Android Chrome or another browser with speech recognition.</p> :
        status === "retry" ? <button className="primary" onClick={() => promptAndListen(step)}><Mic /> Try this phrase again</button> :
        status === "ready" ? <button className="primary" onClick={() => promptAndListen(0)}><Mic /> Start ten-phrase setup</button> :
        <p className="muted">{status === "listening" ? "Listening to your voice…" : status === "complete" ? "Voice profile saved." : "Listen, then repeat the phrase."}</p>}
      <button className="textbtn" onClick={onSkip}>Skip for now</button>
    </section>
  </div>;
}

function Registration({ profile, onSave }) {
  const [p, setP] = useState(profile);
  const [languageStatus, setLanguageStatus] = useState("available");
  const field = (key, label, type = "text", placeholder = "") => (
    <label>
      {label}
      <input
        type={type}
        value={p[key] || ""}
        onChange={(e) => setP({ ...p, [key]: e.target.value })}
        placeholder={placeholder}
        required={key === "name" || key === "assistant"}
      />
    </label>
  );
  return (
    <div className="page">
      <div className="pagehead">
        <div>
          <p className="eyebrow">PERSONAL SETTINGS</p>
          <h1>Your details and preferences</h1>
          <p>Tell Carmind what to call you and where you travel.</p>
        </div>
      </div>
      <form
        className="card registration"
        onSubmit={(e) => {
          e.preventDefault();
          onSave(p);
        }}
      >
        <div className="form-section language-first">
          <h3><Volume2 /> Choose your language</h3>
          <p>Everything Carmind hears, displays and speaks will use this language when its Chrome language pack is available.</p>
          <div className="form-grid">
            <label>
              App and voice language
              <select
                value={p.language}
                onChange={async (e) => {
                  const selected = languageOptions.find(([name]) => name === e.target.value) || languageOptions[0];
                  const knownWelcome = Object.values(localizedWelcomes).includes(p.welcome);
                  const next = { ...p, language: selected[0], languageCode: selected[1], currency: selected[2], welcome: knownWelcome ? welcomeForLanguage(selected[1]) : p.welcome };
                  setP(next);
                  document.documentElement.dataset.carmindLanguage = selected[1];
                  setLanguageStatus("checking");
                  const status = await languageAvailability(selected[1]);
                  setLanguageStatus(status);
                  await translateVisiblePage(selected[1]);
                }}
              >
                {languageOptions.map(([name]) => <option key={name} value={name}>{name}</option>)}
              </select>
              <small>{languageStatus === "available" ? "Language and voice ready." : languageStatus === "checking" ? "Preparing language…" : languageStatus === "downloadable" || languageStatus === "downloading" ? "Chrome will download this language pack. Keep the page open." : "This Chrome version does not provide this complete language pack yet. English remains available."}</small>
            </label>
          </div>
        </div>
        <div className="form-section">
          <h3>
            <User />
            Personal details
          </h3>
          <div className="form-grid">
            {field("fullName", "Full name", "text", "Your full name")}
            {field("name", "Preferred name", "text", "Example: CBS")}
            {field("email", "Email address", "email", "you@example.com")}
            {field("phone", "Phone number", "tel", "Your phone number")}
            {field("emergency", "Emergency contact", "tel", "Emergency number")}
          </div>
        </div>
        <div className="form-section">
          <h3><Radio /> Hands-free calling</h3>
          <p>These optional numbers let the web test open the Android dialler. The native Carmind app will search the phone’s contacts after Contacts and Phone permission is approved.</p>
          <div className="form-grid">
            {field("wifePhone", "Wife’s phone", "tel", "Optional phone number")}
            {field("husbandPhone", "Husband’s phone", "tel", "Optional phone number")}
            {field("fatherPhone", "Father’s phone", "tel", "Optional phone number")}
            {field("motherPhone", "Mother’s phone", "tel", "Optional phone number")}
          </div>
        </div>
        <div className="form-section">
          <h3><Mic /> Personal voice profile</h3>
          <p>{p.voiceCalibrated && p.voiceProfileVersion === VOICE_PROFILE_VERSION ? "Your ten-phrase Nigerian-English voice profile is active on this device." : "Complete ten short phrases so Carmind can learn how this device hears your English."}</p>
          {p.voiceCalibrated && <button type="button" className="textbtn" onClick={() => setP({...p, voiceCalibrated:false, voiceSamples:[]})}>Train my voice again</button>}
        </div>
        <div className="form-section">
          <h3>
            <Navigation />
            Car assistant
          </h3>
          <div className="form-grid">
            {field(
              "assistant",
              "Assistant name",
              "text",
              "Mercedes, Toyota, Cynthia…",
            )}
            {field("home", "Home address", "text", "Your home location")}
            {field("office", "Office address", "text", "Your office location")}
            <label>
              Payment currency
              <select value={p.currency || "NGN"} onChange={(e) => setP({ ...p, currency: e.target.value })}>
                {currencyOptions.map((currency) => <option key={currency}>{currency}</option>)}
              </select>
              <small>Carmind suggests a currency from your language; you can change it for your country.</small>
            </label>
            <label>
              Preferred music service
              <select
                value={p.music}
                onChange={(e) => setP({ ...p, music: e.target.value })}
              >
                <option>YouTube</option>
                <option>Spotify</option>
                <option>Phone playlist</option>
              </select>
            </label>
          </div>
          <label>
            Custom welcome message
            <textarea
              value={p.welcome}
              onChange={(e) => setP({ ...p, welcome: e.target.value })}
            />
          </label>
        </div>
        <button className="primary register-btn">
          <Volume2 />
          Save settings and hear welcome
        </button>
      </form>
    </div>
  );
}

const demoTrack = {
  name: "Carmind Demo Beat",
  artist: "Carmind original demonstration track",
  moods: ["vibrant", "energetic", "happy", "uplifting"],
  type: "audio",
  url: demoBeatUrl,
};
const demoVideo = {
  name: "Carmind Demo Video",
  artist: "CC0 video demonstration",
  moods: ["calm"],
  type: "video",
  url: demoVideoUrl,
};

function MediaCenter({ say }) {
  const [library, setLibrary] = useState([demoVideo, demoTrack]);
  const [current, setCurrent] = useState(demoVideo);
  const [search, setSearch] = useState("");
  const audioRef = useRef(null);
  const videoRef = useRef(null);
  const audioContextRef = useRef(null);
  const webAudioSourceRef = useRef(null);
  const webAudioGainRef = useRef(null);
  const webAudioVolumeRef = useRef(1);
  const duckedRef = useRef(null);
  const mediaUnlockedRef = useRef(false);

  function activePlayer() {
    return current.type === "video" ? videoRef.current : audioRef.current;
  }

  function prepareVoicePlayback() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
      const gain = audioContextRef.current.createGain();
      gain.gain.value = webAudioVolumeRef.current;
      gain.connect(audioContextRef.current.destination);
      webAudioGainRef.current = gain;
    }
    audioContextRef.current.resume().catch(() => {});
  }

  function unlockVoicePlayback() {
    prepareVoicePlayback();
    const context = audioContextRef.current;
    if (context) {
      // Starting a silent buffer during the Start button's real tap keeps the
      // Web Audio engine available for later hands-free speech commands.
      try {
        const buffer = context.createBuffer(1, 1, context.sampleRate);
        const source = context.createBufferSource();
        source.buffer = buffer;
        source.connect(webAudioGainRef.current);
        source.start(0);
      } catch {}
    }
    mediaUnlockedRef.current = true;
  }

  async function playThroughVoiceEngine(item) {
    prepareVoicePlayback();
    const context = audioContextRef.current;
    if (!context || item.type !== "audio") return false;
    try {
      webAudioSourceRef.current?.stop();
    } catch {}
    try {
      const bytes = await fetch(item.url).then((response) => response.arrayBuffer());
      const buffer = await context.decodeAudioData(bytes);
      const source = context.createBufferSource();
      source.buffer = buffer;
      source.connect(webAudioGainRef.current);
      source.onended = () => {
        if (webAudioSourceRef.current === source) {
          webAudioSourceRef.current = null;
          playNext("audio", item);
        }
      };
      webAudioSourceRef.current = source;
      source.start(0);
      return true;
    } catch {
      return false;
    }
  }

  function play(query = "", preferredType = "audio") {
    const term = query.toLowerCase().trim();
    const moodWords = {
      emotional: ["emotional", "sad", "heartbreak", "soulful", "slow", "love"],
      vibrant: ["vibrant", "energetic", "happy", "upbeat", "dance", "party", "uplifting"],
      calm: ["calm", "peaceful", "relaxing", "soft", "gentle"],
    };
    const requestedMood = Object.entries(moodWords).find(([, words]) => words.some((word) => term.includes(word)));
    const searchable = (item) => `${item.name} ${item.artist || ""} ${(item.moods || []).join(" ")}`.toLowerCase();
    const exactTerms = term.split(/\s+/).filter((word) => word.length > 2 && !["play", "song", "music", "some", "please"].includes(word));
    const candidates = library.filter((item) => item.type === preferredType);
    const found = requestedMood
      ? candidates.find((item) => requestedMood[1].some((word) => searchable(item).includes(word)))
      : term
        ? candidates.find((item) => exactTerms.every((word) => searchable(item).includes(word))) ||
          candidates.find((item) => exactTerms.some((word) => searchable(item).includes(word)))
        : candidates[0];
    if (!found) return false;
    audioRef.current?.pause();
    videoRef.current?.pause();
    try {
      webAudioSourceRef.current?.stop();
    } catch {}
    webAudioSourceRef.current = null;
    setCurrent(found);
    const player = found.type === "video" ? videoRef.current : audioRef.current;
    if (!player) return false;
    if (player.src !== found.url) {
      player.src = found.url;
      player.load();
    }
    player.currentTime = 0;
    if (found.type === "audio") player.volume = 1;
    // Android Chrome permits requested inline video reliably when it starts
    // muted. The driver can unmute from the visible native video controls.
    else player.muted = true;
    // Audio requested by a speech-recognition event can still be rejected by
    // Chrome's HTML autoplay policy. The already-unlocked Web Audio engine is
    // the primary hands-free path; the visible player remains the fallback.
    if (found.type === "audio" && mediaUnlockedRef.current) {
      playThroughVoiceEngine(found).then((voiceStarted) => {
        if (!voiceStarted) player.play().catch(() => {
          say("I could not start this media file. Press Start Mercedes once and try the command again.");
        });
      });
      return true;
    }
    player.play().catch(async () => {
      if (found.type === "video") {
        player.muted = true;
        try {
          await player.play();
          return;
        } catch {}
      }
      const voiceStarted = await playThroughVoiceEngine(found);
      if (!voiceStarted)
        say("I could not start this media file. Press Start Mercedes once and try the command again.");
    });
    return true;
  }

  function playNext(type, finished = current) {
    const sameType = library.filter((item) => item.type === type);
    if (sameType.length < 2) return;
    const currentIndex = sameType.findIndex((item) => item.url === finished.url);
    play(sameType[(currentIndex + 1) % sameType.length].name, type);
  }

  function mediaAction(action) {
    const player = activePlayer();
    if (!player) return false;
    if (action === "pause") {
      player.pause();
      try { webAudioSourceRef.current?.stop(); } catch {}
      webAudioSourceRef.current = null;
      return true;
    }
    if (action === "resume") {
      player.play().catch(() => play(current.name, current.type));
      return true;
    }
    if (action === "restart") {
      player.currentTime = 0;
      player.play().catch(() => play(current.name, current.type));
      return true;
    }
    if (action === "forward" || action === "rewind") {
      const change = action === "forward" ? 10 : -10;
      player.currentTime = Math.max(0, Math.min(player.duration || Infinity, player.currentTime + change));
      return true;
    }
    if (action === "next" || action === "previous") {
      const sameType = library.filter((item) => item.type === current.type);
      if (sameType.length < 2) return false;
      const index = sameType.findIndex((item) => item.url === current.url);
      const direction = action === "next" ? 1 : -1;
      const item = sameType[(index + direction + sameType.length) % sameType.length];
      play(item.name, item.type);
      return true;
    }
    if (action === "fullscreen") {
      if (current.type !== "video" || !videoRef.current?.requestFullscreen) return false;
      videoRef.current.requestFullscreen().catch(() => {});
      return true;
    }
    return false;
  }

  useEffect(() => {
    window.carmindPlay = play;
    window.carmindMediaAction = mediaAction;
    window.carmindUnlock = () => {
      // Resumes a silent audio engine during the driver's tap. It never starts
      // a song; it only permits a later spoken play command on Android Chrome.
      unlockVoicePlayback();
    };
    window.carmindSyncLibrary = (items = []) => {
      const safeItems = items.filter((item) => item?.name && item?.url && /^(audio|video)$/.test(item.type));
      if (safeItems.length) setLibrary((old) => [...old, ...safeItems]);
      return safeItems.length;
    };
    window.carmindPause = () => {
      audioRef.current?.pause();
      videoRef.current?.pause();
      try {
        webAudioSourceRef.current?.stop();
      } catch {}
      webAudioSourceRef.current = null;
    };
    window.carmindVolume = (action) => {
      const players = [audioRef.current, videoRef.current].filter(Boolean);
      const active = players.find((item) => !item.paused) ||
        (current.type === "video" ? videoRef.current : audioRef.current);
      if (!active) return 0;
      let nextVolume = webAudioVolumeRef.current;
      if (action === "mute") active.muted = true;
      if (action === "unmute") {
        active.muted = false;
        if (active.volume === 0) active.volume = 0.5;
      }
      if (action === "up") {
        active.muted = false;
        active.volume = Math.min(1, Math.round((active.volume + 0.1) * 10) / 10);
      }
      if (action === "down")
        active.volume = Math.max(0, Math.round((active.volume - 0.1) * 10) / 10);
      if (action === "mute") nextVolume = 0;
      if (action === "unmute" && nextVolume === 0) nextVolume = 0.5;
      if (action === "up") nextVolume = Math.min(1, Math.round((nextVolume + 0.1) * 10) / 10);
      if (action === "down") nextVolume = Math.max(0, Math.round((nextVolume - 0.1) * 10) / 10);
      webAudioVolumeRef.current = nextVolume;
      if (webAudioGainRef.current) webAudioGainRef.current.gain.value = nextVolume;
      return Math.round(active.volume * 100);
    };
    window.carmindDuck = (shouldDuck) => {
      const audio = audioRef.current;
      const video = videoRef.current;
      if (shouldDuck && !duckedRef.current) {
        duckedRef.current = {
          audio: audio?.volume ?? 1,
          video: video?.volume ?? 1,
          web: webAudioVolumeRef.current,
        };
        if (audio && !audio.paused) audio.volume = Math.max(0.08, audio.volume * 0.25);
        if (video && !video.paused) video.volume = Math.max(0.08, video.volume * 0.25);
        if (webAudioGainRef.current)
          webAudioGainRef.current.gain.value = Math.max(0.08, webAudioVolumeRef.current * 0.25);
      }
      if (!shouldDuck && duckedRef.current) {
        if (audio) audio.volume = duckedRef.current.audio;
        if (video) video.volume = duckedRef.current.video;
        if (webAudioGainRef.current)
          webAudioGainRef.current.gain.value = duckedRef.current.web;
        duckedRef.current = null;
      }
    };
  });

  useEffect(() => () => {
    try {
      webAudioSourceRef.current?.stop();
      audioContextRef.current?.close();
    } catch {}
    delete window.carmindPlay;
    delete window.carmindMediaAction;
    delete window.carmindUnlock;
    delete window.carmindPause;
    delete window.carmindVolume;
    delete window.carmindSyncLibrary;
    delete window.carmindDuck;
  }, [library, current]);

  function importFiles(event) {
    const items = Array.from(event.target.files || []).map((file) => {
      const fileTitle = file.name.replace(/\.[^.]+$/, "");
      const titleParts = fileTitle.split(/\s+-\s+/);
      return {
        name: titleParts.length > 1 ? titleParts.slice(1).join(" - ") : fileTitle,
        artist: titleParts.length > 1 ? titleParts[0] : "Imported from car storage",
        type: file.type.startsWith("video") ? "video" : "audio",
        url: URL.createObjectURL(file),
        moods: /sad|emotional|heartbreak|soul|slow/i.test(file.name)
          ? ["emotional", "sad", "soulful"]
          : /happy|vibrant|dance|party|upbeat|energy/i.test(file.name)
            ? ["vibrant", "energetic", "happy"]
            : /calm|peace|relax|soft/i.test(file.name) ? ["calm", "peaceful"] : [],
      };
    });
    setLibrary((old) => [...old, ...items]);
    if (items[0]) setCurrent(items[0]);
    say(
      `${items.length} media file${items.length === 1 ? "" : "s"} added to Carmind.`,
    );
  }

  const shown = library.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <div className="page">
      <div className="pagehead">
        <div>
          <p className="eyebrow">CARMIND MEDIA</p>
          <h1>Music & Video</h1>
          <p>
            Play the built-in sample or import files from the car’s storage.
          </p>
        </div>
        <label className="primary import-media">
          <Plus /> Import music or video
          <input
            type="file"
            accept="audio/*,video/*"
            multiple
            onChange={importFiles}
          />
        </label>
      </div>
      <section className="now-playing card">
        <div className="media-art">{current.type === "video" ? "▶" : "♪"}</div>
        <div className="track-info">
          <span>NOW PLAYING</span>
          <h2>{current.name}</h2>
          <p>{current.artist}</p>
        </div>
        <video
          ref={videoRef}
          src={current.type === "video" ? current.url : demoVideo.url}
          controls
          playsInline
          muted
          onEnded={() => playNext("video")}
          style={{ display: current.type === "video" ? "block" : "none" }}
        />
        <audio
          id="carmind-audio"
          ref={audioRef}
          src={current.type === "audio" ? current.url : demoTrack.url}
          controls
          onEnded={() => playNext("audio")}
          style={{ display: current.type === "audio" ? "block" : "none" }}
        />
        <div className="media-command-controls">
          <button onClick={() => mediaAction("previous")} aria-label="Previous"><SkipBack /></button>
          <button className="main-media-button" onClick={() => mediaAction("resume")} aria-label="Play"><Play /></button>
          <button onClick={() => mediaAction("pause")} aria-label="Pause"><Pause /></button>
          <button onClick={() => mediaAction("next")} aria-label="Next"><SkipForward /></button>
          <button onClick={() => mediaAction("restart")} aria-label="Restart"><RotateCcw /></button>
          {current.type === "video" && <button onClick={() => mediaAction("fullscreen")} aria-label="Fullscreen"><Maximize2 /></button>}
        </div>
      </section>
      <section className="media-services">
        <button
          onClick={() => window.open("https://music.youtube.com", "_blank")}
        >
          <b>YouTube Music</b>
          <span>Open and search</span>
        </button>
        <button
          onClick={() => window.open("https://open.spotify.com", "_blank")}
        >
          <b>Spotify</b>
          <span>Open and search</span>
        </button>
        <button onClick={() => play("")}>
          <b>Carmind Playlist</b>
          <span>Play inside this app</span>
        </button>
      </section>
      <section className="card media-library">
        <div className="library-head">
          <h3>My car library</h3>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search songs and videos"
          />
        </div>
        {shown.map((item, index) => (
          <button
            key={`${item.name}-${index}`}
            onClick={() => {
              setCurrent(item);
              setTimeout(() => {
                if (item.type === "video") videoRef.current?.play();
                else audioRef.current?.play();
              }, 80);
            }}
          >
            <span className="mini-art">
              {item.type === "video" ? "▶" : "♪"}
            </span>
            <span>
              <b>{item.name}</b>
              <small>{item.artist}</small>
            </span>
            <Play />
          </button>
        ))}
      </section>
    </div>
  );
}

function AccessLocked({ onPayment }) {
  return (
    <div className="page locked-page">
      <section className="card locked-card">
        <span className="lock-icon"><Lock /></span>
        <p className="eyebrow">SUBSCRIPTION REQUIRED</p>
        <h1>Carmind is waiting for renewal</h1>
        <p>Your saved settings remain safe. Renew your subscription to restore voice, navigation, media and connected-car features.</p>
        <button className="primary" onClick={onPayment}><CreditCard /> Open Payment</button>
      </section>
    </div>
  );
}

function TrialBanner({ remainingMs, onPayment }) {
  const totalSeconds = Math.max(0, Math.ceil(remainingMs / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const clock = [hours, minutes, seconds].map((part) => String(part).padStart(2, "0")).join(":");
  return (
    <div className="trial-banner">
      <div><Clock size={17}/><span><b>Free trial active</b><small>Full Carmind access</small></span></div>
      <strong>{clock}</strong>
      <button onClick={onPayment}>View plans</button>
    </div>
  );
}

function localPrice(billing, currency, kind) {
  const configured = billing.internationalPrices?.[currency]?.[kind];
  if (Number.isFinite(Number(configured))) return Number(configured);
  return kind === "monthly" ? billing.monthlyPrice : kind === "yearly" ? billing.yearlyPrice : billing.trainingPackPrice;
}
function money(currency, value, languageCode = "en") {
  try { return new Intl.NumberFormat(languageCode, { style: "currency", currency, maximumFractionDigits: 0 }).format(value); }
  catch { return `${currency} ${Number(value || 0).toLocaleString()}`; }
}

function PaymentPage({ billing, entitlement, isOwner, trialEndsAt, hasAccess, now, profile }) {
  const [selected, setSelected] = useState("monthly");
  const [notice, setNotice] = useState("");
  const remainingMs = Math.max(0, trialEndsAt - now);
  const remainingMinutes = Math.ceil(remainingMs / 60000);
  const customerCurrency = profile.currency || billing.currency;
  const planPrice = localPrice(billing, customerCurrency, selected);
  const status = isOwner
    ? "Owner access — no payment required"
    : hasAccess && now < Number(entitlement.expiresAt || 0)
      ? "Subscription active"
      : hasAccess && remainingMs > 0
        ? `Free trial active — ${Math.floor(remainingMinutes / 60)}h ${remainingMinutes % 60}m remaining`
        : "Payment required";
  async function checkout() {
    if (serverConfigured()) {
      try {
        const result = await serverApi.checkout(selected, customerCurrency, planPrice, profile.email);
        if (result.checkoutUrl) {
          window.open(result.checkoutUrl, "_blank", "noopener,noreferrer");
          setNotice("Secure checkout opened. Carmind will activate only after the payment provider verifies payment.");
          return;
        }
      } catch {}
    }
    if (billing.provider === "Not selected") {
      setNotice("The owner must select and connect a payment provider before checkout can open.");
      return;
    }
    setNotice(`${billing.provider} secure checkout is prepared for ${money(customerCurrency, planPrice, profile.languageCode)}. It will activate after the provider confirms payment.`);
  }
  return (
    <div className="page payment-page">
      <div className="pagehead">
        <div><p className="eyebrow">CARMIND SUBSCRIPTION</p><h1>Payment</h1><p>Choose a plan and keep every Carmind feature available.</p></div>
        <span className={`access-badge ${hasAccess ? "active" : "expired"}`}>{status}</span>
      </div>
      <section className="plan-grid">
        <button className={`plan-card ${selected === "monthly" ? "selected" : ""}`} onClick={() => setSelected("monthly")}>
          <span>MONTHLY</span><b>{money(customerCurrency, localPrice(billing, customerCurrency, "monthly"), profile.languageCode)}</b><small>Renews every month</small>
        </button>
        <button className={`plan-card ${selected === "yearly" ? "selected" : ""}`} onClick={() => setSelected("yearly")}>
          <span>YEARLY</span><b>{money(customerCurrency, localPrice(billing, customerCurrency, "yearly"), profile.languageCode)}</b><small>Renews every year</small>
        </button>
      </section>
      <section className="card checkout-card">
        <CheckCircle2 />
        <div><h3>{selected === "yearly" ? "Yearly" : "Monthly"} Carmind access</h3><p>Voice assistant, navigation, media, saved places and connected-car controls.</p></div>
        <button className="primary" onClick={checkout} disabled={isOwner}>{isOwner ? "Owner access active" : `Pay ${money(customerCurrency, planPrice, profile.languageCode)}`}</button>
      </section>
      <p className="checkout-timer"><Clock /> Secure checkout remains open for {billing.checkoutMinutes} minutes after it starts.</p>
      {notice && <p className="security-note">{notice}</p>}
      <p className="security-note">Payment occurs on the selected provider’s secure page. Carmind receives only a verified payment result and never stores the card number. Recurring renewal can be cancelled through the provider.</p>
    </div>
  );
}

function openConfiguredUrl(url, setNotice, missingMessage) {
  if (!url) return setNotice(missingMessage);
  try {
    const parsed = new URL(url);
    if (!["https:", "http:"].includes(parsed.protocol)) throw new Error();
    window.open(parsed.toString(), "_blank", "noopener,noreferrer");
  } catch {
    setNotice("The owner needs to enter a valid secure link in the Control Panel.");
  }
}

function TrainingStore({ billing, profile }) {
  const [notice, setNotice] = useState("");
  return (
    <div className="page learning-page">
      <div className="pagehead">
        <div><p className="eyebrow">PERSONALISE YOUR ASSISTANT</p><h1>Personal Training Door</h1><p>Unlock the private training board and teach Carmind your own family facts, routines, preferences and personal replies.</p></div>
        <span className="access-badge active">ONE-TIME UNLOCK</span>
      </div>
      <section className="training-product card">
        <div className="pdf-cover"><GraduationCap/><b>CARMIND</b><span>PERSONAL TRAINING</span><small>Your knowledge • Your replies • Your assistant</small></div>
        <div className="product-copy">
          <p className="eyebrow">COMPLETE TRAINING GUIDE</p>
          <h2>Give Carmind your own personal knowledge</h2>
          <p>Carmind’s complete general conversation library is already included free. This optional door unlocks private customer-created training.</p>
          <ul><li>One large copy-and-paste training box</li><li>Ready-made question and answer templates</li><li>Personal family, routine and preference knowledge</li><li>Saved separately from Carmind’s global brain</li></ul>
          <div className="product-price"><span>Personal training unlock</span><b>{money(profile.currency || billing.currency, localPrice(billing, profile.currency || billing.currency, "personal"), profile.languageCode)}</b></div>
          <button className="primary" onClick={() => openConfiguredUrl(billing.trainingPackCheckoutUrl, setNotice, "Personal-training payment is not connected yet. The owner can add its payment link in the Control Panel.")}><CreditCard/> Unlock personal training</button>
          {notice && <p className="security-note">{notice}</p>}
        </div>
      </section>
      <p className="security-note">The door opens only after the connected payment provider confirms purchase. Carmind does not store customer card details.</p>
    </div>
  );
}

function PersonalTrainingLocked({ billing, profile, onStore }) {
  const currency = profile.currency || billing.currency;
  return <div className="page locked-page"><section className="card locked-card"><span className="lock-icon"><GraduationCap/></span><p className="eyebrow">PERSONAL AI TRAINING</p><h1>Your personal training door is locked</h1><p>Carmind’s complete general conversation brain is already working. Unlock this private board to teach Carmind your family facts, routines, preferences and custom replies.</p><div className="product-price"><span>One-time unlock</span><b>{money(currency, localPrice(billing, currency, "personal"), profile.languageCode)}</b></div><button className="primary" onClick={onStore}><CreditCard/> View personal training</button></section></div>;
}

function LearningCenter({ billing }) {
  const [notice, setNotice] = useState("");
  const lessons = ["Install and set up Carmind", "Name and talk to your assistant", "Train Carmind in one box", "Use voice navigation", "Play music and video", "Create and use the Exit PIN"];
  return (
    <div className="page learning-page">
      <div className="pagehead"><div><p className="eyebrow">CARMIND ACADEMY</p><h1>Help & Learning</h1><p>Learn every Carmind feature through clear, step-by-step video lessons.</p></div></div>
      <section className="lesson-grid">
        {lessons.map((lesson, index) => <article className="card lesson-card" key={lesson}><span>{String(index + 1).padStart(2,"0")}</span><div><h3>{lesson}</h3><p>Watch the complete Carmind tutorial on our official YouTube channel.</p></div><BookOpen/></article>)}
      </section>
      <section className="card youtube-cta"><div><p className="eyebrow">VIDEO TUTORIALS</p><h2>Visit the Carmind YouTube channel</h2><p>See installation, voice commands, personal training, media, navigation and troubleshooting demonstrations.</p></div><button className="primary" onClick={() => openConfiguredUrl(billing.youtubeChannelUrl, setNotice, "The Carmind YouTube channel link has not been added yet.")}>Watch tutorials <ExternalLink/></button></section>
      {notice && <p className="security-note">{notice}</p>}
    </div>
  );
}

function ControlPanel({ billing, setBilling, languageTraining, setLanguageTraining, ...props }) {
  const [features, setFeatures] = useState({
    voice: true,
    wake: true,
    navigation: true,
    music: true,
    confirmation: true,
  });
  const [apiSettings, setApiSettings] = useState({
    youtube: "",
    spotifyId: "",
    spotifySecret: "",
    maps: "",
    ai: "",
    paymentPublic: "",
    paymentSecret: "",
    paymentWebhook: "",
  });
  const [apiSaved, setApiSaved] = useState(false);
  const [billingSaved, setBillingSaved] = useState(false);
  return (
    <div className="page">
      <div className="pagehead">
        <div>
          <p className="eyebrow">ADMINISTRATION</p>
          <h1>Control Panel</h1>
          <p>Control Carmind features and train its spoken replies.</p>
        </div>
        <span className="demo">OPEN TEST MODE</span>
      </div>
      <section className="control-grid">
        {Object.entries(features).map(([key, on]) => (
          <button
            className={"feature-toggle " + (on ? "enabled" : "")}
            onClick={() => setFeatures({ ...features, [key]: !on })}
          >
            <span>
              {key === "wake"
                ? "Wake word"
                : key[0].toUpperCase() + key.slice(1)}
            </span>
            <i>{on ? "ON" : "OFF"}</i>
          </button>
        ))}
      </section>
      <Training {...props} />
      <LanguageManager packs={languageTraining} setPacks={setLanguageTraining} />
      <section className="card api-panel">
        <div className="api-heading">
          <div>
            <p className="eyebrow">INTEGRATIONS</p>
            <h3>API connections</h3>
            <p className="muted">
              Prepared for YouTube, Spotify, maps and natural AI replies.
            </p>
          </div>
          <span className="demo">NOT CONNECTED</span>
        </div>
        <div className="api-grid">
          <label>YouTube API key<input type="password" value={apiSettings.youtube} onChange={(e) => setApiSettings({...apiSettings, youtube:e.target.value})} placeholder="Paste YouTube Data API key" /></label>
          <label>Spotify Client ID<input type="password" value={apiSettings.spotifyId} onChange={(e) => setApiSettings({...apiSettings, spotifyId:e.target.value})} placeholder="Paste Spotify Client ID" /></label>
          <label>Spotify Client Secret<input type="password" value={apiSettings.spotifySecret} onChange={(e) => setApiSettings({...apiSettings, spotifySecret:e.target.value})} placeholder="Paste Spotify Client Secret" /></label>
          <label>Map API key<input type="password" value={apiSettings.maps} onChange={(e) => setApiSettings({...apiSettings, maps:e.target.value})} placeholder="Paste map provider key" /></label>
          <label>AI provider API key<input type="password" value={apiSettings.ai} onChange={(e) => setApiSettings({...apiSettings, ai:e.target.value})} placeholder="Paste AI provider key" /></label>
          <label>Payment public key<input type="password" value={apiSettings.paymentPublic} onChange={(e) => setApiSettings({...apiSettings, paymentPublic:e.target.value})} placeholder="Paste provider public key" /></label>
          <label>Payment secret key<input type="password" value={apiSettings.paymentSecret} onChange={(e) => setApiSettings({...apiSettings, paymentSecret:e.target.value})} placeholder="Stored on server in production" /></label>
          <label>Payment webhook secret<input type="password" value={apiSettings.paymentWebhook} onChange={(e) => setApiSettings({...apiSettings, paymentWebhook:e.target.value})} placeholder="Used to verify payment events" /></label>
        </div>
        <div className="api-actions">
          <button className="primary" onClick={() => {
            sessionStorage.setItem("cm-api-test", JSON.stringify(apiSettings));
            setApiSaved(true);
          }}><KeyRound size={18}/> Save API settings</button>
          {apiSaved && <span className="saved-note"><ShieldCheck size={17}/> Saved for this test session</span>}
        </div>
        <p className="security-note">
          Open-demo safety: keys are kept only for this browser session and are erased when it closes. Production keys will be encrypted and stored on the Carmind server.
        </p>
      </section>
      <section className="card api-panel billing-panel">
        <div className="api-heading">
          <div>
            <p className="eyebrow">SUBSCRIPTIONS</p>
            <h3>Customer payments and access</h3>
            <p className="muted">Your owner account stays free. Customer features lock automatically when their subscription expires.</p>
          </div>
          <CreditCard size={28} />
        </div>
        <div className="api-grid">
          <label>Owner email — always free<input type="email" value={billing.ownerEmail} onChange={(e) => setBilling({...billing, ownerEmail:e.target.value})} placeholder="Your owner email" /></label>
          <label>Monthly customer price<input type="number" min="0" value={billing.monthlyPrice} onChange={(e) => setBilling({...billing, monthlyPrice:Number(e.target.value)})} /></label>
          <label>Yearly customer price<input type="number" min="0" value={billing.yearlyPrice} onChange={(e) => setBilling({...billing, yearlyPrice:Number(e.target.value)})} /></label>
          <label>Currency<select value={billing.currency} onChange={(e) => setBilling({...billing, currency:e.target.value})}><option>NGN</option><option>USD</option><option>GBP</option><option>EUR</option></select></label>
          <label>Payment provider<select value={billing.provider} onChange={(e) => setBilling({...billing, provider:e.target.value})}><option>Not selected</option><option>Paystack</option><option>Flutterwave</option><option>Stripe</option><option>Other provider</option></select></label>
          <label>Settlement account name<input value={billing.payoutName} onChange={(e) => setBilling({...billing, payoutName:e.target.value})} placeholder="Business or account name" /></label>
          <label>Settlement bank<input value={billing.payoutBank} onChange={(e) => setBilling({...billing, payoutBank:e.target.value})} placeholder="Bank receiving settlements" /></label>
          <label>Settlement account number<input type="password" inputMode="numeric" value={billing.payoutAccount} onChange={(e) => setBilling({...billing, payoutAccount:e.target.value})} placeholder="Receiving account number" /></label>
          <label>Provider merchant/account ID<input value={billing.merchantReference} onChange={(e) => setBilling({...billing, merchantReference:e.target.value})} placeholder="Merchant reference from provider" /></label>
          <label>Free trial hours<input type="number" min="0" value={billing.trialHours} onChange={(e) => setBilling({...billing, trialHours:Number(e.target.value)})} /></label>
          <label>Payment-window timer (minutes)<input type="number" min="1" value={billing.checkoutMinutes} onChange={(e) => setBilling({...billing, checkoutMinutes:Number(e.target.value)})} /></label>
          <label>Personal-training unlock price<input type="number" min="0" value={billing.trainingPackPrice} onChange={(e) => setBilling({...billing, trainingPackPrice:Number(e.target.value)})} /></label>
          <label>Carmind YouTube channel link<input type="url" value={billing.youtubeChannelUrl} onChange={(e) => setBilling({...billing, youtubeChannelUrl:e.target.value})} placeholder="https://youtube.com/@your-channel" /></label>
          <label>Personal-training payment link<input type="url" value={billing.trainingPackCheckoutUrl} onChange={(e) => setBilling({...billing, trainingPackCheckoutUrl:e.target.value})} placeholder="Secure Paystack, Flutterwave or other checkout link" /></label>
          <label>Late-payment grace days<input type="number" min="0" value={billing.graceDays} onChange={(e) => setBilling({...billing, graceDays:Number(e.target.value)})} /></label>
          <label className="subscription-switch"><input type="checkbox" checked={billing.enforceSubscription} onChange={(e) => setBilling({...billing, enforceSubscription:e.target.checked})} /> Lock customer features after expiry</label>
        </div>
        <div className="international-pricing">
          <div><p className="eyebrow">INTERNATIONAL PRICING</p><h3>Prices customers see in their currency</h3><p className="muted">Set each amount yourself. Carmind does not guess exchange rates.</p></div>
          <div className="price-table">
            {currencyOptions.map((currency) => {
              const prices = billing.internationalPrices?.[currency] || {};
              const changePrice = (kind, value) => setBilling({...billing, internationalPrices: {...billing.internationalPrices, [currency]: {...prices, [kind]: Number(value)}}});
              return <div className="price-row" key={currency}><b>{currency}</b><label>Monthly<input type="number" min="0" value={prices.monthly ?? ""} onChange={(e) => changePrice("monthly", e.target.value)} /></label><label>Yearly<input type="number" min="0" value={prices.yearly ?? ""} onChange={(e) => changePrice("yearly", e.target.value)} /></label><label>Personal training<input type="number" min="0" value={prices.personal ?? ""} onChange={(e) => changePrice("personal", e.target.value)} /></label></div>;
            })}
          </div>
        </div>
        <div className="api-actions">
          <button className="primary" onClick={() => {
            const { payoutName, payoutBank, payoutAccount, merchantReference, ...publicRules } = billing;
            localStorage.setItem("cm-billing", JSON.stringify(publicRules));
            sessionStorage.setItem("cm-payout-test", JSON.stringify({ payoutName, payoutBank, payoutAccount, merchantReference }));
            setBillingSaved(true);
          }}><Save size={18}/> Save subscription settings</button>
          {billingSaved && <span className="saved-note"><ShieldCheck size={17}/> Subscription rules saved</span>}
        </div>
        <div className="billing-summary">
          <div><span>Customer plan</span><b>{billing.currency} {Number(billing.monthlyPrice || 0).toLocaleString()} / month</b></div>
          <div><span>Yearly plan</span><b>{billing.currency} {Number(billing.yearlyPrice || 0).toLocaleString()} / year</b></div>
          <div><span>Payment timer</span><b>{billing.checkoutMinutes} minutes</b></div>
          <div><span>Personal training</span><b>{billing.currency} {Number(billing.trainingPackPrice || 0).toLocaleString()}</b></div>
          <div><span>Expired account</span><b>{billing.enforceSubscription ? "Features locked" : "Allowed"}</b></div>
        </div>
        <p className="security-note">Open-test safety: payout details remain only for this browser session. Production payout and API credentials will be encrypted on the server. Customer card numbers must never be stored inside Carmind.</p>
      </section>
      <section className="card capability-panel">
        <h3>Android car controls</h3>
        <div className="capability-grid">
          <span><Volume2/> Music ducking during directions <b>WORKING</b></span>
          <span><Wifi/> Wi-Fi voice controls <b>APK READY</b></span>
          <span><Bluetooth/> Bluetooth scan and connect <b>APK READY</b></span>
          <span><Navigation/> Google navigation guidance <b>API REQUIRED</b></span>
        </div>
      </section>
      <section className="admin-grid">
        <div className="card">
          <h3>Command history</h3>
          <p className="muted">
            Voice commands and actions will appear here during testing.
          </p>
        </div>
        <div className="card">
          <h3>Error log</h3>
          <p className="muted">No errors recorded in this browser.</p>
        </div>
      </section>
    </div>
  );
}
function LanguageManager({ packs, setPacks }) {
  const [active, setActive] = useState("ig");
  const [saved, setSaved] = useState(false);
  const language = supportedLanguages.find(({code}) => baseLanguage(code) === active) || supportedLanguages[0];
  const [board, setBoard] = useState(() => trainingToBoard(packs[active] || []));
  useEffect(() => setBoard(trainingToBoard(packs[active] || [])), [active, packs]);
  function save() {
    const entries = boardToTraining(board);
    if (!entries.length) return alert("Add entries using Question: ... and Answer: ...");
    setPacks({...packs, [active]: entries});
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  }
  return (
    <section className="card language-manager" data-no-translate>
      <div className="api-heading">
        <div><p className="eyebrow">LANGUAGE BRAIN</p><h3>Language boxes</h3><p className="muted">Each language keeps its own interface, commands and spoken-response training.</p></div>
        <span className="pill">{supportedLanguages.length} LANGUAGES</span>
      </div>
      <div className="language-tabs">
        {supportedLanguages.map((item) => {
          const code = baseLanguage(item.code);
          return <button type="button" key={item.code} className={active === code ? "active" : ""} onClick={() => setActive(code)}>{item.name}<small>{(packs[code] || []).length} replies</small></button>;
        })}
      </div>
      <div className="language-editor-head"><div><b>{language.name} brain</b><span>{language.code} · interface, listening and speaking</span></div><span className={(packs[active] || []).length ? "ready-state" : "empty-state"}>{(packs[active] || []).length ? "ACTIVE" : "SERVER TRANSLATION READY"}</span></div>
      <textarea className="language-board" value={board} onChange={(e) => setBoard(e.target.value)} placeholder={`Question: Greeting in ${language.name}\nAnswer: Spoken reply in ${language.name}`} />
      <div className="api-actions"><button type="button" className="primary" onClick={save}><Save size={18}/> Save {language.name} language</button>{saved && <span className="saved-note"><ShieldCheck size={17}/> Language implanted</span>}</div>
      <p className="security-note">Carmind checks this language first, then uses its general brain. Interface text, listening and speaking follow the customer’s selected language.</p>
    </section>
  );
}

function Drive({ route, startRoute, profile, playing, setPlaying, say, onBack }) {
  return (
    <div className="page drive-grid">
      <section className="map-card">
        <div className="map-top">
          <button className="drive-back" onClick={onBack} aria-label="Go back"><ArrowLeft /> Back</button>
          <div>
            <strong>
              {route ? "Navigation active" : "Where are we going?"}
            </strong>
            <span>
              {route ? route.name : "Choose a saved place or use your voice"}
            </span>
          </div>
          {route && (
            <div className="eta">
              <b>{route.eta}</b>
              <span>{route.distance}</span>
            </div>
          )}
        </div>
        <div className="map">
          <svg viewBox="0 0 800 480" preserveAspectRatio="none">
            <path
              className="minor"
              d="M0 90L800 280M120 0L380 480M700 0L450 480M0 400L800 100M0 230L800 400"
            />
            <path
              className="road"
              d="M-20 430 C130 350,170 390,270 280 S440 170,520 210 S650 170,820 60"
            />
            <path
              className="route"
              d="M60 410 C150 350,190 380,270 280 S440 170,520 210 S650 170,750 100"
            />
            <circle cx="60" cy="410" r="12" className="dot" />
            <path
              className="pin"
              d="M750 70c-22 0-40 18-40 40 0 31 40 68 40 68s40-37 40-68c0-22-18-40-40-40zm0 55a15 15 0 110-30 15 15 0 010 30z"
            />
          </svg>
          <div className="street s1">Lekki–Epe Expressway</div>
          <div className="street s2">Third Mainland Bridge</div>
          <div className="car-dot">
            <Navigation />
          </div>
          {route && (
            <div className="turn">
              <Navigation />
              <div>
                <b>Turn right in 300 m</b>
                <span>onto Ozumba Mbadiwe Ave</span>
              </div>
            </div>
          )}
        </div>
        <div className="places">
          <button onClick={() => startRoute("home")}>
            <Home />
            Home<span>{profile.home}</span>
          </button>
          <button onClick={() => startRoute("office")}>
            <Briefcase />
            Office<span>{profile.office}</span>
          </button>
          <button onClick={() => startRoute("station")}>
            <Fuel />
            Fuel<span>Nearest station</span>
          </button>
        </div>
      </section>
      <aside className="rightcol">
        <section className="card journey">
          <p className="eyebrow">JOURNEY OVERVIEW</p>
          <div className="statrow">
            <div>
              <span>Distance</span>
              <b>{route ? route.distance : "0 km"}</b>
            </div>
            <div>
              <span>Arrival</span>
              <b>{route ? "12:44" : "—"}</b>
            </div>
          </div>
          <div className="safety">
            <ShieldCheck />
            <div>
              <b>Safe driving mode</b>
              <span>Voice control is ready</span>
            </div>
          </div>
        </section>
        <section className="card media">
          <div className="album">♪</div>
          <div className="song">
            <span>Driving playlist</span>
            <b>{playing ? "Last Last · Burna Boy" : "Nothing playing"}</b>
          </div>
          <button
            onClick={() => {
              setPlaying(!playing);
              say(playing ? "Music paused." : "Playing your driving playlist.");
            }}
          >
            {playing ? <Pause /> : <Play />}
          </button>
        </section>
      </aside>
    </div>
  );
}
function Assistant({
  profile,
  listening,
  toggleMic,
  voiceState,
  heard,
  reply,
  welcome,
  startMercedes,
  command,
}) {
  const [input, setInput] = useState("");
  return (
    <div className="page assistant-page">
      <section className="voice-card">
        <div className={`orb ${voiceState}`}>
          <div />
          <div />
          <Volume2 />
        </div>
        <p className="eyebrow">{voiceState.toUpperCase()}</p>
        <h1>{profile.assistant || "Mercedes"} is ready</h1>
        <p className="muted">
          Tap once to hear the welcome and allow microphone access
        </p>
        {!listening ? (
          <button className="primary start-mercedes" onClick={startMercedes}>
            <Mic />
            Start {profile.assistant || "Mercedes"}
          </button>
        ) : (
          <button className="danger" onClick={toggleMic}>
            <MicOff />
            Stop listening
          </button>
        )}
        <button className="textbtn" onClick={welcome}>
          Hear welcome again
        </button>
      </section>
      <section className="conversation card">
        <h3>Live conversation</h3>
        <div className="bubble user" data-no-translate>
          <span>You said</span>
          {heard || "Your words will appear here…"}
        </div>
        <div className="bubble ai" data-no-translate>
          <span>{profile.assistant || "Mercedes"}</span>
          {reply}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (input) {
              command(input);
              setInput("");
            }
          }}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a command to test…"
          />
          <button>
            <ChevronRight />
          </button>
        </form>
        <div className="chips">
          {[
            "Hello Mercedes",
            "How are you today?",
            "Drive me home",
            "Play Carmind Demo Beat",
            "Increase volume",
          ].map((x) => (
            <button type="button" onClick={() => command(x, "en")}>
              {x}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
function Training({ trained, setTrained, draft, setDraft, parseTraining, customer = false }) {
  return (
    <div className="page">
      <div className="pagehead">
        <div>
          <p className="eyebrow">{customer ? "YOUR PERSONAL KNOWLEDGE" : "OWNER TRAINING"}</p>
          <h1>{customer ? "Train My Carmind" : "Training Board"}</h1>
          <p>{customer ? "Add personal conversations without removing Carmind’s built-in intelligence." : "Teach your assistant natural replies in one simple box."}</p>
        </div>
        <span className="pill">{trained.length} responses</span>
      </div>
      <div className="train-grid">
        <section className="card editor">
          <label>
            Question and answer board
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={
                "Question: How are you?\nAnswer: I’m doing well, {{user_name}}. How are you?\n\nDrive me to church => Starting navigation to your saved church."
              }
            />
          </label>
          <div className="hint">
            <b>Accepted formats</b>
            <code>Question: ... Answer: ...</code>
            <code>Question =&gt; Answer</code>
          </div>
          <button className="primary" onClick={parseTraining}>
            <Plus />
            Save training
          </button>
        </section>
        <section className="card saved">
          <h3>Saved responses</h3>
          {trained.map((x, i) => (
            <div className="qa">
              <div>
                <span>QUESTION</span>
                <b>{x.q}</b>
                <p>{x.a}</p>
              </div>
              <button
                onClick={() => setTrained(trained.filter((_, j) => i !== j))}
              >
                <Trash2 />
              </button>
            </div>
          ))}
        </section>
      </div>
      {customer && <p className="security-note">Your personal training is used before Carmind’s connected AI response. Built-in greetings, driving commands, media controls and safety protections remain available.</p>}
    </div>
  );
}
function Vehicle({ say, startRoute }) {
  return (
    <div className="page">
      <div className="pagehead">
        <div>
          <h1>Vehicle Health</h1>
          <p>OBD-II monitoring preview</p>
        </div>
        <span className="demo">DEMO DATA</span>
      </div>
      <div className="health-grid">
        <Health
          icon={Fuel}
          name="Fuel level"
          value="18%"
          note="Low · 92 km range"
          tone="amber"
        />
        <Health
          icon={Thermometer}
          name="Coolant"
          value="91°C"
          note="Normal temperature"
        />
        <Health
          icon={Gauge}
          name="Battery"
          value="13.8 V"
          note="Charging normally"
        />
        <Health icon={Car} name="Engine" value="Good" note="No fault codes" />
      </div>
      <section className="card alert">
        <AlertTriangle />
        <div>
          <b>Fuel level is getting low</b>
          <p>
            This is simulated demo data. Connect a compatible OBD-II adapter for
            real vehicle readings.
          </p>
        </div>
        <button onClick={() => startRoute("station")}>Find fuel station</button>
      </section>
      <section className="card obd">
        <div>
          <Radio />
          <div>
            <h3>OBD-II connection</h3>
            <p>No vehicle adapter connected</p>
          </div>
        </div>
        <button
          onClick={() => say("Searching for a compatible OBD two adapter.")}
          className="primary"
        >
          Search for adapter
        </button>
      </section>
    </div>
  );
}
function Health({ icon: I, name, value, note, tone = "" }) {
  return (
    <section className={"card health " + tone}>
      <I />
      <span>{name}</span>
      <b>{value}</b>
      <p>{note}</p>
    </section>
  );
}
function SettingsPage({ profile, setProfile, owner, setOwner, say }) {
  const [p, setP] = useState(profile),
    [o, setO] = useState(owner),
    [saved, setSaved] = useState(false);
  function save() {
    setProfile(p);
    localStorage.setItem("cm-owner", JSON.stringify(o));
    setOwner(o);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
    say("Your settings have been saved.");
  }
  return (
    <div className="page">
      <div className="pagehead">
        <div>
          <h1>Owner Settings</h1>
          <p>Personalize your assistant and secure your account.</p>
        </div>
        {saved && <span className="pill">Saved successfully</span>}
      </div>
      <div className="settings-grid">
        <section className="card formcard">
          <h3>
            <User />
            Personal profile
          </h3>
          <label>
            What should the assistant call you?
            <input
              value={p.name}
              onChange={(e) => setP({ ...p, name: e.target.value })}
            />
          </label>
          <label>
            Assistant wake name
            <input
              value={p.assistant}
              onChange={(e) => setP({ ...p, assistant: e.target.value })}
            />
          </label>
          <label>
            Home address
            <input
              value={p.home}
              onChange={(e) => setP({ ...p, home: e.target.value })}
            />
          </label>
          <label>
            Office address
            <input
              value={p.office}
              onChange={(e) => setP({ ...p, office: e.target.value })}
            />
          </label>
          <label>
            Welcome message
            <textarea
              value={p.welcome}
              onChange={(e) => setP({ ...p, welcome: e.target.value })}
            />
          </label>
        </section>
        <section className="card formcard">
          <h3>
            <KeyRound />
            Owner login
          </h3>
          <label>
            Login email
            <input
              type="email"
              value={o.email}
              onChange={(e) => setO({ ...o, email: e.target.value })}
            />
          </label>
          <label>
            New app password
            <input
              type="password"
              value={o.password}
              onChange={(e) => setO({ ...o, password: e.target.value })}
            />
          </label>
          <div className="notice">
            <ShieldCheck />
            <p>
              This demo stores settings on this device. Production will use
              encrypted server authentication.
            </p>
          </div>
          <button className="primary" onClick={save}>
            <Save />
            Save all settings
          </button>
        </section>
      </div>
    </div>
  );
}
createRoot(document.getElementById("root")).render(<App />);
