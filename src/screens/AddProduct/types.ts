export type VariantRow = {
  temperature: string;
  size: string;
  price: string;
};

// export type ProductFormData = {
//   name: string;
//   description: string;
//   category_id: string | number;
//   variants: VariantRow[];
// };

// export type Props = {
//   visible: boolean;
//   onClose: () => void;
//   onSubmit: (data: ProductFormData) => void;
// };

export type Temperature = {
  value: 'hot' | 'cold' | 'blended';
  label: string;
};
