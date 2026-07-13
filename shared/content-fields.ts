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
];

export const ALL_CONTENT_FIELDS: ContentField[] = CONTENT_GROUPS.flatMap(g => g.fields);
