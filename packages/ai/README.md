# @acme/ai

`@acme/ai` is a unified LLM API layer that abstracts over multiple
AI providers. It provides automatic model discovery, unified tool calling
interfaces, token/cost tracking, and seamless model hand-off during sessions.

**Key Features:**
- Multi-provider support (OpenAI, Anthropic, Google, local models)
- Automatic model discovery and capability detection
- Token usage tracking and cost estimation
- Context persistence and model handoff
- Streaming response support

**Note:** Only models with tool calling capability are included, as required
for agentic workflows.
