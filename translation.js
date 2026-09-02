const translators = new Map();
const memoryCache = new Map();
import { localInterfaceText } from "./languagePacks.js";
import { serverApi, serverConfigured } from "./serverApi.js";

export const baseLanguage = (code = "en") => code.toLowerCase().split("-")[0];

function translatorApi() {
  return globalThis.Translator;
}

async function getTranslator(sourceCode, targetCode) {
  const sourceLanguage = baseLanguage(sourceCode);
  const targetLanguage = baseLanguage(targetCode);
  if (sourceLanguage === targetLanguage) return null;
  const key = `${sourceLanguage}:${targetLanguage}`;
  if (translators.has(key)) return translators.get(key);
  const API = translatorApi();
  if (!API?.create) throw new Error("translator-unavailable");
  const availability = API.availability ? await API.availability({ sourceLanguage, targetLanguage }) : "available";
  if (availability === "unavailable") throw new Error("language-pair-unavailable");
  const translator = await API.create({ sourceLanguage, targetLanguage });
  translators.set(key, translator);
  return translator;
}

export async function translateBetween(text, sourceCode = "en", targetCode = "en") {
  if (!text || baseLanguage(sourceCode) === baseLanguage(targetCode)) return text;
  const key = `${baseLanguage(sourceCode)}:${baseLanguage(targetCode)}:${text}`;
  if (memoryCache.has(key)) return memoryCache.get(key);
  let translated;
  try {
    const translator = await getTranslator(sourceCode, targetCode);
    translated = await translator.translate(text);
  } catch (error) {
    if (!serverConfigured()) throw error;
    const result = await serverApi.translate(text, sourceCode, targetCode);
    translated = result.translation;
  }
  memoryCache.set(key, translated);
  return translated;
}

export async function translateAnswer(text, targetCode) {
  try { return await translateBetween(text, "en", targetCode); }
  catch { return text; }
}

const originalText = new WeakMap();
const originalAttributes = new WeakMap();
let pageRun = 0;

const translatedAttributes = ["placeholder", "title", "aria-label"];

function rememberAttributes(element) {
  if (!originalAttributes.has(element)) {
    const values = {};
    for (const name of translatedAttributes) if (element.hasAttribute(name)) values[name] = element.getAttribute(name);
    originalAttributes.set(element, values);
  }
  return originalAttributes.get(element);
}

export async function translateVisiblePage(targetCode = "en") {
  const run = ++pageRun;
  document.documentElement.lang = targetCode;
  document.documentElement.dir = ["ar", "he", "fa", "ur"].includes(baseLanguage(targetCode)) ? "rtl" : "ltr";
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) {
    const node = walker.currentNode;
    const element = node.parentElement;
    if (!element || element.closest("script,style,noscript,[data-no-translate]") || /^(INPUT|TEXTAREA)$/.test(element.tagName)) continue;
    const value = node.nodeValue?.trim();
    if (!value || !/[A-Za-z]/.test(value) || value === "Carmind AI") continue;
    if (!originalText.has(node)) originalText.set(node, node.nodeValue);
    nodes.push(node);
  }
  const elements = [...document.body.querySelectorAll("[placeholder],[title],[aria-label]")]
    .filter((element) => !element.closest("[data-no-translate]"));
  await Promise.all([...nodes.map(async (node) => {
    const source = originalText.get(node);
    if (baseLanguage(targetCode) === "en") { node.nodeValue = source; return; }
    const owned = localInterfaceText(source.trim(), targetCode);
    if (owned) {
      if (run === pageRun && node.isConnected) node.nodeValue = source.replace(source.trim(), owned);
      return;
    }
    try {
      const translated = await translateBetween(source.trim(), "en", targetCode);
      if (run === pageRun && node.isConnected) node.nodeValue = source.replace(source.trim(), translated);
    } catch {}
  }), ...elements.map(async (element) => {
    const originals = rememberAttributes(element);
    for (const [name, source] of Object.entries(originals)) {
      if (!source) continue;
      if (baseLanguage(targetCode) === "en") { element.setAttribute(name, source); continue; }
      const owned = localInterfaceText(source.trim(), targetCode);
      if (owned) { element.setAttribute(name, owned); continue; }
      try {
        const translated = await translateBetween(source, "en", targetCode);
        if (run === pageRun && element.isConnected) element.setAttribute(name, translated);
      } catch {}
    }
  })]);
}

let observer;
let observerTimer;
export function watchPageLanguage(getLanguageCode) {
  observer?.disconnect();
  observer = new MutationObserver((mutations) => {
    if (!mutations.some((mutation) => mutation.addedNodes.length || mutation.type === "childList")) return;
    clearTimeout(observerTimer);
    observerTimer = setTimeout(() => translateVisiblePage(getLanguageCode()), 90);
  });
  observer.observe(document.body, { childList: true, subtree: true });
  return () => { observer?.disconnect(); clearTimeout(observerTimer); };
}

export async function languageAvailability(targetCode) {
  if (baseLanguage(targetCode) === "en") return "available";
  const API = translatorApi();
  if (!API?.availability) return "browser-unavailable";
  try { return await API.availability({ sourceLanguage: "en", targetLanguage: baseLanguage(targetCode) }); }
  catch { return "unavailable"; }
}
