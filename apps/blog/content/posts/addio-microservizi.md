---
title: Perché ho abbandonato i microservizi (per ora)
date: 2026-06-18
minutes: 11
tags: architettura
excerpt: Un monolite ben fatto batte dodici servizi mal coordinati.
---

Un monolite ben fatto batte dodici servizi mal coordinati. Questo post è il ragionamento completo dietro la scelta — costi operativi, confini dei moduli e quando (forse) tornerò indietro.

## Il conto che nessuno fa

Ogni servizio in più è un deploy in più, un contratto in più, un modo in più di fallire a metà. Il prezzo non lo paghi quando lo crei: lo paghi ogni settimana dopo.
