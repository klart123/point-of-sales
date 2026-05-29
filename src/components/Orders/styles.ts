import React from "react";
import { View, FlatList } from "react-native";
import { Order } from "../../types";

type OrdersProps = {
    orders: Order[];
};

const Orders: React.FC<OrdersProps> = ({ orders }) => {
    return (
        <FlatList
            data={orders}
            keyExtractor={item => item.id.toString()}
            renderItem={({ item }) => <View />}
        />
    );
};

export default Orders;