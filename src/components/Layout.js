/**
 * Layout components for the site
 */

// Import PureScript components
const Footer = require('./Footer');
const Logo = require('./Logo');
const Seo = require('./Seo');

// Render the site logo
export function renderLogo(container, width = 60, height = 30) {
  if (!container) return;
  
  container.innerHTML = `
    <svg width="${width}" height="${height}" viewBox="0 0 125 57" fill="black" xmlns="http://www.w3.org/2000/svg">
      <path d="M0.896283 29.1184C0.322916 29.6824 0 30.4529 0 31.2572V53.5C0 55.1569 1.34315 56.5 3 56.5H29.2406C30.0461 56.5 30.8179 56.176 31.382 55.601L44.8586 41.8653C46.74 39.9476 50 41.2798 50 43.9663V53.5C50 55.1569 51.3431 56.5 53 56.5H97.2406C98.0461 56.5 98.8179 56.176 99.382 55.601L123.641 30.8751C124.192 30.3142 124.5 29.5598 124.5 28.7741V3C124.5 1.34315 123.157 0 121.5 0H111.743C110.947 0 110.184 0.316071 109.621 0.87868L101.621 8.87868C99.7314 10.7686 96.5 9.43007 96.5 6.75736V3C96.5 1.34315 95.1569 0 93.5 0H81.7281C80.9411 0 80.1855 0.309303 79.6244 0.861221L61.6037 18.5865C59.7068 20.4523 56.5 19.1085 56.5 16.4477V3C56.5 1.34315 55.1569 0 53.5 0H31.7281C30.9411 0 30.1855 0.309303 29.6244 0.861222L0.896283 29.1184Z" fill="black" />
    </svg>
  `;
}

// Render the banner with ASCII art
export function renderBanner(container, ascii) {
  if (!container) return;
  
  const borderAscii = ascii.borderASCII.map(line => `<div>${line}</div>`).join('');
  const banner1Ascii = ascii.banner1ASCII.map(line => `<div>${line}</div>`).join('');
  const banner2Ascii = ascii.banner2ASCII.map(line => `<div>${line}</div>`).join('');
  const banner3Ascii = ascii.banner3ASCII.map(line => `<div>${line}</div>`).join('');
  
  container.innerHTML = `
    <pre class="text-sm text-center absolute select-none z-10 sm:text-xs">${borderAscii}</pre>
    <pre class="text-sm text-center subpixel-antialiased select-none absolute font-bold translate ease-in-out z-0 duration-[1.2s] group-hover:scale-150 group-hover:translate-y-[-50px] sm:text-xs">${banner1Ascii}</pre>
    <pre class="text-sm text-center subpixel-antialiased select-none absolute font-bold translate ease-in-out z-0 duration-1000 group-hover:scale-150 group-hover:opacity-0 sm:text-xs">${banner3Ascii}</pre>
    <pre class="text-sm text-center subpixel-antialiased translate ease-in-out z-0 duration-1000 group-hover:scale-[10.0] group-hover:-translate-y-24 select-none absolute font-bold sm:text-xs">${banner2Ascii}</pre>
  `;
}

// Render the main content section
export function renderContent(container, { articles = [], projects = [], pages = [] }) {
  if (!container) return;
  
  // Function to create an article item
  const createArticleItem = (post) => {
    return `
      <a href="${post.url}" class="flex justify-between group items-center mb-2">
        <div class="flex space-x-2 font-bold sm:-ml-2">
          <span class="sm:hidden sm:invisible">↪</span>
          <h3 class="flex-1 underline decoration-wavy decoration-neutral-400 underline-offset-2 group-hover:decoration-orange-600">${post.title}</h3>
          <span class="text-transparent group-hover:text-orange-600">⁕</span>
        </div>
        <span class="flex-none italic text-neutral-600 text-xs">--- ${post.date ? new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}</span>
      </a>
    `;
  };
  
  // Function to create a project item
  const createProjectItem = (project) => {
    return `
      <a href="${project.url}" class="flex justify-between group items-center mb-2">
        <div class="flex space-x-2 font-bold sm:-ml-2">
          <span class="sm:hidden sm:invisible">⚒</span>
          <h3 class="flex-1 underline decoration-dotted decoration-neutral-400 underline-offset-2 group-hover:decoration-orange-600">${project.title}</h3>
          <span class="text-transparent group-hover:text-orange-600">⁎</span>
        </div>
        <span class="flex-none italic text-neutral-600 text-xs">--- ${project.date ? new Date(project.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}</span>
      </a>
    `;
  };
  
  // Small introduction component
  const smallIntroduction = `
    <h1 class="text-base sm:text-sm">
      I'm <strong>fah</strong>, a front-end developer who <i>kinda</i> like experiment with things. Through this site, I write journals, portfolios, or showcases some of my experiments.
    </h1>
  `;
  
  // Find the about page content if it exists
  const aboutPage = pages.find(page => page.slug === 'about');
  const aboutContent = aboutPage ? aboutPage.content : smallIntroduction;
  
  // Create menu sections
  const menus = [
    { num: '01', title: 'About', content: aboutContent },
    { num: '02', title: 'Writings', content: articles.length > 0 ? articles.map(createArticleItem).join('') : '<p class="italic text-neutral-500">No articles yet.</p>' },
    { num: '03', title: 'Projects', content: projects.length > 0 ? projects.map(createProjectItem).join('') : '<p class="italic text-neutral-500">No projects yet.</p>' }
  ];
  
  // Render each menu section
  const menuSections = menus.map(menu => `
    <article>
      <h2 class="relative flex justify-between w-full before:absolute before:bottom-[0.4rem] before:w-full before:leading-[0px] before:border-black before:border-b-2 before:border-dotted text-neutral">
        <span class="bg-neutral-100 pr-1 relative z-10">
          [${menu.num}] <b class="italic text-neutral-700">${menu.title}</b>
        </span>
        <span class="bg-neutral-100 space-x-2 relative z-10 flex items-center">
          <span>[</span>
          <a href="#${menu.title.toLowerCase()}" class="hover:text-orange-600">More</a>
          <span>]</span>
        </span>
      </h2>
      <div class="my-4 sm:my-8">
        ${menu.content}
      </div>
    </article>
  `).join('');
  
  container.innerHTML = `<section>${menuSections}</section>`;
}

// Render the footer with decorative flowers
export function renderFooter(container) {
  if (!container) return;
  
  const renderYear = new Date().getFullYear();
  const dustver = "0.1.0";
  const renderTime = new Date().toISOString().split('T')[0];
  
  const flower1 = (pos) => `
    <pre class="text-sm absolute bottom-0 ${pos}">
      <code class="block font-sans text-orange-600 font-bold">***</code>
      <code class="block font-sans text-orange-600 font-bold">***</code>
      <code class="block font-sans">|</code>
      <code class="block font-sans">|</code>
    </pre>
  `;
  
  const flower2 = (pos) => `
    <pre class="text-sm absolute bottom-0 ${pos}">
      <code class="block font-sans"></code>
      <code class="block font-sans"></code>
      <code class="block font-sans text-orange-600 font-bold">@</code>
      <code class="block font-sans">|</code>
    </pre>
  `;
  
  container.innerHTML = `
    <div class="text-xs absolute z-0 bottom-2 text-neutral-600 w-full text-center">
      fa-h ${renderYear} | Dust ${dustver} at ${renderTime}
    </div>
    ${flower2("right-14")}
    ${flower1("right-56")}
    ${flower2("right-64")}
    ${flower1("left-14")}
    ${flower2("right-32")}
    ${flower1("right-20")}
    ${flower2("left-56")}
  `;
}

/**
 * Main Layout component
 * Renders the overall site layout with header, footer, and content
 */
function Layout(props) {
  const { 
    title, 
    content, 
    date, 
    tags = [],
    posts = [], 
    isIndex = false, 
    isArchive = false,
    isPage = false
  } = props;

  // Generate meta tags with SEO component
  const seoTags = Seo.render({
    title,
    description: content ? content.substring(0, 160).replace(/<[^>]*>/g, '') : 'Site built with PureScript and Bun'
  });

  // Generate the main content based on type
  let mainContent = '';

  if (isIndex) {
    // Index page with posts list
    mainContent = `
      <div class="container max-w-4xl mx-auto px-4 py-8">
        <h1 class="text-3xl font-bold mb-8">${title}</h1>
        <div class="posts space-y-8">
          ${posts.map(post => `
            <div class="post-summary border-b pb-6">
              <h2 class="text-2xl font-semibold mb-2">
                <a href="/${post.slug}.html" class="text-blue-600 hover:text-blue-800">
                  ${post.title}
                </a>
              </h2>
              <div class="text-sm text-gray-600 mb-2">${post.date}</div>
              ${post.tags && post.tags.length > 0 ? `
                <div class="tags flex flex-wrap gap-2 mb-4">
                  ${post.tags.map(tag => `
                    <span class="tag bg-gray-200 px-2 py-1 rounded text-xs">${tag}</span>
                  `).join('')}
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  } else if (isArchive) {
    // Archive page
    mainContent = `
      <div class="container max-w-4xl mx-auto px-4 py-8">
        <h1 class="text-3xl font-bold mb-8">Archive</h1>
        <ul class="space-y-2">
          ${posts.map(post => `
            <li class="border-b pb-2">
              <a href="/${post.slug}.html" class="text-blue-600 hover:text-blue-800">
                ${post.title}
              </a>
              <span class="text-sm text-gray-600 ml-2">(${post.date})</span>
            </li>
          `).join('')}
        </ul>
      </div>
    `;
  } else if (isPage) {
    // Regular page
    mainContent = `
      <div class="container max-w-4xl mx-auto px-4 py-8">
        <h1 class="text-3xl font-bold mb-6">${title}</h1>
        <div class="prose prose-lg max-w-none">
          ${content}
        </div>
      </div>
    `;
  } else {
    // Post page (default)
    mainContent = `
      <div class="container max-w-4xl mx-auto px-4 py-8">
        <article>
          <h1 class="text-3xl font-bold mb-4">${title}</h1>
          ${date ? `<div class="text-sm text-gray-600 mb-4">${date}</div>` : ''}
          ${tags && tags.length > 0 ? `
            <div class="tags flex flex-wrap gap-2 mb-6">
              ${tags.map(tag => `
                <span class="tag bg-gray-200 px-2 py-1 rounded text-xs">${tag}</span>
              `).join('')}
            </div>
          ` : ''}
          <div class="prose prose-lg max-w-none">
            ${content}
          </div>
        </article>
      </div>
    `;
  }

  // Use Logo component
  const logoHtml = Logo.render({});

  // Use Footer component
  const footerHtml = Footer.render({});

  // Return the complete HTML
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>${title}</title>
        ${seoTags}
        <link rel="stylesheet" href="/assets/css/styles.css">
      </head>
      <body class="bg-white text-gray-900">
        <header class="bg-gray-800 text-white py-4">
          <div class="container max-w-4xl mx-auto px-4 flex justify-between items-center">
            <div class="logo">
              ${logoHtml}
            </div>
            <nav>
              <ul class="flex space-x-6">
                <li><a href="/" class="hover:text-gray-300">Home</a></li>
                <li><a href="/archive.html" class="hover:text-gray-300">Archive</a></li>
                <li><a href="/about.html" class="hover:text-gray-300">About</a></li>
              </ul>
            </nav>
          </div>
        </header>

        <main>
          ${mainContent}
        </main>

        <footer class="bg-gray-100 py-8 mt-12">
          <div class="container max-w-4xl mx-auto px-4">
            ${footerHtml}
          </div>
        </footer>
      </body>
    </html>
  `;
}
