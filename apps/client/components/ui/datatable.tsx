"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./table";
import { Skeleton } from "./skeleton";
import { Pagination } from "../pagination";

type DataTableProps<TData extends object> = {
  columns: ColumnDef<TData, any>[];
  data: TData[];
  isLoading?: boolean;
  defaultPageSize?: number;
  pageSizeOptions?: number[];
};

export function DataTable<TData extends object>({
  columns,
  data,
  isLoading = false,
  defaultPageSize = 10,
  pageSizeOptions = [5, 10, 20, 50],
}: DataTableProps<TData>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [paginatedData, setPaginatedData] = useState<TData[]>([]);

  useEffect(() => {
    setCurrentPage(1);
  }, [data]);

  useEffect(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    setPaginatedData(data.slice(start, end));
  }, [data, currentPage, pageSize]);

  const totalPages = Math.ceil(data.length / pageSize);

  const table = useReactTable({
    data: paginatedData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const handlePageChange = (page: number) => setCurrentPage(page);
  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-hidden rounded-lg ">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="bg-primary/5 hover:bg-primary/5"
              >
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(pageSize)].map((_, i) => (
                <TableRow
                  key={i}
                  className="hover:bg-gray-100 transition-colors duration-200"
                >
                  {columns.map((_, idx) => (
                    <TableCell key={idx}>
                      <Skeleton className="h-4 w-full max-w-[100px]" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : paginatedData.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="odd:bg-[#FFFFFF] even:bg-[#FBFBFB] hover:bg-blue-50/95 transition-colors duration-200 cursor-pointer"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow className="hover:bg-gray-100 transition-colors duration-200">
                <TableCell colSpan={columns.length} className="text-center h-24">
                  No data found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {data.length > defaultPageSize && (
        <div className="border-t mt-auto py-4 px-4 bg-white">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            pageSize={pageSize}
            onPageSizeChange={handlePageSizeChange}
            totalItems={data.length}
          />
        </div>
      )}
    </div>
  );
}
