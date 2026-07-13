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
  TD: "Tchad",
  NE: "Niger",
};

export function getWestpayCountry(countryCode: string): string | null {
  return COUNTRY_MAP[countryCode] || null;
}

/**
 * Build the hosted WestPay payment URL.
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
 * bodyStr must be the raw request body as a string (not re-parsed JSON).
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
    // Use constant-time comparison to prevent timing attacks
    return crypto.timingSafeEqual(
      Buffer.from(signature.padEnd(64, "0"), "hex"),
      Buffer.from(expected.padEnd(64, "0"), "hex")
    );
  } catch {
    return false;
  }
}
