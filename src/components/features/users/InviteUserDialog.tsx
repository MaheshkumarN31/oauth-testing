import { useState } from 'react'
import { Loader2, Mail, UserPlus, X } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useInviteUser } from '@/hooks/queries/useUsers'
import { useUserTypes } from '@/hooks/queries/useUserTypes'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import type { UserType } from '@/services/api/user-types'

interface InviteUserDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    companyId: string | undefined
}

export function InviteUserDialog({ open, onOpenChange, companyId }: InviteUserDialogProps) {
    const inviteUserMutation = useInviteUser()
    const { data: userTypes, isLoading: isLoadingTypes } = useUserTypes({ company_id: companyId || '' })

    const [formData, setFormData] = useState({
        email: '',
        first_name: '',
        last_name: '',
        role: 'MEMBER',
        user_type_id: '',
    })

    const resetForm = () => {
        setFormData({
            email: '',
            first_name: '',
            last_name: '',
            role: 'MEMBER',
            user_type_id: '',
        })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.email.trim()) return

        const fullName = `${formData.first_name} ${formData.last_name}`.trim() || formData.email.split('@')[0]

        inviteUserMutation.mutate(
            {
                name: fullName,
                email: formData.email,
                first_name: formData.first_name || undefined,
                last_name: formData.last_name || undefined,
                role: formData.role,
                roles: [formData.role],
                user_type: formData.user_type_id ? [formData.user_type_id] : [],
                user_type_id: formData.user_type_id || undefined,
                company_id: companyId,
                permissions: [],
                workspaces: companyId ? [companyId] : [],
                groups: [],
                departments: [],
                locations: [],
                branches: [],
                tags: [],
                workspace_ids: companyId ? [companyId] : [],
                group_ids: [],
                department_ids: [],
                location_ids: [],
                branch_ids: [],
            },
            {
                onSuccess: () => {
                    resetForm()
                    onOpenChange(false)
                },
            },
        )
    }

    const isLoading = inviteUserMutation.isPending

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] p-0 gap-0 overflow-hidden">
                <DialogHeader className="px-6 py-5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                                <UserPlus className="h-5 w-5 text-white" />
                            </div>
                            <DialogTitle className="text-xl font-semibold text-white">
                                Invite User
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

                <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="first_name">First Name</Label>
                            <Input
                                id="first_name"
                                value={formData.first_name}
                                onChange={(e) =>
                                    setFormData((prev) => ({ ...prev, first_name: e.target.value }))
                                }
                                placeholder="John"
                                className="h-10"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="last_name">Last Name</Label>
                            <Input
                                id="last_name"
                                value={formData.last_name}
                                onChange={(e) =>
                                    setFormData((prev) => ({ ...prev, last_name: e.target.value }))
                                }
                                placeholder="Doe"
                                className="h-10"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">
                            Email Address <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) =>
                                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                                }
                                placeholder="john@example.com"
                                className="pl-9 h-10"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="role">System Role</Label>
                            <Select
                                value={formData.role}
                                onValueChange={(value) =>
                                    setFormData((prev) => ({ ...prev, role: value }))
                                }
                            >
                                <SelectTrigger className="h-10">
                                    <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ADMIN">Admin</SelectItem>
                                    <SelectItem value="MEMBER">Member</SelectItem>
                                    <SelectItem value="VIEWER">Viewer</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="user_type">User Type</Label>
                            <Select
                                value={formData.user_type_id}
                                onValueChange={(value) =>
                                    setFormData((prev) => ({ ...prev, user_type_id: value }))
                                }
                            >
                                <SelectTrigger className="h-10">
                                    <SelectValue placeholder={isLoadingTypes ? "Loading..." : "Select Type"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {userTypes?.map((type: UserType) => (
                                        <SelectItem key={type.id} value={type.id}>
                                            {type.name}
                                        </SelectItem>
                                    ))}
                                    {(!userTypes || userTypes.length === 0) && (
                                        <div className="p-2 text-xs text-muted-foreground text-center">
                                            No types found
                                        </div>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

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
                            disabled={isLoading || !formData.email.trim()}
                            className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 min-w-[120px]"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Inviting...
                                </>
                            ) : (
                                'Send Invite'
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
