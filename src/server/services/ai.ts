/**
 * AI Service - Claude integration for ticket creation
 */

import Anthropic from '@anthropic-ai/sdk';

// Types
export interface TicketSuggestion {
  title: string;
  description: string;
  type: 'ISSUE' | 'FIX' | 'HOTFIX' | 'PROBLEM';
  priority: 'LOWEST' | 'LOW' | 'MEDIUM' | 'HIGH' | 'HIGHEST';
  storyPoints: number;
}

export interface AIAnalysisResult {
  suggestions: TicketSuggestion[];
  reasoning: string;
  shouldSplit: boolean;
}

// Initialize client (lazy - only when API key exists)
function getClient(): Anthropic | null {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey === '' || apiKey === 'your-api-key') {
    return null;
  }
  return new Anthropic({ apiKey });
}

const SYSTEM_PROMPT = `You are a ticket creation assistant for a project management system called Sensey Board.

Your job is to analyze user requests and suggest well-structured tickets.

Ticket Types:
- ISSUE: New feature or enhancement
- FIX: Bug fix for existing functionality
- HOTFIX: Urgent fix for production issue
- PROBLEM: Known issue or technical debt

Priority Levels (choose based on impact and urgency):
- LOWEST: Nice to have, no deadline
- LOW: Should be done eventually
- MEDIUM: Standard priority
- HIGH: Important, should be done soon
- HIGHEST: Critical, needs immediate attention

Guidelines:
1. Create clear, actionable ticket titles (max 100 chars)
2. Write detailed descriptions explaining the what and why
3. Break complex requests into multiple tickets if needed
4. Estimate story points: 1 (trivial), 2 (small), 3 (medium), 5 (large), 8 (very large), 13 (epic)
5. Choose appropriate type and priority based on context

Always respond with valid JSON in this format:
{
  "suggestions": [
    {
      "title": "Ticket title here",
      "description": "Detailed description...",
      "type": "ISSUE",
      "priority": "MEDIUM",
      "storyPoints": 3
    }
  ],
  "reasoning": "Brief explanation of your analysis",
  "shouldSplit": false
}`;

/**
 * Analyze a user's ticket request and generate suggestions
 */
export async function analyzeTicketRequest(
  userInput: string,
  boardContext?: { name: string; description?: string | null }
): Promise<AIAnalysisResult> {
  const client = getClient();

  if (!client) {
    throw new Error(
      'AI features are not configured. Please add ANTHROPIC_API_KEY to enable.'
    );
  }

  const contextInfo = boardContext
    ? `\nBoard Context: "${boardContext.name}"${boardContext.description ? ` - ${boardContext.description}` : ''}`
    : '';

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2048,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `${contextInfo}\n\nUser Request:\n${userInput}`,
      },
    ],
  });

  // Extract text content
  const textContent = response.content.find((c) => c.type === 'text');
  if (!textContent || textContent.type !== 'text') {
    throw new Error('Unexpected response format from AI');
  }

  try {
    const result = JSON.parse(textContent.text) as AIAnalysisResult;
    return result;
  } catch {
    throw new Error('Failed to parse AI response');
  }
}

/**
 * Check if AI features are available
 */
export function isAIAvailable(): boolean {
  return getClient() !== null;
}
