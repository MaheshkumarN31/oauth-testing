import { useState } from 'react'
import { FileText, Loader2, Plus, Upload } from 'lucide-react'
import { FileUploadZone } from './FileUploadZone'
import type { FileUploadStatus } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { getPresignedUrlsAPI, uploadMultipleFilesAPI } from '@/services/api'

interface CreateTemplateDialogProps {
    companyId: string | undefined
    userId: string
}

export function CreateTemplateDialog({
    companyId,
    userId,
}: CreateTemplateDialogProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [templateName, setTemplateName] = useState('')
    const [selectedFiles, setSelectedFiles] = useState<Array<File>>([])
    const [isUploading, setIsUploading] = useState(false)
    const [uploadStatuses, setUploadStatuses] = useState<Array<FileUploadStatus>>(
        [],
    )

    const resetDialog = () => {
        setTemplateName('')
        setSelectedFiles([])
        setUploadStatuses([])
        setIsUploading(false)
    }

    const handleCancel = () => {
        setIsOpen(false)
        resetDialog()
    }

    const handleFilesSelect = (files: Array<File>) => {
        setSelectedFiles((prev) => [...prev, ...files])
    }

    const handleRemoveFile = (index: number) => {
        setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
    }

    const handleRemoveAllFiles = () => {
        setSelectedFiles([])
    }

    const handleCreateTemplate = async () => {
        if (!templateName.trim()) {
            alert('Please enter a template name')
            return
        }
        if (selectedFiles.length === 0) {
            alert('Please upload at least one file')
            return
        }
        if (!companyId) {
            alert('No workspace selected')
            return
        }

        setIsUploading(true)

        const initialStatuses: Array<FileUploadStatus> = selectedFiles.map(
            (file) => ({
                file,
                status: 'pending',
            }),
        )
        setUploadStatuses(initialStatuses)

        try {
            const filenames = selectedFiles.map((file) => file.name)
            const presignedData = await getPresignedUrlsAPI({
                filenames,
                company_id: companyId,
            })
            console.log('Presigned Data Response:', presignedData)
            const responseBody = presignedData.data || {}
            // The API response is nested: { success: true, data: { upload_urls: ... } }
            // And our FetchService wraps that in another { data: ... }
            const apiData = responseBody.data || responseBody

            // Handle both possible key formats from API
            const uploadUrls = apiData.upload_urls || apiData.presigned_urls?.map((p: any) => p.url)
            // doc_paths might be returned as doc_paths or we might need to assume structure
            const docPaths = apiData.doc_paths || apiData.presigned_urls?.map((p: any) => p.file_key) || []

            if (!uploadUrls || uploadUrls.length !== selectedFiles.length) {
                console.error('Invalid URLs:', uploadUrls, 'Expected:', selectedFiles.length)
                const receivedKeys = Object.keys(data).join(', ')
                throw new Error(`Invalid response from API. Keys found: [${receivedKeys}]. Expected 'upload_urls' or 'presigned_urls'.`)
            }

            const results = await uploadMultipleFilesAPI({
                files: selectedFiles,
                uploadUrls: uploadUrls,
                onProgress: ({ index, status }) => {
                    setUploadStatuses((prev) =>
                        prev.map((s, i) => (i === index ? { ...s, status } : s)),
                    )
                },
            })

            const successfulUploads = results.filter((r) => r.success)

            if (successfulUploads.length === selectedFiles.length) {
                setIsOpen(false)
                const searchParams = new URLSearchParams({
                    user_id: userId,
                    template_name: templateName,
                    doc_paths: JSON.stringify(docPaths),
                })
                console.log('Redirecting to:', `/templates/add-recipients?${searchParams.toString()}`)
                window.location.href = `/templates/add-recipients?${searchParams.toString()}`
            } else {
                const failedCount = selectedFiles.length - successfulUploads.length
                alert(`${failedCount} file(s) failed to upload. Please try again.`)
            }
        } catch (error: any) {
            console.error('Upload error:', error)
            const errorMessage = error?.message || 'Unknown error'
            const errorDetails = error?.name ? `${error.name}: ${errorMessage}` : errorMessage
            alert(`Failed to upload files. Error: ${errorDetails}`)
        } finally {
            setIsUploading(false)
        }
    }

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(open) => {
                if (!isUploading) {
                    setIsOpen(open)
                    if (!open) resetDialog()
                }
            }}
        >
            <DialogTrigger asChild>
                <Button className="gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700">
                    <Plus className="h-4 w-4" />
                    Create New Template
                </Button>
            </DialogTrigger>
            <DialogContent
                className="sm:max-w-[600px] max-h-[85vh] overflow-hidden flex flex-col"
                showCloseButton={!isUploading}
            >
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
                            <FileText className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl">Create New Template</DialogTitle>
                            <DialogDescription>
                                Upload PDF files to create a new document template
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="space-y-6 py-4 flex-1 overflow-auto">
                    <div className="space-y-2">
                        <Label htmlFor="templateName" className="text-sm font-medium">
                            Template Name
                        </Label>
                        <Input
                            id="templateName"
                            placeholder="Enter template name..."
                            value={templateName}
                            onChange={(e) => setTemplateName(e.target.value)}
                            className="h-11"
                            disabled={isUploading}
                        />
                    </div>

                    <FileUploadZone
                        selectedFiles={selectedFiles}
                        uploadStatuses={uploadStatuses}
                        isUploading={isUploading}
                        onFilesSelect={handleFilesSelect}
                        onRemoveFile={handleRemoveFile}
                        onRemoveAllFiles={handleRemoveAllFiles}
                    />
                </div>

                <DialogFooter className="gap-2 sm:gap-0 border-t pt-4">
                    <Button
                        variant="outline"
                        onClick={handleCancel}
                        disabled={isUploading}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleCreateTemplate}
                        disabled={
                            !templateName.trim() || selectedFiles.length === 0 || isUploading
                        }
                        className="gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                    >
                        {isUploading ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Uploading...
                            </>
                        ) : (
                            <>
                                <Upload className="h-4 w-4" />
                                Upload
                                {selectedFiles.length > 0 && (
                                    <Badge
                                        variant="secondary"
                                        className="ml-1 bg-white/20 text-white"
                                    >
                                        {selectedFiles.length}
                                    </Badge>
                                )}
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default CreateTemplateDialog
