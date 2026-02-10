import { useState, useEffect } from 'react'
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
import { updateContactTypeAPI } from '@/services/api'
import type { ContactType } from '@/services/api/contact-types'

interface UpdateContactTypeDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    contactType: ContactType | null
}

export function UpdateContactTypeDialog({
    open,
    onOpenChange,
    contactType,
}: UpdateContactTypeDialogProps) {
    const queryClient = useQueryClient()
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        entity_type: 'INDIVIDUAL' as 'INDIVIDUAL' | 'BUSINESS',
    })

    useEffect(() => {
        if (contactType) {
            setFormData({
                name: contactType.name,
                description: contactType.description || '',
                entity_type: (contactType.entity_type as 'INDIVIDUAL' | 'BUSINESS') || 'INDIVIDUAL',
            })
        }
    }, [contactType])

    const updateMutation = useMutation({
        mutationFn: ({ id, payload }: { id: string, payload: any }) =>
            updateContactTypeAPI({ contactTypeId: id, payload }),
        onSuccess: () => {
            toast.success('Contact type updated successfully! 🎉')
            queryClient.invalidateQueries({ queryKey: ['contact-types'] })
            onOpenChange(false)
        },
        onError: (error: any) => {
            toast.error(error?.data?.message || 'Failed to update contact type')
        },
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (!contactType) return

        if (!formData.name.trim()) {
            toast.error('Please enter a contact type name')
            return
        }

        updateMutation.mutate({
            id: contactType._id,
            payload: { name: formData.name } // Only sending name as requested
        })
    }

    if (!contactType) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] p-0 gap-0 overflow-hidden">
                {/* Header with gradient */}
                <DialogHeader className="px-6 py-5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-xl font-semibold">
                            Update Contact Type
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
                        <Label htmlFor="edit-name" className="text-sm font-medium">
                            Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="edit-name"
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
                            disabled={updateMutation.isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={updateMutation.isPending}
                            className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 shadow-sm min-w-[120px]"
                        >
                            {updateMutation.isPending ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                'Update Type'
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
