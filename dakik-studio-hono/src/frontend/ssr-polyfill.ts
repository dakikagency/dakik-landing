/**
 * `react-dom/server.edge` constructs a `MessageChannel` at MODULE-INIT time for
 * its flush scheduler. On Cloudflare Workers (workerd) `MessageChannel` is not
 * available during worker STARTUP — only inside a request's I/O context — so the
 * statically-imported SSR bundle crashes at boot with "MessageChannel is not
 * defined". This minimal polyfill defines it before React loads.
 *
 * MUST be the first import in entry-server.tsx. For synchronous `renderToString`
 * the channel is created but never functionally exercised, so a microtask-backed
 * port pair is ample.
 */
type Listener = (ev: { data: unknown }) => void;

class PolyfillMessagePort {
	onmessage: Listener | null = null;
	_other: PolyfillMessagePort | null = null;
	postMessage(data: unknown): void {
		const other = this._other;
		if (other) {
			queueMicrotask(() => other.onmessage?.({ data }));
		}
	}
	addEventListener(): void {}
	removeEventListener(): void {}
	start(): void {}
	close(): void {}
}

class PolyfillMessageChannel {
	port1 = new PolyfillMessagePort();
	port2 = new PolyfillMessagePort();
	constructor() {
		this.port1._other = this.port2;
		this.port2._other = this.port1;
	}
}

const g = globalThis as unknown as { MessageChannel?: unknown };
if (typeof g.MessageChannel === "undefined") {
	g.MessageChannel = PolyfillMessageChannel;
}
