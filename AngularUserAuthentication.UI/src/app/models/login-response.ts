export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt?: string;
  userId?: number;
  username?: string;
}
