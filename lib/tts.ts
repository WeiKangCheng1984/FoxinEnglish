let current: SpeechSynthesisUtterance | null = null;

function pickVoice() {
  const voices = window.speechSynthesis.getVoices();
  return (
    voices.find((v) => v.lang.startsWith("en-US") && /Google|Natural|Samantha|Jenny/i.test(v.name)) ||
    voices.find((v) => v.lang.startsWith("en-US")) ||
    voices.find((v) => v.lang.startsWith("en")) ||
    null
  );
}

export function speakEnglish(text: string, onEnd?: () => void) {
  if (!text || typeof window === "undefined" || !window.speechSynthesis) {
    onEnd?.();
    return;
  }
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text.replace(/\[[^\]]+\]/g, "blank"));
  utter.lang = "en-US";
  utter.rate = 0.92;
  const voice = pickVoice();
  if (voice) utter.voice = voice;
  utter.onend = () => {
    current = null;
    onEnd?.();
  };
  utter.onerror = () => {
    current = null;
    onEnd?.();
  };
  current = utter;
  window.speechSynthesis.speak(utter);
}

export function stopSpeaking() {
  if (typeof window === "undefined") return;
  window.speechSynthesis.cancel();
  current = null;
}

export function isSpeaking() {
  return Boolean(current);
}
