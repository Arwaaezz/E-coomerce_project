export interface Brand {
  _id: string;
  name: string;
  slug: string;
  image?: string;

  [key: string]: unknown;
}
