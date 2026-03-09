'use client';
import React, { useEffect, useState } from 'react';
import { 
  flexRender, 
  useReactTable, 
  createColumnHelper, 
  getCoreRowModel, 
  getPaginationRowModel 
} from '@tanstack/react-table';

import { Campaign } from '../types/db/campaigns';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

interface CampaignWithMetaData extends Campaign {
  campaign_members?: {
    role: string;
    users: {
      first_name: string;
      last_name: string;
    };
  }[];
  raised?: number;
}

interface Props {
  initialData: CampaignWithMetaData[];
}

const CampaignsTable = ({ initialData }: Props) => {
  const [campaignSearch, setCampaignSearch] = useState('');
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  useEffect( () => {
    // if search input is empty and no query in search url, do nothing
    const currentQuery = searchParams.get('query') || '';
    if (campaignSearch === currentQuery) return;

    const delay = setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      if (campaignSearch) {
        params.set('query', campaignSearch);
      } else {
        params.delete('query');
      }
      replace(`${pathname}?${params.toString()}`, { scroll: false });

    }, 500);

    return () => clearTimeout(delay);
  }, [campaignSearch, pathname, replace])

  const columnHelper = createColumnHelper<CampaignWithMetaData>();

  const columns = [
    columnHelper.accessor('name', {
      header: 'Campaign Title',
      cell: info => <span className="font-medium text-gray-700">{info.getValue()}</span>
    }),
    columnHelper.accessor(row => {
      const leader = row.campaign_members?.[0]?.users;
      return leader ? `${leader.first_name} ${leader.last_name}` : "N/A";
    }, {
      id: 'leader_name',
      header: 'Campaign Leader',
    }),
    columnHelper.accessor(row => (row as any).raised || 0, {
      id: 'raised',
      header: 'Raised',
      cell: info => `$${info.getValue().toLocaleString()}`
    }),
    columnHelper.accessor('goal', {
      header: 'Goal',
      cell: info => `$${(info.getValue() || 0).toLocaleString()}`
    }), 
    columnHelper.accessor(row => ({ 
      raised: (row as any).raised || 0, 
      goal: row.goal || 0 
    }), {
      id: 'status',
      header: 'Goal Status',
      cell: info => {
        const { raised, goal } = info.getValue();
        const percentage = goal > 0 ? Math.min(Math.round((raised / goal) * 100), 100) : 0;
        return (
          <div className="flex items-center gap-3 w-full max-w-[150px]">
            <div className="w-full bg-blue-100 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
            <span className="text-sm text-gray-600">{percentage}%</span>
          </div>
        );
      }
    })
  ];

  const table = useReactTable({
    data: initialData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  if (initialData.length === 0) {
    return <div className="p-8 text-center text-gray-500">No campaigns available.</div>;
  }

  return (
    <div className="w-full p-4"> 
      <div className="text-[#196d38] text-3xl font-extrabold mb-4 md:mx-auto md:w-[90%] sm:text-left text-center">
        All Previous Campaigns
      </div>
      <div className="md:w-[90%] md:mx-auto bg-white rounded-xl overflow-x-auto">
        {/* header section */}
        <div className="pt-8 px-5">
          <h2 className="text-black sm:text-left text-center">Full Campaign List</h2>
          <p className="text-sm text-gray-500 sm:text-left text-center">{initialData.length} Applications</p>

          <div className="relative my-6">
            <label className="absolute -top-2.5 left-3 bg-white px-1 text-xs text-gray-400">Search</label>
            <div className="flex items-center border border-gray-200 rounded-lg px-3 py-2.5 focus-within:border-blue-500 transition-colors">
              <input 
                type="text" 
                value={campaignSearch}
                onChange={(e) => setCampaignSearch(e.target.value)}
                placeholder='Start typing...'
                className="w-full bg-transparent outline-none text-md p-1 overflow-x-auto"
              />
            </div>
          </div>
        </div>

        <table className="w-full">
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th key={header.id} className="text-left px-5 py-4 border-b border-gray-300">
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
            {table.getRowModel().rows.map(row => (
              <tr key={row.id}>
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="text-left px-5 py-4 border-b border-gray-300">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {/* pagination bar */}
        <div className="px-6 py-4 flex items-center justify-end gap-6 text-sm text-gray-500 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <span>Rows per page:</span>
              <select 
                value={table.getState().pagination.pageSize}
                onChange={e => table.setPageSize(Number(e.target.value))}
                className="outline-none cursor-pointer font-medium text-gray-700"
              >
                {[5, 10, 20].map(size => <option key={size} value={size}>{size}</option>)}
              </select>
            </div>

            <span>
              {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}-
              {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, initialData.length)} 
              {' of '} {initialData.length}
            </span>

            <div className="flex items-center gap-2">
              <button 
                onClick={() => table.previousPage()} 
                disabled={!table.getCanPreviousPage()}
                className="p-1 disabled:opacity-30 text-2xl text-black font-bold"
              >
                &lt;
              </button>
              <button 
                onClick={() => table.nextPage()} 
                disabled={!table.getCanNextPage()}
                className="p-1 disabled:opacity-30 text-2xl text-black font-bold"
              >
                &gt;
              </button>
            </div>
          </div>
      </div>
    </div>
  )
}

export default CampaignsTable;