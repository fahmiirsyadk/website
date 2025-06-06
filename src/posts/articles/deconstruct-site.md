---
title: Deconstruct the site
date: 2023-10-15
slug: deconstruct-site
tags: ["site", "development"]
---

# Deconstructing this Static Site

This post explores how this static site is built and how it works under the hood.

## Architecture

The site is built with:

1. PureScript for type-safe code
2. Markdown for content
3. Tailwind CSS for styling
4. Bun for fast execution

## Components

The site consists of:

- A templating system for HTML generation
- A markdown parser for content
- A routing system for URLs
- A build system for compilation

## Future Improvements

In the future, I'm planning to add:

- Better code syntax highlighting
- Improved responsive design
- Search functionality
- Dark mode support

<p class="text-center italic">( Incomplete by design )</p>
<div class="bg-orange-600 flex flex-row items-center w-full h-[500px] justify-around flex-wrap">
<pre class="transition duration-300 ease-out hover:scale-90 select-none cursor-pointer subpixel-antialiased" style="background: radial-gradient(circle at 50% 50%,#421802, #020100);">
+-------+
|       |
|  0x0  |
|       |
+-------+
   /|\
  / | \
</pre>
<pre class="transition duration-300 ease-out hover:scale-90 select-none cursor-pointer subpixel-antialiased" style="background: radial-gradient(circle at 50% 50%,#421802, #020100);">
+-------+
|       |
|  0x1  |
|       |
+-------+
   /|\
  / | \
</pre>
<pre class="transition duration-300 ease-out hover:scale-90 select-none cursor-pointer subpixel-antialiased" style="background: radial-gradient(circle at 50% 50%,#421802, #020100);">
+-------+
|       |
|  0x2  |
|       |
+-------+
   /|\
  / | \
</pre>
</div>

## Incomplete

There are two kinds of people: those who like to focus on reflection but describe themselves with poetry or any journal, and those who make websites like museums full of their latest works.

The first type holds the concept of simplicity and is entirely focused on how they express themselves in writing. The second type defines all imagination on the canvas.

I'm the second type. Admittedly, creating a personal website is difficult because the creators want to make the best website they have ever made. They liken it to a canvas, painting according to the imagination and mood of the painter. They often lose track of time, making the artwork incomplete and the painter exhausted. Or, halfway through, they get bored or bothered by another idea, throw away the canvas, and start a new painting. This cycle never ends.

<p class="text-neutral-500 text-sm w-[220px] h-0 xl:w-auto xl:h-auto xl:translate-x-0 xl:translate-y-0 translate-x-[42rem] translate-y-[-12rem]">
The way to break it is to mark that the painting is <b>Done</b>.
</p>

> *After two years of working, I mark this site as "Done.*

<p class="text-neutral-500 text-sm w-[220px] h-0 xl:w-auto xl:h-auto xl:translate-x-0 xl:translate-y-0 translate-x-[42rem] translate-y-[-3rem]">
As version 1.0 :P
</p>

## Concept

I've think bringing old style & modern art style together with keywords like *ASCII*, *monospace typeface*, *cyberpunk*, *gradient*, *blur* & *grain* 
yet keeping the simplicity for documenting journals.

Here's some moodboard I've collected so far:

<ul class="p-0 grid grid-cols-4 gap-4">
  <li class="p-0 m-0 cursor-pointer group">
    <img class="object-cover m-0 transition ease-out duration-100 group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-orange-600/20 rounded-md min-w-full max-h-full align-bottom" src="/assets/images/deconstruct-site/terminal-1.gif" alt="evangelion chart UI" loading="lazy">
  </li>
  <li class="p-0 m-0 cursor-pointer group">
    <img class="object-cover m-0 transition ease-out duration-100 group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-orange-600/20 rounded-md min-w-full max-h-full align-bottom" src="/assets/images/deconstruct-site/terminal-2.gif" alt="evangelion files deleted UI" loading="lazy">
  </li>
  <li class="p-0 m-0 cursor-pointer group">
    <img class="object-cover m-0 transition ease-out duration-100 group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-orange-600/20 rounded-md min-w-full max-h-full align-bottom" src="/assets/images/deconstruct-site/ascii.jpg" alt="black terminal" loading="lazy">
  </li>
  <li class="p-0 m-0 cursor-pointer group">
    <img class="object-cover m-0 transition ease-out duration-100 group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-orange-600/20 rounded-md min-w-full max-h-full align-bottom" src="/assets/images/deconstruct-site/moodboard-4.jpg" alt="black terminal" loading="lazy">
  </li>
  <li class="p-0 m-0 cursor-pointer group">
    <img class="object-cover m-0 transition ease-out duration-100 group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-orange-600/20 rounded-md min-w-full max-h-full align-bottom" src="/assets/images/deconstruct-site/moodboard-2.jpg" alt="black terminal" loading="lazy">
  </li>
  <li class="p-0 m-0 cursor-pointer group">
    <img class="object-cover m-0 transition ease-out duration-100 group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-orange-600/20 rounded-md min-w-full max-h-full align-bottom" src="/assets/images/deconstruct-site/moodboard-3.jpg" alt="black terminal" loading="lazy">
  </li>
  <li class="p-0 m-0 cursor-pointer group">
    <img class="object-cover m-0 transition ease-out duration-100 group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-orange-600/20 rounded-md min-w-full max-h-full align-bottom" src="/assets/images/deconstruct-site/moodboard-5.gif" alt="black terminal" loading="lazy">
  </li>
  <li class="p-0 m-0 cursor-pointer group">
    <img class="object-cover m-0 transition ease-out duration-100 group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-orange-600/20 rounded-md min-w-full max-h-full align-bottom" src="/assets/images/deconstruct-site/moodboard-6.gif" alt="black terminal" loading="lazy">
  </li>
</ul>