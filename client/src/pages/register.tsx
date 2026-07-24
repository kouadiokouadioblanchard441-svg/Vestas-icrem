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
import { Loader2, ChevronDown } from "lucide-react";
import { FloatingSupport } from "@/components/floating-support";

const intelLogo = "/spolarpv-logo.png";

export default function RegisterPage() {
  const [, navigate] = useLocation();
  const searchString = useSearch();
  const { register } = useAuth();
  const { toast } = useToast();
  const { t } = useI18n();
  const [isLoading, setIsLoading] = useState(false);
  const [countryModalOpen, setCountryModalOpen] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

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
        backgroundImage: "url('/auth-bg.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        position: "relative",
      }}
    >
      <div style={{ position: "absolute", inset: 0, background: "rgba(5, 15, 35, 0.72)", zIndex: 0 }} />
      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", flex: 1 }}>

        {/* Top bar — langue en haut à gauche, login en haut à droite */}
        <div className="flex items-center justify-between px-4 pt-4">
          <LanguagePicker align="left" />
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="px-5 py-2 rounded-full font-bold text-white text-sm"
            style={{ background: "#E8A020", border: "none" }}
          >
            {t.loginBtn}
          </button>
        </div>

        <div className="flex-1 flex flex-col px-6 pt-4 pb-10 overflow-y-auto">

          {/* Logo in white card */}
          <div className="flex justify-center mb-8">
            <div className="bg-white rounded-lg p-4 flex items-center justify-center" style={{ width: 180, height: 130 }}>
              <img src={intelLogo} alt="Logo" style={{ width: 150, height: 100, objectFit: "contain" }} />
            </div>
          </div>

          {/* Form */}
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-1">
            <input type="hidden" {...form.register("country")} />

            {/* Phone field with inline country prefix */}
            <div className="w-full h-14 bg-white rounded-lg flex items-center overflow-hidden">
              <button
                type="button"
                onClick={() => setCountryModalOpen(true)}
                className="flex items-center gap-1 px-3 h-full font-bold text-sm shrink-0 border-r border-gray-200"
                style={{ color: "#E8A020" }}
              >
                +{countryData?.phonePrefix || "1"}
                <ChevronDown size={14} />
              </button>
              <input
                {...form.register("phone")}
                type="tel"
                className="flex-1 h-full bg-transparent text-gray-800 placeholder:text-gray-400 text-base outline-none px-3"
                data-testid="input-phone"
              />
            </div>
            <p className="text-white/70 text-xs ml-1 mb-2">{t.yourNumber}</p>
            {form.formState.errors.phone && (
              <p className="text-red-400 text-xs -mt-1 ml-1 mb-1">{form.formState.errors.phone.message}</p>
            )}

            {/* Password field */}
            <div className="w-full h-14 bg-white rounded-lg flex items-center px-4">
              <input
                {...form.register("password")}
                type="password"
                className="flex-1 bg-transparent text-gray-800 placeholder:text-gray-400 text-base outline-none"
                data-testid="input-password"
              />
            </div>
            <p className="text-white/70 text-xs ml-1 mb-2">{t.yourPassword}</p>
            {form.formState.errors.password && (
              <p className="text-red-400 text-xs -mt-1 ml-1 mb-1">{form.formState.errors.password.message}</p>
            )}

            {/* Confirm password field */}
            <div className="w-full h-14 bg-white rounded-lg flex items-center px-4">
              <input
                {...form.register("confirmPassword")}
                type="password"
                className="flex-1 bg-transparent text-gray-800 placeholder:text-gray-400 text-base outline-none"
                data-testid="input-confirm-password"
              />
            </div>
            <p className="text-white/70 text-xs ml-1 mb-2">{t.repeatPassword}</p>
            {form.formState.errors.confirmPassword && (
              <p className="text-red-400 text-xs -mt-1 ml-1 mb-1">{form.formState.errors.confirmPassword.message}</p>
            )}

            {/* Referral code field */}
            <div className="w-full h-14 bg-white rounded-lg flex items-center px-4">
              <input
                {...form.register("invitationCode")}
                className="flex-1 bg-transparent text-gray-800 placeholder:text-gray-400 text-base outline-none"
                data-testid="input-invitation-code"
              />
            </div>
            <p className="text-white/70 text-xs ml-1 mb-2">{t.referralCode}</p>

            {/* Terms checkbox */}
            <div className="flex items-start gap-3 mt-1 mb-5">
              <input
                type="checkbox"
                id="terms"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="w-5 h-5 cursor-pointer mt-0.5 shrink-0 rounded"
                style={{ accentColor: "#E8A020" }}
              />
              <label htmlFor="terms" className="text-white text-sm cursor-pointer leading-snug">
                {t.terms}
              </label>
            </div>

            {/* Register button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 rounded-full font-bold text-white text-lg disabled:opacity-50"
              style={{ background: "#E8A020" }}
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

        <CountrySelector
          open={countryModalOpen}
          onClose={() => setCountryModalOpen(false)}
          onSelect={(code) => form.setValue("country", code, { shouldValidate: true })}
          selectedCode={selectedCountry}
        />
      </div>

      {/* Floating service client button */}
      <FloatingSupport bottomOffset={24} />
    </div>
  );
}
