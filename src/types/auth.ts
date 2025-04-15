export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type ErrorPayload = string | Record<string, any>;

export type AuthState = {
  isAuthenticated: boolean;
  token: string | null;
  user: {name: string; email: string} | null;
  loading: boolean;
  error: string | null | Record<string, any>;
};
