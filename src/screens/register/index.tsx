import React, {Component} from 'react';
import {View, Text, TextInput, Button, Alert} from 'react-native';
import styles from './styles';

type State = {
  name: string;
  email: string;
  password: string;
};

class RegisterScreen extends Component<{}, State> {
  constructor(props: {}) {
    super(props);
    this.state = {
      name: '',
      email: '',
      password: '',
    };
  }

  handleRegister = () => {
    const {name, email, password} = this.state;

    if (!name || !email || !password) {
      Alert.alert('Error', 'Please fill out all fields');
      return;
    }

    // You can integrate API calls here
    console.log('Registering:', {name, email, password});
    Alert.alert('Success', 'Account created successfully!');
  };

  render() {
    const {name, email, password} = this.state;

    return (
      <View style={styles.container}>
        <Text style={styles.title}>Register</Text>

        <TextInput
          placeholder="Full Name"
          style={styles.input}
          value={name}
          onChangeText={text => this.setState({name: text})}
        />

        <TextInput
          placeholder="Email"
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={text => this.setState({email: text})}
        />

        <TextInput
          placeholder="Password"
          style={styles.input}
          secureTextEntry
          value={password}
          onChangeText={text => this.setState({password: text})}
        />

        <Button title="Register" onPress={this.handleRegister} />
      </View>
    );
  }
}

export default RegisterScreen;
