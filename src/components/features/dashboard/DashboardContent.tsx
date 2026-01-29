import { useState } from 'react'
import { LayoutDashboard } from 'lucide-react'
import { PageHeader } from '@/components/common'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DashboardStats } from './DashboardStats'
import { DocsColumns } from '@/components/core/DocsColumns'
import TanStackTable from '@/components/core/TanstackTable'
import { useDocuments, calculateDocumentStats } from '@/hooks/queries'
import type { Workspace } from '@/types'

interface DashboardContentProps {
    selectedWorkspace: Workspace | null
}

/**
 * Dashboard page content with stats and documents table
 */
export function DashboardContent({ selectedWorkspace }: DashboardContentProps) {
    const [pageIndex, setPageIndex] = useState(0)
    const [pageSize, setPageSize] = useState(10)
    const [searchTerm, setSearchTerm] = useState('')

    const companyId = selectedWorkspace?._id

    const { data: documentsData, isLoading, isFetching } = useDocuments({
        companyId,
        page: pageIndex,
        pageSize,
    })

    const stats = calculateDocumentStats(documentsData?.data)
    const totalDocs = documentsData?.total || 0
    const pageCount = Math.ceil(totalDocs / pageSize)

    return (
        <>
            <PageHeader
                title="Dashboard"
                icon={LayoutDashboard}
                badge={selectedWorkspace?.name || 'No workspace'}
                searchPlaceholder="Search documents..."
                searchValue={searchTerm}
                onSearchChange={setSearchTerm}
            />

            <div className="flex-1 space-y-6 p-6 overflow-auto">
                <DashboardStats
                    total={totalDocs}
                    pending={stats.pending}
                    completed={stats.completed}
                    draft={stats.draft}
                />

                <Card className="border-0 shadow-sm">
                    <CardHeader className="h-10">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-lg font-semibold">
                                    Recent Documents
                                </CardTitle>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Manage and track your documents
                                </p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <TanStackTable
                            data={documentsData?.data || []}
                            columns={DocsColumns}
                            pageIndex={pageIndex}
                            pageSize={pageSize}
                            pageCount={pageCount}
                            totalCount={totalDocs}
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
        </>
    )
}

export default DashboardContent
