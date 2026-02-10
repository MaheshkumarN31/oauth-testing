import { useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import {
    ArrowLeft,
    ChevronRight,
    Info,
    Loader2,
    Users,
    AlertCircle,
    FileText
} from 'lucide-react'
import { PageHeader } from '@/components/common'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useWorkflow, useContacts } from '@/hooks/queries'
import { getTemplateByIdAPI } from '@/services/api/templates'
import { createWorkflowResponseAPI, sendWorkflowResponseAPI } from '@/services/api/workflows'
import type { Workspace } from '@/types'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface WorkflowConfigureContentProps {
    selectedWorkspace: Workspace | null
    workflowId: string
}

interface RecipientRowProps {
    template: any
    recipientIndex: number
    recipient: any
    contacts: any[]
    isLoadingContacts: boolean
    onUpdate: (field: string, value: any) => void
}

function RecipientRow({
    template,
    recipientIndex,
    recipient,
    contacts,
    isLoadingContacts,
    onUpdate
}: RecipientRowProps) {
    const isSender = recipient.role?.toLowerCase() === 'sender'

    // Filter contacts based on recipient contact_type (ObjectId)
    const filteredContacts = isSender
        ? []
        : contacts.filter(c =>
            c.contact_type === recipient.contact_type
        )

    const displayContacts = filteredContacts.length > 0 ? filteredContacts : contacts

    return (
        <div className="group relative bg-white border border-border/60 rounded-xl p-4 transition-all hover:shadow-md hover:border-indigo-200/60 duration-300 mb-3">
            {/* Visual indicator bar */}
            <div className={cn(
                "absolute left-0 top-0 bottom-0 w-1 rounded-l-xl transition-colors",
                isSender ? "bg-slate-400" : "bg-indigo-500 group-hover:bg-indigo-600"
            )} />

            <div className="flex flex-col gap-4 pl-4">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">

                    {/* Role / Contact Type - 2 cols */}
                    <div className="md:col-span-2 flex items-center gap-3">
                        <Checkbox
                            className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                            checked={!!recipient.email}
                            disabled
                        />
                        <div className={cn(
                            "px-3 py-1.5 rounded-full text-xs font-semibold border flex items-center gap-2 truncate max-w-full",
                            isSender
                                ? "bg-slate-100 text-slate-600 border-slate-200"
                                : "bg-green-50 text-green-700 border-green-200"
                        )}>
                            {isSender ? <Users className="w-3 h-3" /> : null}
                            <span className="truncate">{recipient.role || `Recipient ${recipientIndex + 1}`}</span>
                        </div>
                    </div>

                    {/* Email Selection - 3 cols */}
                    <div className="md:col-span-3">
                        {isSender ? (
                            <div className="text-sm text-muted-foreground px-3 py-2 bg-slate-50 border rounded-md truncate">
                                {recipient.email || "Current User"}
                            </div>
                        ) : (
                            <Select
                                disabled={isLoadingContacts}
                                value={recipient.selected_contact_id || ""}
                                onValueChange={(val) => {
                                    const contact = contacts.find(c => c._id === val || c.id === val);
                                    if (contact) {
                                        onUpdate('selected_contact_id', val);
                                        onUpdate('email', contact.email);
                                        onUpdate('first_name', contact.first_name);
                                        onUpdate('last_name', contact.last_name);
                                        onUpdate('phone', contact.phone || '');
                                        onUpdate('address', contact.address || '');
                                        onUpdate('title', contact.title || '');
                                        onUpdate('company_name', contact.company_name || '');
                                    }
                                }}
                            >
                                <SelectTrigger className="h-10 bg-white border-border/80 focus:ring-2 focus:ring-indigo-100 transition-all">
                                    <SelectValue placeholder="Select Email" />
                                </SelectTrigger>
                                <SelectContent>
                                    {displayContacts.map((contact: any) => (
                                        <SelectItem key={contact._id || contact.id} value={contact._id || contact.id}>
                                            <div className="flex items-center gap-2">
                                                <span>{contact.email}</span>
                                                {contact.first_name && <span className="text-muted-foreground text-xs">({contact.first_name} {contact.contact_type})</span>}
                                            </div>
                                        </SelectItem>
                                    ))}
                                    {displayContacts.length === 0 && (
                                        <div className="p-2 text-xs text-muted-foreground text-center">No contacts found for {recipient.role}</div>
                                    )}
                                </SelectContent>
                            </Select>
                        )}
                    </div>

                    {/* First Name - 2 cols */}
                    <div className="md:col-span-2">
                        <Input
                            placeholder="First Name"
                            value={recipient.first_name || ''}
                            onChange={(e) => onUpdate('first_name', e.target.value)}
                            disabled={isSender}
                            className="h-10 bg-white"
                        />
                    </div>

                    {/* Last Name - 2 cols */}
                    <div className="md:col-span-2">
                        <Input
                            placeholder="Last Name"
                            value={recipient.last_name || ''}
                            onChange={(e) => onUpdate('last_name', e.target.value)}
                            disabled={isSender}
                            className="h-10 bg-white"
                        />
                    </div>

                    {/* Involved Templates - 3 cols */}
                    <div className="md:col-span-3 flex flex-col justify-center">
                        <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-0.5">
                            Involved In The Following Template
                        </span>
                        <div className="text-xs font-medium text-foreground truncate" title={template.template_id?.title}>
                            {template.template_id?.title}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export function WorkflowConfigureContent({
    selectedWorkspace,
    workflowId,
}: WorkflowConfigureContentProps) {
    const navigate = useNavigate()
    const companyId = selectedWorkspace?._id

    const { data: workflowData, isLoading: workflowLoading, error: workflowError } = useWorkflow(workflowId)
    const { data: contactsData, isLoading: contactsLoading } = useContacts({
        companyId: companyId || '',
        enabled: !!companyId,
        limit: 1000
    })

    const [recipients, setRecipients] = useState<any[]>([])
    const [enforceOrder, setEnforceOrder] = useState(false)
    const [isInitialized, setIsInitialized] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Initialize state when workflow data loads
    useEffect(() => {
        const fetchTemplateDetails = async () => {
            if (workflowData?._id) {
                try {
                    // Use document_templates if available, otherwise use steps
                    let templates = workflowData.document_templates || []
                    if (templates.length === 0 && workflowData.steps) {
                        templates = workflowData.steps
                    }

                    console.log("Raw workflow templates:", templates)

                    // Filter only active templates from the workflow
                    templates = templates.filter((tmpl: any) => {
                        // Check various active status fields
                        if (tmpl.is_active === false) return false
                        if (tmpl.status && tmpl.status !== 'ACTIVE' && tmpl.status !== 'active') return false
                        // Check populated template_id status
                        if (tmpl.template_id?.status && tmpl.template_id.status !== 'ACTIVE' && tmpl.template_id.status !== 'active') return false
                        return true
                    })

                    console.log("Active workflow templates:", templates)

                    const initialRecipients: any[] = []

                    // Fetch full details for each template to get document_users
                    const templatePromises = templates.map(async (tmpl: any) => {
                        const templateId = tmpl.template_id?._id || tmpl.template_id || tmpl._id || tmpl.id
                        if (!templateId) {
                            console.warn("Skipping template with no ID:", tmpl)
                            return null
                        }

                        try {
                            const response = await getTemplateByIdAPI({
                                templateId,
                                queryParams: { company_id: companyId || '' }
                            })

                            // Handle nested response structure: response.data.data.data
                            let templateData = null

                            if (response.data?.data?.data) {
                                templateData = response.data.data.data
                            } else if (response.data?.data) {
                                templateData = response.data.data
                            } else if (response.data) {
                                templateData = response.data
                            } else {
                                templateData = response
                            }

                            console.log(`Template ${templateId} fetched:`, {
                                _id: templateData?._id,
                                id: templateData?.id,
                                title: templateData?.title,
                                status: templateData?.status,
                                is_active: templateData?.is_active,
                                document_users_count: templateData?.document_users?.length
                            })

                            // Skip inactive templates
                            if (templateData?.is_active === false) {
                                console.warn(`Skipping inactive template: ${templateId}`)
                                return null
                            }
                            if (templateData?.status && templateData.status !== 'ACTIVE' && templateData.status !== 'active') {
                                console.warn(`Skipping template with status ${templateData.status}: ${templateId}`)
                                return null
                            }

                            return {
                                ...templateData,
                                _originalTmpl: tmpl,
                                _resolvedTemplateId: templateId // fallback ID
                            }
                        } catch (err) {
                            console.error(`Failed to fetch template ${templateId}`, err)
                            return null
                        }
                    })

                    const fetchedTemplates = await Promise.all(templatePromises)
                    const validTemplates = fetchedTemplates.filter(Boolean)

                    console.log("Fetched active templates:", validTemplates.map((t: any) => ({
                        _id: t._id, id: t.id, title: t.title, status: t.status, _resolvedTemplateId: t._resolvedTemplateId
                    })))

                    validTemplates.forEach((templateData: any) => {
                        const users = templateData.document_users || []
                        const resolvedId = templateData._id || templateData.id || templateData._resolvedTemplateId
                        users.forEach((user: any) => {
                            initialRecipients.push({
                                ...user,
                                _templateId: resolvedId,
                                _templateName: templateData.title || templateData.name,
                                _uiId: Math.random().toString(36).substring(7)
                            })
                        })
                    })

                    console.log("Initial recipients with template IDs:", initialRecipients.map((r: any) => ({
                        role: r.role, contact_type_name: r.contact_type_name, _templateId: r._templateId, _templateName: r._templateName
                    })))

                    setRecipients(initialRecipients)
                    setEnforceOrder(workflowData.enforce_signature_order || false)
                    setIsInitialized(true)
                } catch (error) {
                    console.error("Error initializing workflow configuration:", error)
                    toast.error("Failed to load template details")
                    setIsInitialized(false)
                }
            }
        }

        fetchTemplateDetails()
    }, [workflowData?._id, companyId])

    // Group recipients by role to avoid duplicates
    const groupedRecipients = recipients.reduce((acc: any[], curr) => {
        const currRole = (curr.contact_type_name || curr.role || curr.contact_type || '').toLowerCase()
        const existing = acc.find(r => (r.contact_type_name || r.role || r.contact_type || '').toLowerCase() === currRole)

        if (existing) {
            // Add this template to the existing role's templates array if not already there
            const templateExists = existing.templates?.some(
                (t: any) => t.template_id === curr._templateId
            )

            if (!templateExists) {
                if (!existing.templates) {
                    existing.templates = []
                }
                existing.templates.push({
                    user_type: curr.user_type || 'SIGNER',
                    template_id: curr._templateId,
                    template_name: curr._templateName
                })
            }

            if (!existing._involvedTemplates?.includes(curr._templateName)) {
                existing._involvedTemplates = existing._involvedTemplates
                    ? `${existing._involvedTemplates}, ${curr._templateName}`
                    : curr._templateName
            }
        } else {
            acc.push({
                ...curr,
                role: curr.contact_type_name || curr.role || curr.contact_type,
                templates: [{
                    user_type: curr.user_type || 'SIGNER',
                    template_id: curr._templateId,
                    template_name: curr._templateName
                }],
                _involvedTemplates: curr._templateName
            })
        }
        return acc
    }, [])

    const handleUpdateRecipient = (role: string, field: string, value: any) => {
        setRecipients(prev => prev.map(r => {
            const rKey = (r.contact_type_name || r.role || r.contact_type || '').toLowerCase()
            if (rKey === role.toLowerCase()) {
                return { ...r, [field]: value }
            }
            return r
        }))
    }

    const contacts = Array.isArray(contactsData) ? contactsData : []

const handleContinue = async () => {
    // Check if initialized
    if (!isInitialized) {
        toast.error('Please wait, still loading templates...')
        return
    }

    // Validate recipients
    const incompleteRecipients = groupedRecipients.filter(r => {
        const isSender = (r.contact_type_name || r.role || '').toLowerCase() === 'sender'
        if (isSender) return false
        return !r.email || !r.selected_contact_id
    })

    if (incompleteRecipients.length > 0) {
        toast.error(`Please select a contact for: ${incompleteRecipients.map(r => r.role).join(', ')}`)
        return
    }

    setIsSubmitting(true)

    try {
        toast.loading('Creating workflow response...')

        // Build document_templates array from workflow data
        // Use document_templates if available, otherwise fall back to steps (same as initialization)
        let rawTemplates = workflowData?.document_templates || []
        if (rawTemplates.length === 0 && workflowData?.steps) {
            rawTemplates = workflowData.steps
        }

        const documentTemplates = rawTemplates
            .filter((tmpl: any) => {
                // Filter active templates
                if (tmpl.is_active === false) return false
                if (tmpl.status && tmpl.status !== 'ACTIVE' && tmpl.status !== 'active') return false
                if (tmpl.template_id?.status && tmpl.template_id.status !== 'ACTIVE' && tmpl.template_id.status !== 'active') return false
                return true
            })
            .map((tmpl: any) => ({
                template_id: tmpl.template_id?._id || tmpl.template_id || tmpl._id || tmpl.id,
                template_response_id: tmpl.template_response_id,
                document_order: tmpl.document_order ?? 0,
                template_completion_status: tmpl.template_completion_status || "TO-START",
                is_settings_updated: tmpl.is_settings_updated ?? false
            }))

        // Build workflow_users from groupedRecipients, filtering out senders
        const workflowUsers = groupedRecipients
            .filter(r => {
                const roleName = (r.contact_type_name || r.role || '').toLowerCase()
                return roleName !== 'sender'
            })
            .map((u, index) => {
                // Filter templates to only include ones with valid template_id
                const validTemplates = (u.templates || []).filter(
                    (t: any) => t.template_id != null
                )

                return {
                    e_signature_required: u.e_signature_required ?? false,
                    value: u.value || `RECEIVER_${index + 1}`,
                    name: u.name || "",
                    email: u.email,
                    first_name: u.first_name,
                    last_name: u.last_name,
                    type: u.type || 'RECEIVER',
                    user_type: u.user_type || 'SIGNER',
                    contact_type: u.contact_type,
                    role: u.contact_type_name || u.role,
                    templates: validTemplates,
                    user_types: u.user_types || [],
                    errors: {},
                    contact_id: u.selected_contact_id || u.contact_id,
                    phone: u.phone || '',
                    address: u.address || '',
                    title: u.title || '',
                    company_name: u.company_name || '',
                    full_name: `${u.first_name || ''} ${u.last_name || ''}`.trim()
                }
            })
            // Filter out users that have no valid templates
            .filter(u => u.templates.length > 0)

        const primaryUser = workflowUsers.length > 0 ? workflowUsers[0] : null

        const payload = {
            company_id: companyId,
            document_templates: documentTemplates,
            workflow_users: workflowUsers,
            primary_user: primaryUser,
            enforce_signature_order: enforceOrder
        }

        // Step 1: Create workflow response
        const createRes = await createWorkflowResponseAPI({
            workflowId: workflowId as string,
            payload
        })

        // Extract the response ID from the created response
        const responseData = createRes?.data?.data || createRes?.data || createRes
        const responseId = responseData?._id || responseData?.id

        if (!responseId) {
            throw new Error('Failed to get workflow response ID')
        }

        // Step 2: Send the workflow response
        toast.dismiss()
        toast.loading('Sending workflow...')

        await sendWorkflowResponseAPI({
            workflowId: workflowId as string,
            responseId
        })

        toast.dismiss()
        toast.success('Workflow sent successfully!')

        // Navigate to success page
        navigate({
            to: '/workflows/$workflowId/success',
            params: { workflowId },
            search: {
                user_id: localStorage.getItem('user_id') || '',
                workflow_name: workflowData?.name || ''
            }
        })

    } catch (error: any) {
        console.error("Failed to create workflow response:", error)
        console.error("Error response:", error?.response?.data)
        toast.dismiss()

        const errorMessage = error?.response?.data?.message || error?.message || 'Failed to send workflow'
        toast.error(errorMessage)
    } finally {
        setIsSubmitting(false)
    }
}

    if (workflowLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                    <p className="text-sm font-medium text-muted-foreground animate-pulse">Loading workflow details...</p>
                </div>
            </div>
        )
    }

    if (workflowError) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50">
                <div className="max-w-md text-center p-8 bg-white rounded-2xl shadow-sm border border-red-100">
                    <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">Failed to load workflow</h3>
                    <p className="text-sm text-muted-foreground mb-6">
                        We couldn't retrieve the workflow details. This might be due to a network issue or the workflow having been deleted.
                    </p>
                    <Button onClick={() => navigate({ to: '/workflows', search: { user_id: localStorage.getItem('user_id') || '' } })} variant="outline">
                        Back to Workflows
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex flex-col bg-slate-50/50">
            <PageHeader
                title="Configure Workflow"
                icon={Users}
                badge={selectedWorkspace?.name || 'No workspace'}
                description="Assign recipients and configure signing order."
                prefix={
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 mr-1"
                        onClick={() => navigate({ to: '/workflows', search: { user_id: localStorage.getItem('user_id') || '' } })}
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                }
                actions={
                    <Button
                        className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20"
                        onClick={handleContinue}
                        disabled={!isInitialized || isSubmitting || groupedRecipients.length === 0}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Sending...
                            </>
                        ) : (
                            <>
                                Send Workflow <ChevronRight className="ml-2 h-4 w-4" />
                            </>
                        )}
                    </Button>
                }
            />

            <div className="flex-1 overflow-auto p-6 md:p-8 max-w-7xl mx-auto w-full">
                <div className="grid gap-8">

                    {/* Workflow Info Card */}
                    <div className="bg-white rounded-2xl border border-border/60 shadow-sm p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-purple-700">
                                {workflowData?.name || 'Untitled Workflow'}
                            </h2>
                            <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100/80 border border-slate-200/60">
                                    <FileText className="w-3.5 h-3.5" />
                                    {workflowData?.document_templates_count || workflowData?.steps?.length || 0} Documents
                                </span>
                                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100/80 border border-slate-200/60">
                                    <Users className="w-3.5 h-3.5" />
                                    {groupedRecipients.length} Recipients
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 bg-slate-50 px-4 py-3 rounded-xl border border-slate-200/60">
                            <Checkbox
                                id="enforce-order"
                                checked={enforceOrder}
                                onCheckedChange={(c: boolean | 'indeterminate') => setEnforceOrder(!!c)}
                                className="data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                            />
                            <div className="grid gap-0.5">
                                <Label htmlFor="enforce-order" className="text-sm font-semibold cursor-pointer select-none">
                                    Enforce Workflow Order
                                </Label>
                                <p className="text-xs text-muted-foreground">
                                    Recipients sign sequentially
                                </p>
                            </div>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-[300px]">
                                        <p>When enabled, the next recipient will only receive the document after the previous one has completed their action.</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    </div>

                    {/* Recipients List */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <span className="w-1 h-6 bg-indigo-500 rounded-full inline-block"></span>
                            Recipient Details
                        </h3>

                        {!isInitialized ? (
                            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
                                <Loader2 className="h-10 w-10 text-indigo-600 mx-auto mb-3 animate-spin" />
                                <p className="text-muted-foreground font-medium">Loading recipients...</p>
                            </div>
                        ) : (
                            <div className="grid gap-1">
                                {groupedRecipients.map((recipient: any, idx: number) => (
                                    <RecipientRow
                                        key={idx}
                                        recipientIndex={idx}
                                        recipient={recipient}
                                        template={{
                                            template_id: {
                                                title: recipient._involvedTemplates
                                            }
                                        }}
                                        contacts={contacts}
                                        isLoadingContacts={contactsLoading}
                                        onUpdate={(field, value) => handleUpdateRecipient(recipient.role, field, value)}
                                    />
                                ))}

                                {groupedRecipients.length === 0 && (
                                    <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
                                        <Users className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                                        <p className="text-muted-foreground font-medium">No recipients found</p>
                                        <p className="text-xs text-muted-foreground mt-1">Add recipients to the workflow templates to see them here.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}