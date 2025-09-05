import { registerAs } from '@nestjs/config';

export default registerAs('AUTH', () => ({
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
  JWT_SECRET_KEY: process.env.JWT_SECRET_KEY,
}));
