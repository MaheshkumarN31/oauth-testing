import { useRef, useCallback } from 'react'
import { CloudUpload, File, X, CheckCircle2, Loader2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import type { FileUploadStatus, FileUploadStatusType } from '@/types'

interface FileUploadZoneProps {
    /** Currently selected files */
    selectedFiles: Array<File>
    /** Upload status for each file */
    uploadStatuses: Array<FileUploadStatus>
    /** Whether upload is in progress */
    isUploading: boolean
    /** Callback when files are selected */
    onFilesSelect: (files: Array<File>) => void
    /** Callback to remove a file */
    onRemoveFile: (index: number) => void
    /** Callback to remove all files */
    onRemoveAllFiles: () => void
}

/**
 * Reusable file upload zone with drag-and-drop support
 */
export function FileUploadZone({
    selectedFiles,
    uploadStatuses,
    isUploading,
    onFilesSelect,
    onRemoveFile,
    onRemoveAllFiles,
}: FileUploadZoneProps) {
    const fileInputRef = useRef<HTMLInputElement>(null)
    const isDragging = useRef(false)

    const handleFilesSelect = useCallback((files: FileList | Array<File>) => {
        const fileArray = Array.from(files)
        const pdfFiles = fileArray.filter(
            (file) => file.type === 'application/pdf' || file.name.endsWith('.pdf')
        )

        if (pdfFiles.length !== fileArray.length) {
            alert('Some files were skipped. Only PDF files are allowed.')
        }

        if (pdfFiles.length > 0) {
            onFilesSelect(pdfFiles)
        }
    }, [onFilesSelect])

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        isDragging.current = true
    }, [])

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        isDragging.current = false
    }, [])

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        isDragging.current = false
        const files = e.dataTransfer.files
        if (files.length > 0) {
            handleFilesSelect(files)
        }
    }, [handleFilesSelect])

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (files && files.length > 0) {
            handleFilesSelect(files)
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
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

    const getFileStatus = (index: number): FileUploadStatusType => {
        return uploadStatuses[index]?.status || 'pending'
    }

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Upload Files</span>
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
                        'border-muted-foreground/25 hover:border-indigo-500/50 hover:bg-muted/50'
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
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                            <CloudUpload className="h-7 w-7 text-muted-foreground" />
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-medium">
                                <span className="text-indigo-500">Click to upload</span> or drag and drop
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
                            {isUploading ? 'Uploading Files...' : 'Selected Files'}
                        </span>
                        {!isUploading && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs text-destructive hover:text-destructive"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    onRemoveAllFiles()
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
                                                    : 'border-emerald-500/30 bg-emerald-500/5'
                                    )}
                                >
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-red-500/10 to-red-600/10 border border-red-500/20 shrink-0">
                                        <File className="h-5 w-5 text-red-500" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{file.name}</p>
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
                                                onRemoveFile(index)
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
    )
}

export default FileUploadZone
