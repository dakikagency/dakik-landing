const API_BASE = "/api";

async function fetchApi<T>(
	endpoint: string,
	options?: RequestInit & {
		params?: Record<string, string | number | undefined>;
	}
): Promise<T> {
	const { params, ...fetchOptions } = options || {};

	let url = `${API_BASE}${endpoint}`;
	if (params) {
		const searchParams = new URLSearchParams();
		for (const [key, value] of Object.entries(params)) {
			if (value !== undefined) {
				searchParams.append(key, String(value));
			}
		}
		const query = searchParams.toString();
		if (query) {
			url += `?${query}`;
		}
	}

	const response = await fetch(url, {
		...fetchOptions,
		headers: {
			"Content-Type": "application/json",
			...fetchOptions?.headers,
		},
	});

	if (!response.ok) {
		const error = (await response
			.json()
			.catch(() => ({ error: "Request failed" }))) as { error?: string };
		throw new Error(error.error || `HTTP ${response.status}`);
	}

	return response.json();
}

// API Types
export interface Lead {
	id: string;
	email: string;
	name?: string;
	projectType?: string;
	budget?: string;
	details?: string;
	status: string;
	source?: string;
	currentStep: number;
	createdAt: string;
	updatedAt: string;
}

export interface Customer {
	id: string;
	userId: string;
	leadId?: string;
	companyName?: string;
	phone?: string;
	createdAt: string;
	user?: { id: string; email: string; name?: string };
}

export interface Project {
	id: string;
	customerId: string;
	title: string;
	description?: string;
	status: string;
	progress: number;
	startDate?: string;
	endDate?: string;
	createdAt: string;
	customer?: Customer;
}

export interface Invoice {
	id: string;
	customerId: string;
	projectId?: string;
	invoiceDate: string;
	dueDate?: string;
	amount: number;
	description?: string;
	status: string;
	fileUrl: string;
	paidAt?: string;
}

export interface Meeting {
	id: string;
	leadId?: string;
	customerId?: string;
	eventId: string;
	meetUrl: string;
	title: string;
	description?: string;
	scheduledAt: string;
	duration: number;
	status: string;
}

// API Client
export const api = {
	leads: {
		list: (params?: { search?: string; status?: string; limit?: number }) =>
			fetchApi<{ leads: Lead[] }>("/leads", { params }),
		get: (id: string) => fetchApi<{ lead: Lead }>(`/leads/${id}`),
		create: (data: Partial<Lead>) =>
			fetchApi<{ lead: Lead }>("/leads", {
				method: "POST",
				body: JSON.stringify(data),
			}),
		update: (id: string, data: Partial<Lead>) =>
			fetchApi<{ lead: Lead }>(`/leads/${id}`, {
				method: "PUT",
				body: JSON.stringify(data),
			}),
		delete: (id: string) =>
			fetchApi<{ success: boolean }>(`/leads/${id}`, { method: "DELETE" }),
		convert: (id: string, data: { companyName?: string; phone?: string }) =>
			fetchApi<{ customer: Customer; lead: Lead }>(`/leads/${id}/convert`, {
				method: "POST",
				body: JSON.stringify(data),
			}),
	},

	customers: {
		list: (params?: { search?: string; limit?: number }) =>
			fetchApi<{ customers: Customer[] }>("/customers", { params }),
		get: (id: string) => fetchApi<{ customer: Customer }>(`/customers/${id}`),
		update: (id: string, data: Partial<Customer>) =>
			fetchApi<{ customer: Customer }>(`/customers/${id}`, {
				method: "PUT",
				body: JSON.stringify(data),
			}),
		delete: (id: string) =>
			fetchApi<{ success: boolean }>(`/customers/${id}`, { method: "DELETE" }),
	},

	projects: {
		list: (params?: {
			status?: string;
			customerId?: string;
			search?: string;
			limit?: number;
		}) => fetchApi<{ projects: Project[] }>("/projects", { params }),
		get: (id: string) => fetchApi<{ project: Project }>(`/projects/${id}`),
		create: (data: Partial<Project>) =>
			fetchApi<{ project: Project }>("/projects", {
				method: "POST",
				body: JSON.stringify(data),
			}),
		update: (id: string, data: Partial<Project>) =>
			fetchApi<{ project: Project }>(`/projects/${id}`, {
				method: "PUT",
				body: JSON.stringify(data),
			}),
		updateProgress: (
			id: string,
			progress: number,
			updateTitle?: string,
			updateContent?: string
		) =>
			fetchApi<{ project: Project }>(`/projects/${id}/progress`, {
				method: "POST",
				body: JSON.stringify({ progress, updateTitle, updateContent }),
			}),
		delete: (id: string) =>
			fetchApi<{ success: boolean }>(`/projects/${id}`, { method: "DELETE" }),
	},

	invoices: {
		list: (params?: { status?: string; customerId?: string; limit?: number }) =>
			fetchApi<{ invoices: Invoice[] }>("/invoices", { params }),
		get: (id: string) => fetchApi<{ invoice: Invoice }>(`/invoices/${id}`),
		create: (data: Partial<Invoice>) =>
			fetchApi<{ invoice: Invoice }>("/invoices", {
				method: "POST",
				body: JSON.stringify(data),
			}),
		update: (id: string, data: Partial<Invoice>) =>
			fetchApi<{ invoice: Invoice }>(`/invoices/${id}`, {
				method: "PUT",
				body: JSON.stringify(data),
			}),
		delete: (id: string) =>
			fetchApi<{ success: boolean }>(`/invoices/${id}`, { method: "DELETE" }),
	},

	meetings: {
		list: (params?: {
			status?: string;
			startDate?: string;
			endDate?: string;
			limit?: number;
		}) => fetchApi<{ meetings: Meeting[] }>("/meetings", { params }),
		get: (id: string) => fetchApi<{ meeting: Meeting }>(`/meetings/${id}`),
		create: (data: Partial<Meeting> & { date: string; startTime: string }) =>
			fetchApi<{ meeting: Meeting }>("/meetings", {
				method: "POST",
				body: JSON.stringify(data),
			}),
		update: (id: string, data: { status: string }) =>
			fetchApi<{ meeting: Meeting }>(`/meetings/${id}`, {
				method: "PUT",
				body: JSON.stringify(data),
			}),
		delete: (id: string) =>
			fetchApi<{ success: boolean }>(`/meetings/${id}`, { method: "DELETE" }),
	},

	availability: {
		getSlots: (params: {
			startDate: string;
			endDate: string;
			duration?: number;
		}) =>
			fetchApi<{
				slots: Array<{
					date: string;
					times: Array<{ start: string; end: string; available: boolean }>;
				}>;
			}>("/availability/slots", { params }),
	},
};
