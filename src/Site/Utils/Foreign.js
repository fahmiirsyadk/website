import * as yaml from 'js-yaml';
import matter from 'gray-matter';
import MarkdownIt from 'markdown-it';
import * as shiki from 'shiki';

const markdown = new MarkdownIt({ 
  html: true,
  highlight: function(str, lang) {
    return `<pre class="language-${lang}"><code>${str}</code></pre>`;
  }
});

// Load YAML from a string
export function loadYamlImpl(yamlString) {
  return yaml.load(yamlString);
}

// Parse a YAML object and extract a property
export function parseYamlImpl(yamlObj) {
  return function(property) {
    if (yamlObj && yamlObj[property] !== undefined) {
      return { value: yamlObj[property] };
    }
    return null;
  };
}

// Parse markdown with frontmatter
export function parseMarkdownImpl(content) {
  const parsed = matter(content);
  let html = '';
  
  try {
    html = markdown.render(parsed.content);
  } catch (e) {
    console.error('Error rendering markdown:', e);
    html = `<div class="error">Error rendering markdown</div>`;
  }
  
  return {
    matter: parsed.data,
    html: html
  };
}

// Get a string field from frontmatter
export function getFrontmatterFieldImpl(fieldName) {
  return function(frontmatter) {
    console.log(`Getting field ${fieldName} from`, frontmatter);
    if (frontmatter && frontmatter[fieldName] !== undefined) {
      return String(frontmatter[fieldName]);
    }
    console.warn(`Field ${fieldName} not found in frontmatter`);
    return "";
  };
}

// Get an array field from frontmatter
export function getFrontmatterArrayImpl(fieldName) {
  return function(frontmatter) {
    console.log(`Getting array ${fieldName} from`, frontmatter);
    if (frontmatter && frontmatter[fieldName] !== undefined) {
      if (Array.isArray(frontmatter[fieldName])) {
        return frontmatter[fieldName];
      } else {
        console.warn(`Field ${fieldName} is not an array, converting to singleton array`);
        return [String(frontmatter[fieldName])];
      }
    }
    console.warn(`Array field ${fieldName} not found in frontmatter`);
    return [];
  };
}

// Unsafe coerce helper
export function unsafeCoerce(value) {
  return value;
} 