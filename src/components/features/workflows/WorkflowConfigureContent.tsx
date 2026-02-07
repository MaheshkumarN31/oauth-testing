
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

    // Filter contacts based on recipient role (contact type)
    // We try to match recipient.role with contact.contact_type
    const filteredContacts = isSender
        ? []
        : contacts.filter(c =>
            c.contact_type?.toLowerCase() === recipient.role?.toLowerCase()
        )

    // If no specific contacts found for this type, or if role is generic, we might want to show all?
    // User request: "show that contact type emails". Implies strict filtering.
    // However, if the list is empty, maybe fallback to all or show distinct message.
    // For now, let's use all contacts if filtered list is empty, but sort matches to top?
    // Actually, sticking to strict filtering is safer as per request.
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
    // We'll need a way to fetch contacts. For now, let's fetch all contacts for simplicity, 
    // but ideally we should fetch based on contact types if specified in the template.
    // Since useContacts is what we have, let's use it.
    const { data: contactsData, isLoading: contactsLoading } = useContacts({
        companyId: companyId || '',
        enabled: !!companyId,
        limit: 1000
    })

    const [recipients, setRecipients] = useState<any[]>([])
    const [enforceOrder, setEnforceOrder] = useState(false)
    const [isInitialized, setIsInitialized] = useState(false)

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

                    // If we have already initialized for this workflow and have recipients, maybe skip?
                    // But if recipients is empty, we should try again.
                    // For now, let's just run it if we have templates.

                    const initialRecipients: any[] = []

                    // Fetch full details for each template to get document_users
                    const templatePromises = templates.map(async (tmpl: any) => {
                        const templateId = tmpl.template_id?._id || tmpl.template_id
                        if (!templateId) return null

                        try {
                            const response = await getTemplateByIdAPI({
                                templateId,
                                queryParams: { company_id: companyId || '' }
                            })
                            // Ensure we get the correct data object
                            const templateData = response.data?.data || response.data || response

                            return {
                                ...templateData,
                                _originalTmpl: tmpl // keep reference to workflow link if needed
                            }
                        } catch (err) {
                            console.error(`Failed to fetch template ${templateId}`, err)
                            return null
                        }
                    })

                    const fetchedTemplates = await Promise.all(templatePromises)
                    const validTemplates = fetchedTemplates.filter(Boolean)

                    console.log("Fetched templates:", validTemplates) // Debug log

                    validTemplates.forEach((templateData: any) => {
                        const users = templateData.document_users || []
                        users.forEach((user: any) => {
                            initialRecipients.push({
                                ...user,
                                _templateId: templateData._id || templateData.id,
                                _templateName: templateData.title || templateData.name,
                                _uiId: Math.random().toString(36).substring(7)
                            })
                        })
                    })

                    console.log("Initial recipients:", initialRecipients) // Debug log

                    setRecipients(initialRecipients)
                    setEnforceOrder(workflowData.enforce_signature_order || false)
                    setIsInitialized(true)
                } catch (error) {
                    console.error("Error initializing workflow configuration:", error)
                    toast.error("Failed to load template details")
                }
            }
        }

        fetchTemplateDetails()
    }, [workflowData?._id, companyId]) // Depend on ID instead of object identity


    // Group recipients by role to avoid duplicates
    const groupedRecipients = recipients.reduce((acc: any[], curr) => {
        // Normalize role/contact_type for comparison
        const currRole = (curr.role || curr.contact_type || '').toLowerCase()
        const existing = acc.find(r => (r.role || r.contact_type || '').toLowerCase() === currRole)

        if (existing) {
            // Append template name to the existing record for display if not already there
            if (!existing._involvedTemplates?.includes(curr._templateName)) {
                existing._involvedTemplates = existing._involvedTemplates
                    ? `${existing._involvedTemplates}, ${curr._templateName}`
                    : curr._templateName
            }
        } else {
            acc.push({
                ...curr,
                role: curr.role || curr.contact_type, // Ensure role is set
                _involvedTemplates: curr._templateName
            })
        }
        return acc
    }, [])
    const handleUpdateRecipient = (role: string, field: string, value: any) => {
        setRecipients(prev => prev.map(r => {
            if (r.role === role) {
                return { ...r, [field]: value }
            }
            return r
        }))
    }

    const contacts = Array.isArray(contactsData) ? contactsData : []

    const handleContinue = () => {
        // Logic to save/update and proceed
        toast.info('Saving configuration...')
        // navigate to next step
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
                    >
                        Continue <ChevronRight className="ml-2 h-4 w-4" />
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
                    </div>
                </div>
            </div>
        </div>
    )
}
