import { useState } from 'react'
import { Plus, Search, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useUserTypes } from '@/hooks/queries/useUserTypes'
import { UserTypeCard } from './UserTypeCard'
import { CreateUserTypeDialog } from './CreateUserTypeDialog'
import { EditUserTypeDialog } from './EditUserTypeDialog'
import { DeleteUserTypeDialog } from './DeleteUserTypeDialog'
import type { UserType } from '@/services/api/user-types'
import { Skeleton } from '@/components/ui/skeleton'

interface UserTypesContentProps {
    companyId?: string
}

export function UserTypesContent({ companyId }: UserTypesContentProps) {
    const [search, setSearch] = useState('')
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [editingType, setEditingType] = useState<UserType | null>(null)
    const [deletingType, setDeletingType] = useState<UserType | null>(null)

    const { data: userTypes, isLoading } = useUserTypes({
        search: search || undefined,
        company_id: companyId || '',
    })

    if (!companyId) {
        return (
            <div className="flex h-[calc(100vh-4rem)] items-center justify-center p-6">
                <div className="text-center">
                    <ShieldCheck className="mx-auto h-12 w-12 text-muted-foreground/50" />
                    <h3 className="mt-4 text-lg font-semibold">No Workspace Selected</h3>
                    <p className="mt-2 text-sm text-muted-foreground">Please select a workspace to view user types.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex h-[calc(100vh-4rem)] flex-col gap-6 p-6">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">User Types</h1>
                    <p className="text-muted-foreground">
                        Define roles and permissions for your team members.
                    </p>
                </div>
                <Button
                    onClick={() => setIsCreateOpen(true)}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-md"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Create User Type
                </Button>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1 md:max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search user types..."
                        className="pl-9 bg-background/50"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="flex flex-col space-y-3">
                                <Skeleton className="h-[125px] w-full rounded-xl" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-[250px]" />
                                    <Skeleton className="h-4 w-[200px]" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : userTypes?.length === 0 ? (
                    <div className="flex h-[400px] flex-col items-center justify-center rounded-lg border border-dashed bg-background/50 p-8 text-center animate-in fade-in-50">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                            <ShieldCheck className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <h3 className="mt-4 text-lg font-semibold">No user types found</h3>
                        <p className="mb-4 mt-2 text-sm text-muted-foreground">
                            Create a new user type to get started.
                        </p>
                        <Button onClick={() => setIsCreateOpen(true)} variant="outline">
                            <Plus className="mr-2 h-4 w-4" />
                            Create First Type
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 animate-in fade-in-50">
                        {userTypes?.map((type: UserType) => (
                            <UserTypeCard
                                key={type.id}
                                userType={type}
                                onEdit={setEditingType}
                                onDelete={setDeletingType}
                            />
                        ))}
                    </div>
                )}
            </div>

            <CreateUserTypeDialog
                open={isCreateOpen}
                onOpenChange={setIsCreateOpen}
                companyId={companyId}
            />

            <EditUserTypeDialog
                open={!!editingType}
                onOpenChange={(open) => !open && setEditingType(null)}
                userType={editingType}
            />

            <DeleteUserTypeDialog
                open={!!deletingType}
                onOpenChange={(open) => !open && setDeletingType(null)}
                userType={deletingType}
            />
        </div>
    )
}
