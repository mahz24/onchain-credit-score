import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const source = path.join(__dirname, "../contracts/out/CreditScore.sol/CreditScore.json");
const dest = path.join(__dirname, "lib/contracts/creditScoreAbi.json");

const artifact = JSON.parse(fs.readFileSync(source, "utf-8"));
fs.writeFileSync(dest, JSON.stringify(artifact.abi, null, 2));

console.log("ABI extracted to", dest);
