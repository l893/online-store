export interface ProductFormInputValues {
  readonly title: string;
  readonly slug: string;
  readonly description: string | null | undefined;
  readonly price: number;
  readonly categoryId: string | null | undefined;
  readonly stock: number;
  readonly image: string | null | undefined;
}

export interface ProductFormValues {
  readonly title: string;
  readonly slug: string;
  readonly description?: string | null;
  readonly price: number;
  readonly categoryId?: string | null;
  readonly stock: number;
  readonly image?: string | null;
}

export type ProductFormSubmitHandler = (
  values: ProductFormValues,
) => Promise<void>;

export interface ProductFormInitialValues {
  readonly title: string;
  readonly slug: string;
  readonly description: string;
  readonly price: number | '';
  readonly categoryId: string;
  readonly stock: number | '';
  readonly image: string;
}
