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
 * Returns the per-country API key from environment variables.
 * e.g. WESTPAY_KEY_CM, WESTPAY_KEY_BF, etc.
 */
export function getCountryApiKey(countryCode: string): string | null {
  return process.env[`WESTPAY_KEY_${countryCode.toUpperCase()}`] || null;
}

/**
 * Build the hosted WestPay payment URL.
 * One shared merchant slug, one API key per country.
 * redirectUrl is where WestPay sends the user back after payment, with
 * ?status=success|failed&amount=XXX&ref=OP-abc appended.
 */
export function buildPaymentUrl(
  merchantSlug: string,
  apiKey: string,
  amount: number,
  countryCode: string,
  redirectUrl: string
): string {
  const url = new URL(`${WESTPAY_BASE}/pay`);
  url.searchParams.set("merchant", merchantSlug);
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("amount", amount.toString());
  const country = getWestpayCountry(countryCode);
  if (country) url.searchParams.set("country", country);
  url.searchParams.set("redirect", redirectUrl);
  return url.toString();
}

/**
 * Verify the HMAC-SHA256 signature sent by WestPay on webhook calls.
 * bodyStr = raw request body string (preserved by express.json verify callback in server/index.ts).
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

    const sigBuf = Buffer.from(signature, "hex");
    const expBuf = Buffer.from(expected, "hex");

    if (sigBuf.length !== expBuf.length || sigBuf.length === 0) {
      return false;
    }
    return crypto.timingSafeEqual(sigBuf, expBuf);
  } catch {
    return false;
  }
}
