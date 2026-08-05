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
import { Eye, EyeOff, ChevronRight, Smartphone, Lock, ThumbsUp } from "lucide-react";
import { FloatingSupport } from "@/components/floating-support";
import { setAppLoading } from "@/components/navigation-loader";

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

  const params = new URLSearchParams(searchString);
  const refCode = params.get("invite_code") || params.get("money") || params.get("reg") || "";

  const registerSchema = z.object({
    phone: z.string().min(8, t.errInvalidPhone),
    country: z.string().min(2, t.selectCountry),
    password: z.string().min(6, t.errMinPassword),
    confirmPassword: z.string().min(1, t.errConfirmPassword),
    invitationCode: z.string().min(1, t.errInvitationCodeRequired),
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

  async function onSubmit(data: RegisterForm) {
    setIsLoading(true);
    setAppLoading(true);
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
      toast({ title: error.message || t.errRegisterFailed, variant: "destructive" });
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
    display: "flex",
    alignItems: "center",
    overflow: "hidden",
    boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#0d0d0d" }}
    >
      <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center", alignItems: "center", padding: "24px 20px" }}>

        {/* Logo + Form centrés ensemble */}
        <div className="w-full max-w-sm mx-auto flex flex-col gap-4">

          {/* Logo centré */}
          <div className="flex items-center justify-center pb-4">
            <img src="/asus-logo-white.svg" alt="ASUS" style={{ height: 40, objectFit: "contain" }} />
          </div>
            <input type="hidden" {...form.register("country")} />

            {/* Phone */}
            <div style={inputStyle}>
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
            <div style={inputStyle}>
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
              <button type="button" onClick={() => setShowPassword(v => !v)} className="pr-4 pl-2 flex items-center shrink-0">
                {showPassword ? <EyeOff size={18} className="text-gray-400" /> : <Eye size={18} className="text-gray-400" />}
              </button>
            </div>
            {form.formState.errors.password && (
              <p className="text-red-600 text-xs -mt-2 ml-1">{form.formState.errors.password.message}</p>
            )}

            {/* Confirm password */}
            <div style={inputStyle}>
              <div className="pl-4 pr-3 flex items-center shrink-0">
                <Lock size={18} className="text-gray-400" />
              </div>
              <input
                {...form.register("confirmPassword")}
                type={showConfirm ? "text" : "password"}
                placeholder={t.confirmPasswordPlaceholder}
                className="flex-1 h-full bg-transparent text-gray-700 placeholder:text-gray-400 text-sm outline-none"
                data-testid="input-confirm-password"
              />
              <button type="button" onClick={() => setShowConfirm(v => !v)} className="pr-4 pl-2 flex items-center shrink-0">
                {showConfirm ? <EyeOff size={18} className="text-gray-400" /> : <Eye size={18} className="text-gray-400" />}
              </button>
            </div>
            {form.formState.errors.confirmPassword && (
              <p className="text-red-600 text-xs -mt-2 ml-1">{form.formState.errors.confirmPassword.message}</p>
            )}

            {/* Invitation code */}
            <div style={inputStyle}>
              <div className="pl-4 pr-3 flex items-center shrink-0">
                <ThumbsUp size={18} className="text-gray-400" />
              </div>
              <input
                {...form.register("invitationCode")}
                placeholder={t.invitationCodePlaceholder}
                className="flex-1 h-full bg-transparent text-gray-700 placeholder:text-gray-400 text-sm outline-none pr-4"
                data-testid="input-invitation-code"
              />
            </div>
            {form.formState.errors.invitationCode && (
              <p className="text-red-600 text-xs -mt-2 ml-1">{form.formState.errors.invitationCode.message}</p>
            )}

            {/* Register button */}
            <button
              type="button"
              onClick={form.handleSubmit(onSubmit)}
              disabled={isLoading}
              className="w-full font-bold text-white text-base disabled:opacity-50 transition-all active:scale-95 mt-2"
              style={{ height: 56, borderRadius: 28, background: "#1a56db", boxShadow: "0 4px 16px rgba(26,86,219,0.55)" }}
              data-testid="button-register"
            >
              {t.registerNow}
            </button>

            {/* Login link */}
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="w-full font-bold text-white text-base transition-all active:scale-95"
              style={{ height: 56, borderRadius: 28, background: "#1a56db", boxShadow: "0 4px 16px rgba(26,86,219,0.55)" }}
              data-testid="link-login"
            >
              {t.alreadyHaveAccountLogin}
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
