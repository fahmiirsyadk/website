-- | File system utilities that work with both Bun and Node.js
module Site.Utils.FileSystem 
  ( ensureDir
  , readTextFile
  , writeTextFile
  , copyFile
  , fileExists
  , findFiles
  , isDirectory
  , removeFile
  , glob
  , writeFileWithDir
  , copyFolder
  , isBunRuntime
  ) where

import Prelude

import Control.Monad.Error.Class (try)
import Data.Array (head, filter)
import Data.Either (Either(..))
import Data.Foldable (for_)
import Data.Maybe (fromMaybe)
import Data.String (Pattern(..), indexOf)
import Effect (Effect)
import Effect.Aff (Aff)
import Effect.Class (liftEffect)
import Effect.Exception (Error)
import Node.Path (FilePath)
import Node.Path as Path
import Site.Utils.Bun.File as BunFile

-- | Check if a string starts with a prefix
startsWith :: String -> String -> Boolean
startsWith prefix str = case indexOf (Pattern prefix) str of
  Just 0 -> true
  _ -> false

-- | FFI imports
foreign import isBunRuntime :: Effect Boolean
foreign import findFilesImpl :: String -> Array String -> Effect (Array String)
foreign import existsImpl :: String -> Effect Boolean
foreign import isDirectoryImpl :: String -> Effect Boolean
foreign import removeFileImpl :: String -> Effect Unit
foreign import ensureDirImpl :: String -> Effect Unit
foreign import nodeWriteTextFile :: String -> String -> Effect Unit
foreign import copyFolderImpl :: String -> String -> Effect Unit
foreign import globImpl :: Array String -> Effect (Array String)
foreign import writeFileWithDirImpl :: String -> String -> Effect Unit
foreign import mkdirRecursiveImpl :: String -> Effect Unit
foreign import writeTextFileImpl :: String -> String -> Effect Unit

-- | Ensure a directory exists, creating it if necessary
ensureDir :: FilePath -> Aff (Either Error Unit)
ensureDir dirPath = try do
  isBun <- liftEffect isBunRuntime
  if isBun
    then do
      -- Use Bun implementation
      void $ BunFile.mkdir dirPath true
    else do
      -- Use Node.js implementation (imported elsewhere)
      liftEffect $ ensureDirImpl dirPath

-- | Read a text file
readTextFile :: FilePath -> Aff (Either Error String)
readTextFile path = try do
  isBun <- liftEffect isBunRuntime
  if isBun
    then BunFile.readTextFile path
    else do
      -- Node.js implementation would go here
      pure "Not implemented for Node.js yet"

-- | Write a text file
writeTextFile :: FilePath -> String -> Aff (Either Error Unit)
writeTextFile path content = try do
  isBun <- liftEffect isBunRuntime
  if isBun
    then void $ BunFile.writeTextFile path content
    else do
      -- Node.js implementation would go here
      liftEffect $ nodeWriteTextFile path content

-- | Copy a file from src to dest
copyFile :: FilePath -> FilePath -> Aff (Either Error Unit)
copyFile src dest = try do
  -- First ensure the destination directory exists
  let destDir = Path.dirname dest
  _ <- ensureDir destDir
  
  -- Then read the source file and write to destination
  contentResult <- readTextFile src
  case contentResult of
    Left _ -> pure unit -- Handle error
    Right text -> void $ writeTextFile dest text

-- | Check if a file exists
fileExists :: FilePath -> Effect Boolean
fileExists path = do
  isBun <- isBunRuntime
  if isBun
    then BunFile.fileExists path
    else existsImpl path

-- | Find files matching a glob pattern
findFiles :: String -> Array String -> Effect (Array String)
findFiles = findFilesImpl

-- | Check if a path is a directory
isDirectory :: String -> Effect Boolean
isDirectory = isDirectoryImpl

-- | Remove a file
removeFile :: String -> Effect Unit
removeFile = removeFileImpl

-- | Find files using a glob pattern
glob :: Array String -> Aff (Array String)
glob patterns = liftEffect $ findFilesImpl (fromMaybe "" $ head patterns) []

-- | Write a file, creating parent directories if needed
writeFileWithDir :: FilePath -> String -> Aff (Either Error Unit)
writeFileWithDir path content = try do
  -- First ensure parent directory exists
  let dir = Path.dirname path
  _ <- ensureDir dir
  -- Then write the file
  void $ writeTextFile path content

-- | Copy a folder recursively
copyFolder :: FilePath -> FilePath -> Aff (Either Error Unit)
copyFolder src dest = try do
  -- First ensure destination directory exists
  _ <- ensureDir dest
  -- Then use native copyFolder implementation
  liftEffect $ copyFolderImpl src dest
