import Banner from "@/components/modules/dashboard/settings/Banner";
import Footer from "@/components/modules/dashboard/settings/Footer";
import LogoUpload from "@/components/modules/dashboard/settings/LogoUpload";
import ProductCaption from "@/components/modules/dashboard/settings/ProductCaption";
import SizeChart from "@/components/modules/dashboard/settings/SizeChart";
import WhyWe from "@/components/modules/dashboard/settings/WhyWe";
import CTASection from "@/components/modules/dashboard/settings/CTASection";
import ThemeColors from "@/components/modules/dashboard/settings/ThemeColors";
import ChatbotSettings from "@/components/modules/dashboard/settings/ChatbotSettings";
import CategoryLabels from "@/components/modules/dashboard/settings/CategoryLabels";
import { getUiData } from "@/services/ui";
import React from "react";

export default async function SettingsPage() {
  const uiData = await getUiData();

  if (!uiData?.data || uiData.data.length === 0) {
    return <div>No settings data available.</div>;
  }

  const setting = uiData.data[0];

  return (
    <div className="grid xl:grid-cols-3 gap-5 p-3">
      <LogoUpload
        currentLogo={uiData?.data?.[0].banner.logo}
        id={uiData?.data?.[0]._id}
      />
      <Banner
        currentBanner={uiData?.data?.[0].banner.bannerImage}
        title={uiData?.data?.[0].banner.title}
        id={uiData?.data?.[0]._id}
        currentNavbarText={uiData?.data?.[0].banner.navbarText}
        currentMarqueeText={uiData?.data?.[0].banner.marqueeText}
      />
      <ProductCaption
        caption={uiData?.data?.[0].productsCaption}
        id={uiData?.data?.[0]._id}
      />
      <SizeChart id={uiData?.data?.[0]._id} chart={uiData?.data?.[0].chart} />
      <WhyWe
        id={uiData?.data?.[0]._id}
        specialty={uiData?.data?.[0].specialty}
      />
      <CTASection id={uiData?.data?.[0]._id} cta={uiData?.data?.[0].cta} />
       <ThemeColors theme={uiData?.data?.[0].theme} id={uiData?.data?.[0]._id} />

      <CategoryLabels labels={uiData?.data?.[0].categoryLabels} id={uiData?.data?.[0]._id} />

      <ChatbotSettings id={uiData?.data?.[0]._id} chatbot={uiData?.data?.[0].chatbot} />
      <Footer id={uiData?.data?.[0]._id} footer={uiData?.data?.[0].footer} />
    </div>
  );
}
