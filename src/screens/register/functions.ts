import {Alert} from 'react-native';
import {AppDispatch} from '../../redux/store';
import {registerUser} from '../../services';

type RegisterProps = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

type HandleRegisterProps = RegisterProps & {
  dispatch: AppDispatch;
};

export const handleRegister = ({
  name,
  email,
  password,
  confirmPassword,
  dispatch,
}: HandleRegisterProps) => {
  if (!name || !email || !password) {
    Alert.alert('Error', 'Please fill out all fields');
    return;
  }

  if (password != confirmPassword) {
    Alert.alert('Confirmation Password', 'Password do not match');
    return;
  }

  const payload = {
    name,
    email,
    password,
  };

  dispatch(registerUser(payload));
};
