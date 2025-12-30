"use client"
import React from 'react'
import { useReactTable, getCoreRowTable, flexRender, getCoreRowModel } from "@tanstack/react-table";
import { SalesChart } from '@/shared/components/charts/sale-chart';
import GeograhicalMap from '@/shared/components/charts/geographicalMap';

// Orders data
const orders = [
  { id: "ORD-001", customer: "John Doe", amount: "$250", status: "Paid" },
  { id: "ORD-002", customer: "Jane Smith", amount: "$250", status: "Pending" },
  { id: "ORD-003", customer: "Alice Johnson", amount: "$200", status: "Paid" },
  { id: "ORD-004", customer: "Bob Brown", amount: "$150", status: "Pending" },
  { id: "ORD-005", customer: "Charlie Davis", amount: "$100", status: "Paid" },
  { id: "ORD-006", customer: "David Wilson", amount: "$50", status: "Pending" },
  { id: "ORD-007", customer: "Eve Taylor", amount: "$250", status: "Failed" },
  { id: "ORD-008", customer: "Frank Martinez", amount: "$200", status: "Paid" },
  { id: "ORD-009", customer: "Grace Anderson", amount: "$150", status: "Pending" },
  { id: "ORD-010", customer: "Hannah Wilson", amount: "$100", status: "Paid" },
];

// Orders table columns
const columns = [
  {
    accessorKey: "id",
    header: "Order ID",
  },
  {
    accessorKey: "customer",
    header: "Customer",
  },
  {
    accessorKey: "amount",
    header: "Amount",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ getValue }: any) => {
      const value = getValue();
      const color = value === "Paid" ? "green" : value === "Pending" ? "yellow" : "red";
      return (
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
          <span>{value}</span>
        </div>
      )
    }
  }
];



const OrdersTable = () => {
  const table = useReactTable({
    data: orders,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className='mt-6'>
      <h2 className="text-xl text-white font-semibold mb-4">Recent Orders
        <span className="block text-sm text-slate-400 font-normal">A Quick sanpshot of your latest transactions</span>
      </h2>
      <div className='!rounded shadow-xl overflow-hidden border border-slate-700'>
        <table className='min-w-fiull text-sm text-white'>
          <thead className='bg-slate-900 text-slate-300'>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className='p-2 text-left'>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className='bg-transparent'>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className='p-2'>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  )
};

// Dashboard Layout
const DashboardPage = () => {
  return (
    <div className='p-8'>
      {/* Top Charts */}
      <div className='w-full flex gap-8'>
        { /* Revenue Chart */}
        <div className="w-[65%]">
          <div className="rounded-2xl shadow-xl">
            <h2 className='text-white text-xl font-semibold mb-4'>Revenue
              <span className="block text-sm text-slate-400 font-normal">Last 6 Months performance</span>
            </h2>
            {/* <SalesChart /> */}
          </div>
        </div>

        { /* Device Usage */}
        <div className='w-[35%] rounded-2xl shadow-xl'>
          <h2 className='text-white text-xl font-semibold mb-4'>Device Usage
            <span className="block text-sm text-slate-400 font-normal">Last 6 Months performance</span>
          </h2>
          <div className='mt-4'>
            <ResponsiveContainer width="100%" height="350px">
              <PieChart>
                <defs>
                  <filter
                    id="shadow"
                    x="-10%"
                    y="-10%"
                    width="120%"
                    height="120%"
                    filterUnits="userSpaceOnUse"
                  >
                    <feDropShadow
                      stdDeviation="4"
                      dx="0"
                      dy="2"
                      floodColor="#000"
                      floodOpacity="0.2"
                    />
                  </filter>
                </defs>
                <Pie
                  data={deviceData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  stroke="#0f172a"
                  strokeWidth={2}
                  filter="url(#shadow)"
                >
                  {deviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>

                <Tooltip contentStyle={{
                  backgroundColor: '#1e293b',
                  borderRadius: '8px',
                  border: 'none',
                }}
                  labelStyle={{
                    color: '#fff',
                  }}
                  itemStyle={{
                    color: '#fff',
                  }}
                />

                {/* External Legend */}
                <Legend
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                  iconType="circle"
                  formatter={(value: string) => (<span className="text-white text-sm ml-1">{value}</span>)}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Geo Map + Orders */}
      <div className="w-full flex gap-8">
        { /* Map */}
        <div className='w-[60%]'>
          <h2 className='text-white text-xl font-semibold mb-4'>User & Seller Distribution
            <span className="block text-sm text-slate-400 font-normal">Visual breakdown of global users and sellers</span>
          </h2>
          <GeograhicalMap />
        </div>

        { /* Orders */}
        <div className='w-[40%]'>
          <OrdersTable />
        </div>
      </div>
    </div>
  )
}

export default OrdersTable