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
  GN: "Guinée",
  NG: "Nigeria",
};

export function getWestpayCountry(countryCode: string): string | null {
  return COUNTRY_MAP[countryCode] || null;
}

/**
 * Returns the per-country API key from environment variables.
 * e.g. WESTPAY_KEY_CM, WESTPAY_KEY_BF, etc.
 * Only used for server-to-server withdrawal transfers (X-API-KEY header),
 * NOT for the hosted deposit page — that only needs the merchant slug.
 */
export function getCountryApiKey(countryCode: string): string | null {
  return process.env[`WESTPAY_KEY_${countryCode.toUpperCase()}`] || null;
}

/**
 * Build the hosted WestPay payment (deposit) URL.
 * Per WestPay's API docs, the hosted /pay page only accepts:
 * merchant, amount, country (optional), redirect (optional).
 * It does NOT take an api_key — that's reserved for the merchant-auth'd
 * endpoints (JWT or X-API-KEY header on /api/merchant/transfer). Putting a
 * secret key in a client-facing redirect URL would also leak it via browser
 * history / referrer headers, so it must never be included here.
 * redirectUrl is where WestPay sends the user back after payment, with
 * ?status=success|failed&amount=XXX&ref=OP-abc appended.
 */
export function buildPaymentUrl(
  merchantSlug: string,
  amount: number,
  countryCode: string,
  redirectUrl: string
): string {
  const url = new URL(`${WESTPAY_BASE}/pay`);
  url.searchParams.set("merchant", merchantSlug);
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
