<h1 align="center">site</h1>
<p align="center">
Personal website to unify my fragmented thoughts
</p>

<br>

<p align="center">
  <img src="./src/public/assets/images/logo.svg" alt="logo" />
</p>
<p align="center">built with purescript</p>

<br>

## Architecture of this site

- [Bun](https://bun.sh/)
- [PureScript](https://www.purescript.org/) (v0.15.0 or higher)
- [Spago](https://github.com/purescript/spago) (v0.20.0 or higher)

### Installation

```bash
# Clone the repository
git clone https://github.com/fahmiirsyadk/site/
cd site

# Install dependencies
bun install
```

### Development

To start the development server:

```bash
bun dev
```

This will:
1. Build the PureScript code
2. Compile Tailwind CSS
3. Start a development server with hot reloading
4. Serve assets directly from source directories

### Production Build

To create a production build:

```bash
bun build:prod
```

This will:
1. Build the PureScript code with optimizations
2. Compile and minify Tailwind CSS
3. Copy and optimize all assets to the `dist` directory
4. Generate optimized HTML files

### Directory Structure

```
├── src/
│   ├── pages/          # PureScript page components
│   ├── posts/          # Markdown content
│   │   ├── articles/   # Blog posts
│   │   └── projects/   # Project pages
│   ├── public/         # Static assets
│   │   └── assets/
│   │       ├── images/
│   │       ├── fonts/
│   │       └── js/
│   └── Site/           # Core site generator code
├── tailwind/           # Tailwind CSS configuration
├── dist/               # Generated site output
├── output/             # PureScript compiled output
├── run-with-bun.js     # Build and server script
└── package.json        # Project configuration
```

## Asset Handling

Assets are handled differently in development and production:

- **Development**: Assets are served directly from `src/public/assets/*` for faster development
- **Production**: Assets are copied to `dist/assets/*` with proper optimization

## Scripts

- `bun dev`: Start development server (mostly for dev mode)
- `bun build`: Build for development
- `bun build:prod`: Build for production
- `bun clean`: Clean build outputs
- `bun serve`: Alias for dev
- `bun spago:build`: Build PureScript code only
- `bun spago:watch`: Watch and build PureScript code
- `bun generate-images`: Generate placeholder images for testing

## Customization

To customize the site:

1. Edit PureScript components in `src/pages/`
2. Add content in `src/posts/`
3. Add assets in `src/public/assets/`
4. Modify Tailwind config in `tailwind/`

## Optimizations

The project now leverages Bun's native APIs for improved performance:

- **File System Operations**: Using Bun's file APIs instead of Node.js fs module
- **Process Management**: Using Bun.spawn instead of child_process for better performance
- **Hot Module Reloading**: Implemented using Bun's WebSocket capabilities
- **Bundling**: Utilizing Bun's built-in bundler for JS and CSS
- **Development Server**: Fast static file serving with Bun.serve()

## Ongoing Improvements

1. [x] Create PureScript modules for server configuration and data management
2. [x] Move site generation to PureScript
3. [x] Optimize file operations with Bun's native APIs
4. [ ] Enhance the collections module
5. [ ] Create PureScript-based file watchers for development
6. [ ] Implement hot module reloading in PureScript

