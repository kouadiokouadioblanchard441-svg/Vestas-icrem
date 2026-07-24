import { Globe } from "lucide-react";
import { useState } from "react";
import { LANGUAGES, useI18n, type Lang } from "@/lib/i18n";

interface LanguagePickerProps {
  /** "left" → globe button on the left side, "right" → on the right side */
  align?: "left" | "right";
}

export function LanguagePicker({ align = "right" }: LanguagePickerProps) {
  const { lang, setLang } = useI18n();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Globe trigger button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Changer de langue"
        style={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.18)",
          border: "1.5px solid rgba(255,255,255,0.4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
          flexShrink: 0,
        }}
      >
        <Globe size={20} color="white" strokeWidth={1.8} />
      </button>

      {open && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-40"
            style={{ background: "rgba(0,0,0,0.50)" }}
            onClick={() => setOpen(false)}
          />

          {/* Bottom sheet — exact same style as country selector */}
          <div
            className="fixed bottom-0 inset-x-0 z-50 bg-white flex flex-col"
            style={{
              borderRadius: "20px 20px 0 0",
              boxShadow: "0 -4px 24px rgba(0,0,0,0.12)",
            }}
          >
            {/* Top padding */}
            <div style={{ height: 20 }} />

            {/* Language rows */}
            {LANGUAGES.map((lng, index) => {
              const isSelected = lng.code === lang;
              return (
                <button
                  key={lng.code}
                  type="button"
                  onClick={() => { setLang(lng.code as Lang); setOpen(false); }}
                  className="w-full flex items-center justify-between px-4"
                  style={{
                    height: 56,
                    borderBottom:
                      index < LANGUAGES.length - 1
                        ? "1px dashed #BFDBFE"
                        : "none",
                    background: "transparent",
                  }}
                >
                  <span
                    style={{
                      fontSize: 15,
                      fontWeight: 500,
                      letterSpacing: "0.04em",
                      color: isSelected ? "#E8A020" : "#1a1a1a",
                    }}
                  >
                    {lng.flag}&nbsp;&nbsp;{lng.nativeName}
                  </span>

                  {isSelected && (
                    <span
                      className="flex items-center justify-center shrink-0"
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        background: "#E8A020",
                      }}
                    >
                      <svg width="13" height="10" viewBox="0 0 13 10" fill="none">
                        <path
                          d="M1.5 5L5 8.5L11.5 1.5"
                          stroke="white"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  )}
                </button>
              );
            })}

            {/* Bottom safe area */}
            <div style={{ height: 24 }} />
          </div>
        </>
      )}
    </>
  );
}
