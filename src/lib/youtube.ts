export function extractYouTubeId(input: string | undefined | null): string | null {
  if (!input) return null;
  const raw = input.trim();
  if (!raw) return null;
  const idPattern = /^[a-zA-Z0-9_-]{11}$/;
  if (idPattern.test(raw)) return raw;
  try {
    const url = new URL(raw);
    const host = url.hostname.replace(/^www\./, '').toLowerCase();
    if (host === 'youtu.be') {
      const candidate = url.pathname.split('/').filter(Boolean)[0];
      if (candidate && idPattern.test(candidate)) return candidate;
    }
    if (
      host.endsWith('youtube.com') ||
      host.endsWith('youtube-nocookie.com')
    ) {
      const v = url.searchParams.get('v');
      if (v && idPattern.test(v)) return v;
      const parts = url.pathname.split('/').filter(Boolean);
      const candidates = new Set<string>();
      if (parts[0] === 'embed' && parts[1]) candidates.add(parts[1]);
      if (parts[0] === 'shorts' && parts[1]) candidates.add(parts[1]);
      if (parts[0] === 'live' && parts[1]) candidates.add(parts[1]);
      for (const c of candidates) {
        if (idPattern.test(c)) return c;
      }
    }
    const match = raw.match(/(?:v=|\/)([a-zA-Z0-9_-]{11})(?:[?&/]|$)/);
    if (match && idPattern.test(match[1])) return match[1];
  } catch {
    // not a URL; fall through
  }
  return null;
}


