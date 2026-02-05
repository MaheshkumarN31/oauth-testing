/* eslint-disable no-useless-catch */
import { $fetch } from "./fetch";

// ========================================
// TypeScript Interfaces
// ========================================

export interface ContactType {
    _id: string;
    name: string;
    description?: string;
    type: 'SYSTEM' | 'CUSTOM';
    entity_type: 'INDIVIDUAL' | 'BUSINESS';
    company_id: string;
    created_at: string;
    updated_at: string;
}

export interface CreateContactTypePayload {
    name: string;
    description?: string;
    entity_type: 'INDIVIDUAL' | 'BUSINESS';
    company_id: string;
}

export interface UpdateContactTypePayload {
    name?: string;
    description?: string;
    entity_type?: 'INDIVIDUAL' | 'BUSINESS';
}

export interface GetContactTypesResponse {
    success: boolean;
    data: ContactType[];
}

// ========================================
// API Functions
// ========================================

/**
 * Get all contact types for a company
 * Endpoint: GET /api/contact-types/v2
 */
export const getContactTypesAPI = async (company_id: string): Promise<GetContactTypesResponse> => {
    try {
        const response = await $fetch.get(`/api/contact-types/v2`, { company_id });
        return response;
    } catch (err) {
        throw err;
    }
};

/**
 * Create a new contact type
 * Endpoint: POST /api/contact-types/v2
 */
export const createContactTypeAPI = async (payload: CreateContactTypePayload): Promise<any> => {
    try {
        const response = await $fetch.post("/api/contact-types/v2", payload);
        return response;
    } catch (err) {
        throw err;
    }
};

/**
 * Update a contact type
 * Endpoint: PATCH /api/contact-types/:id/updating_contact
 */
export const updateContactTypeAPI = async ({
    contactTypeId,
    payload,
}: {
    contactTypeId: string;
    payload: UpdateContactTypePayload;
}): Promise<any> => {
    try {
        const response = await $fetch.patch(
            `/api/contact-types/${contactTypeId}/updating_contact`,
            payload
        );
        return response;
    } catch (err) {
        throw err;
    }
};

/**
 * Delete a contact type
 * Endpoint: DELETE /api/contact-types/v2/:id
 */
export const deleteContactTypeAPI = async (id: string): Promise<any> => {
    try {
        const response = await $fetch.delete(`/api/contact-types/${id}`);
        return response;
    } catch (err) {
        throw err;
    }
};
