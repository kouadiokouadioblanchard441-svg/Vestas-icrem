import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Lang = "fr" | "en" | "pt" | "es" | "ar";

export const LANGUAGES: { code: Lang; label: string; flag: string; nativeName: string }[] = [
  { code: "fr", label: "Français",   flag: "🇫🇷", nativeName: "Français" },
  { code: "en", label: "English",    flag: "🇬🇧", nativeName: "English" },
  { code: "pt", label: "Português",  flag: "🇵🇹", nativeName: "Português" },
  { code: "es", label: "Español",    flag: "🇪🇸", nativeName: "Español" },
  { code: "ar", label: "العربية",    flag: "🇸🇦", nativeName: "العربية" },
];

export type Translations = {
  yourNumber: string;
  yourPassword: string;
  rememberMe: string;
  loginBtn: string;
  loginLoading: string;
  noAccount: string;
  createAccount: string;
  registerBtn: string;
  registerLoading: string;
  repeatPassword: string;
  referralCode: string;
  terms: string;
  errInvalidPhone: string;
  errPasswordRequired: string;
  errMinPassword: string;
  errConfirmPassword: string;
  errPasswordMismatch: string;
  errTermsRequired: string;
  errLoginFailed: string;
  errRegisterFailed: string;
  successRegister: string;
  welcomeMsg: string;
};

const T: Record<Lang, Translations> = {
  fr: {
    yourNumber:        "votre numéro",
    yourPassword:      "votre mot de passe",
    rememberMe:        "se souvenir de moi",
    loginBtn:          "Se connecter",
    loginLoading:      "Connexion...",
    noAccount:         "Je n'ai pas de compte.",
    createAccount:     "Créer un compte",
    registerBtn:       "S'inscrire",
    registerLoading:   "Inscription...",
    repeatPassword:    "répéter le mot de passe",
    referralCode:      "code de parrainage",
    terms:             "En cochant cette case, vous acceptez les Conditions Générales d'Utilisation de SpolarPV",
    errInvalidPhone:   "Numéro de téléphone invalide",
    errPasswordRequired:"Le mot de passe est requis",
    errMinPassword:    "Au moins 6 caractères",
    errConfirmPassword:"Confirmez le mot de passe",
    errPasswordMismatch:"Les mots de passe ne correspondent pas",
    errTermsRequired:  "Veuillez accepter les conditions d'utilisation",
    errLoginFailed:    "Vérifiez vos informations",
    errRegisterFailed: "Une erreur est survenue",
    successRegister:   "Inscription réussie !",
    welcomeMsg:        "Bienvenue sur SpolarPV !",
  },
  en: {
    yourNumber:        "your number",
    yourPassword:      "your password",
    rememberMe:        "remember me",
    loginBtn:          "Log in",
    loginLoading:      "Logging in...",
    noAccount:         "I don't have an account.",
    createAccount:     "Create an account",
    registerBtn:       "Register",
    registerLoading:   "Registering...",
    repeatPassword:    "repeat your password",
    referralCode:      "referral code",
    terms:             "By checking this box you agree to the SpolarPV Terms and Conditions",
    errInvalidPhone:   "Invalid phone number",
    errPasswordRequired:"Password is required",
    errMinPassword:    "At least 6 characters",
    errConfirmPassword:"Please confirm your password",
    errPasswordMismatch:"Passwords do not match",
    errTermsRequired:  "Please accept the terms and conditions",
    errLoginFailed:    "Check your credentials",
    errRegisterFailed: "An error occurred",
    successRegister:   "Registration successful!",
    welcomeMsg:        "Welcome to SpolarPV!",
  },
  pt: {
    yourNumber:        "seu número",
    yourPassword:      "sua senha",
    rememberMe:        "lembrar de mim",
    loginBtn:          "Entrar",
    loginLoading:      "Entrando...",
    noAccount:         "Não tenho conta.",
    createAccount:     "Criar conta",
    registerBtn:       "Registrar",
    registerLoading:   "Registrando...",
    repeatPassword:    "repita a senha",
    referralCode:      "código de referência",
    terms:             "Ao marcar esta caixa, você concorda com os Termos e Condições da SpolarPV",
    errInvalidPhone:   "Número de telefone inválido",
    errPasswordRequired:"A senha é obrigatória",
    errMinPassword:    "Pelo menos 6 caracteres",
    errConfirmPassword:"Confirme a sua senha",
    errPasswordMismatch:"As senhas não coincidem",
    errTermsRequired:  "Aceite os termos e condições",
    errLoginFailed:    "Verifique suas credenciais",
    errRegisterFailed: "Ocorreu um erro",
    successRegister:   "Registro bem-sucedido!",
    welcomeMsg:        "Bem-vindo ao SpolarPV!",
  },
  es: {
    yourNumber:        "su número",
    yourPassword:      "su contraseña",
    rememberMe:        "recuérdame",
    loginBtn:          "Iniciar sesión",
    loginLoading:      "Iniciando...",
    noAccount:         "No tengo cuenta.",
    createAccount:     "Crear cuenta",
    registerBtn:       "Registrarse",
    registerLoading:   "Registrando...",
    repeatPassword:    "repetir contraseña",
    referralCode:      "código de referido",
    terms:             "Al marcar esta casilla, acepta los Términos y Condiciones de SpolarPV",
    errInvalidPhone:   "Número de teléfono inválido",
    errPasswordRequired:"La contraseña es obligatoria",
    errMinPassword:    "Al menos 6 caracteres",
    errConfirmPassword:"Confirme su contraseña",
    errPasswordMismatch:"Las contraseñas no coinciden",
    errTermsRequired:  "Acepte los términos y condiciones",
    errLoginFailed:    "Verifique sus datos",
    errRegisterFailed: "Ocurrió un error",
    successRegister:   "¡Registro exitoso!",
    welcomeMsg:        "¡Bienvenido a SpolarPV!",
  },
  ar: {
    yourNumber:        "رقمك",
    yourPassword:      "كلمة مرورك",
    rememberMe:        "تذكرني",
    loginBtn:          "تسجيل الدخول",
    loginLoading:      "جارٍ الدخول...",
    noAccount:         "ليس لدي حساب.",
    createAccount:     "إنشاء حساب",
    registerBtn:       "تسجيل",
    registerLoading:   "جارٍ التسجيل...",
    repeatPassword:    "أعد كلمة المرور",
    referralCode:      "رمز الإحالة",
    terms:             "بتحديد هذا المربع، فإنك توافق على شروط وأحكام SpolarPV",
    errInvalidPhone:   "رقم الهاتف غير صالح",
    errPasswordRequired:"كلمة المرور مطلوبة",
    errMinPassword:    "6 أحرف على الأقل",
    errConfirmPassword:"يرجى تأكيد كلمة المرور",
    errPasswordMismatch:"كلمتا المرور غير متطابقتين",
    errTermsRequired:  "يرجى قبول الشروط والأحكام",
    errLoginFailed:    "تحقق من بيانات الدخول",
    errRegisterFailed: "حدث خطأ ما",
    successRegister:   "تم التسجيل بنجاح!",
    welcomeMsg:        "مرحباً بك في SpolarPV!",
  },
};

// ── Context ──────────────────────────────────────────────────────────────────

interface I18nCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: Translations;
}

const I18nContext = createContext<I18nCtx>({
  lang: "fr",
  setLang: () => {},
  t: T.fr,
});

const STORAGE_KEY = "spolarpv_lang";

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Lang | null;
      if (saved && T[saved]) return saved;
    } catch {}
    return "fr";
  });

  const setLang = (l: Lang) => {
    setLangState(l);
    try { localStorage.setItem(STORAGE_KEY, l); } catch {}
  };

  return (
    <I18nContext.Provider value={{ lang, setLang, t: T[lang] }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
