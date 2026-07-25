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
import { LanguagePicker } from "@/components/language-picker";
import { useI18n } from "@/lib/i18n";
import { Loader2, ChevronDown, Phone, Lock, Eye, EyeOff } from "lucide-react";
import { FloatingSupport } from "@/components/floating-support";
const poweraddLogo = "/poweradd/poweradd-logo-official.png";

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
      toast({ title: "Erreur de connexion", description: error.message || t.errLoginFailed, variant: "destructive" });
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
          "url('/poweradd/poweradd-batterie-mini.jpg')",
          "url('/poweradd/poweradd-charge3devices.jpg')",
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
        <div className="flex items-center justify-end px-4 pt-4">
          <LanguagePicker align="right" />
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-5 py-8">

          {/* Logo */}
          <img src={poweraddLogo} alt="Power Add" style={{ width: 180, height: 64, objectFit: "contain" }} className="mb-2" />

          {/* Tagline */}
          <p className="text-white/60 text-xs tracking-widest uppercase mb-8">Bienvenue</p>

          {/* Glass card */}
          <div
            className="w-full max-w-sm rounded-3xl px-6 py-8"
            style={{
              background: "rgba(255,255,255,0.08)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.18)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.32)",
            }}
          >
            <h2 className="text-white font-bold text-xl mb-6 text-center">Connexion</h2>

            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <input type="hidden" {...form.register("country")} />

              {/* Phone */}
              <div>
                <label className="text-white/70 text-xs font-semibold mb-1.5 block tracking-wide uppercase">
                  {t.yourNumber}
                </label>
                <div
                  className="w-full h-13 flex items-center overflow-hidden"
                  style={{
                    background: "rgba(255,255,255,0.15)",
                    border: "1.5px solid rgba(255,255,255,0.55)",
                    borderRadius: "50px",
                  }}
                >
                  {/* Phone icon */}
                  <div className="pl-4 pr-2 flex items-center">
                    <Phone size={16} className="text-white/70" />
                  </div>
                  {/* Country prefix button */}
                  <button
                    type="button"
                    onClick={() => setCountryModalOpen(true)}
                    className="flex items-center gap-0.5 pr-3 h-full font-bold text-sm shrink-0 border-r"
                    style={{ color: "#E8320A", borderColor: "rgba(255,255,255,0.18)" }}
                    data-testid="button-select-country"
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
                  className="w-full h-13 flex items-center overflow-hidden"
                  style={{
                    background: "rgba(255,255,255,0.15)",
                    border: "1.5px solid rgba(255,255,255,0.55)",
                    borderRadius: "50px",
                  }}
                >
                  <div className="pl-4 pr-3 flex items-center">
                    <Lock size={16} className="text-white/70" />
                  </div>
                  <input
                    {...form.register("password")}
                    type={showPassword ? "text" : "password"}
                    placeholder="Mot de passe"
                    className="flex-1 h-full bg-transparent text-white placeholder:text-white/35 text-sm outline-none"
                    data-testid="input-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="pr-4 pl-2 flex items-center"
                  >
                    {showPassword
                      ? <EyeOff size={16} className="text-white/40" />
                      : <Eye size={16} className="text-white/40" />}
                  </button>
                </div>
                {form.formState.errors.password && (
                  <p className="text-red-400 text-xs mt-1 ml-2">{form.formState.errors.password.message}</p>
                )}
              </div>

              {/* Remember me */}
              <div className="flex items-center gap-2.5 mt-1">
                <div
                  onClick={() => setRememberMe(v => !v)}
                  className="w-5 h-5 rounded-full border-2 flex items-center justify-center cursor-pointer shrink-0 transition-all"
                  style={{
                    borderColor: rememberMe ? "#E8320A" : "rgba(255,255,255,0.35)",
                    background: rememberMe ? "#E8320A" : "transparent",
                  }}
                  data-testid="checkbox-remember"
                >
                  {rememberMe && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
                <label
                  onClick={() => setRememberMe(v => !v)}
                  className="text-white/70 text-sm cursor-pointer"
                >
                  {t.rememberMe}
                </label>
              </div>

              {/* Login button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-13 rounded-full text-white font-bold text-base disabled:opacity-50 mt-2 transition-all active:scale-95"
                style={{
                  background: "linear-gradient(135deg, #E8320A 0%, #c4260a 100%)",
                  boxShadow: "0 4px 20px rgba(232,50,10,0.45)",
                }}
                data-testid="button-login"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {t.loginLoading}
                  </span>
                ) : t.loginBtn}
              </button>

              {/* Register link */}
              <div className="text-center mt-1">
                <span className="text-white/50 text-sm">{t.noAccount}&nbsp;</span>
                <button
                  type="button"
                  onClick={() => navigate("/register")}
                  className="text-white font-bold text-sm underline underline-offset-2"
                  data-testid="link-register"
                >
                  {t.createAccount}
                </button>
              </div>
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
