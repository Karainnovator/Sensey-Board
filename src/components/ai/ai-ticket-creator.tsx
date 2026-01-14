'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { TicketTypeBadge } from '@/components/ticket/ticket-type-badge';
import { TicketPriorityIcon } from '@/components/ticket/ticket-priority-icon';

interface AITicketCreatorProps {
  boardId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

type Stage = 'input' | 'review' | 'success';

interface Suggestion {
  title: string;
  description: string;
  type: 'ISSUE' | 'FIX' | 'HOTFIX' | 'PROBLEM';
  priority: 'LOWEST' | 'LOW' | 'MEDIUM' | 'HIGH' | 'HIGHEST';
  storyPoints: number;
  selected: boolean;
}

export function AITicketCreator({
  boardId,
  open,
  onOpenChange,
  onSuccess,
}: AITicketCreatorProps) {
  const [stage, setStage] = useState<Stage>('input');
  const [userInput, setUserInput] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [reasoning, setReasoning] = useState('');
  const [error, setError] = useState('');

  const utils = trpc.useUtils();

  const { data: aiStatus } = trpc.ai.isAvailable.useQuery();

  const analyzeMutation = trpc.ai.analyzeTicket.useMutation({
    onSuccess: (data) => {
      setSuggestions(data.suggestions.map((s) => ({ ...s, selected: true })));
      setReasoning(data.reasoning);
      setStage('review');
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const createMutation = trpc.ai.createFromSuggestions.useMutation({
    onSuccess: () => {
      void utils.ticket.invalidate();
      void utils.backlog.invalidate();
      setStage('success');
      setTimeout(() => {
        onOpenChange(false);
        onSuccess?.();
        resetState();
      }, 1500);
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const resetState = () => {
    setStage('input');
    setUserInput('');
    setSuggestions([]);
    setReasoning('');
    setError('');
  };

  const handleAnalyze = () => {
    setError('');
    analyzeMutation.mutate({ userInput, boardId });
  };

  const handleCreate = () => {
    const selected = suggestions.filter((s) => s.selected);
    if (selected.length === 0) {
      setError('Select at least one ticket to create');
      return;
    }
    createMutation.mutate({
      boardId,
      suggestions: selected.map(({ selected: _, ...s }) => s),
      addToBacklog: true,
    });
  };

  const toggleSuggestion = (index: number) => {
    setSuggestions((prev) =>
      prev.map((s, i) => (i === index ? { ...s, selected: !s.selected } : s))
    );
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) resetState();
      }}
    >
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[#FFB7C5]" />
            Create Tickets with AI
          </DialogTitle>
          <DialogDescription>
            Describe what you want to build and Claude will suggest tickets
          </DialogDescription>
        </DialogHeader>

        {!aiStatus?.available && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center gap-2 text-amber-800">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">AI not configured</span>
            </div>
            <p className="text-sm text-amber-700 mt-1">
              Add ANTHROPIC_API_KEY to your environment to enable AI features.
            </p>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Stage: Input */}
        {stage === 'input' && aiStatus?.available && (
          <div className="space-y-4">
            <Textarea
              placeholder="Describe what you want to build...

Example: I need a user authentication system with login, registration, password reset, and email verification."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              rows={6}
              className="resize-none"
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleAnalyze}
                disabled={!userInput.trim() || analyzeMutation.isPending}
                className="bg-[#FFB7C5] hover:bg-[#FFA3B5] gap-2"
              >
                {analyzeMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Analyze & Suggest
                  </>
                )}
              </Button>
            </DialogFooter>
          </div>
        )}

        {/* Stage: Review */}
        {stage === 'review' && (
          <div className="space-y-4">
            {reasoning && (
              <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
                <strong>AI Analysis:</strong> {reasoning}
              </div>
            )}

            <div className="space-y-3">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    suggestion.selected
                      ? 'border-[#FFB7C5] bg-pink-50/30'
                      : 'border-gray-200'
                  }`}
                  onClick={() => toggleSuggestion(index)}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox checked={suggestion.selected} className="mt-1" />
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">{suggestion.title}</span>
                        <TicketTypeBadge type={suggestion.type} />
                        <TicketPriorityIcon priority={suggestion.priority} />
                        <Badge variant="secondary">
                          {suggestion.storyPoints} pts
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        {suggestion.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setStage('input')}>
                Edit Request
              </Button>
              <Button
                onClick={handleCreate}
                disabled={
                  createMutation.isPending ||
                  !suggestions.some((s) => s.selected)
                }
                className="bg-[#FFB7C5] hover:bg-[#FFA3B5] gap-2"
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    Create {suggestions.filter((s) => s.selected).length}{' '}
                    Tickets
                  </>
                )}
              </Button>
            </DialogFooter>
          </div>
        )}

        {/* Stage: Success */}
        {stage === 'success' && (
          <div className="py-8 text-center">
            <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
            <p className="text-lg font-medium">Tickets Created!</p>
            <p className="text-sm text-gray-500">Added to backlog</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
