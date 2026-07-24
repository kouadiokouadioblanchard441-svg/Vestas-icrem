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
import vestasLogo from "@/assets/vestas-logo_1783210030332.png";

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
      {/* Overlay sombre pour lisibilité */}
      <div style={{ position: "absolute", inset: 0, background: "rgba(5, 15, 35, 0.72)", zIndex: 0 }} />
      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", flex: 1 }}>
        <div className="flex-1 flex flex-col px-6 pt-16 pb-10">

          {/* Logo */}
          <div className="flex justify-center mb-14">
            <img src={vestasLogo} alt="Vestas" style={{ width: 200, height: 72, objectFit: "contain" }} />
          </div>

          {/* Fields */}
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-1">
            <input type="hidden" {...form.register("country")} />

            {/* Numéro de téléphone avec indicatif inline */}
            <div className="w-full h-14 bg-white rounded-lg flex items-center overflow-hidden">
              <button
                type="button"
                onClick={() => setCountryModalOpen(true)}
                className="flex items-center gap-1 px-3 h-full font-bold text-sm shrink-0 border-r border-gray-200"
                style={{ color: "#E8320A" }}
                data-testid="button-select-country"
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
            <p className="text-white/70 text-xs ml-1 mb-2">your number</p>
            {form.formState.errors.phone && (
              <p className="text-red-400 text-xs -mt-1 ml-1 mb-1">{form.formState.errors.phone.message}</p>
            )}

            {/* Mot de passe */}
            <div className="w-full h-14 bg-white rounded-lg flex items-center px-4">
              <input
                {...form.register("password")}
                type="password"
                className="flex-1 bg-transparent text-gray-800 placeholder:text-gray-400 text-base outline-none"
                data-testid="input-password"
              />
            </div>
            <p className="text-white/70 text-xs ml-1 mb-2">your password</p>
            {form.formState.errors.password && (
              <p className="text-red-400 text-xs -mt-1 ml-1 mb-1">{form.formState.errors.password.message}</p>
            )}

            {/* Se souvenir */}
            <div className="flex items-center gap-2 mt-1">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-5 h-5 cursor-pointer"
                style={{ accentColor: "#16A34A" }}
                data-testid="checkbox-remember"
              />
              <label htmlFor="remember" className="text-white text-sm cursor-pointer">
                remember me
              </label>
            </div>

            {/* Bouton connexion */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 rounded-full text-white font-bold text-base disabled:opacity-50 mt-4"
              style={{ background: "#16A34A", border: "2px solid #15803D" }}
              data-testid="button-login"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Connexion...
                </span>
              ) : "Log in"}
            </button>

            {/* Lien inscription */}
            <div className="text-center mt-4">
              <span className="text-white/70 text-sm">Je n'ai pas de compte.  </span>
              <button
                type="button"
                onClick={() => navigate("/register")}
                className="text-white font-bold text-sm underline"
                data-testid="link-register"
              >
                Créer un compte
              </button>
            </div>
          </form>
        </div>

        <CountrySelector
          open={countryModalOpen}
          onClose={() => setCountryModalOpen(false)}
          onSelect={(code) => form.setValue("country", code, { shouldValidate: true })}
          selectedCode={selectedCountry}
        />
      </div>
    </div>
  );
}
