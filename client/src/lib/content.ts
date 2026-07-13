// Helper to read admin-editable text content (see shared/content-fields.ts)
// from the /api/settings key-value map, falling back to the field's default.

export function getContent(
  settings: Record<string, string> | undefined,
  key: string,
  fallback: string
): string {
  const value = settings?.[key];
  return value !== undefined && value !== "" ? value : fallback;
}
