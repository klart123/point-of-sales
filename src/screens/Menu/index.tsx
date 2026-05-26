import React, {useState, useEffect, useCallback} from 'react';
import {
  FlatList,
  View,
  Text,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import * as services from './services';
import {AppDispatch, RootState} from '../../redux/store';
import styles from './styles';
import MenuModal from './components/menuModal';
import {orderActions} from '../../redux/slices/orderSlice';
import OrderListModal from './components/ordersListModal';
import {useNavigation} from '@react-navigation/native';
import {CommonActions} from '@react-navigation/native';

const screenWidth = Dimensions.get('window').width;
const itemWidth = 120;
const spacing = 16;

const numColumns = Math.floor(screenWidth / (itemWidth + spacing));

const MenuScreen = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation();
  const {loading, menu} = useSelector((state: RootState) => state.menu);
  const {
    orders,
    isEdit,
    orderId,
    isEditUpdated,
    isSubmitted,
    message,
    loading: loadingOrder,
  } = useSelector((state: RootState) => state.orders);
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
      resetMenu();
    };
  }, []);

  useEffect(() => {
    console.log('menu updated:', menu);
    if (Array.isArray(menu)) {
      setList(menu);
    }
  }, [menu]);

  useEffect(() => {
    if (isEdit && isEditUpdated) {
      resetMenu();

      if (navigation.canGoBack()) {
        navigation.goBack();
      }
    }
  }, [isEdit, isEditUpdated]);

  useEffect(() => {
    if (isSubmitted) {
      Alert.alert(message);

      navigation.goBack();

      resetMenu();
    }
  }, [isSubmitted]);

  const resetMenu = () => {
    dispatch(services.resetMenu());
    dispatch(services.resetEditOrder());
  };

  // Handle pull-to-refresh
  const onRefresh = () => {
    loadProducts();
  };

  const handleEditItem = (item: any) => {
    dispatch(orderActions.addOrder(item));
  };

  const handleSubmitOrder = data => {
    if (isEdit) {
      dispatch(
        services.updateOrder({
          id: orderId,
          items: orders,
          customer_name: data,
        }),
      );

      return;
    }

    return dispatch(
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

  const categoryStyles: {[key: string]: any} = {
    Coffee: styles.categoryCoffee,
    Matcha: styles.categoryMatcha,
    Pastry: styles.categoryPastry,
    'Coffee Matcha': styles.categoryCoffeeMatcha,
    Soda: styles.categorySoda,
  };

  const renderItem = ({item}: {item: any}) => {
    const categoryStyle =
      categoryStyles[item?.category] || styles.categoryDefault;

    return (
      <TouchableOpacity
        style={[styles.item, categoryStyle]}
        onPress={() => handleOpenModal(item)}>
        <Text style={[styles.textItems, styles.textCenter]}>{item.name}</Text>
      </TouchableOpacity>
    );
  };

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
          key={JSON.stringify(menu)}
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
      {loadingOrder && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#1aF" />
        </View>
      )}
    </>
  );
};

export default MenuScreen;
