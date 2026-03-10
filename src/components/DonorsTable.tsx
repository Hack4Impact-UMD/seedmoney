'use client';
import React, {useCallback, useEffect, useState} from 'react';
import {createColumnHelper, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, SortingState} from "@tanstack/table-core";
import {flexRender, useReactTable} from "@tanstack/react-table";
import {
    Box, Chip, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination,
    TablePaginationActions, TableRow, TableSortLabel, TextField, Typography
} from "@mui/material";

interface Donor {
    id: number;
    reward: string;
    amount: number;
    name: string;
    email: string;
    card_reference: string;
    date: string;
    status: string;
}

interface DonorsTableProps {
    campaignId: number;
}

export default function DonorsTable({ campaignId }: DonorsTableProps) {

    const [donors, setDonors] = useState<Donor[]>([]);
    const [sorting, setSorting] = useState<SortingState>([]);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        // TODO fetch real data from the backend using campaignId
        setDonors([]);
    }, [campaignId]);

    const globalFilterFn = useCallback(
        (row: { original: Donor }, _columnId: string, filterValue: string) => {
            const query = filterValue.toLowerCase().trim();
            if (!query) return true;

            const donor = row.original;

            const numericQuery = parseFloat(query);
            if (!isNaN(numericQuery) && numericQuery === donor.amount) {
                return true;
            }

            const id = String(donor.id).toLowerCase();
            const name = donor.name.toLowerCase();
            const email = donor.email.toLowerCase();

            return id.includes(query) || name.toLowerCase().includes(query) || email.toLowerCase().includes(query);
        },
        [],
    );

    const columnHelper = createColumnHelper<Donor>();

    const columns = [
        columnHelper.accessor('id', {
            header: 'ID',
            cell: info => info.getValue(),
        }),
        columnHelper.accessor('reward', {
            header: 'Reward',
            cell: info => info.getValue(),
        }),
        columnHelper.accessor('amount', {
            header: 'Amount',
            cell: info => `$${info.getValue().toFixed(2)}`,
            enableSorting: false,
        }),
        columnHelper.accessor('name', {
            header: 'Contributor Name',
            cell: info => info.getValue(),
            enableSorting: false,
        }),
        columnHelper.accessor('email', {
            header: 'Contributor Email',
            cell: info => info.getValue(),
            enableSorting: false,
        }),
        columnHelper.accessor('card_reference', {
            header: 'Card/Reference Number',
            cell: info => {
                const value = info.getValue();
                // Credit card numbers would also need to be redacted on the server side for security,
                // but for this test data we can just redact them in the frontend
                return '•••• •••• •••• ' + value.slice(-4);
            },
            enableSorting: false,
        }),
        columnHelper.accessor('date', {
            header: 'Date',
            // YYYY-MM-DD
            cell: info => info.getValue().split('T')[0],
            enableSorting: false,
        }),
        columnHelper.accessor('status', {
            header: 'Status',
            cell: info => <Chip label={info.getValue()} variant="outlined" size="small" color="success" />,
            enableSorting: false,
        }),
    ]

    const table = useReactTable({
        columns,
        data: donors,
        state: {
            sorting,
            globalFilter: searchQuery,
        },
        onSortingChange: setSorting,
        onGlobalFilterChange: setSearchQuery,
        globalFilterFn,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    const { pageSize, pageIndex } = table.getState().pagination

    return (
        <Stack direction="column" spacing={2} className="mt-4">
            <Box>
                <Typography variant="h6">Donors List</Typography>
                <Typography variant="subtitle2" color="textSecondary">{donors.length} donor{donors.length === 1 ? '' : 's'}</Typography>
            </Box>
            <Box className="px-2">
                <TextField
                    fullWidth
                    variant="outlined"
                    size="small"
                    label="Search"
                    placeholder="Search by donor, email, ID, or amount"
                    value={searchQuery}
                    slotProps={{
                        inputLabel: {
                            shrink: true,
                        },
                    }}
                    onChange={(e) => setSearchQuery(e.target.value)} />
            </Box>
            <TableContainer component={Paper}>
                <Table className="min-w-[650px]">
                    <TableHead>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableCell key={header.id} colSpan={header.colSpan} sortDirection={
                                            header.column.getIsSorted() || false
                                        }>
                                            {header.isPlaceholder ? null : header.column.getCanSort() ? (
                                                <TableSortLabel
                                                    active={!!header.column.getIsSorted()}
                                                    direction={header.column.getIsSorted() || 'asc'}
                                                    onClick={header.column.getToggleSortingHandler()}
                                                    sx={{ fontWeight: 'bold' }}
                                                >
                                                    {flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext(),
                                                    )}
                                                </TableSortLabel>
                                            ) : (
                                                <Box component="span" sx={{ fontWeight: 'bold' }}>
                                                    {flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext(),
                                                    )}
                                                </Box>
                                            )}
                                        </TableCell>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHead>
                    <TableBody>
                        {table.getRowModel().rows.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={columns.length} align="center" sx={{ py: 4 }}>
                                    <Typography variant="body1" color="textSecondary">
                                        No results found
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            table.getRowModel().rows.map((row) => {
                                return (
                                    <TableRow key={row.id}>
                                        {row.getVisibleCells().map((cell) => {
                                            return (
                                                <TableCell key={cell.id}>
                                                    {flexRender(
                                                        cell.column.columnDef.cell,
                                                        cell.getContext(),
                                                    )}
                                                </TableCell>
                                            )
                                        })}
                                    </TableRow>
                                )
                            })
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                rowsPerPageOptions={[5, 10, 25, { label: 'All', value: donors.length }]}
                component="div"
                count={table.getFilteredRowModel().rows.length}
                rowsPerPage={pageSize}
                page={pageIndex}
                onPageChange={(_, page) => {
                    table.setPageIndex(page)
                }}
                onRowsPerPageChange={(e) => {
                    const size = e.target.value ? Number(e.target.value) : 10
                    table.setPageSize(size)
                }}
                ActionsComponent={TablePaginationActions}
            />
        </Stack>
    );
}
