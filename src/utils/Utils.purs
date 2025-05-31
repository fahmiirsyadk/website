module Utils where

import Prelude
import Data.Tuple (Tuple(..))
import Effect (Effect)

-- | Debug output function
foreign import debugOutput :: forall a. String -> a -> a

-- | Combine elements with a function
combineElement :: forall a b. (a -> b) -> Array a -> Array b
combineElement = map

-- | Combine elements with a function taking 3 arguments
combineElement3 :: forall a b c d. (a -> b -> c -> d) -> Array (Tuple a (Tuple b c)) -> Array d
combineElement3 fn = map (\(Tuple a (Tuple b c)) -> fn a b c) 