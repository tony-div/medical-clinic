import fs from "fs";
import path from "path";
import dotenv from "dotenv";

const infraEnvPath = path.resolve("infra/.env");

if (!fs.existsSync(infraEnvPath)) {
    console.error("infra/.env not found");
    process.exit(1);
}

const envConfig = dotenv.parse(fs.readFileSync(infraEnvPath));

const backendPort = envConfig.PORT;

if (!backendPort) {
    console.error("No PORT found in infra/.env");
    process.exit(1);
}

const clientEnvPath = path.resolve("client/.env.local");
const content = `VITE_API_URL=http://localhost:${backendPort}\n`;

fs.writeFileSync(clientEnvPath, content);

console.log(`Synced backend port → client/.env.local`);
console.log(`VITE_API_URL=http://localhost:${backendPort}`);
