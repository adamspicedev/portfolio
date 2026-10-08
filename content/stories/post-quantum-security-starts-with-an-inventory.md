---
title: 'Post-quantum security starts with an inventory'
date: '2026-10-08'
description: 'Quantum-resistant cryptography is moving into real migration plans. The first job is finding the encryption you already depend on.'
tags: ['Security', 'Infrastructure']
cover: '/images/stories/quantum.webp'
draft: false
---

Quantum computers make for excellent science-fiction props. A spreadsheet of certificates does not. Yet that spreadsheet may be a more useful starting point for the next big security migration.

The problem is specific. A sufficiently capable quantum computer could break widely used public-key systems such as RSA and elliptic-curve cryptography. That is a future capability, not a claim that today's machines can casually decrypt all internet traffic.

Waiting until it exists is still a poor migration strategy. Some secrets need to remain private for years, and infrastructure takes time to replace.

## The standards are here

[NIST released its first three principal post-quantum standards in August 2024](https://csrc.nist.gov/Projects/Post-Quantum-Cryptography). ML-KEM addresses establishing shared keys. ML-DSA and SLH-DSA address digital signatures. These are different jobs, so treating them as one interchangeable encryption upgrade would miss the point.

NIST's published transition direction removes quantum-vulnerable algorithms from its standards by 2035, with higher-risk systems moving earlier. That is NIST's standards timeline, not a universal deadline for every application in every country.

The practical implication is that migration planning now has concrete algorithms and documents to work with. Teams can ask vendors about support, test compatibility and identify dependencies before a rushed replacement becomes necessary.

## Find the hidden dependencies

A web app's TLS connection is the obvious place to look. It is unlikely to be the only one.

Think about signed software updates, SSH access, service-to-service certificates, VPNs, hardware security modules and the certificates embedded in devices that might stay installed for a decade. Then think about who owns each one.

An inventory becomes useful when it records more than an algorithm name. It needs an owner, a replacement route, a dependency on other systems and an idea of how long the protected information stays sensitive. A device that cannot receive firmware updates creates a different problem from a service that can be redeployed this afternoon.

This is also a good reason to question bespoke cryptography. If replacing an algorithm requires rewriting half an application, the application has made a future security change unnecessarily expensive.

## Make the upgrade testable

A sensible engineering plan starts with a small representative integration. Measure message sizes and latency. Check the clients that actually use the service. Exercise certificate renewal and rollback. Keep the configuration visible enough that a future maintainer can tell what is enabled.

There is no prize for hand-implementing a new cryptographic scheme inside a portfolio app. Maintained protocols and libraries should do that work. The application team's job is to understand its dependencies and prove that an upgrade behaves correctly.

The less glamorous side of this story is also the more reassuring one. Preparation is possible without predicting the exact date a cryptographically relevant quantum computer arrives. Find what you have. Work out what can change. Start with the systems that are hardest to replace.

_Cover: original AI-generated editorial illustration._
