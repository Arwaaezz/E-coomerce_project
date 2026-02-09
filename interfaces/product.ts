import type { Brand } from "./brand";
import type { Category } from "./category";
import type { SubCategory } from "./subCategory";

export interface Product {
  _id: string;
  title: string;
  slug: string;
  description: string;

  quantity: number;
  sold: number;

  price: number;
  priceAfterDiscount?: number;

  imageCover: string;
  images: string[];

  ratingsAverage?: number;
  ratingsQuantity?: number;

  category: Category;
  brand?: Brand;
  subcategory?: SubCategory[];

  createdAt?: string;
  updatedAt?: string;

  id?: string;

  [key: string]: unknown;
}
