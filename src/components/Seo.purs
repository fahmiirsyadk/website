module Components.Seo where

import Prelude

import Data.Maybe (Maybe(..))
import Effect (Effect)
import Foreign (Foreign)
import Foreign.Object as Object
import Site.Html (replace)

-- | Render SEO meta tags
render :: Object.Object Foreign -> Effect String
render props = do
  let 
    title = case Object.lookup "title" props of
      Just t -> unsafeToString t
      Nothing -> "PureScript Dust - Static Site Generator"
    
    description = case Object.lookup "description" props of
      Just d -> unsafeToString d
      Nothing -> "A static site generator built with PureScript and Bun"
  
  pure $ 
    """
    <meta name="description" content="${description}">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:type" content="website">
    <meta name="twitter:card" content="summary">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${description}">
    """
      # replace "${title}" title
      # replace "${description}" description

-- | Unsafe conversion from Foreign to String
foreign import unsafeToString :: Foreign -> String 