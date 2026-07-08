---
title: Type-safety end-to-end senza tRPC
date: 2026-06-03
minutes: 8
tags: typescript
excerpt: Tipi condivisi, un po' di disciplina, zero magia.
---

Tipi condivisi, un po' di disciplina, zero magia. Come ottenere il 90% del valore di tRPC con un package di tipi e una convenzione.

## Il trucco è non avere trucchi

Un package `types` condiviso tra client e server, e una regola: il server importa i tipi, mai il contrario.
