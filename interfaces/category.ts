export interface Category {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  [key: string]: unknown;
}