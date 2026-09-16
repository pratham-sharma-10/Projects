const ALLOWED_META_KEYS = new Set([
  'tool',
  'count',
  'status',
  'duration_ms',
  'database_initialized',
  'error_code'
]);

export function safeLog(enabled: boolean, event: string, metadata: Record<string, unknown> = {}): void {
  if (!enabled) return;
  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(metadata)) {
    if (ALLOWED_META_KEYS.has(key)) sanitized[key] = value;
  }
  process.stderr.write(`${JSON.stringify({ event, ...sanitized })}\n`);
}

export function redactForPreview(text: string, maxLength = 180): string {
  const compact = text.replace(/\s+/g, ' ').trim();
  return compact.length > maxLength ? `${compact.slice(0, maxLength)}…` : compact;
}
