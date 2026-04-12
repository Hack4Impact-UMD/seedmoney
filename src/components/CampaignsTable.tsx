'use client';
import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  flexRender, 
  useReactTable, 
  createColumnHelper, 
  getCoreRowModel, 
  getPaginationRowModel 
} from '@tanstack/react-table';

import { CampaignWithLeader } from '../types/frontend/campaigns';


interface Props {
  initialData: CampaignWithLeader[];
}

const CampaignsTable = ({ initialData }: Props) => {
  const router = useRouter();
  const [campaignSearch, setCampaignSearch] = useState('');

  const handleCampaignClick = (id: number) => {
    router.push(`/dashboard/ongoing-campaigns/${id}`);
  }

  const filteredData = useMemo(() => {
    return initialData.filter(campaign => 
      campaign.name.toLowerCase().includes(campaignSearch.toLowerCase()) || 
      campaign.campaign_leader.toLowerCase().includes(campaignSearch.toLowerCase())
    );
  }, [campaignSearch, initialData]);

  const columnHelper = createColumnHelper<CampaignWithLeader>();

  const columns = [
    columnHelper.accessor('name', {
      header: 'Campaign Title',
      size: 200,
      cell: info => <span className="font-medium text-gray-700">{info.getValue()}</span>
    }),
    columnHelper.accessor('campaign_leader', {
      header: 'Campaign Leader',
      size: 180,
      cell: info => info.getValue()
    }),
    columnHelper.accessor('raised', {
      header: '$ Raised',
      size: 120,
      cell: info => `$${info.getValue().toLocaleString()}`
    }),
    columnHelper.accessor('goal', {
      header: 'Goal',
      size: 120,
      cell: info => `$${info.getValue().toLocaleString()}`
    }), 
    columnHelper.accessor(row => ({ 
      percentage: row.raised / row.goal * 100
    }), {
      id: 'progress',
      size: 200,
      header: 'Goal Progress',
      cell: ({ row }) => {
        const campaign = row.original;
        const percentage = campaign.goal > 0 ? Math.round((campaign.raised / campaign.goal) * 100) : 0;
        const displayPercentage = Math.min(percentage, 100);

        return (
          <div className="flex items-center gap-3 w-full min-w-[180px]">
            <div className="w-full bg-blue-100 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ width: `${displayPercentage}%` }}
              ></div>
            </div>
            <span className="text-sm text-gray-600">{displayPercentage}%</span>

            <button
              type="button"
              className="ml-1 cursor-pointer select-none text-xl font-bold text-[#1e1e1e] transition-all opacity-0 group-hover:opacity-100"
              onClick={() => handleCampaignClick(campaign.campaign_id)}
              aria-label="Open campaign details"
            >
              &gt;
            </button>
          </div>
        );
      }
    })
  ];

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="w-full"> 

      <div className="md:w-full md:mx-auto bg-white rounded-xl overflow-x-auto">
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

        {filteredData.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No campaigns available.</div>
        ) : (
          <>
          
          <table className="w-full">
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th key={header.id} style={{ width: header.getSize() !== 150 ? header.getSize() : 'auto' }} className="text-left px-5 py-4 border-b border-gray-300">
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
                <tr key={row.id} className="group hover:bg-[#f5f5f5] transition-colors">
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="text-left px-5 py-4 border-b border-gray-300">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                    
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          {/* pagination */}
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
                {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, filteredData.length)} 
                {' of '} {filteredData.length}
              </span>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => table.previousPage()} 
                  disabled={!table.getCanPreviousPage()}
                  className="cursor-pointer p-1 text-2xl font-bold text-black disabled:cursor-not-allowed disabled:opacity-30"
                >
                  &lt;
                </button>
                <button 
                  onClick={() => table.nextPage()} 
                  disabled={!table.getCanNextPage()}
                  className="cursor-pointer p-1 text-2xl font-bold text-black disabled:cursor-not-allowed disabled:opacity-30"
                >
                  &gt;
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default CampaignsTable;
