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
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {
  addProductCategory,
  getCategories,
  resetError,
  resetProductCategories,
  addProducts,
  resetAddProductState,
} from '../../services';
import {ContainerView} from '../../components';
import BeverageComponent from './components/BeverageComponent';
import {
  VariantRow,
  // ProductFormData
} from './types';
import {AppDispatch} from '../../redux/store';

const AddProductScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const {
    error,
    loading,
    categories,
    isAddingLoading,
    isAddingSuccess,
    prodCatLoading,
    prodCatSuccess,
  } = useSelector((state: RootState) => state.products);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(null);
  const [subCategory, setSubCategory] = useState(null);
  const [prodCatModal, setProdCatModal] = useState(false);
  const [productCategories, setProductCategories] = useState([]);
  const [variants, setVariants] = useState<VariantRow[]>([
    {temperature: '', size: '', price: ''},
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
    if (prodCatLoading === false && prodCatSuccess === true) {
      dispatch(resetProductCategories());

      loadData();

      setProdCatModal(false);
    }
  }, [prodCatLoading, prodCatSuccess]);

  useEffect(() => {
    if (!loading && category) {
      const selectedCat = categories.find((c: any) => c.id === category);
      setProductCategories(selectedCat?.product_categories || []);
    }
  }, [loading, categories]);

  useEffect(() => {
    if (isAddingLoading === false && isAddingSuccess === true) {
      resetForm();
      dispatch(resetAddProductState());
      Alert.alert('Success', 'Product added successfully', [
        {
          text: 'OK',
          onPress: () => {
            navigation.goBack();
          },
        },
      ]);
    }
  }, [isAddingLoading, isAddingSuccess]);

  // ── Variant helpers ──────────────────────────────────────────────────────

  // const addVariantRow = () => {
  //   setVariants(prev => [...prev, {temperature: '', size: '', price: ''}]);
  // };

  const handleSubmit = () => {
    if (!name || !category) return;

    const params = {
      name,
      description,
      category_id: category,
      product_category_id: subCategory,
      items: variants,
    };
    dispatch(addProducts(params));
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
      <Text style={[styles.title, styles.modalTitleSpacing]}>Add Product</Text>

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
            onChange={value => {
              console.log('value', value);
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

        {category && categories[category - 1]?.name === 'Beverage' && (
          <BeverageComponent variants={variants} setVariants={setVariants} />
        )}

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
            <Text style={styles.buttonText}>Add</Text>
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

export default AddProductScreen;
