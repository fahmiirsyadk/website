module Site.Generator where

import Prelude

import Data.Array (length, sortBy)
import Data.Either (Either(..))
import Data.Maybe (Maybe(..))
import Data.String (Pattern(..), Replacement(..), replaceAll)
import Data.Traversable (traverse)
import Effect.Aff (Aff, catchError, try)
import Effect.Class (liftEffect)
import Effect.Console as Console
import Effect.Exception (message)
import Node.Encoding (Encoding(..))
import Node.FS.Aff (readTextFile)
import Node.Path (FilePath, concat)
import Site.Config (SiteConfig)
import Site.Utils.Bundler (bundleCss, bundleJs)
import Site.Utils.FileSystem (ensureDir, glob, writeFileWithDir, copyFolder)
import Site.Templates as T
import Site.Html as H
import Site.Utils.Foreign (parseMarkdown)

-- | Safe wrapper for catching errors
safeDo :: forall a. String -> Aff a -> Aff (Maybe a)
safeDo operationName action = do
  liftEffect $ Console.log $ "⏳ Starting: " <> operationName
  result <- try action
  case result of
    Left err -> do
      liftEffect $ Console.log $ "❌ Error during " <> operationName <> ": " <> message err
      pure Nothing
    Right value -> do
      liftEffect $ Console.log $ "✅ Completed: " <> operationName
      pure (Just value)

-- | Format path for globbing
formatPath :: String -> String
formatPath path = replaceAll (Pattern "\\") (Replacement "/") path

-- | Generate the site
generateSite :: SiteConfig -> Aff Unit
generateSite config = do
  liftEffect $ Console.log "🔄 Generating site..."
  
  -- Create output directory
  liftEffect $ Console.log "📁 Creating output directory..."
  _ <- safeDo "creating output directory" $ ensureDir config.output
  
  -- Process collections
  liftEffect $ Console.log "📝 Processing collections..."
  _ <- safeDo "processing collections" $ processCollections config
  
  -- Process pages
  liftEffect $ Console.log "📄 Processing pages..."
  _ <- safeDo "processing pages" $ processPages config
  
  -- Process assets
  liftEffect $ Console.log "🖼️ Processing assets..."
  _ <- safeDo "processing assets" $ processAssets config
  
  liftEffect $ Console.log "✅ Site generation complete!"

-- | Process a markdown file and convert it to HTML
processMarkdownFile :: SiteConfig -> FilePath -> Aff Unit
processMarkdownFile config filePath = catchError 
  (do
    liftEffect $ Console.log $ "📝 Processing file: " <> filePath
    content <- readTextFile UTF8 filePath
    
    liftEffect $ Console.log $ "🔍 Parsing markdown: " <> filePath
    let 
      parsed = parseMarkdown content
      post = 
        { title: parsed.matter.title
        , date: parsed.matter.date
        , content: parsed.html
        , slug: parsed.matter.slug
        , tags: parsed.matter.tags
        }
      
    -- Use our async template system
    liftEffect $ Console.log $ "🔄 Rendering template for: " <> filePath
    templateHtml <- T.postTemplate post
    let html = H.render templateHtml
      
    -- Get the output path
    let outputPath = concat [config.output, "/", post.slug <> ".html"]
    
    -- Ensure output directory exists
    _ <- safeDo ("ensuring directory for " <> outputPath) $ ensureDir config.output
    
    -- Write the file
    liftEffect $ Console.log $ "💾 Writing file: " <> outputPath
    _ <- safeDo ("writing file " <> outputPath) $ writeFileWithDir outputPath html
    
    liftEffect $ Console.log $ "📄 Generated: " <> outputPath)
  (\err -> do
    liftEffect $ Console.log $ "❌ Error processing " <> filePath <> ": " <> message err
    pure unit)

-- | Process all collections
processCollections :: SiteConfig -> Aff Unit
processCollections config = do
  -- Get all markdown files in the posts directory
  let postsGlob = formatPath (config.base <> "/posts/**/*.md")
  liftEffect $ Console.log $ "🔍 Finding markdown files in: " <> postsGlob
  filesResult <- safeDo "finding markdown files" $ glob [postsGlob]
  
  case filesResult of
    Nothing -> liftEffect $ Console.log "⚠️ No post files found or error occurred"
    Just files -> do
      liftEffect $ Console.log $ "📊 Found " <> show (length files) <> " files to process"
      
      -- Process each file
      _ <- traverse (processMarkdownFile config) files
      
      -- Generate index and archive pages
      liftEffect $ Console.log "📑 Generating index page..."
      _ <- safeDo "generating index page" $ generateIndexPage config files
      
      liftEffect $ Console.log "📚 Generating archive page..."
      _ <- safeDo "generating archive page" $ generateArchivePage config files
      
      pure unit

-- | Generate the index page
generateIndexPage :: SiteConfig -> Array FilePath -> Aff Unit
generateIndexPage config files = catchError
  (do
    -- Get all posts
    liftEffect $ Console.log "📑 Loading posts for index page..."
    posts <- traverse loadPost files
    
    -- Sort by date (newest first)
    liftEffect $ Console.log "📅 Sorting posts by date..."
    let sortedPosts = sortBy (\a b -> compare b.date a.date) posts
    
    -- Use our async template system
    liftEffect $ Console.log "🔄 Rendering index template..."
    templateHtml <- T.indexTemplate "Blog" sortedPosts
    let html = H.render templateHtml
    
    let outputPath = concat [config.output, "/index.html"]
    
    -- Write the file
    liftEffect $ Console.log $ "💾 Writing index file: " <> outputPath
    _ <- safeDo ("writing index file " <> outputPath) $ writeFileWithDir outputPath html
    
    liftEffect $ Console.log $ "📄 Generated: index.html")
  (\err -> do
    liftEffect $ Console.log $ "❌ Error generating index page: " <> message err
    pure unit)
  
  where
    loadPost :: FilePath -> Aff T.Post
    loadPost filePath = do
      liftEffect $ Console.log $ "📝 Loading post: " <> filePath
      content <- readTextFile UTF8 filePath
      let 
        parsed = parseMarkdown content
        post = 
          { title: parsed.matter.title
          , date: parsed.matter.date
          , content: parsed.html
          , slug: parsed.matter.slug
          , tags: parsed.matter.tags
          }
      pure post

-- | Generate the archive page
generateArchivePage :: SiteConfig -> Array FilePath -> Aff Unit
generateArchivePage config files = catchError
  (do
    -- Get all posts
    liftEffect $ Console.log "📚 Loading posts for archive page..."
    posts <- traverse loadPost files
    
    -- Sort by date (newest first)
    liftEffect $ Console.log "📅 Sorting posts by date..."
    let sortedPosts = sortBy (\a b -> compare b.date a.date) posts
    
    -- Use our async template system
    liftEffect $ Console.log "🔄 Rendering archive template..."
    templateHtml <- T.archiveTemplate sortedPosts
    let html = H.render templateHtml
    
    let outputPath = concat [config.output, "/archive.html"]
    
    -- Write the file
    liftEffect $ Console.log $ "💾 Writing archive file: " <> outputPath
    _ <- safeDo ("writing archive file " <> outputPath) $ writeFileWithDir outputPath html
    
    liftEffect $ Console.log $ "📄 Generated: archive.html")
  (\err -> do
    liftEffect $ Console.log $ "❌ Error generating archive page: " <> message err
    pure unit)
  
  where
    loadPost :: FilePath -> Aff T.Post
    loadPost filePath = do
      liftEffect $ Console.log $ "📝 Loading post: " <> filePath
      content <- readTextFile UTF8 filePath
      let 
        parsed = parseMarkdown content
        post = 
          { title: parsed.matter.title
          , date: parsed.matter.date
          , content: parsed.html
          , slug: parsed.matter.slug
          , tags: parsed.matter.tags
          }
      pure post

-- | Process pages
processPages :: SiteConfig -> Aff Unit
processPages config = do
  -- Get all markdown files in the pages directory
  let pagesGlob = formatPath (config.base <> "/pages/**/*.md")
  liftEffect $ Console.log $ "🔍 Finding pages in: " <> pagesGlob
  filesResult <- safeDo "finding pages" $ glob [pagesGlob]
  
  case filesResult of
    Nothing -> liftEffect $ Console.log "⚠️ No page files found or error occurred"
    Just files -> do
      liftEffect $ Console.log $ "📊 Found " <> show (length files) <> " pages to process"
      
      -- Process each file
      _ <- traverse (processPage config) files
      
      pure unit

-- | Process a page file
processPage :: SiteConfig -> FilePath -> Aff Unit
processPage config filePath = catchError
  (do
    liftEffect $ Console.log $ "📝 Processing page: " <> filePath
    content <- readTextFile UTF8 filePath
    
    liftEffect $ Console.log $ "🔍 Parsing markdown: " <> filePath
    let 
      parsed = parseMarkdown content
      page = 
        { title: parsed.matter.title
        , content: parsed.html
        , slug: parsed.matter.slug
        }
    
    -- Use our page template
    liftEffect $ Console.log $ "🔄 Rendering page template for: " <> filePath
    templateHtml <- T.pageTemplate page.title page.content
    let html = H.render templateHtml
    
    -- Get the output path
    let outputPath = concat [config.output, "/", page.slug <> ".html"]
    
    -- Ensure output directory exists
    _ <- safeDo ("ensuring directory for " <> outputPath) $ ensureDir config.output
    
    -- Write the file
    liftEffect $ Console.log $ "💾 Writing file: " <> outputPath
    _ <- safeDo ("writing file " <> outputPath) $ writeFileWithDir outputPath html
    
    liftEffect $ Console.log $ "📄 Generated: " <> outputPath)
  (\err -> do
    liftEffect $ Console.log $ "❌ Error processing page " <> filePath <> ": " <> message err
    pure unit)

-- | Process and copy assets
processAssets :: SiteConfig -> Aff Unit
processAssets config = catchError
  (do
    -- Create assets directory
    liftEffect $ Console.log "📁 Creating asset directories..."
    let 
      assetsDir = concat [config.output, "/assets"]
      cssDir = concat [assetsDir, "/css"]
      jsDir = concat [assetsDir, "/js"]
      imagesDir = concat [assetsDir, "/images"]
    
    _ <- safeDo "creating assets directory" $ ensureDir assetsDir
    _ <- safeDo "creating CSS directory" $ ensureDir cssDir
    _ <- safeDo "creating JS directory" $ ensureDir jsDir
    _ <- safeDo "creating images directory" $ ensureDir imagesDir
    
    -- Bundle CSS
    liftEffect $ Console.log "🎨 Processing CSS..."
    let 
      cssInput = "tailwind/tailwind.css"
      cssOutput = concat [cssDir, "/styles.css"]
    
    _ <- safeDo "bundling CSS" $ bundleCss cssInput cssOutput
    
    -- Process JavaScript if it exists
    let jsInput = concat [config.base, "/public/js/main.js"]
    let jsOutput = concat [jsDir, "/main.js"]
    
    _ <- safeDo "bundling JavaScript" $ bundleJs jsInput jsOutput
    
    -- Copy static assets
    liftEffect $ Console.log "📂 Copying static assets..."
    _ <- safeDo "copying static assets" $ copyFolder config.public assetsDir
    
    -- Copy components directory to output for client-side use if needed
    liftEffect $ Console.log "📦 Copying components to output..."
    let 
      componentsDir = concat [config.base, "/components"]
      outputComponentsDir = concat [assetsDir, "/components"]
    
    _ <- safeDo "copying components" $ copyFolder componentsDir outputComponentsDir
    
    liftEffect $ Console.log "🖼️ Assets processed successfully")
  (\err -> do
    liftEffect $ Console.log $ "❌ Error processing assets: " <> message err
    pure unit) 