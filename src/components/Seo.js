// SEO component stub
// Instead of importing from PureScript output, we'll define it directly

/**
 * Render SEO meta tags
 */
export function render(props = {}) {
  const title = props.title || 'fah | Personal Writings';
  const description = props.description || 'Personal website to unify my fragmented thoughts.';
  
  return `
    <meta name="description" content="${description}">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:type" content="website">
    <meta name="twitter:card" content="summary">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${description}">
  `;
}

// Unsafe conversion from Foreign to String
export function unsafeToString(value) {
  if (value === null || value === undefined) {
    return "";
  }
  
  if (typeof value === 'string') {
    return value;
  }
  
  if (typeof value === 'object' && value.toString) {
    return value.toString();
  }
  
  return String(value);
} 
