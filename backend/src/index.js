import 'dotenv/config'; // Loads variables from .env into process.env immediately
import connectDB from './config/db.js';
import { app } from './app.js';
import env from './config/env.js';

connectDB()
    .then(() => {
        // Catch server-level errors (e.g., port already in use)
        app.on("error", (err) => {
            console.error("Server encountered an error: ", err);
            process.exit(1);
        });

        // Start listening to requests
        app.listen(env.PORT, () => {
            console.log(`finStack backend running on port ${env.PORT} in ${env.NODE_ENV} mode`);
            console.log(`Accepting cross-origin requests from: ${env.CORS_ORIGIN}`);
        });
    })
    .catch((err) => {
        console.error("MongoDB connection failed. Server shutting down.", err);
        process.exit(1);
    });