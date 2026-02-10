import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AlertTriangle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { deleteContactAPI, type Contact } from '@/services/api/contacts'

interface DeleteContactDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    contact: Contact | null
}

export function DeleteContactDialog({
    open,
    onOpenChange,
    contact,
}: DeleteContactDialogProps) {
    const queryClient = useQueryClient()

    const deleteMutation = useMutation({
        mutationFn: deleteContactAPI,
        onSuccess: () => {
            toast.success('Contact deleted successfully')
            queryClient.invalidateQueries({ queryKey: ['contacts'] })
            onOpenChange(false)
        },
        onError: (error: any) => {
            toast.error(error?.data?.message || 'Failed to delete contact')
        },
    })

    const handleDelete = () => {
        if (!contact) return
        deleteMutation.mutate(contact._id)
    }

    if (!contact) return null

    const fullName = `${contact.first_name} ${contact.last_name}`

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[450px]">
                <DialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                            <AlertTriangle className="h-6 w-6 text-red-600" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl">Delete Contact</DialogTitle>
                            <DialogDescription className="text-sm mt-1">
                                This action cannot be undone
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="py-4">
                    <p className="text-sm text-muted-foreground">
                        Are you sure you want to delete{' '}
                        <span className="font-semibold text-foreground">{fullName}</span>?
                        This will permanently remove the contact and all associated data.
                    </p>
                </div>

                <div className="flex items-center justify-end gap-3">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={deleteMutation.isPending}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={deleteMutation.isPending}
                        className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 min-w-[100px]"
                    >
                        {deleteMutation.isPending ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Deleting...
                            </>
                        ) : (
                            'Delete Contact'
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
