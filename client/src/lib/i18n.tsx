import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Lang = "fr" | "en" | "pt" | "es" | "ar" | "zh";

export const LANGUAGES: { code: Lang; label: string; flag: string; nativeName: string }[] = [
  { code: "zh", label: "中文",      flag: "🇨🇳", nativeName: "中文" },
  { code: "en", label: "English",  flag: "🇬🇧", nativeName: "English" },
  { code: "fr", label: "Français", flag: "🇫🇷", nativeName: "Français" },
  { code: "es", label: "Español",  flag: "🇪🇸", nativeName: "Español" },
  { code: "pt", label: "Português",flag: "🇵🇹", nativeName: "Português" },
  { code: "ar", label: "العربية",  flag: "🇸🇦", nativeName: "العربية" },
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
  selectCountry: string;
  phonePlaceholder: string;
  passwordPlaceholder: string;
  confirmPasswordPlaceholder: string;
  transactionPasswordPlaceholder: string;
  invitationCodePlaceholder: string;
  telegramPlaceholder: string;
  rememberPassword: string;
  loginImmediately: string;
  registerNow: string;
  noAccountRegister: string;
  alreadyHaveAccountLogin: string;
  home: string;
  products: string;
  earnings: string;
  team: string;
  me: string;
  deposit: string;
  withdraw: string;
  customerService: string;
  informationCenter: string;
  previous: string;
  next: string;
  notification: string;
  loading: string;
  noProducts: string;
  price: string;
  dailyRevenue: string;
  totalRevenue: string;
  duration: string;
  period: string;
  buy: string;
  purchased: string;
  purchaseSuccess: string;
  purchaseSuccessDescription: string;
  errorOccurred: string;
  accountBalance: string;
  revenue: string;
  adminPanel: string;
  adminAccessCode: string;
  adminPinHint: string;
  pinPlaceholder: string;
  confirm: string;
  cancel: string;
  history: string;
  security: string;
  redeem: string;
  about: string;
  wallet: string;
  commonFunctions: string;
  logout: string;
  // account suspended
  accountSuspended: string;
  accountSuspendedDesc: string;
  // change password page/modal
  back: string;
  changePassword: string;
  oldPassword: string;
  newPassword: string;
  confirmNewPassword: string;
  saving: string;
  processing: string;
  requiredFields: string;
  fillAllFields: string;
  passwordTooShort: string;
  minSixCharsRequired: string;
  passwordSuccess: string;
  passwordSuccessDesc: string;
  currentPasswordPlaceholder: string;
  newPasswordPlaceholder: string;
  confirmNewPasswordPlaceholder: string;
  // history / empty states
  noWithdrawals: string;
  noTransactions: string;
  withdrawalHistory: string;
  // status labels
  statusApproved: string;
  statusPending: string;
  statusRejected: string;
  // withdrawal page
  invalidAmount: string;
  minAmountPrefix: string;
  addressRequired: string;
  selectUsdtWallet: string;
  // wallet form
  walletHolderName: string;
  walletHolderNamePlaceholder: string;
  walletAddressLabel: string;
  walletAddressInvalid: string;
  walletHolderRequired: string;
  // deposit orders
  noDeposits: string;
  depositOrders: string;
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
    selectCountry:      "请选择国家",
    phonePlaceholder:   "请输入手机号码",
    passwordPlaceholder:"请输入密码",
    confirmPasswordPlaceholder: "请确认密码",
    transactionPasswordPlaceholder: "请输入交易密码",
    invitationCodePlaceholder: "请输入邀请码",
    telegramPlaceholder:"Telegram",
    rememberPassword:   "记住账户密码",
    loginImmediately:   "立即登录",
    registerNow:        "立即注册",
    noAccountRegister:  "没有账号？注册",
    alreadyHaveAccountLogin: "已有账号？登录",
    home:               "首页",
    products:           "产品",
    earnings:           "收益",
    team:               "团队",
    me:                 "我的",
    deposit:            "充值",
    withdraw:           "提现",
    customerService:    "客服",
    informationCenter:  "信息中心",
    previous:           "上一张",
    next:               "下一张",
    notification:       "通知",
    loading:            "加载中...",
    noProducts:         "暂无可用产品",
    price:              "价格",
    dailyRevenue:       "每日收益",
    totalRevenue:       "总收益",
    duration:           "时长",
    period:             "周期",
    buy:                "购买",
    purchased:          "已购买",
    purchaseSuccess:    "购买成功！",
    purchaseSuccessDescription: "您将从明天开始获得收益。",
    errorOccurred:      "发生错误，请重试",
    accountBalance:     "账户余额",
    revenue:            "收益",
    adminPanel:         "管理面板",
    adminAccessCode:    "管理员访问码",
    adminPinHint:       "请输入您的 PIN 码以访问管理面板",
    pinPlaceholder:     "PIN 码",
    confirm:            "确认",
    cancel:             "取消",
    history:            "记录",
    security:           "安全",
    redeem:             "兑换",
    about:              "关于我们",
    wallet:             "钱包",
    commonFunctions:    "常用功能",
    logout:             "退出登录",
    accountSuspended:   "账号已封禁",
    accountSuspendedDesc: "您的账号已被封禁，请联系客服。",
    back:               "返回",
    changePassword:     "修改密码",
    oldPassword:        "旧密码",
    newPassword:        "新密码",
    confirmNewPassword: "确认新密码",
    saving:             "保存中...",
    processing:         "处理中...",
    requiredFields:     "必填字段",
    fillAllFields:      "请填写所有字段",
    passwordTooShort:   "密码太短",
    minSixCharsRequired:"至少需要6个字符",
    passwordSuccess:    "成功",
    passwordSuccessDesc:"密码已成功修改",
    currentPasswordPlaceholder: "当前密码",
    newPasswordPlaceholder:     "新密码",
    confirmNewPasswordPlaceholder: "确认新密码",
    noWithdrawals:      "暂无提现记录",
    noTransactions:     "暂无交易记录",
    withdrawalHistory:  "提现记录",
    statusApproved:     "成功",
    statusPending:      "待处理",
    statusRejected:     "已拒绝",
    invalidAmount:      "金额无效",
    minAmountPrefix:    "最低金额为",
    addressRequired:    "地址必填",
    selectUsdtWallet:   "请选择USDT BEP20地址",
    walletHolderName:   "持有人姓名",
    walletHolderNamePlaceholder: "输入持有人姓名",
    walletAddressLabel: "BEP20钱包地址",
    walletAddressInvalid: "BEP20地址无效 (格式: 0x + 40字符)",
    walletHolderRequired: "持有人姓名必填",
    noDeposits:         "暂无充值记录",
    depositOrders:      "充值记录",
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
    selectCountry:      "Sélectionnez un pays",
    phonePlaceholder:   "Veuillez saisir votre numéro de téléphone",
    passwordPlaceholder:"Veuillez saisir votre mot de passe",
    confirmPasswordPlaceholder: "Veuillez confirmer votre mot de passe",
    transactionPasswordPlaceholder: "Veuillez saisir votre mot de passe de transaction",
    invitationCodePlaceholder: "Veuillez saisir le code d'invitation",
    telegramPlaceholder:"Telegram",
    rememberPassword:   "Mémoriser le mot de passe",
    loginImmediately:   "Se connecter",
    registerNow:        "S'inscrire maintenant",
    noAccountRegister:  "Pas de compte ? S'inscrire",
    alreadyHaveAccountLogin: "Déjà un compte ? Se connecter",
    home:               "Accueil",
    products:           "Produits",
    earnings:           "Gains",
    team:               "Équipe",
    me:                 "Moi",
    deposit:            "Recharger",
    withdraw:           "Retirer",
    customerService:    "Service client",
    informationCenter:  "Centre d'information",
    previous:           "Précédent",
    next:               "Suivant",
    notification:       "Notification",
    loading:            "Chargement...",
    noProducts:         "Aucun produit disponible",
    price:              "Prix",
    dailyRevenue:       "Revenu quotidien",
    totalRevenue:       "Revenu total",
    duration:           "Durée",
    period:             "Période",
    buy:                "Acheter",
    purchased:          "Acheté",
    purchaseSuccess:    "Produit acheté !",
    purchaseSuccessDescription: "Vous commencerez à recevoir des gains demain.",
    errorOccurred:      "Une erreur est survenue",
    accountBalance:     "Solde du compte",
    revenue:            "Revenus",
    adminPanel:         "Panel Admin",
    adminAccessCode:    "Code d'accès administrateur",
    adminPinHint:       "Entrez votre code PIN pour accéder au panel administrateur",
    pinPlaceholder:     "Code PIN",
    confirm:            "Confirmer",
    cancel:             "Annuler",
    history:            "Historique",
    security:           "Sécurité",
    redeem:             "兑换",
    about:              "À propos",
    wallet:             "Portefeuille",
    commonFunctions:    "Fonctions communes",
    logout:             "Déconnexion",
    accountSuspended:   "Compte suspendu",
    accountSuspendedDesc: "Votre compte a été suspendu. Contactez le support.",
    back:               "Retour",
    changePassword:     "Changer le mot de passe",
    oldPassword:        "Ancien mot de passe",
    newPassword:        "Nouveau mot de passe",
    confirmNewPassword: "Re-mot de passe",
    saving:             "Enregistrement...",
    processing:         "Modification...",
    requiredFields:     "Champs requis",
    fillAllFields:      "Veuillez remplir tous les champs",
    passwordTooShort:   "Mot de passe trop court",
    minSixCharsRequired:"Minimum 6 caractères requis",
    passwordSuccess:    "Succès",
    passwordSuccessDesc:"Mot de passe modifié avec succès",
    currentPasswordPlaceholder: "Mot de passe actuel",
    newPasswordPlaceholder:     "Nouveau mot de passe",
    confirmNewPasswordPlaceholder: "Confirmer le nouveau mot de passe",
    noWithdrawals:      "Aucun retrait pour le moment",
    noTransactions:     "Aucune transaction pour le moment",
    withdrawalHistory:  "Historique des retraits",
    statusApproved:     "SUCCÈS",
    statusPending:      "EN ATTENTE",
    statusRejected:     "REFUSÉ",
    invalidAmount:      "Montant invalide",
    minAmountPrefix:    "Le montant minimum est de",
    addressRequired:    "Adresse requise",
    selectUsdtWallet:   "Veuillez sélectionner une adresse USDT BEP20",
    walletHolderName:   "Nom du titulaire",
    walletHolderNamePlaceholder: "Entrez le nom du titulaire",
    walletAddressLabel: "Adresse du portefeuille BEP20",
    walletAddressInvalid: "Adresse BEP20 invalide (format 0x + 40 caractères)",
    walletHolderRequired: "Nom du titulaire requis",
    noDeposits:         "Aucun dépôt pour le moment",
    depositOrders:      "Ordre du dépôt",
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
    selectCountry:      "Select a country",
    phonePlaceholder:   "Please enter your phone number",
    passwordPlaceholder:"Please enter your password",
    confirmPasswordPlaceholder: "Please confirm your password",
    transactionPasswordPlaceholder: "Please enter your transaction password",
    invitationCodePlaceholder: "Please enter invitation code",
    telegramPlaceholder:"Telegram",
    rememberPassword:   "Remember account password",
    loginImmediately:   "Login immediately",
    registerNow:        "Register now",
    noAccountRegister:  "No account? Register",
    alreadyHaveAccountLogin: "Already have an account? Login",
    home:               "Home",
    products:           "Products",
    earnings:           "Earnings",
    team:               "Team",
    me:                 "Me",
    deposit:            "Deposit",
    withdraw:           "Withdraw",
    customerService:    "Customer Service",
    informationCenter:  "Information Center",
    previous:           "Previous",
    next:               "Next",
    notification:       "Notification",
    loading:            "Loading...",
    noProducts:         "No products available",
    price:              "Price",
    dailyRevenue:       "Daily revenue",
    totalRevenue:       "Total revenue",
    duration:           "Duration",
    period:             "Period",
    buy:                "Buy",
    purchased:          "Purchased",
    purchaseSuccess:    "Product purchased!",
    purchaseSuccessDescription: "You will start receiving earnings tomorrow.",
    errorOccurred:      "An error occurred",
    accountBalance:     "Account balance",
    revenue:            "Revenue",
    adminPanel:         "Admin Panel",
    adminAccessCode:    "Admin access code",
    adminPinHint:       "Enter your PIN to access the admin panel",
    pinPlaceholder:     "PIN code",
    confirm:            "Confirm",
    cancel:             "Cancel",
    history:            "Records",
    security:           "Security",
    redeem:             "Redeem",
    about:              "About",
    wallet:             "Wallet",
    commonFunctions:    "Common functions",
    logout:             "Log out",
    accountSuspended:   "Account suspended",
    accountSuspendedDesc: "Your account has been suspended. Please contact support.",
    back:               "Back",
    changePassword:     "Change password",
    oldPassword:        "Current password",
    newPassword:        "New password",
    confirmNewPassword: "Confirm new password",
    saving:             "Saving...",
    processing:         "Processing...",
    requiredFields:     "Required fields",
    fillAllFields:      "Please fill in all fields",
    passwordTooShort:   "Password too short",
    minSixCharsRequired:"Minimum 6 characters required",
    passwordSuccess:    "Success",
    passwordSuccessDesc:"Password changed successfully",
    currentPasswordPlaceholder: "Current password",
    newPasswordPlaceholder:     "New password",
    confirmNewPasswordPlaceholder: "Confirm new password",
    noWithdrawals:      "No withdrawals yet",
    noTransactions:     "No transactions yet",
    withdrawalHistory:  "Withdrawal history",
    statusApproved:     "SUCCESS",
    statusPending:      "PENDING",
    statusRejected:     "REJECTED",
    invalidAmount:      "Invalid amount",
    minAmountPrefix:    "Minimum amount is",
    addressRequired:    "Address required",
    selectUsdtWallet:   "Please select a USDT BEP20 address",
    walletHolderName:   "Account holder name",
    walletHolderNamePlaceholder: "Enter account holder name",
    walletAddressLabel: "BEP20 wallet address",
    walletAddressInvalid: "Invalid BEP20 address (format: 0x + 40 characters)",
    walletHolderRequired: "Account holder name required",
    noDeposits:         "No deposits yet",
    depositOrders:      "Deposit orders",
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
    selectCountry:      "Selecione um país",
    phonePlaceholder:   "Digite seu número de telefone",
    passwordPlaceholder:"Digite sua senha",
    confirmPasswordPlaceholder: "Confirme sua senha",
    transactionPasswordPlaceholder: "Digite sua senha de transação",
    invitationCodePlaceholder: "Digite o código de convite",
    telegramPlaceholder:"Telegram",
    rememberPassword:   "Lembrar senha da conta",
    loginImmediately:   "Entrar agora",
    registerNow:        "Registrar agora",
    noAccountRegister:  "Não tem conta? Registrar",
    alreadyHaveAccountLogin: "Já tem conta? Entrar",
    home:               "Início",
    products:           "Produtos",
    earnings:           "Ganhos",
    team:               "Equipe",
    me:                 "Eu",
    deposit:            "Depositar",
    withdraw:           "Sacar",
    customerService:    "Atendimento",
    informationCenter:  "Central de informações",
    previous:           "Anterior",
    next:               "Próximo",
    notification:       "Notificação",
    loading:            "Carregando...",
    noProducts:         "Nenhum produto disponível",
    price:              "Preço",
    dailyRevenue:       "Receita diária",
    totalRevenue:       "Receita total",
    duration:           "Duração",
    period:             "Período",
    buy:                "Comprar",
    purchased:          "Comprado",
    purchaseSuccess:    "Produto comprado!",
    purchaseSuccessDescription: "Você começará a receber ganhos amanhã.",
    errorOccurred:      "Ocorreu um erro",
    accountBalance:     "Saldo da conta",
    revenue:            "Receita",
    adminPanel:         "Painel Admin",
    adminAccessCode:    "Código de acesso admin",
    adminPinHint:       "Digite seu PIN para acessar o painel admin",
    pinPlaceholder:     "Código PIN",
    confirm:            "Confirmar",
    cancel:             "Cancelar",
    history:            "Historial",
    security:           "Seguridad",
    redeem:             "Canjear",
    about:              "Acerca de",
    wallet:             "Billetera",
    commonFunctions:    "Funciones comunes",
    logout:             "Cerrar sesión",
    accountSuspended:   "Conta suspensa",
    accountSuspendedDesc: "A sua conta foi suspensa. Entre em contacto com o suporte.",
    back:               "Voltar",
    changePassword:     "Alterar senha",
    oldPassword:        "Senha atual",
    newPassword:        "Nova senha",
    confirmNewPassword: "Confirmar nova senha",
    saving:             "Salvando...",
    processing:         "Processando...",
    requiredFields:     "Campos obrigatórios",
    fillAllFields:      "Por favor preencha todos os campos",
    passwordTooShort:   "Senha muito curta",
    minSixCharsRequired:"Mínimo 6 caracteres necessários",
    passwordSuccess:    "Sucesso",
    passwordSuccessDesc:"Senha alterada com sucesso",
    currentPasswordPlaceholder: "Senha atual",
    newPasswordPlaceholder:     "Nova senha",
    confirmNewPasswordPlaceholder: "Confirmar nova senha",
    noWithdrawals:      "Sem saques por enquanto",
    noTransactions:     "Sem transações por enquanto",
    withdrawalHistory:  "Histórico de saques",
    statusApproved:     "APROVADO",
    statusPending:      "PENDENTE",
    statusRejected:     "REJEITADO",
    invalidAmount:      "Valor inválido",
    minAmountPrefix:    "O valor mínimo é",
    addressRequired:    "Endereço obrigatório",
    selectUsdtWallet:   "Por favor selecione um endereço USDT BEP20",
    walletHolderName:   "Nome do titular",
    walletHolderNamePlaceholder: "Digite o nome do titular",
    walletAddressLabel: "Endereço da carteira BEP20",
    walletAddressInvalid: "Endereço BEP20 inválido (formato: 0x + 40 caracteres)",
    walletHolderRequired: "Nome do titular obrigatório",
    noDeposits:         "Sem depósitos por enquanto",
    depositOrders:      "Ordens de depósito",
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
    selectCountry:      "Seleccione un país",
    phonePlaceholder:   "Ingrese su número de teléfono",
    passwordPlaceholder:"Ingrese su contraseña",
    confirmPasswordPlaceholder: "Confirme su contraseña",
    transactionPasswordPlaceholder: "Ingrese su contraseña de transacción",
    invitationCodePlaceholder: "Ingrese el código de invitación",
    telegramPlaceholder:"Telegram",
    rememberPassword:   "Recordar contraseña",
    loginImmediately:   "Iniciar sesión",
    registerNow:        "Registrarse ahora",
    noAccountRegister:  "¿No tiene cuenta? Registrarse",
    alreadyHaveAccountLogin: "¿Ya tiene cuenta? Iniciar sesión",
    home:               "Inicio",
    products:           "Productos",
    earnings:           "Ganancias",
    team:               "Equipo",
    me:                 "Yo",
    deposit:            "Depositar",
    withdraw:           "Retirar",
    customerService:    "Atención al cliente",
    informationCenter:  "Centro de información",
    previous:           "Anterior",
    next:               "Siguiente",
    notification:       "Notificación",
    loading:            "Cargando...",
    noProducts:         "No hay productos disponibles",
    price:              "Precio",
    dailyRevenue:       "Ingreso diario",
    totalRevenue:       "Ingreso total",
    duration:           "Duración",
    period:             "Período",
    buy:                "Comprar",
    purchased:          "Comprado",
    purchaseSuccess:    "¡Producto comprado!",
    purchaseSuccessDescription: "Comenzará a recibir ganancias mañana.",
    errorOccurred:      "Ocurrió un error",
    accountBalance:     "Saldo de la cuenta",
    revenue:            "Ingresos",
    adminPanel:         "Panel Admin",
    adminAccessCode:    "Código de acceso admin",
    adminPinHint:       "Ingrese su PIN para acceder al panel admin",
    pinPlaceholder:     "Código PIN",
    confirm:            "Confirmar",
    cancel:             "Cancelar",
    history:            "Historial",
    security:           "Seguridad",
    redeem:             "Canjear",
    about:              "Acerca de",
    wallet:             "Billetera",
    commonFunctions:    "Funciones comunes",
    logout:             "Cerrar sesión",
    accountSuspended:   "Cuenta suspendida",
    accountSuspendedDesc: "Su cuenta ha sido suspendida. Contacte al soporte.",
    back:               "Volver",
    changePassword:     "Cambiar contraseña",
    oldPassword:        "Contraseña actual",
    newPassword:        "Nueva contraseña",
    confirmNewPassword: "Confirmar nueva contraseña",
    saving:             "Guardando...",
    processing:         "Procesando...",
    requiredFields:     "Campos requeridos",
    fillAllFields:      "Por favor complete todos los campos",
    passwordTooShort:   "Contraseña muy corta",
    minSixCharsRequired:"Mínimo 6 caracteres requeridos",
    passwordSuccess:    "Éxito",
    passwordSuccessDesc:"Contraseña cambiada con éxito",
    currentPasswordPlaceholder: "Contraseña actual",
    newPasswordPlaceholder:     "Nueva contraseña",
    confirmNewPasswordPlaceholder: "Confirmar nueva contraseña",
    noWithdrawals:      "Sin retiros por el momento",
    noTransactions:     "Sin transacciones por el momento",
    withdrawalHistory:  "Historial de retiros",
    statusApproved:     "APROBADO",
    statusPending:      "PENDIENTE",
    statusRejected:     "RECHAZADO",
    invalidAmount:      "Monto inválido",
    minAmountPrefix:    "El monto mínimo es",
    addressRequired:    "Dirección requerida",
    selectUsdtWallet:   "Por favor seleccione una dirección USDT BEP20",
    walletHolderName:   "Nombre del titular",
    walletHolderNamePlaceholder: "Ingrese el nombre del titular",
    walletAddressLabel: "Dirección de billetera BEP20",
    walletAddressInvalid: "Dirección BEP20 inválida (formato: 0x + 40 caracteres)",
    walletHolderRequired: "Nombre del titular requerido",
    noDeposits:         "Sin depósitos por el momento",
    depositOrders:      "Órdenes de depósito",
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
    selectCountry:      "اختر دولة",
    phonePlaceholder:   "أدخل رقم هاتفك",
    passwordPlaceholder:"أدخل كلمة المرور",
    confirmPasswordPlaceholder: "أكد كلمة المرور",
    transactionPasswordPlaceholder: "أدخل كلمة مرور المعاملة",
    invitationCodePlaceholder: "أدخل رمز الدعوة",
    telegramPlaceholder:"Telegram",
    rememberPassword:   "تذكر كلمة مرور الحساب",
    loginImmediately:   "تسجيل الدخول",
    registerNow:        "سجل الآن",
    noAccountRegister:  "ليس لديك حساب؟ سجل",
    alreadyHaveAccountLogin: "لديك حساب؟ سجل الدخول",
    home:               "الرئيسية",
    products:           "المنتجات",
    earnings:           "الأرباح",
    team:               "الفريق",
    me:                 "حسابي",
    deposit:            "إيداع",
    withdraw:           "سحب",
    customerService:    "خدمة العملاء",
    informationCenter:  "مركز المعلومات",
    previous:           "السابق",
    next:               "التالي",
    notification:       "إشعار",
    loading:            "جارٍ التحميل...",
    noProducts:         "لا توجد منتجات متاحة",
    price:              "السعر",
    dailyRevenue:       "العائد اليومي",
    totalRevenue:       "العائد الإجمالي",
    duration:           "المدة",
    period:             "الفترة",
    buy:                "شراء",
    purchased:          "تم الشراء",
    purchaseSuccess:    "تم شراء المنتج!",
    purchaseSuccessDescription: "ستبدأ في استلام الأرباح غداً.",
    errorOccurred:      "حدث خطأ",
    accountBalance:     "رصيد الحساب",
    revenue:            "الإيرادات",
    adminPanel:         "لوحة الإدارة",
    adminAccessCode:    "رمز وصول المسؤول",
    adminPinHint:       "أدخل رمز PIN للوصول إلى لوحة الإدارة",
    pinPlaceholder:     "رمز PIN",
    confirm:            "تأكيد",
    cancel:             "إلغاء",
    history:            "السجل",
    security:           "الأمان",
    redeem:             "استرداد",
    about:              "حول",
    wallet:             "المحفظة",
    commonFunctions:    "الوظائف المشتركة",
    logout:             "تسجيل الخروج",
    accountSuspended:   "الحساب موقوف",
    accountSuspendedDesc: "تم إيقاف حسابك. يرجى التواصل مع الدعم.",
    back:               "رجوع",
    changePassword:     "تغيير كلمة المرور",
    oldPassword:        "كلمة المرور الحالية",
    newPassword:        "كلمة المرور الجديدة",
    confirmNewPassword: "تأكيد كلمة المرور الجديدة",
    saving:             "جارٍ الحفظ...",
    processing:         "جارٍ المعالجة...",
    requiredFields:     "حقول مطلوبة",
    fillAllFields:      "يرجى ملء جميع الحقول",
    passwordTooShort:   "كلمة المرور قصيرة جداً",
    minSixCharsRequired:"يجب أن تكون 6 أحرف على الأقل",
    passwordSuccess:    "نجح",
    passwordSuccessDesc:"تم تغيير كلمة المرور بنجاح",
    currentPasswordPlaceholder: "كلمة المرور الحالية",
    newPasswordPlaceholder:     "كلمة المرور الجديدة",
    confirmNewPasswordPlaceholder: "تأكيد كلمة المرور الجديدة",
    noWithdrawals:      "لا توجد عمليات سحب حتى الآن",
    noTransactions:     "لا توجد معاملات حتى الآن",
    withdrawalHistory:  "سجل السحوبات",
    statusApproved:     "ناجح",
    statusPending:      "قيد الانتظار",
    statusRejected:     "مرفوض",
    invalidAmount:      "مبلغ غير صالح",
    minAmountPrefix:    "الحد الأدنى للمبلغ هو",
    addressRequired:    "العنوان مطلوب",
    selectUsdtWallet:   "يرجى اختيار عنوان USDT BEP20",
    walletHolderName:   "اسم صاحب الحساب",
    walletHolderNamePlaceholder: "أدخل اسم صاحب الحساب",
    walletAddressLabel: "عنوان محفظة BEP20",
    walletAddressInvalid: "عنوان BEP20 غير صالح (صيغة: 0x + 40 حرفاً)",
    walletHolderRequired: "اسم صاحب الحساب مطلوب",
    noDeposits:         "لا توجد إيداعات حتى الآن",
    depositOrders:      "طلبات الإيداع",
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

// Version the preference key so visitors who used an older default language
// are migrated to Chinese once. New selections are still remembered.
const STORAGE_KEY = "powerade_lang_v2";

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Lang | null;
      if (saved && saved in T) return saved;
    } catch {}
    return "zh";
  });

  const setLang = (l: Lang) => {
    setLangState(l);
    try { localStorage.setItem(STORAGE_KEY, l); } catch {}
  };

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);

  return (
    <I18nContext.Provider value={{ lang, setLang, t: T[lang] }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
