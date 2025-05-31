// Check if running in Bun environment
const isBun = typeof Bun !== 'undefined';

// Handle imports differently based on environment
let fs, path, glob;

if (isBun) {
  // In Bun, use ES modules
  import('path').then(pathModule => {
    path = pathModule.default;
  });
} else {
  // In Node.js, we need to require these
  fs = require('fs');
  path = require('path');
  // Use a more explicit import in Node.js
  const fg = require('fast-glob');
  glob = fg.sync;
}

// Read a file using Bun's file API if available
export function readFileImpl(filePath) {
  return function() {
    if (isBun) {
      try {
        return Bun.file(filePath);
      } catch (err) {
        console.error(`Error reading file ${filePath}: ${err.message}`);
        return null;
      }
    } else {
      // Fallback to regular file object for Node.js
      try {
        return { path: filePath, content: fs.readFileSync(filePath, 'utf8') };
      } catch (err) {
        console.error(`Error reading file ${filePath}: ${err.message}`);
        return null;
      }
    }
  };
}

// Get text content from a BunFile
export function fileTextImpl(file) {
  return function() {
    if (isBun) {
      // Use Bun's file API
      try {
        return file.text();
      } catch (err) {
        console.error(`Error getting file text: ${err.message}`);
        return '';
      }
    } else {
      // Fallback for Node.js
      return file.content || '';
    }
  };
}

// Write a file using Bun's file API if available
export function writeFileImpl(filePath, content) {
  return function() {
    try {
      if (isBun) {
        // Use Bun's file API
        // Ensure directory exists
        const dirPath = path.dirname(filePath);
        Bun.spawnSync(['mkdir', '-p', dirPath]);
        
        // Write file
        Bun.write(filePath, content);
      } else {
        // Create directories if they don't exist
        const dirPath = path.dirname(filePath);
        if (!fs.existsSync(dirPath)) {
          fs.mkdirSync(dirPath, { recursive: true });
        }
        // Write file
        fs.writeFileSync(filePath, content, 'utf8');
      }
      return null;
    } catch (err) {
      console.error(`Error writing file ${filePath}: ${err.message}`);
      return null;
    }
  };
}

// Copy a file
export function copyFileImpl(src, dest) {
  return function() {
    try {
      if (isBun) {
        // Ensure directory exists
        const dirPath = path.dirname(dest);
        Bun.spawnSync(['mkdir', '-p', dirPath]);
        
        // Read the source file and write to destination
        const content = Bun.file(src).arrayBuffer();
        Bun.write(dest, content);
      } else {
        // Create directories if they don't exist
        const dirPath = path.dirname(dest);
        if (!fs.existsSync(dirPath)) {
          fs.mkdirSync(dirPath, { recursive: true });
        }
        // Copy file
        fs.copyFileSync(src, dest);
      }
      return null;
    } catch (err) {
      console.error(`Error copying file from ${src} to ${dest}: ${err.message}`);
      return null;
    }
  };
}

// Find files using Bun.glob
export function globImpl(pattern) {
  return function() {
    try {
      if (isBun) {
        // Use Bun's glob API
        return Bun.glob(pattern);
      } else {
        // Use fast-glob in Node.js
        return glob(pattern);
      }
    } catch (err) {
      console.error(`Error globbing pattern ${pattern}: ${err.message}`);
      return [];
    }
  };
}

// Check if we're running under Bun
export function isBunImpl() {
  return isBun;
} 