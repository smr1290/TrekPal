'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import Badge from '@/components/Badge';
import Card from '@/components/Card';
import PageContainer from '@/components/PageContainer';
import Input from '@/components/Input';
import Button from '@/components/Button';
import ProtectedRoute from '@/components/ProtectedRoute';
import { EmptyState, LoadingBlock } from '@/components/ui';
import TrustNotice from '@/components/TrustNotice';
import { ApiError, chatApi } from '@/lib/api';
import type { ChatAnswer, ChatResponse, ChatSource } from '@/lib/types';

type ChatMessage = {
    role: 'user' | 'assistant';
    content: string;
    id: string;
    source?: 'ai' | 'knowledge_fallback';
    isError?: boolean;
};

function chatErrorMessage(error: unknown): string {
    if (error instanceof ApiError) {
        if (error.status === 401) {
            return 'Your session expired. Please sign in again, then retry.';
        }
        if (error.status === 429) {
            return error.message || 'Rate limit reached (20 questions/hour). Try again later.';
        }
        return error.message;
    }
    if (error instanceof Error && error.message) return error.message;
    return 'Could not reach TrekPal chat. Check your connection and try again.';
}

export default function ChatPage() {
    const reduce = useReducedMotion();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [sources, setSources] = useState<ChatSource[]>([]);
    const threadRef = useRef<HTMLDivElement>(null);

    const hasConversation = messages.length > 0;

    const placeholder = useMemo(() => {
        return 'Try: "What gear do I need for an Everest Base Camp trek?"';
    }, []);

    useEffect(() => {
        threadRef.current?.scrollTo({
            top: threadRef.current.scrollHeight,
            behavior: reduce ? 'auto' : 'smooth',
        });
    }, [messages, isLoading, reduce]);

    const send = async () => {
        const text = input.trim();
        if (!text || isLoading) return;

        setIsLoading(true);
        setSources([]);
        setInput('');
        setMessages((prev) => [
            ...prev,
            { role: 'user', content: text, id: `u-${Date.now()}` },
        ]);

        try {
            const data: ChatResponse = await chatApi.ask(text);
            const answer: ChatAnswer = data.result;
            setMessages((prev) => [
                ...prev,
                {
                    role: 'assistant',
                    content: answer.answer,
                    id: `a-${Date.now()}`,
                    source: answer.source,
                },
            ]);
            setSources(answer.sources || []);
        } catch (error) {
            console.error('Chat error:', error);
            setMessages((prev) => [
                ...prev,
                {
                    role: 'assistant',
                    content: chatErrorMessage(error),
                    id: `e-${Date.now()}`,
                    isError: true,
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ProtectedRoute>
            <PageContainer className="pb-28 sm:pb-16">
                <div className="mb-8 sm:mb-10">
                    <p className="eyebrow">Ask your buddy</p>
                    <h1 className="display-title mt-3 text-3xl sm:text-5xl">AI trek assistant</h1>
                    <p className="mt-4 max-w-2xl text-base leading-relaxed text-[var(--muted)]">
                        Sign-in required. Answers are grounded in the knowledge base (limit 20
                        questions/hour). Open linked sources to verify.
                    </p>
                    <TrustNotice className="mt-3 max-w-2xl" />
                </div>

                <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
                    <div
                        ref={threadRef}
                        className="max-h-[min(55vh,28rem)] min-h-[280px] overflow-y-auto overscroll-contain sm:max-h-none sm:min-h-[420px] sm:overflow-visible"
                    >
                        {!hasConversation && !isLoading ? (
                            <EmptyState
                                title="Start a conversation"
                                description="Ask for permits, packing tips, altitude safety, or emergency guidance."
                            />
                        ) : null}

                        {hasConversation ? (
                            <div className="space-y-4">
                                <AnimatePresence initial={false}>
                                    {messages.map((m) => (
                                        <motion.div
                                            key={m.id}
                                            initial={reduce ? false : { opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.25 }}
                                        >
                                            <Card
                                                className={`p-5 ${
                                                    m.role === 'user'
                                                        ? 'border-[var(--accent)]/25 bg-[var(--accent-soft)]'
                                                        : ''
                                                }`}
                                            >
                                                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">
                                                    {m.role === 'user' ? 'You' : 'TrekPal'}
                                                </p>
                                                {m.role === 'assistant' && m.source === 'knowledge_fallback' ? (
                                                    <div className="mt-2">
                                                        <Badge variant="warning">
                                                            Knowledge fallback (Groq unavailable)
                                                        </Badge>
                                                    </div>
                                                ) : null}
                                                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">
                                                    {m.content}
                                                </p>
                                                {m.isError ? (
                                                    <div className="mt-3 flex flex-wrap gap-3 text-xs font-semibold">
                                                        <Link
                                                            href="/knowledge"
                                                            className="text-[var(--accent)] hover:underline"
                                                        >
                                                            Browse Knowledge →
                                                        </Link>
                                                        <Link
                                                            href="/planner?tab=checklist"
                                                            className="text-[var(--accent)] hover:underline"
                                                        >
                                                            Build checklist →
                                                        </Link>
                                                    </div>
                                                ) : null}
                                            </Card>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                                {isLoading ? <LoadingBlock label="Thinking…" /> : null}
                            </div>
                        ) : null}
                    </div>

                    <aside className="hidden lg:block">
                        <Card className="p-5">
                            <h2 className="text-sm font-semibold text-[var(--foreground)]">Sources</h2>
                            <p className="mt-2 text-xs text-[var(--muted)]">
                                Knowledge articles used to ground your answer — open them to verify.
                            </p>

                            <div className="mt-4 space-y-3">
                                {sources.length === 0 ? (
                                    <p className="text-sm text-[var(--muted)]">No sources yet.</p>
                                ) : (
                                    sources.map((s) => (
                                        <Link
                                            key={s.slug}
                                            href={`/knowledge/${s.slug}`}
                                            className="block rounded-[var(--radius)] border border-[var(--border)] p-3 transition hover:border-[var(--accent)]/40"
                                        >
                                            <p className="text-sm font-semibold text-[var(--accent)]">
                                                {s.title}
                                            </p>
                                            <p className="mt-1 text-xs text-[var(--muted)]">
                                                Open article to verify →
                                            </p>
                                        </Link>
                                    ))
                                )}
                            </div>
                        </Card>
                    </aside>
                </div>

                {/* Sticky composer: stays above mobile keyboard chrome (R7) */}
                <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--border)] bg-[var(--surface)]/95 px-4 py-3 backdrop-blur-md supports-[padding:max(0px)]:pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:static sm:mt-8 sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
                    <div className="mx-auto w-full max-w-6xl">
                        {sources.length > 0 ? (
                            <p className="mb-2 text-xs text-[var(--muted)] lg:hidden">
                                {sources.length} source{sources.length === 1 ? '' : 's'} linked — open
                                from desktop sidebar or Knowledge.
                            </p>
                        ) : null}
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
                        <div className="mt-2 flex justify-end">
                            <Button
                                onClick={() => void send()}
                                loading={isLoading}
                                disabled={!input.trim() && !isLoading}
                            >
                                {isLoading ? 'Sending…' : 'Send'}
                            </Button>
                        </div>
                    </div>
                </div>
            </PageContainer>
        </ProtectedRoute>
    );
}
