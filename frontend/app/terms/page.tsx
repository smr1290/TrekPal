import type { Metadata } from 'next';
import LegalPage from '@/components/LegalPage';

export const metadata: Metadata = {
    title: 'Terms — TrekPal',
    description:
        'TrekPal terms of use: preparation tool only, verify permits and conditions, not medical or emergency advice.',
};

export default function TermsPage() {
    return (
        <LegalPage
            title="Terms of use"
            updated="August 12, 2026"
            intro="By using TrekPal you agree to these simple terms. TrekPal is a preparation buddy — not a guide service, insurer, or emergency provider."
            sections={[
                {
                    heading: 'What TrekPal is',
                    body: (
                        <>
                            <p>
                                TrekPal helps you prepare for Nepal treks: packing checklists,
                                risk heuristics, weather orientation, knowledge articles, curated
                                maps, and optional AI chat. It is an indie / student product
                                offered as-is, without paid SLA guarantees.
                            </p>
                        </>
                    ),
                },
                {
                    heading: 'What TrekPal is not',
                    body: (
                        <>
                            <p>
                                TrekPal is{' '}
                                <strong className="font-semibold text-[var(--foreground)]">
                                    not
                                </strong>{' '}
                                medical advice, legal advice, permit issuance, live rescue
                                routing, or a guarantee of trail conditions. Risk bands and gear
                                lists are heuristics — useful starting points, not professional
                                assessments.
                            </p>
                            <p>
                                Maps show curated landmarks for orientation. They are not a
                                substitute for official maps, local guides, or emergency services.
                            </p>
                        </>
                    ),
                },
                {
                    heading: 'Verify before you travel',
                    body: (
                        <>
                            <p>
                                Always verify permits, entry rules, weather, altitude plans, and
                                medical needs with official sources, licensed agencies, and
                                qualified professionals before you go. Conditions on the trail
                                change; software cannot replace judgment on the ground.
                            </p>
                        </>
                    ),
                },
                {
                    heading: 'AI answers',
                    body: (
                        <>
                            <p>
                                Chat and some itineraries may use third-party AI (Groq) grounded
                                in TrekPal knowledge articles. Answers can be incomplete or
                                wrong. When AI is unavailable, TrekPal may fall back to templates
                                or article links — still verify everything important yourself.
                            </p>
                        </>
                    ),
                },
                {
                    heading: 'Your account',
                    body: (
                        <>
                            <p>
                                Keep your password private. You are responsible for activity under
                                your account. Do not use TrekPal to harass others or to attempt to
                                break into the service.
                            </p>
                        </>
                    ),
                },
                {
                    heading: 'No emergency guarantee',
                    body: (
                        <>
                            <p>
                                If you are in danger, contact local emergency services and people
                                on the ground. TrekPal does not dispatch rescue, monitor your
                                location in real time, or replace satellite messengers or travel
                                insurance.
                            </p>
                        </>
                    ),
                },
                {
                    heading: 'Availability',
                    body: (
                        <>
                            <p>
                                The app may be offline, slow, or missing features while it is
                                under active development. Weather and AI features depend on
                                external services that can fail.
                            </p>
                        </>
                    ),
                },
                {
                    heading: 'Limitation',
                    body: (
                        <>
                            <p>
                                To the extent allowed by law, TrekPal and its builder are not
                                liable for travel decisions, injuries, losses, or delays that
                                arise from using (or not being able to use) the app. Use TrekPal
                                as one input among many — not as your only plan.
                            </p>
                        </>
                    ),
                },
            ]}
        />
    );
}
