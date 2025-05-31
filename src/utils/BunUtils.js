/**
 * Bun-specific utility functions
 */

// Function to copy assets (to be used during production builds)
export async function copyAssets() {
  const fontsDir = await Bun.glob('./src/public/assets/fonts/*');
  const imagesDir = await Bun.glob('./src/public/assets/images/*');
  
  // Ensure directories exist
  await Bun.write('./dist/assets/fonts/.keep', '');
  await Bun.write('./dist/assets/images/.keep', '');
  
  // Copy fonts
  for (const fontPath of fontsDir) {
    const fileName = fontPath.split('/').pop();
    const content = await Bun.file(fontPath).arrayBuffer();
    await Bun.write(`./dist/assets/fonts/${fileName}`, content);
  }
  
  // Copy images
  for (const imagePath of imagesDir) {
    const fileName = imagePath.split('/').pop();
    const content = await Bun.file(imagePath).arrayBuffer();
    await Bun.write(`./dist/assets/images/${fileName}`, content);
  }
}

// Function to process markdown files into HTML
export async function processMarkdown(content, options = {}) {
  const { matter, markdown } = await import('./MarkdownProcessor.js');
  const parsed = matter(content);
  
  return {
    data: parsed.data,
    html: markdown.render(parsed.content)
  };
}

// Function to get environment variables with proper fallbacks
export function getEnv(key, fallback = '') {
  return process.env[key] || fallback;
}

// Function to check if we're in production mode
export function isProduction() {
  return process.env.NODE_ENV === 'production';
}

// Function to write a file only in production mode
export async function writeFileInProduction(path, content) {
  if (isProduction()) {
    await Bun.write(path, content);
    console.log(`✅ Generated: ${path}`);
  }
}

// Function to print a message in colored text
export function coloredLog(message, color = 'blue') {
  const colors = {
    blue: '\x1b[34m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    reset: '\x1b[0m'
  };
  
  console.log(`${colors[color] || ''}${message}${colors.reset}`);
} 