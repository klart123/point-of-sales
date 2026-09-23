import React from 'react';
import {Text, View, TextInput, TouchableOpacity} from 'react-native';
import styles from '../../styles';
import {VariantRow} from '../../types';
import {COLORS} from '../../../../theme';

type BeverageComponentProps = {
  variants: VariantRow[];
  setVariants: React.Dispatch<React.SetStateAction<VariantRow[]>>;
};

export default function BeverageComponent({
  variants,
  setVariants,
}: BeverageComponentProps) {
  const updateVariantRow = (
    index: number,
    field: keyof VariantRow,
    value: string,
  ) => {
    setVariants(prev => {
      const updated = [...prev];
      updated[index] = {...updated[index], [field]: value};
      return updated;
    });
  };

  const removeVariantRow = (index: number) => {
    setVariants(prev => prev.filter((_, i) => i !== index));
  };

  const addVariantRow = () => {
    setVariants(prev => [...prev, {price: ''}]);
  };

  return (
    <>
      {/* Variant rows */}
      {variants.map((v, i) => {
        return (
          <View key={i} style={styles.variantRow}>
            {/* Temperature dropdown */}

            {/* Price */}
            <TextInput
              placeholder="Price"
              style={[styles.input, styles.variantInput]}
              keyboardType="numeric"
              value={v.price}
              onChangeText={val => updateVariantRow(i, 'price', val)}
              placeholderTextColor={COLORS.placeholder}
            />

            {/* Remove */}
            <TouchableOpacity onPress={() => removeVariantRow(i)}>
              <Text style={styles.removeVariantBtn}>×</Text>
            </TouchableOpacity>
          </View>
        );
      })}
      {/* Add row */}
      {/* <TouchableOpacity onPress={addVariantRow} style={styles.addVariantBtn}>
        <Text style={styles.addVariantText}>+ Add variant</Text>
      </TouchableOpacity> */}
    </>
  );
}
