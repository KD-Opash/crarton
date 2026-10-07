import { MetadataRoute } from 'next'
 
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://craton.com',
      lastModified: new Date('2024-10-07'),
      changeFrequency: 'monthly',
      priority: 1,
    }
  ]
}
