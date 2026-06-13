import React, {useState, useEffect} from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import * as services from '../../services';
import {AppDispatch, RootState} from '../../redux/store';
import styles from './styles';
import {Product, ContainerView} from '../../components/';
import {useNavigation} from '@react-navigation/native';

const ProductScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const {loading, productsGrouped, hasMore, isAddingLoading, isAddingSuccess} =
    useSelector((state: RootState) => state.products);
  const [list, setList] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [addModal, setAddModal] = useState(false);

  // Function to load products
  const loadProducts = () => {
    dispatch(services.getProductsGrouped()); // Pass page number for pagination
    dispatch(services.getCategories());
    dispatch(services.getProductCategories());
  };

  useEffect(() => {
    loadProducts();
    return () => {
      dispatch(services.resetProducts());
    };
  }, []);

  useEffect(() => {
    if (Array.isArray(productsGrouped)) {
      setList(productsGrouped);
    }
  }, [productsGrouped]);

  useEffect(() => {
    if (isAddingLoading == false && isAddingSuccess === true) {
      loadProducts();
      setAddModal(false);
      dispatch(services.resetAddProductState());
    }
  }, [isAddingLoading, isAddingSuccess]);

  const onRefresh = () => {
    setRefreshing(true);
    setPage(1);
    setList([]);
    loadProducts(1);
    setRefreshing(false);
  };

  const handleAddModal = () => {
    navigation.navigate('AddProduct');
  };

  return (
    <ContainerView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🧾 Products</Text>
        <TouchableOpacity onPress={handleAddModal}>
          <Text style={styles.addButton}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <Product
        list={list}
        refreshing={refreshing}
        onRefresh={onRefresh}
        onPress={item => {
          navigation.navigate('EditProduct', {productId: item.id});
        }}
      />
    </ContainerView>
  );
};

export default ProductScreen;
