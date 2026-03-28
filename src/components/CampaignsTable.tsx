'use client';
import React, { useMemo, useState } from 'react';
import { 
  flexRender, 
  useReactTable, 
  createColumnHelper, 
  getCoreRowModel, 
  getPaginationRowModel 
} from '@tanstack/react-table';

interface CampaignMock {
  name: string;
  campaign_leader: string;
  raised: number;
  goal: number;
  percentage: number;
}

interface Props {
  initialData: CampaignMock[];
}

const CampaignsTable = ({ initialData }: Props) => {
  const [campaignSearch, setCampaignSearch] = useState('');

  const filteredData = useMemo(() => {
    return initialData.filter(campaign => 
      campaign.name.toLowerCase().includes(campaignSearch.toLowerCase()) || 
      campaign.campaign_leader.toLowerCase().includes(campaignSearch.toLowerCase())
    );
  }, [campaignSearch, initialData]);

  const columnHelper = createColumnHelper<CampaignMock>();

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
      header: 'Raised',
      size: 120,
      cell: info => `$${info.getValue().toLocaleString()}`
    }),
    columnHelper.accessor('goal', {
      header: 'Goal',
      size: 120,
      cell: info => `$${info.getValue().toLocaleString()}`
    }), 
    columnHelper.accessor(row => ({ 
      percentage: row.percentage 
    }), {
      id: 'status',
      size: 200,
      header: 'Goal Status',
      cell: info => {
        const { percentage } = info.getValue();
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
            {/* TODO: make onClick open up individual campaign  */}
            <span className="text-[#2c7a45] font-bold ml-1 text-xl" onClick={() => console.log("clicked")}>&gt;</span>
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
          </>
        )}
      </div>
    </div>
  )
}

export default CampaignsTable;