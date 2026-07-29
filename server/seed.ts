import { db } from "./db";
import { users, products, tasks, paymentChannels, platformSettings, companyContent, countries, stakingProducts } from "@shared/schema";
import bcrypt from "bcryptjs";
import { eq, sql } from "drizzle-orm";

export async function seed() {
  console.log("Seeding database...");

  // Create session table for connect-pg-simple (if not exists)
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "session" (
      "sid" varchar NOT NULL COLLATE "default",
      "sess" json NOT NULL,
      "expire" timestamp(6) NOT NULL,
      CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE
    ) WITH (OIDS=FALSE)
  `);
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire")
  `);

  // Company page content blocks (admin-editable)
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "company_content" (
      "id" serial PRIMARY KEY,
      "title" text NOT NULL,
      "body" text NOT NULL DEFAULT '',
      "image_url" text,
      "sort_order" integer NOT NULL DEFAULT 0,
      "is_active" boolean NOT NULL DEFAULT true,
      "created_at" timestamp NOT NULL DEFAULT now(),
      "updated_at" timestamp
    )
  `);
  const existingCompanyContent = await db.select({ id: companyContent.id }).from(companyContent).limit(1);
  if (existingCompanyContent.length === 0) {
    await db.insert(companyContent).values([
      {
        title: "我们是谁？",
        body: "了解我们的公司、愿景以及为客户提供的解决方案。",
        sortOrder: 1,
        isActive: true,
      },
      {
        title: "投资计划",
        body: "这里提供投资计划、相关条件以及平台机会的详细信息。",
        sortOrder: 2,
        isActive: true,
      },
      {
        title: "我们的承诺",
        body: "我们重视透明度、服务质量，并为每一位会员提供支持。",
        sortOrder: 3,
        isActive: true,
      },
    ]);
    console.log("Company content initialized");
  }

  // Ensure countries table exists
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "countries" (
      "id" serial PRIMARY KEY,
      "code" text NOT NULL UNIQUE,
      "name" text NOT NULL,
      "currency" text NOT NULL,
      "phone_prefix" text NOT NULL,
      "operators" text NOT NULL DEFAULT '[]',
      "is_active" boolean NOT NULL DEFAULT true
    )
  `);

  // Check if admin already exists
  const adminPhone = "0501682811";
  const existingAdmin = await db.select().from(users).where(eq(users.phone, adminPhone));
  const adminPassword = process.env.ADMIN_PASSWORD || "58002085";
  // Keep the current PIN when no secure override is configured.
  // This prevents every restart from silently replacing an admin's PIN.
  const adminPin = process.env.ADMIN_PIN || existingAdmin[0]?.adminPin || "9993";

  if (existingAdmin.length === 0) {
    const hashedPassword = await bcrypt.hash(adminPassword, 12);
    await db.insert(users).values({
      fullName: "Super Admin",
      phone: adminPhone,
      country: "CM",
      password: hashedPassword,
      referralCode: "ADMIN1",
      balance: "0",
      isAdmin: true,
      isSuperAdmin: true,
      adminPin,
    });
    console.log("Super admin created");
  } else {
    // Always ensure correct country and up-to-date password
    const hashedPassword = await bcrypt.hash(adminPassword, 12);
    await db.update(users)
      .set({ password: hashedPassword, isAdmin: true, isSuperAdmin: true, adminPin })
      .where(eq(users.phone, adminPhone));
    console.log("Super admin updated");
  }

  // Seed/update countries (CM, BF, BJ)
  const requiredCountries = [
    {
      code: "CM",
      name: "Cameroun",
      currency: "USDT",
      phonePrefix: "237",
      operators: JSON.stringify(["Orange Cameroun", "MTN Cameroun"]),
      isActive: true,
      autoPaymentEnabled: true,
    },
    {
      code: "BF",
      name: "Burkina Faso",
      currency: "USDT",
      phonePrefix: "226",
      operators: JSON.stringify(["Orange Burkina", "Moov Africa Burkina"]),
      isActive: true,
      autoPaymentEnabled: true,
    },
    {
      code: "BJ",
      name: "Benin",
      currency: "USDT",
      phonePrefix: "229",
      operators: JSON.stringify(["MTN Benin", "Moov Africa Benin"]),
      isActive: true,
      autoPaymentEnabled: true,
    },
    {
      code: "CI",
      name: "Côte d'Ivoire",
      currency: "USDT",
      phonePrefix: "225",
      operators: JSON.stringify(["Orange CI", "MTN CI", "Moov Africa CI"]),
      isActive: true,
      autoPaymentEnabled: true,
    },
    {
      code: "TG",
      name: "Togo",
      currency: "USDT",
      phonePrefix: "228",
      operators: JSON.stringify(["Togocel", "Moov Africa Togo"]),
      isActive: true,
      autoPaymentEnabled: true,
    },
  ];

  // Remove old countries no longer in the list (e.g. Tchad/Niger, discontinued)
  const activeCodes = requiredCountries.map(c => c.code);
  const allCountries = await db.select().from(countries);
  for (const c of allCountries) {
    if (!activeCodes.includes(c.code)) {
      await db.delete(countries).where(eq(countries.code, c.code));
      console.log(`Country removed: ${c.name}`);
    }
  }

  for (const countryData of requiredCountries) {
    const existing = await db.select().from(countries).where(eq(countries.code, countryData.code));
    if (existing.length === 0) {
      await db.insert(countries).values(countryData);
      console.log(`Country added: ${countryData.name}`);
    } else {
      await db.update(countries).set({
        name: countryData.name,
        currency: countryData.currency,
        phonePrefix: countryData.phonePrefix,
        operators: countryData.operators,
        isActive: countryData.isActive,
      }).where(eq(countries.code, countryData.code));
      console.log(`Country updated: ${countryData.name}`);
    }
  }

  // Remove free products and obsolete settings from DB if any still exist (migration)
  await db.delete(products).where(eq(products.isFree, true));
  await db.delete(platformSettings).where(eq(platformSettings.key, "signupBonus"));

  // Seed products only if table is empty (first install only — never overwrite admin changes)
  const existingProducts = await db.select().from(products);
  if (existingProducts.filter(p => !p.isFree).length === 0) {
    const defaultProducts = [
      { name: "VIP 1", price: 4000,   dailyEarnings: 300,   cycleDays: 360, totalReturn: 108000,    imageUrl: '/powerbank-1.jpg', sortOrder: 1 },
      { name: "VIP 2", price: 10000,  dailyEarnings: 800,   cycleDays: 360, totalReturn: 288000,    imageUrl: '/powerbank-2.jpg', sortOrder: 2 },
      { name: "VIP 3", price: 15000,  dailyEarnings: 1500,  cycleDays: 360, totalReturn: 540000,    imageUrl: '/powerbank-3.jpg', sortOrder: 3 },
      { name: "VIP 4", price: 25000,  dailyEarnings: 2000,  cycleDays: 360, totalReturn: 720000,    imageUrl: '/powerbank-4.jpg', sortOrder: 4 },
      { name: "VIP 5", price: 40000,  dailyEarnings: 3500,  cycleDays: 360, totalReturn: 1260000,   imageUrl: '/powerbank-5.jpg', sortOrder: 5 },
      { name: "VIP 6", price: 100000, dailyEarnings: 10000, cycleDays: 360, totalReturn: 3600000,   imageUrl: '/powerbank-6.jpg', sortOrder: 6 },
      { name: "VIP 7", price: 250000, dailyEarnings: 30000, cycleDays: 360, totalReturn: 10800000,  imageUrl: '/powerbank-7.jpg', sortOrder: 7 },
      { name: "VIP 8", price: 600,    dailyEarnings: 60,    cycleDays: 360, totalReturn: 21600,     imageUrl: '/powerbank-8.jpg', sortOrder: 8 },
      { name: "VIP 9", price: 1000,   dailyEarnings: 120,   cycleDays: 360, totalReturn: 43200,     imageUrl: '/powerbank-9.jpg', sortOrder: 9 },
    ];
    await db.insert(products).values(defaultProducts);
    console.log("Products seeded (first install)");
  } else {
    console.log(`Products skipped — ${existingProducts.length} existing products preserved`);
  }

  // Seed tasks — migrate to new 4-reward parrainage structure if needed
  const existingTasks = await db.select().from(tasks);
  const newRewardTasks = [
    { name: "🎁 Récompense 1", description: "3 membres actifs requis",  requiredInvites: 3,  reward: 1000,  sortOrder: 1 },
    { name: "🎁 Récompense 2", description: "10 membres actifs requis", requiredInvites: 10, reward: 3000,  sortOrder: 2 },
    { name: "🎁 Récompense 3", description: "30 membres actifs requis", requiredInvites: 30, reward: 5000,  sortOrder: 3 },
    { name: "🎁 Récompense 4", description: "50 membres actifs requis", requiredInvites: 50, reward: 10000, sortOrder: 4 },
  ];
  // Detect old structure (legacy task names like "Parrain Bronze")
  const hasLegacyTasks = existingTasks.some(t => t.name.startsWith("Parrain "));
  if (existingTasks.length === 0 || hasLegacyTasks) {
    if (hasLegacyTasks) {
      // Remove old tasks (user_tasks FK rows are preserved; only tasks without claims are removed cleanly)
      await db.delete(tasks);
    }
    await db.insert(tasks).values(newRewardTasks);
    console.log("Reward tasks seeded (new 4-reward structure)");
  } else {
    console.log(`Tasks skipped — ${existingTasks.length} existing tasks preserved`);
  }

  // Check if payment channels exist
  const existingChannels = await db.select().from(paymentChannels);
  if (existingChannels.length === 0) {
    await db.insert(paymentChannels).values([
      { name: "LeekPay", redirectUrl: "https://leekpay.com/pay", isApi: false },
      { name: "FedaPay", redirectUrl: "https://fedapay.com/payment", isApi: false },
    ]);
    console.log("Payment channels seeded");
  }

  // Check if settings exist - apply new values for new keys or update existing
  const existingSettings = await db.select().from(platformSettings);
  const requiredSettings = [
    { key: "supportLink", value: "https://t.me/vestasgroup" },
    { key: "supportType", value: "telegram" },
    { key: "supportLabel", value: "客服" },
    { key: "support2Link", value: "https://t.me/vestasgroup" },
    { key: "support2Type", value: "telegram" },
    { key: "support2Label", value: "客服2" },
    { key: "channelLink", value: "https://t.me/vestasgroup" },
    { key: "channelType", value: "telegram" },
    { key: "channelLabel", value: "官方频道" },
    { key: "groupLink", value: "https://t.me/vestasgroup" },
    { key: "groupType", value: "telegram" },
    { key: "groupLabel", value: "讨论群" },
    { key: "popupButtonLabel", value: "点击加入Telegram群组" },
    { key: "supportEnabled", value: "true" },
    { key: "support2Enabled", value: "true" },
    { key: "channelEnabled", value: "true" },
    { key: "groupEnabled", value: "true" },
    { key: "minDeposit", value: "3000" },
    { key: "depositPresetAmounts", value: "3500,5000,7000,10000,15000,20000,50000,70000" },
    { key: "minWithdrawal", value: "1000" },
    { key: "withdrawalEnabled", value: "true" },
    { key: "withdrawalMode", value: "manual" },
    { key: "withdrawalFees", value: "15" },
    { key: "withdrawalStartHour", value: "9" },
    { key: "withdrawalEndHour", value: "17" },
    { key: "maxWithdrawalsPerDay", value: "1" },
    { key: "level1Commission", value: "25" },
    { key: "level2Commission", value: "1" },
    { key: "level3Commission", value: "1" },
    { key: "soleaspayEnabled", value: "false" },
    { key: "soleaspayCountries", value: "" },
    { key: "soleaspayChannelName", value: "Soleaspay" },
    { key: "omnipayEnabled", value: "false" },
    { key: "omnipayChannelName", value: "OmniPay" },
    { key: "omnipayCallbackKey", value: "" },
  ];

  for (const settingData of requiredSettings) {
    const existing = existingSettings.find(s => s.key === settingData.key);
    if (!existing) {
      await db.insert(platformSettings).values(settingData);
      // Never print configuration values: some settings contain webhook
      // secrets or callback keys.
      console.log(`Setting added: ${settingData.key}`);
    } else {
      // Never print configuration values: some settings contain webhook
      // secrets or callback keys.
      console.log(`Setting preserved: ${settingData.key}`);
    }
  }
  console.log("Settings check complete");

  // Seed staking products only if table is empty (first install only — never overwrite admin changes)
  const existingStakingProducts = await db.select().from(stakingProducts);
  if (existingStakingProducts.length === 0) {
    await db.insert(stakingProducts).values([
      { name: "Produit 1", description: "5% par jour pendant 3 jours. Capital récupérable à la fin.", price: 2000, returnAmount: 2300, lockDays: 3, isActive: true },
      { name: "Produit 2", description: "5% par jour pendant 7 jours. Capital récupérable à la fin.", price: 5000, returnAmount: 6750, lockDays: 7, isActive: true },
      { name: "Produit 3", description: "5% par jour pendant 12 jours. Capital récupérable à la fin.", price: 10000, returnAmount: 16000, lockDays: 12, isActive: true },
      { name: "Produit 4", description: "5% par jour pendant 16 jours. Capital récupérable à la fin.", price: 20000, returnAmount: 36000, lockDays: 16, isActive: true },
      { name: "Produit 5", description: "5% par jour pendant 20 jours. Capital récupérable à la fin.", price: 50000, returnAmount: 100000, lockDays: 20, isActive: true },
    ]);
    console.log("Staking products seeded (first install)");
  } else {
    console.log(`Staking products skipped — ${existingStakingProducts.length} existing staking products preserved`);
  }

  console.log("Database seeding complete!");
}
