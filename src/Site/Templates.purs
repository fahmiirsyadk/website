module Site.Templates where

import Prelude

import Data.Array (sort)
import Data.Function (on)
import Data.Maybe (Maybe(..))
import Data.String (Pattern(..), Replacement(..), replaceAll)
import Data.Tuple (Tuple(..))
import Effect.Aff (Aff)
import Foreign (Foreign, unsafeToForeign)
import Foreign.Object as Object
import Page.Index as Index
import Site.Components as Components
import Site.Html (Html, fromString)
import Site.Html as H

-- | Type alias for a post
type Post = 
  { title :: String
  , date :: String
  , content :: String
  , slug :: String
  , tags :: Array String
  }

-- | Template for a post
postTemplate :: Post -> Aff Html
postTemplate post = do
  let 
    props = Components.createProps
      [ Tuple "title" (unsafeToForeign post.title)
      , Tuple "content" (unsafeToForeign post.content)
      , Tuple "date" (unsafeToForeign post.date)
      , Tuple "slug" (unsafeToForeign post.slug)
      , Tuple "tags" (unsafeToForeign post.tags)
      ]
  
  -- Use the Layout component for posts
  content <- Components.loadAndRenderComponent Components.layout props
  pure $ fromString content

-- | Template for the index page
indexTemplate :: String -> Array Post -> Aff Html
indexTemplate title posts = do
  -- Use the PureScript-based Index.homepage
  let 
    -- Convert posts to the Metadata format that Page.Index expects
    writings = map (\p -> 
      { name: "post"
      , layout: "post"
      , source: "src/posts"
      , data: { title: p.title, caption: Index.None }
      , excerpt: ""
      , url: "/" <> p.slug <> ".html"
      , content: p.content
      , date: p.date
      }) posts
    
    -- Sources contains both writings and projects
    sources = { writings, projects: [] }
    
    -- Generate the HTML directly using Index.customMain instead of Index.main
    html = H.render (Index.customMain sources)
  
  pure $ fromString html

-- | Template for the archive page
archiveTemplate :: Array Post -> Aff Html
archiveTemplate posts = do
  let 
    props = Components.createProps
      [ Tuple "title" (unsafeToForeign "Archive")
      , Tuple "posts" (unsafeToForeign posts)
      , Tuple "isArchive" (unsafeToForeign true)
      ]
  
  content <- Components.loadAndRenderComponent Components.layout props
  pure $ fromString content

-- | Template for a regular page
pageTemplate :: String -> String -> Aff Html
pageTemplate title content = do
  let 
    props = Components.createProps
      [ Tuple "title" (unsafeToForeign title)
      , Tuple "content" (unsafeToForeign content)
      , Tuple "isPage" (unsafeToForeign true)
      ]
  
  html <- Components.loadAndRenderComponent Components.layout props
  pure $ fromString html 