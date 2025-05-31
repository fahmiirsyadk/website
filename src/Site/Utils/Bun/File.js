// FFI implementations for Bun's file operations
"use strict";

// Check if we're running in Bun
const isBun = typeof Bun !== 'undefined';

// Helper to ensure we're running in Bun
function ensureBun() {
  if (!isBun) {
    throw new Error("This module requires Bun runtime");
  }
}

// Check if a file exists
export function fileExistsImpl(path) {
  ensureBun();
  try {
    return Bun.file(path).size !== null;
  } catch (e) {
    return false;
  }
}

// Read a file as text (returns a Promise)
export function readTextFileImpl(path) {
  ensureBun();
  try {
    return Bun.file(path).text();
  } catch (e) {
    return Promise.reject(new Error(`Failed to read text file ${path}: ${e.message}`));
  }
}

// Read a file as binary (returns a Promise)
export function readBinaryFileImpl(path) {
  ensureBun();
  try {
    return Bun.file(path).arrayBuffer();
  } catch (e) {
    return Promise.reject(new Error(`Failed to read binary file ${path}: ${e.message}`));
  }
}

// Write data to a file (returns a Promise)
export function writeFileImpl(path, content) {
  ensureBun();
  try {
    return Bun.write(path, content).then(() => true);
  } catch (e) {
    return Promise.reject(new Error(`Failed to write file ${path}: ${e.message}`));
  }
}

// Remove a file (returns a Promise)
export function removeFileImpl(path) {
  ensureBun();
  try {
    return Bun.file(path).remove().then(() => true);
  } catch (e) {
    return Promise.reject(new Error(`Failed to remove file ${path}: ${e.message}`));
  }
}

// Get file stats
export function fileStatsImpl(path) {
  ensureBun();
  try {
    const file = Bun.file(path);
    const size = file.size;
    
    if (size === null) {
      return null;
    }
    
    return { size };
  } catch (e) {
    return null;
  }
}

// Create a directory (returns a Promise)
export function mkdirImpl(path, recursive) {
  ensureBun();
  
  // Bun doesn't have a direct mkdir API, so we use this workaround
  return new Promise((resolve, reject) => {
    try {
      // Check if directory already exists
      const placeholderFile = `${path}/.placeholder`;
      
      // First check if the path already exists as a directory
      if (fileExistsImpl(`${path}/`)) {
        resolve(true);
        return;
      }
      
      // Create directory by writing a placeholder file
      Bun.write(placeholderFile, "")
        .then(() => {
          // Try to remove the placeholder file
          try {
            Bun.file(placeholderFile).remove();
          } catch (e) {
            // Ignore errors removing placeholder
          }
          resolve(true);
        })
        .catch(err => {
          if (recursive) {
            // Create parent directory first
            const parentDir = path.split('/').slice(0, -1).join('/');
            if (parentDir) {
              mkdirImpl(parentDir, true)
                .then(() => mkdirImpl(path, false))
                .then(resolve)
                .catch(reject);
            } else {
              reject(new Error(`Failed to create directory ${path}: ${err.message}`));
            }
          } else {
            reject(new Error(`Failed to create directory ${path}: ${err.message}`));
          }
        });
    } catch (e) {
      reject(new Error(`Failed to create directory ${path}: ${e.message}`));
    }
  });
} 