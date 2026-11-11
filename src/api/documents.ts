import client from './client';

export interface CompanyDocument {
  id: number;
  title: string;
  description?: string | null;
  file_name: string;
  original_name: string;
  file_size?: number | null;
  mime_type?: string | null;
  uploaded_by: number;
  created_at: string;
  updated_at?: string;
  uploaded_by_email?: string;
  first_name?: string;
  last_name?: string;
  assigned_count?: number;
  assigned_at?: string;
}

export interface DocumentAssignment {
  id: number;
  users_id: number;
  assigned_at: string;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  role_name?: string | null;
}

export async function adminGetDocuments(): Promise<CompanyDocument[]> {
  const { data } = await client.get('/admin/documents');
  return data.documents ?? [];
}

export async function adminUploadDocument(formData: FormData) {
  const { data } = await client.post('/admin/documents', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function adminDeleteDocument(docId: number) {
  const { data } = await client.delete(`/admin/documents/${docId}`);
  return data;
}

export async function adminGetDocumentAssignments(docId: number): Promise<DocumentAssignment[]> {
  const { data } = await client.get(`/admin/documents/${docId}/assignments`);
  return data.assignments ?? [];
}

export async function adminAssignDocument(docId: number, userIds: number[]) {
  const { data } = await client.post(`/admin/documents/${docId}/assign`, { user_ids: userIds });
  return data;
}

export async function adminRemoveDocumentAssignment(docId: number, userId: number) {
  const { data } = await client.delete(`/admin/documents/${docId}/assign/${userId}`);
  return data;
}

export async function getMyDocuments(): Promise<CompanyDocument[]> {
  const { data } = await client.get('/my-documents');
  return data.documents ?? [];
}
