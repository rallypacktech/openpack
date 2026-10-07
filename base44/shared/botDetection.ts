// Server-side bot detection.
//
// The quiz client sends its own is_bot flag, but that is advisory only — a
// scripted caller can set it to false. Deriving bot status from the request's
// User-Agent keeps automated traffic out of the public readiness map and the
// milestone statistics, and catches plain HTTP clients (curl, python-requests,
// node-fetch) that never claim to be a bot at all.
//
// The pattern list is declared inside the function on purpose: a module-level
// `const` in a shared module is not reliably initialized when the importing
// function runs, and a function-scoped list avoids that entirely.

/**
 * Detects whether a request came from a bot/crawler/script, based on its
 * User-Agent header.
 * @returns {{ isBot: boolean, botName: string|null }}
 */
export function detectBotFromUserAgent(userAgent) {
  const BOT_PATTERNS = [
    // Search engines
    /googlebot/i, /bingbot/i, /yandexbot/i, /baiduspider/i, /duckduckbot/i,
    /slurp/i, /applebot/i, /sogou/i, /exabot/i, /facebot/i,
    // Social media
    /facebookexternalhit/i, /twitterbot/i, /linkedinbot/i, /whatsapp/i,
    /telegrambot/i, /pinterest/i, /discordbot/i,
    // SEO / marketing
    /ahrefsbot/i, /semrushbot/i, /mj12bot/i, /dotbot/i, /petalbot/i,
    /bytespider/i, /seznambot/i, /dataforseobot/i,
    // AI / LLM crawlers
    /gptbot/i, /chatgpt/i, /ccbot/i, /claudebot/i, /anthropic-ai/i,
    /google-other/i, /imagesiftbot/i,
    // Generic crawler/spider (safe — real browser UAs don't contain these)
    /crawler/i, /spider/i, /scraper/i, /\bbot\b/i,
    // Headless / automated browsers
    /headlesschrome/i, /puppeteer/i, /selenium/i, /phantomjs/i, /webdriver/i,
    /lighthouse/i, /pagespeed/i, /wappalyzer/i,
    // Scripted HTTP clients — never sent by a real browser
    /python-requests/i, /python-urllib/i, /aiohttp/i, /httpx/i,
    /curl\//i, /wget/i, /libwww/i,
    /node-fetch/i, /axios/i, /undici/i, /okhttp/i, /go-http-client/i,
    /java\/\d/i, /httpclient/i, /postmanruntime/i, /scrapy/i,
  ];

  const ua = userAgent || '';
  for (const pattern of BOT_PATTERNS) {
    const match = ua.match(pattern);
    if (match) return { isBot: true, botName: match[0] };
  }
  return { isBot: false, botName: null };
}