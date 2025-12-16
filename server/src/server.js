import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import { syncDb } from "./models/index.js";
import { ensureAdmin } from "./seed/ensureAdmin.js";

const port = Number(process.env.PORT || 5000);

async function start() {
  await syncDb();
  await ensureAdmin();

  app.listen(port, () => console.log(`✅ Server running on http://localhost:${port}`));
}

start().catch((e) => {
  console.error("Failed to start:", e);
  process.exit(1);
});
