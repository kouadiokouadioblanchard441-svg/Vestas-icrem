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
import { LanguagePicker } from "@/components/language-picker";
import { useI18n } from "@/lib/i18n";
import { Loader2, ChevronDown, Phone, Lock, Eye, EyeOff, Gift } from "lucide-react";
import { FloatingSupport } from "@/components/floating-support";
const poweraddLogo = "/poweradd/poweradd-logo-official.png";

export default function RegisterPage() {
  const [, navigate] = useLocation();
  const searchString = useSearch();
  const { register } = useAuth();
  const { toast } = useToast();
  const { t } = useI18n();
  const [isLoading, setIsLoading] = useState(false);
  const [countryModalOpen, setCountryModalOpen] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const params = new URLSearchParams(searchString);
  const refCode = params.get("invite_code") || params.get("money") || params.get("reg") || "";

  const registerSchema = z.object({
    phone: z.string().min(8, t.errInvalidPhone),
    country: z.string().min(2, "Sélectionnez un pays"),
    password: z.string().min(6, t.errMinPassword),
    confirmPassword: z.string().min(1, t.errConfirmPassword),
    invitationCode: z.string().optional(),
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
      invitationCode: refCode,
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
    if (!agreedToTerms) {
      toast({ title: "Conditions requises", description: t.errTermsRequired, variant: "destructive" });
      return;
    }
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

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        backgroundImage: [
          "linear-gradient(to bottom, rgba(5,15,35,0.60) 0%, rgba(5,15,35,0.35) 48%, rgba(5,15,35,0.35) 52%, rgba(5,15,35,0.60) 100%)",
          "url('/poweradd/poweradd-charge3devices.jpg')",
          "url('/poweradd/poweradd-batterie-mini.jpg')",
        ].join(", "),
        backgroundSize: "100% 100%, 100% 55%, 100% 55%",
        backgroundPosition: "0 0, center top, center bottom",
        backgroundRepeat: "no-repeat",
        position: "relative",
      }}
    >
      {/* Overlay */}
      <div style={{ position: "absolute", inset: 0, background: "rgba(5,15,35,0.68)", zIndex: 0 }} />

      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", flex: 1 }}>

        {/* Top bar */}
        <div className="flex items-center justify-between px-4 pt-4">
          <LanguagePicker align="left" />
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="px-5 py-2 rounded-full font-bold text-white text-sm transition-all active:scale-95"
            style={{
              background: "rgba(255,255,255,0.12)",
              border: "1.5px solid rgba(255,255,255,0.22)",
              backdropFilter: "blur(10px)",
            }}
          >
            {t.loginBtn}
          </button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-5 py-6 overflow-y-auto">

          {/* Logo */}
          <img src={poweraddLogo} alt="Power Add" style={{ width: 160, height: 56, objectFit: "contain" }} className="mb-1" />
          <p className="text-white/60 text-xs tracking-widest uppercase mb-6">Créer un compte</p>

          {/* Glass card */}
          <div
            className="w-full max-w-sm rounded-3xl px-6 py-7"
            style={{
              background: "rgba(255,255,255,0.08)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.18)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.32)",
            }}
          >
            <h2 className="text-white font-bold text-xl mb-5 text-center">Inscription</h2>

            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-3.5">
              <input type="hidden" {...form.register("country")} />

              {/* Phone */}
              <div>
                <label className="text-white/70 text-xs font-semibold mb-1.5 block tracking-wide uppercase">
                  {t.yourNumber}
                </label>
                <div
                  className="w-full flex items-center overflow-hidden"
                  style={{
                    height: 52,
                    background: "rgba(255,255,255,0.15)",
                    border: "1.5px solid rgba(255,255,255,0.55)",
                    borderRadius: "50px",
                  }}
                >
                  <div className="pl-4 pr-2 flex items-center shrink-0">
                    <Phone size={15} className="text-white/70" />
                  </div>
                  <button
                    type="button"
                    onClick={() => setCountryModalOpen(true)}
                    className="flex items-center gap-0.5 pr-3 h-full font-bold text-sm shrink-0 border-r"
                    style={{ color: "#E8320A", borderColor: "rgba(255,255,255,0.40)" }}
                  >
                    +{countryData?.phonePrefix || "1"}
                    <ChevronDown size={13} />
                  </button>
                  <input
                    {...form.register("phone")}
                    type="tel"
                    placeholder="Numéro de téléphone"
                    className="flex-1 h-full bg-transparent text-white placeholder:text-white/35 text-sm outline-none px-3"
                    data-testid="input-phone"
                  />
                </div>
                {form.formState.errors.phone && (
                  <p className="text-red-400 text-xs mt-1 ml-2">{form.formState.errors.phone.message}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="text-white/70 text-xs font-semibold mb-1.5 block tracking-wide uppercase">
                  {t.yourPassword}
                </label>
                <div
                  className="w-full flex items-center overflow-hidden"
                  style={{
                    height: 52,
                    background: "rgba(255,255,255,0.15)",
                    border: "1.5px solid rgba(255,255,255,0.55)",
                    borderRadius: "50px",
                  }}
                >
                  <div className="pl-4 pr-3 flex items-center shrink-0">
                    <Lock size={15} className="text-white/70" />
                  </div>
                  <input
                    {...form.register("password")}
                    type={showPassword ? "text" : "password"}
                    placeholder="Mot de passe"
                    className="flex-1 h-full bg-transparent text-white placeholder:text-white/35 text-sm outline-none"
                    data-testid="input-password"
                  />
                  <button type="button" onClick={() => setShowPassword(v => !v)} className="pr-4 pl-2 flex items-center shrink-0">
                    {showPassword ? <EyeOff size={15} className="text-white/40" /> : <Eye size={15} className="text-white/40" />}
                  </button>
                </div>
                {form.formState.errors.password && (
                  <p className="text-red-400 text-xs mt-1 ml-2">{form.formState.errors.password.message}</p>
                )}
              </div>

              {/* Confirm password */}
              <div>
                <label className="text-white/70 text-xs font-semibold mb-1.5 block tracking-wide uppercase">
                  {t.repeatPassword}
                </label>
                <div
                  className="w-full flex items-center overflow-hidden"
                  style={{
                    height: 52,
                    background: "rgba(255,255,255,0.15)",
                    border: "1.5px solid rgba(255,255,255,0.55)",
                    borderRadius: "50px",
                  }}
                >
                  <div className="pl-4 pr-3 flex items-center shrink-0">
                    <Lock size={15} className="text-white/70" />
                  </div>
                  <input
                    {...form.register("confirmPassword")}
                    type={showConfirm ? "text" : "password"}
                    placeholder="Confirmer le mot de passe"
                    className="flex-1 h-full bg-transparent text-white placeholder:text-white/35 text-sm outline-none"
                    data-testid="input-confirm-password"
                  />
                  <button type="button" onClick={() => setShowConfirm(v => !v)} className="pr-4 pl-2 flex items-center shrink-0">
                    {showConfirm ? <EyeOff size={15} className="text-white/40" /> : <Eye size={15} className="text-white/40" />}
                  </button>
                </div>
                {form.formState.errors.confirmPassword && (
                  <p className="text-red-400 text-xs mt-1 ml-2">{form.formState.errors.confirmPassword.message}</p>
                )}
              </div>

              {/* Referral code */}
              <div>
                <label className="text-white/70 text-xs font-semibold mb-1.5 block tracking-wide uppercase">
                  {t.referralCode}
                </label>
                <div
                  className="w-full flex items-center overflow-hidden"
                  style={{
                    height: 52,
                    background: "rgba(255,255,255,0.15)",
                    border: "1.5px solid rgba(255,255,255,0.55)",
                    borderRadius: "50px",
                  }}
                >
                  <div className="pl-4 pr-3 flex items-center shrink-0">
                    <Gift size={15} className="text-white/70" />
                  </div>
                  <input
                    {...form.register("invitationCode")}
                    placeholder="Code de parrainage (optionnel)"
                    className="flex-1 h-full bg-transparent text-white placeholder:text-white/35 text-sm outline-none"
                    data-testid="input-invitation-code"
                  />
                </div>
              </div>

              {/* Terms checkbox */}
              <div className="flex items-start gap-3 mt-1">
                <div
                  onClick={() => setAgreedToTerms(v => !v)}
                  className="w-5 h-5 rounded-full border-2 flex items-center justify-center cursor-pointer shrink-0 mt-0.5 transition-all"
                  style={{
                    borderColor: agreedToTerms ? "#E8320A" : "rgba(255,255,255,0.35)",
                    background: agreedToTerms ? "#E8320A" : "transparent",
                  }}
                >
                  {agreedToTerms && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
                <label
                  onClick={() => setAgreedToTerms(v => !v)}
                  className="text-white/60 text-xs cursor-pointer leading-snug"
                >
                  {t.terms}
                </label>
              </div>

              {/* Register button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-full font-bold text-white text-base disabled:opacity-50 mt-1 transition-all active:scale-95"
                style={{
                  height: 52,
                  background: "linear-gradient(135deg, #E8320A 0%, #c4260a 100%)",
                  boxShadow: "0 4px 20px rgba(232,50,10,0.45)",
                }}
                data-testid="button-register"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {t.registerLoading}
                  </span>
                ) : t.registerBtn}
              </button>
            </form>
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
