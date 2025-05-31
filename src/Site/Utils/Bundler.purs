module Site.Utils.Bundler where

import Prelude

import Effect (Effect)
import Effect.Aff (Aff)
import Effect.Class (liftEffect)
import Effect.Console as Console
import Site.Utils.Bun as Bun

-- | Bundle CSS files using Bun
foreign import bundleCssImpl :: String -> String -> Effect Unit

-- | Bundle JavaScript files using Bun
foreign import bundleJsImpl :: String -> String -> Effect Unit

-- | Bundle CSS files using fallback (TailwindCSS CLI)
foreign import bundleCssFallbackImpl :: String -> String -> Effect Unit

-- | Bundle CSS using Bun when available
bundleCss :: String -> String -> Aff Unit
bundleCss input output = do
  liftEffect $ Console.log $ "📦 Bundling CSS from " <> input <> " to " <> output
  isBun <- liftEffect Bun.isBun
  liftEffect $ if isBun
    then do
      Console.log "⚡ Using Bun's high-performance CSS bundler"
      bundleCssImpl input output
    else do
      Console.log "🔄 Using TailwindCSS CLI fallback"
      bundleCssFallbackImpl input output

-- | Bundle JavaScript using Bun when available
bundleJs :: String -> String -> Aff Unit
bundleJs input output = do
  liftEffect $ Console.log $ "📦 Bundling JavaScript from " <> input <> " to " <> output
  isBun <- liftEffect Bun.isBun
  liftEffect $ if isBun
    then do
      Console.log "⚡ Using Bun's high-performance JS bundler"
      bundleJsImpl input output
    else do
      Console.log "⚠️ JavaScript bundling is only available with Bun"
      Console.log "⚠️ Skipping JavaScript bundling" 