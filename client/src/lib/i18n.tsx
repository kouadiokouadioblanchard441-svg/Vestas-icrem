import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Lang = "fr" | "en" | "pt" | "es" | "ar" | "zh";

export const LANGUAGES: { code: Lang; label: string; flag: string; nativeName: string }[] = [
  { code: "zh", label: "中文",      flag: "🇨🇳", nativeName: "中文" },
  { code: "fr", label: "Français",  flag: "🇫🇷", nativeName: "Français" },
  { code: "en", label: "English",   flag: "🇬🇧", nativeName: "English" },
  { code: "pt", label: "Português", flag: "🇵🇹", nativeName: "Português" },
  { code: "es", label: "Español",   flag: "🇪🇸", nativeName: "Español" },
  { code: "ar", label: "العربية",   flag: "🇸🇦", nativeName: "العربية" },
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
  languageLabel: string;
};

const T: Record<Lang, Translations> = {
  zh: {
    yourNumber:         "您的电话号码",
    yourPassword:       "您的密码",
    rememberMe:         "记住我",
    loginBtn:           "立即登录",
    loginLoading:       "登录中...",
    noAccount:          "没有账号？",
    createAccount:      "创建账号",
    registerBtn:        "注册",
    registerLoading:    "注册中...",
    repeatPassword:     "重复密码",
    referralCode:       "推荐码",
    terms:              "勾选此框即表示您同意Powerade的使用条款",
    errInvalidPhone:    "手机号码无效",
    errPasswordRequired:"请输入密码",
    errMinPassword:     "至少6个字符",
    errConfirmPassword: "请确认密码",
    errPasswordMismatch:"两次密码不一致",
    errTermsRequired:   "请接受使用条款",
    errLoginFailed:     "请检查您的账号信息",
    errRegisterFailed:  "发生错误，请重试",
    successRegister:    "注册成功！",
    welcomeMsg:         "欢迎使用Powerade！",
    languageLabel:      "语言",
  },
  fr: {
    yourNumber:         "votre numéro",
    yourPassword:       "votre mot de passe",
    rememberMe:         "se souvenir de moi",
    loginBtn:           "Se connecter",
    loginLoading:       "Connexion...",
    noAccount:          "Je n'ai pas de compte.",
    createAccount:      "Créer un compte",
    registerBtn:        "S'inscrire",
    registerLoading:    "Inscription...",
    repeatPassword:     "répéter le mot de passe",
    referralCode:       "code de parrainage",
    terms:              "En cochant cette case, vous acceptez les Conditions Générales d'Utilisation de Powerade",
    errInvalidPhone:    "Numéro de téléphone invalide",
    errPasswordRequired:"Le mot de passe est requis",
    errMinPassword:     "Au moins 6 caractères",
    errConfirmPassword: "Confirmez le mot de passe",
    errPasswordMismatch:"Les mots de passe ne correspondent pas",
    errTermsRequired:   "Veuillez accepter les conditions d'utilisation",
    errLoginFailed:     "Vérifiez vos informations",
    errRegisterFailed:  "Une erreur est survenue",
    successRegister:    "Inscription réussie !",
    welcomeMsg:         "Bienvenue sur Powerade !",
    languageLabel:      "Langue",
  },
  en: {
    yourNumber:         "your number",
    yourPassword:       "your password",
    rememberMe:         "remember me",
    loginBtn:           "Log in",
    loginLoading:       "Logging in...",
    noAccount:          "I don't have an account.",
    createAccount:      "Create an account",
    registerBtn:        "Register",
    registerLoading:    "Registering...",
    repeatPassword:     "repeat your password",
    referralCode:       "referral code",
    terms:              "By checking this box you agree to the Powerade Terms and Conditions",
    errInvalidPhone:    "Invalid phone number",
    errPasswordRequired:"Password is required",
    errMinPassword:     "At least 6 characters",
    errConfirmPassword: "Please confirm your password",
    errPasswordMismatch:"Passwords do not match",
    errTermsRequired:   "Please accept the terms and conditions",
    errLoginFailed:     "Check your credentials",
    errRegisterFailed:  "An error occurred",
    successRegister:    "Registration successful!",
    welcomeMsg:         "Welcome to Powerade!",
    languageLabel:      "Language",
  },
  pt: {
    yourNumber:         "seu número",
    yourPassword:       "sua senha",
    rememberMe:         "lembrar de mim",
    loginBtn:           "Entrar",
    loginLoading:       "Entrando...",
    noAccount:          "Não tenho conta.",
    createAccount:      "Criar conta",
    registerBtn:        "Registrar",
    registerLoading:    "Registrando...",
    repeatPassword:     "repita a senha",
    referralCode:       "código de referência",
    terms:              "Ao marcar esta caixa, você concorda com os Termos e Condições da Powerade",
    errInvalidPhone:    "Número de telefone inválido",
    errPasswordRequired:"A senha é obrigatória",
    errMinPassword:     "Pelo menos 6 caracteres",
    errConfirmPassword: "Confirme a sua senha",
    errPasswordMismatch:"As senhas não coincidem",
    errTermsRequired:   "Aceite os termos e condições",
    errLoginFailed:     "Verifique suas credenciais",
    errRegisterFailed:  "Ocorreu um erro",
    successRegister:    "Registro bem-sucedido!",
    welcomeMsg:         "Bem-vindo ao Powerade!",
    languageLabel:      "Idioma",
  },
  es: {
    yourNumber:         "su número",
    yourPassword:       "su contraseña",
    rememberMe:         "recuérdame",
    loginBtn:           "Iniciar sesión",
    loginLoading:       "Iniciando...",
    noAccount:          "No tengo cuenta.",
    createAccount:      "Crear cuenta",
    registerBtn:        "Registrarse",
    registerLoading:    "Registrando...",
    repeatPassword:     "repetir contraseña",
    referralCode:       "código de referido",
    terms:              "Al marcar esta casilla, acepta los Términos y Condiciones de Powerade",
    errInvalidPhone:    "Número de teléfono inválido",
    errPasswordRequired:"La contraseña es obligatoria",
    errMinPassword:     "Al menos 6 caracteres",
    errConfirmPassword: "Confirme su contraseña",
    errPasswordMismatch:"Las contraseñas no coinciden",
    errTermsRequired:   "Acepte los términos y condiciones",
    errLoginFailed:     "Verifique sus datos",
    errRegisterFailed:  "Ocurrió un error",
    successRegister:    "¡Registro exitoso!",
    welcomeMsg:         "¡Bienvenido a Powerade!",
    languageLabel:      "Idioma",
  },
  ar: {
    yourNumber:         "رقمك",
    yourPassword:       "كلمة مرورك",
    rememberMe:         "تذكرني",
    loginBtn:           "تسجيل الدخول",
    loginLoading:       "جارٍ الدخول...",
    noAccount:          "ليس لدي حساب.",
    createAccount:      "إنشاء حساب",
    registerBtn:        "تسجيل",
    registerLoading:    "جارٍ التسجيل...",
    repeatPassword:     "أعد كلمة المرور",
    referralCode:       "رمز الإحالة",
    terms:              "بتحديد هذا المربع، فإنك توافق على شروط وأحكام Powerade",
    errInvalidPhone:    "رقم الهاتف غير صالح",
    errPasswordRequired:"كلمة المرور مطلوبة",
    errMinPassword:     "6 أحرف على الأقل",
    errConfirmPassword: "يرجى تأكيد كلمة المرور",
    errPasswordMismatch:"كلمتا المرور غير متطابقتين",
    errTermsRequired:   "يرجى قبول الشروط والأحكام",
    errLoginFailed:     "تحقق من بيانات الدخول",
    errRegisterFailed:  "حدث خطأ ما",
    successRegister:    "تم التسجيل بنجاح!",
    welcomeMsg:         "مرحباً بك في Powerade!",
    languageLabel:      "اللغة",
  },
};

// ── Context ──────────────────────────────────────────────────────────────────

interface I18nCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: Translations;
}

const I18nContext = createContext<I18nCtx>({
  lang: "zh",
  setLang: () => {},
  t: T.zh,
});

const STORAGE_KEY = "powerade_lang";

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Lang | null;
      if (saved && T[saved]) return saved;
    } catch {}
    return "zh";
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
