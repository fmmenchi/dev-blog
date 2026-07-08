---
title: Why I left microservices (for now)
date: 2026-06-18
minutes: 11
tags: architecture
excerpt: A well-built monolith beats twelve poorly coordinated services.
---

A well-built monolith beats twelve poorly coordinated services. This post is the full reasoning behind the choice — operational costs, module boundaries, and when (maybe) I'll go back.

## The bill nobody itemizes

Every extra service is one more deploy, one more contract, one more way to fail halfway. You don't pay the price when you create it: you pay it every week after.
