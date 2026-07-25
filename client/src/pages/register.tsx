import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { FALLBACK_COUNTRIES, type ApiCountry } from "@/lib/countries";
import { WORLD_COUNTRIES } from "@/lib/world-countries";
import { CountrySelector } from "@/components/country-selector";
import { useI18n } from "@/lib/i18n";
import { Loader2, ChevronDown, Eye, EyeOff, Sun, ChevronRight } from "lucide-react";
import { FloatingSupport } from "@/components/floating-support";

export default function RegisterPage() {
  const [, navigate] = useLocation();
  const searchString = useSearch();
  const { register } = useAuth();
  const { toast } = useToast();
  const { t } = useI18n();
  const [isLoading, setIsLoading] = useState(false);
  const [countryModalOpen, setCountryModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showTxPassword, setShowTxPassword] = useState(false);

  const params = new URLSearchParams(searchString);
  const refCode = params.get("invite_code") || params.get("money") || params.get("reg") || "";

  const registerSchema = z.object({
    phone: z.string().min(8, t.errInvalidPhone),
    country: z.string().min(2, "Sélectionnez un pays"),
    password: z.string().min(6, t.errMinPassword),
    confirmPassword: z.string().min(1, t.errConfirmPassword),
    transactionPassword: z.string().optional(),
    invitationCode: z.string().optional(),
    telegram: z.string().optional(),
  }).refine((data) => data.password === data.confirmPassword, {
    message: t.errPasswordMismatch,
    path: ["confirmPassword"],
  });
  type RegisterForm = z.infer<typeof registerSchema>;

  const form = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      phone: "",
      country: "US",
      password: "",
      confirmPassword: "",
      transactionPassword: "",
      invitationCode: refCode,
      telegram: "",
    },
  });

  const { data: apiCountries } = useQuery<ApiCountry[]>({
    queryKey: ["/api/countries"],
  });

  const selectedCountry = form.watch("country");

  useEffect(() => {
    if (!apiCountries || apiCountries.length === 0) return;
    const isValid = apiCountries.some(ac => ac.code === selectedCountry && ac.isActive);
    if (!isValid) {
      const first = apiCountries.find(ac => ac.isActive);
      if (first) form.setValue("country", first.code);
    }
  }, [apiCountries, selectedCountry, form]);

  const countryData = (() => {
    if (apiCountries && apiCountries.length > 0) {
      const c = apiCountries.find(ac => ac.code === selectedCountry && ac.isActive);
      if (c) return { phonePrefix: c.phonePrefix, name: c.name };
    }
    const f = FALLBACK_COUNTRIES.find(fc => fc.code === selectedCountry);
    if (f) return { phonePrefix: f.phonePrefix, name: f.name };
    const w = WORLD_COUNTRIES.find(wc => wc.code === selectedCountry);
    return w ? { phonePrefix: w.phonePrefix, name: w.name } : null;
  })();

  async function onSubmit(data: RegisterForm) {
    setIsLoading(true);
    try {
      await register({
        fullName: `User_${data.phone}`,
        phone: data.phone,
        country: data.country,
        password: data.password,
        invitationCode: data.invitationCode,
      });
      toast({ title: t.successRegister, description: t.welcomeMsg });
      navigate("/");
    } catch (error: any) {
      toast({ title: "Erreur d'inscription", description: error.message || t.errRegisterFailed, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.88)",
    borderRadius: "14px",
    border: "none",
    height: 54,
    display: "flex",
    alignItems: "center",
    overflow: "hidden",
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        backgroundImage: "url('/poweradd/poweradd-charge3devices.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        position: "relative",
      }}
    >
      {/* Light overlay */}
      <div style={{ position: "absolute", inset: 0, background: "rgba(80,80,80,0.38)", zIndex: 0 }} />

      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", flex: 1 }}>

        {/* Top bar */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: "50%",
                background: "#D42B2B",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
              </svg>
            </div>
            <span style={{ color: "#D42B2B", fontWeight: 800, fontSize: 22, letterSpacing: -0.5 }}>
              enercoop
            </span>
          </div>

          {/* Language */}
          <button
            className="flex items-center gap-1"
            style={{ color: "#222", fontWeight: 500, fontSize: 13 }}
          >
            <Sun size={18} style={{ color: "#f5a623" }} />
            <span>Langue</span>
            <ChevronRight size={14} />
          </button>
        </div>

        {/* Scrollable form area */}
        <div className="flex-1 overflow-y-auto px-5 pb-10">
          <div className="w-full max-w-sm mx-auto flex flex-col gap-4 pt-4">
            <input type="hidden" {...form.register("country")} />

            {/* Phone */}
            <div style={inputStyle}>
              <button
                type="button"
                onClick={() => setCountryModalOpen(true)}
                className="flex items-center gap-1 px-4 h-full font-bold text-sm shrink-0 border-r"
                style={{ color: "#333", borderColor: "rgba(0,0,0,0.12)" }}
                data-testid="button-select-country"
              >
                +{countryData?.phonePrefix || "1"}
                <ChevronRight size={14} />
              </button>
              <input
                {...form.register("phone")}
                type="tel"
                placeholder="Veuillez saisir votre numéro de téléphone"
                className="flex-1 h-full bg-transparent text-gray-700 placeholder:text-gray-400 text-sm outline-none px-3"
                data-testid="input-phone"
              />
            </div>
            {form.formState.errors.phone && (
              <p className="text-red-300 text-xs -mt-2 ml-1">{form.formState.errors.phone.message}</p>
            )}

            {/* Password */}
            <div style={inputStyle}>
              <input
                {...form.register("password")}
                type={showPassword ? "text" : "password"}
                placeholder="Veuillez saisir votre mot de passe"
                className="flex-1 h-full bg-transparent text-gray-700 placeholder:text-gray-400 text-sm outline-none px-4"
                data-testid="input-password"
              />
              <button type="button" onClick={() => setShowPassword(v => !v)} className="pr-4 pl-2 flex items-center shrink-0">
                {showPassword ? <EyeOff size={18} className="text-gray-400" /> : <Eye size={18} className="text-gray-400" />}
              </button>
            </div>
            {form.formState.errors.password && (
              <p className="text-red-300 text-xs -mt-2 ml-1">{form.formState.errors.password.message}</p>
            )}

            {/* Confirm password */}
            <div style={inputStyle}>
              <input
                {...form.register("confirmPassword")}
                type={showConfirm ? "text" : "password"}
                placeholder="Veuillez saisir confirmer votre mot de passe"
                className="flex-1 h-full bg-transparent text-gray-700 placeholder:text-gray-400 text-sm outline-none px-4"
                data-testid="input-confirm-password"
              />
              <button type="button" onClick={() => setShowConfirm(v => !v)} className="pr-4 pl-2 flex items-center shrink-0">
                {showConfirm ? <EyeOff size={18} className="text-gray-400" /> : <Eye size={18} className="text-gray-400" />}
              </button>
            </div>
            {form.formState.errors.confirmPassword && (
              <p className="text-red-300 text-xs -mt-2 ml-1">{form.formState.errors.confirmPassword.message}</p>
            )}

            {/* Transaction password */}
            <div style={inputStyle}>
              <input
                {...form.register("transactionPassword")}
                type={showTxPassword ? "text" : "password"}
                placeholder="Veuillez saisir le mot de passe de transaction"
                className="flex-1 h-full bg-transparent text-gray-700 placeholder:text-gray-400 text-sm outline-none px-4"
                data-testid="input-transaction-password"
              />
              <button type="button" onClick={() => setShowTxPassword(v => !v)} className="pr-4 pl-2 flex items-center shrink-0">
                {showTxPassword ? <EyeOff size={18} className="text-gray-400" /> : <Eye size={18} className="text-gray-400" />}
              </button>
            </div>

            {/* Invitation code */}
            <div style={inputStyle}>
              <input
                {...form.register("invitationCode")}
                placeholder="Veuillez saisir le code d'invitation"
                className="flex-1 h-full bg-transparent text-gray-700 placeholder:text-gray-400 text-sm outline-none px-4"
                data-testid="input-invitation-code"
              />
            </div>

            {/* Telegram */}
            <div style={inputStyle}>
              <input
                {...form.register("telegram")}
                placeholder="Télégramme"
                className="flex-1 h-full bg-transparent text-gray-700 placeholder:text-gray-400 text-sm outline-none px-4"
                data-testid="input-telegram"
              />
            </div>

            {/* Register button */}
            <button
              type="button"
              onClick={form.handleSubmit(onSubmit)}
              disabled={isLoading}
              className="w-full font-bold text-white text-base disabled:opacity-50 transition-all active:scale-95 mt-2"
              style={{
                height: 56,
                borderRadius: 28,
                background: "#D42B2B",
                boxShadow: "0 4px 16px rgba(212,43,43,0.40)",
              }}
              data-testid="button-register"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Inscription...
                </span>
              ) : "Inscrivez-vous maintenant"}
            </button>

            {/* Login link */}
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="w-full font-bold text-white text-base transition-all active:scale-95"
              style={{
                height: 56,
                borderRadius: 28,
                background: "#D42B2B",
                boxShadow: "0 4px 16px rgba(212,43,43,0.40)",
              }}
              data-testid="link-login"
            >
              Vous avez déjà un compte ? Connectez-vous
            </button>
          </div>
        </div>

        <CountrySelector
          open={countryModalOpen}
          onClose={() => setCountryModalOpen(false)}
          onSelect={(code) => form.setValue("country", code, { shouldValidate: true })}
          selectedCode={selectedCountry}
        />
      </div>

      <FloatingSupport bottomOffset={24} />
    </div>
  );
}
