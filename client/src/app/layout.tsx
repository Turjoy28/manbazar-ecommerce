import type { Metadata } from "next";
import "./globals.css";
import { OrderProvider } from "@/providers/OrderProvider";
import { Toaster } from "sonner";
import FloatingCartButton from "@/components/shared/FloatingCartButton";
import FloatingChatbot from "@/components/shared/FloatingChatbot";
import { getUiData } from "@/services/ui";

export const metadata: Metadata = {
  title: "Fashion T-Shirts | ব্র্যান্ডেড শার্ট",
  description: "ক্লাসিক স্ট্রাইপ, সলিড, এবং বক্স চেক ডিজাইনের ব্র্যান্ডেড শার্ট",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const uiData = await getUiData();

  const theme = uiData?.data?.[0]?.theme;

  const primaryColor = theme?.primaryColor || "#e07b39";
  const secondaryColor = theme?.secondaryColor || "#111827";
  const tertiaryColor = theme?.tertiaryColor || "#f97316";

  return (
    <html lang="bn" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <style
          dangerouslySetInnerHTML={{
            __html: `
              :root {
                --primary-brand: ${primaryColor};
                --secondary-brand: ${secondaryColor};
                --tertiary-brand: ${tertiaryColor};
              }
            `,
          }}
        />
        <OrderProvider>
          {children}
          <FloatingCartButton />
          <FloatingChatbot chatbot={uiData?.data?.[0]?.chatbot} />
        </OrderProvider>
        <Toaster richColors />
      </body>
    </html>
  );
}
