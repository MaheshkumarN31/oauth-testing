import { useState, useEffect } from 'react'
import { Building2, Loader2, X } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { useUpdateWorkspace } from '@/hooks/queries/useWorkspaces'

interface EditWorkspaceDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    workspace: {
        _id: string
        name: string
        description?: string
        status?: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED'
    } | null
}

export function EditWorkspaceDialog({
    open,
    onOpenChange,
    workspace,
}: EditWorkspaceDialogProps) {
    const updateWorkspaceMutation = useUpdateWorkspace()

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE' | 'ARCHIVED',
    })

    // Reset form when workspace changes
    useEffect(() => {
        if (workspace && open) {
            setFormData({
                name: workspace.name || '',
                description: workspace.description || '',
                status: workspace.status || 'ACTIVE',
            })
        }
    }, [workspace, open])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!workspace) return

        try {
            // Update all fields in a single PATCH call
            await updateWorkspaceMutation.mutateAsync({
                workspaceId: workspace._id,
                payload: {
                    name: formData.name,
                    description: formData.description,
                    status: formData.status,
                },
            })

            onOpenChange(false)
        } catch {
            // Error handled by mutation
        }
    }

    const isLoading = updateWorkspaceMutation.isPending

    if (!workspace) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] p-0 gap-0 overflow-hidden">
                {/* Header with gradient */}
                <DialogHeader className="px-6 py-5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                                <Building2 className="h-5 w-5 text-white" />
                            </div>
                            <DialogTitle className="text-xl font-semibold text-white">
                                Edit Workspace
                            </DialogTitle>
                        </div>
                        <button
                            onClick={() => onOpenChange(false)}
                            className="h-8 w-8 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </DialogHeader>

                {/* Form */}
                <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5">
                    {/* Name */}
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-medium">
                            Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) =>
                                setFormData((prev) => ({ ...prev, name: e.target.value }))
                            }
                            placeholder="Enter workspace name"
                            className="h-11"
                            required
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description" className="text-sm font-medium">
                            Description
                        </Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    description: e.target.value,
                                }))
                            }
                            placeholder="Enter workspace description (optional)"
                            rows={3}
                            className="resize-none"
                        />
                    </div>

                    {/* Status */}
                    <div className="space-y-2">
                        <Label htmlFor="status" className="text-sm font-medium">
                            Status
                        </Label>
                        <Select
                            value={formData.status}
                            onValueChange={(value: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED') =>
                                setFormData((prev) => ({ ...prev, status: value }))
                            }
                        >
                            <SelectTrigger className="h-11">
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ACTIVE">
                                    <div className="flex items-center gap-2">
                                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                        Active
                                    </div>
                                </SelectItem>
                                <SelectItem value="INACTIVE">
                                    <div className="flex items-center gap-2">
                                        <span className="h-2 w-2 rounded-full bg-amber-500" />
                                        Inactive
                                    </div>
                                </SelectItem>
                                <SelectItem value="ARCHIVED">
                                    <div className="flex items-center gap-2">
                                        <span className="h-2 w-2 rounded-full bg-slate-400" />
                                        Archived
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 min-w-[120px]"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                'Save Changes'
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export default EditWorkspaceDialog
