import { useState, useEffect } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { ArrowLeft, Check, Loader2, Plus, Send, User, Users, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import type { Workspace } from '@/types'
import {
    createDocumentFromTemplateAPI,
    getTemplateByIdAPI,
} from '@/services/api'
import { useContacts } from '@/hooks/queries'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface CreateDocumentFromTemplateProps {
    selectedWorkspace: Workspace | null
}

// Helper to get user from localStorage
const getUserFromLocalStorage = () => {
    try {
        const userStr = localStorage.getItem('user')
        return userStr ? JSON.parse(userStr) : null
    } catch {
        return null
    }
}

// Color palette for recipients
const RECIPIENT_COLORS = [
    '#006c00', // Green
    '#0066cc', // Blue
    '#ff6600', // Orange
    '#9933cc', // Purple
    '#cc0000', // Red
    '#00cccc', // Cyan
    '#ff9900', // Amber
    '#0099ff', // Sky Blue
    '#cc6699', // Rose
]

export function CreateDocumentFromTemplate({ selectedWorkspace }: CreateDocumentFromTemplateProps) {
    const searchParams = new URLSearchParams(window.location.search)
    const templateId = searchParams.get('template_id') || ''
    const userId = searchParams.get('user_id') || ''
    const urlCompanyId = searchParams.get('company_id') || ''

    const user = getUserFromLocalStorage()

    // Get company_id from multiple sources with priority
    const companyId =
        urlCompanyId ||
        selectedWorkspace?._id ||
        user?.company_id ||
        localStorage.getItem('company_id') ||
        ''

    const [selectedContacts, setSelectedContacts] = useState<Record<string, string>>({})
    const [contactsCache, setContactsCache] = useState<Record<string, any>>({})
    const [isCreating, setIsCreating] = useState(false)

    // Debug logging on mount and when dependencies change
    useEffect(() => {
        console.group('🔍 CreateDocumentFromTemplate Debug Info')
        console.log('Template ID:', templateId)
        console.log('User ID:', userId)
        console.log('Company ID (final):', companyId)
        console.log('Company ID Sources:', {
            urlCompanyId,
            workspaceId: selectedWorkspace?._id,
            userCompanyId: user?.company_id,
            localStorageCompanyId: localStorage.getItem('company_id'),
        })
        console.log('User Object:', user)
        console.groupEnd()
    }, [templateId, userId, companyId])

    // Fetch template data
    const { data: templateData, isLoading: isLoadingTemplate, error: templateError } = useQuery({
        queryKey: ['template', templateId, companyId],
        queryFn: () => getTemplateByIdAPI({ templateId, queryParams: { company_id: companyId } }),
        enabled: !!templateId && !!companyId,
        retry: 1,
    })

    // Enhanced template data parsing with multiple fallback paths
    const template = templateData?.data?.data || templateData?.data || templateData

    useEffect(() => {
        if (templateData) {
            console.group('📦 Template Data Received')
            console.log('Raw Response:', templateData)
            console.log('Parsed Template:', template)
            console.log('Document Users:', template?.document_users)
            console.log('Template Title:', template?.title)
            console.groupEnd()
        }
    }, [templateData, template])

    useEffect(() => {
        if (templateError) {
            console.error('❌ Template Loading Error:', templateError)
            toast.error('Failed to load template. Please check the template ID and company ID.')
        }
    }, [templateError])

    // Create document mutation
    const createDocumentMutation = useMutation({
        mutationFn: createDocumentFromTemplateAPI,
        onSuccess: () => {
            toast.success('Document created successfully! 🎉')
            // Reset selected contacts to allow creating another document
            setSelectedContacts({})
            setContactsCache({})
        },
        onError: (error: any) => {
            console.error('❌ Create Document Error:', error)
            toast.error(error?.data?.message || 'Failed to create document')
        },
    })

    const handleBack = () => {
        window.location.href = `/templates?user_id=${userId}`
    }

    const handleCreateDocument = async () => {
        if (!templateId) {
            toast.error('No template selected')
            return
        }

        // Validate all recipients have selected contacts
        const recipients = template?.document_users || []
        const nonSenderRecipients = recipients.filter((r: any) => r.role !== 'sender')

        for (const recipient of nonSenderRecipients) {
            if (!selectedContacts[recipient._id]) {
                toast.error(`Please select a contact for ${recipient.contact_type_name || recipient.role}`)
                return
            }
        }

        setIsCreating(true)

        try {
            // Build document_users payload
            const documentUsers = recipients.map((recipient: any) => {
                const isSender = recipient.role === 'sender'

                if (isSender) {
                    // Sender - use logged-in user data
                    return {
                        ...recipient,
                        email: user?.email || '',
                        first_name: user?.first_name || '',
                        last_name: user?.last_name || '',
                        phone: user?.phone || '',
                        company_name: user?.company_name || '',
                        full_name: `${user?.first_name || ''} ${user?.last_name || ''}`.trim(),
                        title: user?.title || '',
                        address: user?.address || '',
                        name: `${user?.first_name || ''} ${user?.last_name || ''}`.trim(),
                        user_id: userId,
                    }
                } else {
                    // Non-sender - use selected contact
                    const contactId = selectedContacts[recipient._id]
                    const contact = contactsCache[contactId]

                    if (!contact) return null

                    return {
                        ...recipient,
                        email: contact.email || '',
                        first_name: contact.first_name || '',
                        last_name: contact.last_name || '',
                        phone: contact.phone || '',
                        company_name: contact.company_name || '',
                        full_name: contact.full_name || `${contact.first_name || ''} ${contact.last_name || ''}`.trim(),
                        title: contact.title || '',
                        address: contact.address || '',
                        name: contact.full_name || `${contact.first_name || ''} ${contact.last_name || ''}`.trim(),
                        user_id: contact._id || contactId,
                        contact_id: contactId,
                    }
                }
            }).filter(Boolean)

            const payload = {
                company_id: companyId,
                document_users: documentUsers,
                enforce_signature_order: template?.enforce_signature_order || false,
                page_properties: template?.page_properties || [],
                paths: template?.paths || [],
                is_anyone_can_approve: template?.is_anyone_can_approve || false,
                title: template?.title || 'Untitled Document',
                original_doc_paths: template?.original_doc_paths || [],
            }

            console.log('📤 Create Document Payload:', payload)

            await createDocumentMutation.mutateAsync({ templateId, payload })
        } catch (error) {
            console.error('Error creating document:', error)
        } finally {
            setIsCreating(false)
        }
    }

    // Error state: Missing template ID
    if (!templateId) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center space-y-4">
                    <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
                    <p className="text-lg text-muted-foreground">
                        No template selected
                    </p>
                    <Button onClick={handleBack}>
                        Go to Templates
                    </Button>
                </div>
            </div>
        )
    }

    // Error state: Missing company ID
    if (!companyId) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center space-y-4 max-w-md">
                    <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
                    <p className="text-lg font-semibold text-foreground">
                        Company ID Missing
                    </p>
                    <p className="text-sm text-muted-foreground">
                        Unable to load template. Company ID is required but not found in URL, workspace, user data, or local storage.
                    </p>
                    <Button onClick={handleBack}>
                        Go to Templates
                    </Button>
                </div>
            </div>
        )
    }

    // Loading state
    if (isLoadingTemplate) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Loading template...</p>
                    <p className="text-xs text-muted-foreground">
                        Template ID: {templateId}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        Company ID: {companyId}
                    </p>
                </div>
            </div>
        )
    }

    // Error state: Template loading error
    if (templateError) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center space-y-4 max-w-md">
                    <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
                    <p className="text-lg font-semibold text-foreground">
                        Failed to Load Template
                    </p>
                    <p className="text-sm text-muted-foreground">
                        {(templateError as any)?.message || 'An error occurred while loading the template.'}
                    </p>
                    <div className="text-xs text-muted-foreground space-y-1 bg-muted p-3 rounded-lg">
                        <p>Template ID: {templateId}</p>
                        <p>Company ID: {companyId}</p>
                    </div>
                    <Button onClick={handleBack}>
                        Go to Templates
                    </Button>
                </div>
            </div>
        )
    }

    // Error state: No template data
    if (!template) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center space-y-4 max-w-md">
                    <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
                    <p className="text-lg font-semibold text-foreground">
                        Template Not Found
                    </p>
                    <p className="text-sm text-muted-foreground">
                        The template data is empty or could not be parsed.
                    </p>
                    <Button onClick={handleBack}>
                        Go to Templates
                    </Button>
                </div>
            </div>
        )
    }

    const recipients = template?.document_users || []
    const nonSenderRecipients = recipients.filter((r: any) => r.role !== 'sender')
    const allContactsSelected = nonSenderRecipients.every((r: any) => selectedContacts[r._id])

    // Warning if no recipients
    if (recipients.length === 0) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center space-y-4 max-w-md">
                    <AlertCircle className="h-12 w-12 text-amber-500 mx-auto" />
                    <p className="text-lg font-semibold text-foreground">
                        No Recipients Configured
                    </p>
                    <p className="text-sm text-muted-foreground">
                        This template doesn't have any recipients configured. Please configure the template first.
                    </p>
                    <Button onClick={handleBack}>
                        Go to Templates
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-screen bg-gradient-to-br from-slate-50 to-slate-100/50">
            {/* Custom Header */}
            <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b bg-white px-6 shadow-sm">
                <div className="flex items-center gap-3">
                    <Send className="h-6 w-6 text-indigo-500" />
                    <div>
                        <h1 className="text-lg font-semibold">
                            Create Document: {template?.title || 'Untitled Template'}
                        </h1>
                        {selectedWorkspace?.name && (
                            <p className="text-xs text-muted-foreground">{selectedWorkspace.name}</p>
                        )}
                    </div>
                </div>
                <Button variant="outline" onClick={handleBack}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Templates
                </Button>
            </header>

            <div className="flex-1 overflow-auto p-6">
                <div className="max-w-4xl mx-auto space-y-6">

                    {/* Sender Card */}
                    <Card className="border-0 shadow-lg overflow-hidden">
                        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-4">
                            <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Sender (You)
                            </CardTitle>
                        </div>
                        <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                                    {user?.first_name?.[0]}{user?.last_name?.[0]}
                                </div>
                                <div className="flex-1">
                                    <p className="text-lg font-semibold text-foreground">
                                        {user?.first_name} {user?.last_name}
                                    </p>
                                    <p className="text-sm text-muted-foreground mt-1">{user?.email}</p>
                                    {user?.phone && (
                                        <p className="text-sm text-muted-foreground">{user?.phone}</p>
                                    )}
                                    {user?.company_name && (
                                        <p className="text-sm text-muted-foreground mt-2">
                                            <span className="font-medium">Company:</span> {user?.company_name}
                                        </p>
                                    )}
                                </div>
                                <div className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium">
                                    Auto-filled
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recipients Section */}
                    <Card className="border-0 shadow-lg">
                        <CardHeader className="border-b bg-white">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                    <Users className="h-5 w-5 text-primary" />
                                    Select Recipients ({nonSenderRecipients.length})
                                </CardTitle>
                                <div className="text-sm text-muted-foreground">
                                    {Object.keys(selectedContacts).length} of {nonSenderRecipients.length} selected
                                </div>
                            </div>
                            <p className="text-sm text-muted-foreground mt-2">
                                Choose a contact for each recipient role
                            </p>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            {nonSenderRecipients.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
                                    <p>No recipients to configure</p>
                                </div>
                            ) : (
                                nonSenderRecipients.map((recipient: any, index: number) => (
                                    <RecipientContactSelector
                                        key={recipient._id}
                                        recipient={recipient}
                                        companyId={companyId}
                                        selectedContactId={selectedContacts[recipient._id]}
                                        onSelectContact={(contactId, contact) => {
                                            setSelectedContacts(prev => ({ ...prev, [recipient._id]: contactId }))
                                            setContactsCache(prev => ({ ...prev, [contactId]: contact }))
                                        }}
                                        color={RECIPIENT_COLORS[index % RECIPIENT_COLORS.length]}
                                    />
                                ))
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Fixed Bottom Action Bar */}
            <div className="border-t bg-white shadow-lg">
                <div className="max-w-4xl mx-auto p-4 flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        {allContactsSelected ? (
                            <span className="flex items-center gap-2 text-emerald-600">
                                <Check className="h-4 w-4" />
                                All recipients selected
                            </span>
                        ) : (
                            <span>Please select contacts for all recipients</span>
                        )}
                    </div>
                    <Button
                        size="lg"
                        onClick={handleCreateDocument}
                        disabled={!allContactsSelected || isCreating}
                        className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 shadow-lg"
                    >
                        {isCreating ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Creating...
                            </>
                        ) : (
                            <>
                                <Plus className="h-4 w-4 mr-2" />
                                Create Document
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    )
}

// Component for selecting contact for each recipient
function RecipientContactSelector({
    recipient,
    companyId,
    selectedContactId,
    onSelectContact,
    color,
}: {
    recipient: any
    companyId: string
    selectedContactId?: string
    onSelectContact: (contactId: string, contact: any) => void
    color: string
}) {
    const { data: contacts, isLoading, error } = useContacts({
        companyId,
        contactType: recipient.contact_type,
    })

    useEffect(() => {
        if (error) {
            console.error(`❌ Error loading contacts for ${recipient.contact_type_name}:`, error)
        }
    }, [error, recipient.contact_type_name])

    useEffect(() => {
        if (contacts) {
            console.log(`📋 Contacts loaded for ${recipient.contact_type_name}:`, contacts)
        }
    }, [contacts, recipient.contact_type_name])

    const selectedContact = contacts?.find((c: any) => c._id === selectedContactId)

    return (
        <div className={cn(
            "p-5 rounded-xl border-2 transition-all duration-200",
            selectedContactId
                ? "border-emerald-200 bg-emerald-50/30"
                : "border-border bg-white hover:border-primary/30 hover:shadow-md"
        )}>
            <div className="flex items-start gap-4">
                <div
                    className="h-12 w-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md"
                    style={{ backgroundColor: color }}
                >
                    {recipient.contact_type_name?.[0]?.toUpperCase() || recipient.role?.[0]?.toUpperCase() || '?'}
                </div>
                <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                        <div>
                            <Label className="text-base font-semibold">
                                {recipient.contact_type_name || recipient.role || 'Recipient'}
                            </Label>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                                    {recipient.user_type || 'N/A'}
                                </span>
                                {recipient.e_signature_order && (
                                    <span className="text-xs text-muted-foreground">
                                        Order: {recipient.e_signature_order}
                                    </span>
                                )}
                                {recipient.contact_type && (
                                    <span className="text-xs text-muted-foreground">
                                        Type: {recipient.contact_type}
                                    </span>
                                )}
                            </div>
                        </div>
                        {selectedContactId && (
                            <div className="flex items-center gap-1 text-emerald-600 text-sm font-medium">
                                <Check className="h-4 w-4" />
                                Selected
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor={`contact-${recipient._id}`} className="text-sm font-medium">
                            Select Contact *
                        </Label>
                        <Select
                            value=""
                            onValueChange={(value) => {
                                const contact = contacts?.find((c: any) => c._id === value)
                                if (contact) {
                                    onSelectContact(value, contact)
                                }
                            }}
                        >
                            <SelectTrigger
                                id={`contact-${recipient._id}`}
                                className="w-full h-11 border-2"
                            >
                                <SelectValue placeholder={selectedContactId ? "Select another contact..." : "Choose a contact..."} />
                            </SelectTrigger>
                            <SelectContent>
                                {isLoading ? (
                                    <div className="p-3 text-sm text-muted-foreground flex items-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Loading contacts...
                                    </div>
                                ) : error ? (
                                    <div className="p-3 text-sm text-destructive">
                                        Error loading contacts
                                    </div>
                                ) : contacts?.length === 0 ? (
                                    <div className="p-3 text-sm text-muted-foreground">
                                        No contacts found for this type
                                    </div>
                                ) : (
                                    contacts?.map((contact: any) => (
                                        <SelectItem key={contact._id} value={contact._id} className="py-3">
                                            <div className="flex flex-col">
                                                <span className="font-medium">
                                                    {contact.full_name || `${contact.first_name || ''} ${contact.last_name || ''}`.trim()}
                                                </span>
                                                <span className="text-xs text-muted-foreground">{contact.email}</span>
                                            </div>
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    {selectedContact && (
                        <div className="p-4 rounded-lg bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-2 border-emerald-300 shadow-sm">
                            <div className="flex items-start gap-3">
                                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                                    {selectedContact.first_name?.[0]}{selectedContact.last_name?.[0]}
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold text-foreground text-base">
                                        {selectedContact.full_name || `${selectedContact.first_name} ${selectedContact.last_name}`}
                                    </p>
                                    <p className="text-sm text-muted-foreground mt-1">{selectedContact.email}</p>
                                    {selectedContact.phone && (
                                        <p className="text-sm text-muted-foreground mt-0.5">{selectedContact.phone}</p>
                                    )}
                                    {selectedContact.company_name && (
                                        <p className="text-xs text-muted-foreground mt-2 bg-white/50 px-2 py-1 rounded inline-block">
                                            {selectedContact.company_name}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default CreateDocumentFromTemplate