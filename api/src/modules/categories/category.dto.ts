export interface CategoryResponse {
  readonly _id: string;
  readonly name: string;
  readonly slug: string;
}

interface CategoryResponseSource {
  readonly _id: unknown;
  readonly name: string;
  readonly slug: string;
}

export function createCategoryResponse(
  categoryDocument: CategoryResponseSource,
): CategoryResponse {
  return {
    _id: String(categoryDocument._id),
    name: categoryDocument.name,
    slug: categoryDocument.slug,
  };
}
