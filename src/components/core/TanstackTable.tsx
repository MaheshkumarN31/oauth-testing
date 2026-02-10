import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useState } from 'react'
import { ChevronLeft, ChevronRight, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'

interface TanStackTableProps {
  data: Array<any>
  columns: Array<any>
  pageIndex: number
  pageSize: number
  pageCount?: number
  totalCount?: number
  onPageChange: (newPageIndex: number) => void
  onPageSizeChange: (newPageSize: number) => void
  loading?: boolean
}

export default function TanStackTable({
  data,
  columns,
  pageIndex,
  pageSize,
  pageCount,
  totalCount = 0,
  onPageChange,
  onPageSizeChange,
  loading = false,
}: TanStackTableProps) {
  const [gotoPage, setGotoPage] = useState('')

  const table = useReactTable({
    data,
    columns,
    pageCount,
    state: {
      pagination: {
        pageIndex,
        pageSize,
      },
    },
    onPaginationChange: (updater) => {
      const newState =
        typeof updater === 'function'
          ? updater({ pageIndex, pageSize })
          : updater
      onPageChange(newState.pageIndex)
    },
    manualPagination: true,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  const renderLoadingRows = () => {
    return Array.from({ length: 5 }).map((_, index) => (
      <tr key={index} className="animate-pulse">
        <td className="px-4 py-3">
          <Skeleton className="h-4 w-8" />
        </td>
        {columns.map((_, colIndex) => (
          <td key={colIndex} className="px-4 py-3">
            <Skeleton className="h-4 w-full max-w-[200px]" />
          </td>
        ))}
      </tr>
    ))
  }

  const renderEmptyState = () => (
    <tr>
      <td colSpan={columns.length + 1} className="text-center py-16">
        <div className="flex flex-col items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
            <FileText className="h-6 w-6 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">
              No documents found
            </p>
            <p className="text-sm text-muted-foreground">
              Create a new document to get started
            </p>
          </div>
        </div>
      </td>
    </tr>
  )

  return (
    <div className="flex flex-col">
      <div className={`overflow-auto max-h-[calc(100vh-460px)]`}>
        <table className="min-w-full">
          <thead className="sticky top-0 z-10">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className="bg-muted/50 border-y border-border"
              >
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider w-16">
                  #
                </th>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody className="divide-y divide-border">
            {loading
              ? renderLoadingRows()
              : data.length === 0
                ? renderEmptyState()
                : table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      className="group transition-colors hover:bg-muted/50"
                    >
                      {/* S.No cell */}
                      <td className="px-4 py-3 text-sm text-muted-foreground font-medium">
                        {pageIndex * pageSize + row.index + 1}
                      </td>

                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-4 py-3 text-sm">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
          </tbody>
        </table>
      </div>

      <div className="border-t bg-muted/30 px-4 py-3 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-sm text-muted-foreground order-3 md:order-1">
          Showing{' '}
          <span className="font-medium text-foreground">
            {data.length === 0 ? 0 : pageIndex * pageSize + 1}
          </span>{' '}
          to{' '}
          <span className="font-medium text-foreground">
            {Math.min((pageIndex + 1) * pageSize, totalCount)}
          </span>{' '}
          of <span className="font-medium text-foreground">{totalCount}</span>{' '}
          results
        </div>

        <div className="flex items-center gap-2 order-1 md:order-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(pageIndex - 1)}
            disabled={pageIndex === 0}
            className="h-8 px-2"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline ml-1">Previous</span>
          </Button>

          <div className="flex items-center gap-1 px-2">
            <span className="text-sm text-muted-foreground">Page</span>
            <span className="text-sm font-medium">{pageIndex + 1}</span>
            <span className="text-sm text-muted-foreground">of</span>
            <span className="text-sm font-medium">{pageCount || 1}</span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(pageIndex + 1)}
            disabled={pageCount !== undefined && pageIndex + 1 >= pageCount}
            className="h-8 px-2"
          >
            <span className="hidden sm:inline mr-1">Next</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-4 order-2 md:order-3">
          <div className="flex items-center gap-2">
            <Input
              type="number"
              className="w-16 h-8 text-sm"
              value={gotoPage}
              onChange={(e) => setGotoPage(e.target.value)}
              placeholder="Go"
              min={1}
            />
            <Button
              variant="outline"
              size="sm"
              className="h-8"
              onClick={() => {
                const page = parseInt(gotoPage, 10) - 1
                if (
                  !isNaN(page) &&
                  page >= 0 &&
                  page < (pageCount ?? Infinity)
                ) {
                  onPageChange(page)
                  setGotoPage('')
                }
              }}
            >
              Go
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground hidden sm:inline">
              Rows:
            </span>
            <Select
              value={String(pageSize)}
              onValueChange={(value) => {
                onPageSizeChange(Number(value))
                setGotoPage('')
              }}
            >
              <SelectTrigger className="w-[70px] h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[10, 25, 50, 100].map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  )
}
