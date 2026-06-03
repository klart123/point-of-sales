import React, {useState, useEffect, useCallback} from 'react';
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
import {useFocusEffect} from '@react-navigation/native';

type Props = {
  selectedCategory: number | null;
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: {category_id: number | number; name: string}) => void;
};

// ─── Component ────────────────────────────────────────────────────────────────

const AddProductCategoryModal: React.FC<Props> = ({
  selectedCategory,
  visible,
  onClose,
  onSubmit,
}) => {
  const {categories, prodCatLoading, prodCatSuccess, prodCatError} =
    useSelector((state: RootState) => state.products);

  const [name, setName] = useState('');
  const [category, setCategory] = useState(0);

  useEffect(() => {
    if (selectedCategory) {
      setCategory(selectedCategory);
    }
  }, [categories]);

  useEffect(() => {
    if (selectedCategory) {
      setCategory(selectedCategory);
    }
  }, [selectedCategory]);

  useEffect(() => {
    if (prodCatLoading === false && prodCatSuccess === true) {
      resetForm();
    }
  }, [prodCatLoading, prodCatSuccess]);

  const handleSubmit = () => {
    if (!name || !category) return;
    onSubmit({
      category_id: category,
      name,
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setName('');
  };

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

          <View style={styles.scrollContent}>
            {/* Category picker */}
            <View style={styles.categoryRow}>
              <Dropdown
                style={styles.categoryDropdown}
                selectedTextStyle={styles.categoryDropdownText}
                placeholderStyle={styles.categoryDropdownPlaceholder}
                value={category}
                onChange={value => {
                  console.log('selected category', value);
                  setCategory(value?.id);
                }}
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
          </View>

          {prodCatError && prodCatError?.error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{prodCatError?.error}</Text>
            </View>
          )}

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
