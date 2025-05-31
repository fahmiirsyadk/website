module Site.Utils.Foreign where

import Prelude

import Data.Maybe (Maybe(..))
import Data.Either (Either)
import Effect.Aff (Aff)
import Effect.Class (liftEffect)
import Effect.Console (log)
import Effect.Exception (Error, try)
import Effect.Uncurried (EffectFn1, runEffectFn1)
import Foreign (Foreign)
import Node.Encoding (Encoding(..))
import Node.FS.Aff (readTextFile)
import Node.Path (FilePath)

-- | Parsed markdown data
type MarkdownData =
  { matter :: MarkdownMatter
  , html :: String
  }

-- | Markdown frontmatter
type MarkdownMatter =
  { title :: String
  , date :: String
  , slug :: String
  , tags :: Array String
  }

foreign import parseMarkdownImpl :: String -> { matter :: Foreign, html :: String }
foreign import parseYamlImpl :: Foreign -> String -> Maybe Foreign
foreign import loadYamlImpl :: EffectFn1 String Foreign
foreign import getFrontmatterFieldImpl :: String -> Foreign -> String
foreign import getFrontmatterArrayImpl :: String -> Foreign -> Array String

-- | Parse markdown content with frontmatter
parseMarkdown :: String -> MarkdownData
parseMarkdown content =
  let 
    parsed = parseMarkdownImpl content
  in
    { matter: 
        { title: getFrontmatterFieldImpl "title" parsed.matter
        , date: getFrontmatterFieldImpl "date" parsed.matter
        , slug: getFrontmatterFieldImpl "slug" parsed.matter
        , tags: getFrontmatterArrayImpl "tags" parsed.matter
        }
    , html: parsed.html
    }

-- | Parse a YAML string into a Foreign value
parseYaml :: Foreign -> String -> Maybe Foreign
parseYaml = parseYamlImpl

-- | Read and parse a YAML file
readYamlFile :: FilePath -> Aff (Either Error Foreign)
readYamlFile path = do
  content <- readTextFile UTF8 path
  liftEffect $ try $ runEffectFn1 loadYamlImpl content 