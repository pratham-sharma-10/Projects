import { McpServer } from '@modelcontextprotocol/server';
import { serveStdio } from '@modelcontextprotocol/server/stdio';
import * as z from 'zod/v4';
import { getConfig } from './config.ts';
import { openDatabase } from './db.ts';
import { MomentumRepository } from './repository.ts';
import { MomentumService } from './service.ts';
import { safeLog } from './privacy.ts';

function asToolResult(value: unknown) {
  return {
    content: [{ type: 'text' as const, text: JSON.stringify(value, null, 2) }],
    structuredContent: value as Record<string, unknown>
  };
}

serveStdio(() => {
  const config = getConfig();
  const db = openDatabase(config.databasePath);
  const repo = new MomentumRepository(db);
  const service = new MomentumService(repo);

  safeLog(config.debug, 'server_started', { database_initialized: true });

  const server = new McpServer({
    name: 'momentum-mcp',
    title: 'Momentum MCP',
    version: '0.1.0',
    description: 'Local-first continuity for commitments, projects, people, decisions, and unfinished work.'
  });

  server.registerTool('capture_context', {
    title: 'Capture context',
    description: 'Store a durable note, interaction, or project update. Use this when context should be available in future conversations.',
    inputSchema: z.object({
      kind: z.enum(['note', 'interaction', 'update']).default('note'),
      title: z.string().min(1).max(200),
      body: z.string().min(1).max(10000),
      project: z.string().min(1).max(200).optional(),
      person: z.string().min(1).max(200).optional(),
      relationship: z.string().max(200).optional(),
      source: z.string().max(200).optional()
    })
  }, async (input) => {
    const result = service.captureContext(input);
    safeLog(config.debug, 'tool_called', { tool: 'capture_context', status: 'ok' });
    return asToolResult(result);
  });

  server.registerTool('create_open_loop', {
    title: 'Create open loop',
    description: 'Create an unresolved commitment, follow-up, task, or dependency that should stay visible until resolved.',
    inputSchema: z.object({
      title: z.string().min(1).max(200),
      description: z.string().max(5000).optional(),
      owner: z.enum(['me', 'external', 'shared']).default('me'),
      status: z.enum(['open', 'waiting']).optional(),
      priority: z.enum(['low', 'medium', 'high']).default('medium'),
      project: z.string().min(1).max(200).optional(),
      person: z.string().min(1).max(200).optional(),
      relationship: z.string().max(200).optional(),
      dueAt: z.string().optional().describe('ISO date/time or a date parseable by JavaScript'),
      expectedAt: z.string().optional().describe('When an external response or event is expected')
    })
  }, async (input) => asToolResult(service.createOpenLoop(input)));

  server.registerTool('get_open_loops', {
    title: 'Get open loops',
    description: 'List unresolved commitments and follow-ups, optionally filtered by project, person, or status.',
    inputSchema: z.object({
      status: z.enum(['open', 'waiting', 'resolved']).optional(),
      project: z.string().optional(),
      person: z.string().optional(),
      limit: z.number().int().min(1).max(200).default(50)
    })
  }, async (input) => asToolResult({ open_loops: service.getOpenLoops(input) }));

  server.registerTool('get_waiting_on', {
    title: 'Get waiting-on items',
    description: 'List unresolved items that depend on another person or external event.',
    inputSchema: z.object({ limit: z.number().int().min(1).max(200).default(50) })
  }, async ({ limit }) => asToolResult({ waiting_on: service.getWaitingOn(limit) }));

  server.registerTool('resolve_open_loop', {
    title: 'Resolve open loop',
    description: 'Mark an open loop complete while preserving its history.',
    inputSchema: z.object({ id: z.number().int().positive() })
  }, async ({ id }) => asToolResult(service.resolveOpenLoop(id)));

  server.registerTool('get_context', {
    title: 'Get project or person context',
    description: 'Reconstruct where work or a relationship was left off by returning recent context, unresolved loops, and decisions.',
    inputSchema: z.object({
      project: z.string().optional(),
      person: z.string().optional(),
      limit: z.number().int().min(1).max(100).default(25)
    }).refine((value) => Boolean(value.project || value.person), { message: 'Provide project or person.' })
  }, async (input) => asToolResult(service.getContext(input)));

  server.registerTool('search_context', {
    title: 'Search Momentum context',
    description: 'Search notes, interactions, open loops, projects, people, and decisions for a keyword or phrase.',
    inputSchema: z.object({
      query: z.string().min(1).max(300),
      limit: z.number().int().min(1).max(100).default(20)
    })
  }, async ({ query, limit }) => asToolResult(service.searchContext(query, limit)));

  server.registerTool('record_decision', {
    title: 'Record decision',
    description: 'Persist a decision and its rationale so future AI conversations can recover why a choice was made.',
    inputSchema: z.object({
      title: z.string().min(1).max(200),
      decision: z.string().min(1).max(5000),
      rationale: z.string().max(5000).optional(),
      project: z.string().max(200).optional()
    })
  }, async (input) => asToolResult(service.recordDecision(input)));

  server.registerTool('get_recent_decisions', {
    title: 'Get recent decisions',
    description: 'Retrieve recent decisions globally or for a specific project.',
    inputSchema: z.object({
      project: z.string().optional(),
      limit: z.number().int().min(1).max(100).default(20)
    })
  }, async (input) => asToolResult({ decisions: service.getRecentDecisions(input) }));

  server.registerTool('get_daily_brief', {
    title: 'Get daily brief',
    description: 'Generate a compact daily continuity brief: priorities, overdue items, waiting-on items, stale projects, and people to reconnect with.',
    inputSchema: z.object({
      staleProjectDays: z.number().int().min(1).max(365).default(7),
      reconnectDays: z.number().int().min(1).max(365).default(14),
      priorityLimit: z.number().int().min(1).max(20).default(5)
    })
  }, async (input) => asToolResult(service.dailyBrief(input)));

  server.registerResource('momentum-guide', 'momentum://guide', {
    title: 'Momentum usage guide',
    description: 'How an AI assistant should use Momentum safely and effectively.',
    mimeType: 'text/markdown'
  }, async (uri) => ({
    contents: [{
      uri: uri.href,
      text: `# Momentum MCP\n\nMomentum stores durable continuity, not every conversation.\n\n## Capture when\n- a commitment is made\n- another person owes a response\n- a project changes state\n- a decision and rationale should survive the current chat\n\n## Privacy\nReturn only context needed for the current request. Avoid dumping the full database unless the user explicitly asks for a broad review.\n`
    }]
  }));

  server.registerResource('momentum-stats', 'momentum://stats', {
    title: 'Momentum database stats',
    description: 'Non-content counts for the local Momentum database.',
    mimeType: 'application/json'
  }, async (uri) => ({
    contents: [{ uri: uri.href, text: JSON.stringify(service.stats(), null, 2) }]
  }));

  return server;
});
