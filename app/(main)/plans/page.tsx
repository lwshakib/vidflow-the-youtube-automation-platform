import { PricingTable } from "@clerk/nextjs";

export default function PlansPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          Simple, Transparent Pricing
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Choose the perfect plan for your YouTube automation needs. Start free
          and upgrade as you grow.
        </p>
      </div>

      <div className="max-w-6xl mx-auto">
        <PricingTable />
      </div>

      <div className="mt-16 text-center">
        <h2 className="text-2xl font-semibold mb-4">
          Frequently Asked Questions
        </h2>
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="text-left">
            <h3 className="font-medium mb-2">
              What's included in the free plan?
            </h3>
            <p className="text-muted-foreground">
              The free plan includes basic video generation, limited thumbnail
              creation, and access to core features to get you started.
            </p>
          </div>
          <div className="text-left">
            <h3 className="font-medium mb-2">
              Can I upgrade or downgrade my plan?
            </h3>
            <p className="text-muted-foreground">
              Yes, you can change your plan at any time. Changes take effect
              immediately and are prorated.
            </p>
          </div>
          <div className="text-left">
            <h3 className="font-medium mb-2">
              Is there a money-back guarantee?
            </h3>
            <p className="text-muted-foreground">
              We offer a 30-day money-back guarantee on all paid plans. If
              you're not satisfied, we'll refund your payment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
