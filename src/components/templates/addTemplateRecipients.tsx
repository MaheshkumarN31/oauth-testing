import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  FolderOpen,
  Plus,
  Save,
  Trash2,
  User,
} from 'lucide-react'
import {
  AppSidebar,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '../layout/AppSidebar'
import type { Recipient, Workspace } from '@/types'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { ROLE_OPTIONS } from '@/types'
import { useWorkspaces } from '@/hooks/queries'
import { getContactTypesAPI } from '@/services/api'

const AddTemplateRecipients = () => {
  const searchParams = new URLSearchParams(window.location.search)
  const userId = searchParams.get('user_id') || ''
  const templateNameParam = searchParams.get('template_name') || ''
  const docPathsParam = searchParams.get('doc_paths')
  const docPaths = docPathsParam ? JSON.parse(docPathsParam) : []

  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(() => {
    const saved = localStorage.getItem('selected_workspace_id')
    return saved ? { _id: saved, id: saved, name: '' } as Workspace : null
  })
  const [recipients, setRecipients] = useState<Array<Recipient>>([
    { id: '1', name: 'Sender', role: 'signer' },
  ])
  const [editableTemplateName, setEditableTemplateName] =
    useState(templateNameParam)

  const { data: workspaces, isLoading } = useWorkspaces()

  const { data: contactTypes } = useQuery({
    queryKey: ['contact-types', selectedWorkspace?._id],
    queryFn: () => getContactTypesAPI({ company_id: selectedWorkspace?._id || '' }),
    enabled: !!selectedWorkspace?._id
  })

  console.log('DEBUG: contactTypes structure:', contactTypes)

  useEffect(() => {
    if (workspaces) {
      const workspaceList = Array.isArray(workspaces) ? workspaces : workspaces.data || []

      const savedId = localStorage.getItem('selected_workspace_id')
      if (savedId) {
        const found = workspaceList.find((w: Workspace) => w._id === savedId || w.id === savedId)
        if (found && found._id !== selectedWorkspace?._id) {
          setSelectedWorkspace(found)
          return
        }
      }

      if (!selectedWorkspace && workspaceList.length > 0) {
        setSelectedWorkspace(workspaceList[0])
      }
    }
  }, [workspaces, selectedWorkspace])

  const addRecipient = () => {
    const newRecipient: Recipient = {
      id: Date.now().toString(),
      name: `Recipient ${recipients.length + 1}`,
      role: 'signer',
    }
    setRecipients([...recipients, newRecipient])
  }

  const removeRecipient = (id: string) => {
    if (recipients.length > 1) {
      setRecipients(recipients.filter((r) => r.id !== id))
    }
  }

  const updateRecipient = (id: string, updates: Partial<Recipient>) => {
    setRecipients(
      recipients.map((r) => (r.id === id ? { ...r, ...updates } : r)),
    )
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

  const handleSave = async () => {
    console.log('Saving template:', {
      templateName: editableTemplateName,
      docPaths,
      recipients,
    })
    alert('Template saved successfully!')
    window.location.href = `/templates?user_id=${userId}`
  }

  const handleBack = () => {
    window.location.href = `/templates?user_id=${userId}`
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <SidebarProvider>
      <AppSidebar
        workspaces={workspaces?.data}
        selectedWorkspace={selectedWorkspace}
        setSelectedWorkspace={setSelectedWorkspace}
      />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Separator orientation="vertical" className="mx-2 h-4" />
            <div className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5 text-indigo-500" />
              <h1 className="text-lg font-semibold">
                Add Template Recipient Details
              </h1>
              <Badge variant="secondary" className="text-xs">
                {docPaths.length} file(s)
              </Badge>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-4 px-4">
            <Button
              onClick={handleSave}
              className="gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
            >
              <Save className="h-4 w-4" />
              Save Template
            </Button>
          </div>
        </header>

        <div className="flex-1 space-y-6 p-6 overflow-auto">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                Add Template Recipient Details ({recipients.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="templateName" className="text-sm font-medium">
                  Template Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="templateName"
                  value={editableTemplateName}
                  onChange={(e) => setEditableTemplateName(e.target.value)}
                  placeholder="Enter template name"
                  className="max-w-md h-11"
                />
              </div>

              <div className="space-y-3">
                {recipients.map((recipient, index) => (
                  <div
                    key={recipient.id}
                    className="flex items-center gap-4 rounded-lg bg-muted/30 p-4 border-l-4 border-l-purple-500"
                  >
                    <div className="flex flex-col gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => moveRecipient(index, 'up')}
                        disabled={index === 0}
                      >
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => moveRecipient(index, 'down')}
                        disabled={index === recipients.length - 1}
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex items-center gap-3 flex-1">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-muted-foreground/30 bg-background">
                        <User className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <Input
                        value={recipient.name}
                        onChange={(e) =>
                          updateRecipient(recipient.id, {
                            name: e.target.value,
                          })
                        }
                        placeholder="Recipient name"
                        className="max-w-[160px] bg-transparent border-0 border-b border-muted-foreground/30 rounded-none focus-visible:ring-0 focus-visible:border-indigo-500 px-0"
                      />
                    </div>

                    <Select
                      value={recipient.contact_type || 'default'}
                      onValueChange={(value) =>
                        updateRecipient(recipient.id, {
                          contact_type: value,
                        })
                      }
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Contact Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">Default</SelectItem>
                        {(Array.isArray(contactTypes?.data) ? contactTypes.data : Array.isArray(contactTypes) ? contactTypes : []).map((type: any) => (
                          <SelectItem key={type.id} value={type.name}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select
                      value={recipient.role}
                      onValueChange={(value) =>
                        updateRecipient(recipient.id, {
                          role: value as Recipient['role'],
                        })
                      }
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        {ROLE_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => removeRecipient(recipient.id)}
                      disabled={recipients.length <= 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <Button
                variant="outline"
                onClick={addRecipient}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Recipient
              </Button>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider >
  )
}

export default AddTemplateRecipients
