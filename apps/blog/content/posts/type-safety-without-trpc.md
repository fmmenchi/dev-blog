---
title: End-to-end type-safety without tRPC
date: 2026-06-03
minutes: 8
tags: typescript
excerpt: Shared types, a bit of discipline, zero magic.
---

Shared types, a bit of discipline, zero magic. How to get 90% of tRPC's value with a types package and one convention.

## The trick is having no tricks

A `types` package shared between client and server, and one rule: the server imports the types, never the other way around.
