module Site.Utils.FileSystem where

import Prelude

import Control.Bind (join)
import Data.Array (length)
import Data.Either (Either(..))
import Data.Traversable (traverse)
import Effect (Effect)
import Effect.Aff (Aff)
import Effect.Class (liftEffect)
import Effect.Console (log) as Console
import Node.Path (FilePath)
import Site.Utils.Bun as Bun

-- | FFI imports with curried Effect functions
foreign import ensureDirImpl :: FilePath -> Effect Unit
foreign import globImpl :: Array String -> Effect (Array String)
foreign import copyFolderImpl :: String -> String -> Effect Unit
foreign import writeFileWithDirImpl :: String -> String -> Effect Unit
foreign import isBunEnvironmentImpl :: Effect Boolean
foreign import existsImpl :: String -> Effect Boolean
foreign import mkdirRecursiveImpl :: String -> Effect Unit
foreign import writeTextFileImpl :: String -> String -> Effect Unit
foreign import readTextFileImpl :: String -> Effect String

-- | Check if we're running in a Bun environment
isBunEnvironment :: Effect Boolean
isBunEnvironment = isBunEnvironmentImpl

-- | Ensure a directory exists
ensureDir :: FilePath -> Aff Unit
ensureDir path = do
  liftEffect $ Console.log $ "Ensuring directory exists: " <> path
  isBun <- liftEffect $ isBunEnvironment
  if isBun 
    then Bun.writeFile (path <> "/.keep") "" -- Create a .keep file to ensure dir exists
    else liftEffect $ ensureDirImpl path

-- | Find files matching a glob pattern
glob :: Array String -> Aff (Array String)
glob patterns = do
  liftEffect $ Console.log $ "Globbing with patterns: " <> show patterns
  isBun <- liftEffect $ isBunEnvironment
  result <- if isBun
    then do
      -- In Bun, we need to process each pattern separately and combine results
      results <- traverse (\pattern -> Bun.glob pattern) patterns
      pure $ join results
    else liftEffect $ globImpl patterns
  liftEffect $ Console.log $ "Found " <> show (length result) <> " files"
  pure result

-- | Copy a folder recursively
copyFolder :: FilePath -> FilePath -> Aff Unit
copyFolder src dest = do
  liftEffect $ Console.log $ "Copying folder from " <> src <> " to " <> dest
  liftEffect $ copyFolderImpl src dest

-- | Write a file and create parent directories if needed
writeFileWithDir :: FilePath -> String -> Aff Unit
writeFileWithDir path content = do
  liftEffect $ Console.log $ "Writing file: " <> path
  isBun <- liftEffect $ isBunEnvironment
  if isBun
    then Bun.writeFile path content
    else liftEffect $ writeFileWithDirImpl path content 

-- | Check if a file or directory exists
exists :: String -> Effect Boolean
exists path = liftEffect $ existsImpl path

-- | Create a directory recursively (creating parent directories as needed)
mkdirRecursive :: String -> Effect Unit
mkdirRecursive path = liftEffect $ mkdirRecursiveImpl path 

-- | Write text to a file with UTF-8 encoding
writeTextFile :: String -> String -> Effect Unit
writeTextFile path content = liftEffect $ writeTextFileImpl path content 

-- | Read text from a file with UTF-8 encoding
readTextFile :: String -> Aff (Either String String)
readTextFile path = do
  isBun <- liftEffect isBunEnvironment
  if isBun
    then do
      content <- Bun.readFile path
      pure $ Right content
    else do
      result <- liftEffect $ readTextFileImpl path
      pure $ Right result
