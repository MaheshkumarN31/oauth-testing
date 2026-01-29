import { useQuery } from '@tanstack/react-query'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  AlertCircle,
  CheckCircle2,
  CloudUpload,
  File,
  FileText,
  FolderOpen,
  Loader2,
  Plus,
  Search,
  Upload,
  X,
} from 'lucide-react'
import { DocsColumns } from './core/DocsColumns'
import TanStackTable from './core/TanstackTable'
import {
  AppSidebar,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from './layout/AppSidebar'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

export interface Workspace {
  _id: string
  name: string
  type: string
  status: string
  user_id: string
  application_theme: string
  created_at: Date
  updated_at: Date
  plan_type: string
  is_owner: boolean
  user_types: Array<UserType>
}

export interface UserType {
  user_type_id: string
  user_type_name: string
}

interface FileUploadStatus {
  file: File
  status: 'pending' | 'uploading' | 'success' | 'error'
  progress?: number
  error?: string
}

const Templates = () => {
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(
    null,
  )
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [templateName, setTemplateName] = useState('')
  const [selectedFiles, setSelectedFiles] = useState<Array<File>>([])
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadStatuses, setUploadStatuses] = useState<Array<FileUploadStatus>>(
    [],
  )
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    data: workspaces,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const token = localStorage.getItem('access_token')
      if (!token) throw new Error('No access token found')

      const res = await fetch(
        `${import.meta.env.VITE_PUBLIC_URL}/api/workspaces/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      if (!res.ok) {
        throw new Error('Failed to fetch user data')
      }

      return res.json()
    },
  })

  const company_id = selectedWorkspace?._id

  const {
    data: templatesData,
    isLoading: isTemplatesLoading,
    isFetching: isTemplatesFetching,
  } = useQuery({
    queryKey: ['templates', company_id, pageIndex, pageSize],
    queryFn: async () => {
      const token = localStorage.getItem('access_token')
      if (!token) throw new Error('No access token found')

      const res = await fetch(
        `${import.meta.env.VITE_PUBLIC_URL}/api/company-document-responses-v2?company_id=${company_id}&page=${
          pageIndex + 1
        }&limit=${pageSize}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      if (!res.ok) {
        throw new Error('Failed to fetch templates')
      }

      return res.json()
    },
    enabled: !!company_id,
  })

  useEffect(() => {
    if (!selectedWorkspace) {
      setSelectedWorkspace(workspaces?.data[0])
    }
  }, [workspaces])

  const handleFilesSelect = useCallback((files: FileList | Array<File>) => {
    const fileArray = Array.from(files)
    const pdfFiles = fileArray.filter(
      (file) => file.type === 'application/pdf' || file.name.endsWith('.pdf'),
    )

    if (pdfFiles.length !== fileArray.length) {
      alert('Some files were skipped. Only PDF files are allowed.')
    }

    if (pdfFiles.length > 0) {
      setSelectedFiles((prev) => [...prev, ...pdfFiles])
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const files = e.dataTransfer.files
      if (files.length > 0) {
        handleFilesSelect(files)
      }
    },
    [handleFilesSelect],
  )

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFilesSelect(files)
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const removeAllFiles = () => {
    setSelectedFiles([])
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const getPresignedUrls = async (filenames: Array<string>) => {
    const token = localStorage.getItem('access_token')
    if (!token) throw new Error('No access token found')
    if (!company_id) throw new Error('No workspace selected')

    const response = await fetch(
      `${import.meta.env.VITE_PUBLIC_URL}/api/documents-templates/processed-files`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          filenames,
          company_id: company_id,
        }),
      },
    )

    if (!response.ok) {
      throw new Error('Failed to get presigned URLs')
    }

    return response.json()
  }

  const uploadFileToS3 = async (file: File, presignedUrl: string) => {
    console.log('Uploading to S3:', { fileName: file.name, url: presignedUrl })

    try {
      const response = await fetch(presignedUrl, {
        method: 'PUT',
        body: file,
        mode: 'cors',
      })

      console.log('S3 upload response:', {
        status: response.status,
        ok: response.ok,
        statusText: response.statusText,
      })

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error')
        console.error('S3 upload failed:', errorText)
        throw new Error(`Failed to upload ${file.name}: ${response.status}`)
      }

      return true
    } catch (error) {
      console.error('S3 upload error:', error)
      throw error
    }
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
      console.log('Requesting presigned URLs for:', filenames)

      const presignedData = await getPresignedUrls(filenames)
      console.log('Presigned URL response:', presignedData)

      const { upload_urls, doc_paths } = presignedData.data || {}

      console.log('Upload URLs:', upload_urls)
      console.log('Doc paths:', doc_paths)

      if (!upload_urls || upload_urls.length !== selectedFiles.length) {
        console.error('Invalid presigned response:', {
          expectedFiles: selectedFiles.length,
          receivedUrls: upload_urls?.length,
        })
        throw new Error('Invalid response from presigned URL API')
      }

      const uploadPromises = selectedFiles.map(async (file, index) => {
        setUploadStatuses((prev) =>
          prev.map((s, i) => (i === index ? { ...s, status: 'uploading' } : s)),
        )

        try {
          await uploadFileToS3(file, upload_urls[index])

          setUploadStatuses((prev) =>
            prev.map((s, i) => (i === index ? { ...s, status: 'success' } : s)),
          )

          return { success: true, docPath: doc_paths[index] }
        } catch (error) {
          setUploadStatuses((prev) =>
            prev.map((s, i) =>
              i === index
                ? { ...s, status: 'error', error: (error as Error).message }
                : s,
            ),
          )
          return { success: false, error }
        }
      })

      const results = await Promise.all(uploadPromises)
      const successfulUploads = results.filter((r) => r.success)

      console.log('Upload results:', results)
      console.log(
        'Successful uploads:',
        successfulUploads.length,
        'Total files:',
        selectedFiles.length,
      )

      if (successfulUploads.length === selectedFiles.length) {
        const docPaths = results.map((r) => r.docPath)
        console.log('All files uploaded successfully!', {
          templateName,
          docPaths,
        })

        setIsDialogOpen(false)
        const userId = localStorage.getItem('user_id') || ''
        const searchParams = new URLSearchParams({
          user_id: userId,
          template_name: templateName,
          doc_paths: JSON.stringify(docPaths),
        })
        const navigateUrl = `/templates/add-recipients?${searchParams.toString()}`
        console.log('Navigating to:', navigateUrl)
        window.location.href = navigateUrl
      } else {
        const failedCount = selectedFiles.length - successfulUploads.length
        console.log('Some uploads failed:', failedCount)
        alert(`${failedCount} file(s) failed to upload. Please try again.`)
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload files. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const resetDialog = () => {
    setTemplateName('')
    setSelectedFiles([])
    setUploadStatuses([])
    setIsUploading(false)
  }

  const handleCancel = () => {
    setIsDialogOpen(false)
    resetDialog()
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getTotalSize = () => {
    const total = selectedFiles.reduce((acc, file) => acc + file.size, 0)
    return formatFileSize(total)
  }

  const getFileStatus = (index: number) => {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    return uploadStatuses[index]?.status || 'pending'
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

  if (isError) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-destructive">
          <AlertCircle className="h-12 w-12" />
          <p className="text-lg font-medium">Error loading data</p>
          <p className="text-sm text-muted-foreground">
            Please try again later
          </p>
        </div>
      </div>
    )
  }

  const totalTemplates = templatesData?.total || 0
  const pageCount = Math.ceil(totalTemplates / pageSize)

  return (
    <SidebarProvider>
      <AppSidebar
        workspaces={workspaces?.data}
        selectedWorkspace={selectedWorkspace}
        setSelectedWorkspace={setSelectedWorkspace}
      />
      <SidebarInset>
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <div className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5 text-indigo-500" />
              <h1 className="text-lg font-semibold">Templates</h1>
              <Badge variant="secondary" className="text-xs">
                {selectedWorkspace?.name || 'No workspace'}
              </Badge>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-4 px-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search templates..."
                className="w-64 pl-8 h-9 bg-muted/50 border-0 focus-visible:ring-1"
              />
            </div>

            {/* Create Template Dialog */}
            <Dialog
              open={isDialogOpen}
              onOpenChange={(open) => {
                if (!isUploading) {
                  setIsDialogOpen(open)
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
                      <DialogTitle className="text-xl">
                        Create New Template
                      </DialogTitle>
                      <DialogDescription>
                        Upload PDF files to create a new document template
                      </DialogDescription>
                    </div>
                  </div>
                </DialogHeader>

                <div className="space-y-6 py-4 flex-1 overflow-auto">
                  {/* Template Name Input */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="templateName"
                      className="text-sm font-medium"
                    >
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

                  {/* File Upload Area */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">
                        Upload Files
                      </Label>
                      {selectedFiles.length > 0 && (
                        <span className="text-xs text-muted-foreground">
                          {selectedFiles.length} file(s) • {getTotalSize()}
                        </span>
                      )}
                    </div>

                    {/* Dropzone - Hide when uploading */}
                    {!isUploading && (
                      <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={cn(
                          'relative cursor-pointer rounded-xl border-2 border-dashed p-6 transition-all duration-200',
                          isDragging
                            ? 'border-indigo-500 bg-indigo-500/5'
                            : 'border-muted-foreground/25 hover:border-indigo-500/50 hover:bg-muted/50',
                        )}
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".pdf"
                          multiple
                          onChange={handleFileInputChange}
                          className="hidden"
                        />
                        <div className="flex flex-col items-center gap-3">
                          <div
                            className={cn(
                              'flex h-14 w-14 items-center justify-center rounded-full transition-all',
                              isDragging ? 'bg-indigo-500/10' : 'bg-muted',
                            )}
                          >
                            <CloudUpload
                              className={cn(
                                'h-7 w-7 transition-colors',
                                isDragging
                                  ? 'text-indigo-500'
                                  : 'text-muted-foreground',
                              )}
                            />
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-medium">
                              <span className="text-indigo-500">
                                Click to upload
                              </span>{' '}
                              or drag and drop
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              PDF files only • Multiple files supported
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Selected Files List */}
                    {selectedFiles.length > 0 && (
                      <div className="space-y-2 mt-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-muted-foreground">
                            {isUploading
                              ? 'Uploading Files...'
                              : 'Selected Files'}
                          </span>
                          {!isUploading && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs text-destructive hover:text-destructive"
                              onClick={(e) => {
                                e.stopPropagation()
                                removeAllFiles()
                              }}
                            >
                              Remove All
                            </Button>
                          )}
                        </div>
                        <div className="space-y-2 max-h-[200px] overflow-auto pr-1">
                          {selectedFiles.map((file, index) => {
                            const status = getFileStatus(index)
                            return (
                              <div
                                key={`${file.name}-${index}`}
                                className={cn(
                                  'flex items-center gap-3 rounded-lg border p-3 transition-all',
                                  status === 'success'
                                    ? 'border-emerald-500/50 bg-emerald-500/10'
                                    : status === 'error'
                                      ? 'border-red-500/50 bg-red-500/10'
                                      : status === 'uploading'
                                        ? 'border-indigo-500/50 bg-indigo-500/10'
                                        : 'border-emerald-500/30 bg-emerald-500/5',
                                )}
                              >
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-red-500/10 to-red-600/10 border border-red-500/20 shrink-0">
                                  <File className="h-5 w-5 text-red-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">
                                    {file.name}
                                  </p>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-xs text-muted-foreground">
                                      {formatFileSize(file.size)}
                                    </span>
                                    {status === 'uploading' && (
                                      <span className="flex items-center gap-1 text-xs text-indigo-600">
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                        Uploading...
                                      </span>
                                    )}
                                    {status === 'success' && (
                                      <span className="flex items-center gap-1 text-xs text-emerald-600">
                                        <CheckCircle2 className="h-3 w-3" />
                                        Uploaded
                                      </span>
                                    )}
                                    {status === 'error' && (
                                      <span className="flex items-center gap-1 text-xs text-red-600">
                                        <AlertCircle className="h-3 w-3" />
                                        Failed
                                      </span>
                                    )}
                                    {status === 'pending' && !isUploading && (
                                      <span className="flex items-center gap-1 text-xs text-emerald-600">
                                        <CheckCircle2 className="h-3 w-3" />
                                        Ready
                                      </span>
                                    )}
                                  </div>
                                </div>
                                {!isUploading && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      removeFile(index)
                                    }}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
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
                      !templateName.trim() ||
                      selectedFiles.length === 0 ||
                      isUploading
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
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 space-y-6 p-6 overflow-auto">
          {/* Templates Table */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="h-10">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold">
                    All Templates
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Manage and organize your document templates
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <TanStackTable
                data={templatesData?.data || []}
                columns={DocsColumns}
                pageIndex={pageIndex}
                pageSize={pageSize}
                pageCount={pageCount}
                totalCount={totalTemplates}
                onPageChange={setPageIndex}
                onPageSizeChange={(newSize) => {
                  setPageSize(newSize)
                  setPageIndex(0)
                }}
                loading={isTemplatesLoading || isTemplatesFetching}
              />
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

export default Templates
