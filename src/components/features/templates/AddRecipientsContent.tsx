import { useState } from 'react'
import { ArrowLeft, FolderOpen, Save } from 'lucide-react'
import { PageHeader } from '@/components/common'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { RecipientEditor } from './RecipientEditor'
import type { Recipient, Workspace } from '@/types'

interface AddRecipientsContentProps {
    selectedWorkspace: Workspace | null
}

/**
 * Add recipients page content for templates
 */
export function AddRecipientsContent({ selectedWorkspace: _selectedWorkspace }: AddRecipientsContentProps) {
    // Parse URL params
    const searchParams = new URLSearchParams(window.location.search)
    const userId = searchParams.get('user_id') || ''
    const templateNameParam = searchParams.get('template_name') || ''
    const docPathsParam = searchParams.get('doc_paths')
    const docPaths = docPathsParam ? JSON.parse(docPathsParam) : []

    const [editableTemplateName, setEditableTemplateName] = useState(templateNameParam)
    const [recipients, setRecipients] = useState<Array<Recipient>>([
        { id: '1', name: 'Sender', role: 'signer' },
    ])

    const handleBack = () => {
        window.location.href = `/templates?user_id=${userId}`
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

    return (
        <>
            <PageHeader
                title="Add Template Recipient Details"
                icon={FolderOpen}
                badge={`${docPaths.length} file(s)`}
                prefix={
                    <>
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
                    </>
                }
                actions={
                    <Button
                        onClick={handleSave}
                        className="gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                    >
                        <Save className="h-4 w-4" />
                        Save Template
                    </Button>
                }
            />

            <div className="flex-1 space-y-6 p-6 overflow-auto">
                <Card className="border-0 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold">
                            Add Template Recipient Details ({recipients.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Template Name */}
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

                        {/* Recipients Editor */}
                        <RecipientEditor
                            recipients={recipients}
                            onUpdate={setRecipients}
                        />
                    </CardContent>
                </Card>
            </div>
        </>
    )
}

export default AddRecipientsContent
