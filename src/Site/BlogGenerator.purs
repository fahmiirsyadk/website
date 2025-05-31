module Site.BlogGenerator
  ( getBlogPost
  , generateBlogPost
  , generateAllBlogPosts
  ) where

import Prelude

import Effect.Aff (Aff)
import Effect (Effect)
import Effect.Class (liftEffect)
import Page.Blogpost (BlogPost)

-- | Get a blog post by slug
foreign import getBlogPostImpl :: String -> Effect (Aff BlogPost)

-- | Get a blog post by slug
getBlogPost :: String -> Aff BlogPost
getBlogPost slug = do
  affBlogPost <- liftEffect $ getBlogPostImpl slug
  affBlogPost

-- | Generate a blog post page from a slug
foreign import generateBlogPostImpl :: forall a. (a -> String) -> String -> Effect (Aff Boolean)

-- | Generate a blog post page from a slug
generateBlogPost :: forall a. (a -> String) -> String -> Aff Boolean
generateBlogPost renderFn slug = do
  affResult <- liftEffect $ generateBlogPostImpl renderFn slug
  affResult

-- | Generate all blog post pages
foreign import generateAllBlogPostsImpl :: forall a. (a -> String) -> Effect (Aff Int)

-- | Generate all blog post pages
generateAllBlogPosts :: forall a. (a -> String) -> Aff Int
generateAllBlogPosts renderFn = do
  affResult <- liftEffect $ generateAllBlogPostsImpl renderFn
  affResult 