import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { products } from "../shared/schema.ts";
import { asc, eq } from "drizzle-orm";
import { getDatabaseConfig } from "../server/database-config.ts";

async function main() {
  const config = getDatabaseConfig(process.env);
  const pool = new pg.Pool({ connectionString: config.connectionString, ssl: config.ssl });
  const db = drizzle(pool);

  // 7 unique images — one per VIP product, no repeats
  const images = [
    "/powerbank-1.jpg",
    "/powerbank-2.jpg",
    "/powerbank-3.jpg",
    "/powerbank-4.jpg",
    "/powerbank-5.jpg",
    "/powerbank-6.jpg",
    "/powerbank-7.jpg",
  ];

  const all = await db
    .select({ id: products.id, name: products.name, sortOrder: products.sortOrder })
    .from(products)
    .orderBy(asc(products.sortOrder));

  console.log(`Produits trouvés: ${all.length}`);
  for (let i = 0; i < all.length; i++) {
    const img = images[i] ?? images[images.length - 1];
    await db.update(products).set({ imageUrl: img }).where(eq(products.id, all[i].id));
    console.log(`${all[i].name} → ${img}`);
  }

  await pool.end();
  console.log("✓ Images mises à jour");
}

main().catch(console.error);
