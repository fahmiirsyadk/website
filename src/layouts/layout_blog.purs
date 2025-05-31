module Layout.Blog where

import Prelude

-- | Blog post layout template
-- | This function takes the post data and returns HTML
layout :: forall r. { title :: String, content :: String | r } -> String
layout post = """
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>""" <> post.title <> """</title>
  <link rel="stylesheet" href="/assets/css/styles.css">
</head>
<body class="bg-white text-gray-900 min-h-screen flex flex-col">
  <header class="py-6 border-b border-gray-200">
    <div class="container mx-auto px-4">
      <nav class="flex justify-between items-center">
        <a href="/" class="text-xl font-bold">My Site</a>
        <div class="space-x-4">
          <a href="/" class="hover:text-blue-600">Home</a>
          <a href="/articles" class="hover:text-blue-600">Articles</a>
          <a href="/projects" class="hover:text-blue-600">Projects</a>
        </div>
      </nav>
    </div>
  </header>
  
  <main class="flex-grow container mx-auto px-4 py-8">
    <article class="prose prose-lg mx-auto">
      <h1 class="text-3xl font-bold mb-6">""" <> post.title <> """</h1>
      """ <> post.content <> """
    </article>
  </main>
  
  <footer class="py-8 bg-gray-100">
    <div class="container mx-auto px-4 text-center text-sm text-gray-600">
      <p>&copy; 2023 My Site. Built with PureScript Dust.</p>
    </div>
  </footer>
</body>
</html>
""" 