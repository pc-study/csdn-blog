'use strict';

/**
 * structured-data.js
 *
 * Hexo filter (after_render:html) that replaces or injects JSON-LD
 * structured data into rendered HTML pages, without modifying theme
 * files directly.
 *
 * The Butterfly theme outputs its own JSON-LD via structured_data.pug,
 * but it lacks several recommended fields (description, publisher,
 * mainEntityOfPage). This script replaces the theme's output with a
 * richer version:
 *
 *   - Post pages  -> Article schema (with publisher, description, etc.)
 *   - Homepage    -> WebSite schema (with author)
 *   - Other pages -> any existing JSON-LD from the theme is left as-is
 */

const AUTHOR_NAME = 'Lucifer三思而后行';
const SITE_URL    = 'https://pc-study.github.io/csdn-blog/';

hexo.extend.filter.register('after_render:html', function (str, data) {
  const { config } = this;
  const page = data.page || data;

  /**
   * Resolve a path to an absolute URL.
   * config.url already includes the subpath (e.g. https://host/csdn-blog),
   * and Hexo-provided paths are root-relative (e.g. /images/foo.webp).
   */
  function fullUrl(path) {
    if (!path) return '';
    if (/^https?:\/\//.test(path)) return path;
    const base = config.url.replace(/\/$/, '');
    return base + '/' + path.replace(/^\/+/, '');
  }

  let jsonLd = null;

  // ---------------------------------------------------------------
  // Post pages -> Article schema
  // ---------------------------------------------------------------
  if (page.layout === 'post' && page.title) {
    const datePublished = page.date
      ? new Date(page.date).toISOString()
      : '';
    const dateModified = page.updated
      ? new Date(page.updated).toISOString()
      : datePublished;

    const image = page.cover
      ? fullUrl(page.cover)
      : fullUrl('/img/avatar.jpg');

    // Clean description: strip HTML, trim to 200 chars
    const description = (page.description || page.excerpt || page.title || '')
      .toString()
      .replace(/<[^>]*>/g, '')
      .substring(0, 200)
      .trim();

    jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      'headline': page.title,
      'url': page.permalink || '',
      'image': image,
      'datePublished': datePublished,
      'dateModified': dateModified,
      'description': description,
      'author': {
        '@type': 'Person',
        'name': AUTHOR_NAME,
        'url': SITE_URL
      },
      'publisher': {
        '@type': 'Organization',
        'name': AUTHOR_NAME,
        'url': SITE_URL,
        'logo': {
          '@type': 'ImageObject',
          'url': fullUrl('/img/avatar.jpg')
        }
      },
      'mainEntityOfPage': {
        '@type': 'WebPage',
        '@id': page.permalink || ''
      }
    };

  // ---------------------------------------------------------------
  // Homepage (first page only) -> WebSite schema
  // ---------------------------------------------------------------
  } else if (
    (page.layout === 'index' || page.__index === true) &&
    (!page.current || page.current === 1)
  ) {
    jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      'name': config.title || AUTHOR_NAME,
      'url': SITE_URL,
      'description': config.description || '',
      'author': {
        '@type': 'Person',
        'name': AUTHOR_NAME,
        'url': SITE_URL
      }
    };
  }

  // For page types we don't handle (archives, tags, categories, etc.),
  // remove any empty JSON-LD tags the theme left behind.
  if (!jsonLd) {
    const emptyLdJson =
      /<script\s+type=["']application\/ld\+json["'][^>]*>\s*<\/script>/gi;
    return str.replace(emptyLdJson, '');
  }

  const scriptTag =
    '<script type="application/ld+json">' +
    JSON.stringify(jsonLd) +
    '</script>';

  // Match any existing JSON-LD script tag (empty or populated).
  // The tag content may span multiple lines (theme uses pretty-printed JSON).
  const existingLdJsonPattern =
    /<script\s+type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/i;

  if (existingLdJsonPattern.test(str)) {
    // Replace the theme's JSON-LD tag with our enhanced version
    return str.replace(existingLdJsonPattern, scriptTag);
  }

  // No existing tag — inject before </head>
  return str.replace('</head>', scriptTag + '\n</head>');
});
