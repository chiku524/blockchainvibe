import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import {
  SEO_DEFAULTS,
  getMetadataForRoute,
} from '../config/seo';

const BASE = SEO_DEFAULTS.baseUrl;
const SITE = SEO_DEFAULTS.siteName;
const IMAGE = SEO_DEFAULTS.defaultImage;
const TWITTER = SEO_DEFAULTS.twitterHandle;
const LOCALE = SEO_DEFAULTS.locale;

/**
 * Build full page title: "Page Title | BlockchainVibe" (unless title already contains site name).
 */
function buildTitle(title) {
  if (!title) return SITE;
  if (title.includes(SITE)) return title;
  return `${title} | ${SITE}`;
}

/**
 * Build full URL (absolute).
 */
function buildUrl(path) {
  if (!path) return BASE;
  if (path.startsWith('http')) return path;
  return path.startsWith('/') ? `${BASE}${path}` : `${BASE}/${path}`;
}

/**
 * Dynamic metadata layout: provides accurate SEO for each page.
 * - Uses route-based defaults from config/seo.js.
 * - Any prop overrides the default for this page.
 * - Use once per page (or in a layout that wraps route content).
 *
 * @param {string} [title] - Page title (default from route)
 * @param {string} [description] - Meta description
 * @param {string} [keywords] - Meta keywords
 * @param {string} [image] - OG/Twitter image URL
 * @param {string} [canonicalPath] - Canonical path (e.g. '/news') or full URL
 * @param {boolean} [noIndex] - Set robots to noindex,nofollow
 * @param {object} [jsonLd] - JSON-LD script (single object or array)
 * @param {string} [ogType] - Open Graph type: 'website' | 'article'
 */
function PageMeta({
  title,
  description,
  keywords,
  image,
  canonicalPath,
  noIndex,
  jsonLd,
  ogType = 'website',
}) {
  const location = useLocation();
  const pathname = location.pathname;
  const routeMeta = getMetadataForRoute(pathname);

  const finalTitle = buildTitle(title ?? routeMeta.title);
  const finalDescription = description ?? routeMeta.description ?? '';
  const finalKeywords = keywords ?? routeMeta.keywords ?? '';
  const finalImage = image ?? IMAGE;
  const finalUrl = canonicalPath != null
    ? buildUrl(canonicalPath)
    : buildUrl(routeMeta.url ?? pathname);
  const finalNoIndex = noIndex ?? routeMeta.noIndex ?? false;
  const finalOgType = routeMeta.ogType ?? ogType;

  return (
    <Helmet>
      <title>{finalTitle}</title>
      <meta name="title" content={finalTitle} />
      <meta name="description" content={finalDescription} />
      {finalKeywords && <meta name="keywords" content={finalKeywords} />}
      <meta name="author" content={SITE} />
      <meta name="robots" content={finalNoIndex ? 'noindex, nofollow' : 'index, follow'} />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />

      <meta property="og:type" content={finalOgType} />
      <meta property="og:url" content={finalUrl} />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:image" content={finalImage.startsWith('http') ? finalImage : `${BASE}${finalImage}`} />
      <meta property="og:site_name" content={SITE} />
      <meta property="og:locale" content={LOCALE} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={finalUrl} />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={finalImage.startsWith('http') ? finalImage : `${BASE}${finalImage}`} />
      <meta name="twitter:creator" content={TWITTER} />
      <meta name="twitter:site" content={TWITTER} />

      <meta name="theme-color" content={SEO_DEFAULTS.themeColor} />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="apple-mobile-web-app-title" content={SITE} />

      <link rel="canonical" href={finalUrl} />

      <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      <link rel="icon" type="image/png" sizes="32x32" href="/logo.png" />
      <link rel="icon" type="image/png" sizes="192x192" href="/logo192.png" />
      <link rel="apple-touch-icon" sizes="180x180" href="/logo.png" />

      {jsonLd != null && (
        <script type="application/ld+json">
          {JSON.stringify(Array.isArray(jsonLd) ? jsonLd : jsonLd)}
        </script>
      )}
    </Helmet>
  );
}

export default PageMeta;
export { buildTitle, buildUrl };
