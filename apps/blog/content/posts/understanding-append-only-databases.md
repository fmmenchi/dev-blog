---
title: Actually understanding append-only databases
date: 2026-05-09
minutes: 14
tags: architecture
excerpt: Logs, compaction and why your event store is not Kafka.
---

Logs, compaction and why your event store is not Kafka. A guided tour inside the data structures holding up half of modern infrastructure.

## Everything is a log

Appending is the fastest thing a disk knows how to do. Almost everything else follows from that observation.
