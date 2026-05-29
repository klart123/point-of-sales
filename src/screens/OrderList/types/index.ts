export type OrderItem = {
  id: number;
  sku: string;
  name: string;
  type: string;
  size: string;
  price: number;
  quantity: number;
  status: 'pending' | 'done';
};

export type Order = {
  id: number;
  order_number: string;
  total_price: number;
  customer_name: string | null;
  status: string;
  created_at: string;
  items: OrderItem[];
};
