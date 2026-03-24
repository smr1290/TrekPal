import Link from 'next/link';
import Button from '@/components/Button';
import Card from '@/components/Card';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 gradient-hero opacity-90"></div>

        {/* Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              Your Perfect Trek
              <br />
              <span className="text-yellow-300">Starts Here</span>
            </h1>
            <p className="text-xl sm:text-2xl mb-10 text-gray-100 max-w-3xl mx-auto">
              Get personalized gear recommendations, risk assessments, and expert guidance for your next mountain adventure
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/signup">
                <Button size="lg" className="bg-white text-[var(--primary)] hover:bg-gray-100 shadow-xl">
                  Get Started Free
                </Button>
              </Link>
              <Link href="/treks">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-[var(--primary)]">
                  Browse Treks
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[var(--background)] to-transparent"></div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[var(--background)]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-[var(--foreground)]">
              Everything You Need for Your Trek
            </h2>
            <p className="text-xl text-[var(--muted)] max-w-2xl mx-auto">
              TrekPal combines expert knowledge with personalized recommendations to ensure you're fully prepared
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card hover className="text-center">
              <div className="text-5xl mb-4">🎒</div>
              <h3 className="text-2xl font-semibold mb-3 text-[var(--foreground)]">
                Smart Gear Recommendations
              </h3>
              <p className="text-[var(--muted)]">
                Get personalized gear suggestions based on your trek type, altitude, season, and experience level
              </p>
            </Card>

            <Card hover className="text-center" style={{ animationDelay: '100ms' }}>
              <div className="text-5xl mb-4">⚠️</div>
              <h3 className="text-2xl font-semibold mb-3 text-[var(--foreground)]">
                Risk Assessment
              </h3>
              <p className="text-[var(--muted)]">
                Understand the risks involved with intelligent analysis of altitude, weather, and difficulty factors
              </p>
            </Card>

            <Card hover className="text-center" style={{ animationDelay: '200ms' }}>
              <div className="text-5xl mb-4">📊</div>
              <h3 className="text-2xl font-semibold mb-3 text-[var(--foreground)]">
                Trek History
              </h3>
              <p className="text-[var(--muted)]">
                Track all your trek preparations and learn from your past adventures
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Card glass className="text-center p-12">
            <h2 className="text-4xl font-bold mb-4 text-[var(--foreground)]">
              Ready to Start Your Adventure?
            </h2>
            <p className="text-xl text-[var(--muted)] mb-8">
              Join TrekPal today and prepare for your next trek with confidence
            </p>
            <Link href="/signup">
              <Button size="lg" className="shadow-xl">
                Create Your Free Account
              </Button>
            </Link>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-[var(--border)] text-center text-[var(--muted)]">
        <p>&copy; 2026 TrekPal. Your trusted trek preparation companion.</p>
      </footer>
    </div>
  );
}
