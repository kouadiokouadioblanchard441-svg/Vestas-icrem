import { ChevronLeft, ShoppingBag, Sparkles, Gift } from "lucide-react";
import { useI18n } from "@/lib/i18n";

interface WheelRulesModalProps {
  open: boolean;
  onClose: () => void;
}

function RuleItem({ emoji, text }: { emoji: string; text: string }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b" style={{ borderColor: "rgba(255,255,255,0.12)" }}>
      <span className="text-xl mt-0.5 shrink-0">{emoji}</span>
      <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.88)" }}>{text}</p>
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
    <div
      className="rounded-2xl overflow-hidden mb-4"
      style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }}
    >
      {/* Section header */}
      <div
        className="flex items-center gap-2 px-4 py-3"
        style={{ background: "rgba(0,0,0,0.15)", borderBottom: "1px solid rgba(255,255,255,0.1)" }}
      >
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
          style={{ background: accentColor }}
        >
          {icon}
        </div>
        <h2 className="font-bold text-white text-sm tracking-wide uppercase">{title}</h2>
      </div>
      {/* Section content */}
      <div className="px-4 pt-1 pb-2">{children}</div>
    </div>
  );
}

export default function WheelRulesModal({ open, onClose }: WheelRulesModalProps) {
  const { t } = useI18n();

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col overflow-hidden"
      style={{ background: "#315aab" }}
    >
      {/* White header — like About page */}
      <header className="flex items-center px-4 py-3 shrink-0 bg-white shadow-sm">
        <button
          onClick={onClose}
          className="p-1.5 rounded-full active:scale-95 transition-transform"
          style={{ background: "rgba(0,0,0,0.06)" }}
        >
          <ChevronLeft className="w-5 h-5 text-gray-700" />
        </button>
        <h1 className="flex-1 text-center text-lg font-bold text-gray-800 pr-8">
          {t.wheelRulesTitle}
        </h1>
      </header>

      {/* Hero banner */}
      <div
        className="mx-4 mt-5 mb-4 rounded-2xl overflow-hidden shrink-0 relative"
        style={{
          border: "1px solid rgba(255,215,0,0.4)",
          minHeight: 110,
        }}
      >
        {/* Background image */}
        <img
          src="/trophy.jpg"
          alt="Trophées"
          className="absolute inset-0 w-full h-full object-cover object-top"
          style={{ filter: "brightness(0.38)" }}
        />
        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.15) 60%, transparent 100%)",
          }}
        />
        {/* Content */}
        <div className="relative z-10 flex items-center gap-4 p-4">
          <img
            src="/trophy.jpg"
            alt="Trophée"
            className="w-16 h-16 rounded-xl object-cover object-center shrink-0"
            style={{
              border: "2px solid rgba(255,215,0,0.6)",
              boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
            }}
          />
          <div>
            <p className="font-extrabold text-xl text-white leading-tight tracking-wide">
              LOTERIE PowerAdd
            </p>
            <p className="text-sm mt-1 font-medium" style={{ color: "rgba(255,215,0,0.9)" }}>
              🎡 Tournez la roue et remportez des USDT
            </p>
          </div>
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
          <RuleItem emoji="🛒" text={t.wheelRulesBuyGet} />
          <RuleItem emoji="👥" text={t.wheelRulesReferralGet} />
        </Section>

        {/* Section 2 — Comment jouer */}
        <Section
          icon={<Sparkles className="w-4 h-4 text-white" />}
          title={t.wheelRulesHowToPlay}
          accentColor="#7c3aed"
        >
          <RuleItem emoji="👆" text={t.wheelRulesHowToPlayDesc} />
          <RuleItem emoji="🎯" text={t.wheelRulesSpinOnce} />
        </Section>

        {/* Section 3 — Les gains */}
        <Section
          icon={<Gift className="w-4 h-4 text-white" />}
          title={t.wheelRulesRewards}
          accentColor="#16a34a"
        >
          <RuleItem emoji="💰" text={t.wheelRulesGainCredit} />
          <RuleItem emoji="♾️" text={t.wheelRulesTokenNote} />
        </Section>

      </div>
    </div>
  );
}
