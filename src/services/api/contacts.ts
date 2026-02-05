/* eslint-disable no-useless-catch */
import { $fetch } from "./fetch";

// ========================================
// TypeScript Interfaces
// ========================================

export interface ContactType {
    _id: string;
    type: string;
    entity_type: string;
    name: string;
}

export interface ContactTypeAssignment {
    contact_type?: ContactType;
    has_login: boolean;
    integrated_with: string;
    _id: string;
}

export interface ContactCreatedBy {
    _id: string;
    email: string;
    first_name: string;
    last_name: string;
    phone?: string;
    avatar?: string;
    address?: string;
    title?: string;
}

export interface Contact {
    _id: string;
    first_name: string;
    last_name: string;
    middle_name?: string;
    email: string;
    phone_number?: string;
    company_name?: string;
    address?: string;
    title?: string;
    contact_types: ContactTypeAssignment[];
    status: "ACTIVE" | "INACTIVE";
    created_by: ContactCreatedBy;
    company_id: string;
    created_at: string;
    updated_at: string;
}

export interface GetContactsResponse {
    has_more: boolean;
    total: number;
    page: number;
    limit: number;
    total_pages: number;
    success: boolean;
    message: string;
    data: Contact[];
}

export interface CreateContactPayload {
    company_id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone_number?: string;
    middle_name?: string;
    company_name?: string;
    address?: string;
    title?: string;
}

export interface UpdateContactPayload {
    company_id?: string;
    first_name?: string;
    last_name?: string;
    email?: string;
    phone_number?: string;
    middle_name?: string;
    company_name?: string;
    address?: string;
    title?: string;
}

// ========================================
// API Functions
// ========================================

/**
 * Get contacts for a company
 * Endpoint: GET /api/contacts/v2
 */
export const getContactsAPI = async ({
    company_id,
    contact_type,
    page = 1,
    limit = 10,
}: {
    company_id: string;
    contact_type?: string;
    page?: number;
    limit?: number;
}): Promise<any> => {
    try {
        const params: any = { company_id, page, limit };
        if (contact_type) {
            params.contact_type = contact_type;
        }

        const response = await $fetch.get("/api/contacts/v2", params);
        return response;
    } catch (err) {
        throw err;
    }
};

/**
 * Create a new contact
 * Endpoint: POST /api/contacts/v2
 */
export const createContactAPI = async (
    payload: CreateContactPayload
): Promise<any> => {
    try {
        const response = await $fetch.post("/api/contacts/v2", payload);
        return response;
    } catch (err) {
        throw err;
    }
};

/**
 * Update an existing contact
 * Endpoint: PATCH /api/contacts/:contact_id/v2
 */
export const updateContactAPI = async ({
    contact_id,
    payload,
}: {
    contact_id: string;
    payload: UpdateContactPayload;
}): Promise<any> => {
    try {
        const response = await $fetch.patch(
            `/api/contacts/${contact_id}/v2`,
            payload
        );
        return response;
    } catch (err) {
        throw err;
    }
};

/**
 * Delete a contact
 * Endpoint: DELETE /api/contacts/:contact_id/v2
 */
export const deleteContactAPI = async (contact_id: string): Promise<any> => {
    try {
        const response = await $fetch.delete(`/api/contacts/${contact_id}/v2`);
        return response;
    } catch (err) {
        throw err;
    }
};
