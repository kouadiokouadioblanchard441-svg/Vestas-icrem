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
import { useI18n } from "@/lib/i18n";
import { Eye, EyeOff, ChevronRight, Smartphone, Lock } from "lucide-react";
import { FloatingSupport } from "@/components/floating-support";
import { setAppLoading } from "@/components/navigation-loader";

export default function LoginPage() {
  const [, navigate] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  const { t } = useI18n();
  const [isLoading, setIsLoading] = useState(false);
  const [countryModalOpen, setCountryModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const savedCredentials = typeof window !== "undefined" ? localStorage.getItem("powerade_credentials") : null;
  const parsedCredentials = savedCredentials ? JSON.parse(savedCredentials) : null;
  const [rememberMe, setRememberMe] = useState(!!parsedCredentials);

  const loginSchema = z.object({
    phone: z.string().min(8, t.errInvalidPhone),
    country: z.string().min(2, t.selectCountry),
    password: z.string().min(1, t.errPasswordRequired),
  });
  type LoginForm = z.infer<typeof loginSchema>;

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      phone: parsedCredentials?.phone || "",
      country: parsedCredentials?.country || "US",
      password: "",
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
    setAppLoading(true);
    try {
      await login(data.phone, data.country, data.password);
      if (rememberMe) {
        // Only store non-sensitive fields — never store passwords in localStorage
        localStorage.setItem("powerade_credentials", JSON.stringify({
          phone: data.phone,
          country: data.country,
        }));
      } else {
        localStorage.removeItem("powerade_credentials");
      }
      navigate("/");
    } catch (error: any) {
      toast({ title: error.message || t.errLoginFailed, variant: "destructive" });
    } finally {
      setIsLoading(false);
      setAppLoading(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    background: "#ffffff",
    borderRadius: 999,
    border: "none",
    height: 54,
    boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#0d0d0d" }}
    >
      <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center", alignItems: "center", padding: "24px 20px" }}>

        {/* Logo + Form centrés ensemble */}
        <div className="w-full max-w-sm flex flex-col gap-4">

          {/* Logo centré */}
          <div className="flex items-center justify-center pb-6">
            <img src="/asus-logo-white.svg" alt="ASUS" style={{ height: 40, objectFit: "contain" }} />
          </div>
            <input type="hidden" {...form.register("country")} />

            {/* Phone */}
            <div className="w-full flex items-center overflow-hidden" style={inputStyle}>
              <div className="pl-4 pr-2 flex items-center shrink-0">
                <Smartphone size={18} className="text-gray-400" />
              </div>
              <button
                type="button"
                onClick={() => setCountryModalOpen(true)}
                className="flex items-center gap-1 pr-3 h-full font-bold text-sm shrink-0 border-r"
                style={{ color: "#333", borderColor: "rgba(0,0,0,0.15)" }}
                data-testid="button-select-country"
              >
                +{countryData?.phonePrefix || "1"}
                <ChevronRight size={13} />
              </button>
              <input
                {...form.register("phone")}
                type="tel"
                placeholder={t.phonePlaceholder}
                className="flex-1 h-full bg-transparent text-gray-700 placeholder:text-gray-400 text-sm outline-none px-3"
                data-testid="input-phone"
              />
            </div>
            {form.formState.errors.phone && (
              <p className="text-red-600 text-xs -mt-2 ml-1">{form.formState.errors.phone.message}</p>
            )}

            {/* Password */}
            <div className="w-full flex items-center overflow-hidden" style={inputStyle}>
              <div className="pl-4 pr-3 flex items-center shrink-0">
                <Lock size={18} className="text-gray-400" />
              </div>
              <input
                {...form.register("password")}
                type={showPassword ? "text" : "password"}
                placeholder={t.passwordPlaceholder}
                className="flex-1 h-full bg-transparent text-gray-700 placeholder:text-gray-400 text-sm outline-none"
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

            {/* Remember me */}
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
                {t.rememberPassword}
              </label>
            </div>

            {/* Login button */}
            <button
              type="button"
              onClick={form.handleSubmit(onSubmit)}
              disabled={isLoading}
              className="w-full font-bold text-white text-base disabled:opacity-50 transition-all active:scale-95"
              style={{ height: 56, borderRadius: 28, background: "#1a56db", boxShadow: "0 4px 16px rgba(26,86,219,0.55)" }}
              data-testid="button-login"
            >
              {t.loginImmediately}
            </button>

            {/* Register button */}
            <button
              type="button"
              onClick={() => navigate("/register")}
              className="w-full font-bold text-white text-base transition-all active:scale-95"
              style={{ height: 56, borderRadius: 28, background: "#1a56db", boxShadow: "0 4px 16px rgba(26,86,219,0.55)" }}
              data-testid="link-register"
            >
              {t.noAccountRegister}
            </button>
          </div>
        </div>

        <CountrySelector
          open={countryModalOpen}
          onClose={() => setCountryModalOpen(false)}
          onSelect={(code) => form.setValue("country", code, { shouldValidate: true })}
          selectedCode={selectedCountry}
        />
      <FloatingSupport bottomOffset={24} />
    </div>
  );
}
