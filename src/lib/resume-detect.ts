// Client-side resume text extraction + country / first-name detection.
import { extractText, getDocumentProxy } from "unpdf";

const COUNTRIES = [
  "United Kingdom", "United States", "India", "Canada", "Australia", "Germany",
  "France", "Ireland", "Netherlands", "Singapore", "United Arab Emirates",
  "New Zealand", "South Africa", "Spain", "Italy", "Portugal", "Sweden",
  "Norway", "Denmark", "Finland", "Switzerland", "Belgium", "Austria",
  "Poland", "Japan", "China", "Hong Kong", "Malaysia", "Philippines",
  "Indonesia", "Thailand", "Vietnam", "Brazil", "Mexico", "Argentina",
  "Chile", "Colombia", "Nigeria", "Kenya", "Pakistan", "Bangladesh",
  "Sri Lanka", "Nepal", "Qatar", "Saudi Arabia", "Israel", "Turkey",
];

export interface ResumeDetection {
  firstName: string | null;
  country: string | null;
  text: string;
}

export async function detectFromResume(file: File): Promise<ResumeDetection> {
  try {
    const buffer = new Uint8Array(await file.arrayBuffer());
    const pdf = await getDocumentProxy(buffer);
    const { text } = await extractText(pdf, { mergePages: true });
    const cleaned = text.replace(/\r/g, "");
    const lines = cleaned
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    let country: string | null = null;
    for (const c of COUNTRIES) {
      if (new RegExp(`\\b${c.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(cleaned)) {
        country = c;
        break;
      }
    }
    // UK postcode pattern as a fallback signal
    if (!country && /\b[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}\b/i.test(cleaned)) {
      country = "United Kingdom";
    }

    let firstName: string | null = null;
    for (const line of lines.slice(0, 5)) {
      const token = line.match(/^[A-Za-z][A-Za-z'’.-]{1,30}/)?.[0];
      if (token && !/curriculum|resume|vitae|page/i.test(token)) {
        firstName = token.charAt(0).toUpperCase() + token.slice(1);
        break;
      }
    }
    return { firstName, country, text: cleaned };
  } catch {
    return { firstName: null, country: null, text: "" };
  }
}
