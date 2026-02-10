import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { X, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
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
import { createContactTypeAPI } from '@/services/api'

interface CreateContactTypeDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    companyId: string
}

export function CreateContactTypeDialog({
    open,
    onOpenChange,
    companyId,
}: CreateContactTypeDialogProps) {
    const queryClient = useQueryClient()
    const [formData, setFormData] = useState({
        company_id: companyId,
        name: '',
        description: '',
        entity_type: 'INDIVIDUAL' as 'INDIVIDUAL' | 'BUSINESS',
    })

    const createMutation = useMutation({
        mutationFn: createContactTypeAPI,
        onSuccess: () => {
            toast.success('Contact type created successfully! 🎉')
            queryClient.invalidateQueries({ queryKey: ['contact-types'] })
            onOpenChange(false)
            resetForm()
        },
        onError: (error: any) => {
            toast.error(error?.data?.message || 'Failed to create contact type')
        },
    })

    const resetForm = () => {
        setFormData({
            company_id: companyId,
            name: '',
            description: '',
            entity_type: 'INDIVIDUAL',
        })
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.name.trim()) {
            toast.error('Please enter a contact type name')
            return
        }

        createMutation.mutate(formData)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] p-0 gap-0 overflow-hidden">
                {/* Header with gradient */}
                <DialogHeader className="px-6 py-5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-xl font-semibold">
                            Create Contact Type
                        </DialogTitle>
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
                            placeholder="e.g., Customer, Vendor, Partner"
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
                            disabled={createMutation.isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={createMutation.isPending}
                            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-sm min-w-[120px]"
                        >
                            {createMutation.isPending ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                'Create Type'
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
