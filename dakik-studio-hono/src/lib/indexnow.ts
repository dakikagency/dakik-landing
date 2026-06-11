/**
 * IndexNow — push URL changes to Bing/Yandex/Seznam (and, via Bing's index,
 * ChatGPT search) the moment content publishes instead of waiting for a
 * recrawl. https://www.indexnow.org/documentation
 *
 * The key is deliberately NOT a secret: engines verify ownership by fetching
 * https://<host>/<key>.txt, which routes/seo.ts serves on every host.
 */
export const INDEXNOW_KEY = "7b3193669c0bd7c7ef2a1b4d0f55c2b9";

/** All URLs in one submission must share a host (IndexNow protocol rule). */
export async function submitToIndexNow(urls: string[]): Promise<void> {
	if (urls.length === 0) return;
	const host = new URL(urls[0]).host;
	try {
		const res = await fetch("https://api.indexnow.org/indexnow", {
			method: "POST",
			headers: { "Content-Type": "application/json; charset=utf-8" },
			body: JSON.stringify({
				host,
				key: INDEXNOW_KEY,
				keyLocation: `https://${host}/${INDEXNOW_KEY}.txt`,
				urlList: urls,
			}),
		});
		if (!res.ok) {
			console.error(
				`INDEXNOW_SUBMIT_FAILED status=${res.status} host=${host} urls=${urls.length}`,
			);
		}
	} catch (err) {
		console.error(
			"INDEXNOW_SUBMIT_FAILED",
			err instanceof Error ? err.message : String(err),
		);
	}
}
