"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper
} from "@tanstack/react-table";
import { Eye } from "lucide-react";
import Link from "next/link";
import axiosInstance from "@/utils/axiosInstance";

const columnHelper = createColumnHelper<any>();

export default function SellerOrdersPage() {
  const [search, setSearch] = useState("");

  // ==========================
  // Fetch Seller Orders
  // ==========================
  const { data, isLoading, isError } = useQuery({
    queryKey: ["seller-orders"],
    queryFn: async () => {
      const res = await axiosInstance.get("/order/get-seller-orders");
      return res.data.orders;
    },
  });

  const columns = useMemo(
    () => [
      columnHelper.accessor("id", {
        header: "Order ID",
        cell: (info) => <span>{info.getValue()}</span>,
      }),
      columnHelper.accessor("user.name", {
        header: "Customer",
        cell: (info) => <span>{info.getValue()}</span>,
      }),
      columnHelper.accessor("total", {
        header: "Total ($)",
        cell: (info) => <span>${info.getValue().toFixed(2)}</span>,
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => (
          <span className="capitalize px-2 py-1 rounded bg-blue-100 text-blue-700">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor("createdAt", {
        header: "Date",
        cell: (info) =>
          new Date(info.getValue()).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          }),
      }),
      {
        id: "action",
        header: "Actions",
        cell: (info: any) => {
          const orderId = info.row.original.id;
          return (
            <Link href={`/orders/${orderId}`}>
              <Eye className="w-5 h-5 text-blue-600 hover:text-blue-800 cursor-pointer" />
            </Link>
          );
        },
      },
    ],
    []
  );

  const table = useReactTable({
    data: data || [],
    columns,
    state: {
      globalFilter: search,
    },
    onGlobalFilterChange: setSearch,
    getFilteredRowModel: getFilteredRowModel(),
    getCoreRowModel: getCoreRowModel(),
  });

  // ==========================
  // UI States
  // ==========================
  if (isLoading)
    return (
      <div className="flex justify-center items-center h-60 text-xl font-semibold">
        Loading Orders...
      </div>
    );

  if (isError)
    return (
      <div className="text-center text-red-500 font-semibold">
        Failed to load orders.
      </div>
    );

  return (
    <div className="p-6 text-white bg-[#0f1115] min-h-screen">
      <h1 className="text-2xl font-semibold mb-6">Seller Orders</h1>

      {/* Search Box */}
      <div className="mb-6">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search orders..."
          className="w-full md:w-80 px-4 py-2 rounded-lg bg-[#1a1d23] border border-[#2a2d33] text-white 
                   focus:ring-2 focus:ring-blue-500 outline-none placeholder-gray-400"
        />
      </div>

      {/* Orders Table */}
      <div className="overflow-x-auto rounded-xl border border-[#2a2d33] bg-[#1a1d23] shadow-lg">
        <table className="w-full text-sm">
          <thead className="bg-[#1f2329] border-b border-[#2e323a] text-gray-300">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left font-medium"
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-[#2a2d33] hover:bg-[#22262d] transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3 text-gray-200">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="text-center py-6 text-gray-400">
                  No orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

}
