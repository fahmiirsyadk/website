module Site.Components where

import Prelude

import Data.Maybe (Maybe(..))
import Data.Tuple (Tuple(..))
import Effect (Effect)
import Effect.Aff (Aff)
import Effect.Class (liftEffect)
import Effect.Console as Console
import Foreign (Foreign)
import Foreign.Object (Object)
import Foreign.Object as Object

-- | Foreign function to load JS components
foreign import loadComponentImpl :: String -> Effect Foreign

-- | Foreign function to render a component with props
foreign import renderComponentImpl :: Foreign -> Object Foreign -> Effect String

-- | Load a component by name
loadComponent :: String -> Aff Foreign
loadComponent name = do
  liftEffect $ Console.log $ "📦 Loading component: " <> name
  component <- liftEffect $ loadComponentImpl name
  pure component

-- | Render a component with props
renderComponent :: Foreign -> Object Foreign -> Aff String
renderComponent component props = do
  html <- liftEffect $ renderComponentImpl component props
  pure html

-- | Load and render a component in one step
loadAndRenderComponent :: String -> Object Foreign -> Aff String
loadAndRenderComponent name props = do
  liftEffect $ Console.log $ "🔄 Rendering component: " <> name
  component <- loadComponent name
  renderComponent component props

-- | Helper to create props object
createProps :: Array (Tuple String Foreign) -> Object Foreign
createProps = Object.fromFoldable

-- | Type alias for component name
type ComponentName = String

-- Predefined components
layout :: ComponentName
layout = "Layout"

footer :: ComponentName
footer = "Footer"

logo :: ComponentName
logo = "Logo"

seo :: ComponentName 
seo = "Seo" 