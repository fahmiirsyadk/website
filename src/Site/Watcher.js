import * as chokidar from 'chokidar';
import * as path from 'path';
import kleur from 'kleur';

// Check if we're in a Bun environment
const isBun = typeof Bun !== 'undefined';

// Create a dummy watcher that does nothing
export function createDummyWatcherImpl() {
  return {
    close: () => {}
  };
}

// Watch files for changes and regenerate the site
export function watchFilesImpl(patterns) {
  return function(onChange) {
    return function() {
      console.log(kleur.blue('[Watcher]') + ' Watching for file changes...');
      
      if (isBun) {
        console.log(kleur.green('[Watcher]') + ' Using Bun native file watching');
        
        // Setup watchers for each pattern
        const watchers = patterns.map(pattern => {
          const watcher = {
            pattern,
            dispose: () => {}
          };
          
          // Use Bun's built-in file watching
          try {
            const bunWatcher = Bun.watch(pattern);
            watcher.dispose = () => bunWatcher.stop();
            
            bunWatcher.on('change', (changedPath) => {
              console.log(kleur.yellow('[Watcher]') + ' changed: ' + changedPath);
              onChange(changedPath)();
            });
          } catch (e) {
            console.error(kleur.red('[Watcher]') + ' Error setting up Bun watcher: ' + e.message);
          }
          
          return watcher;
        });
        
        // Return a composite watcher
        return {
          close: () => {
            watchers.forEach(w => w.dispose());
          }
        };
      } else {
        // Use chokidar for Node.js
        console.log(kleur.blue('[Watcher]') + ' Using Chokidar for file watching');
        
        const watcher = chokidar.watch(patterns, {
          persistent: true,
          ignoreInitial: true
        });
        
        watcher.on('all', (event, filePath) => {
          if (event === 'add' || event === 'change' || event === 'unlink') {
            console.log(kleur.yellow('[Watcher]') + ' ' + event + ': ' + filePath);
            onChange(filePath)();
          }
        });
        
        return watcher;
      }
    };
  };
} 