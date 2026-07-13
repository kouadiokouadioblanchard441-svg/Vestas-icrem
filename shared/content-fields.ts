// Registry of admin-editable text content shown across the client app.
// Each field is stored as a key in the generic `platformSettings` key/value
// table (reusing the existing /api/settings + /api/admin/settings endpoints),
// so adding a new field here is all that's needed to make it editable from
// Admin > Contenu — no backend changes required.
//
// `key` is the settings key used everywhere (client pages read it with a
// fallback to `defaultValue`, matching the text that used to be hardcoded).

export interface ContentField {
  key: string;
  label: string;
  defaultValue: string;
  multiline?: boolean;
}

export interface ContentGroup {
  id: string;
  title: string;
  fields: ContentField[];
}

export const CONTENT_GROUPS: ContentGroup[] = [
  {
    id: "home",
    title: "Accueil — Pop-up de notification",
    fields: [
      { key: "content_home_popupTitle", label: "Titre du pop-up", defaultValue: "NOTIFICATION" },
      { key: "content_home_popupLine1", label: "Ligne 1", defaultValue: "Prime d'inscription : 500 FCFA.", multiline: true },
      { key: "content_home_popupLine2", label: "Ligne 2", defaultValue: "Récompense de connexion quotidienne : 50 FCFA.", multiline: true },
      { key: "content_home_popupLine3", label: "Ligne 3", defaultValue: "Invitez vos subordonnés à investir et recevez une récompense en espèces de 15% du montant de leur investissement.", multiline: true },
      { key: "content_home_popupLine4", label: "Ligne 4", defaultValue: "Il n'y a aucune limite quant au temps de retrait ou au nombre de retraits. Vous pouvez retirer de l'argent à tout moment.", multiline: true },
      { key: "content_home_popupLine5", label: "Ligne 5", defaultValue: "SpolarPV attache une grande importance au marché.", multiline: true },
    ],
  },
  {
    id: "rules",
    title: "Pop-up « Règles de la plateforme »",
    fields: [
      { key: "content_rules_title", label: "Titre du pop-up", defaultValue: "Règles de la plateforme" },
      { key: "content_rules_section1Title", label: "Titre section 1", defaultValue: "1. Dépôts" },
      { key: "content_rules_section1Body", label: "Contenu section 1", defaultValue: "- Montant minimum : 4 000 FCFA\n- Les dépôts sont traités dans les plus brefs délais\n- Assurez-vous que les informations de paiement sont correctes", multiline: true },
      { key: "content_rules_section2Title", label: "Titre section 2", defaultValue: "2. Retraits" },
      { key: "content_rules_section2Body", label: "Contenu section 2", defaultValue: "- Montant minimum : 1 500 FCFA\n- Frais de retrait : 18%\n- Horaires : 9h - 17h\n- Maximum 1 retrait(s) par jour\n- Un produit actif est requis pour retirer\n- Un portefeuille de retrait doit être enregistré", multiline: true },
      { key: "content_rules_section3Title", label: "Titre section 3", defaultValue: "3. Produits" },
      { key: "content_rules_section3Body", label: "Contenu section 3", defaultValue: "- Cycle standard : 80 jours\n- Gains journaliers automatiques\n- Les gains sont crédités 24h après l'achat\n- Produit gratuit : réclamez 50 FCFA/jour", multiline: true },
      { key: "content_rules_section4Title", label: "Titre section 4", defaultValue: "4. Parrainage" },
      { key: "content_rules_section4Body", label: "Contenu section 4", defaultValue: "- Niveau 1 : 15% de commission\n- Niveau 2 : 2% de commission\n- Niveau 3 : 1% de commission\n- Commissions sur les achats de produits", multiline: true },
      { key: "content_rules_section5Title", label: "Titre section 5", defaultValue: "5. Bonus d'inscription" },
      { key: "content_rules_section5Body", label: "Contenu section 5", defaultValue: "Chaque nouveau membre reçoit 500 FCFA de bonus à l'inscription.", multiline: true },
    ],
  },
  {
    id: "team",
    title: "Équipe / Parrainage",
    fields: [
      { key: "content_team_headerTitle", label: "Titre de la page", defaultValue: "Mon équipe" },
      { key: "content_team_taskCenterButton", label: "Bouton « Centre des tâches »", defaultValue: "Aller au Centre des Tâches >" },
      { key: "content_team_inviteTitle", label: "Titre « Inviter des amis »", defaultValue: "Inviter des amis" },
      { key: "content_team_progressTitle", label: "Titre « Ma progression »", defaultValue: "Ma progression" },
      { key: "content_team_howItWorksTitle", label: "Titre « Comment fonctionne le parrainage »", defaultValue: "Comment fonctionne le parrainage" },
      { key: "content_team_tip", label: "Texte du conseil (💡) en bas de page", defaultValue: "Plus votre équipe s'agrandit sur les 3 niveaux, plus vos revenus de parrainage augmentent chaque fois qu'un membre investit.", multiline: true },
    ],
  },
  {
    id: "tasks",
    title: "Centre de tâches (page /tasks)",
    fields: [
      { key: "content_tasks_headerTitle", label: "Titre", defaultValue: "Programme de Parrainage" },
      { key: "content_tasks_headerSubtitle", label: "Sous-titre", defaultValue: "Invitez des amis et gagnez des récompenses" },
      { key: "content_tasks_tiersTitle", label: "Titre « Paliers de parrainage »", defaultValue: "Paliers de parrainage" },
      { key: "content_tasks_claimAllButton", label: "Bouton « Tout réclamer »", defaultValue: "Tout réclamer" },
    ],
  },
  {
    id: "salarybonus",
    title: "Centre des tâches (page /salary-bonus)",
    fields: [
      { key: "content_salarybonus_headerTitle", label: "Titre de la page", defaultValue: "Centre des tâches" },
    ],
  },
  {
    id: "checkin",
    title: "Pointage quotidien",
    fields: [
      { key: "content_checkin_headerTitle", label: "Titre de la page", defaultValue: "Pointage" },
      { key: "content_checkin_cardTitle", label: "Titre de la carte", defaultValue: "Pointage quotidien" },
      { key: "content_checkin_cardSubtitle", label: "Sous-titre de la carte", defaultValue: "Activer les récompenses quotidiennes" },
      { key: "content_checkin_dailyRewardLabel", label: "Libellé « Récompense du jour »", defaultValue: "Récompense du jour" },
      { key: "content_checkin_streakLabel", label: "Libellé « Jours consécutifs »", defaultValue: "Jours consécutifs" },
      { key: "content_checkin_totalLabel", label: "Libellé « Récompenses cumulées »", defaultValue: "Récompenses cumulées" },
      { key: "content_checkin_rule1", label: "Règle 1", defaultValue: "1. Récompense de connexion quotidienne : 50 FCFA", multiline: true },
      { key: "content_checkin_rule2", label: "Règle 2", defaultValue: "2. Connectez-vous une fois par jour pour accumuler des points.", multiline: true },
    ],
  },
  {
    id: "giftcode",
    title: "Code Bonus",
    fields: [
      { key: "content_giftcode_headerTitle", label: "Titre de la page", defaultValue: "Code Bonus" },
      { key: "content_giftcode_infoLine1", label: "Texte d'information 1", defaultValue: "Entrez votre code bonus pour recevoir votre récompense instantanément", multiline: true },
      { key: "content_giftcode_infoLine2", label: "Texte d'information 2", defaultValue: "Les codes sont disponibles chaque soir à 17h GMT", multiline: true },
      { key: "content_giftcode_howToTitle", label: "Titre « Comment obtenir des codes ? »", defaultValue: "Comment obtenir des codes ?", multiline: true },
      { key: "content_giftcode_step1", label: "Étape 1", defaultValue: "Rejoignez notre canal Telegram officiel", multiline: true },
      { key: "content_giftcode_step2", label: "Étape 2", defaultValue: "Suivez les annonces chaque soir à 17h GMT", multiline: true },
      { key: "content_giftcode_step3", label: "Étape 3", defaultValue: "Copiez le code et collez-le ici avant expiration", multiline: true },
    ],
  },
  {
    id: "orders",
    title: "Mes commandes",
    fields: [
      { key: "content_orders_headerTitle", label: "Titre de la page", defaultValue: "Mes commandes" },
      { key: "content_orders_infoLine1", label: "Texte d'information 1", defaultValue: "Les revenus du produit sont credites automatiquement une fois toutes les 24 heures.", multiline: true },
      { key: "content_orders_infoLine2", label: "Texte d'information 2", defaultValue: "Vous pouvez acheter plusieurs machines pour augmenter vos revenus.", multiline: true },
    ],
  },
  {
    id: "products",
    title: "Nos Produits",
    fields: [
      { key: "content_products_headerTitle", label: "Titre de la page", defaultValue: "Nos Produits" },
    ],
  },
  {
    id: "deposit",
    title: "Page Dépôt / Recharge",
    fields: [
      { key: "content_deposit_infoText", label: "Texte d'information principal", defaultValue: "Les services de dépôt sont disponibles 24h/24 et 7j/7. Le dépôt minimum est indiqué ci-dessus, sans limite maximale.", multiline: true },
      { key: "content_deposit_warning1", label: "Avertissement 1 (captures d'écran)", defaultValue: "Remarque importante : Ne divulguez à personne les captures d'écran de vos dépôts ni vos identifiants de transaction, car cela pourrait entraîner le vol de vos fonds.", multiline: true },
      { key: "content_deposit_warning2", label: "Avertissement 2 (problèmes dépôt)", defaultValue: "Pour tout problème lié à vos dépôts, veuillez contacter immédiatement le service client de la plateforme.", multiline: true },
      { key: "content_deposit_instruction1", label: "Instruction 1", defaultValue: "1. Le dépôt minimum est défini dans les paramètres de la plateforme.", multiline: true },
      { key: "content_deposit_instruction2", label: "Instruction 2", defaultValue: "2. Veuillez vérifier attentivement les informations de votre compte avant d'effectuer un transfert afin d'éviter toute erreur de paiement.", multiline: true },
    ],
  },
  {
    id: "withdrawal",
    title: "Page Retrait",
    fields: [
      { key: "content_withdrawal_ctaButton", label: "Texte du bouton de retrait", defaultValue: "Retirez votre argent maintenant" },
      { key: "content_withdrawal_instructionsTitle", label: "Titre section instructions", defaultValue: "Instructions de retrait" },
      { key: "content_withdrawal_instruction1", label: "Instruction 1", defaultValue: "1. Le montant minimum de retrait est défini dans les paramètres de la plateforme.", multiline: true },
      { key: "content_withdrawal_instruction2", label: "Instruction 2", defaultValue: "2. Il n'y a pas de limite de temps pour les retraits, mais une limite de trois retraits par jour est autorisée.", multiline: true },
      { key: "content_withdrawal_instruction3", label: "Instruction 3", defaultValue: "3. Des frais de traitement seront appliqués sur chaque retrait (voir paramètres).", multiline: true },
      { key: "content_withdrawal_instruction4", label: "Instruction 4", defaultValue: "4. Les retraits seront disponibles sous 2 heures, et exceptionnellement sous 24 heures.", multiline: true },
      { key: "content_withdrawal_instruction5", label: "Instruction 5", defaultValue: "5. Si le retrait échoue, vérifiez que vos informations bancaires sont correctes, puis soumettez à nouveau la demande.", multiline: true },
      { key: "content_withdrawal_instruction6", label: "Instruction 6", defaultValue: "6. Effectuez votre première recharge et achetez des produits SpolarPV pour activer la fonction de retrait.", multiline: true },
      { key: "content_withdrawal_warningNoHours", label: "Avertissement hors horaires", defaultValue: "⏰ Retraits fermés actuellement. Réessayez pendant les horaires indiqués.", multiline: true },
      { key: "content_withdrawal_warningNoProduct", label: "Avertissement sans produit actif", defaultValue: "⚠️ Vous devez avoir un produit actif pour effectuer un retrait.", multiline: true },
    ],
  },
  {
    id: "about",
    title: "Page À propos",
    fields: [
      { key: "content_about_pageTitle", label: "Titre de la page", defaultValue: "A propos de nous" },
      { key: "content_about_s1Title", label: "Titre section 1", defaultValue: "Qui sommes-nous ?" },
      { key: "content_about_s1Text1", label: "Paragraphe 1", defaultValue: "SpolarPV est le leader mondial du secteur de l'énergie solaire. L'entreprise conçoit, fabrique, installe et entretient des panneaux solaires terrestres et des solutions énergétiques dans le monde entier.", multiline: true },
      { key: "content_about_s1Text2", label: "Paragraphe 2", defaultValue: "Grâce à notre expertise et à notre réseau mondial, nous offrons à nos utilisateurs des opportunités uniques de générer des revenus quotidiens en participant au financement et à l'expansion de la marque SpolarPV à l'échelle internationale.", multiline: true },
      { key: "content_about_s2Title", label: "Titre section 2", defaultValue: "🏭 Fabrication et Installation" },
      { key: "content_about_s2Text", label: "Contenu section 2", defaultValue: "Conception de panneaux solaires : Développement de solutions photovoltaïques de haute technologie adaptées à différents climats et conditions d'ensoleillement. SpolarPV produit industriellement les modules, les onduleurs et les composants clés de chaque installation.", multiline: true },
      { key: "content_about_s3Title", label: "Titre section 3", defaultValue: "Notre héritage" },
      { key: "content_about_s3Text", label: "Contenu section 3", defaultValue: "Aujourd'hui, SpolarPV est présente dans plus de 80 pays avec des milliers d'installations solaires à travers le monde, devenant ainsi la marque référence de l'énergie renouvelable à l'échelle internationale.", multiline: true },
      { key: "content_about_s4Title", label: "Titre section 4", defaultValue: "Sécurité et Fiabilité" },
      { key: "content_about_s4Text", label: "Contenu section 4", defaultValue: "La sécurité de vos fonds et la transparence de nos opérations sont nos priorités absolues. L'empreinte de SpolarPV dans le domaine de l'énergie solaire illustre parfaitement la capacité d'une entreprise à conjuguer qualité, innovation et stratégie de marque pérenne.", multiline: true },
    ],
  },
  {
    id: "service",
    title: "Page Service client",
    fields: [
      { key: "content_service_pageTitle", label: "Titre de la page", defaultValue: "Service client" },
      { key: "content_service_withdrawalHoursText", label: "Texte horaires de retrait", defaultValue: "Heures de retrait : 24h." },
      { key: "content_service_supportHoursLabel", label: "Libellé horaires service client", defaultValue: "Horaires du service client :" },
    ],
  },
  {
    id: "rulespage",
    title: "Page Règles de la plateforme",
    fields: [
      { key: "content_rulespage_pageTitle", label: "Titre de la page", defaultValue: "Règles de la plateforme" },
      { key: "content_rulespage_s1Title", label: "Titre section 1", defaultValue: "1. Investissement" },
      { key: "content_rulespage_s1b1", label: "Section 1 — Règle 1", defaultValue: "Chaque utilisateur peut posséder plusieurs produits d'investissement simultanément.", multiline: true },
      { key: "content_rulespage_s1b2", label: "Section 1 — Règle 2", defaultValue: "Les revenus sont générés quotidiennement et accrédités sur votre solde de compte toutes les 24 heures.", multiline: true },
      { key: "content_rulespage_s1b3", label: "Section 1 — Règle 3", defaultValue: "Le cycle d'investissement standard est de 80 jours, sauf indication contraire pour les produits spéciaux.", multiline: true },
      { key: "content_rulespage_s2Title", label: "Titre section 2", defaultValue: "2. Dépôts et Retraits" },
      { key: "content_rulespage_s3Title", label: "Titre section 3", defaultValue: "3. Système de Parrainage" },
      { key: "content_rulespage_s3b4", label: "Section 3 — Règle anti-fraude", defaultValue: "Les activités frauduleuses ou la création de comptes multiples pour manipuler le système entraîneront la suspension du compte.", multiline: true },
      { key: "content_rulespage_s4Title", label: "Titre section 4", defaultValue: "4. Bonus d'inscription" },
      { key: "content_rulespage_s5Title", label: "Titre section 5", defaultValue: "5. Sécurité" },
      { key: "content_rulespage_s5b1", label: "Section 5 — Règle 1", defaultValue: "Vous êtes responsable de la sécurité de votre mot de passe.", multiline: true },
      { key: "content_rulespage_s5b2", label: "Section 5 — Règle 2", defaultValue: "Ne partagez jamais vos identifiants de connexion avec des tiers.", multiline: true },
      { key: "content_rulespage_s5b3", label: "Section 5 — Règle 3", defaultValue: "Le service client officiel ne vous demandera jamais votre mot de passe.", multiline: true },
    ],
  },
];

export const ALL_CONTENT_FIELDS: ContentField[] = CONTENT_GROUPS.flatMap(g => g.fields);
