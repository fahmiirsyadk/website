module Page.Index 
  ( main
  , homepage
  , customMain
  , Caption(..)
  , Sources
  , Metadata
  , Matter
  , logoSection
  ) where

import Prelude

import Ascii as Ascii
import Data.Maybe (Maybe(..))
import Data.Tuple (Tuple(..))
import Effect.Now (nowDateTime)
import Extras as Extras
import Foreign.Object (Object)
import Foreign.Object as Object
import Components.Seo as Seo
import Site.Html as H
import Utils as Utils
import Data.String as String

-- | Post type
type Post = 
  { title :: String
  , date :: String
  , content :: String
  , slug :: String
  , tags :: Array String
  , url :: String
  }

-- | Caption type
data Caption = None | Some String

-- | Matter type
type Matter = 
  { title :: String
  , caption :: Caption
  }

-- | Metadata type
type Metadata = 
  { name :: String
  , layout :: String
  , source :: String
  , data :: Matter
  , excerpt :: String
  , url :: String
  , content :: String
  , date :: String
  }

-- | Sources type
type Sources = 
  { writings :: Array Metadata
  , projects :: Array Metadata
  }

-- | Logo section
logoSection :: Int -> Int -> H.Html
logoSection w h =
  H.div [] [
    H.raw $ """
    <svg width=\"""" <> show w <> """\" height=\"""" <> show h <> """\" viewBox="0 0 125 57" fill="black" xmlns="http://www.w3.org/2000/svg">
      <path d="M0.896283 29.1184C0.322916 29.6824 0 30.4529 0 31.2572V53.5C0 55.1569 1.34315 56.5 3 56.5H29.2406C30.0461 56.5 30.8179 56.176 31.382 55.601L44.8586 41.8653C46.74 39.9476 50 41.2798 50 43.9663V53.5C50 55.1569 51.3431 56.5 53 56.5H97.2406C98.0461 56.5 98.8179 56.176 99.382 55.601L123.641 30.8751C124.192 30.3142 124.5 29.5598 124.5 28.7741V3C124.5 1.34315 123.157 0 121.5 0H111.743C110.947 0 110.184 0.316071 109.621 0.87868L101.621 8.87868C99.7314 10.7686 96.5 9.43007 96.5 6.75736V3C96.5 1.34315 95.1569 0 93.5 0H81.7281C80.9411 0 80.1855 0.309303 79.6244 0.861221L61.6037 18.5865C59.7068 20.4523 56.5 19.1085 56.5 16.4477V3C56.5 1.34315 55.1569 0 53.5 0H31.7281C30.9411 0 30.1855 0.309303 29.6244 0.861222L0.896283 29.1184Z" fill="black" />
      </svg>
    """
  ]

-- | Custom CSS
customCSS :: H.Html
customCSS = 
  H.style [] [
    H.text "#terminal::-webkit-scrollbar { width: 0; }"
  ]

-- | Small introduction
smallIntroduction :: H.Html
smallIntroduction =
  H.h1 [ Tuple "class" "text-base sm:text-sm" ] [
    H.raw "I'm <strong>fah</strong>, a front-end developer who <i>kinda</i> like experiment with things. Through this site, I write journals, portfolios, or showcases some of my experiments."
  ]

-- | TOC section
tocSection :: Array Metadata -> H.Html
tocSection writings =
  let
    articleItem res =
      let 
        -- Debug the item 
        _ = Utils.debugOutput "ARTICLE ITEM RECEIVED:" res
      
        -- Default values in case fields are missing
        title = case res.data of
          { title: t } -> t
          _ -> "Untitled"
        
        -- Create a simpler item display
        link = 
          if String.take 1 res.url == "/"
          then "/articles" <> res.url <> "/" -- URL already has a leading slash, add trailing slash
          else "/articles/" <> res.url <> "/" -- URL needs a leading slash, add trailing slash
      in
      H.div [ Tuple "class" "py-3 px-4 border-b border-neutral-300 hover:bg-yellow-50 transition-colors duration-200 group" ] [
        H.div [ Tuple "class" "flex flex-col sm:flex-row sm:justify-between sm:items-center" ] [
          H.a [ Tuple "href" link, Tuple "class" "text-blue-700 hover:text-blue-900 font-medium group-hover:underline text-lg" ] [ H.text title ],
          H.span [ Tuple "class" "text-xs text-neutral-500 mt-1 sm:mt-0" ] [ H.text res.date ]
        ]
      ]

    menus =
      [
        Tuple "01" (Tuple "About" smallIntroduction)
      , Tuple "02" (Tuple "Writings" (H.div [] (Utils.combineElement articleItem writings)))
      , Tuple "03" (Tuple "Projects" (H.div [] []))
      ]

    menuElem num title menu =
      H.article [] [
        H.h2 [ Tuple "class" "relative flex justify-between w-full before:absolute before:bottom-[0.4rem] before:w-full before:leading-[0px] before:border-black before:border-b-2 before:border-dotted text-neutral" ] [
          H.span [ Tuple "class" "bg-neutral-100 pr-1 relative z-10" ] [
            H.text ("[" <> num <> "] "), H.raw ("<b class=\"italic text-neutral-700\">" <> title <> "</b>")
          ]
          , H.span [ Tuple "class" "bg-neutral-100 space-x-2 relative z-10 flex items-center" ] [ 
            H.span [] [ H.text "[" ]
            , H.a [ Tuple "href" "#", Tuple "class" "hover:text-orange-600" ] [ H.text "More" ]
            , H.span [] [ H.text "]" ]
          ]
        ]
        , H.div [ Tuple "class" "my-4 sm:my-8" ] [ menu ]
      ]
  in
  H.section [] [
    H.div [] (Utils.combineElement3 menuElem menus)
  ]

-- | Footer
footer :: H.Html
footer =
  let
    renderYear = "2023"
    dustver = "0.1.0"
    renderTime = "2023-01-01"
    
    flower1 pos =
      H.pre [ Tuple "class" $ "text-sm absolute bottom-0 " <> pos ] [
        H.code [ Tuple "class" "block font-sans text-orange-600 font-bold" ] [ H.text "***" ]
        , H.code [ Tuple "class" "block font-sans text-orange-600 font-bold" ] [ H.text "***" ]
        , H.code [ Tuple "class" "block font-sans" ] [ H.text " |" ]
        , H.code [ Tuple "class" "block font-sans" ] [ H.text " |" ]
      ]
      
    flower2 pos =
      H.pre [ Tuple "class" $ "text-sm absolute bottom-0 " <> pos ] [
        H.code [ Tuple "class" "block font-sans" ] [ H.text " " ]
        , H.code [ Tuple "class" "block font-sans" ] [ H.text " " ]
        , H.code [ Tuple "class" "block font-sans text-orange-600 font-bold" ] [ H.text "@" ]
        , H.code [ Tuple "class" "block font-sans" ] [ H.text "|" ]
      ]
  in
  H.footer [ Tuple "class" "relative h-64 bg-neutral-100" ] [
    H.div [ Tuple "class" "text-xs absolute z-0 bottom-2 text-neutral-600 w-full text-center" ] [
      H.text $ "fa-h " <> renderYear <> " | Dust " <> dustver <> " at " <> renderTime
    ]
    , flower2 "right-14"
    , flower1 "right-56"
    , flower2 "right-64"
    , flower1 "left-14"
    , flower2 "right-32"
    , flower1 "right-20"
    , flower2 "left-56"
  ]

-- | Main template
main :: Sources -> H.Html
main sources =
  let writings = sources.writings
  in
  H.html [ Tuple "lang" "en" ] [
    H.head [] [
      H.meta [ Tuple "charset" "utf-8" ] []
      , H.meta [ Tuple "name" "viewport", Tuple "content" "width=device-width, initial-scale=1.0" ] []
      , H.meta [ Tuple "name" "description", Tuple "content" "Personal website to unify my fragmented thoughts." ] []
      , H.title [] [ H.text "fah | Personal Writings" ]
      , H.link [ Tuple "rel" "stylesheet", Tuple "href" "/assets/css/styles.css" ] []
      , customCSS
    ]
    , H.body [ Tuple "class" "bg-neutral-100" ] [
        H.main [ Tuple "class" "flex items-start justify-center min-h-screen" ] [
          H.div [ Tuple "id" "loading-state" ] []
          , H.section [ Tuple "class" "p-10 max-w-2xl w-full" ] [
            H.div [ Tuple "class" "flex w-full justify-center items-center"] [
              logoSection 60 30
            ]
            , H.div [ Tuple "class" "relative my-4 oveflow-hidden"] [
                H.div [ Tuple "class" "w-full h-[200px] sm:h-[160px] flex justify-center relative overflow-hidden cursor-pointer group" ] [
                  H.pre [ Tuple "class" "text-sm text-center absolute select-none z-10 sm:text-xs" ] (map H.text Ascii.borderASCII)
                , H.pre [ Tuple "class" "text-sm text-center subpixel-antialiased select-none absolute font-bold translate ease-in-out z-0 duration-[1.2s] group-hover:scale-150 group-hover:translate-y-[-50px] sm:text-xs" ] (map H.text Ascii.banner1ASCII)
                , H.pre [ Tuple "class" "text-sm text-center subpixel-antialiased select-none absolute font-bold translate ease-in-out z-0 duration-1000 group-hover:scale-150 group-hover:opacity-0 sm:text-xs" ] (map H.text Ascii.banner3ASCII)
                , H.pre [ Tuple "class" "text-sm text-center subpixel-antialiased translate ease-in-out z-0 duration-1000 group-hover:scale-[10.0] group-hover:-translate-y-24 select-none absolute font-bold sm:text-xs" ] (map H.text Ascii.banner2ASCII)
                ]
              ]
            , H.h4 [ Tuple "class" "text-sm sm:text-xs italic text-center" ] [ H.text "Personal journal as place for thoughts." ]
            , H.h4 [ Tuple "class" "text-sm sm:text-xs text-center my-4"] [ H.text "~~*~~"]
            , tocSection writings
            ]
        ]
        , footer
      ]
  ]

-- | Custom main function that displays both posts and projects
customMain :: Sources -> H.Html
customMain src =
  let 
    writingsItems = src.writings
    projectsItems = src.projects
    
    -- Debug output using console.log
    _ = Utils.debugOutput "WRITINGS:" writingsItems
    _ = Utils.debugOutput "PROJECTS:" projectsItems
    
    -- Define articleItem function
    articleItem res =
      let 
        -- Debug the item 
        _ = Utils.debugOutput "ARTICLE ITEM RECEIVED:" res
      
        -- Default values in case fields are missing
        title = case res.data of
          { title: t } -> t
          _ -> "Untitled"
        
        -- Create a simpler item display - fix the double slash issue and use clean URLs
        link = 
          if String.take 1 res.url == "/"
          then "/articles" <> res.url <> "/" -- URL already has a leading slash, add trailing slash
          else "/articles/" <> res.url <> "/" -- URL needs a leading slash, add trailing slash
      in
      H.div [ Tuple "class" "py-3 px-4 border-b border-neutral-300 hover:bg-yellow-50 transition-colors duration-200 group" ] [
        H.div [ Tuple "class" "flex flex-col sm:flex-row sm:justify-between sm:items-center" ] [
          H.a [ Tuple "href" link, Tuple "class" "text-blue-700 hover:text-blue-900 font-medium group-hover:underline text-lg" ] [ H.text title ],
          H.span [ Tuple "class" "text-xs text-neutral-500 mt-1 sm:mt-0" ] [ H.text res.date ]
        ]
      ]
    
    -- Create menu elements with writings and projects
    customMenus =
      [
        Tuple "01" (Tuple "About" smallIntroduction)
      , Tuple "02" (Tuple "Writings" (H.div [] (Utils.combineElement articleItem writingsItems)))
      , Tuple "03" (Tuple "Projects" (H.div [] (Utils.combineElement articleItem projectsItems)))
      ]
      
    -- Define menuElem function
    menuElem num title menu =
      H.article [] [
        H.h2 [ Tuple "class" "relative flex justify-between w-full before:absolute before:bottom-[0.4rem] before:w-full before:leading-[0px] before:border-black before:border-b-2 before:border-dotted text-neutral" ] [
          H.span [ Tuple "class" "bg-neutral-100 pr-1 relative z-10" ] [
            H.text ("[" <> num <> "] "), H.raw ("<b class=\"italic text-neutral-700\">" <> title <> "</b>")
          ]
          , H.span [ Tuple "class" "bg-neutral-100 space-x-2 relative z-10 flex items-center" ] [ 
            H.span [] [ H.text "[" ]
            , H.a [ Tuple "href" "#", Tuple "class" "hover:text-orange-600" ] [ H.text "More" ]
            , H.span [] [ H.text "]" ]
          ]
        ]
        , H.div [ Tuple "class" "my-4 sm:my-8" ] [ menu ]
      ]
      
    -- Create the section with custom menus
    customTocSection = 
      H.section [] [
        H.div [] (Utils.combineElement3 menuElem customMenus)
      ]
  in
  H.html [ Tuple "lang" "en" ] [
    H.head [] [
      H.meta [ Tuple "charset" "utf-8" ] []
      , H.meta [ Tuple "name" "viewport", Tuple "content" "width=device-width, initial-scale=1.0" ] []
      , H.meta [ Tuple "name" "description", Tuple "content" "Personal website to unify my fragmented thoughts." ] []
      , H.title [] [ H.text "fah | Personal Writings" ]
      , H.link [ Tuple "rel" "stylesheet", Tuple "href" "/assets/css/styles.css" ] []
      , customCSS
    ]
    , H.body [ Tuple "class" "bg-neutral-100" ] [
        H.main [ Tuple "class" "flex items-start justify-center min-h-screen" ] [
          H.div [ Tuple "id" "loading-state" ] []
          , H.section [ Tuple "class" "p-10 max-w-2xl w-full" ] [
            H.div [ Tuple "class" "flex w-full justify-center items-center"] [
              logoSection 60 30
            ]
            , H.div [ Tuple "class" "relative my-4 oveflow-hidden"] [
                H.div [ Tuple "class" "w-full h-[200px] sm:h-[160px] flex justify-center relative overflow-hidden cursor-pointer group" ] [
                  H.pre [ Tuple "class" "text-sm text-center absolute select-none z-10 sm:text-xs" ] (map H.text Ascii.borderASCII)
                , H.pre [ Tuple "class" "text-sm text-center subpixel-antialiased select-none absolute font-bold translate ease-in-out z-0 duration-[1.2s] group-hover:scale-150 group-hover:translate-y-[-50px] sm:text-xs" ] (map H.text Ascii.banner1ASCII)
                , H.pre [ Tuple "class" "text-sm text-center subpixel-antialiased select-none absolute font-bold translate ease-in-out z-0 duration-1000 group-hover:scale-150 group-hover:opacity-0 sm:text-xs" ] (map H.text Ascii.banner3ASCII)
                , H.pre [ Tuple "class" "text-sm text-center subpixel-antialiased translate ease-in-out z-0 duration-1000 group-hover:scale-[10.0] group-hover:-translate-y-24 select-none absolute font-bold sm:text-xs" ] (map H.text Ascii.banner2ASCII)
                ]
              ]
            , H.h4 [ Tuple "class" "text-sm sm:text-xs italic text-center" ] [ H.text "Personal journal as place for thoughts." ]
            , H.h4 [ Tuple "class" "text-sm sm:text-xs text-center my-4"] [ H.text "~~*~~"]
            , customTocSection
            ]
        ]
        , footer
      ]
  ]

-- | Homepage template
-- | This is the entry point called by the generator
homepage :: forall r. { collections :: Object (Array { title :: String, url :: String, date :: String | r }) } -> String
homepage info =
  let
    -- Debug the raw info object
    _ = Utils.debugOutput "HOMEPAGE INFO:" info
  
    -- Get posts from collections
    maybeWritings = Object.lookup "posts" info.collections
    writings = case maybeWritings of
      Just posts -> map (\p -> 
        { name: "post"
        , layout: "post"
        , source: "source"
        , data: { title: p.title, caption: None }
        , excerpt: ""
        , url: p.url
        , content: ""
        , date: p.date
        }) posts
      Nothing -> []
    
    -- Get projects from collections
    maybeProjects = Object.lookup "projects" info.collections
    projects = case maybeProjects of
      Just projs -> map (\p -> 
        { name: "project"
        , layout: "project"
        , source: "source"
        , data: { title: p.title, caption: None }
        , excerpt: ""
        , url: p.url
        , content: ""
        , date: p.date
        }) projs
      Nothing -> []
    
    -- Debug the processed collections
    _ = Utils.debugOutput "PROCESSED WRITINGS:" writings
    _ = Utils.debugOutput "PROCESSED PROJECTS:" projects
    
    -- Create sources with both writings and projects
    sources = { writings, projects }
  in
  "<!DOCTYPE html>\n" <> H.render (customMain sources) 