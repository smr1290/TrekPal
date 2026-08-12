import type { Metadata } from 'next';
import LegalPage from '@/components/LegalPage';

export const metadata: Metadata = {
    title: 'Privacy — TrekPal',
    description:
        'How TrekPal handles accounts, cookies, AI answers, location, and weather data. Indie student product — plain language.',
};

export default function PrivacyPage() {
    return (
        <LegalPage
            title="Privacy"
            updated="August 12, 2026"
            intro="TrekPal is a Nepal trekking preparation app built as an indie / student product. This page explains what we collect and why — in plain language, not legalese."
            sections={[
                {
                    heading: 'Who we are',
                    body: (
                        <>
                            <p>
                                TrekPal is operated by its builder as a personal learning and
                                portfolio product. We are not a registered travel agency, rescue
                                service, or medical provider.
                            </p>
                        </>
                    ),
                },
                {
                    heading: 'Account information',
                    body: (
                        <>
                            <p>
                                When you sign up we store your name, email, password hash
                                (not your raw password), and experience level so you can save
                                packing checklists and trip plans.
                            </p>
                            <p>
                                We use this only to run your account and the features you ask for
                                (history, planner, chat). We do not sell your email or profile.
                            </p>
                        </>
                    ),
                },
                {
                    heading: 'Cookies and session',
                    body: (
                        <>
                            <p>
                                After login, TrekPal sets an{' '}
                                <strong className="font-semibold text-[var(--foreground)]">
                                    httpOnly
                                </strong>{' '}
                                session cookie (
                                <code className="text-[var(--foreground)]">trekpal_access</code>
                                ) so the browser can stay signed in. JavaScript cannot read this
                                cookie. A small profile cache (name, experience) may live in{' '}
                                <code className="text-[var(--foreground)]">localStorage</code>{' '}
                                for UI only — never your password or JWT.
                            </p>
                        </>
                    ),
                },
                {
                    heading: 'Plans, chat, and AI',
                    body: (
                        <>
                            <p>
                                Packing checklists and itineraries you generate are saved to your
                                account so you can reopen them later. Chat questions are sent to
                                our API and, when configured, to Groq to generate grounded answers
                                from TrekPal knowledge articles. Do not put secrets, passport
                                numbers, or medical records in chat.
                            </p>
                        </>
                    ),
                },
                {
                    heading: 'Location and weather',
                    body: (
                        <>
                            <p>
                                Weather uses destination names you type (matched to known trek
                                areas) and Open-Meteo forecasts. Maps show curated public
                                landmarks — TrekPal does not continuously track your GPS or phone
                                location for analytics.
                            </p>
                        </>
                    ),
                },
                {
                    heading: 'Error monitoring (optional)',
                    body: (
                        <>
                            <p>
                                If Sentry is configured in production, anonymized crash reports
                                (page path, error type) may be sent so bugs can be fixed. We aim
                                not to include passwords, cookies, or API keys in those reports.
                            </p>
                        </>
                    ),
                },
                {
                    heading: 'Your choices',
                    body: (
                        <>
                            <p>
                                You can sign out anytime (clears the session cookie). To delete
                                your account or saved plans, contact the project maintainer via
                                the repository or the channel where you were invited — there is
                                no automated delete-everything button yet.
                            </p>
                        </>
                    ),
                },
                {
                    heading: 'Changes',
                    body: (
                        <>
                            <p>
                                If this policy changes in a meaningful way, we will update the
                                “Last updated” date on this page. For an indie app, that is the
                                notice mechanism.
                            </p>
                        </>
                    ),
                },
            ]}
        />
    );
}
