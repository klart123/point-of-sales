import 'react-native-reanimated';
import React, {useEffect, useState} from 'react';
import {View, Text} from 'react-native';
import {Provider} from 'react-redux';
import {store, persistor} from './src/redux/store';
import {PersistGate} from 'redux-persist/integration/react';
import AppNavigator from './src/navigation/AppNavigator';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {initDB} from './src/database/database';

const App = () => {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    initDB()
      .then(() => setReady(true))
      .catch(err => console.error('[DB] Init failed', err));
  }, []);

  if (!ready)
    return (
      <View>
        <Text>Loading...</Text>
      </View>
    );

  return (
    <GestureHandlerRootView>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <AppNavigator />
        </PersistGate>
      </Provider>
    </GestureHandlerRootView>
  );
};

export default App;
