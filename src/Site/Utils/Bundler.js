// Import dependencies
import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

// Check if running in Bun environment
const isBun = typeof Bun !== 'undefined';

// Ensure directory exists helper function
function ensureDir(dirPath) {
  if (isBun) {
    try {
      Bun.spawnSync(['mkdir', '-p', dirPath]);
    } catch (error) {
      console.error(`❌ Error creating directory ${dirPath}: ${error.message}`);
    }
  } else {
    if (!fs.existsSync(dirPath)) {
      try {
        fs.mkdirSync(dirPath, { recursive: true });
      } catch (error) {
        console.error(`❌ Error creating directory ${dirPath}: ${error.message}`);
      }
    }
  }
}

// Bundle CSS files using Bun
export function bundleCssImpl(input) {
  return function(output) {
    return function() {
      if (!isBun) {
        console.error("❌ Bun is not available. Using fallback CSS bundler.");
        return bundleCssFallbackImpl(input)(output)();
      }
      
      try {
        // Ensure output directory exists
        const outputDir = path.dirname(output);
        ensureDir(outputDir);
        
        // Build with Bun's bundler
        Bun.build({
          entrypoints: [input],
          outdir: outputDir,
          naming: path.basename(output),
          minify: process.env.NODE_ENV === 'production',
        }).then(() => {
          console.log(`✅ CSS bundled successfully to ${output}`);
        }).catch(error => {
          console.error(`❌ Error bundling CSS: ${error.message}`);
          // Try fallback if Bun build fails
          console.log("Trying fallback CSS bundler...");
          bundleCssFallbackImpl(input)(output)();
        });
      } catch (error) {
        console.error(`❌ Error in Bun CSS bundler: ${error.message}`);
        // Try fallback if Bun build fails
        console.log("Trying fallback CSS bundler...");
        bundleCssFallbackImpl(input)(output)();
      }
    };
  };
}

// Bundle JavaScript files using Bun
export function bundleJsImpl(input) {
  return function(output) {
    return function() {
      if (!isBun) {
        console.error("❌ Bun is not available. Cannot use Bun JS bundler.");
        return;
      }
      
      try {
        // Ensure output directory exists
        const outputDir = path.dirname(output);
        ensureDir(outputDir);
        
        // Build with Bun's bundler
        Bun.build({
          entrypoints: [input],
          outdir: outputDir,
          naming: path.basename(output),
          minify: process.env.NODE_ENV === 'production',
          target: 'browser',
        }).then(() => {
          console.log(`✅ JavaScript bundled successfully to ${output}`);
        }).catch(error => {
          console.error(`❌ Error bundling JavaScript: ${error.message}`);
        });
      } catch (error) {
        console.error(`❌ Error in Bun JS bundler: ${error.message}`);
      }
    };
  };
}

// Bundle CSS files using fallback (TailwindCSS CLI)
export function bundleCssFallbackImpl(input) {
  return function(output) {
    return function() {
      try {
        // Ensure output directory exists
        const outputDir = path.dirname(output);
        ensureDir(outputDir);
        
        // Use TailwindCSS CLI as fallback
        const minifyFlag = process.env.NODE_ENV === 'production' ? '--minify' : '';
        
        if (isBun) {
          // Use Bun.spawn for running TailwindCSS
          Bun.spawnSync([
            'tailwindcss',
            '-i', input,
            '-o', output,
            ...(minifyFlag ? [minifyFlag] : [])
          ]);
        } else {
          // Use Node.js execSync as fallback
          execSync(`tailwindcss -i ${input} -o ${output} ${minifyFlag}`, {
            stdio: 'inherit'
          });
        }
        
        console.log(`✅ CSS bundled with TailwindCSS CLI to ${output}`);
      } catch (error) {
        console.error(`❌ Error in TailwindCSS CLI: ${error.message}`);
      }
    };
  };
} 