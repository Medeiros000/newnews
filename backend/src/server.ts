import { App } from "./app.js";
import { env } from "./config/env.js";

const app = new App();

const server = app.listen(env.PORT, () => {
    console.log(`API server listening on http://localhost:${env.PORT}`);
});

const shutdown = (signal: string) => {
    console.log(`Received ${signal}, shutting down...`);
    server.close(() => {
        console.log("HTTP server closed.");
        process.exit(0);
    });
};

process.once("SIGINT", () => shutdown("SIGINT"));
process.once("SIGTERM", () => shutdown("SIGTERM"));