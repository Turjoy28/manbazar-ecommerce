/* ═══════════════════════════════════════════════════════════════════════════════
   CTA BANNER — Call to Action Section
   Displays a dynamic banner encouraging the user to place an order.
   Content (title, subtitle, button text) comes from the admin panel's 
   CTA settings via the `cta` prop. Falls back to sensible defaults
   if no CTA data is configured in the database.
   ═══════════════════════════════════════════════════════════════════════════════ */
"use client";

/* 
  Props interface for the CTA data passed from the server component.
  All fields are optional because the admin may not have configured them yet.
*/
interface CTAData {
  title?: string;
  subtitle?: string;
  buttonText?: string;
}

export default function CTABanner({ cta }: { cta?: CTAData }) {
  return (
    <section className="mx-4 md:mx-auto max-w-5xl my-3 bg-secondary text-(--secondary-text) rounded-xl px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
      {/* Left side — CTA headline and description text */}
      <div className="text-center md:text-left">
        <h3 className="font-bold text-lg md:text-xl mb-1">
          {/* Use admin-configured title, or fallback to default Bengali text */}
          {cta?.title || "আপনার পছন্দের টি-শার্ট এখনই অর্ডার করুন"}
        </h3>
        <p className="text-sm">
          {/* Use admin-configured subtitle, or fallback */}
          {cta?.subtitle ||
            "সেরা কোয়ালিটি, মূল্য সীমা এবং আকর্ষণীয় প্যাক আজকেই সুরক্ষিত করুন।"}
        </p>
      </div>
      {/* Right side — CTA button that scrolls to the billing section */}
      <a
        href="#products"
        className="bg-primary text-(--primary-text) hover:bg-primary/90 font-semibold px-8 py-3 rounded-lg transition-all duration-200 whitespace-nowrap shrink-0 animate-cta-bounce"
      >
        {/* Use admin-configured button text, or fallback */}
        {cta?.buttonText || "অর্ডার করতে চাই"}
      </a>
    </section>
  );
}
