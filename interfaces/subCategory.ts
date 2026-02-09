export interface SubCategory {
  _id: string;
  name: string;
  slug: string;
  category?: string; // ساعات بتكون id بتاع الكاتيجوري
  [key: string]: unknown;
}