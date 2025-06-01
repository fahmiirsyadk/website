// @ts-check

"use strict";

import fs from 'fs';
import path from 'path';
import fastGlob from 'fast-glob';

// Check if we're in a Bun environment
const isBun = typeof Bun !== 'undefined';

// Debug flag
const isDebug = process.env.DEBUG === 'true';

// Debug helper
function debug(message) {
  if (isDebug) {
    console.log(`[FFI Debug] ${message}`);
  }
}

// Error logging
function logError(message) {
  console.error(`[FFI Error] ${message}`);
}

// Simple recursive mkdir
function mkdirSync(dirPath) {
  try {
    if (isBun) {
      // Use Bun's APIs when available
      if (!Bun.file(dirPath).size) {
        debug(`Creating directory with Bun: ${dirPath}`);
        // Use Bun.spawnSync for mkdir since Bun.mkdir doesn't exist
        Bun.spawnSync(['mkdir', '-p', dirPath]);
        debug(`Created directory with Bun: ${dirPath}`);
      } else {
        debug(`Directory already exists: ${dirPath}`);
      }
    } else if (!fs.existsSync(dirPath)) {
      debug(`Creating directory with Node.js: ${dirPath}`);
      fs.mkdirSync(dirPath, { recursive: true });
      debug(`Created directory with Node.js: ${dirPath}`);
    } else {
      debug(`Directory already exists: ${dirPath}`);
    }
  } catch (err) {
    logError(`Failed to create directory ${dirPath}: ${err.message}`);
  }
}

// File exists implementation that works with both Bun and Node.js
function fileExists(filePath) {
  if (isBun) {
    try {
      return Bun.file(filePath).size !== null;
    } catch (e) {
      return false;
    }
  } else {
    return fs.existsSync(filePath);
  }
}

// Check if we're running in a Bun environment
export const isBunEnvironmentImpl = () => {
  debug(`Checking for Bun environment: ${isBun}`);
  return isBun;
};

// Ensure directory exists
export const ensureDirImpl = (dirPath) => () => {
  debug(`ensureDirImpl called with: ${dirPath}`);
  mkdirSync(dirPath);
  return null;
};

// Find files matching a glob pattern
export const globImpl = (patterns) => () => {
  debug(`globImpl called with: ${JSON.stringify(patterns)}`);
  try {
    const files = fastGlob.sync(patterns);
    debug(`Found ${files.length} files`);
    return files;
  } catch (err) {
    logError(`Error in glob: ${err.message}`);
    return [];
  }
};

// Copy folder recursively
export const copyFolderImpl = (src) => (dest) => () => {
  debug(`copyFolderImpl called with: ${src} -> ${dest}`);
  try {
    // Create destination directory
    mkdirSync(dest);
    
    // Simple recursive copy
    function copyRecursive(src, dest) {
      if (isBun) {
        // Using Bun APIs
        const isDir = Bun.spawnSync(['test', '-d', src]).exitCode === 0;
        
        if (isDir) {
          if (!fileExists(dest)) {
            // Use Bun.spawnSync for mkdir since Bun.mkdir doesn't exist
            Bun.spawnSync(['mkdir', '-p', dest]);
          }
          
          const entries = Bun.spawnSync(['ls', src]);
          const files = new TextDecoder().decode(entries.stdout).trim().split('\n').filter(Boolean);
          
          for (const entry of files) {
            const srcPath = path.join(src, entry);
            const destPath = path.join(dest, entry);
            copyRecursive(srcPath, destPath);
          }
        } else {
          // It's a file, copy it
          Bun.write(dest, Bun.file(src));
        }
      } else {
        // Using Node.js
        const stats = fs.statSync(src);
        
        if (stats.isDirectory()) {
          if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest, { recursive: true });
          }
          
          const entries = fs.readdirSync(src);
          for (const entry of entries) {
            const srcPath = path.join(src, entry);
            const destPath = path.join(dest, entry);
            copyRecursive(srcPath, destPath);
          }
        } else if (stats.isFile()) {
          fs.copyFileSync(src, dest);
        }
      }
    }
    
    if (fileExists(src)) {
      copyRecursive(src, dest);
      debug(`Successfully copied ${src} to ${dest}`);
    } else {
      debug(`Source directory does not exist: ${src}`);
    }
    
    return null;
  } catch (err) {
    logError(`Error in copyFolder: ${err.message}`);
    return null;
  }
};

// Write file with directory creation
export const writeFileWithDirImpl = (filePath) => (content) => () => {
  debug(`writeFileWithDirImpl called with: ${filePath}`);
  try {
    const dir = path.dirname(filePath);
    
    // Create directory if it doesn't exist
    mkdirSync(dir);
    
    // Write file
    if (isBun) {
      Bun.write(filePath, content);
    } else {
      fs.writeFileSync(filePath, content, 'utf8');
    }
    debug(`Successfully wrote file: ${filePath}`);
    
    return null;
  } catch (err) {
    logError(`Error in writeFileWithDir: ${err.message}`);
    return null;
  }
};

// Check if a file or directory exists
export const existsImpl = (path) => () => {
  return fileExists(path);
};

// Create a directory recursively
export const mkdirRecursiveImpl = (dirPath) => () => {
  mkdirSync(dirPath);
};

// Write text to a file with UTF-8 encoding
export const writeTextFileImpl = (filePath, content) => () => {
  if (isBun) {
    Bun.write(filePath, content);
  } else {
    fs.writeFileSync(filePath, content, 'utf8');
  }
};

// Read text from a file with UTF-8 encoding
export const readTextFileImpl = (filePath) => () => {
  if (isBun) {
    return Bun.file(filePath).text();
  } else {
    return fs.readFileSync(filePath, 'utf8');
  }
}; 
