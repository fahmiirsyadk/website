module Extras where

import Prelude
import Data.Tuple (Tuple(..))
import Effect (Effect)

-- | Get the current version of the Dust SSG
getVersion :: Effect String
getVersion = pure "0.1.0"

-- | Combine elements with a function
combineElement :: forall a b. (a -> b) -> Array a -> Array b
combineElement fn = map fn

-- | Combine elements with a function taking 3 arguments
combineElement3 :: forall a b c d. (a -> b -> c -> d) -> Array (Tuple a (Tuple b c)) -> Array d
combineElement3 fn = map (\(Tuple a (Tuple b c)) -> fn a b c)

-- | Type alias for tuple
infixr 6 type Tuple as /\ 