import React, {useEffect, useState, useMemo} from 'react';

import {
  Modal,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import styles from './styles';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {Order, OrderItem} from '../../types';

type OnSubmitProps = {
  orderId: number | string;
  isGcash: boolean;
  cashTendered: number | string;
};

type Props = {
  visible: boolean;
  orderItem: Order;
  onClose: () => void;
  onSubmit: (data: OnSubmitProps) => {};
};

const PayModal: React.FC<Props> = ({visible, orderItem, onSubmit, onClose}) => {
  const [isGcash, setIsGcash] = useState(false);
  const [cashTendered, setCashTendered] = useState(0);

  useEffect(() => {}, [visible]);

  const change = useMemo(() => {
    return (parseFloat(cashTendered) || 0) - orderItem?.total_price;
  }, [cashTendered]);

  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableOpacity style={styles.overlay} onPress={onClose}>
        <TouchableOpacity
          style={styles.modal}
          activeOpacity={1}
          onPress={e => e.stopPropagation()}>
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <Text style={[styles.title, styles.modalTitleSpacing]}>
              Pay Order
            </Text>
            <Text style={[styles.title, styles.modalTitleSpacing]}>
              {` Total ${orderItem?.total_price || 0}`}
            </Text>
          </View>
          {/* <View> */}
          <KeyboardAwareScrollView
            style={styles.expandedScroll}
            contentContainerStyle={{
              flexGrow: 1,
              // paddingBottom: 40
            }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            enableOnAndroid={true}
            // extraScrollHeight={20}
            enableAutomaticScroll={true}>
            <View style={{flex: 1}}>
              <Text style={styles.fieldLabel}>Cash</Text>
              <View style={styles.cashRow}>
                <TextInput
                  style={[styles.input, {flex: 1}]}
                  placeholder="0.00"
                  placeholderTextColor="#aaa"
                  keyboardType="decimal-pad"
                  value={cashTendered}
                  onChangeText={setCashTendered}
                />
                <TouchableOpacity
                  style={styles.exactBtn}
                  onPress={() =>
                    setCashTendered(orderItem?.total_price?.toFixed(2))
                  }>
                  <Text style={styles.exactBtnText}>Exact</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.changeRow}>
                <Text
                  style={[styles.changeText, change < 0 && {color: '#E24B4A'}]}>
                  Change: ₱{change?.toFixed(2)}
                </Text>
                <TouchableOpacity
                  onPress={value => {
                    setIsGcash(p => !p);
                    setCashTendered(
                      isGcash ? 0 : orderItem?.total_price?.toFixed(2),
                    );
                  }}
                  style={[styles.gcashButton, isGcash && styles.gcashActive]}>
                  <Text
                    style={[
                      styles.gcashText,
                      isGcash && styles.gcashActiveText,
                    ]}>
                    {isGcash ? '✓ ' : ''}Paid with GCash
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={styles.actions}>
                <TouchableOpacity
                  style={[
                    styles.submitBtn,
                    cashTendered === 0 && styles.btnDisabled,
                  ]}
                  disabled={cashTendered === 0}
                  onPress={() => {
                    console.log('orderItem', orderItem);
                    console.log('orderId', orderItem);
                    onSubmit({
                      orderId: orderItem?.id,
                      cash_tendered: cashTendered,
                      isGcash: isGcash,
                      status: orderItem?.status,
                    });
                  }}>
                  <Text style={styles.submitBtnText}>Submit Payment</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAwareScrollView>
          {/* </View> */}
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

export default PayModal;
