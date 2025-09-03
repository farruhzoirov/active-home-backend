import { registerAs } from '@nestjs/config';

export default registerAs('AUTH', () => ({
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  JWT_SECRET_KEY: process.env.JWT_SECRET_KEY,
}));
