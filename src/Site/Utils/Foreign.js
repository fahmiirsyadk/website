import * as yaml from 'js-yaml';
import matter from 'gray-matter';
import MarkdownIt from 'markdown-it';
import * as shiki from 'shiki';

// Initialize markdown parser with plugins
const markdown = new MarkdownIt({ 
  html: true,
  linkify: true,
  typographer: true,
  highlight: async function(str, lang) {
    if (!lang) {
      return `<pre><code>${str}</code></pre>`;
    }
    try {
      const highlighter = await shiki.getHighlighter({
        theme: 'github-dark'
      });
      return highlighter.codeToHtml(str, { lang });
    } catch (e) {
      console.error('Error highlighting code:', e);
      return `<pre class="language-${lang}"><code>${str}</code></pre>`;
    }
  }
});

// Add plugins
markdown.use(require('markdown-it-anchor'));
markdown.use(require('markdown-it-toc-done-right'));
markdown.use(require('markdown-it-attrs'));

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
    // Add default frontmatter values if missing
    const data = {
      title: 'Untitled',
      date: new Date().toISOString(),
      slug: 'untitled',
      tags: [],
      ...parsed.data
    };
    
    // Generate slug if not provided
    if (!data.slug) {
      data.slug = data.title.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }
    
    // Render markdown
    html = markdown.render(parsed.content);
    
    return {
      matter: data,
      html: html
    };
  } catch (e) {
    console.error('Error rendering markdown:', e);
    return {
      matter: {
        title: 'Error',
        date: new Date().toISOString(),
        slug: 'error',
        tags: []
      },
      html: `<div class="error">Error rendering markdown: ${e.message}</div>`
    };
  }
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