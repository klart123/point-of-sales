export type ErrorPayload = string | Record<string, any>;

export type Category = {
  id: number;
  name: string;
  type: string;
};

export type ProductCategory = {
  id: number;
  name: string;
  category_id: number;
  products: object[];
};

export type ProductState = {
  products: null | object;
  loading: boolean;
  error: string | null | Record<string, any>;
  hasMore: boolean;
  isSuccess: boolean;
  categories: Category[];
  productCategories: ProductCategory[];
  productsGrouped: object[];
  isAddingLoading: boolean;
  isAddingSuccess: boolean;
};

export type ProductItemProps = {
  item: {
    id: number;
    name: string;
    price: number;
    product_categories: ProductCategory[];
    variants: {
      [key: string]: {
        size: string;
        price: number;
      }[];
    };
  };
  onPress?: (item: object) => void;
};
