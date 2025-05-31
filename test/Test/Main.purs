module Test.Main where

import Prelude

import Data.Either (Either(..))
import Effect (Effect)
import Effect.Aff (Aff, launchAff_)
import Effect.Class (liftEffect)
import Effect.Console (log)
import Site.Utils.Bun.File as BunFile
import Site.Utils.FileSystem as FS

main :: Effect Unit
main = launchAff_ do
  liftEffect $ log "🧪 Running tests..."
  
  -- Test Bun runtime detection
  isBun <- liftEffect FS.isBunRuntime
  liftEffect $ log $ "Running in Bun: " <> show isBun
  
  -- Only run Bun-specific tests if we're in Bun
  if isBun then do
    testBunFileOperations
  else
    liftEffect $ log "Skipping Bun-specific tests (not running in Bun)"
  
  liftEffect $ log "✅ All tests completed!"

-- Test Bun file operations
testBunFileOperations :: Aff Unit
testBunFileOperations = do
  liftEffect $ log "Testing Bun file operations..."
  
  -- Test file exists
  let testFile = "test/temp-test-file.txt"
  let testContent = "Hello from PureScript + Bun!"
  
  -- Write a test file
  writeResult <- FS.writeTextFile testFile testContent
  case writeResult of
    Left err -> liftEffect $ log $ "❌ Failed to write test file: " <> show err
    Right _ -> do
      liftEffect $ log "✅ Successfully wrote test file"
      
      -- Check if file exists
      exists <- liftEffect $ BunFile.fileExists testFile
      liftEffect $ log $ "File exists: " <> show exists
      
      -- Read the file back
      readResult <- FS.readTextFile testFile
      case readResult of
        Left err -> liftEffect $ log $ "❌ Failed to read test file: " <> show err
        Right content -> do
          liftEffect $ log $ "✅ Successfully read test file: " <> content
          
          -- Check content matches
          if content == testContent
            then liftEffect $ log "✅ Content matches!"
            else liftEffect $ log $ "❌ Content mismatch. Expected: " <> testContent <> ", Got: " <> content
      
      -- Clean up - delete the test file
      void $ BunFile.removeFile testFile
      liftEffect $ log "✅ Cleaned up test file"

