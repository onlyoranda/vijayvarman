import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Tone = "professional" | "conversational";

const ToneContext = createContext<{ tone: Tone; setTone: (t: Tone) => void }>({
  tone: "professional",
  setTone: () => {},
});

export function ToneProvider({ children }: { children: ReactNode }) {
  const [tone, setToneState] = useState<Tone>("professional");

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("portfolio-tone");
      if (saved === "conversational") setToneState("conversational");
    } catch {
      /* storage unavailable */
    }
  }, []);

  const setTone = (t: Tone) => {
    setToneState(t);
    try {
      window.localStorage.setItem("portfolio-tone", t);
    } catch {
      /* storage unavailable */
    }
  };

  return <ToneContext.Provider value={{ tone, setTone }}>{children}</ToneContext.Provider>;
}

export function useTone() {
  return useContext(ToneContext);
}
