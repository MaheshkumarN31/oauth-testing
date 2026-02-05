/* eslint-disable no-useless-catch */
import { $fetch } from "./fetch";

/**
 * Get contacts for a company
 * Endpoint: GET /api/contacts/v2
 */
export const getContactsAPI = async ({
    company_id,
    contact_type,
}: {
    company_id: string;
    contact_type?: string;
}): Promise<any> => {
    try {
        const params: any = { company_id };
        if (contact_type) {
            params.contact_type = contact_type;
        }

        const response = await $fetch.get("/api/contacts/v2", params);
        return response;
    } catch (err) {
        throw err;
    }
};
