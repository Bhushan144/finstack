import { cleanEnv, str, port } from 'envalid';
import dotenv from 'dotenv';

dotenv.config();

const env = cleanEnv(process.env, {
    // Server
    PORT: port({ default: 5000 }),
    NODE_ENV: str({ choices: ['development', 'production', 'test'], default: 'development' }),
    CORS_ORIGIN: str({ default: 'http://localhost:5173' }),

    // Database
    MONGO_URI: str(),
    DB_NAME: str({ default: 'finstack' }),

    // JWT Auth
    ACCESS_TOKEN_SECRET: str(),
    ACCESS_TOKEN_EXPIRY: str({ default: '15m' }),
    REFRESH_TOKEN_SECRET: str(),
    REFRESH_TOKEN_EXPIRY: str({ default: '7d' }),

    // Cloudinary (Optional - commented out or made optional until needed)
    // CLOUDINARY_CLOUD_NAME: str({ default: '' }),
    // CLOUDINARY_API_KEY: str({ default: '' }),
    // CLOUDINARY_API_SECRET: str({ default: '' }),
});

export default env;