import React, {useState, useEffect} from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import styles from '../styles';
import {useSelector} from 'react-redux';
import {RootState} from '../../../redux/store';
import {Dropdown} from 'react-native-element-dropdown';
import {COLORS} from '../../../theme';

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
  onSubmit: (data: ProductFormData) => void;
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

const ProductModal: React.FC<Props> = ({visible, onClose, onSubmit}) => {
  const {categories, isAddingLoading, isAddingSuccess, productCategories} =
    useSelector((state: RootState) => state.products);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(null);
  const [subCategory, setSubCategory] = useState(null);
  const [variants, setVariants] = useState<VariantRow[]>([
    {temperature: '', size: '', price: ''},
  ]);

  const loadData = () => {};

  useEffect(() => {
    loadData();
  }, []);

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

  // ── Variant helpers ──────────────────────────────────────────────────────

  const addVariantRow = () => {
    setVariants(prev => [...prev, {temperature: '', size: '', price: ''}]);
  };

  const removeVariantRow = (index: number) => {
    setVariants(prev => prev.filter((_, i) => i !== index));
  };

  const updateVariantRow = (
    index: number,
    field: keyof VariantRow,
    value: string,
  ) => {
    setVariants(prev => {
      const updated = [...prev];
      updated[index] = {...updated[index], [field]: value};
      return updated;
    });
  };

  // ── Submit ───────────────────────────────────────────────────────────────

  const handleSubmit = () => {
    if (!name || !category) return;
    onSubmit({
      name,
      description,
      category_id: category?.id,
      product_category_id: subCategory?.id,
      items: variants,
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setCategory(null);
    setSubCategory(null);
    setVariants([{temperature: '', size: '', price: ''}]);
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
            Add Product
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
                placeholder="Category"
                renderItem={(item: any) => (
                  <View style={styles.dropdownItem}>
                    <Text>{item.name}</Text>
                  </View>
                )}
              />
              <TouchableOpacity
                style={styles.addCategoryBtn}
                onPress={() => {
                  /* open add category modal */
                }}>
                <Text style={styles.addCategoryBtnText}>+</Text>
              </TouchableOpacity>
            </View>

            {/* Sub - Category picker */}
            <View style={styles.categoryRow}>
              <Dropdown
                style={styles.categoryDropdown}
                selectedTextStyle={styles.categoryDropdownText}
                placeholderStyle={styles.categoryDropdownPlaceholder}
                value={subCategory}
                onChange={value => setSubCategory(value)}
                data={productCategories}
                labelField="name"
                valueField="id"
                placeholder="Product Category"
                renderItem={(item: any) => (
                  <View style={styles.dropdownItem}>
                    <Text>{item.name}</Text>
                  </View>
                )}
              />
              <TouchableOpacity
                style={styles.addCategoryBtn}
                onPress={() => {
                  /* open add category modal */
                }}>
                <Text style={styles.addCategoryBtnText}>+</Text>
              </TouchableOpacity>
            </View>

            {/* Name */}
            <TextInput
              placeholder="Name"
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholderTextColor={COLORS.placeholder}
            />

            {/* Description */}
            <TextInput
              placeholder="Description"
              style={styles.input}
              value={description}
              onChangeText={setDescription}
              placeholderTextColor={COLORS.placeholder}
            />

            {/* Variants header */}
            <View style={styles.variantHeader}>
              <Text style={styles.variantHeaderText}>Temp</Text>
              <Text style={styles.variantHeaderText}>Size</Text>
              <Text style={styles.variantHeaderText}>Price (₱)</Text>
              <View style={styles.variantHeaderSpacer} />
            </View>

            {/* Variant rows */}
            {variants.map((v, i) => {
              const colors = TEMP_COLORS[v.temperature] ?? TEMP_COLORS.hot;
              return (
                <View key={i} style={styles.variantRow}>
                  {/* Temperature dropdown */}
                  <View
                    style={[
                      styles.tempDropdownWrapper,
                      {borderColor: colors.border, backgroundColor: colors.bg},
                    ]}>
                    <Dropdown
                      key={`dropdown_temperature_${i}`}
                      style={styles.tempDropdown}
                      value={v.temperature}
                      onChange={value =>
                        updateVariantRow(i, 'temperature', value.value)
                      }
                      data={TEMPERATURES}
                      labelField="label"
                      valueField="value"
                      renderItem={(item: any) => (
                        <View
                          style={[
                            styles.tempDropdownItem,
                            {backgroundColor: TEMP_COLORS[item.value].bg},
                          ]}>
                          <Text style={{color: TEMP_COLORS[item.value].text}}>
                            {item.label}
                          </Text>
                        </View>
                      )}
                    />
                  </View>

                  {/* Size */}
                  <TextInput
                    placeholder="12oz"
                    style={[styles.input, styles.variantInput]}
                    value={v.size}
                    onChangeText={val => updateVariantRow(i, 'size', val)}
                    placeholderTextColor={COLORS.placeholder}
                  />

                  {/* Price */}
                  <TextInput
                    placeholder="0"
                    style={[styles.input, styles.variantInput]}
                    keyboardType="numeric"
                    value={v.price}
                    onChangeText={val => updateVariantRow(i, 'price', val)}
                    placeholderTextColor={COLORS.placeholder}
                  />

                  {/* Remove */}
                  <TouchableOpacity onPress={() => removeVariantRow(i)}>
                    <Text style={styles.removeVariantBtn}>×</Text>
                  </TouchableOpacity>
                </View>
              );
            })}

            {/* Add row */}
            <TouchableOpacity
              onPress={addVariantRow}
              style={styles.addVariantBtn}>
              <Text style={styles.addVariantText}>+ Add variant</Text>
            </TouchableOpacity>
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

export default ProductModal;
