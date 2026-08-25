# Learn Lua

A free, interactive course for learning the Lua programming language — built with [Astro](https://astro.build/), [Tailwind CSS](https://tailwindcss.com/), and [Fengari](https://fengari.io/) (a Lua VM compiled to JavaScript, so every code example runs live in the browser).

## Development

```
npm install
npm run dev
```

Then open http://localhost:4321.

## Build

```
npm run build
npm run preview   # preview the production build locally
```

The static site is output to `dist/`.

## Project structure

```
src/
  content/lessons/    lesson content, as MDX (frontmatter: title, description, order)
  components/         LuaPlayground (interactive runner), Sidebar, ThemeToggle, MarkComplete
  layouts/            BaseLayout.astro (header, sidebar, footer, dark mode)
  pages/               index.astro, cheatsheet.astro, about.astro, lessons/[...slug].astro
```

To add a new lesson, drop a new `.mdx` file into `src/content/lessons/` with frontmatter:

```
---
title: "Lesson Title"
description: "One-line summary."
order: 14
---
```

The sidebar and home page course outline update automatically based on `order`.

## Deploying to Netlify

This repo includes a `netlify.toml` with the build command and publish directory already configured (`npm run build` → `dist/`). To deploy:

1. Push this repo to GitHub.
2. In Netlify, click **Add new site → Import an existing project**, and pick the repo.
3. Netlify will detect `netlify.toml` automatically — no manual config needed. Deploy.
