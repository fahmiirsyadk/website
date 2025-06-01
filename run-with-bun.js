#!/usr/bin/env bun
// Use Bun's APIs instead of Node.js modules when running in Bun environment
const path = require('path');
let fs, execSync, spawn;

// Import Node.js fs module for fallback
const nodefs = require('fs');

// Bun-specific optimizations
const isBun = typeof Bun !== 'undefined';
if (isBun) {
  console.log('⚡ Running with Bun performance optimizations');
  
  // Set environment variable to let PureScript code know we're using Bun
  process.env.BUN_RUNTIME = 'true';
  
  // Increase Bun's GC frequency when in watch mode to prevent memory leaks
  if (process.argv.includes('--watch')) {
    process.env.BUN_GC_INTERVAL = '10000'; // 10 seconds
  }
  
  // We can use the native Bun file system and subprocess APIs
  fs = {
    existsSync: (path) => {
      try {
        return Bun.file(path).size !== null;
      } catch (e) {
        return false;
      }
    },
    mkdirSync: (path, options) => {
      // Use Node.js's fs.mkdirSync for Windows compatibility
      return nodefs.mkdirSync(path, options);
    },
    copyFileSync: (src, dest) => {
      try {
        return Bun.write(dest, Bun.file(src));
      } catch (e) {
        // Fallback to Node.js for compatibility
        return nodefs.copyFileSync(src, dest);
      }
    },
    readFileSync: (path, encoding) => {
      try {
        if (encoding === 'utf-8' || encoding === 'utf8') {
          return Bun.file(path).text();
        }
        return Bun.file(path).arrayBuffer();
      } catch (e) {
        // Fallback to Node.js for compatibility
        return nodefs.readFileSync(path, encoding);
      }
    },
    writeFileSync: (path, data, encoding) => {
      try {
        return Bun.write(path, data);
      } catch (e) {
        // Fallback to Node.js for compatibility
        return nodefs.writeFileSync(path, data, encoding);
      }
    },
    rmSync: (path, options) => {
      try {
        // Use Node.js's rmSync for Windows compatibility
        return nodefs.rmSync(path, options);
      } catch (e) {
        console.error(`Error removing path ${path}: ${e.message}`);
        return false;
      }
    },
    unlinkSync: (path) => {
      try {
        // Use Node.js's unlinkSync for Windows compatibility
        return nodefs.unlinkSync(path);
      } catch (e) {
        console.error(`Error unlinking path ${path}: ${e.message}`);
        return false;
      }
    },
    statSync: (path) => {
      try {
        // Use Node.js's statSync for Windows compatibility
        return nodefs.statSync(path);
      } catch (e) {
        console.error(`Error getting stats for path ${path}: ${e.message}`);
        return {
          isDirectory: () => false,
          isFile: () => false,
          mtime: new Date(0)
        };
      }
    },
    readdirSync: (dir, options) => {
      try {
        // Use Node.js's readdirSync for Windows compatibility
        return nodefs.readdirSync(dir, options);
      } catch (e) {
        console.error(`Error reading directory ${dir}: ${e.message}`);
        return [];
      }
    },
    watch: (dir, options, callback) => {
      try {
        // Use Node.js's watch for Windows compatibility
        return nodefs.watch(dir, options, callback);
      } catch (e) {
        console.error(`Error watching directory ${dir}: ${e.message}`);
        return {
          close: () => {}
        };
      }
    }
  };
  
  execSync = (command, options) => {
    const result = Bun.spawnSync(command.split(' '), options);
    if (result.exitCode !== 0 && options?.stdio !== 'inherit') {
      throw new Error(`Command failed: ${command}`);
    }
    return result.stdout;
  };
  
  spawn = (command, args, options) => {
    return Bun.spawn([command, ...args], options);
  };
} else {
  // Fall back to Node.js APIs when not running in Bun
  const nodeChildProcess = require('child_process');
  fs = nodefs;
  execSync = nodeChildProcess.execSync;
  spawn = nodeChildProcess.spawn;
}

// Check for watch mode
const isWatch = process.argv.includes('--watch');
const isDebug = process.argv.includes('--debug');
const isProduction = process.argv.includes('--production');
const isClean = process.argv.includes('--clean');
const isCleanAll = process.argv.includes('--clean-all');

console.log(`🧩 Building and running PureScript with Bun${isWatch ? ' in watch mode' : ''}...`);

// Create dist directory if it doesn't exist
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Add asset mapping configuration
const ASSET_PATHS = {
  // Map URL paths to source directories
  '/assets/images': path.join(__dirname, 'src', 'public', 'assets', 'images'),
  '/assets/fonts': path.join(__dirname, 'src', 'public', 'assets', 'fonts'),
  '/assets/css': path.join(__dirname, 'dist', 'assets', 'css'), // Keep CSS in dist since it's compiled
  '/assets/js': path.join(__dirname, 'src', 'public', 'assets', 'js')
};

// Ensure asset directories exist
function ensureAssetDirectories() {
  // Make sure source asset directories exist
  Object.values(ASSET_PATHS).forEach(dirPath => {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`📁 Created asset directory: ${dirPath}`);
    }
  });
  
  // Also ensure dist/assets exists for generated assets like CSS
  const distAssetsDir = path.join(__dirname, 'dist', 'assets');
  if (!fs.existsSync(distAssetsDir)) {
    fs.mkdirSync(distAssetsDir, { recursive: true });
  }
}

// Create test directories for assets
function createAssetDirectories() {
  console.log('📁 Creating asset directories...');
  ensureAssetDirectories();
  console.log('✅ Asset directories ready');
}

// Add a proper logger
const logger = {
  debug: (...args) => {
    if (isDebug) console.log('🔍', ...args);
  },
  info: (...args) => console.log('ℹ️', ...args),
  success: (...args) => console.log('✅', ...args),
  warn: (...args) => console.log('⚠️', ...args),
  error: (...args) => console.error('❌', ...args),
  build: (...args) => console.log('🔄', ...args),
  perf: (...args) => console.log('⚡', ...args)
};

// Track build statistics
const buildStats = {
  startTime: null,
  endTime: null,
  totalTime: null,
  successes: 0,
  failures: 0,
  skipped: 0,
  filesProcessed: 0,
  
  start() {
    this.startTime = BigInt(Math.round(performance.now() * 1000000)); // Convert to nanoseconds
    return this;
  },
  
  end() {
    this.endTime = BigInt(Math.round(performance.now() * 1000000)); // Convert to nanoseconds
    this.totalTime = this.endTime - this.startTime;
    return this;
  },
  
  getTimeInSeconds() {
    if (!this.totalTime) return 0;
    return Number(this.totalTime) / 1000000000; // Convert nanoseconds to seconds
  },
  
  printSummary() {
    logger.info(`Build Summary:`);
    logger.info(`- Total time: ${this.getTimeInSeconds().toFixed(2)}s`);
    logger.info(`- Files processed: ${this.filesProcessed}`);
    logger.info(`- Successful: ${this.successes}`);
    
    if (this.skipped > 0) {
      logger.info(`- Skipped (cached): ${this.skipped}`);
    }
    
    if (this.failures > 0) {
      logger.warn(`- Failures: ${this.failures}`);
    }
    
    return this;
  },
  
  reset() {
    this.startTime = null;
    this.endTime = null;
    this.totalTime = null;
    this.successes = 0;
    this.failures = 0;
    this.skipped = 0;
    this.filesProcessed = 0;
    return this;
  }
};

// Replace the buildSite function with a more robust version
async function buildSite() {
  // Reset build stats
  buildStats.reset().start();
  
  logger.build('Building site...');
  
  // Clean if needed
  if (isClean || isCleanAll) {
    try {
      cleanBuild(isCleanAll);
    } catch (error) {
      logger.error(`Error cleaning build directories: ${error.message}`);
      buildStats.failures++;
      // Continue with the build despite cleaning errors
    }
  }
  
  try {
    // 1. Build PureScript
    logger.build('Building PureScript...');
    
    if (!buildPureScript()) {
      logger.error('PureScript build failed');
      buildStats.failures++;
      return false;
    }
    
    buildStats.successes++;
    
    // 2. Ensure asset directories exist
    ensureAssetDirectories();
    
    // 3. Process assets (CSS and other assets)
    logger.build('Processing assets...');
    try {
      await processAssets(isProduction);
      buildStats.successes++;
    } catch (error) {
      logger.error(`Error processing assets: ${error.message}`);
      buildStats.failures++;
      // Continue with site generation despite asset errors
    }
    
    // 4. Generate the site
    logger.build('Generating site content...');
    if (!await generateSite()) {
      logger.error('Site generation failed');
      buildStats.failures++;
      return false;
    }
    
    buildStats.successes++;
    
    // 5. Check for missing assets
    logger.build('Checking for missing assets...');
    try {
      copyMissingAssets();
      buildStats.successes++;
    } catch (error) {
      logger.error(`Error copying missing assets: ${error.message}`);
      buildStats.failures++;
      // Continue despite asset copying errors
    }
    
    // End build stats timing
    buildStats.end();
    
    // Print build summary
    logger.success(`Site build completed in ${buildStats.getTimeInSeconds().toFixed(2)}s`);
    
    if (isDebug) {
      buildStats.printSummary();
    }
    
    if (isProduction) {
      logger.success(`Production build ready in the "${distDir}" directory`);
    }
    
    return buildStats.failures === 0;
  } catch (error) {
    // Catch any unexpected errors
    buildStats.end();
    logger.error(`Unexpected error during build: ${error.message}`);
    
    if (isDebug) {
      console.error(error.stack);
    }
    
    buildStats.failures++;
    buildStats.printSummary();
    return false;
  }
}

// Enhance the copyMissingAssets function with better error handling
function copyMissingAssets() {
  logger.build('Checking for missing assets...');
  
  // Get list of asset files referenced in HTML files
  const articlesDir = path.join(distDir, 'articles');
  
  // Check if the directory exists before proceeding
  if (!fs.existsSync(articlesDir)) {
    logger.info('Articles directory does not exist yet, skipping asset check');
    return;
  }
  
  // Read all HTML files in dist and scan for asset references
  const missingAssets = new Set();
  let scannedFiles = 0;
  
  // Helper function to scan HTML for asset references
  function scanHtmlForAssets(htmlContent, filePath) {
    scannedFiles++;
    
    // Find all src and href attributes in the HTML
    const srcRegex = /(?:src|href)=["']([^"']*\/assets\/[^"']*)["']/g;
    let match;
    while ((match = srcRegex.exec(htmlContent)) !== null) {
      const assetPath = match[1];
      if (assetPath.startsWith('/')) {
        // Check if this asset exists in dist
        const distAssetPath = path.join(distDir, assetPath);
        if (!fs.existsSync(distAssetPath)) {
          missingAssets.add(assetPath);
          logger.debug(`Found missing asset: ${assetPath} in ${filePath}`);
        }
      }
    }
  }
  
  // Helper function to copy an asset from src to dist
  function copyAssetToDist(assetPath) {
    // Remove leading slash
    const relativePath = assetPath.startsWith('/') ? assetPath.slice(1) : assetPath;
    
    // Find the source path from the ASSET_PATHS mapping
    let srcAssetPath = null;
    for (const [urlPrefix, sourcePath] of Object.entries(ASSET_PATHS)) {
      if (assetPath.startsWith(urlPrefix)) {
        const assetSubPath = assetPath.slice(urlPrefix.length);
        srcAssetPath = path.join(sourcePath, assetSubPath);
        break;
      }
    }
    
    if (!srcAssetPath || !fs.existsSync(srcAssetPath)) {
      logger.warn(`Source asset not found: ${assetPath}`);
      return false;
    }
    
    // Create the directory in dist if it doesn't exist
    const distAssetPath = path.join(distDir, relativePath);
    const distAssetDir = path.dirname(distAssetPath);
    
    if (!fs.existsSync(distAssetDir)) {
      fs.mkdirSync(distAssetDir, { recursive: true });
    }
    
    // Copy the file
    try {
      fs.copyFileSync(srcAssetPath, distAssetPath);
      logger.debug(`Copied asset: ${assetPath}`);
      buildStats.filesProcessed++;
      return true;
    } catch (error) {
      logger.error(`Error copying asset ${assetPath}: ${error.message}`);
      return false;
    }
  }
  
  // Process index.html
  const indexPath = path.join(distDir, 'index.html');
  if (fs.existsSync(indexPath)) {
    const indexContent = fs.readFileSync(indexPath, 'utf-8');
    scanHtmlForAssets(indexContent, 'index.html');
  }
  
  // Process all HTML files in the articles directory
  function processDirectory(dir) {
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          processDirectory(fullPath);
        } else if (entry.name.endsWith('.html')) {
          try {
            const content = fs.readFileSync(fullPath, 'utf-8');
            scanHtmlForAssets(content, fullPath);
          } catch (error) {
            logger.error(`Error reading HTML file ${fullPath}: ${error.message}`);
          }
        }
      }
    } catch (error) {
      logger.error(`Error processing directory ${dir}: ${error.message}`);
    }
  }
  
  processDirectory(articlesDir);
  
  // Copy all missing assets
  if (missingAssets.size > 0) {
    logger.info(`Found ${missingAssets.size} missing assets in ${scannedFiles} HTML files`);
    let copiedCount = 0;
    
    for (const asset of missingAssets) {
      if (copyAssetToDist(asset)) {
        copiedCount++;
        buildStats.successes++;
      } else {
        buildStats.failures++;
      }
    }
    
    logger.success(`Copied ${copiedCount} missing assets to dist`);
  } else {
    logger.success(`No missing assets found after scanning ${scannedFiles} HTML files`);
  }
}

// Function to build PureScript
function buildPureScript() {
  console.log('🔄 Building PureScript...');
  try {
    // Check if we have a cached build that's still valid
    const outputDir = path.join(__dirname, 'output');
    const srcDir = path.join(__dirname, 'src');
    
    // Only rebuild if output directory doesn't exist or if src files have changed
    // if (fs.existsSync(outputDir)) {
    //   const outputStat = fs.statSync(outputDir);
    //   const srcStat = fs.statSync(srcDir);
      
    //   // If src directory was modified after output directory, we need to rebuild
    //   if (srcStat.mtime <= outputStat.mtime && !isClean && !isCleanAll) {
    //     console.log('✅ Using cached PureScript build');
    //     return true;
    //   }
    // }
    
    if (isBun) {
      // Use Bun.spawnSync for better performance
      console.log('⚡ Using Bun for faster compilation');
      const result = Bun.spawnSync(['spago', 'build'])
      
      if (result.exitCode !== 0) {
        console.error('❌ Error building PureScript:');
        console.error(result.stderr.toString());
        return false;
      }
      
      return true;
    } else {
      // Fall back to execSync for non-Bun environments
      execSync('spago build', { stdio: 'inherit' });
      return true;
    }
  } catch (error) {
    console.error('❌ Error building PureScript:', error.message);
    return false;
  }
}

// Function to generate the site from PureScript
async function generateSite() {
  console.log('🔄 Generating site from PureScript...');
  try {
    // Clear require cache for PureScript modules
    const pursToClear = [
      './output/Page.Index/index.js',
      './output/Page.Blogpost/index.js',
      './src/Site/Collections.js',
      './src/Site/BlogGenerator.js'
    ];

    pursToClear.forEach(modulePath => {
      const resolvedPath = require.resolve(modulePath);
      if (require.cache[resolvedPath]) {
        delete require.cache[resolvedPath];
      }
    });

    // Import the homepage function from the compiled PureScript
    const { homepage } = require('./output/Page.Index/index.js');
    const { renderBlogpost } = require('./output/Page.Blogpost/index.js');
    
    // Extract the collections manually
    const { extractArticles, extractProjects } = require('./src/Site/Collections.js');
    
    // Get the data
    console.log('📊 Loading content collections...');
    const [articles, projects] = await Promise.all([
      extractArticles(),
      extractProjects()
    ]);
    
    // Create the collections object for PureScript
    const collections = {
      collections: {
        posts: articles,
        projects: projects
      }
    };
    
    // Generate the HTML for index
    console.log('🏠 Generating homepage...');
    const html = homepage(collections);
    
    // Ensure the dist directory exists
    const indexPath = path.join(distDir, 'index.html');
    
    // Write the HTML to index.html
    fs.writeFileSync(indexPath, html);
    
    console.log('✅ Site index generation successful');
    
    // Generate blog post pages
    console.log('📝 Generating blog post pages...');
    
    // Create articles directory if it doesn't exist
    const articlesDir = path.join(distDir, 'articles');
    if (!fs.existsSync(articlesDir)) {
      fs.mkdirSync(articlesDir, { recursive: true });
    }
    
    // Process each article and project to generate individual pages
    const { getBlogPostImpl, generateBlogPostImpl } = require('./src/Site/BlogGenerator.js');
    
    // Helper function to check if a path is a file
    function isFile(filePath) {
      try {
        return fs.existsSync(filePath) && fs.statSync(filePath).isFile();
      } catch (error) {
        console.error(`Error checking if path is a file: ${filePath}`, error);
        return false;
      }
    }
    
    // Generate pages for each article and project
    const allSlugs = [
      ...articles.map(article => article.slug),
      ...projects.map(project => project.slug)
    ];
    
    // Process slugs in parallel but with concurrency control
    const concurrency = 5; // Process 5 at a time
    const chunks = [];
    
    // Split slugs into chunks for controlled parallelism
    for (let i = 0; i < allSlugs.length; i += concurrency) {
      chunks.push(allSlugs.slice(i, i + concurrency));
    }
    
    let totalGenerated = 0;
    
    // Process each chunk sequentially
    for (const chunk of chunks) {
      // Process slugs in this chunk in parallel
      const results = await Promise.all(
        chunk.map(async (slug) => {
          try {
            if (!slug) {
              console.error("Encountered empty slug, skipping");
              return { status: 'error', slug };
            }
            
            const postDir = path.join(articlesDir, slug);
            const outputPath = path.join(postDir, 'index.html');
            
            // Generate post content
            const getBlogPostFn = await getBlogPostImpl(slug);
            const postData = await getBlogPostFn();
            
            // Check if we got valid post data
            if (!postData || !postData.title) {
              console.error(`Invalid post data for slug: ${slug}`);
              return { status: 'error', slug };
            }
            
            // Generate HTML
            const postHtml = renderBlogpost(postData);
            
            // Create a directory for this specific post
            if (!fs.existsSync(postDir)) {
              fs.mkdirSync(postDir, { recursive: true });
            } else if (!fs.statSync(postDir).isDirectory()) {
              // If it exists but is not a directory, remove it and create directory
              console.warn(`Path exists but is not a directory: ${postDir}, recreating...`);
              fs.unlinkSync(postDir);
              fs.mkdirSync(postDir, { recursive: true });
            }
            
            // Write to file as index.html in the post directory
            fs.writeFileSync(outputPath, postHtml);
            
            totalGenerated++;
            return { status: 'generated', slug };
          } catch (error) {
            console.error(`❌ Error generating blog post ${slug}:`, error);
            return { status: 'error', slug, error };
          }
        })
      );
    }
    
    console.log(`✅ Generated ${totalGenerated} blog posts`);
    
    // Clean up old .html files (they've been replaced by the /slug/index.html structure)
    const oldHtmlFiles = fs.readdirSync(articlesDir)
      .filter(file => file.endsWith('.html'))
      .map(file => path.join(articlesDir, file))
      .filter(filePath => isFile(filePath)); // Only include actual files, not directories
    
    if (oldHtmlFiles.length > 0) {
      console.log(`Found ${oldHtmlFiles.length} old HTML files to clean up`);
      
      oldHtmlFiles.forEach(file => {
        try {
          fs.unlinkSync(file);
          console.log(`🧹 Removed old file: ${file}`);
        } catch (error) {
          console.error(`❌ Error removing old file ${file}:`, error);
        }
      });
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error generating site:', error);
    return false;
  }
}

// Helper to compute a hash of a post to detect changes
function computePostHash(articles, projects, slug) {
  // Find the post data
  const article = articles.find(a => a.slug === slug);
  const project = projects.find(p => p.slug === slug);
  const post = article || project;
  
  if (!post) return null;
  
  // Create a string with the relevant content
  const content = JSON.stringify({
    title: post.title,
    slug: post.slug,
    date: post.date,
    updatedAt: post.updatedAt,
    path: post.path
  });
  
  // Use simple hash function
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  return hash.toString(16);
}

// Cleanup the build directories
function cleanBuild(cleanAll = false) {
  console.log(`🧹 Cleaning ${cleanAll ? 'all' : 'build'} directories...`);
  
  // Always clean the dist directory
  if (fs.existsSync(distDir)) {
    try {
      // Remove all files in dist but keep the directory
      const entries = fs.readdirSync(distDir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(distDir, entry.name);
        if (entry.isDirectory()) {
          fs.rmSync(fullPath, { recursive: true, force: true });
          console.log(`🧹 Removed directory: ${fullPath}`);
        } else {
          fs.unlinkSync(fullPath);
          console.log(`🧹 Removed file: ${fullPath}`);
        }
      }
      
      console.log(`✅ Cleaned dist directory`);
    } catch (error) {
      console.error(`❌ Error cleaning dist directory:`, error);
    }
  } else {
    console.log(`ℹ️ Dist directory does not exist, creating it`);
    fs.mkdirSync(distDir, { recursive: true });
  }
  
  // If cleanAll is true, also clean the output directory
  if (cleanAll && fs.existsSync(path.join(__dirname, 'output'))) {
    try {
      fs.rmSync(path.join(__dirname, 'output'), { recursive: true, force: true });
      console.log(`✅ Cleaned output directory`);
    } catch (error) {
      console.error(`❌ Error cleaning output directory:`, error);
    }
  }
}

// Check if we should clean first
if (isClean || isCleanAll) {
  cleanBuild(isCleanAll);
}

// Compile Tailwind CSS function
async function compileTailwindCSS() {
  console.log('🔄 Compiling Tailwind CSS...');
  
  // Create the output directory if it doesn't exist
  const cssDir = path.join(__dirname, 'dist', 'assets', 'css');
  if (!fs.existsSync(cssDir)) {
    fs.mkdirSync(cssDir, { recursive: true });
  }
  
  const cssOutput = path.join(cssDir, 'styles.css');
  const cssInput = path.join(__dirname, 'tailwind', 'tailwind.css');
  const configFile = path.join(__dirname, 'tailwind.config.js');
  
  try {
    // Use Tailwind CLI directly for better performance
    const args = [
      'bunx', 'tailwindcss',
      '-i', cssInput,
      '-o', cssOutput,
      '-c', configFile,
      '--minify',
      '--no-autoprefixer', // Disable autoprefixer for faster builds
      isWatch ? '--watch' : ''
    ].filter(Boolean);

    if (isWatch) {
      // In watch mode, spawn the process and keep it running
      const process = Bun.spawn(args, {
        stdio: ['inherit', 'inherit', 'inherit']
      });
      console.log('✅ CSS compilation started in watch mode');
      return process;
    } else {
      // For one-time builds, use spawnSync
      const result = Bun.spawnSync(args, {
        stdio: ['inherit', 'inherit', 'inherit']
      });

      if (result.exitCode !== 0) {
        throw new Error('CSS compilation failed');
      }

      console.log('✅ CSS compilation successful');
      return result;
    }
  } catch (error) {
    console.error('❌ CSS compilation failed:', error);
    throw error;
  }
}

// Function to process assets efficiently
async function processAssets(isProduction = false) {
  console.log(`🔄 ${isProduction ? 'Production mode:' : 'Development mode:'} Processing assets...`);
  
  // First compile CSS
  await compileTailwindCSS();
  
  // Then process other assets in parallel
  if (isProduction) {
    // In production, process all assets in parallel
    console.log('📦 Processing all assets for production...');
    
    // Create a queue of all asset operations
    const assetOperations = [];
    
    // Add CSS directory copy to the operations
    const distCssDir = path.join(distDir, 'assets', 'css');
    if (!fs.existsSync(distCssDir)) {
      fs.mkdirSync(distCssDir, { recursive: true });
    }
    
    // Add operations for each asset directory
    for (const [urlPath, sourcePath] of Object.entries(ASSET_PATHS)) {
      if (fs.existsSync(sourcePath)) {
        const destPath = path.join(distDir, urlPath);
        
        // Create destination directory if it doesn't exist
        if (!fs.existsSync(destPath)) {
          fs.mkdirSync(destPath, { recursive: true });
        }
        
        // Add copy operations for each file in the directory
        const files = getAllFiles(sourcePath);
        for (const file of files) {
          const relativePath = path.relative(sourcePath, file);
          const destFile = path.join(destPath, relativePath);
          
          // Create directory for the destination file if needed
          const destFileDir = path.dirname(destFile);
          if (!fs.existsSync(destFileDir)) {
            fs.mkdirSync(destFileDir, { recursive: true });
          }
          
          // Skip if the file hasn't been modified
          if (fs.existsSync(destFile)) {
            const srcStat = fs.statSync(file);
            const destStat = fs.statSync(destFile);
            
            if (srcStat.mtime <= destStat.mtime) {
              // File hasn't changed, skip
              continue;
            }
          }
          
          // Add copy operation
          assetOperations.push(() => {
            try {
              fs.copyFileSync(file, destFile);
              return { success: true, file: relativePath };
            } catch (error) {
              console.error(`❌ Error copying asset ${file}:`, error);
              return { success: false, file: relativePath, error };
            }
          });
        }
      }
    }
    
    // Execute operations in parallel with a maximum concurrency
    const CONCURRENCY = 20; // Process 20 files at a time
    let completed = 0;
    let succeeded = 0;
    const total = assetOperations.length;
    
    console.log(`🔄 Processing ${total} asset files...`);
    
    // Process in chunks
    for (let i = 0; i < total; i += CONCURRENCY) {
      const chunk = assetOperations.slice(i, i + CONCURRENCY);
      const results = await Promise.all(chunk.map(op => op()));
      
      // Count results
      for (const result of results) {
        completed++;
        if (result.success) succeeded++;
        
        // Log progress every 50 files
        if (completed % 50 === 0 || completed === total) {
          console.log(`📊 Processed ${completed}/${total} files (${succeeded} succeeded)`);
        }
      }
    }
    
    console.log(`✅ Finished processing assets: ${succeeded}/${total} files copied successfully`);
    
  } else {
    // In development mode, only copy essential assets
    console.log('🔄 Development mode: Only copying essential assets');
    
    // Add any essential files that should always be copied
    const essentialFiles = [
      { from: path.join(__dirname, 'src', 'public', 'favicon.ico'), to: path.join(distDir, 'favicon.ico') },
      // Add more essential files here as needed
    ];
    
    for (const file of essentialFiles) {
      if (fs.existsSync(file.from)) {
        try {
          // Create directory if it doesn't exist
          const dir = path.dirname(file.to);
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }
          
          fs.copyFileSync(file.from, file.to);
          console.log(`✅ Copied essential file: ${path.basename(file.from)}`);
        } catch (error) {
          console.error(`❌ Error copying essential file ${file.from}:`, error);
        }
      } else {
        console.log(`⚠️ Essential file not found: ${file.from}`);
      }
    }
  }
  
  return true;
}

// Helper function to get all files in a directory recursively
function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);
  
  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getAllFiles(fullPath, arrayOfFiles);
    } else {
      arrayOfFiles.push(fullPath);
    }
  }
  
  return arrayOfFiles;
}

// Replace the old copyAssets function with the new processAssets function
async function buildSite() {
  console.log('🔄 Building site...');
  
  // Clean if needed
  if (isClean || isCleanAll) {
    cleanBuild(isCleanAll);
  }
  
  // 1. Build PureScript
  if (!buildPureScript()) {
    console.error('❌ PureScript build failed');
    return false;
  }
  
  // 2. Ensure asset directories exist
  ensureAssetDirectories();
  
  // 3. Process assets (CSS and other assets)
  await processAssets(isProduction);
  
  // 4. Generate the site
  if (!await generateSite()) {
    console.error('❌ Site generation failed');
    return false;
  }
  
  // 5. Check for missing assets
  copyMissingAssets();
  
  console.log('✅ Site build completed successfully!');
  return true;
}

// Add server functionality for development mode
async function tryStartServer(distDir, port) {
  try {
    // Only attempt to start server if we're running in Bun
    if (!isBun) {
      console.log('⚠️ Development server is only available when running with Bun');
      return null;
    }

    let currentPort = port;
    let maxAttempts = 10;
    let server;

    while (maxAttempts > 0) {
      try {
        server = Bun.serve({
          port: currentPort,
          development: true,
          fetch(req) {
            const url = new URL(req.url);
            let filePath = path.join(distDir, url.pathname === '/' ? 'index.html' : url.pathname);

            // If path doesn't have an extension, try to serve index.html from that directory
            if (!path.extname(filePath) && !filePath.endsWith('index.html')) {
              filePath = path.join(filePath, 'index.html');
            }

            // Check if file exists
            if (fs.existsSync(filePath)) {
              return new Response(Bun.file(filePath));
            }

            // Return 404 if file not found
            return new Response('Not Found', { status: 404 });
          },
        });

        // If we get here, server started successfully
        logger.success(`Server started on port ${currentPort}`);
        break;
      } catch (err) {
        if (err.code === 'EADDRINUSE') {
          logger.info(`Port ${currentPort} is in use, trying ${currentPort + 1}...`);
          currentPort++;
          maxAttempts--;
          continue;
        }
        // For other errors, throw immediately
        throw err;
      }
    }

    if (!server) {
      throw new Error(`Could not find an available port after ${10 - maxAttempts} attempts`);
    }

    // Add a method to trigger reload for connected clients
    server.triggerReload = (changedFile) => {
      // In a real implementation, this would use WebSocket to notify clients
      logger.info(`🔄 File changed: ${changedFile || 'unknown'}`);
    };

    return {
      port: server.port,
      server: server,
      triggerReload: server.triggerReload
    };
  } catch (error) {
    logger.error(`Failed to start server: ${error.message}`);
    return null;
  }
}

// Helper function to setup enhanced file watching
function setupEnhancedFileWatcher(dir, callback) {
  try {
    return fs.watch(dir, { recursive: true }, (eventType, filename) => {
      if (filename) {
        const fullPath = path.join(dir, filename);
        callback(eventType, fullPath);
      }
    });
  } catch (error) {
    console.error(`❌ Error setting up file watcher for ${dir}:`, error);
    return {
      close: () => {} // Return a dummy watcher that does nothing
    };
  }
}

// Improve the error handling in the watch mode
if (isWatch) {
  logger.info('Starting watch mode...');
  
  // Build once at startup
  buildSite().then(success => {
    if (!success) {
      logger.error('Initial build failed, but continuing to watch for changes');
    }
    
    try {
      // Start the development server with HMR
      const PORT = 3000;
      (async () => {
        const server = await createDevServer(distDir, PORT);
        
        if (server) {
          logger.success(`Server started at http://localhost:${server.port}`);
          
          // Setup source file watching
          let pendingChanges = new Set();
          let buildQueued = false;
          let debounceTimer;
          let isBuilding = false;

          const queueBuild = async (filePath) => {
            if (isBuilding) {
              pendingChanges.add(filePath);
              return;
            }

            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(async () => {
              if (isBuilding) {
                buildQueued = true;
                return;
              }

              isBuilding = true;
              const changedFiles = Array.from(pendingChanges);
              pendingChanges.clear();
              buildQueued = false;

              try {
                logger.build(`Rebuilding due to changes in ${changedFiles.length} files...`);
                buildStats.reset().start();

                const hasPureScriptChanges = changedFiles.some(file => file.endsWith('.purs'));

                if (hasPureScriptChanges) {
                  const buildSuccess = await buildPureScript();
                  
                  if (!buildSuccess) {
                    logger.error('Skipping site generation due to PureScript build failure');
                    buildStats.failures++;
                    return;
                  }
                  
                  buildStats.successes++;
                }

                await generateSite();
                buildStats.successes++;

                buildStats.end();
                logger.perf(`Rebuild completed in ${buildStats.getTimeInSeconds().toFixed(2)}s`);

                server.triggerReload();
              } catch (error) {
                logger.error(`Error during rebuild: ${error.message}`);
                buildStats.failures++;
              } finally {
                isBuilding = false;
                
                if (pendingChanges.size > 0 || buildQueued) {
                  queueBuild(changedFiles[0]);
                }
              }
            }, 100);
          };

          // Set up file watchers
          const srcWatcher = setupEnhancedFileWatcher(
            path.join(__dirname, 'src'),
            (eventType, filePath) => {
              pendingChanges.add(filePath);
              queueBuild(filePath);
            }
          );
          
          logger.info('Watching for changes. Press Ctrl+C to stop.');
          
          // Handle graceful shutdown
          const cleanup = () => {
            logger.info('Shutting down servers and file watchers...');
            server.server.stop();
            srcWatcher.close();
            logger.success('Cleanup complete. Exiting...');
            process.exit(0);
          };
          
          process.on('SIGINT', cleanup);
          process.on('SIGTERM', cleanup);
          process.on('SIGHUP', cleanup);
        } else {
          logger.error('Failed to start development server. Exiting...');
          process.exit(1);
        }
      })();
    } catch (error) {
      logger.error(`Error starting development environment: ${error.message}`);
      process.exit(1);
    }
  });
} else {
  // One-time run
  logger.info('Running PureScript with Bun...');
  
  buildSite().then(success => {
    if (success) {
      logger.success('Execution complete!');
    } else {
      logger.error('Build failed');
      process.exit(1);
    }
  }).catch(error => {
    logger.error(`Error running PureScript with Bun: ${error.message}`);
    process.exit(1);
  });
}

// Add HMR server functionality
async function createHMRServer(port = 3001) {
  if (!isBun) {
    logger.warn('HMR server is only available when running with Bun');
    return null;
  }

  const clients = new Set();

  const server = Bun.serve({
    port,
    websocket: {
      open(ws) {
        clients.add(ws);
        logger.debug('HMR client connected');
      },
      close(ws) {
        clients.delete(ws);
        logger.debug('HMR client disconnected');
      },
      message(ws, message) {
        // Handle any client messages if needed
      }
    },
    fetch(req) {
      // Handle WebSocket upgrade
      if (server.upgrade(req)) {
        return;
      }
      return new Response('HMR Server Running', { status: 200 });
    }
  });

  return {
    server,
    notifyClients(type, data) {
      const message = JSON.stringify({ type, data });
      for (const client of clients) {
        client.send(message);
      }
    }
  };
}

// Add development server with HMR support
async function createDevServer(distDir, port) {
  if (!isBun) {
    logger.warn('Development server is only available when running with Bun');
    return null;
  }

  let currentPort = port;
  let maxAttempts = 10;
  let server;
  let hmr;

  while (maxAttempts > 0) {
    try {
      // Start HMR server first
      hmr = await createHMRServer(currentPort + 1);
      
      // Then start the main server
      server = Bun.serve({
        port: currentPort,
        development: true,
        async fetch(req) {
          const url = new URL(req.url);
          
          // Inject HMR client script for HTML requests
          if (url.pathname.endsWith('.html') || url.pathname.endsWith('/')) {
            let filePath = path.join(distDir, url.pathname === '/' ? 'index.html' : url.pathname);
            
            // If path doesn't have an extension, try to serve index.html
            if (!path.extname(filePath)) {
              filePath = path.join(filePath, 'index.html');
            }

            if (fs.existsSync(filePath)) {
              let html = await Bun.file(filePath).text();
              
              // Inject HMR client script
              const hmrScript = `
                <script>
                  (function() {
                    const ws = new WebSocket('ws://localhost:${currentPort + 1}');
                    ws.onmessage = (event) => {
                      const msg = JSON.parse(event.data);
                      if (msg.type === 'reload') {
                        window.location.reload();
                      }
                    };
                    ws.onclose = () => {
                      console.log('HMR connection closed. Attempting to reconnect...');
                      setTimeout(() => window.location.reload(), 1000);
                    };
                  })();
                </script>
              `;
              html = html.replace('</head>', `${hmrScript}</head>`);
              return new Response(html, {
                headers: { 'Content-Type': 'text/html' }
              });
            }
          }

          // Serve other static files
          let filePath = path.join(distDir, url.pathname);
          if (fs.existsSync(filePath)) {
            return new Response(Bun.file(filePath));
          }

          return new Response('Not Found', { status: 404 });
        }
      });

      logger.success(`Dev server started on port ${currentPort}`);
      logger.success(`HMR server started on port ${currentPort + 1}`);
      break;
    } catch (err) {
      if (err.code === 'EADDRINUSE') {
        logger.info(`Port ${currentPort} is in use, trying ${currentPort + 2}...`);
        currentPort += 2;
        maxAttempts--;
        continue;
      }
      throw err;
    }
  }

  if (!server || !hmr) {
    throw new Error(`Could not find available ports after ${10 - maxAttempts} attempts`);
  }

  return {
    port: currentPort,
    server,
    hmr,
    triggerReload() {
      hmr.notifyClients('reload');
    }
  };
} 