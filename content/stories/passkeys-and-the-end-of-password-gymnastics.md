---
title: 'Passkeys and the end of password gymnastics'
date: '2026-10-08'
description: 'Passwordless sign-in is reaching billions of credentials. The interesting work now is making it understandable when things go wrong.'
tags: ['Security', 'Web', 'UX']
cover: '/images/stories/passkeys.webp'
draft: false
---

A password rule that demands a capital letter, a symbol and a small sacrifice to the authentication gods is a familiar kind of annoying. We have spent years teaching people to remember harder secrets, then asking them to type those secrets into websites.

Passkeys change that interaction. Approve the sign-in with your device, usually through a fingerprint, face scan or PIN. The website gets a cryptographic proof instead of your reusable password.

The scale is already substantial. In May 2026, the [FIDO Alliance estimated that five billion passkeys were in active use worldwide](https://fidoalliance.org/five-billion-passkeys-a-milestone-not-a-finish-line/). That counts credentials, not five billion distinct people. Its report also says adoption alone does not guarantee people use them consistently.

## The neat bit is what you never type

The [WebAuthn standard](https://www.w3.org/TR/webauthn-3/) describes public-key credentials scoped to a relying party. The service stores the public key. The authenticator uses the private key to sign a challenge, and the browser enforces the relationship with the website's origin.

That relationship makes passkeys resistant to the usual fake-login-page attack. A convincing imitation of a site does not automatically get a credential that works on the real one. Your biometric check normally unlocks the authenticator locally; it is not a fingerprint upload to the website.

This does not make every account impossible to compromise. Sessions, recovery processes and compromised devices still matter. Removing the password closes a particular route into an account, and the remaining routes deserve just as much attention.

## Recovery is part of the feature

The happy path makes a wonderful demo. The awkward path is where a product earns trust.

Someone replaces a phone. Someone uses a shared computer. Someone enabled a passkey months ago and has forgotten which credential manager holds it. A support agent needs to explain what happens next without asking that person to learn public-key cryptography.

For a team adding passkeys, the design questions are concrete:

- Can the person register a second authenticator before losing the first?
- Does account recovery preserve the security of the normal sign-in flow?
- Does the interface clearly distinguish creating a passkey from using one?
- Can a person remove a lost device's credential without guessing which entry it is?

There is a temptation to treat authentication as plumbing and put all the attention into the screen after login. But login is the front door. An elegant product hidden behind a confusing recovery loop feels broken.

The promising part of passkeys is how ordinary they can become. A person should be able to open an app, approve a familiar device prompt and get on with their day. Fewer password rules. Fewer reset emails. Less work just to prove you are yourself.

_Cover: original AI-generated editorial illustration._
