import "dotenv/config";

export const appConfig = {
  corsConfig: {
    origin: ["*"], // Allow all origins during development
    methods: ["GET", "POST", "PUT", "DELETE"], // Allow all methods
    allowedHeaders: ["Content-Type", "Authorization"], // Include other headers as needed
  },
};