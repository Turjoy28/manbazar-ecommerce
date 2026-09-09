import Banner from "@/components/modules/dashboard/settings/Banner";
import Footer from "@/components/modules/dashboard/settings/Footer";
import SizeChart from "@/components/modules/dashboard/settings/SizeChart";
import LogoUpload from "@/components/modules/dashboard/settings/LogoUpload";
import CTASection from "@/components/modules/dashboard/settings/CTASection";
import ThemeColors from "@/components/modules/dashboard/settings/ThemeColors";
import ChatbotSettings from "@/components/modules/dashboard/settings/ChatbotSettings";
import RelatedProductsSettings from "@/components/modules/dashboard/settings/RelatedProductsSettings";
import CourierSettings from "@/components/modules/dashboard/settings/CourierSettings";
import AdministrationMailSettings from "@/components/modules/dashboard/settings/AdministrationMailSettings";
import DeliveryOfferSettings from "@/components/modules/dashboard/settings/DeliveryOfferSettings";
import PixelSettings from "@/components/modules/dashboard/settings/PixelSettings";
import { getUiData } from "@/services/ui";
import React from "react";

export default async function SettingsPage() {
  const uiData = await getUiData();

  if (!uiData?.data || uiData.data.length === 0) {
    return <div>No settings data available.</div>;
  }

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
        currentLogoText={uiData?.data?.[0].banner.logoText}
        currentNavbarText={uiData?.data?.[0].banner.navbarText}
        currentMarqueeText={uiData?.data?.[0].banner.marqueeText}
      />
      <AdministrationMailSettings id={uiData?.data?.[0]._id} smtp={uiData?.data?.[0].smtp} />
      <RelatedProductsSettings relatedProducts={uiData?.data?.[0].relatedProducts} id={uiData?.data?.[0]._id} />
      <DeliveryOfferSettings deliveryOffer={uiData?.data?.[0].deliveryOffer} id={uiData?.data?.[0]._id} />
      <SizeChart id={uiData?.data?.[0]._id} chart={uiData?.data?.[0].chart} />
      <CTASection id={uiData?.data?.[0]._id} cta={uiData?.data?.[0].cta} />
      <ThemeColors theme={uiData?.data?.[0].theme} id={uiData?.data?.[0]._id} />

      <CourierSettings id={uiData?.data?.[0]._id} courier={uiData?.data?.[0].courier} contactInfo={uiData?.data?.[0].footer?.contactInfo} />
      <ChatbotSettings id={uiData?.data?.[0]._id} chatbot={uiData?.data?.[0].chatbot} />
      <PixelSettings id={uiData?.data?.[0]._id} pixel={uiData?.data?.[0].pixel} />
      <Footer id={uiData?.data?.[0]._id} footer={uiData?.data?.[0].footer} />
    </div>
  );
}
