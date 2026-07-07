// Bot detection patterns — known crawlers, SEO tools, AI scrapers, and headless browsers
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
  // Headless / automated
  /headlesschrome/i, /puppeteer/i, /selenium/i, /phantomjs/i, /webdriver/i,
  /lighthouse/i, /pagespeed/i, /wappalyzer/i,
];

/**
 * Detects whether the current visitor is a bot/crawler.
 * @returns {{ isBot: boolean, botName: string|null }}
 */
export function detectBot() {
  if (typeof navigator === "undefined") {
    return { isBot: false, botName: null };
  }

  const ua = navigator.userAgent || "";

  // navigator.webdriver is true for Selenium, Puppeteer, Playwright
  if (navigator.webdriver === true) {
    return { isBot: true, botName: "Headless Browser" };
  }

  if (/headlesschrome/i.test(ua)) {
    return { isBot: true, botName: "Headless Chrome" };
  }

  for (const pattern of BOT_PATTERNS) {
    const match = ua.match(pattern);
    if (match) {
      return { isBot: true, botName: match[0] };
    }
  }

  return { isBot: false, botName: null };
}

/**
 * Generates a stable session ID for bots based on their user-agent.
 * Same bot UA → same ID → server-side dedup ensures only 1 quiz result.
 * @returns {string}
 */
export function getStableBotId() {
  const ua = navigator.userAgent || "unknown";
  let hash = 0;
  for (let i = 0; i < ua.length; i++) {
    const char = ua.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `bot_${Math.abs(hash).toString(36)}`;
}