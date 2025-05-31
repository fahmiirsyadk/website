module Seo where

import Prelude
import Data.Maybe (Maybe(..))
import Site.Html as H
import Data.Tuple (Tuple(..))

-- | Head element with SEO optimizations
head :: { children :: Array H.Html } -> H.Html
head { children } =
  H.head [] $
    [ H.meta [ Tuple "charset" "utf-8" ] []
    , H.meta [ Tuple "name" "viewport", Tuple "content" "width=device-width, initial-scale=1.0" ] []
    , H.meta [ Tuple "name" "description", Tuple "content" "Personal website to unify my fragmented thoughts." ] []
    , H.title [] [ H.text "fah | Personal Writings" ]
    , H.link [ Tuple "rel" "stylesheet", Tuple "href" "/assets/css/styles.css" ] []
    ] <> children 