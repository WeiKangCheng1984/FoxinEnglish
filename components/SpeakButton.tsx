"use client";

import { useEffect, useState } from "react";
import { speakEnglish, stopSpeaking } from "@/lib/tts";

export function SpeakButton({ text, label = "發音" }: { text: string; label?: string }) {
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const load = () => window.speechSynthesis.getVoices();
    load();
    window.speechSynthesis.onvoiceschanged = load;
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  function toggle() {
    if (!text.trim()) return;
    if (playing) {
      stopSpeaking();
      setPlaying(false);
      return;
    }
    setPlaying(true);
    speakEnglish(text, () => setPlaying(false));
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line bg-sand text-copper transition hover:border-copper hover:bg-copper hover:text-white"
    >
      {playing ? (
        <span className="block h-2.5 w-2.5 rounded-sm bg-current" />
      ) : (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
          <path d="M4 9v6h3l5 4V5L7 9H4zm12.5 3a4.5 4.5 0 0 0-2.5-4.03v8.06A4.5 4.5 0 0 0 16.5 12zM14 3.23v2.06a7.5 7.5 0 0 1 0 13.42v2.06a9.5 9.5 0 0 0 0-17.54z" />
        </svg>
      )}
    </button>
  );
}
