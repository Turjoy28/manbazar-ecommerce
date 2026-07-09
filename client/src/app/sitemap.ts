import { MetadataRoute } from 'next'
import { getProducts } from '@/services/product'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://manbazar.com'

  try {
    // Fetch products to include in the sitemap
    const productsData = await getProducts(1, 100);
    const products = productsData?.data?.products || [];

    const productUrls: MetadataRoute.Sitemap = products.map((product) => ({
      url: `${baseUrl}/product/${product.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
      ...productUrls,
    ]
  } catch (error) {
    // Fallback if API is down
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      }
    ]
  }
}
