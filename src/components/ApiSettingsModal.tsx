// src/components/ApiSettingsModal.tsx
import React, {useState, useEffect} from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import {
  getApiBaseURL,
  saveApiBaseUrl,
  removeApiBaseUrl,
  saveSocketUrl,
  removeSocketeUrl,
} from '../../env';
import {useDispatch} from 'react-redux';
import {apiActions} from '../redux/slices/apiSlice';

const ApiSettingsModal = ({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) => {
  const dispatch = useDispatch();
  const [url, setUrl] = useState('');
  const [savedUrl, setSavedUrl] = useState('');

  useEffect(() => {
    const loadUrl = async () => {
      const stored = await getApiBaseUrl();
      if (stored) {
        setUrl(stored);
        setSavedUrl(stored);
      }
    };
    if (visible) {
      loadUrl();
    }
  }, [visible]);

  const handleSave = async () => {
    if (!url.startsWith('http')) {
      Alert.alert('Invalid URL', 'Please enter a valid API URL');
      return;
    }
    dispatch(apiActions.setSocketURL(url));

    await removeSocketeUrl();
    await saveSocketUrl(url);

    dispatch(apiActions.setBaseURL(`${url}/api`));
    await removeApiBaseUrl();
    await saveApiBaseUrl(url);
    setSavedUrl(url);
    Alert.alert('Success', 'API Base URL updated!');
    onClose();
  };

  return (
    <Modal transparent animationType="slide" visible={visible}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>🔧 API Settings</Text>
          <TextInput
            style={styles.input}
            placeholder="https://api.example.com"
            value={url}
            onChangeText={setUrl}
          />
          <Text style={styles.current}>Current: {savedUrl || 'Not set'}</Text>
          <View style={styles.actions}>
            <TouchableOpacity style={styles.button} onPress={onClose}>
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={handleSave}>
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ApiSettingsModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 16,
  },
  modal: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    elevation: 5,
  },
  title: {
    fontSize: 18,
    marginBottom: 12,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 6,
    marginBottom: 10,
  },
  current: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#007AFF',
    borderRadius: 6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
