module Site.Utils.Bun where

import Prelude

import Effect (Effect)
import Effect.Aff (Aff)
import Effect.Class (liftEffect)

-- | Types for Bun-specific operations
foreign import data BunFile :: Type
foreign import data BunReader :: Type
foreign import data BunWriter :: Type

-- | Read a file using Bun's file API
foreign import readFileImpl :: String -> Effect BunFile

-- | Get text content from a BunFile
foreign import fileTextImpl :: BunFile -> Effect String

-- | Write a file using Bun's file API
foreign import writeFileImpl :: String -> String -> Effect Unit

-- | Copy a file using Bun
foreign import copyFileImpl :: String -> String -> Effect Unit

-- | Find files using Bun.glob
foreign import globImpl :: String -> Effect (Array String)

-- | Check if we're running under Bun
foreign import isBunImpl :: Effect Boolean

-- | PureScript-friendly wrappers

-- | Read a file using Bun
readFile :: String -> Aff String
readFile path = liftEffect $ do
  file <- readFileImpl path
  fileTextImpl file

-- | Write a file using Bun
writeFile :: String -> String -> Aff Unit
writeFile path content = liftEffect $ writeFileImpl path content

-- | Copy a file using Bun
copyFile :: String -> String -> Aff Unit
copyFile src dest = liftEffect $ copyFileImpl src dest

-- | Find files matching a glob pattern
glob :: String -> Aff (Array String)
glob pattern = liftEffect $ globImpl pattern

-- | Check if we're running under Bun
isBun :: Effect Boolean
isBun = isBunImpl 