// components/inventory-data-table.tsx

'use client';

import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/data-table';

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  sku: string;
  quantity: number;
  reorderLevel: number;
  status: 'in-stock' | 'low-stock' | 'out-of-stock';
}

interface InventoryDataTableProps {
  data: InventoryItem[];
  isLoading?: boolean;
}

const statusConfig = {
  'in-stock': {
    dot: 'bg-emerald-500',
    badge: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    label: 'In Stock',
  },
  'low-stock': {
    dot: 'bg-amber-400',
    badge: 'bg-amber-50 text-amber-700 ring-amber-200',
    label: 'Low Stock',
  },
  'out-of-stock': {
    dot: 'bg-red-500',
    badge: 'bg-red-50 text-red-700 ring-red-200',
    label: 'Out of Stock',
  },
};

export function InventoryDataTable({
  data,
  isLoading,
}: InventoryDataTableProps) {
  const columns: ColumnDef<InventoryItem>[] = [
    {
      accessorKey: 'name',
      header: 'Product Name',
      cell: ({ row }) => (
        <span className="font-bold text-slate-900 text-sm tracking-tight">
          {row.getValue('name')}
        </span>
      ),
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }) => (
        <span className="text-xs font-medium text-slate-400 uppercase tracking-widest">
          {row.getValue('category')}
        </span>
      ),
    },
    {
      accessorKey: 'sku',
      header: 'SKU',
      cell: ({ row }) => (
        <span className="font-mono text-[11px] text-slate-500 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md">
          {row.getValue('sku')}
        </span>
      ),
    },
    {
      accessorKey: 'quantity',
      header: 'Quantity',
      cell: ({ row }) => {
        const qty = row.getValue('quantity') as number;
        const status = row.getValue('status') as string;
        const color =
          status === 'out-of-stock'
            ? 'text-red-600 font-black'
            : status === 'low-stock'
            ? 'text-amber-600 font-bold'
            : 'text-emerald-600 font-bold';
        return <span className={`text-sm ${color}`}>{qty}</span>;
      },
    },
    {
      accessorKey: 'reorderLevel',
      header: 'Reorder Level',
      cell: ({ row }) => (
        <span className="text-sm text-slate-400 font-medium">
          {row.getValue('reorderLevel')}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const value = row.getValue('status') as keyof typeof statusConfig;
        const cfg = statusConfig[value] ?? statusConfig['in-stock'];
        return (
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ring-1 ring-inset ${cfg.badge}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
          </span>
        );
      },
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-slate-100 border-t-orange-500" />
      </div>
    );
  }

  return <DataTable columns={columns} data={data} />;
}
