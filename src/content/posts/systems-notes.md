---
title: Systems notes
description: A placeholder for technical writing about infrastructure, tools, and tradeoffs.
date: 2026-04-08
tags:
  - systems
  - engineering
---

Technical posts work well here because Markdown gives you just enough structure without turning
the site into a publishing machine.

```ts
type Note = {
  title: string;
  date: Date;
  status: 'draft' | 'published';
};
```

The goal is to make small pieces easy to ship. That usually matters more than adding a heavy CMS
or an elaborate visual system too early.
