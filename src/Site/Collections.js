// @ts-check

// Collections.js - FFI for PureScript Collections module
"use strict";

import { glob } from 'glob';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

// Check if we're in a Bun environment
const isBun = typeof Bun !== 'undefined';

/**
 * Get all articles from the posts/articles directory
 */
export async function extractArticles() {
  try {
    // Get all markdown files from the articles directory
    const articlesGlob = await glob('./src/posts/articles/**/*.md');
    console.log(`Found ${articlesGlob.length} article files`);
    
    // Process each article file
    const articles = await Promise.all(
      articlesGlob.map(async (filePath) => {
        try {
          const content = fs.readFileSync(filePath, 'utf-8');
          const { data } = matter(content);
          
          return {
            title: data.title || 'Untitled Article',
            url: `/${data.slug || path.basename(filePath, '.md')}`,
            slug: data.slug || path.basename(filePath, '.md'),
            date: data.date ? new Date(data.date).toLocaleDateString('en-US', { 
              weekday: 'short', 
              month: 'short', 
              day: 'numeric', 
              year: 'numeric' 
            }) : ''
          };
        } catch (error) {
          console.error(`Error processing article ${filePath}:`, error);
          return null;
        }
      })
    );
    
    // Filter out any null entries from errors
    return articles.filter(Boolean);
  } catch (error) {
    console.error("Error extracting articles:", error);
    return [];
  }
}

/**
 * Get all projects from the posts/projects directory
 */
export async function extractProjects() {
  try {
    // Get all markdown files from the projects directory
    const projectsGlob = await glob('./src/posts/projects/**/*.md');
    console.log(`Found ${projectsGlob.length} project files`);
    
    // Process each project file
    const projects = await Promise.all(
      projectsGlob.map(async (filePath) => {
        try {
          const content = fs.readFileSync(filePath, 'utf-8');
          const { data } = matter(content);
          
          return {
            title: data.title || 'Untitled Project',
            url: `/${data.slug || path.basename(filePath, '.md')}`,
            slug: data.slug || path.basename(filePath, '.md'),
            date: data.date ? new Date(data.date).toLocaleDateString('en-US', { 
              weekday: 'short', 
              month: 'short', 
              day: 'numeric', 
              year: 'numeric' 
            }) : ''
          };
        } catch (error) {
          console.error(`Error processing project ${filePath}:`, error);
          return null;
        }
      })
    );
    
    // Filter out any null entries from errors
    return projects.filter(Boolean);
  } catch (error) {
    console.error("Error extracting projects:", error);
    return [];
  }
}

/**
 * Get all collections data for PureScript
 */
export function getAllCollectionsImpl() {
  return async function() {
    try {
      // Extract all content
      const [articles, projects] = await Promise.all([
        extractArticles(),
        extractProjects()
      ]);
      
      // Debug output
      console.log("=== COLLECTED ARTICLES ===");
      console.log(JSON.stringify(articles, null, 2));
      console.log("=== COLLECTED PROJECTS ===");
      console.log(JSON.stringify(projects, null, 2));
      
      // Return the collections data
      return {
        collections: {
          posts: articles,
          projects: projects
        }
      };
    } catch (error) {
      console.error("Error getting collections:", error);
      return {
        collections: {
          posts: [],
          projects: []
        }
      };
    }
  };
}

/**
 * Parse the collections data from a Foreign value
 */
export function parseCollectionsImpl(data) {
  // Log the data we're receiving to debug
  console.log("PARSING COLLECTIONS:", JSON.stringify(data, null, 2));
  
  // Properly extract collections data
  return {
    posts: data.collections?.posts || [],
    projects: data.collections?.projects || []
  };
} 