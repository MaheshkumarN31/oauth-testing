import { useState } from 'react'
import { Tag, Plus } from 'lucide-react'
import type { Workspace } from '@/types'
import { PageHeader } from '@/components/common'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import TanStackTable from '@/components/core/TanstackTable'
import { createContactTypesColumns } from '@/components/core/ContactTypesColumns'
import { useContactTypes } from '@/hooks/queries/useContactTypes'
import { CreateContactTypeDialog } from './CreateContactTypeDialog'
import { DeleteContactTypeDialog } from './DeleteContactTypeDialog'
import { UpdateContactTypeDialog } from './UpdateContactTypeDialog'

interface ContactType {
    _id: string
    name: string
    type: string
    entity_type: string
    description?: string
    created_at: string
}

interface ContactTypesContentProps {
    selectedWorkspace: Workspace | null
}

export function ContactTypesContent({ selectedWorkspace }: ContactTypesContentProps) {
    const [pageIndex, setPageIndex] = useState(0)
    const [pageSize, setPageSize] = useState(10)
    const [searchTerm, setSearchTerm] = useState('')

    // Dialog states
    const [createDialogOpen, setCreateDialogOpen] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [updateDialogOpen, setUpdateDialogOpen] = useState(false)
    const [selectedContactType, setSelectedContactType] = useState<ContactType | null>(null)

    const companyId = selectedWorkspace?._id || ''

    // Fetch contact types
    const {
        data: contactTypes = [],
        isLoading,
        isFetching,
    } = useContactTypes(companyId)

    const contactTypesData = contactTypes || []

    // Filter contact types by search term (client-side filtering)
    const filteredContactTypes = searchTerm
        ? contactTypesData.filter((ct: ContactType) => {
            const searchLower = searchTerm.toLowerCase()
            const name = ct.name.toLowerCase()
            const description = (ct.description || '').toLowerCase()
            return name.includes(searchLower) || description.includes(searchLower)
        })
        : contactTypesData

    // Client-side pagination
    const paginatedData = filteredContactTypes.slice(
        pageIndex * pageSize,
        (pageIndex + 1) * pageSize
    )

    const totalContactTypes = filteredContactTypes.length
    const pageCount = Math.ceil(totalContactTypes / pageSize)

    // Handle delete
    const handleDelete = (contactType: ContactType) => {
        setSelectedContactType(contactType)
        setDeleteDialogOpen(true)
    }

    // Handle edit
    const handleEdit = (contactType: ContactType) => {
        // @ts-ignore - ignoring type mismatch for now as the API response structure might differ slightly
        setSelectedContactType(contactType)
        setUpdateDialogOpen(true)
    }

    // Create columns with callbacks
    const columns = createContactTypesColumns({
        onDelete: handleDelete,
        onEdit: handleEdit,
    })

    return (
        <>
            <PageHeader
                title="Contact Types"
                icon={Tag}
                badge={selectedWorkspace?.name || 'No workspace'}
                searchPlaceholder="Search contact types..."
                searchValue={searchTerm}
                onSearchChange={setSearchTerm}
            />

            <div className="flex-1 space-y-6 p-6 overflow-auto">
                <Card className="border-0 shadow-sm">
                    <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-lg font-semibold">
                                    All Contact Types
                                </CardTitle>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Manage contact type categories for your organization
                                </p>
                            </div>
                            <Button
                                onClick={() => setCreateDialogOpen(true)}
                                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-sm"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Create Contact Type
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <TanStackTable
                            data={paginatedData}
                            columns={columns}
                            pageIndex={pageIndex}
                            pageSize={pageSize}
                            pageCount={pageCount}
                            totalCount={totalContactTypes}
                            onPageChange={setPageIndex}
                            onPageSizeChange={(newSize) => {
                                setPageSize(newSize)
                                setPageIndex(0)
                            }}
                            loading={isLoading || isFetching}
                        />
                    </CardContent>
                </Card>
            </div>

            {/* Dialogs */}
            <CreateContactTypeDialog
                open={createDialogOpen}
                onOpenChange={setCreateDialogOpen}
                companyId={companyId}
            />

            <DeleteContactTypeDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                contactType={selectedContactType}
            />

            <UpdateContactTypeDialog
                open={updateDialogOpen}
                onOpenChange={setUpdateDialogOpen}
                contactType={selectedContactType as any}
            />
        </>
    )
}

export default ContactTypesContent
