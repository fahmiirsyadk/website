// Cache for loaded components
const componentCache = new Map();

// Attempt to import a component from various possible locations and formats
async function tryImportComponent(name) {
  const possiblePaths = [
    // JS components
    `../components/${name}.js`,
    `../components/${name.toLowerCase()}.js`,
  ];
  
  for (const path of possiblePaths) {
    try {
      // Try dynamic import
      const module = await import(path);
      console.log(`✅ Loaded component from ${path}`);
      return module.default || module;
    } catch (e) {
      // Continue to next path
      console.log(`❌ Failed to load component from ${path}: ${e.message}`);
    }
  }
  
  // If we get here, we couldn't load the component
  throw new Error(`Could not load component: ${name}`);
}

// Load a component by name
export function loadComponentImpl(name) {
  return function() {
    // Check cache first
    if (componentCache.has(name)) {
      return componentCache.get(name);
    }
    
    try {
      // First try to load from PureScript components
      let component;
      
      try {
        // First check if we have a PureScript component
        const componentModule = require(`../components/${name}`);
        component = componentModule;
        console.log(`✅ Loaded PureScript component: ${name}`);
      } catch (e) {
        try {
          // Try JavaScript components
          component = require(`../components/${name}.js`);
          console.log(`✅ Loaded JavaScript component: ${name}`);
        } catch (e2) {
          console.error(`❌ Could not load component: ${name}`);
          // Return an empty component that renders nothing
          component = { render: () => "" };
        }
      }
      
      // Cache the component
      componentCache.set(name, component);
      return component;
    } catch (error) {
      console.error(`❌ Error loading component ${name}:`, error);
      return { render: () => `<!-- Error loading component ${name} -->` };
    }
  };
}

// Render a component with props
export function renderComponentImpl(component) {
  return function(props) {
    return function() {
      try {
        // Check if it's a PureScript component with render function
        if (component && typeof component.render === 'function') {
          return component.render(props);
        }
        
        // Handle different JavaScript component types
        if (typeof component === 'function') {
          // React-style component
          return component(props);
        } else if (component && typeof component.template === 'string') {
          // Component with template string
          // Simple template substitution
          let html = component.template;
          for (const [key, value] of Object.entries(props)) {
            html = html.replace(new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g'), value);
          }
          return html;
        } else {
          console.error("❌ Component doesn't have a valid render method or template:", component);
          return `<!-- Invalid component format -->`;
        }
      } catch (error) {
        console.error("❌ Error rendering component:", error);
        return `<!-- Error rendering component: ${error.message} -->`;
      }
    };
  };
} 