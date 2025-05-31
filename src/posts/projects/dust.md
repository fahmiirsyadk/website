---
title: Dust - A Static Site Generator
date: 2023-06-10
slug: dust-project
tags: [project, purescript, bun, static-site]
---

# Dust: A Static Site Generator

Dust is a static site generator built with PureScript and Bun, designed to create fast, type-safe websites with minimal configuration.

## Key Features

- **PureScript-first**: Leverage the power of PureScript's type system for creating reliable components
- **Bun-powered**: Ultra-fast builds and development experience
- **Markdown content**: Write content in Markdown with frontmatter support
- **Customizable templates**: Create reusable templates for different content types
- **Tailwind CSS integration**: Beautiful, responsive designs with minimal CSS

## Implementation Details

The core of Dust is built around a component system that allows mixing PureScript and JavaScript components seamlessly. Content is stored as Markdown files with YAML frontmatter for metadata.

```purescript
module Site.Generator where

import Prelude
import Effect (Effect)
import Effect.Console (log)
import Site.Config (Config)

-- Generate the site from a configuration
generateSite :: Config -> Effect Unit
generateSite config = do
  log "Generating site..."
  -- Site generation logic
  log "Site generated successfully!"
```

## Getting Started

To use Dust for your own site, clone the repository and customize the templates and content to fit your needs.

Stay tuned for more updates and documentation as the project evolves!
