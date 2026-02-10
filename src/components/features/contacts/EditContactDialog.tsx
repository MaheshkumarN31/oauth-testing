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
import { updateContactAPI, type UpdateContactPayload, type Contact } from '@/services/api/contacts'

interface EditContactDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    contact: Contact | null
    companyId: string
}

export function EditContactDialog({
    open,
    onOpenChange,
    contact,
    companyId,
}: EditContactDialogProps) {
    const queryClient = useQueryClient()
    const [formData, setFormData] = useState<UpdateContactPayload>({
        company_id: companyId,
        first_name: '',
        last_name: '',
        email: '',
        phone_number: '',
        middle_name: '',
        company_name: '',
        title: '',
    })

    // Populate form when contact changes
    useEffect(() => {
        if (contact) {
            setFormData({
                company_id: companyId,
                first_name: contact.first_name,
                last_name: contact.last_name,
                email: contact.email,
                phone_number: contact.phone_number || '',
                middle_name: contact.middle_name || '',
                company_name: contact.company_name || '',
                title: contact.title || '',
            })
        }
    }, [contact, companyId])

    const updateMutation = useMutation({
        mutationFn: updateContactAPI,
        onSuccess: () => {
            toast.success('Contact updated successfully! ✨')
            queryClient.invalidateQueries({ queryKey: ['contacts'] })
            onOpenChange(false)
        },
        onError: (error: any) => {
            toast.error(error?.data?.message || 'Failed to update contact')
        },
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.first_name?.trim() || !formData.last_name?.trim() || !formData.email?.trim()) {
            toast.error('Please fill in all required fields')
            return
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(formData.email)) {
            toast.error('Please enter a valid email address')
            return
        }

        if (!contact) return

        updateMutation.mutate({
            contact_id: contact._id,
            payload: formData,
        })
    }

    const handleChange = (field: keyof UpdateContactPayload, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
    }

    if (!contact) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[550px] p-0 gap-0 overflow-hidden">
                {/* Header with gradient */}
                <DialogHeader className="px-6 py-5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-xl font-semibold">Edit Contact</DialogTitle>
                        <button
                            onClick={() => onOpenChange(false)}
                            className="h-8 w-8 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </DialogHeader>

                {/* Form */}
                <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5 max-h-[calc(100vh-200px)] overflow-y-auto">
                    <div className="grid grid-cols-2 gap-4">
                        {/* First Name */}
                        <div className="space-y-2">
                            <Label htmlFor="edit_first_name" className="text-sm font-medium">
                                First Name <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="edit_first_name"
                                value={formData.first_name}
                                onChange={(e) => handleChange('first_name', e.target.value)}
                                placeholder="John"
                                className="h-11"
                                required
                            />
                        </div>

                        {/* Last Name */}
                        <div className="space-y-2">
                            <Label htmlFor="edit_last_name" className="text-sm font-medium">
                                Last Name <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="edit_last_name"
                                value={formData.last_name}
                                onChange={(e) => handleChange('last_name', e.target.value)}
                                placeholder="Doe"
                                className="h-11"
                                required
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                        <Label htmlFor="edit_email" className="text-sm font-medium">
                            Email <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="edit_email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleChange('email', e.target.value)}
                            placeholder="john.doe@example.com"
                            className="h-11"
                            required
                        />
                    </div>

                    {/* Phone Number */}
                    <div className="space-y-2">
                        <Label htmlFor="edit_phone_number" className="text-sm font-medium">
                            Phone Number
                        </Label>
                        <Input
                            id="edit_phone_number"
                            type="tel"
                            value={formData.phone_number}
                            onChange={(e) => handleChange('phone_number', e.target.value)}
                            placeholder="+1 (555) 123-4567"
                            className="h-11"
                        />
                    </div>

                    {/* Title */}
                    <div className="space-y-2">
                        <Label htmlFor="edit_title" className="text-sm font-medium">
                            Title
                        </Label>
                        <Input
                            id="edit_title"
                            value={formData.title}
                            onChange={(e) => handleChange('title', e.target.value)}
                            placeholder="Software Engineer"
                            className="h-11"
                        />
                    </div>

                    {/* Company Name */}
                    <div className="space-y-2">
                        <Label htmlFor="edit_company_name" className="text-sm font-medium">
                            Company Name
                        </Label>
                        <Input
                            id="edit_company_name"
                            value={formData.company_name}
                            onChange={(e) => handleChange('company_name', e.target.value)}
                            placeholder="Acme Inc."
                            className="h-11"
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
                            className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-sm min-w-[100px]"
                        >
                            {updateMutation.isPending ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                'Update Contact'
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
