/**
 * Mock utilities barrel export.
 *
 * Re-exports all typed mocks for Chrome extension APIs and WebSocket.
 * Import from here for convenience:
 *
 * ```ts
 * import { createMockWebSocket, chromeTabsMock, chromeStorageMock, chromeRuntimeMock } from "./mocks/index.js";
 * ```
 *
 * @module mocks
 */

import { chromeRuntimeMock } from "./chrome-runtime.js";
import { chromeStorageMock } from "./chrome-storage.js";
import { chromeTabsMock } from "./chrome-tabs.js";

export {
	chromeRuntimeMock,
	installChromeRuntimeMock,
} from "./chrome-runtime.js";
export {
	chromeStorageMock,
	installChromeStorageMock,
} from "./chrome-storage.js";
export {
	chromeTabsMock,
	installChromeTabsMock,
	type MockTab,
} from "./chrome-tabs.js";
export {
	createMockWebSocket,
	type MockWebSocketOptions,
	mockWebSocketConstructor,
	type SentMessage,
} from "./websocket.js";

/**
 * Install all Chrome API mocks on the global `chrome` object.
 *
 * Call in a Vitest `beforeAll` hook to make chrome.* APIs available
 * to code under test without a real browser extension context.
 *
 * ```ts
 * import { installAllChromeMocks } from "./mocks/index.js";
 *
 * beforeAll(() => {
 *   installAllChromeMocks();
 * });
 * ```
 */
export function installAllChromeMocks(): void {
	// Assign mocks to globalThis.chrome for Node test environments.
	const g = globalThis as Record<string, unknown>;
	g.chrome = g.chrome ?? {};
	(g.chrome as Record<string, unknown>).tabs = chromeTabsMock;
	(g.chrome as Record<string, unknown>).storage = { local: chromeStorageMock };
	(g.chrome as Record<string, unknown>).runtime = {
		onMessage: chromeRuntimeMock,
	};
}
