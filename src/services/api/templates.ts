/* eslint-disable no-useless-catch */
import { $fetch } from "./fetch";

interface TemplatesPayload {
  company_id: string;
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

interface Template {
  id: string;
  name: string;
  company_id: string;
  category?: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

interface PresignedUrlResponse {
  presigned_urls: Array<{
    filename: string;
    url: string;
    file_key: string;
  }>;
}

interface UploadProgress {
  index: number;
  status: "uploading" | "success" | "error";
}

/**
 * Fetch templates for a workspace with pagination
 */
export const fetchTemplatesAPI = async (
  payload: TemplatesPayload
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
 * Get template by ID
 */
export const getTemplateByIdAPI = async ({
  templateId,
  queryParams,
}: {
  templateId: string;
  queryParams?: { company_id: string };
}): Promise<any> => {
  try {
    const response = await $fetch.get(
      `/api/documents-templates/${templateId}`,
      queryParams || {}
    );
    return response;
  } catch (err) {
    throw err;
  }
};

export const deleteTemplateAPI = async ({
  templateId,
  payload,
}: {
  templateId: string;
  payload?: { company_id: string };
}): Promise<any> => {
  try {
    const response = await $fetch.delete(
      `/api/documents-templates/${templateId}`,
      payload
    );
    return response;
  } catch (err) {
    throw err;
  }
};

/**
 * Get presigned URLs for file uploads
 */
export const getPresignedUrlsAPI = async (payload: {
    filenames: Array<string>;
    company_id: string;
}): Promise<any> => {
  try {
    const response = await $fetch.post(
      "/api/documents-templates/processed-files",
      payload
    );
    return response;
  } catch (err) {
    throw err;
  }
};

/**
 * Upload a file to S3 using presigned URL
 */
export const uploadFileToS3API = async (
  file: File,
  presignedUrl: string
): Promise<boolean> => {
  try {
    return await $fetch.uploadToPresignedUrl(presignedUrl, file);
  } catch (err) {
    throw err;
  }
};

/**
 * Upload multiple files and return results
 */
export const uploadMultipleFilesAPI = async ({
    files,
    uploadUrls,
    onProgress,
}: {
    files: Array<File>;
    uploadUrls: Array<string>;
    onProgress?: (progress: UploadProgress) => void;
}): Promise<Array<{ success: boolean; error?: string }>> => {
  try {
    const results = await Promise.all(
      files.map(async (file, index) => {
        onProgress?.({ index, status: "uploading" });
        try {
          await uploadFileToS3API(file, uploadUrls[index]);
          onProgress?.({ index, status: "success" });
          return { success: true };
        } catch (error) {
          onProgress?.({ index, status: "error" });
          return { success: false, error: (error as Error).message };
        }
      })
    );
    return results;
  } catch (err) {
    throw err;
  }
};

/**
 * Get template categories
 */
export const getTemplateCategoriesAPI = async (queryParams?: {
  company_id?: string;
}): Promise<any> => {
  try {
    const response = await $fetch.get(
      "/api/documents-templates/categories",
      queryParams || {}
    );
    return response;
  } catch (err) {
    throw err;
  }
};

/**
 * Bulk delete templates
 */
export const bulkDeleteTemplatesAPI = async ({
  template_ids,
  company_id,
}: {
  template_ids: Array<string>;
  company_id: string;
}): Promise<any> => {
  try {
    const response = await $fetch.delete(
      "/api/documents-templates/bulk-delete",
      { template_ids, company_id }
    );
    return response;
  } catch (err) {
    throw err;
  }
};

/**
 * Duplicate template
 */
export const duplicateTemplateAPI = async ({
  templateId,
  payload,
}: {
  templateId: string;
  payload?: { company_id: string; name?: string };
}): Promise<any> => {
  try {
    const response = await $fetch.post(
      `/api/documents-templates/${templateId}/duplicate`,
      payload
    );
    return response;
  } catch (err) {
    throw err;
  }
};

/**
 * Get contact types
 */
export const getContactTypesAPI = async (queryParams: {
  company_id: string;
}): Promise<any> => {
  try {
    const response = await $fetch.get("/api/contact-types/v2", queryParams);
    return response;
  } catch (err) {
    throw err;
  }
};

/**
 * Create contact type
 */
export const createContactTypeAPI = async (payload: {
  name: string;
  company_id: string;
  [key: string]: any;
}): Promise<any> => {
  try {
    const response = await $fetch.post("/api/contact-types/v2", payload);
    return response;
  } catch (err) {
    throw err;
  }
};

/**
 * Update contact type
 */
export const updateContactTypeAPI = async ({
  contactTypeId,
  payload,
}: {
  contactTypeId: string;
  payload: { name?: string; company_id: string; [key: string]: any };
}): Promise<any> => {
  try {
    const response = await $fetch.put(
      `/api/contact-types/v2/${contactTypeId}`,
      payload
    );
    return response;
  } catch (err) {
    throw err;
  }
};

/**
 * Delete contact type
 */
export const deleteContactTypeAPI = async ({
  contactTypeId,
  payload,
}: {
  contactTypeId: string;
  payload?: { company_id: string };
}): Promise<any> => {
  try {
    const response = await $fetch.delete(
      `/api/contact-types/v2/${contactTypeId}`,
      payload
    );
    return response;
  } catch (err) {
    throw err;
  }
};
export const updateTemplateAPI = async ({
  templateId,
  payload,
}: {
  templateId: string;
  payload: {
    title?: string;
    document_users?: Array<any>;
    [key: string]: any;
  };
}): Promise<any> => {
  try {
    const response = await $fetch.put(
      `/api/templates-v2/${templateId}/document-users`,
      payload
    );
    return response;
  } catch (err) {
    throw err;
  }
};

// ALSO UPDATE createTemplateAPI TO USE THE CORRECT ENDPOINT
/**
 * Create new template (UPDATED)
 */
export const createTemplateAPI = async (payload: {
  title: string;
  company_id: string;
  user_id: string;
  paths: Array<string>;
  files_state: string;
  document_names: Array<string>;
  is_template: boolean;
  [key: string]: any;
}): Promise<any> => {
  try {
    const response = await $fetch.post("/api/company-documents-v2", payload);
    return response;
  } catch (err) {
    throw err;
  }
};