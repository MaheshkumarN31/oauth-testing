import { useState } from 'react'
import { FolderOpen } from 'lucide-react'
import { PageHeader } from '@/components/common'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TemplateColumns } from '@/components/core/TemplateColumns'
import TanStackTable from '@/components/core/TanstackTable'
import { CreateTemplateDialog } from './CreateTemplateDialog'
import { useTemplates } from '@/hooks/queries'
import type { Workspace } from '@/types'

interface TemplatesContentProps {
  selectedWorkspace: Workspace | null
}

/**
 * Templates list page content
 */
export function TemplatesContent({ selectedWorkspace }: TemplatesContentProps) {
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [searchTerm, setSearchTerm] = useState('')

  const companyId = selectedWorkspace?._id
  const userId = localStorage.getItem('user_id') || ''

  const {
    data: templatesData,
    isLoading,
    isFetching,
  } = useTemplates({
    companyId,
    page: pageIndex,
    pageSize,
  })

  const totalTemplates = templatesData?.total || 0
  const pageCount = Math.ceil(totalTemplates / pageSize)

  return (
    <>
      <PageHeader
        title="Templates"
        icon={FolderOpen}
        badge={selectedWorkspace?.name || 'No workspace'}
        searchPlaceholder="Search templates..."
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        actions={<CreateTemplateDialog companyId={companyId} userId={userId} />}
      />

      <div className="flex-1 space-y-6 p-6 overflow-auto">
        <Card className="border-0 shadow-sm">
          <CardHeader className="h-10">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold">
                  All Templates
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Manage and organize your document templates
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <TanStackTable
              data={templatesData?.data || []}
              columns={TemplateColumns}
              pageIndex={pageIndex}
              pageSize={pageSize}
              pageCount={pageCount}
              totalCount={totalTemplates}
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

export default TemplatesContent
