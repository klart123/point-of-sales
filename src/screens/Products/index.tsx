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
    loadProducts(page); // Fetch products when the component mounts
  }, [page]);

  useEffect(() => {
    console.log('products', products?.data?.data);
    if (Array.isArray(products?.data?.data)) {
      setList(prevList => [...prevList, ...products?.data?.data]);
    }
  }, [products]);

  // Handle pull-to-refresh
  const onRefresh = () => {
    setRefreshing(true); // Set refreshing to true to show the loading indicator
    setPage(1); // Reset to the first page
    setList([]);
    loadProducts(1); // Fetch the first page of products

    setRefreshing(false); // Once the fetch is complete, set refreshing to false
  };

  // Handle when the end of the list is reached
  const handleLoadMore = () => {
    if (hasMore && !loading) {
      // Check if there's more data to load
      setPage(prevPage => prevPage + 1); // Increment the page number to fetch the next set of products
    }
  };

  const renderItem = ({item}: {item: any}) => (
    <View style={styles.item}>
      <Text>{item.name}</Text>
      <Text>₱{item.price}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🧾 Products</Text>
      <FlatList
        data={list}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
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
