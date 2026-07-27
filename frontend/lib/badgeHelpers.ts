export type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';

/** Maps trek risk labels from the API to Badge visual variants. */
export function getRiskVariant(risk: string): BadgeVariant {
    switch (risk.toLowerCase()) {
        case 'low':
            return 'success';
        case 'moderate':
            return 'warning';
        case 'high':
            return 'danger';
        default:
            return 'default';
    }
}

/** Maps trek difficulty labels from the API to Badge visual variants. */
export function getDifficultyVariant(difficulty: string): BadgeVariant {
    switch (difficulty.toLowerCase()) {
        case 'easy':
            return 'success';
        case 'moderate':
            return 'warning';
        case 'hard':
            return 'danger';
        default:
            return 'default';
    }
}

const KNOWLEDGE_CATEGORY_LABELS: Record<string, string> = {
    trek_guide: 'Trek guide',
    permit: 'Permits',
    safety: 'Safety',
    packing: 'Packing',
    medical: 'Medical',
    emergency: 'Emergency',
};

export function getKnowledgeCategoryLabel(category: string): string {
    return KNOWLEDGE_CATEGORY_LABELS[category] ?? category.replace(/_/g, ' ');
}

/** Maps knowledge article categories to Badge visual variants. */
export function getKnowledgeCategoryVariant(category: string): BadgeVariant {
    switch (category) {
        case 'emergency':
        case 'medical':
            return 'danger';
        case 'safety':
            return 'warning';
        case 'permit':
            return 'info';
        case 'trek_guide':
        case 'packing':
            return 'success';
        default:
            return 'default';
    }
}

export const KNOWLEDGE_CATEGORIES = Object.keys(KNOWLEDGE_CATEGORY_LABELS);
