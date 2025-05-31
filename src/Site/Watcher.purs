module Site.Watcher where

import Prelude

import Effect (Effect)
import Effect.Aff (Aff, launchAff_)
import Effect.Class (liftEffect)
import Node.Path (FilePath)
import Site.Config (SiteConfig)

foreign import data Watcher :: Type

foreign import watchFilesImpl :: Array String -> (String -> Effect Unit) -> Effect Watcher

foreign import createDummyWatcherImpl :: Effect Watcher

-- | Create a dummy watcher that does nothing
createDummyWatcher :: Aff Watcher
createDummyWatcher = liftEffect createDummyWatcherImpl

-- | Watch files for changes and regenerate the site
watchFiles :: SiteConfig -> (SiteConfig -> Aff Unit) -> Aff Watcher
watchFiles config regenerate = do
  let 
    -- Paths to watch
    watchPaths = [
      config.base <> "/**/*.md",
      config.base <> "/**/*.purs",
      config.public <> "/**/*",
      ".dust.yml"
    ]
    
    -- Handle file changes
    handleChange :: String -> Effect Unit
    handleChange _ = do
      -- Just trigger the regenerate function with the current config
      launchAff_ $ regenerate config
  
  -- Start the watcher
  liftEffect $ watchFilesImpl watchPaths handleChange 