// Helper to read admin-editable text content (see shared/content-fields.ts)
// from the /api/settings key-value map, falling back to the field's default.

export function getContent(
  settings: Record<string, string> | undefined,
  key: string,
  fallback: string
): string {
  const value = settings?.[key];
  // The product is currently Chinese-only. Keep administrator-entered Chinese
  // content, but hide legacy French/English values from older database seeds.
  return value !== undefined && value !== "" && /[\u3400-\u9fff]/.test(value)
    ? value
    : fallback;
}
