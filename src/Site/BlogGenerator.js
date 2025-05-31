// @ts-check

// BlogGenerator.js - Generate blog post pages from markdown files
"use strict";

import { glob } from 'glob';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';

// Check if we're in a Bun environment
const isBun = typeof Bun !== 'undefined';

/**
 * Check if a path is a file (not a directory)
 */
function isFile(filePath) {
  try {
    return fs.existsSync(filePath) && fs.statSync(filePath).isFile();
  } catch (error) {
    console.error(`Error checking if path is a file: ${filePath}`, error);
    return false;
  }
}

/**
 * Get a single blog post content
 */
export async function getBlogPostImpl(slug) {
  return async function() {
    try {
      // Try to find the post in articles directory
      let files = await glob('./src/posts/articles/**/*.md');
      let filePath = files.find(file => {
        const baseName = path.basename(file, '.md');
        return baseName === slug;
      });
      
      // If not found in articles, try projects
      if (!filePath) {
        files = await glob('./src/posts/projects/**/*.md');
        filePath = files.find(file => {
          const baseName = path.basename(file, '.md');
          return baseName === slug;
        });
      }
      
      if (!filePath || !isFile(filePath)) {
        console.error(`No post found with slug: ${slug} or path is not a file`);
        return {
          title: "Post Not Found",
          date: "",
          content: "<p>The requested post could not be found.</p>",
          slug: slug,
          tags: []
        };
      }
      
      // Read and parse the markdown file
      const content = fs.readFileSync(filePath, 'utf-8');
      const { data, content: markdownContent } = matter(content);
      
      // Convert markdown to HTML
      const htmlContent = marked(markdownContent);
      
      return {
        title: data.title || 'Untitled Post',
        date: data.date ? new Date(data.date).toLocaleDateString('en-US', { 
          weekday: 'short', 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric' 
        }) : '',
        content: htmlContent,
        slug: slug,
        tags: data.tags || []
      };
    } catch (error) {
      console.error(`Error getting blog post ${slug}:`, error);
      return {
        title: "Error Loading Post",
        date: "",
        content: "<p>There was an error loading this post.</p>",
        slug: slug,
        tags: []
      };
    }
  };
}

/**
 * Generate a blog post page
 */
export async function generateBlogPostImpl(renderFunction, slug) {
  return async function() {
    try {
      // Get the blog post data
      const blogPostFn = await getBlogPostImpl(slug);
      const postData = await blogPostFn();
      
      // Generate HTML using the provided render function
      const html = renderFunction(postData);
      
      // Create the base articles directory if it doesn't exist
      const articlesDir = path.join('dist', 'articles');
      if (!fs.existsSync(articlesDir)) {
        fs.mkdirSync(articlesDir, { recursive: true });
      }
      
      // Create a directory for this specific post
      const postDir = path.join(articlesDir, slug);
      if (!fs.existsSync(postDir)) {
        fs.mkdirSync(postDir, { recursive: true });
      }
      
      // Write the HTML file as index.html in the post directory
      const outputPath = path.join(postDir, 'index.html');
      fs.writeFileSync(outputPath, html);
      
      console.log(`✅ Generated blog post page: ${outputPath}`);
      return true;
    } catch (error) {
      console.error(`Error generating blog post ${slug}:`, error);
      return false;
    }
  };
}

/**
 * Generate all blog post pages
 */
export async function generateAllBlogPostsImpl(renderFunction) {
  return async function() {
    try {
      // Get all article files
      const articleFiles = await glob('./src/posts/articles/**/*.md');
      const projectFiles = await glob('./src/posts/projects/**/*.md');
      const allFiles = [...articleFiles, ...projectFiles];
      
      // Generate pages for each file
      const results = await Promise.all(
        allFiles.map(async (file) => {
          const slug = path.basename(file, '.md');
          const genFn = await generateBlogPostImpl(renderFunction, slug);
          return genFn();
        })
      );
      
      console.log(`✅ Generated ${results.filter(Boolean).length} blog post pages`);
      return results.filter(Boolean).length;
    } catch (error) {
      console.error('Error generating all blog posts:', error);
      return 0;
    }
  };
} 