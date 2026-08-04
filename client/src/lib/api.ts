import axios from "axios";
import type { Application, CollectionMap, CollectionName, ContactMessage, Sections } from "../types";

export const api = axios.create({ baseURL: "/api" });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("saic_token");
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function login(email: string, password: string) {
  const { data } = await api.post<{ token: string; user: { id: number; email: string } }>(
    "/auth/login",
    { email, password }
  );
  return data;
}

export async function getSections(): Promise<Sections> {
  const { data } = await api.get<Sections>("/sections");
  return data;
}

export async function getSection<K extends keyof Sections>(key: K): Promise<Sections[K]> {
  const { data } = await api.get<Sections[K]>(`/sections/${key}`);
  return data;
}

export async function updateSection<K extends keyof Sections>(
  key: K,
  value: Sections[K]
): Promise<Sections[K]> {
  const { data } = await api.put<Sections[K]>(`/sections/${key}`, value);
  return data;
}

export async function getCollection<N extends CollectionName>(
  name: N
): Promise<CollectionMap[N][]> {
  const { data } = await api.get<CollectionMap[N][]>(`/collections/${name}`);
  return data;
}

export async function createItem<N extends CollectionName>(
  name: N,
  item: Omit<CollectionMap[N], "id">
): Promise<CollectionMap[N]> {
  const { data } = await api.post<CollectionMap[N]>(`/collections/${name}`, item);
  return data;
}

export async function updateItem<N extends CollectionName>(
  name: N,
  id: number,
  item: Omit<CollectionMap[N], "id">
): Promise<CollectionMap[N]> {
  const { data } = await api.put<CollectionMap[N]>(`/collections/${name}/${id}`, item);
  return data;
}

export async function deleteItem(name: CollectionName, id: number): Promise<void> {
  await api.delete(`/collections/${name}/${id}`);
}

export async function getMessages(): Promise<ContactMessage[]> {
  const { data } = await api.get<ContactMessage[]>("/contact");
  return data;
}

export async function markMessageRead(id: number): Promise<void> {
  await api.put(`/contact/${id}/read`);
}

export async function deleteMessage(id: number): Promise<void> {
  await api.delete(`/contact/${id}`);
}

export async function uploadImage(file: File): Promise<string> {
  const form = new FormData();
  form.append("image", file);
  const { data } = await api.post<{ url: string }>("/upload", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.url;
}

export async function uploadResume(file: File): Promise<string> {
  const form = new FormData();
  form.append("resume", file);
  const { data } = await api.post<{ url: string }>("/upload/resume", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.url;
}

export async function submitApplication(payload: {
  jobId: number;
  jobTitle: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  resumeUrl: string;
}): Promise<void> {
  await api.post("/applications", payload);
}

export async function getApplications(jobId?: number): Promise<Application[]> {
  const { data } = await api.get<Application[]>("/applications", { params: jobId ? { jobId } : {} });
  return data;
}

export async function updateApplicationStatus(id: number, status: string): Promise<void> {
  await api.put(`/applications/${id}/status`, { status });
}

export async function deleteApplication(id: number): Promise<void> {
  await api.delete(`/applications/${id}`);
}
