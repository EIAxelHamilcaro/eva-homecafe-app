export interface User {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
  image: string | null;
}

export interface AuthSession {
  user: User;
  token: string;
}
