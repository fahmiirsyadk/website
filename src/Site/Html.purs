module Site.Html 
  ( Html(..)
  , fromString
  , render
  , renderAsync
  , replace
  , element
  , text
  , raw
  , el
  , html
  , body
  , head
  , meta
  , title
  , style
  , script
  , link
  , div
  , span
  , h1
  , h2
  , h3
  , h4
  , p
  , a
  , img
  , pre
  , code
  , section
  , article
  , footer
  , main
  , header
  , nav
  , ul
  , li
  , input
  , class_
  , id
  , href
  , src
  , type_
  , lang
  , attr
  , attrs
  , document
  ) where

import Prelude

import Data.Foldable (foldMap)
import Data.Maybe (Maybe(..))
import Data.Tuple (Tuple(..))
import Effect.Aff (Aff)
import Effect.Class (liftEffect)
import Foreign.Object (Object)
import Foreign.Object as Object

-- | HTML representation
data Html
  = Element String (Object String) (Array Html)
  | Text String
  | Raw String

-- | Create Html from a string (as raw HTML)
fromString :: String -> Html
fromString = Raw

-- | Render HTML to a string
render :: Html -> String
render html = case html of
  Element tag attrs children ->
    "<" <> tag <> renderAttrs attrs <> ">" <>
    foldMap render children <>
    "</" <> tag <> ">"
  Text content ->
    escapeHtml content
  Raw content ->
    content

-- | Render HTML asynchronously
renderAsync :: Aff Html -> Aff String
renderAsync htmlAff = do
  html <- htmlAff
  pure $ render html

-- | Render attributes
renderAttrs :: Object String -> String
renderAttrs attrs =
  let
    renderAttr (Tuple name value) = " " <> name <> "=\"" <> escapeAttr value <> "\""
    attrPairs = Object.toUnfoldable attrs :: Array (Tuple String String)
    renderAll = foldMap renderAttr attrPairs
  in
    renderAll

-- | Escape HTML special characters
escapeHtml :: String -> String
escapeHtml str =
  str
    # replace "&" "&amp;"
    # replace "<" "&lt;"
    # replace ">" "&gt;"
    # replace "\"" "&quot;"
    # replace "'" "&#39;"

-- | Escape attribute values
escapeAttr :: String -> String
escapeAttr str =
  str
    # replace "&" "&amp;"
    # replace "<" "&lt;"
    # replace ">" "&gt;"
    # replace "\"" "&quot;"
    # replace "'" "&#39;"

-- | Replace occurrences of a substring
replace :: String -> String -> String -> String
replace from to = replaceImpl from to

-- | Foreign implementation of string replace
foreign import replaceImpl :: String -> String -> String -> String

-- | Create an HTML element
element :: String -> Object String -> Array Html -> Html
element = Element

-- | Create a text node
text :: String -> Html
text = Text

-- | Create a raw HTML node (for pre-rendered HTML)
raw :: String -> Html
raw = Raw

-- | Create an element with no attributes
el :: String -> Array Html -> Html
el name = Element name Object.empty

-- | Create common HTML elements
html :: Array (Tuple String String) -> Array Html -> Html
html attrs = Element "html" (Object.fromFoldable attrs)

body :: Array (Tuple String String) -> Array Html -> Html
body attrs = Element "body" (Object.fromFoldable attrs)

head :: Array (Tuple String String) -> Array Html -> Html
head attrs = Element "head" (Object.fromFoldable attrs)

meta :: Array (Tuple String String) -> Array Html -> Html
meta attrs = Element "meta" (Object.fromFoldable attrs)

title :: Array (Tuple String String) -> Array Html -> Html
title attrs = Element "title" (Object.fromFoldable attrs)

style :: Array (Tuple String String) -> Array Html -> Html
style attrs = Element "style" (Object.fromFoldable attrs)

script :: Array (Tuple String String) -> Array Html -> Html
script attrs = Element "script" (Object.fromFoldable attrs)

link :: Array (Tuple String String) -> Array Html -> Html
link attrs = Element "link" (Object.fromFoldable attrs)

div :: Array (Tuple String String) -> Array Html -> Html
div attrs = Element "div" (Object.fromFoldable attrs)

span :: Array (Tuple String String) -> Array Html -> Html
span attrs = Element "span" (Object.fromFoldable attrs)

h1 :: Array (Tuple String String) -> Array Html -> Html
h1 attrs = Element "h1" (Object.fromFoldable attrs)

h2 :: Array (Tuple String String) -> Array Html -> Html
h2 attrs = Element "h2" (Object.fromFoldable attrs)

h3 :: Array (Tuple String String) -> Array Html -> Html
h3 attrs = Element "h3" (Object.fromFoldable attrs)

h4 :: Array (Tuple String String) -> Array Html -> Html
h4 attrs = Element "h4" (Object.fromFoldable attrs)

p :: Array (Tuple String String) -> Array Html -> Html
p attrs = Element "p" (Object.fromFoldable attrs)

a :: Array (Tuple String String) -> Array Html -> Html
a attrs = Element "a" (Object.fromFoldable attrs)

img :: Array (Tuple String String) -> Html
img attrs = Element "img" (Object.fromFoldable attrs) []

pre :: Array (Tuple String String) -> Array Html -> Html
pre attrs = Element "pre" (Object.fromFoldable attrs)

code :: Array (Tuple String String) -> Array Html -> Html
code attrs = Element "code" (Object.fromFoldable attrs)

section :: Array (Tuple String String) -> Array Html -> Html
section attrs = Element "section" (Object.fromFoldable attrs)

article :: Array (Tuple String String) -> Array Html -> Html
article attrs = Element "article" (Object.fromFoldable attrs)

footer :: Array (Tuple String String) -> Array Html -> Html
footer attrs = Element "footer" (Object.fromFoldable attrs)

main :: Array (Tuple String String) -> Array Html -> Html
main attrs = Element "main" (Object.fromFoldable attrs)

header :: Array (Tuple String String) -> Array Html -> Html
header attrs = Element "header" (Object.fromFoldable attrs)

nav :: Array (Tuple String String) -> Array Html -> Html
nav attrs = Element "nav" (Object.fromFoldable attrs)

ul :: Array (Tuple String String) -> Array Html -> Html
ul attrs = Element "ul" (Object.fromFoldable attrs)

li :: Array (Tuple String String) -> Array Html -> Html
li attrs = Element "li" (Object.fromFoldable attrs)

input :: Array (Tuple String String) -> Html
input attrs = Element "input" (Object.fromFoldable attrs) []

-- | Shorthand for class attribute
class_ :: String -> Tuple String String
class_ value = Tuple "class" value

-- | Shorthand for id attribute
id :: String -> Tuple String String
id value = Tuple "id" value

-- | Shorthand for href attribute
href :: String -> Tuple String String
href value = Tuple "href" value

-- | Shorthand for src attribute
src :: String -> Tuple String String
src value = Tuple "src" value

-- | Shorthand for type attribute
type_ :: String -> Tuple String String
type_ value = Tuple "type" value

-- | Shorthand for lang attribute
lang :: String -> Tuple String String
lang value = Tuple "lang" value

-- | Create HTML attributes
attr :: String -> String -> Object String
attr key value = Object.singleton key value

attrs :: Array (Tuple String String) -> Object String
attrs pairs = Object.fromFoldable pairs

-- | Create a document with proper doctype
document :: String -> Html -> String
document title content =
  "<!DOCTYPE html>\n" <>
  render (
    Element "html" Object.empty [
      Element "head" Object.empty [
        Element "meta" (Object.singleton "charset" "utf-8") [],
        Element "title" Object.empty [Text title],
        Element "meta" (Object.fromFoldable [
          Tuple "name" "viewport",
          Tuple "content" "width=device-width, initial-scale=1"
        ]) []
      ],
      Element "body" Object.empty [content]
    ]
  ) 