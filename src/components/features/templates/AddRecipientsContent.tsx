import { useEffect, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FileText,
  FolderOpen,
  Loader2,
  Mail,
  Phone,
  Plus,
  Save,
  Sparkles,
  Trash2,
  User,
} from 'lucide-react'
import { toast } from 'sonner'
import type { Recipient, RecipientRole, Workspace } from '@/types'
import {
  createTemplateAPI,
  getContactTypesAPI,
  updateTemplateAPI,
} from '@/services/api'
import { PageHeader } from '@/components/common'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

interface AddRecipientsContentProps {
  selectedWorkspace: Workspace | null
}

interface ContactType {
  _id: string
  name: string
  company_id: string
  role?: string
  color?: string
  type?: string
  [key: string]: any
}

const ROLE_OPTIONS = [
  { value: 'sender', label: 'Sender', icon: '📤' },
  { value: 'signer', label: 'Signer', icon: '✍️' },
  { value: 'viewer', label: 'Viewer', icon: '👁️' },
  { value: 'approver', label: 'Approver', icon: '✅' },
  { value: 'cc', label: 'CC', icon: '📧' },
] as const

export function AddRecipientsContent({
  selectedWorkspace,
}: AddRecipientsContentProps) {
  const searchParams = new URLSearchParams(window.location.search)
  const userId = searchParams.get('user_id') || ''
  const templateNameParam = searchParams.get('template_name') || ''
  const docPathsParam = searchParams.get('doc_paths')
  const docPaths = docPathsParam ? JSON.parse(docPathsParam) : []
  const companyId = selectedWorkspace?._id || ''

  const [editableTemplateName, setEditableTemplateName] =
    useState(templateNameParam)
  const [recipients, setRecipients] = useState<Array<Recipient>>([
    {
      id: '1',
      name: 'Sender',
      role: 'sender',
      email: '',
      phone: '',
    },
  ])
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({})

  // Fetch contact types
  const { data: contactTypesData, isLoading: isLoadingContactTypes } = useQuery(
    {
      queryKey: ['contactTypes', companyId],
      queryFn: () => getContactTypesAPI({ company_id: companyId }),
      enabled: !!companyId,
    },
  )

  const contactTypes: Array<ContactType> = contactTypesData?.data || []

  // Create template mutation
  const createTemplateMutation = useMutation({
    mutationFn: createTemplateAPI,
    onSuccess: (response) => {
      return response.data._id
    },
    onError: (error: any) => {
      toast.error(error?.data?.message || 'Failed to create template')
      throw error
    },
  })

  // Update template mutation
  const updateTemplateMutation = useMutation({
    mutationFn: ({
      templateId,
      payload,
    }: {
      templateId: string
      payload: any
    }) => updateTemplateAPI({ templateId, payload }),
    onSuccess: () => {
      toast.success('Template saved successfully! 🎉')
      setTimeout(() => {
        window.location.href = `/templates?user_id=${userId}`
      }, 1000)
    },
    onError: (error: any) => {
      toast.error(error?.data?.message || 'Failed to save template')
    },
  })

  const handleBack = () => {
    window.location.href = `/templates?user_id=${userId}`
  }

  const validateRecipients = () => {
    const errors: Record<string, string> = {}

    recipients.forEach((recipient, index) => {
      if (!recipient.name.trim()) {
        errors[`name-${index}`] = 'Name is required'
      }
      if (
        recipient.email &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient.email)
      ) {
        errors[`email-${index}`] = 'Invalid email address'
      }
    })

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSave = async () => {
    if (!editableTemplateName.trim()) {
      toast.error('Please enter a template name')
      return
    }

    if (recipients.length === 0) {
      toast.error('Please add at least one recipient')
      return
    }

    if (!validateRecipients()) {
      toast.error('Please fix validation errors')
      return
    }

    if (!companyId) {
      toast.error('No workspace selected')
      return
    }

    setIsSaving(true)

    try {
      // Step 1: Create template
      const templatePayload = {
        title: editableTemplateName,
        company_id: companyId,
        user_id: userId,
        paths: docPaths,
        files_state: 'files_converted_to_pdf',
        document_names: docPaths.map((path: string) => {
          const parts = path.split('/')
          return parts[parts.length - 1]
        }),
        is_template: true,
      }

      const createResponse =
        await createTemplateMutation.mutateAsync(templatePayload)
      const templateId = createResponse

      if (!templateId) {
        throw new Error('Failed to get template ID')
      }

      // Step 2: Add document users
      const documentUsers = recipients.map((recipient, index) => {
        const contactType = contactTypes.find(
          (ct) => ct.name.toLowerCase() === recipient.role.toLowerCase(),
        )

        return {
          company_name: '',
          address: '',
          title: '',
          email: recipient.email || '',
          first_name: recipient.name.split(' ')[0] || '',
          last_name: recipient.name.split(' ').slice(1).join(' ') || '',
          phone: recipient.phone || '',
          name: recipient.name,
          contact_type_name: contactType?.name || recipient.role,
          role: recipient.role,
          _id: recipient.id,
          default: index === 0,
          e_signature_required: recipient.role === 'signer',
          value: recipient.role.toUpperCase(),
          type: recipient.role.toUpperCase(),
          e_signature_order: index,
          has_approval_access: false,
          is_cc: recipient.role === 'cc',
          user_type: recipient.role === 'signer' ? 'SIGNER' : 'VIEWER',
          color: contactType?.color || '#e60076',
          entity_data_id: null,
          fields_required: false,
          user_id: '',
        }
      })

      const updatePayload = {
        title: editableTemplateName,
        document_users: documentUsers,
      }

      await updateTemplateMutation.mutateAsync({
        templateId,
        payload: updatePayload,
      })
    } catch (error) {
      console.error('Error saving template:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleContactTypeSelect = (contactType: ContactType) => {
    const newRecipient: Recipient = {
      id: Date.now().toString(),
      name: contactType.name,
      role: (contactType.type?.toLowerCase() || 'signer') as RecipientRole,
      email: '',
      phone: '',
    }
    setRecipients([...recipients, newRecipient])
    setIsPopoverOpen(false)
    toast.success(`Added ${contactType.name}`)
  }

  const addRecipient = () => {
    const newRecipient: Recipient = {
      id: Date.now().toString(),
      name: `Recipient ${recipients.length + 1}`,
      role: 'signer',
      email: '',
      phone: '',
    }
    setRecipients([...recipients, newRecipient])
  }

  const removeRecipient = (id: string) => {
    if (recipients.length > 1) {
      setRecipients(recipients.filter((r) => r.id !== id))
      toast.success('Recipient removed')
    } else {
      toast.error('At least one recipient is required')
    }
  }

  const updateRecipient = (id: string, updates: Partial<Recipient>) => {
    setRecipients(
      recipients.map((r) => (r.id === id ? { ...r, ...updates } : r)),
    )
    // Clear validation errors for this field
    if (updates.name !== undefined) {
      const index = recipients.findIndex((r) => r.id === id)
      setValidationErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[`name-${index}`]
        return newErrors
      })
    }
    if (updates.email !== undefined) {
      const index = recipients.findIndex((r) => r.id === id)
      setValidationErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[`email-${index}`]
        return newErrors
      })
    }
  }

  const moveRecipient = (index: number, direction: 'up' | 'down') => {
    const newRecipients = [...recipients]
    const targetIndex = direction === 'up' ? index - 1 : index + 1

    if (targetIndex >= 0 && targetIndex < recipients.length) {
      const temp = newRecipients[index]
      newRecipients[index] = newRecipients[targetIndex]
      newRecipients[targetIndex] = temp
      setRecipients(newRecipients)
    }
  }

  const getFileNamesFromPaths = () => {
    return docPaths.map((path: string) => {
      const parts = path.split('/')
      return parts[parts.length - 1]
    })
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      <PageHeader
        title="Configure Template Recipients"
        icon={FolderOpen}
        badge={selectedWorkspace?.name || 'No workspace'}
        prefix={
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="gap-2 hover:bg-slate-100"
              disabled={isSaving}
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Separator orientation="vertical" className="mx-2 h-4" />
          </>
        }
        actions={
          <Button
            onClick={handleSave}
            disabled={
              isSaving ||
              !editableTemplateName.trim() ||
              recipients.length === 0
            }
            className="gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/30 transition-all duration-200"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving Template...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Template
              </>
            )}
          </Button>
        }
      />

      <div className="flex-1 space-y-6 p-6 overflow-auto">
        {/* Template Overview Card */}
        <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm">
          <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-indigo-50/50 to-purple-50/50">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Template Configuration
                </CardTitle>
                <p className="text-sm text-slate-600 mt-0.5">
                  Set up your document template with recipients and workflow
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            {/* Template Name */}
            <div className="space-y-2">
              <Label
                htmlFor="templateName"
                className="text-sm font-semibold text-slate-700 flex items-center gap-2"
              >
                <Sparkles className="h-4 w-4 text-indigo-500" />
                Template Name
                <span className="text-red-500">*</span>
              </Label>
              <Input
                id="templateName"
                value={editableTemplateName}
                onChange={(e) => setEditableTemplateName(e.target.value)}
                placeholder="Enter a descriptive template name..."
                className="h-12 text-base border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20 transition-all"
              />
              {!editableTemplateName.trim() && (
                <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                  <AlertCircle className="h-3 w-3" />
                  Template name is required
                </p>
              )}
            </div>

            {/* Files Overview */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">
                Attached Files
              </Label>
              <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Badge
                    variant="secondary"
                    className="bg-indigo-100 text-indigo-700 border-0"
                  >
                    {docPaths.length} {docPaths.length === 1 ? 'File' : 'Files'}
                  </Badge>
                </div>
                <div className="space-y-1.5 max-h-32 overflow-auto">
                  {getFileNamesFromPaths().map(
                    (fileName: string, index: number) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 text-sm text-slate-600"
                      >
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                        <span className="truncate">{fileName}</span>
                      </div>
                    ),
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recipients Card */}
        <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm">
          <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-purple-50/50 to-pink-50/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Recipients & Workflow
                  </CardTitle>
                  <p className="text-sm text-slate-600 mt-0.5">
                    Define who will interact with this template
                  </p>
                </div>
              </div>
              <Badge
                variant="secondary"
                className="bg-purple-100 text-purple-700 border-0 px-3 py-1"
              >
                {recipients.length}{' '}
                {recipients.length === 1 ? 'Recipient' : 'Recipients'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            {/* Add Recipient Button */}
            <div className="flex items-center justify-between pb-2">
              <Label className="text-sm font-semibold text-slate-700">
                Recipient List
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <div className="flex gap-2">
                <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="gap-2 border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50 transition-all"
                      disabled={isLoadingContactTypes}
                    >
                      {isLoadingContactTypes ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                      From Contact Types
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-0" align="end">
                    <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-purple-50">
                      <h4 className="font-semibold text-sm text-slate-900">
                        Select Contact Type
                      </h4>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Choose a predefined contact type to add
                      </p>
                    </div>
                    <div className="p-2 max-h-72 overflow-auto">
                      {isLoadingContactTypes ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
                        </div>
                      ) : contactTypes.length === 0 ? (
                        <div className="text-center py-8 px-4">
                          <p className="text-sm text-slate-600">
                            No contact types available
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            Create contact types in settings
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          {contactTypes.map((contactType) => (
                            <button
                              key={contactType._id}
                              onClick={() =>
                                handleContactTypeSelect(contactType)
                              }
                              className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-indigo-50 transition-all flex items-center gap-3 group"
                            >
                              <div
                                className="w-3 h-3 rounded-full ring-2 ring-white shadow-sm"
                                style={{
                                  backgroundColor:
                                    contactType.color || '#e60076',
                                }}
                              />
                              <span className="text-sm font-medium text-slate-700 group-hover:text-indigo-700">
                                {contactType.name}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
                <Button
                  variant="outline"
                  onClick={addRecipient}
                  className="gap-2 border-slate-200 hover:border-slate-400 hover:bg-slate-50"
                >
                  <Plus className="h-4 w-4" />
                  Custom
                </Button>
              </div>
            </div>

            {/* Recipients List */}
            <div className="space-y-3">
              {recipients.map((recipient, index) => {
                const hasNameError = validationErrors[`name-${index}`]
                const hasEmailError = validationErrors[`email-${index}`]

                return (
                  <div
                    key={recipient.id}
                    className="group relative rounded-xl border-2 border-slate-200 bg-white p-5 transition-all hover:border-indigo-300 hover:shadow-md"
                  >
                    {/* Order Badge */}
                    <div className="absolute -top-3 -left-3 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-sm font-bold text-white shadow-lg">
                      {index + 1}
                    </div>

                    <div className="flex items-start gap-4">
                      {/* Reorder Controls */}
                      <div className="flex flex-col gap-1 pt-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 hover:bg-indigo-100 disabled:opacity-30"
                          onClick={() => moveRecipient(index, 'up')}
                          disabled={index === 0}
                        >
                          <ChevronUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 hover:bg-indigo-100 disabled:opacity-30"
                          onClick={() => moveRecipient(index, 'down')}
                          disabled={index === recipients.length - 1}
                        >
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Recipient Details */}
                      <div className="flex-1 space-y-4">
                        {/* Name and Role Row */}
                        <div className="flex items-start gap-3">
                          <div className="flex-1 space-y-1.5">
                            <Label className="text-xs font-medium text-slate-600">
                              Recipient Name *
                            </Label>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                              <Input
                                value={recipient.name}
                                onChange={(e) =>
                                  updateRecipient(recipient.id, {
                                    name: e.target.value,
                                  })
                                }
                                placeholder="Enter name..."
                                className={cn(
                                  'pl-10 h-11 transition-all',
                                  hasNameError
                                    ? 'border-red-300 focus:border-red-500'
                                    : 'border-slate-200 focus:border-indigo-500',
                                )}
                              />
                              {hasNameError && (
                                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                                  <AlertCircle className="h-3 w-3" />
                                  {hasNameError}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="w-44 space-y-1.5">
                            <Label className="text-xs font-medium text-slate-600">
                              Role *
                            </Label>
                            <Select
                              value={recipient.role}
                              onValueChange={(value) =>
                                updateRecipient(recipient.id, {
                                  role: value as RecipientRole,
                                })
                              }
                            >
                              <SelectTrigger className="h-11 border-slate-200 focus:border-indigo-500">
                                <SelectValue placeholder="Select role" />
                              </SelectTrigger>
                              <SelectContent>
                                {ROLE_OPTIONS.map((option) => (
                                  <SelectItem
                                    key={option.value}
                                    value={option.value}
                                  >
                                    <span className="flex items-center gap-2">
                                      <span>{option.icon}</span>
                                      <span>{option.label}</span>
                                    </span>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {/* Email and Phone Row */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-slate-600">
                              Email Address
                            </Label>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                              <Input
                                type="email"
                                value={recipient.email || ''}
                                onChange={(e) =>
                                  updateRecipient(recipient.id, {
                                    email: e.target.value,
                                  })
                                }
                                placeholder="email@example.com"
                                className={cn(
                                  'pl-10 h-11 transition-all',
                                  hasEmailError
                                    ? 'border-red-300 focus:border-red-500'
                                    : 'border-slate-200 focus:border-indigo-500',
                                )}
                              />
                              {hasEmailError && (
                                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                                  <AlertCircle className="h-3 w-3" />
                                  {hasEmailError}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-slate-600">
                              Phone Number
                            </Label>
                            <div className="relative">
                              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                              <Input
                                type="tel"
                                value={recipient.phone || ''}
                                onChange={(e) =>
                                  updateRecipient(recipient.id, {
                                    phone: e.target.value,
                                  })
                                }
                                placeholder="+1 (555) 000-0000"
                                className="pl-10 h-11 border-slate-200 focus:border-indigo-500 transition-all"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Role Badge */}
                        <div className="flex items-center gap-2 pt-1">
                          <Badge
                            variant="secondary"
                            className={cn(
                              'text-xs font-medium border-0',
                              recipient.role === 'signer' &&
                                'bg-emerald-100 text-emerald-700',
                              recipient.role === 'sender' &&
                                'bg-blue-100 text-blue-700',
                              recipient.role === 'viewer' &&
                                'bg-slate-100 text-slate-700',
                              recipient.role === 'approver' &&
                                'bg-purple-100 text-purple-700',
                              recipient.role === 'cc' &&
                                'bg-amber-100 text-amber-700',
                            )}
                          >
                            {
                              ROLE_OPTIONS.find(
                                (r) => r.value === recipient.role,
                              )?.icon
                            }{' '}
                            {recipient.role.charAt(0).toUpperCase() +
                              recipient.role.slice(1)}
                          </Badge>
                          {recipient.role === 'signer' && (
                            <span className="text-xs text-slate-500 flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              E-signature required
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Delete Button */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all shrink-0 opacity-0 group-hover:opacity-100"
                        onClick={() => removeRecipient(recipient.id)}
                        disabled={recipients.length <= 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>

            {recipients.length === 0 && (
              <div className="text-center py-12 px-4 rounded-lg border-2 border-dashed border-slate-200 bg-slate-50">
                <User className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                <p className="text-sm font-medium text-slate-700">
                  No recipients added yet
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Click the buttons above to add recipients
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Summary Card */}
        <Card className="border-0 shadow-md bg-gradient-to-br from-indigo-50 to-purple-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-slate-700">
                  Ready to save?
                </h3>
                <p className="text-xs text-slate-600">
                  This template will be created with {recipients.length}{' '}
                  {recipients.length === 1 ? 'recipient' : 'recipients'} and{' '}
                  {docPaths.length} {docPaths.length === 1 ? 'file' : 'files'}
                </p>
              </div>
              <Button
                onClick={handleSave}
                disabled={
                  isSaving ||
                  !editableTemplateName.trim() ||
                  recipients.length === 0
                }
                size="lg"
                className="gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/30 px-8"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Creating Template...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5" />
                    Save & Continue
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default AddRecipientsContent
