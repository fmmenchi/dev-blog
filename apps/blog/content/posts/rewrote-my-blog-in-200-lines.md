---
title: I rewrote my blog in 200 lines
date: 2026-07-02
minutes: 6
tags: web, minimalism
excerpt: Zero frameworks, zero build steps. Just static files, a Makefile and a pinch of stubbornness. How it went after three months.
featured: true
---

Zero frameworks, zero build steps. Just static files, a Makefile and a pinch of stubbornness. This post is the story of how it went — and what I would do differently.

## The problem

My old blog had 43 dependencies to serve static text. Every security update cost me an afternoon, and the build took longer than writing the post. At some point the question became unavoidable: _what do I actually need?_

The answer: Markdown in, HTML out, an RSS feed. Everything else is accidental.

## The solution

A script that reads `posts/*.md`, pipes them through a template literal and writes the files. No plugins, no config. The core fits in ten lines:

```ts
const posts = await glob('posts/*.md');

for (const file of posts) {
  const { meta, body } = parse(await read(file));
  await write(`out/${meta.slug}.html`, layout(meta, md(body)));
}

// 0 runtime dependencies. 0.3s build.
```

> **NOTE** — The point isn't "frameworks are bad". It's that for _this_ problem their complexity buys nothing.

## Three months later

I publish more. Not by magic: because the distance between "I have an idea" and "it's online" collapsed. Deploying is an `rsync`. If something breaks, it's my fault and I can find it in 200 lines.
