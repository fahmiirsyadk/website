module Site.Collections where

import Prelude
import Effect (Effect)
import Foreign (Foreign)

-- | Post type representing a markdown file with frontmatter
type Post = 
  { title :: String
  , url :: String
  , slug :: String
  , date :: String
  }

-- | Collections data structure
type Collections =
  { posts :: Array Post
  , projects :: Array Post
  }

-- | Default empty collections
defaultCollections :: Collections
defaultCollections =
  { posts: []
  , projects: []
  }

-- | Get all collections from the posts directory
foreign import getAllCollectionsImpl :: Effect (Effect Foreign)

-- | Convert the Foreign value to a Collections type
foreign import parseCollectionsImpl :: Foreign -> Collections

-- | Get all collections as a PureScript data type
getAllCollections :: Effect Collections
getAllCollections = do
  collectionsPromise <- getAllCollectionsImpl
  collections <- collectionsPromise
  pure $ parseCollectionsImpl collections 