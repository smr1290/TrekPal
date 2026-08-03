'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import Card from '@/components/Card';
import PageContainer from '@/components/PageContainer';
import Input from '@/components/Input';
import Button from '@/components/Button';
import ProtectedRoute from '@/components/ProtectedRoute';
import { EmptyState, LoadingBlock } from '@/components/ui';
import { ApiError, chatApi } from '@/lib/api';
import type { ChatAnswer, ChatResponse } from '@/lib/types';

type ChatMessage = { role: 'user' | 'assistant'; content: string };

function chatErrorMessage(error: unknown): string {
    if (error instanceof ApiError) {
        if (error.status === 401) {
            return 'Your session expired. Please sign in again, then retry.';
        }
        if (error.status === 429) {
            return error.message || 'Rate limit reached (20 questions/hour). Try again later.';
        }
        if (error.status === 502 || error.status === 500) {
            return error.message || 'The AI provider is unavailable. Check GROQ_API_KEY on the API.';
        }
        return error.message;
    }
    if (error instanceof Error && error.message) return error.message;
    return 'Could not reach chat. Check that you are signed in and the API is running.';
}

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
                    content: chatErrorMessage(error),
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
                        Sign-in required. Answers are grounded in the knowledge base (limit 20
                        questions/hour). Not medical or legal advice.
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
                                                ? 'border-[var(--accent)]/25 bg-[var(--accent-soft)]'
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
                            <h2 className="text-sm font-semibold text-[var(--foreground)]">Sources</h2>
                            <p className="mt-2 text-xs text-[var(--muted)]">
                                Knowledge articles used to ground your answer — open them to verify.
                            </p>

                            <div className="mt-4 space-y-2">
                                {sources.length === 0 ? (
                                    <p className="text-sm text-[var(--muted)]">No sources yet.</p>
                                ) : (
                                    sources.map((s) => (
                                        <Link
                                            key={s}
                                            href={`/knowledge/${s}`}
                                            className="block text-sm font-semibold text-[var(--accent)] hover:underline"
                                        >
                                            {s}
                                        </Link>
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
