/** Honest trust helpers for knowledge articles (M5). */

export function knowledgeDisclaimer(category?: string | null): string {
    switch ((category || '').toLowerCase()) {
        case 'medical':
            return 'General education only — not a medical diagnosis or treatment plan. Seek a clinician for personal advice; descend and get help for worsening altitude symptoms.';
        case 'permit':
            return 'Permit rules and fees change. Confirm current requirements with official offices or a registered agency before you travel.';
        case 'emergency':
            return 'Emergency numbers and rescue procedures can change. Confirm locally on arrival and ensure your insurance covers high-altitude evacuation.';
        case 'safety':
            return 'Trail conditions and official advisories change. Check the latest guidance for your nationality and follow local advice on the trail.';
        default:
            return 'TrekPal guides support preparation. Cross-check critical details (permits, weather, health) with official sources before you go.';
    }
}

export function sourceHostname(url?: string | null): string | null {
    if (!url) return null;
    try {
        return new URL(url).hostname.replace(/^www\./, '');
    } catch {
        return null;
    }
}

type ContentBlock =
    | { type: 'heading'; text: string }
    | { type: 'paragraph'; text: string }
    | { type: 'list'; items: string[] };

/** Lightweight markdown-ish renderer for seeded article content. */
export function parseArticleContent(content: string): ContentBlock[] {
    const blocks: ContentBlock[] = [];
    const chunks = content.split(/\n\n+/);

    for (const raw of chunks) {
        const chunk = raw.trim();
        if (!chunk) continue;

        if (chunk.startsWith('## ')) {
            blocks.push({ type: 'heading', text: chunk.replace(/^##\s+/, '').trim() });
            continue;
        }

        const lines = chunk.split('\n').map((line) => line.trim()).filter(Boolean);
        const bulletLines = lines.filter((line) => line.startsWith('- '));
        if (bulletLines.length > 0 && bulletLines.length === lines.length) {
            blocks.push({
                type: 'list',
                items: bulletLines.map((line) => line.replace(/^-+\s*/, '')),
            });
            continue;
        }

        blocks.push({ type: 'paragraph', text: chunk.replace(/\n/g, ' ') });
    }

    return blocks;
}
