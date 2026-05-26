import React, {useState, useEffect} from 'react';
import {
  FlatList,
  View,
  Text,
  // ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import * as services from './services';
import {AppDispatch, RootState} from '../../redux/store';
import styles from './styles';
import ProductItem from './components/productItem';
import ProductModal from './components/productModal';

const ProductScreen = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {loading, products, hasMore, isAddingLoading, isAddingSuccess} =
    useSelector((state: RootState) => state.products);
  const [list, setList] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [addModal, setAddModal] = useState(false);

  // Function to load products
  const loadProducts = () => {
    dispatch(services.getProducts()); // Pass page number for pagination
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
    if (Array.isArray(products)) {
      setList(products);
    }
  }, [products]);

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

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      setPage(prevPage => prevPage + 1);
    }
  };

  const handleAddModal = () => {
    setAddModal(true);
  };

  const handleAddSubmit = (data: any) => {
    console.log(data);
    dispatch(services.addProducts(data));
  };

  return (
    <>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>🧾 Products</Text>
          <TouchableOpacity onPress={handleAddModal}>
            <Text style={styles.addButton}>+ Add</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={list}
          keyExtractor={item => item?.id.toString()}
          renderItem={({item}) => <ProductItem item={item} />}
          numColumns={2}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      </View>
      <ProductModal
        visible={addModal}
        onClose={() => {
          setAddModal(false);
        }}
        onSubmit={handleAddSubmit}
      />
    </>
  );
};

export default ProductScreen;
