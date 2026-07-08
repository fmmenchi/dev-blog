---
title: Capire davvero i database append-only
date: 2026-05-09
minutes: 14
tags: architettura
excerpt: Log, compaction e perché il tuo event store non è Kafka.
---

Log, compaction e perché il tuo event store non è Kafka. Un giro guidato dentro le strutture dati che reggono mezza infrastruttura moderna.

## Tutto è un log

Scrivere in coda è l'operazione più veloce che un disco sappia fare. Da questa osservazione discende quasi tutto il resto.
