import React, {useState, useEffect} from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import styles from './styles';
import {useSelector} from 'react-redux';
import {RootState} from '../../redux/store';
import {Dropdown} from 'react-native-element-dropdown';

// ─── Types ────────────────────────────────────────────────────────────────────

type Temperature = {
  value: 'hot' | 'cold' | 'blended';
  label: string;
};

type VariantRow = {
  temperature: string;
  size: string;
  price: string;
};

type ProductFormData = {
  name: string;
  description: string;
  category_id: string | number;
  variants: VariantRow[];
};

type Props = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: {category_id: number | number; name: string}) => void;
};

const TEMPERATURES: Temperature[] = [
  {value: 'hot', label: 'Hot'},
  {value: 'cold', label: 'Cold'},
  {value: 'blended', label: 'Blended'},
];

const TEMP_COLORS: Record<string, {bg: string; text: string; border: string}> =
  {
    hot: {bg: '#FFF3E0', text: '#E65100', border: '#FFCC80'},
    cold: {bg: '#E3F2FD', text: '#1565C0', border: '#90CAF9'},
    blended: {bg: '#F3E5F5', text: '#6A1B9A', border: '#CE93D8'},
  };

// ─── Component ────────────────────────────────────────────────────────────────

const AddProductCategoryModal: React.FC<Props> = ({
  visible,
  onClose,
  onSubmit,
}) => {
  const {categories, isAddingLoading, isAddingSuccess, productCategories} =
    useSelector((state: RootState) => state.products);

  const [name, setName] = useState('');
  const [category, setCategory] = useState(null);

  useEffect(() => {
    if (categories?.length > 0 && !category) {
      setCategory(String(categories[0].id));
    }
  }, [categories]);

  useEffect(() => {
    if (isAddingLoading === false && isAddingSuccess === true) {
      resetForm();
    }
  }, [isAddingLoading, isAddingSuccess]);

  const handleSubmit = () => {
    if (!name || !category) return;
    onSubmit({
      category_id: category?.id,
      name,
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setName('');
    setCategory(null);
  };

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={[styles.title, styles.modalTitleSpacing]}>
            Add Product Category
          </Text>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}>
            {/* Category picker */}
            <View style={styles.categoryRow}>
              <Dropdown
                style={styles.categoryDropdown}
                selectedTextStyle={styles.categoryDropdownText}
                placeholderStyle={styles.categoryDropdownPlaceholder}
                value={category}
                onChange={value => setCategory(value)}
                data={categories}
                labelField="name"
                valueField="id"
                placeholder="Select which category this product belongs"
                renderItem={(item: any) => (
                  <View style={styles.dropdownItem}>
                    <Text>{item.name}</Text>
                  </View>
                )}
              />
            </View>

            {/* Name */}
            <TextInput
              placeholder="Name"
              style={styles.input}
              value={name}
              onChangeText={setName}
            />
          </ScrollView>

          {/* Footer buttons */}
          <View style={styles.buttons}>
            <TouchableOpacity onPress={handleClose} style={styles.buttonCancel}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSubmit} style={styles.buttonAdd}>
              <Text style={styles.buttonText}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default AddProductCategoryModal;
