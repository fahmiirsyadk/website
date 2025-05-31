module Components.Footer where

import Prelude

import Data.Maybe (Maybe(..))
import Effect (Effect)
import Effect.Aff (Aff)
import Foreign (Foreign)
import Foreign.Object as Object

-- | Render the footer component
render :: Object.Object Foreign -> Effect String
render _ = pure $ 
  """
  <div class="footer">
    <p class="text-center text-gray-600">
      © """ <> currentYear <> """ - Built with PureScript and Bun
    </p>
    <p class="text-center text-gray-500 text-sm mt-2">
      <a href="https://github.com/yourusername/your-repo" class="hover:text-blue-600">
        View Source
      </a>
    </p>
  </div>
  """
  where
    currentYear = "2024" -- In a real implementation, we would use Effect.Now to get the current year 