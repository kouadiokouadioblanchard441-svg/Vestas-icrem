import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { FALLBACK_COUNTRIES, type ApiCountry } from "@/lib/countries";
import { CountrySelector } from "@/components/country-selector";
import { Loader2, ChevronDown } from "lucide-react";
const intelLogo = "/spolarpv-logo.png";

const loginSchema = z.object({
  phone: z.string().min(8, "Numéro de téléphone invalide"),
  country: z.string().min(2, "Sélectionnez un pays"),
  password: z.string().min(1, "Le mot de passe est requis"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [, navigate] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [countryModalOpen, setCountryModalOpen] = useState(false);

  const savedCredentials = typeof window !== "undefined" ? localStorage.getItem("spolarpv_credentials") : null;
  const parsedCredentials = savedCredentials ? JSON.parse(savedCredentials) : null;
  const [rememberMe, setRememberMe] = useState(!!parsedCredentials);

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      phone: parsedCredentials?.phone || "",
      country: parsedCredentials?.country || "CM",
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
      return null;
    }
    const f = FALLBACK_COUNTRIES.find(fc => fc.code === selectedCountry);
    return f ? { phonePrefix: f.phonePrefix, name: f.name } : null;
  })();

  async function onSubmit(data: LoginForm) {
    setIsLoading(true);
    try {
      await login(data.phone, data.country, data.password);
      if (rememberMe) {
        localStorage.setItem("spolarpv_credentials", JSON.stringify({
          phone: data.phone,
          country: data.country,
          password: btoa(data.password),
        }));
      } else {
        localStorage.removeItem("spolarpv_credentials");
      }
      navigate("/");
    } catch (error: any) {
      toast({ title: "Erreur de connexion", description: error.message || "Vérifiez vos informations", variant: "destructive" });
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

        {/* Top bar */}
        <div className="flex items-center justify-end px-4 pt-4">
          <button
            type="button"
            onClick={() => navigate("/register")}
            className="px-5 py-2 rounded-full font-bold text-white text-sm"
            style={{ background: "var(--color-primary, #E8A020)", border: "none" }}
          >
            register
          </button>
        </div>

        <div className="flex-1 flex flex-col px-6 pt-4 pb-10">

          {/* Logo in white card */}
          <div className="flex justify-center mb-10">
            <div className="bg-white rounded-lg p-4 flex items-center justify-center" style={{ width: 180, height: 130 }}>
              <img src={intelLogo} alt="Logo" style={{ width: 150, height: 100, objectFit: "contain" }} />
            </div>
          </div>

          {/* Form */}
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-1">
            <input type="hidden" {...form.register("country")} />

            {/* Phone field with inline country prefix */}
            <div
              className="w-full flex items-center px-3 rounded-full"
              style={{ background: "rgba(255,255,255,0.12)", height: 52, border: "none" }}
            >
              <button
                type="button"
                onClick={() => setCountryModalOpen(true)}
                className="flex items-center gap-1 pr-3 font-bold text-sm shrink-0"
                style={{ color: "#E8A020", borderRight: "1px solid rgba(255,255,255,0.3)" }}
              >
                +{countryData?.phonePrefix || "1"}
                <ChevronDown size={14} />
              </button>
              <input
                {...form.register("phone")}
                type="tel"
                className="flex-1 bg-transparent text-white placeholder:text-white/50 text-sm outline-none pl-3"
                data-testid="input-phone"
              />
            </div>
            <p className="text-white/70 text-xs ml-3 mb-3">your number</p>
            {form.formState.errors.phone && (
              <p className="text-red-400 text-xs -mt-2 ml-3 mb-1">{form.formState.errors.phone.message}</p>
            )}

            {/* Password field */}
            <div
              className="w-full flex items-center px-4 rounded-full"
              style={{ background: "rgba(255,255,255,0.12)", height: 52 }}
            >
              <input
                {...form.register("password")}
                type="password"
                className="flex-1 bg-transparent text-white placeholder:text-white/50 text-sm outline-none"
                data-testid="input-password"
              />
            </div>
            <p className="text-white/70 text-xs ml-3 mb-3">your password</p>
            {form.formState.errors.password && (
              <p className="text-red-400 text-xs -mt-2 ml-3 mb-1">{form.formState.errors.password.message}</p>
            )}

            {/* Remember me */}
            <div className="flex items-center gap-3 mt-1 mb-4">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-5 h-5 cursor-pointer rounded"
                style={{ accentColor: "#E8A020" }}
                data-testid="checkbox-remember"
              />
              <label htmlFor="remember" className="text-white text-sm cursor-pointer">
                remember me
              </label>
            </div>

            {/* Login button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 rounded-full font-bold text-white text-lg disabled:opacity-50"
              style={{ background: "#E8A020" }}
              data-testid="button-login"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Connexion...
                </span>
              ) : "Log in"}
            </button>

            {/* Tagline */}
            <p className="text-white/60 text-xs text-center mt-8 italic underline leading-relaxed">
              SpolarPV: One of the best investment platforms in the world; with SpolarPV, earn a comfortable living.
            </p>
          </form>
        </div>

        <CountrySelector
          open={countryModalOpen}
          onClose={() => setCountryModalOpen(false)}
          onSelect={(code) => form.setValue("country", code, { shouldValidate: true })}
        />
      </div>
    </div>
  );
}
