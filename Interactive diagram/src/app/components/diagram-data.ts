// ─── Shared types, data and helpers for the Agent Architecture diagram ────────

export interface NodeDef {
  id: string;
  label: string;
  description: string;
  aliases?: string[];
  whyItMatters: string;
  examples: string[];
  misconception?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  gettingStarted?: string;
  resources?: { label: string; url: string }[];
}

export interface LayerDef {
  id: string;
  label: string;
  subtitle: string;
  intro: string;
  cssColor: string;
  hexColor: string;
  nodes: NodeDef[];
}

export interface Edge {
  from: string;
  to: string;
  label: string;
}

// ─── Layers ───────────────────────────────────────────────────────────────────

export const LAYERS: LayerDef[] = [
  {
    id: 'interfaces',
    label: 'Interfaces',
    subtitle: 'How builders interact',
    intro:
      'Interfaces are the surfaces through which people interact with AI systems. Whether it\'s a chat window, a command palette, or a terminal, the interface shapes the experience and determines who can use the system effectively. Choosing the right interface for your audience is one of the first design decisions you\'ll make.',
    cssColor: 'var(--nd-primary)',
    hexColor: '#F96E5B',
    nodes: [
      {
        id: 'chat',
        label: 'Chat',
        description:
          'The primary conversational surface for interacting with AI. Natural language in, structured responses out — the most accessible entry point for most users.',
        whyItMatters:
          'Chat is how most people first experience AI. If you\'re building a product, chat is the fastest way to prototype and validate an AI-powered feature before investing in custom UI.',
        examples: ['ChatGPT', 'Claude.ai', 'Gemini', 'GitHub Copilot Chat'],
        misconception:
          'Chat is not the only way to use AI — it\'s just the most visible. Many powerful AI applications use APIs, embedded widgets, or terminal tools with no chat interface at all.',
        difficulty: 'beginner',
        gettingStarted:
          'Try the OpenAI Playground or Claude.ai to experiment with different prompting strategies before building anything.',
        resources: [
          { label: 'OpenAI Prompt Engineering Guide', url: 'https://platform.openai.com/docs/guides/prompt-engineering' },
          { label: 'Anthropic Prompt Library', url: 'https://docs.anthropic.com/en/prompt-library/library' },
        ],
      },
      {
        id: 'slash-commands',
        label: 'Slash Commands',
        description:
          'Shortcut-style commands (e.g. /summarize, /search) that trigger specific behaviors instantly without a full conversation. Ideal for power users who know what they want.',
        aliases: ['Commands', 'Shortcuts', 'Actions'],
        whyItMatters:
          'Slash commands dramatically reduce friction for repeated tasks. They turn multi-turn conversations into single actions, making AI tools faster for experienced users.',
        examples: ['Slack /commands', 'Discord bot commands', 'Cursor /edit', 'Notion AI commands'],
        difficulty: 'beginner',
        gettingStarted:
          'Think about the 3-5 most common tasks your users repeat in conversation and wrap each one as a named command with predefined parameters.',
      },
      {
        id: 'terminal',
        label: 'Terminal',
        description:
          'CLI-based interface giving developers direct, scriptable, composable access to AI capabilities. Ideal for automation pipelines and technical workflows.',
        whyItMatters:
          'Terminal interfaces let developers pipe AI into existing workflows — batch processing, CI/CD pipelines, and scripting. This is where AI moves from interactive to automated.',
        examples: ['OpenAI CLI', 'Anthropic CLI', 'GitHub Copilot CLI', 'aider'],
        misconception:
          'Terminal AI tools aren\'t just for coding. They\'re powerful for any text-heavy workflow: data transformation, content generation, log analysis, and document processing.',
        difficulty: 'intermediate',
        gettingStarted:
          'Install a CLI tool like aider or the OpenAI CLI and try piping file contents through it to see how AI can fit into shell workflows.',
        resources: [
          { label: 'OpenAI API Quickstart', url: 'https://platform.openai.com/docs/quickstart' },
        ],
      },
    ],
  },
  {
    id: 'experiences',
    label: 'Experiences',
    subtitle: 'Packaged behaviors people create & use',
    intro:
      'Experiences are the reusable AI-powered products that people actually build and share. They sit between the raw interface layer and the orchestration machinery, packaging instructions, tools, and personas into something that can be deployed repeatedly. This is where "using AI" becomes "building with AI."',
    cssColor: 'var(--nd-chart-2)',
    hexColor: '#58ADB8',
    nodes: [
      {
        id: 'custom-assistants',
        label: 'Custom Assistants',
        description:
          'Personalized AI configurations combining custom instructions, a persona, specific tools, and memory settings. Built once, deployed repeatedly for a focused purpose.',
        aliases: ['Custom GPTs', 'Bots', 'Projects', 'Assistants'],
        whyItMatters:
          'Custom assistants are the building block of AI products. Instead of starting from a blank prompt every time, you encode expertise once and reuse it — for yourself, your team, or your customers.',
        examples: ['OpenAI Custom GPTs', 'Claude Projects', 'Microsoft Copilot Studio', 'Poe bots'],
        misconception:
          'Custom assistants don\'t require coding. Most platforms let you create them by writing instructions in natural language and selecting which tools they can access.',
        difficulty: 'beginner',
        gettingStarted:
          'Create a Custom GPT in ChatGPT or a Project in Claude. Start with clear instructions for a specific task you do repeatedly.',
        resources: [
          { label: 'OpenAI GPT Builder Guide', url: 'https://help.openai.com/en/articles/8554397-creating-a-gpt' },
        ],
      },
      {
        id: 'workspace',
        label: 'Workspace / Collab',
        description:
          'Shared AI-powered spaces where multiple users work with the same context, artifacts, and memory across sessions. Enables team-level AI coordination.',
        aliases: ['Cowork', 'Team Spaces', 'Shared Projects'],
        whyItMatters:
          'AI stops being a solo tool when teams share context. Workspaces let multiple people build on the same AI-maintained knowledge, reducing duplicate work and keeping everyone aligned.',
        examples: ['ChatGPT Team workspaces', 'Notion AI in shared docs', 'Cursor shared projects', 'Replit multiplayer'],
        difficulty: 'intermediate',
        gettingStarted:
          'Set up a shared workspace in your AI tool of choice. The key is establishing shared context documents and agreeing on which assistants the team uses for which tasks.',
      },
      {
        id: 'app-workflow',
        label: 'App / Workflow',
        description:
          'A task-focused wrapper around an assistant, designed to complete a specific, repeatable job — often with a structured UI, defined inputs, and expected outputs.',
        whyItMatters:
          'Workflows turn open-ended AI conversations into reliable, repeatable processes. They\'re how you go from "AI can help with this" to "AI does this automatically every time."',
        examples: ['Zapier AI Actions', 'Make.com AI modules', 'Retool AI workflows', 'n8n AI nodes'],
        misconception:
          'Workflows don\'t replace assistants — they wrap them. A workflow defines the steps, inputs, and outputs; the assistant provides the intelligence at each step.',
        difficulty: 'intermediate',
        gettingStarted:
          'Pick a repetitive task with clear inputs and outputs. Map it as a sequence of steps, then identify which steps benefit from AI and which are deterministic.',
        resources: [
          { label: 'Zapier AI Automation Guide', url: 'https://zapier.com/blog/ai-automation/' },
        ],
      },
    ],
  },
  {
    id: 'orchestration',
    label: 'Orchestration',
    subtitle: 'How work gets planned, routed & executed',
    intro:
      'Orchestration is the control plane of an AI system. It determines how requests get routed, how agents plan and execute multi-step tasks, which tools get called, and how quality and safety are maintained. Understanding this layer is essential for building AI systems that are reliable, safe, and capable of complex work.',
    cssColor: 'var(--nd-chart-3)',
    hexColor: '#8BD4F4',
    nodes: [
      {
        id: 'agents',
        label: 'Agents',
        description:
          'Autonomous executors that operate in a loop: plan → act → observe → iterate. They decide which tools to call and when, driving multi-step tasks to completion without per-step human input.',
        whyItMatters:
          'Agents are the difference between "AI that answers questions" and "AI that completes tasks." Understanding agents is key to building autonomous AI workflows that can handle complex, multi-step work.',
        examples: ['OpenAI Assistants API', 'LangGraph agents', 'CrewAI', 'AutoGen', 'Claude with tool use'],
        misconception:
          'Agents are not just chatbots with tools. True agents loop autonomously — they plan, execute, observe results, and decide next steps without human approval at each stage.',
        difficulty: 'advanced',
        gettingStarted:
          'Start with OpenAI\'s Assistants API for a managed experience, or LangGraph if you want fine-grained control over the agent loop.',
        resources: [
          { label: 'OpenAI Agents Guide', url: 'https://platform.openai.com/docs/guides/agents' },
          { label: 'LangGraph Documentation', url: 'https://langchain-ai.github.io/langgraph/' },
        ],
      },
      {
        id: 'skills-tools',
        label: 'Skills / Tools',
        description:
          'Discrete capabilities an agent can invoke: web search, code execution, calendar access, database queries, email sending, and more. Each tool has a defined interface.',
        aliases: ['Tools', 'Capabilities', 'Plugins'],
        whyItMatters:
          'Tools are what make AI useful beyond conversation. Without tools, a model can only generate text. With tools, it can search the web, run code, send emails, and interact with any API.',
        examples: ['Web search', 'Code interpreter', 'DALL-E image generation', 'Browser automation', 'Database queries'],
        misconception:
          'Tools don\'t need to be complex. A tool can be as simple as a function that fetches today\'s weather or looks up a customer record. Start small.',
        difficulty: 'intermediate',
        gettingStarted:
          'Define a simple function with clear parameters and a return type. Most frameworks (OpenAI, LangChain) let you register functions as tools with a JSON schema.',
        resources: [
          { label: 'OpenAI Function Calling Guide', url: 'https://platform.openai.com/docs/guides/function-calling' },
        ],
      },
      {
        id: 'tool-calling',
        label: 'Tool Calling',
        description:
          'The structured mechanism by which a model requests external function execution. The model outputs a call spec (name + args); the runtime executes it and returns a result.',
        aliases: ['Function Calling', 'Actions', 'Tool Use'],
        whyItMatters:
          'Tool calling is the bridge between AI reasoning and real-world action. It\'s the protocol that lets models interact with external systems in a structured, reliable way.',
        examples: ['OpenAI function calling', 'Anthropic tool use', 'Google Gemini function calling'],
        difficulty: 'intermediate',
        gettingStarted:
          'Start with OpenAI\'s function calling API. Define a simple function schema (name, description, parameters as JSON Schema) and see how the model decides when to call it.',
        resources: [
          { label: 'OpenAI Function Calling', url: 'https://platform.openai.com/docs/guides/function-calling' },
          { label: 'Anthropic Tool Use Guide', url: 'https://docs.anthropic.com/en/docs/build-with-claude/tool-use' },
        ],
      },
      {
        id: 'routing',
        label: 'Routing / Dispatcher',
        description:
          'Decides which agent, model, or skill should handle a given request. May use rules, intent classification, or a separate LLM call to route appropriately.',
        whyItMatters:
          'Not every request needs the most expensive model or the most capable agent. Routing lets you optimize for cost, speed, and quality by matching requests to the right handler.',
        examples: ['OpenAI model router', 'Semantic router libraries', 'Intent classifiers', 'LangChain routers'],
        misconception:
          'Routing doesn\'t have to be AI-powered. Simple keyword matching or regex rules can handle many routing decisions. Use AI routing only when the logic is genuinely ambiguous.',
        difficulty: 'advanced',
        gettingStarted:
          'Start with a simple rule-based router (if the request mentions code, use the coding agent; otherwise use the general agent). Graduate to LLM-based routing as complexity grows.',
      },
      {
        id: 'memory',
        label: 'Memory',
        description:
          'Storage of context beyond a single turn. Session memory is ephemeral (lost after the conversation); persistent memory survives across sessions and can be retrieved later.',
        whyItMatters:
          'Without memory, every conversation starts from zero. Memory is what makes AI feel personalized and allows it to build on previous interactions, preferences, and decisions.',
        examples: ['Conversation history', 'User preference stores', 'Mem0', 'Zep memory', 'Vector-backed long-term memory'],
        misconception:
          'Memory is not just "sending the full chat history." Effective memory involves summarizing, retrieving relevant context, and forgetting what\'s no longer useful — much like human memory.',
        difficulty: 'intermediate',
        gettingStarted:
          'Start by simply including recent conversation turns in your prompt. Then experiment with summarizing older turns and storing key facts in a separate retrieval system.',
        resources: [
          { label: 'Mem0 Documentation', url: 'https://docs.mem0.ai/' },
        ],
      },
      {
        id: 'guardrails',
        label: 'Guardrails / Policies',
        description:
          'Rules and constraints that define what the agent is allowed to do, say, or access. Enforced at inference time to prevent misuse, errors, or policy violations.',
        whyItMatters:
          'Guardrails are how you make AI safe for production. Without them, models can generate harmful content, leak sensitive data, or take unintended actions through tools.',
        examples: ['OpenAI Moderation API', 'Guardrails AI', 'NeMo Guardrails', 'Lakera Guard', 'custom content filters'],
        difficulty: 'intermediate',
        gettingStarted:
          'Start with the OpenAI Moderation API to filter harmful content. Then add custom rules for your domain — what topics are off-limits, what data should never be shared.',
        resources: [
          { label: 'NVIDIA NeMo Guardrails', url: 'https://github.com/NVIDIA/NeMo-Guardrails' },
          { label: 'Guardrails AI', url: 'https://www.guardrailsai.com/' },
        ],
      },
      {
        id: 'evals',
        label: 'Evals / Testing',
        description:
          'Automated test suites that measure agent correctness, quality, and regression over time. Essential for safely shipping improvements to prompts, tools, or models.',
        whyItMatters:
          'You can\'t improve what you can\'t measure. Evals are the only reliable way to know if a prompt change, model swap, or new tool actually makes your system better or worse.',
        examples: ['OpenAI Evals', 'Braintrust', 'Promptfoo', 'LangSmith evaluations', 'Ragas for RAG'],
        misconception:
          'Evals aren\'t just accuracy scores. Good evaluation covers tone, safety, cost, latency, and user satisfaction — not just whether the answer is "correct."',
        difficulty: 'advanced',
        gettingStarted:
          'Create 20-50 test cases from real user queries with expected outputs. Run them through your system and score the results. This simple baseline catches more regressions than you\'d expect.',
        resources: [
          { label: 'Promptfoo Getting Started', url: 'https://www.promptfoo.dev/docs/intro/' },
          { label: 'Braintrust AI', url: 'https://www.braintrust.dev/' },
        ],
      },
      {
        id: 'observability',
        label: 'Observability',
        description:
          'Detailed logs of every step in an agent run — which tools were called, what the model decided, latency at each step, token cost, and success or failure. The primary debugging surface.',
        aliases: ['Traces', 'Logging'],
        whyItMatters:
          'When an AI system fails, you need to know exactly where and why. Observability gives you the traces to debug issues, optimize performance, and understand cost drivers.',
        examples: ['LangSmith', 'Helicone', 'Langfuse', 'Arize Phoenix', 'OpenTelemetry for LLMs'],
        difficulty: 'intermediate',
        gettingStarted:
          'Instrument your LLM calls with a tracing library like Langfuse or LangSmith. Even basic logging of inputs, outputs, latency, and token counts is immensely valuable.',
        resources: [
          { label: 'Langfuse Documentation', url: 'https://langfuse.com/docs' },
          { label: 'LangSmith Documentation', url: 'https://docs.smith.langchain.com/' },
        ],
      },
    ],
  },
  {
    id: 'foundations',
    label: 'Foundations',
    subtitle: 'Models, data & execution infrastructure',
    intro:
      'Foundations are the infrastructure that everything else runs on — the models that reason, the data they draw from, and the execution environments where actions happen. You don\'t always interact with this layer directly, but understanding it determines whether you can build AI systems that are fast, cost-effective, and grounded in real knowledge.',
    cssColor: 'var(--nd-chart-4)',
    hexColor: '#786ECE',
    nodes: [
      {
        id: 'llms',
        label: 'LLMs / Models',
        description:
          'The large language models that power inference — the core reasoning engine. Different models offer different capability/cost/latency tradeoffs. Choose based on task requirements.',
        aliases: ['Models', 'Foundation Models', 'AI Models'],
        whyItMatters:
          'The model you choose determines your cost, speed, and capability ceiling. Picking the right model for each task — not always the biggest one — is a critical engineering and business decision.',
        examples: ['GPT-4o', 'Claude 3.5 Sonnet', 'Gemini 1.5 Pro', 'Llama 3', 'Mistral Large'],
        misconception:
          'Bigger models aren\'t always better. A well-prompted smaller model often outperforms a larger one on specific tasks, at a fraction of the cost and latency.',
        difficulty: 'beginner',
        gettingStarted:
          'Start with a capable general model (GPT-4o or Claude 3.5 Sonnet) to prototype, then experiment with smaller/cheaper models to find the right cost-quality tradeoff for production.',
        resources: [
          { label: 'Artificial Analysis Model Leaderboard', url: 'https://artificialanalysis.ai/' },
          { label: 'OpenAI Models Overview', url: 'https://platform.openai.com/docs/models' },
        ],
      },
      {
        id: 'context-window',
        label: 'Context Window',
        description:
          'The active working memory available to the model per request. Everything the model "sees" at once: system prompt, conversation history, retrieved docs, tool outputs, and instructions.',
        whyItMatters:
          'The context window is your budget for information. Every token of instructions, history, and retrieved docs competes for space. Managing it well is the difference between a helpful and a confused AI.',
        examples: ['GPT-4o: 128K tokens', 'Claude 3.5: 200K tokens', 'Gemini 1.5: 1M tokens'],
        misconception:
          'A bigger context window doesn\'t mean you should fill it. Models perform worse with too much irrelevant context. Precision in what you include matters more than volume.',
        difficulty: 'beginner',
        gettingStarted:
          'Use a token counter (like tiktoken) to measure how much of your context window your prompts actually use. Aim to keep it under 50% for the best quality results.',
        resources: [
          { label: 'OpenAI Tokenizer', url: 'https://platform.openai.com/tokenizer' },
        ],
      },
      {
        id: 'tokens',
        label: 'Tokens',
        description:
          'The atomic unit of text processed by a model. Drives cost calculations, determines throughput limits, and directly constrains what fits in the context window.',
        whyItMatters:
          'Tokens are the currency of AI. Every API call costs tokens (input + output), and understanding token economics is essential for building cost-effective AI applications at scale.',
        examples: ['1 token ≈ 4 English characters', '1 token ≈ ¾ of a word', '"ChatGPT" = 3 tokens'],
        difficulty: 'beginner',
        gettingStarted:
          'Paste your typical prompts into OpenAI\'s tokenizer tool to understand how many tokens they consume. This grounds your cost estimates in reality.',
        resources: [
          { label: 'OpenAI Tokenizer Tool', url: 'https://platform.openai.com/tokenizer' },
          { label: 'OpenAI Pricing', url: 'https://openai.com/pricing' },
        ],
      },
      {
        id: 'retrieval',
        label: 'Retrieval / RAG',
        description:
          "Fetches relevant documents at inference time to ground the model in up-to-date, proprietary, or specialized knowledge it wasn't trained on. Reduces hallucination on domain-specific topics.",
        aliases: ['RAG', 'Retrieval-Augmented Generation', 'Semantic Search'],
        whyItMatters:
          'RAG is how you make AI accurate about your specific data — company docs, product catalogs, knowledge bases. Without it, the model only knows what it was trained on, which may be outdated or generic.',
        examples: ['Pinecone', 'Weaviate', 'ChromaDB', 'pgvector', 'OpenAI file search'],
        misconception:
          'RAG is not just "dump all documents into a vector database." The quality of your chunking strategy, embedding model, and retrieval logic matters far more than the volume of data.',
        difficulty: 'intermediate',
        gettingStarted:
          'Start with OpenAI\'s built-in file search for Assistants, or set up a simple ChromaDB instance. Index a small set of documents and test retrieval quality before scaling.',
        resources: [
          { label: 'Pinecone RAG Guide', url: 'https://www.pinecone.io/learn/retrieval-augmented-generation/' },
          { label: 'LangChain RAG Tutorial', url: 'https://python.langchain.com/docs/tutorials/rag/' },
        ],
      },
      {
        id: 'embeddings',
        label: 'Embeddings',
        description:
          'Dense vector representations of text that capture semantic meaning, enabling similarity search. "Find content closest in meaning to this query" — the engine behind RAG.',
        whyItMatters:
          'Embeddings make semantic search possible. Instead of matching exact keywords, you find content that means the same thing — which is how AI "understands" your data.',
        examples: ['OpenAI text-embedding-3-small', 'Cohere Embed', 'Voyage AI', 'Sentence Transformers'],
        difficulty: 'intermediate',
        gettingStarted:
          'Use OpenAI\'s text-embedding-3-small for most use cases. It\'s cheap, fast, and effective. Only upgrade to larger models if you need better multilingual or specialized domain performance.',
        resources: [
          { label: 'OpenAI Embeddings Guide', url: 'https://platform.openai.com/docs/guides/embeddings' },
        ],
      },
      {
        id: 'knowledge-base',
        label: 'Knowledge Base',
        description:
          "The indexed repositories — documents, databases, wikis, code — that retrieval draws from. Represents an organization's proprietary knowledge made accessible to AI.",
        aliases: ['Data Sources', 'Vector Store', 'Document Store'],
        whyItMatters:
          'Your knowledge base is what makes your AI system uniquely valuable. Generic models are commodities — a model grounded in your proprietary data is a competitive advantage.',
        examples: ['Confluence wikis', 'Notion databases', 'Google Drive', 'GitHub repos', 'Internal databases'],
        misconception:
          'A knowledge base doesn\'t have to be a vector database. It can be a SQL database, a folder of PDFs, an API endpoint, or even a well-structured spreadsheet. Start with what you have.',
        difficulty: 'beginner',
        gettingStarted:
          'Identify the 10-20 documents your team references most often. These are your highest-value knowledge base candidates. Index them first and expand from there.',
      },
      {
        id: 'runtime-sandbox',
        label: 'Runtime / Sandbox',
        description:
          'Secure, isolated execution environment where code and tool actions actually run. Prevents malicious or accidental damage from agent-generated code or misconfigured tools.',
        aliases: ['Code Interpreter', 'Execution Environment'],
        whyItMatters:
          'When AI generates and runs code, you need isolation. A sandbox prevents a buggy script from deleting your database or a prompt injection from accessing sensitive files.',
        examples: ['OpenAI Code Interpreter', 'E2B sandboxes', 'Modal', 'Docker containers', 'AWS Lambda'],
        difficulty: 'advanced',
        gettingStarted:
          'Use OpenAI\'s built-in Code Interpreter for quick prototypes. For production, look at E2B or containerized environments that give you control over what the code can access.',
        resources: [
          { label: 'E2B Documentation', url: 'https://e2b.dev/docs' },
        ],
      },
      {
        id: 'integrations-apis',
        label: 'Integrations / APIs',
        description:
          'Connections to external services — CRMs, calendars, databases, SaaS tools, internal APIs — that agents can read from or write to via tool calls.',
        aliases: ['Connectors', 'Plugins', 'Actions', 'APIs'],
        whyItMatters:
          'Integrations are how AI escapes the text box and acts in the real world. Without them, AI can only talk. With them, it can update your CRM, schedule meetings, deploy code, and file tickets.',
        examples: ['Zapier integrations', 'Make.com connectors', 'REST APIs', 'GraphQL endpoints', 'MCP servers'],
        difficulty: 'intermediate',
        gettingStarted:
          'Wrap an existing API endpoint as a tool your agent can call. Start with read-only operations (fetching data) before enabling write operations (updating records).',
        resources: [
          { label: 'Model Context Protocol (MCP)', url: 'https://modelcontextprotocol.io/' },
        ],
      },
      {
        id: 'auth-permissions',
        label: 'Auth / Permissions',
        description:
          'Access control determining what data a user can access, what tools an agent is allowed to call, and enforcing least-privilege principles across the system.',
        aliases: ['IAM', 'Access Control', 'OAuth', 'RBAC'],
        whyItMatters:
          'AI amplifies access. An agent with broad permissions and a prompt injection vulnerability can be as dangerous as a compromised admin account. Least-privilege is non-negotiable.',
        examples: ['OAuth 2.0 scopes', 'API key restrictions', 'Role-based access control', 'AWS IAM policies'],
        misconception:
          'Auth isn\'t just about user login. In AI systems, you also need to control what the agent itself can access — which tools, which data sources, and which actions are permitted per user role.',
        difficulty: 'advanced',
        gettingStarted:
          'Start by listing every tool and data source your agent can access. For each one, ask: "Should every user have this access?" If not, implement role-based restrictions.',
        resources: [
          { label: 'OWASP LLM Security Top 10', url: 'https://owasp.org/www-project-top-10-for-large-language-model-applications/' },
        ],
      },
    ],
  },
];

// ─── Edges ────────────────────────────────────────────────────────────────────

export const EDGES: Edge[] = [
  // Interface → Experience
  { from: 'chat', to: 'custom-assistants', label: 'invokes' },
  { from: 'chat', to: 'workspace', label: 'invokes' },
  { from: 'slash-commands', to: 'custom-assistants', label: 'invokes' },
  { from: 'slash-commands', to: 'workspace', label: 'invokes' },
  { from: 'terminal', to: 'custom-assistants', label: 'invokes' },
  // Experience → Orchestration
  { from: 'custom-assistants', to: 'agents', label: 'configures' },
  { from: 'custom-assistants', to: 'memory', label: 'sets up' },
  { from: 'custom-assistants', to: 'skills-tools', label: 'equips' },
  { from: 'custom-assistants', to: 'guardrails', label: 'applies' },
  { from: 'workspace', to: 'memory', label: 'shares via' },
  { from: 'workspace', to: 'agents', label: 'coordinates' },
  { from: 'app-workflow', to: 'agents', label: 'triggers' },
  { from: 'app-workflow', to: 'routing', label: 'uses' },
  // Orchestration → Foundations
  { from: 'agents', to: 'llms', label: 'uses' },
  { from: 'agents', to: 'context-window', label: 'fills' },
  { from: 'tool-calling', to: 'runtime-sandbox', label: 'executes in' },
  { from: 'tool-calling', to: 'integrations-apis', label: 'calls' },
  { from: 'routing', to: 'llms', label: 'dispatches to' },
  { from: 'memory', to: 'knowledge-base', label: 'persists to' },
  { from: 'guardrails', to: 'auth-permissions', label: 'enforces' },
  { from: 'evals', to: 'llms', label: 'benchmarks' },
  { from: 'observability', to: 'llms', label: 'traces' },
  { from: 'skills-tools', to: 'runtime-sandbox', label: 'runs in' },
  { from: 'skills-tools', to: 'integrations-apis', label: 'uses' },
  // Foundation → Foundation
  { from: 'retrieval', to: 'knowledge-base', label: 'pulls from' },
  { from: 'retrieval', to: 'embeddings', label: 'uses' },
  { from: 'embeddings', to: 'knowledge-base', label: 'indexes' },
  { from: 'context-window', to: 'tokens', label: 'measured in' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function findLayerForNode(nodeId: string): LayerDef | undefined {
  return LAYERS.find((l) => l.nodes.some((n) => n.id === nodeId));
}

export function findNodeById(nodeId: string): NodeDef | undefined {
  for (const layer of LAYERS) {
    const node = layer.nodes.find((n) => n.id === nodeId);
    if (node) return node;
  }
  return undefined;
}

export function getConnectedIds(nodeId: string | null): Set<string> {
  const ids = new Set<string>();
  if (!nodeId) return ids;
  ids.add(nodeId);
  EDGES.forEach((e) => {
    if (e.from === nodeId) ids.add(e.to);
    if (e.to === nodeId) ids.add(e.from);
  });
  return ids;
}

export function isCrossLayerEdge(edge: Edge): boolean {
  const from = findLayerForNode(edge.from);
  const to = findLayerForNode(edge.to);
  return !!from && !!to && from.id !== to.id;
}
