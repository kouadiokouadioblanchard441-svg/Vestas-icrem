import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { FALLBACK_COUNTRIES, type ApiCountry } from "@/lib/countries";
import { WORLD_COUNTRIES } from "@/lib/world-countries";
import { CountrySelector } from "@/components/country-selector";
import { useI18n, LANGUAGES, type Lang } from "@/lib/i18n";
import { Loader2, ChevronDown, Eye, EyeOff, Sun, ChevronRight } from "lucide-react";
import { FloatingSupport } from "@/components/floating-support";

export default function LoginPage() {
  const [, navigate] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  const { t, lang, setLang } = useI18n();
  const [isLoading, setIsLoading] = useState(false);
  const [countryModalOpen, setCountryModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  const savedCredentials = typeof window !== "undefined" ? localStorage.getItem("powerade_credentials") : null;
  const parsedCredentials = savedCredentials ? JSON.parse(savedCredentials) : null;
  const [rememberMe, setRememberMe] = useState(!!parsedCredentials);

  const loginSchema = z.object({
    phone: z.string().min(8, t.errInvalidPhone),
    country: z.string().min(2, "Sélectionnez un pays"),
    password: z.string().min(1, t.errPasswordRequired),
  });
  type LoginForm = z.infer<typeof loginSchema>;

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      phone: parsedCredentials?.phone || "",
      country: parsedCredentials?.country || "US",
      password: parsedCredentials?.password ? atob(parsedCredentials.password) : "",
    },
  });

  const { data: apiCountries } = useQuery<ApiCountry[]>({
    queryKey: ["/api/countries"],
  });

  const selectedCountry = form.watch("country");

  // Keep "US" (+1) as default — only auto-correct if user has an invalid saved country
  useEffect(() => {
    if (!apiCountries || apiCountries.length === 0) return;
    // Allow any country code, including ones not in the API list (e.g. US for +1)
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

  async function onSubmit(data: LoginForm) {
    setIsLoading(true);
    try {
      await login(data.phone, data.country, data.password);
      if (rememberMe) {
        localStorage.setItem("powerade_credentials", JSON.stringify({
          phone: data.phone,
          country: data.country,
          password: btoa(data.password),
        }));
      } else {
        localStorage.removeItem("powerade_credentials");
      }
      navigate("/");
    } catch (error: any) {
      toast({ title: error.message || t.errLoginFailed, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.88)",
    borderRadius: "14px",
    border: "none",
    height: 54,
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        backgroundImage: "url('/poweradd/poweradd-batterie-mini.jpg')",
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
          <img src="/poweradd/poweradd-logo-official.png" alt="PowerAdd" style={{ height: 36, objectFit: "contain" }} />

          {/* Language */}
          <button
            type="button"
            onClick={() => setLangOpen(true)}
            className="flex items-center gap-1"
            style={{ color: "#222", fontWeight: 500, fontSize: 13 }}
          >
            <Sun size={18} style={{ color: "#f5a623" }} />
            <span>Langue</span>
            <ChevronRight size={14} />
          </button>
        </div>

        {/* Form area */}
        <div className="flex-1 flex flex-col justify-center px-5 pb-10">
          <div className="w-full max-w-sm mx-auto flex flex-col gap-4">
            <input type="hidden" {...form.register("country")} />

            {/* Phone */}
            <div className="w-full flex items-center overflow-hidden" style={inputStyle}>
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
                placeholder="Please enter your phone number"
                className="flex-1 h-full bg-transparent text-gray-700 placeholder:text-gray-400 text-sm outline-none px-3"
                data-testid="input-phone"
              />
            </div>
            {form.formState.errors.phone && (
              <p className="text-red-600 text-xs -mt-2 ml-1">{form.formState.errors.phone.message}</p>
            )}

            {/* Password */}
            <div className="w-full flex items-center overflow-hidden" style={inputStyle}>
              <input
                {...form.register("password")}
                type={showPassword ? "text" : "password"}
                placeholder="Please enter your password"
                className="flex-1 h-full bg-transparent text-gray-700 placeholder:text-gray-400 text-sm outline-none px-4"
                data-testid="input-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="pr-4 pl-2 flex items-center shrink-0"
              >
                {showPassword
                  ? <EyeOff size={18} className="text-gray-400" />
                  : <Eye size={18} className="text-gray-400" />}
              </button>
            </div>
            {form.formState.errors.password && (
              <p className="text-red-600 text-xs -mt-2 ml-1">{form.formState.errors.password.message}</p>
            )}

            {/* Remember me - green checkbox */}
            <div className="flex items-center gap-2.5">
              <div
                onClick={() => setRememberMe(v => !v)}
                className="flex items-center justify-center cursor-pointer shrink-0 transition-all"
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 4,
                  border: `2px solid ${rememberMe ? "#22a84a" : "rgba(255,255,255,0.6)"}`,
                  background: rememberMe ? "#22a84a" : "rgba(255,255,255,0.15)",
                }}
                data-testid="checkbox-remember"
              >
                {rememberMe && (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              <label
                onClick={() => setRememberMe(v => !v)}
                className="text-white text-sm cursor-pointer font-medium"
              >
                Remember account password
              </label>
            </div>

            {/* Login button */}
            <button
              type="button"
              onClick={form.handleSubmit(onSubmit)}
              disabled={isLoading}
              className="w-full font-bold text-white text-base disabled:opacity-50 transition-all active:scale-95"
              style={{
                height: 56,
                borderRadius: 28,
                background: "linear-gradient(135deg, #315aab 0%, #254a91 100%)",
                boxShadow: "0 4px 16px rgba(49,90,171,0.45)",
              }}
              data-testid="button-login"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Logging in...
                </span>
              ) : "Login immediately"}
            </button>

            {/* Register button */}
            <button
              type="button"
              onClick={() => navigate("/register")}
              className="w-full font-bold text-white text-base transition-all active:scale-95"
              style={{
                height: 56,
                borderRadius: 28,
                background: "linear-gradient(135deg, #315aab 0%, #254a91 100%)",
                boxShadow: "0 4px 16px rgba(49,90,171,0.45)",
              }}
              data-testid="link-register"
            >
              No account? Register
            </button>
          </div>
        </div>

        <CountrySelector
          open={countryModalOpen}
          onClose={() => setCountryModalOpen(false)}
          onSelect={(code) => form.setValue("country", code, { shouldValidate: true })}
          selectedCode={selectedCountry}
        />

        {/* Language picker bottom sheet */}
        {langOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              style={{ background: "rgba(0,0,0,0.50)" }}
              onClick={() => setLangOpen(false)}
            />
            <div
              className="fixed bottom-0 inset-x-0 z-50 bg-white flex flex-col"
              style={{ borderRadius: "20px 20px 0 0", boxShadow: "0 -4px 24px rgba(0,0,0,0.12)" }}
            >
              <div style={{ height: 20 }} />
              {LANGUAGES.map((lng, index) => {
                const isSelected = lng.code === lang;
                return (
                  <button
                    key={lng.code}
                    type="button"
                    onClick={() => { setLang(lng.code as Lang); setLangOpen(false); }}
                    className="w-full flex items-center justify-between px-4"
                    style={{ height: 56, borderBottom: index < LANGUAGES.length - 1 ? "1px dashed #BFDBFE" : "none" }}
                  >
                    <span style={{ fontSize: 15, fontWeight: 500, color: isSelected ? "#E8A020" : "#1a1a1a" }}>
                      {lng.flag}&nbsp;&nbsp;{lng.nativeName}
                    </span>
                    {isSelected && (
                      <span className="flex items-center justify-center shrink-0"
                        style={{ width: 24, height: 24, borderRadius: "50%", background: "#E8A020" }}>
                        <svg width="13" height="10" viewBox="0 0 13 10" fill="none">
                          <path d="M1.5 5L5 8.5L11.5 1.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </span>
                    )}
                  </button>
                );
              })}
              <div style={{ height: 24 }} />
            </div>
          </>
        )}
      </div>

      <FloatingSupport bottomOffset={24} />
    </div>
  );
}
