"use client";

import React, { useState } from "react";
import {
  ColumnDef,
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/utils/axiosInstance";
import { ArrowUpRight, ChevronDown, ChevronRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

const OrdersTable = () => {
  const router = useRouter();
  const [expanded, setExpanded] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["user-orders"],
    queryFn: async () => {
      const res = await axiosInstance.get(`/order/get-user-orders`);
      return res.data.orders;
    },
  });

  const toggleExpand = (id: string) => {
    setExpanded(expanded === id ? null : id);
  };

  const columns: ColumnDef<any>[] = [
    {
      id: "expand",
      header: "",
      cell: ({ row }) => (
        <button
          onClick={() => toggleExpand(row.original.id)}
          className="p-1"
        >
          {expanded === row.original.id ? (
            <ChevronDown className="w-5 h-5 text-gray-600" />
          ) : (
            <ChevronRight className="w-5 h-5 text-gray-600" />
          )}
        </button>
      ),
    },
    {
      accessorKey: "id",
      header: "Order ID",
      cell: ({ row }) => (
        <span className="font-medium text-gray-800">
          {row.original.id.slice(0, 8)}...
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;

        const colors: any = {
          Paid: "bg-green-100 text-green-700",
          Pending: "bg-yellow-100 text-yellow-700",
          Cancelled: "bg-red-100 text-red-700",
        };

        return (
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              colors[status] || "bg-gray-100 text-gray-600"
            }`}
          >
            {status}
          </span>
        );
      },
    },
    {
      accessorKey: "total",
      header: "Total ($)",
      cell: ({ row }) => (
        <span className="font-semibold text-gray-800">
          ${row.original.total}
        </span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Date",
      cell: ({ row }) => (
        <span className="text-gray-600">
          {new Date(row.original.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <button
          onClick={() => router.push(`/order/${row.original.id}`)}
          className="flex items-center gap-1 text-blue-600 hover:underline text-sm"
        >
          View <ArrowUpRight className="w-4 h-4" />
        </button>
      ),
    },
  ];

  const table = useReactTable({
    data: data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading)
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );

  if (!data || data.length === 0)
    return (
      <div className="text-center py-10 text-gray-600">
        No orders found.
      </div>
    );

  return (
    <div className="overflow-x-auto rounded-md border border-gray-200 shadow-sm">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b"
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </th>
              ))}
            </tr>
          ))}
        </thead>

        <tbody>
          {table.getRowModel().rows.map((row) => (
            <>
              {/* MAIN ROW */}
              <tr
                key={row.id}
                className="hover:bg-gray-50 transition border-b"
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3 text-gray-700">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>

              {/* EXPANDED ITEMS ROW */}
              {expanded === row.original.id && (
                <tr className="bg-gray-50">
                  <td colSpan={6} className="px-6 py-4">
                    <h3 className="font-semibold text-gray-800 mb-3">
                      Order Items
                    </h3>

                    <div className="overflow-x-auto">
                      <table className="min-w-full bg-white border rounded-md">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="px-4 py-2 text-left">Product ID</th>
                            <th className="px-4 py-2 text-left">Quantity</th>
                            <th className="px-4 py-2 text-left">Price</th>
                          </tr>
                        </thead>

                        <tbody>
                          {row.original.items.map((item: any) => (
                            <tr key={item.id} className="border-t">
                              <td className="px-4 py-2 text-gray-800">
                                {item.productId.slice(0, 8)}...
                              </td>
                              <td className="px-4 py-2">{item.quantity}</td>
                              <td className="px-4 py-2 font-medium">
                                ${item.price}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </td>
                </tr>
              )}
            </>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrdersTable;
