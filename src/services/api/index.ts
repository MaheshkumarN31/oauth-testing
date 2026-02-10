// ========================================
// API Service Barrel Export
// ========================================

// Core fetch service
export { $fetch, $fetchResponse } from './fetch'

// Authentication APIs
export * from './auth'

// Workspace APIs
export * from './workspaces'

// Document APIs
export * from './documents'

// Template APIs
export * from "./templates";
export * from "./contact-types";

// Contacts APIs (exclude ContactType to avoid ambiguity with contact-types)
export {
    type ContactTypeAssignment,
    type ContactCreatedBy,
    type Contact,
    type GetContactsResponse,
    type CreateContactPayload,
    type UpdateContactPayload,
    getContactsAPI,
    createContactAPI,
    updateContactAPI,
    deleteContactAPI,
} from './contacts'
export * from './workflows'
