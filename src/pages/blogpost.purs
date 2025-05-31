module Page.Blogpost
  ( blogpost
  , BlogPost
  , renderBlogpost
  ) where

import Prelude

import Data.Maybe (Maybe(..))
import Data.String as String
import Data.Tuple (Tuple(..))
import Components.Seo as Seo
import Page.Index (logoSection)
import Site.Html as H
import Utils as Utils

-- | BlogPost type
type BlogPost = 
  { title :: String
  , date :: String
  , content :: String
  , slug :: String
  , tags :: Array String
  }

-- | Footer for blog post
footer :: H.Html
footer =
  let
    renderYear = "2023"
    dustver = "0.1.0"
    renderTime = "2023-01-01"
  in
  H.footer [ Tuple "class" "relative h-32 bg-neutral-100 mt-16" ] [
    H.div [ Tuple "class" "text-xs absolute z-0 bottom-2 text-neutral-600 w-full text-center" ] [
      H.text $ "fa-h " <> renderYear <> " | Dust " <> dustver <> " at " <> renderTime
    ]
  ]

-- | Blog post template
blogpost :: BlogPost -> H.Html
blogpost post =
  H.html [ Tuple "lang" "en" ] [
    H.head [] [
      H.meta [ Tuple "charset" "utf-8" ] []
      , H.meta [ Tuple "name" "viewport", Tuple "content" "width=device-width, initial-scale=1.0" ] []
      , H.meta [ Tuple "name" "description", Tuple "content" post.title ] []
      , H.title [] [ H.text $ post.title <> " | fah" ]
      , H.link [ Tuple "rel" "stylesheet", Tuple "href" "/assets/css/styles.css" ] []
      , H.style [] [
          H.text "#terminal::-webkit-scrollbar { width: 0; }"
        ]
    ]
    , H.body [ Tuple "class" "bg-neutral-100" ] [
        H.main [ Tuple "class" "flex items-start justify-center min-h-screen" ] [
          H.section [ Tuple "class" "p-10 max-w-3xl w-full" ] [
            -- Header with logo and back link
            H.div [ Tuple "class" "flex w-full justify-between items-center mb-8"] [
              logoSection 40 20,
              H.a [ Tuple "href" "/", Tuple "class" "text-blue-700 hover:text-blue-900 flex items-center" ] [
                H.raw "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"mr-1\"><path d=\"m12 19-7-7 7-7\"/><path d=\"M19 12H5\"/></svg>",
                H.text "Back to Home"
              ]
            ]
            
            -- Article header
            , H.div [ Tuple "class" "mb-10" ] [
                H.h1 [ Tuple "class" "text-3xl font-bold mb-3" ] [ H.text post.title ]
                , H.div [ Tuple "class" "flex items-center text-neutral-500 text-sm" ] [
                    H.span [ Tuple "class" "mr-4" ] [ H.text post.date ]
                    , H.div [ Tuple "class" "flex gap-2" ] (map (\tag -> 
                        H.span [ Tuple "class" "bg-neutral-200 px-2 py-1 rounded text-xs" ] [ H.text tag ]
                      ) post.tags)
                ]
            ]
            
            -- Article content
            , H.div [ Tuple "class" "prose prose-neutral max-w-none" ] [
                H.raw post.content
            ]
          ]
        ]
        , footer
      ]
  ]

-- | Generate static HTML from blog post data
renderBlogpost :: BlogPost -> String
renderBlogpost post = "<!DOCTYPE html>\n" <> H.render (blogpost post) 