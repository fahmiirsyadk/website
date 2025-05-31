// @ts-check

"use strict";

import fs from 'fs-extra';
import path from 'path';
import fastGlob from 'fast-glob';

// TypeScript declaration for Bun
// @ts-ignore
const Bun = globalThis.Bun;

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

// Check if we're running in Bun
export function isBunRuntime() {
  return typeof Bun !== 'undefined';
}

// Find files matching a pattern
export function findFilesImpl(pattern) {
  return () => {
    try {
      return fastGlob.sync(pattern, {
        cwd: process.cwd(),
        dot: false,
        ignore: ['**/node_modules/**', '**/.git/**'],
        absolute: true,
        onlyFiles: true
      });
    } catch (err) {
      logError(`Error in findFiles: ${err.message}`);
      return [];
    }
  };
}

// Check if path is a directory
export function isDirectoryImpl(path) {
  return () => {
    try {
      return fs.statSync(path).isDirectory();
    } catch (err) {
      return false;
    }
  };
}

// Remove a file
export function removeFileImpl(path) {
  return () => {
    try {
      fs.removeSync(path);
    } catch (err) {
      logError(`Error removing file ${path}: ${err.message}`);
    }
  };
}

// Write text file
export function nodeWriteTextFile(path, content) {
  return () => {
    try {
      fs.outputFileSync(path, content, 'utf8');
    } catch (err) {
      logError(`Error writing file ${path}: ${err.message}`);
    }
  };
}

// Ensure directory exists
export function ensureDirImpl(dirPath) {
  return () => {
    try {
      fs.ensureDirSync(dirPath);
    } catch (err) {
      logError(`Error creating directory ${dirPath}: ${err.message}`);
    }
  };
}

// Check if file exists
export function existsImpl(path) {
  return () => {
    try {
      return fs.pathExistsSync(path);
    } catch (err) {
      return false;
    }
  };
}

// Find files using glob pattern
export function globImpl(patterns) {
  return () => {
    try {
      const files = fastGlob.sync(patterns);
      debug(`Found ${files.length} files`);
      return files;
    } catch (err) {
      logError(`Error in glob: ${err.message}`);
      return [];
    }
  };
}

// Copy folder recursively
export function copyFolderImpl(src) {
  return (dest) => () => {
    try {
      debug(`Copying folder from ${src} to ${dest}`);
      
      // Remove destination if it exists
      if (fs.existsSync(dest)) {
        fs.removeSync(dest);
      }
      
      // Create destination directory
      fs.ensureDirSync(dest);
      
      // Copy directory recursively
      fs.copySync(src, dest, {
        overwrite: true,
        errorOnExist: false,
        dereference: true,
        preserveTimestamps: true
      });
      
      debug(`Successfully copied ${src} to ${dest}`);
      return null;
    } catch (err) {
      logError(`Error in copyFolder: ${err.message}`);
      return null;
    }
  };
}

// Write file with directory creation
export function writeFileWithDirImpl(filePath) {
  return (content) => () => {
    try {
      fs.outputFileSync(filePath, content, 'utf8');
      debug(`Successfully wrote file: ${filePath}`);
      return null;
    } catch (err) {
      logError(`Error in writeFileWithDir: ${err.message}`);
      return null;
    }
  };
}

// Create a directory recursively
export function mkdirRecursiveImpl(dirPath) {
  return () => {
    try {
      fs.ensureDirSync(dirPath);
    } catch (err) {
      logError(`Error in mkdirRecursive: ${err.message}`);
    }
  };
}

// Write text to a file with UTF-8 encoding
export function writeTextFileImpl(filePath, content) {
  return () => {
    try {
      fs.outputFileSync(filePath, content, 'utf8');
    } catch (err) {
      logError(`Error in writeTextFile: ${err.message}`);
    }
  };
} 
