/**
 * WebSocket server — backward-compatible re-export facade.
 *
 * All implementation has been extracted to
 * `pi-extension/src/infrastructure/`.  This file exists so existing
 * consumers (tools, tests) do not need to change their imports.
 *
 * @module server
 */

export type { ServerHandle } from "./infrastructure/ws-server.js";
export {
	onResponse,
	send,
	start,
	stop,
} from "./infrastructure/ws-server.js";
