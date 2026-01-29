import React, { useEffect, useState } from 'react'
import {
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  Pagination as ShadCNPagination,
} from '../ui/pagination'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import { Input } from '../ui/input'
import type { DynamicPaginationProps } from '@/lib/interfaces/core/iTable'

const Pagination = ({
  capturePageNum,
  captureRowPerItems,
  initialPage = 1,
  limitOptionsFromProps,
  paginationDetails,
}: DynamicPaginationProps) => {
  const [currentPage, setCurrentPage] = useState<number>(initialPage)
  const [pageValue, setPageValue] = useState<number>(initialPage)
  const [limitOptions, setLimitOptions] = useState<
    Array<{ title: string; value: number }>
  >([])
  const [pageNumFocused, setPageNumFocused] = useState(false)

  const totalPages = paginationDetails ? paginationDetails.total_pages : 1
  const selectedValue = paginationDetails?.limit

  useEffect(() => {
    setLimitOptions(
      limitOptionsFromProps?.length
        ? limitOptionsFromProps
        : [
            { title: '25/page', value: 25 },
            { title: '50/page', value: 50 },
            { title: '100/page', value: 100 },
            { title: '200/page', value: 200 },
          ],
    )
  }, [limitOptionsFromProps])

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
      setPageValue(page)
      capturePageNum(page)
    }
  }

  const handleRowChange = (newLimit: string) => {
    captureRowPerItems(Number(newLimit))
  }

  const onKeyDownInPageChange = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const page = Math.max(1, Math.min(Number(pageValue) || 1, totalPages))
      handlePageChange(page)
    }
  }

  useEffect(() => {
    if (paginationDetails?.page) {
      setPageValue(paginationDetails.page)
      setCurrentPage(paginationDetails.page)
    }
  }, [paginationDetails])

  const getPageNumbers = () => {
    const pageNumbers = []
    const maxVisiblePages = 5

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i)
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pageNumbers.push(i)
        }
        pageNumbers.push(null)
        pageNumbers.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        pageNumbers.push(1)
        pageNumbers.push(null)
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pageNumbers.push(i)
        }
      } else {
        pageNumbers.push(1)
        pageNumbers.push(null)
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pageNumbers.push(i)
        }
        pageNumbers.push(null)
        pageNumbers.push(totalPages)
      }
    }

    return pageNumbers
  }

  return (
    <ShadCNPagination className="flex justify-between px-2 py-1 shadow-inner items-center">
      <PaginationContent
        className="px-1 py-0 flex gap-2"
        key={'pagination-1' + `-${new Date().getTime()}`}
      >
        <p className="font-normal text-[15px]">
          Total {paginationDetails?.total ? paginationDetails?.total : '0'}
        </p>
        <Select
          value={selectedValue?.toString()}
          onValueChange={handleRowChange}
        >
          <SelectTrigger className="w-24 py-0 h-[30px] text-zinc-800">
            <SelectValue
              placeholder={`Items per page`}
              className="font-normal text-sm  "
            />
          </SelectTrigger>
          <SelectContent className="w-[120px] bg-white pointer">
            {limitOptions.map((item, index) => (
              <SelectItem
                value={item.value.toString()}
                key={index + `-${new Date().getTime()}`}
                className="cursor-pointer font-normal text-sm opacity-90"
              >
                {item.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </PaginationContent>

      <div className="flex justify-end items-center">
        <PaginationContent
          className="px-1 py-0"
          key={'pagination-2' + `-${new Date().getTime()}`}
        >
          <div className="flex items-center font-normal text-[15px] opacity-80">
            GoTo
            <Input
              type="number"
              value={pageValue}
              autoFocus={pageNumFocused}
              onFocus={() => setPageNumFocused(true)}
              onBlur={() => setPageNumFocused(false)}
              onChange={(e) => setPageValue(Number(e.target.value))}
              onKeyDown={onKeyDownInPageChange}
              className="h-[30px] w-[40px] m-auto flex items-center text-center py-0 ml-2  focus:outline-none focus:ring-0 text-sm pl-1 pr-0 font-normal bg-gray-200 bg-opacity-80"
              placeholder="Page"
            />
          </div>
        </PaginationContent>

        <PaginationContent
          className="px-1 py-0 font-normal"
          key={3 + `-${new Date().getTime()}`}
        >
          <PaginationItem className="font-normal">
            <PaginationPrevious
              href={currentPage === 1 ? undefined : '#'}
              onClick={(e) => {
                if (currentPage === 1) {
                  e.preventDefault()
                  return
                }
                e.preventDefault()
                handlePageChange(currentPage - 1)
              }}
              aria-disabled={currentPage === 1}
              className={`${
                currentPage === 1
                  ? 'pointer-events-none cursor-not-allowed opacity-50'
                  : 'cursor-pointer opacity-100'
              }`}
            />
          </PaginationItem>

          {getPageNumbers().map((pageNumber, index) =>
            pageNumber === null ? (
              <PaginationItem key={`ellipsis-${index}-${new Date().getTime()}`}>
                <PaginationEllipsis />
              </PaginationItem>
            ) : (
              <PaginationItem key={pageNumber + `-${new Date().getTime()}`}>
                <PaginationLink
                  href="#"
                  isActive={pageNumber === currentPage}
                  onClick={(e) => {
                    e.preventDefault()
                    handlePageChange(pageNumber)
                  }}
                  className={`w-[30px] h-[30px] font-normal hover:no-underline ${
                    pageNumber === currentPage
                      ? 'bg-[#F0F1F6] text-black rounded-full w-[30px] h-[30px]'
                      : 'bg-transperant text-black'
                  }`}
                >
                  {pageNumber}
                </PaginationLink>
              </PaginationItem>
            ),
          )}

          <PaginationItem>
            <PaginationNext
              href={currentPage === totalPages ? undefined : '#'}
              onClick={(e) => {
                if (currentPage === totalPages) {
                  e.preventDefault()
                  return
                }
                e.preventDefault()
                handlePageChange(currentPage + 1)
              }}
              aria-disabled={currentPage === totalPages}
              className={`${
                currentPage === totalPages
                  ? 'pointer-events-none cursor-not-allowed opacity-50'
                  : 'cursor-pointer opacity-100'
              }`}
            />
          </PaginationItem>
        </PaginationContent>
      </div>
    </ShadCNPagination>
  )
}

export default Pagination
