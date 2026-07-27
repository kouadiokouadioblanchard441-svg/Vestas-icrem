import { ChevronLeft, ShoppingBag, Users, Sparkles, Gift, Infinity } from "lucide-react";
import { useI18n } from "@/lib/i18n";

interface WheelRulesModalProps {
  open: boolean;
  onClose: () => void;
}

function RuleCard({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <div
      className="flex items-start gap-3 rounded-2xl px-4 py-3"
      style={{ background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.15)" }}
    >
      <span className="mt-0.5 shrink-0 text-lg">{icon}</span>
      <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.92)" }}>{text}</p>
    </div>
  );
}

function Section({
  icon,
  title,
  accentColor,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  accentColor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-5">
      <div className="flex items-center gap-2 mb-3">
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center"
          style={{ background: accentColor }}
        >
          {icon}
        </div>
        <h2 className="font-extrabold text-white text-base tracking-wide">{title}</h2>
      </div>
      <div className="space-y-2 pl-1">{children}</div>
    </div>
  );
}

export default function WheelRulesModal({ open, onClose }: WheelRulesModalProps) {
  const { t } = useI18n();

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col overflow-hidden"
      style={{
        background:
          "linear-gradient(160deg, #0d2460 0%, #1a3a8f 35%, #315aab 65%, #1e3d7a 100%)",
      }}
    >
      {/* Gold rope top bar */}
      <div
        style={{
          height: 6,
          background:
            "repeating-linear-gradient(90deg, #b8860b 0px, #ffd700 6px, #ffec6e 10px, #ffd700 14px, #b8860b 20px)",
          flexShrink: 0,
        }}
      />

      {/* Header */}
      <div className="flex items-center px-4 py-4 shrink-0">
        <button
          onClick={onClose}
          className="p-2 rounded-full mr-3 active:scale-95 transition-transform"
          style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)" }}
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
        <div className="flex-1 text-center">
          <h1
            className="font-extrabold text-xl tracking-wide"
            style={{ color: "#ffd700", textShadow: "0 0 16px rgba(255,215,0,0.5)" }}
          >
            {t.wheelRulesTitle}
          </h1>
        </div>
        <div className="w-11" />
      </div>

      {/* Hero badge */}
      <div className="flex justify-center mb-5 shrink-0">
        <div
          className="px-6 py-2 rounded-full text-sm font-bold"
          style={{
            background: "linear-gradient(135deg, #b8860b, #ffd700, #ffec6e, #ffd700, #b8860b)",
            color: "#1a0a00",
            boxShadow: "0 4px 16px rgba(255,215,0,0.35)",
          }}
        >
          🎡 LOTERIE
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 pb-8">

        {/* Section 1 — Comment obtenir des tours */}
        <Section
          icon={<ShoppingBag className="w-4 h-4 text-white" />}
          title={t.wheelRulesHowToGet}
          accentColor="#ffd700"
        >
          <RuleCard icon="🛒" text={t.wheelRulesBuyGet} />
          <RuleCard icon="👥" text={t.wheelRulesReferralGet} />
        </Section>

        {/* Divider */}
        <div className="mb-5" style={{ height: 1, background: "rgba(255,255,255,0.12)" }} />

        {/* Section 2 — Comment jouer */}
        <Section
          icon={<Sparkles className="w-4 h-4 text-white" />}
          title={t.wheelRulesHowToPlay}
          accentColor="#7c3aed"
        >
          <RuleCard icon="👆" text={t.wheelRulesHowToPlayDesc} />
          <RuleCard icon="🎯" text={t.wheelRulesSpinOnce} />
        </Section>

        {/* Divider */}
        <div className="mb-5" style={{ height: 1, background: "rgba(255,255,255,0.12)" }} />

        {/* Section 3 — Les gains */}
        <Section
          icon={<Gift className="w-4 h-4 text-white" />}
          title={t.wheelRulesRewards}
          accentColor="#16a34a"
        >
          <RuleCard icon="💰" text={t.wheelRulesGainCredit} />
          <RuleCard icon="♾️" text={t.wheelRulesTokenNote} />
        </Section>

        {/* Bottom decorative card */}
        <div
          className="mt-2 rounded-2xl p-4 flex items-center gap-3"
          style={{
            background: "linear-gradient(135deg, rgba(255,215,0,0.12), rgba(255,215,0,0.06))",
            border: "1px solid rgba(255,215,0,0.3)",
          }}
        >
          <span className="text-2xl">🏆</span>
          <p className="text-xs leading-relaxed font-medium" style={{ color: "rgba(255,215,0,0.85)" }}>
            PowerAdd — {t.wheelRulesTitle}
          </p>
        </div>
      </div>
    </div>
  );
}
