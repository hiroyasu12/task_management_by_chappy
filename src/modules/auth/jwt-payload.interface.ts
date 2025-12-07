export interface JwtPayload {
  userId: string; // userId
  email: string;
  role: string;
  jti: string; // token ID (uniq)
}
