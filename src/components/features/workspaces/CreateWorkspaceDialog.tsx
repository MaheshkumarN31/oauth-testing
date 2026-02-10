import { useState } from 'react'
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
import { useCreateWorkspace } from '@/hooks/queries/useWorkspaces'

interface CreateWorkspaceDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function CreateWorkspaceDialog({
    open,
    onOpenChange,
}: CreateWorkspaceDialogProps) {
    const createWorkspaceMutation = useCreateWorkspace()

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        website: '',
        email: '',
        phone: '',
        address: '',
        size: '',
        industry_type: '',
    })

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            website: '',
            email: '',
            phone: '',
            address: '',
            size: '',
            industry_type: '',
        })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.name.trim()) {
            return
        }

        createWorkspaceMutation.mutate(
            {
                name: formData.name,
                description: formData.description || undefined,
                website: formData.website || undefined,
                email: formData.email || undefined,
                phone: formData.phone || undefined,
                address: formData.address || undefined,
                size: formData.size || undefined,
                industry_type: formData.industry_type || undefined,
            },
            {
                onSuccess: () => {
                    resetForm()
                    onOpenChange(false)
                },
            },
        )
    }

    const isLoading = createWorkspaceMutation.isPending

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[550px] p-0 gap-0 overflow-hidden max-h-[90vh]">
                {/* Header with gradient */}
                <DialogHeader className="px-6 py-5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                                <Building2 className="h-5 w-5 text-white" />
                            </div>
                            <DialogTitle className="text-xl font-semibold text-white">
                                Create Workspace
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
                <form
                    onSubmit={handleSubmit}
                    className="px-6 py-6 space-y-5 overflow-y-auto max-h-[60vh]"
                >
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
                            disabled={isLoading || !formData.name.trim()}
                            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 min-w-[140px]"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                'Create Workspace'
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export default CreateWorkspaceDialog
