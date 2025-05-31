-- | FFI bindings for Bun's file operations
module Site.Utils.Bun.File where

import Prelude

import Control.Promise (Promise, toAffE)
import Data.ArrayBuffer.Types (ArrayBuffer)
import Data.Function.Uncurried (Fn1, Fn2, Fn3, runFn1, runFn2, runFn3)
import Data.Maybe (Maybe(..), maybe)
import Data.Nullable (Nullable, toMaybe)
import Effect (Effect)
import Effect.Aff (Aff)
import Effect.Class (liftEffect)
import Effect.Uncurried (EffectFn1, EffectFn2, EffectFn3, runEffectFn1, runEffectFn2, runEffectFn3)
import Foreign (Foreign, unsafeToForeign)
import Node.Buffer (Buffer)
import Node.FS.Stats (Stats)

-- | Check if a file exists at the given path
foreign import fileExistsImpl :: EffectFn1 String Boolean

-- | Read a file as text
foreign import readTextFileImpl :: EffectFn1 String (Promise String)

-- | Read a file as an ArrayBuffer
foreign import readBinaryFileImpl :: EffectFn1 String (Promise ArrayBuffer)

-- | Write data to a file
foreign import writeFileImpl :: EffectFn2 String Foreign (Promise Boolean)

-- | Remove a file
foreign import removeFileImpl :: EffectFn1 String (Promise Boolean)

-- | Get file stats (size, etc.)
foreign import fileStatsImpl :: EffectFn1 String (Nullable { size :: Number })

-- | Create a directory
foreign import mkdirImpl :: EffectFn2 String Boolean (Promise Boolean)

-- | Check if file exists
fileExists :: String -> Effect Boolean
fileExists path = runEffectFn1 fileExistsImpl path

-- | Read a text file (UTF-8)
readTextFile :: String -> Aff String
readTextFile path = toAffE $ runEffectFn1 readTextFileImpl path

-- | Read a binary file
readBinaryFile :: String -> Aff ArrayBuffer
readBinaryFile path = toAffE $ runEffectFn1 readBinaryFileImpl path

-- | Write text to a file
writeTextFile :: String -> String -> Aff Boolean
writeTextFile path content = toAffE $ runEffectFn2 writeFileImpl path (unsafeToForeign content)

-- | Write binary data to a file
writeBinaryFile :: String -> ArrayBuffer -> Aff Boolean
writeBinaryFile path content = toAffE $ runEffectFn2 writeFileImpl path (unsafeToForeign content)

-- | Remove a file
removeFile :: String -> Aff Boolean
removeFile path = toAffE $ runEffectFn1 removeFileImpl path

-- | Get file size
fileSize :: String -> Effect (Maybe Number)
fileSize path = do
  stats <- runEffectFn1 fileStatsImpl path
  pure $ map _.size (toMaybe stats)

-- | Create a directory (recursive)
mkdir :: String -> Boolean -> Aff Boolean
mkdir path recursive = toAffE $ runEffectFn2 mkdirImpl path recursive

-- | Helper to read a file only if it exists
readTextFileIfExists :: String -> Aff (Maybe String)
readTextFileIfExists path = do
  exists <- liftEffect $ fileExists path
  if exists
    then map Just $ readTextFile path
    else pure Nothing 