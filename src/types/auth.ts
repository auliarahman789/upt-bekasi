export interface User {
  id?: string;
  nama: string;
  email: string;
  role: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  nama: string;
  email: string;
  password: string;
  confPassword: string;
  role: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}
