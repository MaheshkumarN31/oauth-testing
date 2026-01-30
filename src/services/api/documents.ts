/* eslint-disable no-useless-catch */
import { $fetch } from "./fetch";

interface DocumentsPayload {
  company_id: string;
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

interface Document {
  id: string;
  title: string;
  company_id: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

/**
 * Fetch documents for a workspace with pagination
 */
export const fetchDocumentsAPI = async (
  payload: DocumentsPayload
): Promise<any> => {
  try {
    const response = await $fetch.get(
      "/api/company-document-responses-v2",
      payload
    );
    return response;
  } catch (err) {
    throw err;
  }
};

/**
 * Get document by ID
 */
export const getDocumentByIdAPI = async ({
  documentId,
  queryParams,
}: {
  documentId: string;
  queryParams?: { company_id: string };
}): Promise<any> => {
  try {
    const response = await $fetch.get(
      `/api/company-document-responses-v2/${documentId}`,
      queryParams || {}
    );
    return response;
  } catch (err) {
    throw err;
  }
};

/**
 * Create new document
 */
export const createDocumentAPI = async (payload: {
  title: string;
  company_id: string;
  content?: any;
  [key: string]: any;
}): Promise<any> => {
  try {
    const response = await $fetch.post(
      "/api/company-document-responses-v2",
      payload
    );
    return response;
  } catch (err) {
    throw err;
  }
};

/**
 * Update document
 */
export const updateDocumentAPI = async ({
  documentId,
  payload,
}: {
  documentId: string;
  payload: Partial<Document>;
}): Promise<any> => {
  try {
    const response = await $fetch.put(
      `/api/company-document-responses-v2/${documentId}`,
      payload
    );
    return response;
  } catch (err) {
    throw err;
  }
};

/**
 * Delete document
 */
export const deleteDocumentAPI = async ({
  documentId,
  payload,
}: {
  documentId: string;
  payload?: { company_id: string };
}): Promise<any> => {
  try {
    const response = await $fetch.delete(
      `/api/company-document-responses-v2/${documentId}`,
      payload
    );
    return response;
  } catch (err) {
    throw err;
  }
};

/**
 * Bulk delete documents
 */
export const bulkDeleteDocumentsAPI = async ({
  document_ids,
  company_id,
}: {
  document_ids: Array<string>;
  company_id: string;
}): Promise<any> => {
  try {
    const response = await $fetch.delete(
      "/api/company-document-responses-v2/bulk-delete",
      { document_ids, company_id }
    );
    return response;
  } catch (err) {
    throw err;
  }
};

/**
 * Get documents count
 */
export const getDocumentsCountAPI = async (queryParams: {
  company_id: string;
  status?: string;
}): Promise<any> => {
  try {
    const response = await $fetch.get(
      "/api/company-document-responses-v2/count",
      queryParams
    );
    return response;
  } catch (err) {
    throw err;
  }
};

/**
 * Search documents
 */
export const searchDocumentsAPI = async (payload: {
  company_id: string;
  search: string;
  page?: number;
  limit?: number;
}): Promise<any> => {
  try {
    const response = await $fetch.get(
      "/api/company-document-responses-v2/search",
      payload
    );
    return response;
  } catch (err) {
    throw err;
  }
};

/**
 * Export document
 */
export const exportDocumentAPI = async ({
  documentId,
  format,
  queryParams,
}: {
  documentId: string;
  format: "pdf" | "docx" | "txt";
  queryParams?: { company_id: string };
}): Promise<any> => {
  try {
    const response = await $fetch.get(
      `/api/company-document-responses-v2/${documentId}/export/${format}`,
      queryParams || {}
    );
    return response;
  } catch (err) {
    throw err;
  }
};

/**
 * Duplicate document
 */
export const duplicateDocumentAPI = async ({
  documentId,
  payload,
}: {
  documentId: string;
  payload?: { company_id: string; title?: string };
}): Promise<any> => {
  try {
    const response = await $fetch.post(
      `/api/company-document-responses-v2/${documentId}/duplicate`,
      payload
    );
    return response;
  } catch (err) {
    throw err;
  }
};