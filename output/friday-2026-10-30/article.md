# Local AI still needs a network map

An AI model running on your laptop sounds like a straightforward change of address. The work happens here, rather than in somebody else's data centre. A coding assistant makes that picture more interesting: the model is only one part of the system.

On 28 October, GitHub introduced an [experimental preview of local-model routing in Copilot Fusion](https://github.blog/changelog/2026-10-28-github-copilot-fusion-now-supports-selection-of-local-models/). It can choose between supported models on your device and models in the cloud. The detail worth reading twice is that the routing decision still happens in the cloud.

That makes this a useful moment to ask what “local” actually describes.

## Three decisions hiding inside one chat

Start with inference: where the model generates its answer. Then consider routing: which model receives the work. Finally, look at tools: what can run commands, read files or contact other services.

[GitHub's Fusion documentation](https://docs.github.com/en/copilot/concepts/models/copilot-fusion) describes a system that selects models and execution patterns at runtime. Choosing Fusion is therefore different from choosing one fixed model. Local selection currently belongs to Fusion Standard, and the local feature remains a preview.

The tools have another boundary. Microsoft's [7 October technical explanation](https://commandline.microsoft.com/local-models-sandboxed-tools-github-windows/) notes that moving inference onto a device does not reduce the access inherited by an agent's shell commands. Sandboxing applies separate controls to that execution.

A model running beside your source code does not, by itself, tell you which files the assistant can edit or where its commands can connect. Those are questions for the surrounding application and its permissions.

## Check the particular product

The rollout also differs by application. GitHub's [release notes](https://github.blog/changelog/2026-10-28-github-copilot-fusion-now-supports-selection-of-local-models/) say the managed download experience is Windows-only. Copilot CLI can route to supported, manually configured local models on Windows, macOS and Linux. The Copilot app's intelligent local routing currently supports managed Windows ML models only.

Being able to add a model does not automatically make it eligible for Fusion routing. A provider appearing in a menu is not a complete description of how a session will use it.

Offline operation is a separate configuration. GitHub's [CLI guidance](https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/add-llm-models#running-in-offline-mode) documents `COPILOT_OFFLINE=true` to prevent the CLI contacting GitHub's servers. The model provider must also be local or inside the isolated environment. That is a different setup from leaving Fusion to make cloud-based routing decisions.

## Try a whole task, not just a prompt

There is a practical performance question too. Microsoft's [memory breakdown](https://commandline.microsoft.com/local-models-sandboxed-tools-github-windows/) explains that model weights share the budget with the operating system, other applications, the inference runtime and the cache that grows with context. Getting a model loaded is only the starting point.

For a useful evaluation, choose a small, representative change in a disposable working copy. Let the assistant inspect files, make the change and run the usual checks. Record the models used, the time taken and the corrections needed. Repeat with the normal editor and development services running.

Keep the configuration honest as well. The [CLI model requirements](https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/add-llm-models#model-requirements) call for streaming and tool calling, with token limits matched to the model's real capacity. Increasing a setting does not create a larger context window.

As with [evaluating AI code review](/blog/ai-code-review-needs-a-better-scorecard), the useful result is a change you can inspect and trust, alongside a clear account of how it was produced.

Local models give developers another place to run work. Choosing well means asking which parts stay on the machine, which parts leave it, and what each part is allowed to do.

*Cover: original AI-generated editorial illustration.*
