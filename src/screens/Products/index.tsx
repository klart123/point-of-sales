import React, {useState, useEffect} from 'react';
import {
  FlatList,
  View,
  Text,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import * as services from './services'; // Replace with your actual import
import {AppDispatch, RootState} from '../../redux/store'; // Adjust the import according to your setup
import styles from './styles';
import ProductItem from './components/productItem';

const ProductScreen = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {loading, products, hasMore} = useSelector(
    (state: RootState) => state.products,
  );
  const [list, setList] = useState([]);
  const [refreshing, setRefreshing] = useState(false); // State to track refreshing status
  const [page, setPage] = useState(1); // Track current page

  // Function to load products
  const loadProducts = (pageNumber: number) => {
    dispatch(services.getProducts(pageNumber)); // Pass page number for pagination
  };

  useEffect(() => {
    return () => {
      dispatch(services.resetProducts());
    };
  }, []);

  useEffect(() => {
    loadProducts(page);
  }, [page]);

  useEffect(() => {
    if (Array.isArray(products?.data?.data)) {
      setList(prevList =>
        page === 1
          ? products?.data?.data
          : [...prevList, ...products?.data?.data],
      );
    }
  }, [products]);

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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🧾 Products</Text>
      <FlatList
        data={list}
        keyExtractor={item => item.id.toString()}
        renderItem={({item}) => <ProductItem item={item} />}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        ListFooterComponent={
          loading ? <ActivityIndicator size="small" color="#0000ff" /> : null
        }
        numColumns={2}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </View>
  );
};

export default ProductScreen;
