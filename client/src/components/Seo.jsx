import { useEffect } from 'react';

const DEFAULT_SITE_NAME = 'FitLedger';
const DEFAULT_SITE_URL = 'https://fitledger.brainstacks.in';
const DEFAULT_IMAGE_PATH = '/og-image.svg';

const ensureMetaTag = (selector, attributes) => {
  let element = document.head.querySelector(selector);

  if (!element) {
    element = document.createElement('meta');
    document.head.appendChild(element);
  }

  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });

  return element;
};

const ensureLinkTag = (selector, attributes) => {
  let element = document.head.querySelector(selector);

  if (!element) {
    element = document.createElement('link');
    document.head.appendChild(element);
  }

  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });

  return element;
};

const ensureJsonLdTag = (id, schema) => {
  let element = document.head.querySelector(`#${id}`);

  if (!element) {
    element = document.createElement('script');
    element.type = 'application/ld+json';
    element.id = id;
    document.head.appendChild(element);
  }

  element.textContent = JSON.stringify(schema);
  return element;
};

const Seo = ({
  title,
  description,
  path = '/',
  image = DEFAULT_IMAGE_PATH,
  robots = 'index, follow',
  keywords,
  schema,
  type = 'website',
}) => {
  useEffect(() => {
    const siteUrl = import.meta.env.VITE_SITE_URL || DEFAULT_SITE_URL;
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    const canonicalUrl = new URL(normalizedPath, siteUrl).toString();
    const imageUrl = new URL(image, siteUrl).toString();
    const resolvedTitle = title.includes(DEFAULT_SITE_NAME)
      ? title
      : `${title} | ${DEFAULT_SITE_NAME}`;

    document.title = resolvedTitle;

    ensureMetaTag('meta[name="description"]', {
      name: 'description',
      content: description,
    });
    ensureMetaTag('meta[name="robots"]', {
      name: 'robots',
      content: robots,
    });
    ensureMetaTag('meta[name="theme-color"]', {
      name: 'theme-color',
      content: '#0f766e',
    });

    if (keywords?.length) {
      ensureMetaTag('meta[name="keywords"]', {
        name: 'keywords',
        content: keywords.join(', '),
      });
    } else {
      const keywordsTag = document.head.querySelector('meta[name="keywords"]');
      if (keywordsTag) {
        keywordsTag.remove();
      }
    }

    ensureMetaTag('meta[property="og:type"]', {
      property: 'og:type',
      content: type,
    });
    ensureMetaTag('meta[property="og:title"]', {
      property: 'og:title',
      content: resolvedTitle,
    });
    ensureMetaTag('meta[property="og:description"]', {
      property: 'og:description',
      content: description,
    });
    ensureMetaTag('meta[property="og:url"]', {
      property: 'og:url',
      content: canonicalUrl,
    });
    ensureMetaTag('meta[property="og:image"]', {
      property: 'og:image',
      content: imageUrl,
    });
    ensureMetaTag('meta[property="og:site_name"]', {
      property: 'og:site_name',
      content: DEFAULT_SITE_NAME,
    });

    ensureMetaTag('meta[name="twitter:card"]', {
      name: 'twitter:card',
      content: 'summary_large_image',
    });
    ensureMetaTag('meta[name="twitter:title"]', {
      name: 'twitter:title',
      content: resolvedTitle,
    });
    ensureMetaTag('meta[name="twitter:description"]', {
      name: 'twitter:description',
      content: description,
    });
    ensureMetaTag('meta[name="twitter:image"]', {
      name: 'twitter:image',
      content: imageUrl,
    });

    ensureLinkTag('link[rel="canonical"]', {
      rel: 'canonical',
      href: canonicalUrl,
    });

    const schemaTagId = 'seo-structured-data';
    if (schema) {
      ensureJsonLdTag(schemaTagId, schema);
    } else {
      const existingSchemaTag = document.head.querySelector(`#${schemaTagId}`);
      if (existingSchemaTag) {
        existingSchemaTag.remove();
      }
    }
  }, [description, image, keywords, path, robots, schema, title, type]);

  return null;
};

export default Seo;
