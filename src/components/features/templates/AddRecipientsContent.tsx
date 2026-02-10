import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import {
  AlertCircle,
  ArrowLeft,
  FileText,
  FolderOpen,
  Loader2,
  Plus,
  Save,
  Sparkles,
  Trash2,
  User,
} from 'lucide-react'
import { toast } from 'sonner'
import type { Recipient, RecipientRole, Workspace } from '@/types'
import type { ContactType } from '@/services/api/contact-types'
import {
  createTemplateAPI,
  updateTemplateAPI,
} from '@/services/api'
import { useContactTypes } from '@/hooks/queries/useContactTypes'
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
import { cn } from '@/lib/utils'

interface AddRecipientsContentProps {
  selectedWorkspace: Workspace | null
}

// Helper function to get logged-in user details from localStorage
const getUserFromLocalStorage = () => {
  try {
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  } catch {
    return null
  }
}



// Color palette for recipients when contact types don't have colors
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

  // Get logged-in user data and initialize sender with it
  const user = getUserFromLocalStorage()
  const [recipients, setRecipients] = useState<Array<Recipient>>([
    {
      id: '1',
      name: user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Sender' : 'Sender',
      role: 'sender',
      email: user?.email || '',
      phone: user?.phone || '',
    },
  ])
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({})

  const { data: contactTypes = [], isLoading: isLoadingContactTypes } = useContactTypes(companyId)

  console.log(contactTypes, 'types')

  const createTemplateMutation = useMutation({
    mutationFn: createTemplateAPI,
    onSuccess: (response: any) => {
      console.log('DEBUG: Create template response:', response)

      // Store redirect URL for later use after document users update
      const redirectUrl = response?.data?.data?.redirect_url || response?.data?.redirect_url || response?.redirect_url
      console.log('DEBUG: Extracted redirect URL:', redirectUrl)

      if (redirectUrl) {
        sessionStorage.setItem('template_redirect_url', redirectUrl)
        console.log('DEBUG: Stored redirect URL in sessionStorage')
      } else {
        console.warn('DEBUG: No redirect URL found in response')
      }
      return response.data._id
    },
    onError: (error: any) => {
      toast.error(error?.data?.message || 'Failed to create template')
      throw error
    },
  })

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

      // Get redirect URL from sessionStorage and open in new tab
      const redirectUrl = sessionStorage.getItem('template_redirect_url')
      console.log('DEBUG: Retrieved redirect URL from sessionStorage:', redirectUrl)

      if (redirectUrl) {
        // Get access token from localStorage
        const accessToken = localStorage.getItem('access_token')
        console.log('DEBUG: Access token from localStorage:', accessToken)

        // Replace the token parameter in the URL with the access token from localStorage
        let finalUrl = redirectUrl
        if (accessToken) {
          // Parse the URL to replace the token parameter
          const url = new URL(redirectUrl)
          url.searchParams.set('token', accessToken)
          finalUrl = url.toString()
          console.log('DEBUG: Final URL with replaced token:', finalUrl)
        }

        console.log('DEBUG: Redirecting to URL in same tab:', finalUrl)
        window.location.href = finalUrl
        sessionStorage.removeItem('template_redirect_url')
        console.log('DEBUG: Redirect URL processed and removed from sessionStorage')
      } else {
        console.warn('DEBUG: No redirect URL found in sessionStorage')
      }
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

      console.log('DEBUG: createResponse', createResponse)

      // Handle nested data response structure safely
      const templateId =
        createResponse?.data?._id ||
        createResponse?.data?.data?._id ||
        createResponse?._id

      if (!templateId || typeof templateId !== 'string') {
        console.error('Invalid template ID received:', templateId)
        throw new Error('Failed to get valid template ID from server')
      }

      // Track contact type counts for auto-numbering roles
      const contactTypeCounts: Record<string, number> = {}

      // Track total receiver count for RECEIVER_N numbering
      let receiverCount = 0

      const documentUsers = recipients.map((recipient, index) => {
        // For sender (first recipient)
        const isSender = index === 0 && recipient.role === 'sender'

        if (isSender) {
          // SENDER payload structure - matches API reference exactly
          return {
            company_name: user?.company_name || '',
            address: user?.address || '',
            full_name: user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : '',
            title: user?.title || '',
            email: user?.email || recipient.email || '',
            first_name: user?.first_name || '',
            last_name: user?.last_name || '',
            phone: user?.phone || recipient.phone || '',
            name: user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : recipient.name,
            role: 'sender',
            default: true,
            e_signature_required: true,
            value: 'SENDER',
            type: 'SENDER',
            e_signature_order: 0,
            has_approval_access: false,
            is_cc: false,
            user_type: 'SIGNER',
            color: '#e60076',
            entity_data_id: null,
            fields_required: false,
            user_id: userId || '',
          }
        } else {
          // NON-SENDER (RECEIVER) payload structure - matches API reference exactly
          // Find contact type by matching the recipient's name
          const contactType = contactTypes.find(
            (ct:any) => ct.name.toLowerCase() === recipient.name.toLowerCase(),
          )

          const contactTypeName = contactType?.name || recipient.name

          // Increment count for this contact type
          contactTypeCounts[contactTypeName] = (contactTypeCounts[contactTypeName] || 0) + 1

          // Increment overall receiver count
          receiverCount++

          // Auto-number role: "ContactType-1", "ContactType-2"
          const role = `${contactTypeName}-${contactTypeCounts[contactTypeName]}`

          // Auto-number value: "RECEIVER_1", "RECEIVER_2"
          const value = `RECEIVER_${receiverCount}`

          // Get the actual type from contact type (RECEIVER, CC, etc.)
          const contactTypeType = contactType?.type?.toUpperCase() || 'RECEIVER'

          // Assign color from palette (cycling through colors for each recipient)
          // Skip index 0 (sender), so subtract 1 for recipient color index
          const colorIndex = (index - 1) % RECIPIENT_COLORS.length
          const recipientColor = contactType?.color || RECIPIENT_COLORS[colorIndex]

          return {
            company_name: '',
            address: '',
            full_name: '',
            title: '',
            email: '',
            first_name: '',
            last_name: '',
            phone: '',
            name: '',
            contact_type_name: contactTypeName,
            role: role,
            default: false,
            value: value,
            type: contactTypeType,
            e_signature_order: index,
            is_cc: contactTypeType === 'CC',
            user_type: contactTypeType === 'SIGNER' ? 'SIGNER' : 'VIEWER',
            color: recipientColor,
            entity_data_id: null,
            fields_required: false,
            user_id: '',
            contact_type: contactType?._id || '',
          }
        }
      })

      const redirectUrl =
        createResponse?.data?.data?.redirect_url ||
        createResponse?.data?.redirect_url ||
        createResponse?.redirect_url

      // Construct update payload matching API reference structure
      const updatePayload = {
        title: editableTemplateName,
        document_users: documentUsers,
        enforce_signature_order: true,
        fields: [],
        company_id: companyId,
        is_anyone_can_approve: false,
        redirect_url: redirectUrl,
      }

      console.log('DEBUG: Update payload:', JSON.stringify(updatePayload, null, 2))

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
      />

      <div className="flex-1 space-y-6 p-1 overflow-auto">
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
          <CardContent className="pt-3 space-y-3">
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
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm">
          <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-purple-50/50 to-pink-50/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Add Recipients
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
          <CardContent className="pt-2 space-y-4">
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
                      Add Contact Types
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
                          {contactTypes.map((contactType:any) => (
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
              </div>
            </div>

            <div className="space-y-3">
              {recipients.map((recipient, index) => {
                const hasNameError = validationErrors[`name-${index}`]

                return (
                  <div
                    key={recipient.id}
                    className="group relative rounded-xl border-2 border-slate-200 bg-white p-5 transition-all hover:border-indigo-300 hover:shadow-md"
                  >
                    <div className="absolute -top-3 -left-3 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-sm font-bold text-white shadow-lg">
                      {index + 1}
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="flex-1 space-y-4">
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
                                disabled={index === 0} // Disable editing sender name
                              />
                              {hasNameError && (
                                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                                  <AlertCircle className="h-3 w-3" />
                                  {hasNameError}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all shrink-0 opacity-0 group-hover:opacity-100 mt-5"
                        onClick={() => removeRecipient(recipient.id)}
                        disabled={recipients.length <= 1 || index === 0}
                      >
                        <Trash2 className="h-10 w-10 text-red-500" />
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