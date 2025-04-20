import React, {useState, useEffect} from 'react';
import {
  FlatList,
  View,
  Text,
  // ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import * as services from './services';
import {AppDispatch, RootState} from '../../redux/store';
import styles from './styles';
import MenuModal from './components/menuModal';

const screenWidth = Dimensions.get('window').width;
const itemWidth = 160;
const spacing = 16;

const numColumns = Math.floor(screenWidth / (itemWidth + spacing));

const MenuScreen = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {loading, menu, hasMore} = useSelector(
    (state: RootState) => state.menu,
  );
  const [list, setList] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const numColumns = Math.floor(screenWidth / (itemWidth + spacing));

  const loadProducts = () => {
    dispatch(services.getMenu());
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
    loadProducts();
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
      <Text style={styles.textCenter}>{item.name}</Text>
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
          // ListFooterComponent={
          //   loading ? <ActivityIndicator size="small" color="#0000ff" /> : null
          // }
          numColumns={numColumns}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={onRefresh} />
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
