import React, {useState, useEffect} from 'react';
import {
  FlatList,
  View,
  Text,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import * as services from './services'; // Replace with your actual import
import {AppDispatch, RootState} from '../../redux/store'; // Adjust the import according to your setup
import styles from './styles';
import MenuModal from './components/menuModal';

const MenuScreen = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {loading, menu, hasMore} = useSelector(
    (state: RootState) => state.menu,
  );
  const [list, setList] = useState([]);
  const [refreshing, setRefreshing] = useState(false); // State to track refreshing status
  const [page, setPage] = useState(1); // Track current page
  const [viewModal, setViewModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Function to load products
  const loadProducts = () => {
    dispatch(services.getMenu()); // Pass page number for pagination
  };

  useEffect(() => {
    loadProducts();
    return () => {
      dispatch(services.resetMenu());
    };
  }, []);

  useEffect(() => {
    if (Array.isArray(menu?.data)) {
      setList(menu?.data);
    }
  }, [menu]);

  // Handle pull-to-refresh
  const onRefresh = () => {
    setRefreshing(true);
  };

  // Handle when the end of the list is reached
  const handleLoadMore = () => {
    if (hasMore && !loading) {
      // Check if there's more data to load
      setPage(prevPage => prevPage + 1); // Increment the page number to fetch the next set of products
    }
  };

  const handleEditItem = (item: any) => {
    console.log('item', item);
  };

  const handleOpenModal = (item: any) => {
    setSelectedItem(item);
    setViewModal(true);
  };

  const renderItem = ({item}: {item: any}) => (
    <TouchableOpacity style={styles.item} onPress={() => handleOpenModal(item)}>
      <Text>{item.name}</Text>
      <Text>₱{item.price}</Text>
    </TouchableOpacity>
  );

  return (
    <>
      <View style={styles.container}>
        <Text style={styles.title}>🧾 Shop</Text>
        <FlatList
          data={list}
          keyExtractor={item => item.id.toString()}
          renderItem={renderItem}
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
      <MenuModal
        visible={viewModal}
        item={selectedItem}
        onClose={() => setViewModal(false)}
        onSubmit={handleEditItem}
      />
    </>
  );
};

export default MenuScreen;
