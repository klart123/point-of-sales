import React, {useState} from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import styles from '../styles';

type Variant = {
  size: string;
  price: string;
};

type VariantMap = {
  hot: Variant[];
  cold: Variant[];
  blended: Variant[];
};

type ProductFormData = {
  name: string;
  description: string;
  category_id: Number;
  variants: VariantMap;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: ProductFormData) => void;
};

const TEMPERATURES = ['hot', 'cold', 'blended'] as const;
type Temperature = (typeof TEMPERATURES)[number];

const ProductModal: React.FC<Props> = ({visible, onClose, onSubmit}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [activeTemp, setActiveTemp] = useState<Temperature>('hot');
  const [variants, setVariants] = useState<VariantMap>({
    hot: [{size: '', price: ''}],
    cold: [],
    blended: [],
  });

  const addVariant = () => {
    setVariants(prev => ({
      ...prev,
      [activeTemp]: [...prev[activeTemp], {size: '', price: ''}],
    }));
  };

  const removeVariant = (index: number) => {
    setVariants(prev => ({
      ...prev,
      [activeTemp]: prev[activeTemp].filter((_, i) => i !== index),
    }));
  };

  const updateVariant = (
    index: number,
    field: keyof Variant,
    value: string,
  ) => {
    setVariants(prev => {
      const updated = [...prev[activeTemp]];
      updated[index] = {...updated[index], [field]: value};
      return {...prev, [activeTemp]: updated};
    });
  };

  const handleSubmit = () => {
    onSubmit({name, description, category, variants});
    // reset
    setName('');
    setDescription('');
    setCategory('');
    setVariants({hot: [{size: '', price: ''}], cold: [], blended: []});
    // onClose(); // temporarily keep open for adding multiple products quickly, can change later if needed
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={[styles.title, {paddingBottom: 16}]}>Add Product</Text>
          <ScrollView showsVerticalScrollIndicator={false}>
            <TextInput
              placeholder="Category"
              style={styles.input}
              value={category}
              onChangeText={setCategory}
            />
            <TextInput
              placeholder="Name"
              style={styles.input}
              value={name}
              onChangeText={setName}
            />
            <TextInput
              placeholder="Description"
              style={styles.input}
              value={description}
              onChangeText={setDescription}
            />

            {/* Temperature tabs */}
            <View style={{flexDirection: 'row', gap: 8, marginBottom: 12}}>
              {TEMPERATURES.map(temp => (
                <TouchableOpacity
                  key={temp}
                  onPress={() => setActiveTemp(temp)}
                  style={[
                    styles.tempTab,
                    activeTemp === temp && styles.tempTabActive,
                  ]}>
                  <Text
                    style={
                      activeTemp === temp
                        ? styles.tempTabTextActive
                        : styles.tempTabText
                    }>
                    {temp.charAt(0).toUpperCase() + temp.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Variant rows */}
            {variants[activeTemp].map((v, i) => (
              <View
                key={i}
                style={{flexDirection: 'row', gap: 8, alignItems: 'center'}}>
                <TextInput
                  placeholder="Size"
                  style={[styles.input, {flex: 1}]}
                  value={v.size}
                  onChangeText={val => updateVariant(i, 'size', val)}
                />
                <TextInput
                  placeholder="Price"
                  style={[styles.input, {flex: 1}]}
                  keyboardType="numeric"
                  value={v.price}
                  onChangeText={val => updateVariant(i, 'price', val)}
                />
                <TouchableOpacity onPress={() => removeVariant(i)}>
                  <Text
                    style={{fontSize: 18, color: '#999', paddingBottom: 10}}>
                    ×
                  </Text>
                </TouchableOpacity>
              </View>
            ))}

            <TouchableOpacity onPress={addVariant} style={styles.addVariantBtn}>
              <Text style={styles.addVariantText}>+ Add size</Text>
            </TouchableOpacity>
          </ScrollView>

          <View style={styles.buttons}>
            <TouchableOpacity onPress={onClose} style={styles.buttonCancel}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSubmit} style={styles.buttonAdd}>
              <Text style={styles.buttonText}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ProductModal;
