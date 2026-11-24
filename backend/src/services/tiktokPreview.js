// Fetches the preview of a TikTok video (thumbnail, title, author) with TikTok's public oEmbed API.
// Results are cached in memory for 1 hour so we don't call TikTok on every page view.
const CACHE_MS = 60 * 60 * 1000;
const cache = new Map(); // url -> { data, expiresAt }

async function getTikTokPreview(url) {
  const cached = cache.get(url);
  if (cached && cached.expiresAt > Date.now()) return cached.data;

  let data = null;
  try {
    const res = await fetch(`https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`, {
      signal: AbortSignal.timeout(4000), // never block the page more than 4 s
    });
    if (res.ok) {
      const json = await res.json();
      data = {
        thumbnailUrl: json.thumbnail_url || null,
        caption: json.title || null,
        author: json.author_name || null,
      };
    }
  } catch {
    // TikTok unreachable: the front end shows a placeholder instead of the thumbnail
  }
  // A failure is cached for 5 minutes only
  cache.set(url, { data, expiresAt: Date.now() + (data ? CACHE_MS : 5 * 60 * 1000) });
  return data;
}

module.exports = { getTikTokPreview };
