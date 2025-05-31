module Site.Config where

import Prelude

import Control.Monad (when)
import Data.Array (elem)
import Effect (Effect)
import Effect.Class.Console (log)
import Node.Path (FilePath)
import Node.Process (argv, cwd)

type SiteConfig = 
  { output :: FilePath
  , base :: FilePath
  , public :: FilePath
  , isDebug :: Boolean
  }

defaultConfig :: FilePath -> Boolean -> SiteConfig
defaultConfig rootPath isDebug =
  { output: rootPath <> "/dist"
  , base: rootPath <> "/src"
  , public: rootPath <> "/src/public"
  , isDebug
  }

getConfig :: Effect SiteConfig
getConfig = do
  rootPath <- cwd
  args <- argv
  
  let 
    isDebug = elem "--debug" args
    config = defaultConfig rootPath isDebug
  
  when isDebug do
    log $ "🔧 Config:"
    log $ "  Base: " <> config.base
    log $ "  Output: " <> config.output
    log $ "  Public: " <> config.public
  
  pure config 