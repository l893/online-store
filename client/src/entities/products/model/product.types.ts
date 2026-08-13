export interface Product {
  readonly _id: string;
  readonly title: string;
  readonly slug: string;
  readonly description?: string;
  readonly price: number;
  readonly images: readonly string[];
  readonly categoryId?: string | null;
  readonly stock: number;
}
