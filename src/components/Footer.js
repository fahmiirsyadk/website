// Footer component stub
// Instead of importing from PureScript output, we'll define it directly

/**
 * Render a footer component
 */
export function render(props = {}) {
  const currentYear = new Date().getFullYear();
  
  return `
    <div class="text-center p-4 text-sm text-gray-600">
      <p>fa-h ${currentYear} | Dust 0.1.0</p>
      <div class="flex justify-center space-x-4 mt-2">
        <a href="#" class="text-gray-600 hover:text-gray-900">Home</a>
        <a href="#" class="text-gray-600 hover:text-gray-900">About</a>
        <a href="#" class="text-gray-600 hover:text-gray-900">Archive</a>
      </div>
    </div>
  `;
} 
// Export the render function directly
export const render = Footer.render; 