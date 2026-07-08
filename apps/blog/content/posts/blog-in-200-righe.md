---
title: Ho riscritto il mio blog in 200 righe
date: 2026-07-02
minutes: 6
tags: web, minimalismo
excerpt: Zero framework, zero build step. Solo file statici, un Makefile e un pizzico di ostinazione. Com'è andata dopo tre mesi.
featured: true
---

Zero framework, zero build step. Solo file statici, un Makefile e un pizzico di ostinazione. Questo post racconta com'è andata — e cosa rifarei diverso.

## Il problema

Il mio vecchio blog aveva 43 dipendenze per servire testo statico. Ogni aggiornamento di sicurezza era un pomeriggio perso, e il build impiegava più tempo di quanto ne servisse a scrivere il post. A un certo punto la domanda è diventata inevitabile: _di cosa ho davvero bisogno?_

La risposta: Markdown in ingresso, HTML in uscita, un feed RSS. Tutto il resto è accidentale.

## La soluzione

Uno script che legge `posts/*.md`, li passa in un template literal e scrive i file. Niente plugin, niente config. Il cuore sta in dieci righe:

```ts
const posts = await glob('posts/*.md');

for (const file of posts) {
  const { meta, body } = parse(await read(file));
  await write(`out/${meta.slug}.html`, layout(meta, md(body)));
}

// 0 dipendenze runtime. 0.3s di build.
```

> **NOTA** — Il punto non è "i framework sono cattivi". È che per _questo_ problema la loro complessità non compra niente.

## Tre mesi dopo

Pubblico di più. Non per magia: perché la distanza tra "ho un'idea" e "è online" è crollata. Il deploy è un `rsync`. Se si rompe qualcosa, è colpa mia e lo trovo in 200 righe.
