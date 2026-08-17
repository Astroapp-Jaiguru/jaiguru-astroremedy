export interface ArticleSeed {
  title: string;
  slug: string;
  category: string;
  tags: string[];
  featuredImage: string;
  metaTitle: string;
  metaDescription: string;
  content: string;
  isFeatured?: boolean;
}
