import React, {useState, useEffect} from 'react';
import {
  FlatList,
  View,
  Text,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import * as services from './services';
import {AppDispatch, RootState} from '../../redux/store';
import styles from './styles';
import MenuModal from './components/menuModal';
import {orderActions} from '../../redux/slices/orderSlice';
import OrderListModal from './components/ordersListModal';

const screenWidth = Dimensions.get('window').width;
const itemWidth = 160;
const spacing = 16;

const numColumns = Math.floor(screenWidth / (itemWidth + spacing));

const MenuScreen = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {loading, menu, hasMore} = useSelector(
    (state: RootState) => state.menu,
  );
  const {orders} = useSelector((state: RootState) => state.orders);
  const [list, setList] = useState([]);
  const [viewModal, setViewModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [orderModal, setOrderModal] = useState(false);

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
    dispatch(orderActions.addOrder(item));
  };

  const handleSubmitOrder = data => {
    dispatch(
      services.submitOrders({
        customer_name: data,
        items: orders,
        notes: '',
        is_paid: true,
      }),
    );
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
        <View style={styles.header}>
          <Text style={styles.title}>🧾 Shop</Text>
          <TouchableOpacity onPress={() => setOrderModal(true)}>
            <Text style={styles.addButton}>Orders</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={list}
          keyExtractor={item => item.id.toString()}
          renderItem={renderItem}
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
      <OrderListModal
        visible={orderModal}
        onClose={() => setOrderModal(false)}
        onSubmit={handleSubmitOrder}
      />
    </>
  );
};

export default MenuScreen;
