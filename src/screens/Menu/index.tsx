import React, {useState, useEffect} from 'react';
import {View, Alert, ActivityIndicator} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import * as services from '../../services';
import {AppDispatch, RootState} from '../../redux/store';
import styles from './styles';
import MenuModal from './components/menuModal';
import OrderDrawer from './components/orderDrawer';
import {orderActions} from '../../redux/slices/orderSlice';
import OrderListModal from './components/ordersListModal';
import {useNavigation, useRoute} from '@react-navigation/native';
import Product from '../../components/Product';
import {HeaderComponent, ContainerView} from '../../components';
import axiosInstance from '../../Api/axiosInstance';
import {printOrderLabel} from '../../printer/PrintService';

const MenuScreen = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation();
  const route = useRoute();

  const {loading, menu} = useSelector((state: RootState) => state.menu);
  const {
    orders,
    isEdit,
    orderId,
    isEditUpdated,
    isSubmitted,
    message,
    orderItem,
    loading: loadingOrder,
  } = useSelector((state: RootState) => state.orders);
  const [list, setList] = useState([]);
  const [viewModal, setViewModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [orderModal, setOrderModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

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
    if (item?.isUpdate) {
      dispatch(
        orderActions.updateOrder({
          ...item,
          isUpdate: false,
        }),
      );

      if (isEditing) {
        setViewModal(false);
        setIsEditing(false);
        setOrderModal(true);
      }
    } else {
      dispatch(orderActions.addOrder(item));
    }
  };

  const handleSubmitOrder = async data => {
    try {
      // 1. Submit the order as normal (unchanged)
      if (isEdit) {
        await dispatch(services.updateOrder(orderId, data));
      } else {
        await dispatch(services.submitOrder(data));
      }
      console.log('data', data);
      // 2. Print a label for each item in the order.
      // NOTE: adjust `data.items`, `item.name`, `item.size`, and
      // `data.customerName` below to match your actual order shape —
      // this is just the integration point, not the exact field names.
      // for (const item of data.items ?? []) {
      //   try {
      //     await printOrderLabel({
      //       itemName: item.name,
      //       customerName: data.customerName ?? 'Guest',
      //       cupSize: item.size ?? '12oz',
      //     });
      //   } catch (printError) {
      //     // Don't let a print failure undo the order — just warn.
      //     console.warn(
      //       '[MenuScreen] Failed to print label for item:',
      //       item,
      //       printError,
      //     );
      //   }
      // }
    } catch (error) {
      console.error('[MenuScreen] Order submission failed:', error);
    }
  };

  const handleOpenModal = (item: any) => {
    setSelectedItem(item);
    setViewModal(true);
  };

  const handleCloseMenuModal = () => {
    setViewModal(false);
    if (isEditing) {
      setIsEditing(false);
      setOrderModal(true);
    }
  };

  const handleHeaderPress = () => {
    Alert.alert('Cancel Order', 'Are you sure you want to CANCEL this order?', [
      {text: 'Close', style: 'default'},
      {
        text: 'Yes',
        onPress: () => {
          axiosInstance
            .patch(`/orders/${orderId}/status`, {
              status: 'cancelled',
            })
            .then(response => {
              if (response.status === 200 || response.status === 201) {
                if (navigation.canGoBack()) {
                  navigation.goBack();
                }
              }
            });
        },
      },
    ]);
  };

  const handleEditOrderItem = item => {
    const productData = list
      .flatMap(group => group.product_categories || [])
      .flatMap(cat => cat.products || [])
      .find(product => product.sku === item?.sku);

    setOrderModal(false);
    handleOpenModal(productData);
    setIsEditing(true);
  };

  return (
    <ContainerView style={styles.container}>
      {isEdit && <HeaderComponent label="Cancel" onPress={handleHeaderPress} />}

      <Product
        list={list}
        refreshing={loading}
        onRefresh={onRefresh}
        onPress={handleOpenModal}
      />

      <MenuModal
        visible={viewModal}
        item={selectedItem}
        onClose={handleCloseMenuModal}
        onSubmit={handleEditItem}
      />
      {/* <OrderListModal
        visible={orderModal}
        onClose={() => setOrderModal(false)}
        onSubmit={handleSubmitOrder}
        onEdit={handleEditOrderItem}
      /> */}

      <OrderDrawer
        visible={true}
        onClose={() => {}}
        isEdit={isEdit}
        onSubmit={handleSubmitOrder}
        onEdit={handleEditOrderItem}
        orderItem={orderItem}
      />
      {loadingOrder && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#1aF" />
        </View>
      )}
    </ContainerView>
  );
};

export default MenuScreen;
