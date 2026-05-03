/**
 * pi-browser-bridge — Demo entry point.
 *
 * This file starts the WebSocket server and logs connection info.
 * For production use, register the pi extension via:
 *
 *   import piExtension from "@pi-browser-bridge/pi-extension";
 *   pi.register(piExtension);
 */

import { logger } from "@pi-browser-bridge/logger";
import { start } from "./pi-extension/src/server.js";

const port = Number(process.env.PI_BROWSER_PORT) || 9242;

logger.info(`Starting WebSocket server on ws://localhost:${port}`);
const handle = await start(port);

logger.info(
	`Ready on port ${handle.port}. Waiting for Chrome extension connection...`,
);
