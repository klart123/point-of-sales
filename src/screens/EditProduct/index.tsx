import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import styles from './styles';
import {useSelector, useDispatch} from 'react-redux';
import {RootState} from '../../redux/store';
import {Dropdown} from 'react-native-element-dropdown';
import {COLORS} from '../../theme/colors';
import AddProductCategoryModal from '../../components/AddProductCategoryModal';
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import {
  addProductCategory,
  getCategories,
  resetError,
  editProducts,
  getProduct,
  resetUpdateProduct,
} from '../../services';
import {ContainerView} from '../../components';

type Temperature = {
  value: 'hot' | 'cold' | 'blended';
  label: string;
};

type VariantRow = {
  id: number | string;
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

const editProductScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const {
    error,
    loading,
    categories,
    isAddingLoading,
    isAddingSuccess,
    prodCatLoading,
    prodCatSuccess,
    isEditLoading,
    isEditSuccess,
    productItem,
  } = useSelector((state: RootState) => state.products);

  /** parameters for edit products */
  const {productId} = route.params;
  console.log('productData', productId);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(null);
  const [subCategory, setSubCategory] = useState(null);
  const [prodCatModal, setProdCatModal] = useState(false);
  const [productCategories, setProductCategories] = useState([]);
  const [variants, setVariants] = useState<VariantRow[]>([
    {id: '', temperature: '', size: '', price: ''},
  ]);

  const loadData = () => {
    dispatch(getCategories());
  };

  useFocusEffect(
    useCallback(() => {
      loadData();

      return () => {
        dispatch(resetError());
      };
    }, []),
  );

  useEffect(() => {
    if (productId) {
      console.log('productId', productId);
      dispatch(getProduct(productId));
    }
  }, [productId]);

  useEffect(() => {
    if (productItem) {
      console.log('productItems', productItem);
      setCategory(productItem.category_id);
      const selectedCat = categories.find(
        (c: any) => c.id === productItem.category_id,
      );
      setProductCategories(selectedCat?.product_categories || []);
      setName(productItem?.name);
      setDescription(productItem?.description);
      setSubCategory(productItem?.product_category_id);

      setVariants(
        productItem?.items?.map(item => ({
          productId: item?.id,
          temperature: item.temperature,
          size: item.size,
          price: String(item.price),
        })) || [],
      );
    }
  }, [productItem]);

  useEffect(() => {
    if (isEditLoading === false && isEditSuccess === true) {
      Alert.alert('Success', 'Product added successfully', [
        {
          text: 'OK',
          onPress: () => {
            dispatch(resetUpdateProduct());
          },
        },
      ]);
    }
  }, [isEditLoading, isEditSuccess]);

  useEffect(() => {
    if (!loading && category) {
      const selectedCat = categories.find((c: any) => c.id === category);
      setProductCategories(selectedCat?.product_categories || []);
    }
  }, [loading, categories]);

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

  const handleSubmit = () => {
    if (!name || !category) return;

    const params = {
      name,
      description,
      category_id: category,
      product_category_id: subCategory,
      items: variants,
    };
    dispatch(editProducts(productItem?.id, params));
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  const handleAddProdCat = (data: {
    category_id: number | number;
    name: string;
  }) => {
    dispatch(addProductCategory(data));

    /** closing of the modal is handled in the useEffect
     * that listens to prodCatLoading and prodCatSuccess states */
  };

  const handleProdCatClose = () => {
    setProdCatModal(false);
    dispatch(resetError());
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setCategory(null);
    setSubCategory(null);
    setVariants([{temperature: '', size: '', price: ''}]);
  };

  return (
    <ContainerView style={styles.container}>
      <Text style={[styles.title, styles.modalTitleSpacing]}>Edit Product</Text>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        <View style={styles.categoryRow}>
          <Dropdown
            style={styles.categoryDropdown}
            selectedTextStyle={styles.categoryDropdownText}
            placeholderStyle={styles.categoryDropdownPlaceholder}
            value={category}
            onChange={value => {
              setCategory(value?.id);
              setProductCategories(value?.product_categories || []);
            }}
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

          {/* <TouchableOpacity style={styles.addCategoryBtn} onPress={() => {}}>
            <Text style={styles.addCategoryBtnText}>+</Text>
          </TouchableOpacity> */}
        </View>
        {/* Sub - Category picker */}

        <View style={styles.categoryRow}>
          <Dropdown
            disable={category ? false : true}
            style={styles.categoryDropdown}
            selectedTextStyle={styles.categoryDropdownText}
            placeholderStyle={styles.categoryDropdownPlaceholder}
            value={subCategory}
            onChange={value => {
              setSubCategory(value?.id);
            }}
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
              setProdCatModal(true);
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
        <TouchableOpacity onPress={addVariantRow} style={styles.addVariantBtn}>
          <Text style={styles.addVariantText}>+ Add variant</Text>
        </TouchableOpacity>

        {error && error?.error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error?.error}</Text>
          </View>
        )}

        <View style={styles.buttons}>
          <TouchableOpacity onPress={handleCancel} style={styles.buttonCancel}>
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSubmit} style={styles.buttonAdd}>
            <Text style={styles.buttonText}>Update</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <AddProductCategoryModal
        selectedCategory={category}
        visible={prodCatModal}
        onClose={handleProdCatClose}
        onSubmit={handleAddProdCat}
      />
    </ContainerView>
  );
};

export default editProductScreen;
