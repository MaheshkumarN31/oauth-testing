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
import { createContactAPI, type CreateContactPayload } from '@/services/api/contacts'

interface CreateContactDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    companyId: string
}

export function CreateContactDialog({
    open,
    onOpenChange,
    companyId,
}: CreateContactDialogProps) {
    const queryClient = useQueryClient()
    const [formData, setFormData] = useState<CreateContactPayload>({
        company_id: companyId,
        first_name: '',
        last_name: '',
        email: '',
        phone_number: '',
        middle_name: '',
        company_name: '',
        title: '',
    })

    const createMutation = useMutation({
        mutationFn: createContactAPI,
        onSuccess: () => {
            toast.success('Contact created successfully! 🎉')
            queryClient.invalidateQueries({ queryKey: ['contacts'] })
            onOpenChange(false)
            resetForm()
        },
        onError: (error: any) => {
            toast.error(error?.data?.message || 'Failed to create contact')
        },
    })

    const resetForm = () => {
        setFormData({
            company_id: companyId,
            first_name: '',
            last_name: '',
            email: '',
            phone_number: '',
            middle_name: '',
            company_name: '',
            title: '',
        })
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.first_name.trim() || !formData.last_name.trim() || !formData.email.trim()) {
            toast.error('Please fill in all required fields')
            return
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(formData.email)) {
            toast.error('Please enter a valid email address')
            return
        }

        createMutation.mutate(formData)
    }

    const handleChange = (field: keyof CreateContactPayload, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[550px] p-0 gap-0 overflow-hidden">
                {/* Header with gradient */}
                <DialogHeader className="px-6 py-5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-xl font-semibold">Create New Contact</DialogTitle>
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
                            <Label htmlFor="first_name" className="text-sm font-medium">
                                First Name <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="first_name"
                                value={formData.first_name}
                                onChange={(e) => handleChange('first_name', e.target.value)}
                                placeholder="John"
                                className="h-11"
                                required
                            />
                        </div>

                        {/* Last Name */}
                        <div className="space-y-2">
                            <Label htmlFor="last_name" className="text-sm font-medium">
                                Last Name <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="last_name"
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
                        <Label htmlFor="email" className="text-sm font-medium">
                            Email <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="email"
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
                        <Label htmlFor="phone_number" className="text-sm font-medium">
                            Phone Number
                        </Label>
                        <Input
                            id="phone_number"
                            type="tel"
                            value={formData.phone_number}
                            onChange={(e) => handleChange('phone_number', e.target.value)}
                            placeholder="+1 (555) 123-4567"
                            className="h-11"
                        />
                    </div>

                    {/* Title */}
                    <div className="space-y-2">
                        <Label htmlFor="title" className="text-sm font-medium">
                            Title
                        </Label>
                        <Input
                            id="title"
                            value={formData.title}
                            onChange={(e) => handleChange('title', e.target.value)}
                            placeholder="Software Engineer"
                            className="h-11"
                        />
                    </div>

                    {/* Company Name */}
                    <div className="space-y-2">
                        <Label htmlFor="company_name" className="text-sm font-medium">
                            Company Name
                        </Label>
                        <Input
                            id="company_name"
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
                            disabled={createMutation.isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={createMutation.isPending}
                            className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 shadow-sm min-w-[100px]"
                        >
                            {createMutation.isPending ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                'Create Contact'
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
