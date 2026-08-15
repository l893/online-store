export interface ProductResponse {
  readonly _id: string;
  readonly title: string;
  readonly slug: string;
  readonly description?: string;
  readonly price: number;
  readonly images: readonly string[];
  readonly categoryId?: string;
  readonly stock: number;
}

export interface AdminProductResponse extends ProductResponse {
  readonly categoryName: string;
}

interface ProductResponseSource {
  readonly _id: unknown;
  readonly title: string;
  readonly slug: string;
  readonly description?: string | null;
  readonly price: number;
  readonly images?: readonly string[] | null;
  readonly categoryId?: unknown;
  readonly stock?: number | null;
}

export function createProductResponse(
  productDocument: ProductResponseSource,
): ProductResponse {
  return {
    _id: String(productDocument._id),
    title: productDocument.title,
    slug: productDocument.slug,
    ...(productDocument.description === undefined ||
    productDocument.description === null
      ? {}
      : {
          description: productDocument.description,
        }),
    price: productDocument.price,
    images: productDocument.images ?? [],
    ...(productDocument.categoryId
      ? {
          categoryId: String(productDocument.categoryId),
        }
      : {}),
    stock: productDocument.stock ?? 0,
  };
}

export function createAdminProductResponse(
  productDocument: ProductResponseSource,
  categoryName: string,
): AdminProductResponse {
  return {
    ...createProductResponse(productDocument),
    categoryName,
  };
}
