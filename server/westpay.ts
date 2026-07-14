import crypto from "crypto";

const WESTPAY_BASE = "https://westpay.cfd";

/** Map our DB country codes to WestPay country name strings */
const COUNTRY_MAP: Record<string, string> = {
  CM: "Cameroun",
  BF: "Burkina Faso",
  BJ: "Benin",
  CI: "Cote d'Ivoire",
  TG: "Togo",
  SN: "Senegal",
  ML: "Mali",
  CG: "Congo Brazzaville",
  CD: "Congo RDC",
  GA: "Gabon",
  GN: "Guinee",
  NG: "Nigeria",
};

export function getWestpayCountry(countryCode: string): string | null {
  return COUNTRY_MAP[countryCode] || null;
}

/**
 * Per-country credentials loaded from environment variables.
 * WESTPAY_SLUG_CM  → merchant slug for Cameroun
 * WESTPAY_KEY_CM   → API key for Cameroun
 * etc.
 */
export interface WestpayCountryConfig {
  slug: string;
  apiKey: string;
}

export function getCountryConfig(countryCode: string): WestpayCountryConfig | null {
  const code = countryCode.toUpperCase();
  const slug = process.env[`WESTPAY_SLUG_${code}`];
  const apiKey = process.env[`WESTPAY_KEY_${code}`];
  if (!slug || !apiKey) return null;
  return { slug, apiKey };
}

/**
 * Build the hosted WestPay payment URL.
 * Uses the per-country merchant slug and API key.
 * redirectUrl is where WestPay sends the user back after payment, with
 * ?status=success|failed&amount=XXX&ref=OP-abc appended.
 */
export function buildPaymentUrl(
  config: WestpayCountryConfig,
  amount: number,
  countryCode: string,
  redirectUrl: string
): string {
  const url = new URL(`${WESTPAY_BASE}/pay`);
  url.searchParams.set("merchant", config.slug);
  url.searchParams.set("api_key", config.apiKey);
  url.searchParams.set("amount", amount.toString());
  const country = getWestpayCountry(countryCode);
  if (country) url.searchParams.set("country", country);
  url.searchParams.set("redirect", redirectUrl);
  return url.toString();
}

/**
 * Verify the HMAC-SHA256 signature sent by WestPay on webhook calls.
 * bodyStr = raw request body string (preserved by express.json verify callback in server/index.ts).
 * Matches the WestPay doc: HMAC-SHA256(rawBody, secret), constant-time comparison.
 */
export function verifyWebhookSignature(
  bodyStr: string,
  signature: string,
  secret: string
): boolean {
  try {
    const expected = crypto
      .createHmac("sha256", secret)
      .update(bodyStr)
      .digest("hex");

    // Both HMAC-SHA256 digests are exactly 64 hex chars = 32 bytes
    const sigBuf = Buffer.from(signature, "hex");
    const expBuf = Buffer.from(expected, "hex");

    // Guard: lengths must match before timingSafeEqual (throws if not)
    if (sigBuf.length !== expBuf.length || sigBuf.length === 0) {
      return false;
    }
    return crypto.timingSafeEqual(sigBuf, expBuf);
  } catch {
    return false;
  }
}
