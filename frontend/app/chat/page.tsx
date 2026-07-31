'use client';

import React, { useMemo, useState } from 'react';
import Card from '@/components/Card';
import PageContainer from '@/components/PageContainer';
import Input from '@/components/Input';
import Button from '@/components/Button';
import ProtectedRoute from '@/components/ProtectedRoute';
import { EmptyState, LoadingBlock } from '@/components/ui';
import { chatApi } from '@/lib/api';
import type { ChatAnswer, ChatResponse } from '@/lib/types';

type ChatMessage = { role: 'user' | 'assistant'; content: string };

export default function ChatPage() {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [sources, setSources] = useState<string[]>([]);

    const hasConversation = messages.length > 0;

    const placeholder = useMemo(() => {
        return 'Try: "What gear do I need for an Everest Base Camp trek?"';
    }, []);

    const send = async () => {
        const text = input.trim();
        if (!text || isLoading) return;

        setIsLoading(true);
        setSources([]);
        setInput('');
        setMessages((prev) => [...prev, { role: 'user', content: text }]);

        try {
            const data: ChatResponse = await chatApi.ask(text);
            const answer: ChatAnswer = data.result;
            setMessages((prev) => [...prev, { role: 'assistant', content: answer.answer }]);
            setSources(answer.sources || []);
        } catch (error) {
            console.error('Chat error:', error);
            setMessages((prev) => [
                ...prev,
                {
                    role: 'assistant',
                    content:
                        'Sorry — chat requires sign-in, a configured GROQ_API_KEY, and stays under 20 questions per hour.',
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ProtectedRoute>
        <PageContainer>
            <div className="mb-8">
                <h1 className="font-[family-name:var(--font-display)] text-4xl font-semibold tracking-tight">
                    AI trek assistant
                </h1>
                <p className="mt-2 text-base leading-relaxed text-[var(--muted)]">
                    Sign-in required. Answers are grounded in the knowledge base (limit 20 questions/hour).
                </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
                <div className="min-h-[420px]">
                    {!hasConversation && !isLoading ? (
                        <EmptyState
                            title="Start a conversation"
                            description="Ask for permits, packing tips, altitude safety, or emergency guidance."
                        />
                    ) : null}

                    {hasConversation ? (
                        <div className="space-y-4">
                            {messages.map((m, idx) => (
                                <Card
                                    key={idx}
                                    className={`p-5 ${
                                        m.role === 'user'
                                            ? 'bg-[var(--accent-soft)] border-[var(--accent)]/25'
                                            : ''
                                    }`}
                                >
                                    <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                                        {m.role === 'user' ? 'You' : 'TrekPal'}
                                    </p>
                                    <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">
                                        {m.content}
                                    </p>
                                </Card>
                            ))}
                            {isLoading ? <LoadingBlock label="Thinking…" /> : null}
                        </div>
                    ) : null}
                </div>

                <aside>
                    <Card className="p-5">
                        <h2 className="text-sm font-semibold text-[var(--foreground)]">
                            Sources
                        </h2>
                        <p className="mt-2 text-xs text-[var(--muted)]">
                            Knowledge articles used to ground your answer.
                        </p>

                        <div className="mt-4 space-y-2">
                            {sources.length === 0 ? (
                                <p className="text-sm text-[var(--muted)]">No sources yet.</p>
                            ) : (
                                sources.map((s) => (
                                    <p key={s} className="text-sm font-semibold text-[var(--accent)]">
                                        {s}
                                    </p>
                                ))
                            )}
                        </div>
                    </Card>
                </aside>
            </div>

            <div className="mt-8">
                <Input
                    label="Your question"
                    placeholder={placeholder}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            void send();
                        }
                    }}
                    disabled={isLoading}
                    className="!mb-0"
                />
                <div className="flex justify-end gap-3">
                    <Button
                        onClick={() => void send()}
                        disabled={isLoading || !input.trim()}
                        className="mt-2"
                    >
                        Send
                    </Button>
                </div>
            </div>
        </PageContainer>
        </ProtectedRoute>
    );
}

