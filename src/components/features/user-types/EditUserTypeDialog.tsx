import { useState, useEffect } from 'react'
import { Loader2, ShieldCheck, X } from 'lucide-react'
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
import { useUpdateUserType } from '@/hooks/queries/useUserTypes'
import { Badge } from '@/components/ui/badge'
import type { UserType } from '@/services/api/user-types'

interface EditUserTypeDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    userType: UserType | null
}

export function EditUserTypeDialog({ open, onOpenChange, userType }: EditUserTypeDialogProps) {
    const updateUserTypeMutation = useUpdateUserType()

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        currentPermission: '',
        permissions: [] as string[],
    })

    useEffect(() => {
        if (userType) {
            setFormData({
                name: userType.name,
                description: userType.description || '',
                currentPermission: '',
                permissions: [...(userType.permissions || [])],
            })
        }
    }, [userType])

    const addPermission = () => {
        if (formData.currentPermission.trim() && !formData.permissions.includes(formData.currentPermission.trim())) {
            setFormData(prev => ({
                ...prev,
                permissions: [...prev.permissions, prev.currentPermission.trim()],
                currentPermission: ''
            }))
        }
    }

    const removePermission = (perm: string) => {
        setFormData(prev => ({
            ...prev,
            permissions: prev.permissions.filter(p => p !== perm)
        }))
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            addPermission()
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!userType || !formData.name.trim()) return

        updateUserTypeMutation.mutate(
            {
                userTypeId: userType.id,
                payload: {
                    name: formData.name,
                    description: formData.description || undefined,
                    permissions: formData.permissions,
                },
            },
            {
                onSuccess: () => {
                    onOpenChange(false)
                },
            },
        )
    }

    const isLoading = updateUserTypeMutation.isPending

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[550px] p-0 gap-0 overflow-hidden">
                <DialogHeader className="px-6 py-5 bg-gradient-to-r from-orange-400 to-red-500 text-white">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                                <ShieldCheck className="h-5 w-5 text-white" />
                            </div>
                            <DialogTitle className="text-xl font-semibold text-white">
                                Edit User Type
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
                    <div className="space-y-2">
                        <Label htmlFor="edit-name">
                            Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="edit-name"
                            value={formData.name}
                            onChange={(e) =>
                                setFormData((prev) => ({ ...prev, name: e.target.value }))
                            }
                            className="h-10"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="edit-description">Description</Label>
                        <Textarea
                            id="edit-description"
                            value={formData.description}
                            onChange={(e) =>
                                setFormData((prev) => ({ ...prev, description: e.target.value }))
                            }
                            className="min-h-[80px]"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="edit-permissions">Permissions</Label>
                        <div className="flex gap-2">
                            <Input
                                id="edit-permissions"
                                value={formData.currentPermission}
                                onChange={(e) =>
                                    setFormData((prev) => ({ ...prev, currentPermission: e.target.value }))
                                }
                                onKeyDown={handleKeyDown}
                                placeholder="e.g. view_reports"
                                className="h-10"
                            />
                            <Button type="button" onClick={addPermission} variant="secondary">
                                Add
                            </Button>
                        </div>

                        {formData.permissions.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3 p-3 bg-muted/30 rounded-md">
                                {formData.permissions.map((perm) => (
                                    <Badge key={perm} variant="secondary" className="flex items-center gap-1">
                                        {perm}
                                        <X
                                            className="h-3 w-3 cursor-pointer hover:text-destructive"
                                            onClick={() => removePermission(perm)}
                                        />
                                    </Badge>
                                ))}
                            </div>
                        )}
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
                            disabled={isLoading || !formData.name.trim()}
                            className="bg-gradient-to-r from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 min-w-[140px]"
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
