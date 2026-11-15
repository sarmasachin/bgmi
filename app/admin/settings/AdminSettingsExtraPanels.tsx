"use client";

import Link from "next/link";
import {
  countPhoneNamesInInput,
  dedupePhoneNamesPreserveOrder,
  expandCalculatorPhoneModelStrings,
} from "@/src/lib/calculatorPhoneModelsInput";
import { useAdminFlash } from "@/src/components/admin/AdminToast";

type FaqItem = { id: string; question: string; answer: string };

type Props = {
  faqItems: FaqItem[];
  setFaqItems: React.Dispatch<React.SetStateAction<FaqItem[]>>;
  phoneModelsText: string;
  setPhoneModelsText: React.Dispatch<React.SetStateAction<string>>;
};

function newFaqId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `faq-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function AdminSettingsExtraPanels({
  faqItems,
  setFaqItems,
  phoneModelsText,
  setPhoneModelsText,
}: Props) {
  const setFaqMessage = useAdminFlash();
  const setPhoneModelsMessage = useAdminFlash();

  async function saveFaq() {
    setFaqMessage("");
    try {
      const res = await fetch("/api/admin/faq", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: faqItems }),
      });
      const body = (await res.json().catch(() => ({}))) as { error?: string; savedCount?: number };
      if (!res.ok) {
        setFaqMessage(body.error?.trim() || `Save failed (${res.status}).`);
        return;
      }
      setFaqMessage(`Saved ${body.savedCount ?? 0} FAQ item(s).`);
      const reload = await fetch("/api/admin/faq", { cache: "no-store", credentials: "include" });
      if (reload.ok) {
        const faq = (await reload.json()) as {
          effectiveItems?: FaqItem[];
          storedItems?: FaqItem[] | null;
        };
        const rawList =
          faq.storedItems !== null && faq.storedItems !== undefined
            ? faq.storedItems
            : faq.effectiveItems;
        if (Array.isArray(rawList)) {
          setFaqItems(
            rawList.map((row, i) => ({
              id: row.id?.trim() || `faq-load-${i}`,
              question: row.question ?? "",
              answer: row.answer ?? "",
            })),
          );
        }
      }
    } catch {
      setFaqMessage("Network error. Please retry.");
    }
  }

  async function savePhoneModels() {
    const expanded = expandCalculatorPhoneModelStrings([phoneModelsText]);
    const unique = dedupePhoneNamesPreserveOrder(expanded);
    const removedDuplicates = Math.max(0, expanded.length - unique.length);
    setPhoneModelsText(unique.join(", "));

    try {
      const res = await fetch("/api/admin/calculator-phone-models", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: unique.join(", ") }),
      });
      const body = (await res.json().catch(() => ({}))) as {
        error?: string;
        savedCount?: number;
        removedDuplicates?: number;
        models?: string[];
      };
      if (!res.ok) {
        setPhoneModelsMessage(
          body.error?.trim() ||
            (res.status === 503
              ? "Could not save phone models (database busy). Wait a few seconds and try again."
              : `Save failed (${res.status}).`),
        );
        return;
      }

      const savedModels = Array.isArray(body.models) ? body.models : unique;
      setPhoneModelsText(savedModels.join(", "));
      const removed = body.removedDuplicates ?? removedDuplicates;
      if (savedModels.length === 0) {
        setPhoneModelsMessage(
          "Custom list cleared. Calculator will use built-in default names until you save a new list.",
        );
      } else if (removed > 0) {
        setPhoneModelsMessage(
          `Saved ${body.savedCount ?? savedModels.length} phone name(s). Removed ${removed} duplicate${removed === 1 ? "" : "s"}.`,
        );
      } else {
        setPhoneModelsMessage(`Saved ${body.savedCount ?? savedModels.length} phone name(s).`);
      }
    } catch {
      setPhoneModelsMessage("Network error. Please retry.");
    }
  }

  return (
    <>
      <h2 style={{ marginTop: 32, marginBottom: 12 }}>Home page — FAQ</h2>
      <p style={{ marginBottom: 12, opacity: 0.9 }}>
        Per-game FAQs (BGMI, PUBG, Free Fire, Free Fire Max) ab yahan se move ho chuke hain:{" "}
        <Link href="/admin/game-faqs" style={{ color: "var(--primary)" }}>
          Game FAQs
        </Link>
        . Long articles:{" "}
        <Link href="/admin/game-articles" style={{ color: "var(--primary)" }}>
          Game Articles
        </Link>
        .
      </p>
      <p style={{ marginBottom: 12, opacity: 0.75, fontSize: 13 }}>
        Neeche wala editor ab bhi BGMI FAQ save karta hai (legacy). Prefer Game FAQs for all games.
      </p>
      <div className="admin-faq-editor">
        {faqItems.map((item, index) => (
          <div
            key={item.id}
            style={{
              marginBottom: 20,
              paddingBottom: 16,
              borderBottom: "1px solid rgba(255,255,255,0.12)",
            }}
          >
            <div className="form-group">
              <label htmlFor={`faq-q-${item.id}`}>Question</label>
              <textarea
                id={`faq-q-${item.id}`}
                value={item.question}
                onChange={(e) =>
                  setFaqItems((prev) =>
                    prev.map((entry, j) =>
                      j === index ? { ...entry, question: e.target.value } : entry,
                    ),
                  )
                }
                rows={2}
                maxLength={500}
                style={{ width: "100%", fontFamily: "inherit" }}
              />
            </div>
            <div className="form-group">
              <label htmlFor={`faq-a-${item.id}`}>Answer</label>
              <textarea
                id={`faq-a-${item.id}`}
                value={item.answer}
                onChange={(e) =>
                  setFaqItems((prev) =>
                    prev.map((entry, j) =>
                      j === index ? { ...entry, answer: e.target.value } : entry,
                    ),
                  )
                }
                rows={5}
                maxLength={4000}
                style={{ width: "100%", fontFamily: "inherit" }}
              />
            </div>
            <button
              type="button"
              className="btn-reset"
              onClick={() => setFaqItems((prev) => prev.filter((_, j) => j !== index))}
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          className="btn-reset"
          onClick={() =>
            setFaqItems((prev) => [...prev, { id: newFaqId(), question: "", answer: "" }])
          }
        >
          Add FAQ
        </button>
      </div>
      <button className="btn-calc" type="button" onClick={saveFaq} style={{ marginTop: 16 }}>
        Save FAQ
      </button>

      <h2 style={{ marginTop: 32, marginBottom: 12 }}>Calculator phone names</h2>
      <div className="form-group">
        <label htmlFor="calculatorPhoneModels">
          Search suggestions: write names separated by commas (e.g. Motorola Edge 40, Samsung S24, Pixel
          8). New lines / tabs also work. Duplicates are removed on save. Up to 2000 names. Leave empty
          and save to use built-in defaults again.
        </label>
        <textarea
          id="calculatorPhoneModels"
          value={phoneModelsText}
          onChange={(e) => setPhoneModelsText(e.target.value)}
          rows={14}
          style={{ width: "100%", fontFamily: "inherit", minHeight: 200 }}
          spellCheck={false}
        />
        <p style={{ marginTop: 8, color: "#94a3b8", fontSize: 13 }}>
          Names in box right now:{" "}
          <strong style={{ color: "#e6edf3" }}>{countPhoneNamesInInput(phoneModelsText)}</strong>
          {" "}— after save, homepage search uses this exact list (Samsung, Motorola, etc.).
        </p>
      </div>
      <button className="btn-calc" type="button" onClick={savePhoneModels}>
        Save phone list
      </button>
    </>
  );
}
