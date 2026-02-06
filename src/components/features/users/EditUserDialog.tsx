import { useState, useEffect } from 'react'
import { Loader2, Mail, UserCog, X } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useUpdateUser } from '@/hooks/queries/useUsers'
import { useUserTypes } from '@/hooks/queries/useUserTypes'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import type { User } from '@/types'
import type { UserType } from '@/services/api/user-types'

interface EditUserDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    user: User | null
    companyId: string | undefined
}

export function EditUserDialog({ open, onOpenChange, user, companyId }: EditUserDialogProps) {
    const updateUserMutation = useUpdateUser()
    const { data: userTypes, isLoading: isLoadingTypes } = useUserTypes({ company_id: companyId || '' })

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        role: 'MEMBER',
        user_type_id: '',
    })

    useEffect(() => {
        if (user) {
            setFormData({
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                role: user.role || 'MEMBER',
                user_type_id: user.user_type_id || '',
            })
        }
    }, [user])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user) return

        updateUserMutation.mutate(
            {
                userId: user.id,
                payload: {
                    first_name: formData.first_name,
                    last_name: formData.last_name,
                    role: formData.role,
                    user_type_id: formData.user_type_id || undefined,
                },
            },
            {
                onSuccess: () => {
                    onOpenChange(false)
                },
            },
        )
    }

    const isLoading = updateUserMutation.isPending

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] p-0 gap-0 overflow-hidden">
                <DialogHeader className="px-6 py-5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                                <UserCog className="h-5 w-5 text-white" />
                            </div>
                            <DialogTitle className="text-xl font-semibold text-white">
                                Edit User
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
                            <Label htmlFor="edit_first_name">First Name</Label>
                            <Input
                                id="edit_first_name"
                                value={formData.first_name}
                                onChange={(e) =>
                                    setFormData((prev) => ({ ...prev, first_name: e.target.value }))
                                }
                                placeholder="John"
                                className="h-10"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit_last_name">Last Name</Label>
                            <Input
                                id="edit_last_name"
                                value={formData.last_name}
                                onChange={(e) =>
                                    setFormData((prev) => ({ ...prev, last_name: e.target.value }))
                                }
                                placeholder="Doe"
                                className="h-10"
                            />
                        </div>
                    </div>

                    <div className="space-y-2 opacity-70">
                        <Label htmlFor="edit_email">Email Address</Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="edit_email"
                                type="email"
                                value={user?.email || ''}
                                readOnly
                                className="pl-9 h-10 bg-muted cursor-not-allowed"
                            />
                        </div>
                        <p className="text-[10px] text-muted-foreground">Email cannot be changed.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit_role">System Role</Label>
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
                            <Label htmlFor="edit_user_type">User Type</Label>
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
                            disabled={isLoading}
                            className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 min-w-[120px]"
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
