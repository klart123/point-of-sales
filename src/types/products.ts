export type ErrorPayload = string | Record<string, any>;

export type ProductState = {
  products: null | object;
  loading: boolean;
  error: string | null | Record<string, any>;
  hasMore: boolean;
};

export type ProductItemProps = {
  item: {
    id: number;
    name: string;
    price: number;
  };
};
