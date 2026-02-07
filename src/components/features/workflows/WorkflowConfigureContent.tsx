
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
import { Badge } from '@/components/ui/badge'
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

    return (
        <div className="group relative bg-white border border-border/60 rounded-xl p-4 transition-all hover:shadow-md hover:border-indigo-200/60 duration-300 mb-3">
            {/* Visual indicator bar */}
            <div className={cn(
                "absolute left-0 top-0 bottom-0 w-1 rounded-l-xl transition-colors",
                isSender ? "bg-slate-400" : "bg-indigo-500 group-hover:bg-indigo-600"
            )} />

            <div className="flex flex-col gap-4 pl-2">
                {/* Top row: Role badge and basic info */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "flex items-center justify-center w-8 h-8 rounded-lg",
                            isSender ? "bg-slate-100 text-slate-500" : "bg-indigo-50 text-indigo-600"
                        )}>
                            <Users className="w-4 h-4" />
                        </div>

                        <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-sm text-foreground">
                                    {recipient.role || `Recipient ${recipientIndex + 1}`}
                                </span>
                                {isSender && (
                                    <Badge variant="secondary" className="text-[10px] h-4 px-1.5 bg-slate-100 text-slate-500">
                                        SENDER
                                    </Badge>
                                )}
                            </div>
                            <span className="text-xs text-muted-foreground">
                                Involved in: <span className="font-medium text-indigo-600/80">{template.template_id?.title || template.template_id?.name || 'Unknown Template'}</span>
                            </span>
                        </div>
                    </div>
                </div>

                {/* Input fields row */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    {/* Email/Contact Selection - 5 cols */}
                    <div className="md:col-span-5">
                        {isSender ? (
                            <div className="relative">
                                <div className="flex items-center h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-muted-foreground">
                                    {recipient.email || "Current User (You)"}
                                </div>
                            </div>
                        ) : (
                            <div className="relative">
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
                                        <SelectValue placeholder="Select a contact" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {contacts.map((contact: any) => (
                                            <SelectItem key={contact._id || contact.id} value={contact._id || contact.id}>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] text-indigo-600 font-bold">
                                                        {contact.first_name?.[0]}{contact.last_name?.[0]}
                                                    </div>
                                                    <span>{contact.first_name} {contact.last_name}</span>
                                                    <span className="text-muted-foreground text-xs ml-1">({contact.email})</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>

                    {/* First Name - 3.5 cols */}
                    <div className="md:col-span-3">
                        <Input
                            placeholder="First Name"
                            value={recipient.first_name || ''}
                            onChange={(e) => onUpdate('first_name', e.target.value)}
                            disabled={isSender}
                            className={cn(
                                "h-10 transition-all",
                                isSender && "bg-slate-50 text-muted-foreground border-slate-200"
                            )}
                        />
                    </div>

                    {/* Last Name - 3.5 cols */}
                    <div className="md:col-span-4">
                        <Input
                            placeholder="Last Name"
                            value={recipient.last_name || ''}
                            onChange={(e) => onUpdate('last_name', e.target.value)}
                            disabled={isSender}
                            className={cn(
                                "h-10 transition-all",
                                isSender && "bg-slate-50 text-muted-foreground border-slate-200"
                            )}
                        />
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
        enabled: !!companyId
    })

    const [recipients, setRecipients] = useState<any[]>([])
    const [enforceOrder, setEnforceOrder] = useState(false)
    const [isInitialized, setIsInitialized] = useState(false)

    // Initialize state when workflow data loads
    useEffect(() => {
        if (workflowData && !isInitialized) {
            // Flatten the structure: We need to iterate through document_templates 
            // and then document_users to build a flat list of recipients to display.
            // However, the UI design suggests grouping by "Recipient Details".
            // If a recipient appears involved in multiple templates, we might want to merge them if possible?
            // For now, let's just map them as they come from the API structure.

            const initialRecipients: any[] = []

            // Check if workflowData has document_templates
            const templates = workflowData.document_templates || []

            templates.forEach((tmpl: any) => {
                const users = tmpl.template_id?.document_users || []
                users.forEach((user: any) => {
                    // We'll add a reference to the template for display purposes
                    initialRecipients.push({
                        ...user,
                        _templateId: tmpl.template_id?._id,
                        _templateName: tmpl.template_id?.title || tmpl.template_id?.name,
                        // unique ID for key
                        _uiId: Math.random().toString(36).substring(7)
                    })
                })
            })

            setRecipients(initialRecipients)
            setEnforceOrder(workflowData.enforce_signature_order || false)
            setIsInitialized(true)
        }
    }, [workflowData, isInitialized])

    // Group recipients by role to avoid duplicates if the same role is used across templates?
    // The user request shows "Involved in the following template: i-9, i-9 - Copy".
    // This implies merging recipients with the same role/signer type.

    const groupedRecipients = recipients.reduce((acc: any[], curr) => {
        const existing = acc.find(r => r.role === curr.role && r.type === curr.type)
        if (existing) {
            // Append template name to the existing record for display
            existing._involvedTemplates = existing._involvedTemplates
                ? `${existing._involvedTemplates}, ${curr._templateName}`
                : curr._templateName
        } else {
            acc.push({
                ...curr,
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
                                    {workflowData?.document_templates_count || 0} Documents
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
