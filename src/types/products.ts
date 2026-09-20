import {
  Product,
  ProductCategory,
  GroupedCategory,
} from '../database/productRepository';

export type Category = {
  id: number;
  name: string;
  type: string;
  product_categories: [];
};

export type ProductItemType = {
  id: number;
  category_id: number | null;
  product_categories: [];
  name: string;
  description: string;
  product_category_id: number | null;
};

export type ErrorResponse = {
  error: string;
};

export type ProductState = {
  products: null | object;
  loading: boolean;
  error: ErrorResponse;
  hasMore: boolean;
  isSuccess: boolean;
  categories: Category[];
  productCategories: ProductCategory[];
  productsGrouped: GroupedCategory[];
  isAddingLoading: boolean;
  isAddingSuccess: boolean;
  prodCatLoading: boolean;
  prodCatSuccess: boolean;
  prodCatError: string | null | Record<string, any>;
  isEditLoading: boolean;
  isEditSuccess: boolean;
  editError: string | null | Record<string, any>;
  productItem: ProductItemType;
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
