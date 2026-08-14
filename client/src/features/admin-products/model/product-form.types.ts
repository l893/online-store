export interface ProductFormValues {
  readonly title: string;
  readonly slug: string;
  readonly description?: string | null;
  readonly price: number;
  readonly categoryId?: string | null;
  readonly stock: number;
  readonly image?: string | null;
}

export interface ProductFormInitialValues {
  readonly title: string;
  readonly slug: string;
  readonly description: string;
  readonly price: number | '';
  readonly categoryId: string;
  readonly stock: number | '';
  readonly image: string;
}
