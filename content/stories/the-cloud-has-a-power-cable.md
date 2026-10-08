---
title: 'The cloud has a power cable'
date: '2026-10-08'
description: 'Data centre growth is making electricity, cooling and grid connections central to tech. Software still has to fit inside a physical world.'
tags: ['Infrastructure', 'Energy', 'AI']
cover: '/images/stories/power.webp'
draft: false
---

The word cloud does an excellent job of hiding the equipment. Upload a file and it seems to disappear into something soft and weightless. Somewhere, a machine has to store it, serve it and stay cool while doing both.

That physical side of computing has become a major tech story. AI is one driver, but the consequences reach electricity networks, equipment manufacturing and the places where data centres are built.

## Growth meets the grid

The [IEA's 2026 report on energy and AI](https://www.iea.org/reports/key-questions-on-energy-and-ai/executive-summary) says global data centre electricity demand grew 17% in 2025. Demand at AI-focused data centres grew 50%.

Its central projection puts total data centre consumption at roughly 950 terawatt-hours in 2030, compared with 485 in 2025. That is a projection with uncertainty, not a reading from a future electricity meter.

The report also describes tighter supply chains and grid constraints. A company can buy servers much faster than a region can necessarily build the electricity infrastructure to support them.

## Efficiency needs a denominator

A system using less energy per task is good news. It does not automatically mean the entire system uses less energy.

If each job gets cheaper and the number of jobs grows faster than the improvement, total consumption can still rise. The kinds of jobs matter too. Serving a small text response and generating a video are different workloads.

This is why a single number for the energy cost of "an AI request" can be misleading. It leaves out the model, hardware, workload and boundaries of the measurement. A useful comparison has to say what was measured and what was left out.

## Software choices still count

An individual developer does not control where a utility builds its next substation. We do control some of the work our applications ask machines to do.

Repeatedly transferring the same data, running an expensive calculation on every request or rebuilding an unchanged result all consume resources without necessarily improving the product. Fixing those patterns can lower cost and improve response times as well.

There are trade-offs. A cache needs an expiry strategy. Precomputing results shifts work rather than making it disappear. Keeping everything forever increases storage and complicates deletion. Measure the workload before turning an efficiency idea into a new source of bugs.

Even this portfolio has a small version of the problem. A 3D scene should pause when it is offscreen or the tab is hidden. It should not keep asking a visitor's GPU to animate something nobody is looking at.

## The interesting decisions are physical

The infrastructure story is about where computing can grow, how reliably it can be powered and who pays for the supporting equipment. Better chips are part of that story. So are cooling, transformers and grid connections.

Following those details gives a much more useful picture of the tech boom than counting announcements alone. The next impressive product still needs a place to run, and that place needs electricity.

_Cover: original AI-generated editorial illustration._
