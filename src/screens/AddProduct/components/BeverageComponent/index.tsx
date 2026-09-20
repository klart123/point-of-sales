import React from 'react';
import {Text, View, TextInput, TouchableOpacity} from 'react-native';

import {Dropdown} from 'react-native-element-dropdown';
import styles from '../../styles';

import {Temperature, VariantRow} from '../../types';

import {COLORS} from '../../../../theme';

const TEMP_COLORS: Record<string, {bg: string; text: string; border: string}> =
  {
    hot: {bg: '#FFF3E0', text: '#E65100', border: '#FFCC80'},
    cold: {bg: '#E3F2FD', text: '#1565C0', border: '#90CAF9'},
    blended: {bg: '#F3E5F5', text: '#6A1B9A', border: '#CE93D8'},
  };

const TEMPERATURES: Temperature[] = [
  {value: 'hot', label: 'Hot'},
  {value: 'cold', label: 'Cold'},
  {value: 'blended', label: 'Blended'},
];

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
    setVariants(prev => [...prev, {temperature: '', size: '', price: ''}]);
  };

  return (
    <>
      {/* Variants header */}
      <View style={styles.variantHeader}>
        <Text style={styles.variantHeaderText}>Temp</Text>
        <Text style={styles.variantHeaderText}>Size</Text>
        <Text style={styles.variantHeaderText}>Price (₱)</Text>
        <View style={styles.variantHeaderSpacer} />
      </View>

      {/* Variant rows */}
      {variants.map((v, i) => {
        const colors = TEMP_COLORS[v.temperature] ?? TEMP_COLORS.hot;
        return (
          <View key={i} style={styles.variantRow}>
            {/* Temperature dropdown */}
            <View
              style={[
                styles.tempDropdownWrapper,
                {borderColor: colors.border, backgroundColor: colors.bg},
              ]}>
              <Dropdown
                key={`dropdown_temperature_${i}`}
                style={styles.tempDropdown}
                value={v.temperature}
                onChange={value =>
                  updateVariantRow(i, 'temperature', value.value)
                }
                data={TEMPERATURES}
                labelField="label"
                valueField="value"
                renderItem={(item: any) => (
                  <View
                    style={[
                      styles.tempDropdownItem,
                      {backgroundColor: TEMP_COLORS[item.value].bg},
                    ]}>
                    <Text style={{color: TEMP_COLORS[item.value].text}}>
                      {item.label}
                    </Text>
                  </View>
                )}
              />
            </View>

            {/* Size */}
            <TextInput
              placeholder="12oz"
              style={[styles.input, styles.variantInput]}
              value={v.size}
              onChangeText={val => updateVariantRow(i, 'size', val)}
              placeholderTextColor={COLORS.placeholder}
            />

            {/* Price */}
            <TextInput
              placeholder="0"
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
      <TouchableOpacity onPress={addVariantRow} style={styles.addVariantBtn}>
        <Text style={styles.addVariantText}>+ Add variant</Text>
      </TouchableOpacity>
    </>
  );
}
