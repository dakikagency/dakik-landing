/**
 * Frontend helper to upload a single file to the admin upload endpoint.
 *
 * On success returns the worker-served URL (e.g. /media/uploads/123-abc.png)
 * which can be saved as coverImage / fileUrl / svgContent source.
 *
 * Callers must already be signed in as an admin — the endpoint returns
 * 401/403 otherwise.
 */
export interface UploadResult {
	url: string;
	key: string;
	asset: {
		id: string;
		url: string;
		secureUrl: string;
		bytes: number;
		format: string;
	};
}

export async function uploadAdminFile(
	file: File,
	folder = "uploads",
): Promise<UploadResult> {
	const form = new FormData();
	form.append("file", file);
	form.append("folder", folder);

	const res = await fetch("/api/admin/upload", {
		method: "POST",
		body: form,
		credentials: "include",
	});

	if (!res.ok) {
		const error = await res
			.json()
			.then((j) => (j as { error?: string }).error)
			.catch(() => null);
		throw new Error(error ?? `Upload failed (${res.status})`);
	}

	return res.json();
}
