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
    date: Date;
    status: string;
}

const TEST_DATA: Donor[] = [
    { id: 1, reward: 'Sticker Pack', amount: 5, name: 'Ava Martinez', email: 'ava.martinez@example.com', card_reference: '4829103746281953', date: new Date('2024-01-15'), status: 'Success' },
    { id: 2, reward: 'T-Shirt', amount: 25, name: 'Liam Nguyen', email: 'liam.nguyen@example.com', card_reference: '9102746382054719', date: new Date('2024-02-03'), status: 'Success' },
    { id: 3, reward: 'Coffee Mug', amount: 15, name: 'Olivia Smith', email: 'olivia.smith@example.com', card_reference: '0371928456183274', date: new Date('2024-02-20'), status: 'Success' },
    { id: 4, reward: 'Signed Poster', amount: 50, name: 'Noah Johnson', email: 'noah.johnson@example.com', card_reference: '5501237890462518', date: new Date('2024-03-05'), status: 'Success' },
    { id: 5, reward: 'VIP Access', amount: 100, name: 'Emma Williams', email: 'emma.williams@example.com', card_reference: '2983746150839247', date: new Date('2024-03-22'), status: 'Success' },
    { id: 6, reward: 'Digital Art', amount: 10, name: 'Oliver Brown', email: 'oliver.brown@example.com', card_reference: '7039182645930184', date: new Date('2024-04-01'), status: 'Success' },
    { id: 7, reward: 'Sticker Pack', amount: 5, name: 'Sophia Davis', email: 'sophia.davis@example.com', card_reference: '8246017392581460', date: new Date('2024-04-12'), status: 'Success' },
    { id: 8, reward: 'T-Shirt', amount: 25, name: 'Lucas Wilson', email: 'lucas.wilson@example.com', card_reference: '1472039586724013', date: new Date('2024-05-02'), status: 'Success' },
    { id: 9, reward: 'Coffee Mug', amount: 15, name: 'Mia Moore', email: 'mia.moore@example.com', card_reference: '6604921378450296', date: new Date('2024-05-18'), status: 'Success' },
    { id: 10, reward: 'Signed Poster', amount: 50, name: 'Ethan Taylor', email: 'ethan.taylor@example.com', card_reference: '2139045768193847', date: new Date('2024-06-04'), status: 'Success' },
    { id: 11, reward: 'VIP Access', amount: 100, name: 'Isabella Anderson', email: 'isabella.anderson@example.com', card_reference: '9056123478620395', date: new Date('2024-06-20'), status: 'Success' },
    { id: 12, reward: 'Digital Art', amount: 10, name: 'Mason Thomas', email: 'mason.thomas@example.com', card_reference: '4712893056184729', date: new Date('2024-07-01'), status: 'Success' },
    { id: 13, reward: 'Sticker Pack', amount: 5, name: 'Amelia Jackson', email: 'amelia.jackson@example.com', card_reference: '3827160495738261', date: new Date('2024-07-11'), status: 'Success' },
    { id: 14, reward: 'T-Shirt', amount: 25, name: 'Logan White', email: 'logan.white@example.com', card_reference: '5982317046829150', date: new Date('2024-07-25'), status: 'Success' },
    { id: 15, reward: 'Coffee Mug', amount: 15, name: 'Harper Harris', email: 'harper.harris@example.com', card_reference: '7049182356401928', date: new Date('2024-08-08'), status: 'Success' },
    { id: 16, reward: 'Signed Poster', amount: 50, name: 'James Martin', email: 'james.martin@example.com', card_reference: '8612304975260381', date: new Date('2024-08-21'), status: 'Success' },
    { id: 17, reward: 'VIP Access', amount: 100, name: 'Evelyn Thompson', email: 'evelyn.thompson@example.com', card_reference: '3194058276941530', date: new Date('2024-09-05'), status: 'Success' },
    { id: 18, reward: 'Digital Art', amount: 10, name: 'Benjamin Garcia', email: 'benjamin.garcia@example.com', card_reference: '2401987365048291', date: new Date('2024-09-16'), status: 'Success' },
    { id: 19, reward: 'Sticker Pack', amount: 5, name: 'Charlotte Martinez', email: 'charlotte.martinez@example.com', card_reference: '5983741026385190', date: new Date('2024-10-02'), status: 'Success' },
    { id: 20, reward: 'T-Shirt', amount: 25, name: 'Henry Robinson', email: 'henry.robinson@example.com', card_reference: '0173948652704918', date: new Date('2024-10-18'), status: 'Success' },
    { id: 21, reward: 'Coffee Mug', amount: 15, name: 'Abigail Clark', email: 'abigail.clark@example.com', card_reference: '3861509274620483', date: new Date('2024-11-03'), status: 'Success' },
    { id: 22, reward: 'Signed Poster', amount: 50, name: 'Alexander Rodriguez', email: 'alex.rodriguez@example.com', card_reference: '9247031586173920', date: new Date('2024-11-17'), status: 'Success' },
    { id: 23, reward: 'VIP Access', amount: 100, name: 'Emily Lewis', email: 'emily.lewis@example.com', card_reference: '5601924387052946', date: new Date('2024-12-01'), status: 'Success' },
    { id: 24, reward: 'Digital Art', amount: 10, name: 'Daniel Lee', email: 'daniel.lee@example.com', card_reference: '4036791825940317', date: new Date('2024-12-12'), status: 'Success' },
    { id: 25, reward: 'Sticker Pack', amount: 5, name: 'Sofia Walker', email: 'sofia.walker@example.com', card_reference: '7823041965283740', date: new Date('2025-01-06'), status: 'Success' },
    { id: 26, reward: 'T-Shirt', amount: 25, name: 'Jackson Hall', email: 'jackson.hall@example.com', card_reference: '6195832047391058', date: new Date('2025-01-20'), status: 'Success' },
    { id: 27, reward: 'Coffee Mug', amount: 15, name: 'Ella Allen', email: 'ella.allen@example.com', card_reference: '2301945687410293', date: new Date('2025-02-04'), status: 'Success' },
    { id: 28, reward: 'Signed Poster', amount: 50, name: 'Sebastian Young', email: 'sebastian.young@example.com', card_reference: '9571204863750192', date: new Date('2025-02-18'), status: 'Success' },
    { id: 29, reward: 'VIP Access', amount: 100, name: 'Avery Hernandez', email: 'avery.hernandez@example.com', card_reference: '1843069725384610', date: new Date('2025-03-02'), status: 'Success' },
    { id: 30, reward: 'Digital Art', amount: 10, name: 'William King', email: 'william.king@example.com', card_reference: '4390827156029384', date: new Date('2025-03-16'), status: 'Success' },
    { id: 31, reward: 'Sticker Pack', amount: 5, name: 'Scarlett Wright', email: 'scarlett.wright@example.com', card_reference: '7062918435201847', date: new Date('2025-04-01'), status: 'Success' },
    { id: 32, reward: 'T-Shirt', amount: 25, name: 'Owen Lopez', email: 'owen.lopez@example.com', card_reference: '3925701846520391', date: new Date('2025-04-14'), status: 'Success' },
    { id: 33, reward: 'Coffee Mug', amount: 15, name: 'Aria Hill', email: 'aria.hill@example.com', card_reference: '8150634297061825', date: new Date('2025-04-29'), status: 'Success' },
    { id: 34, reward: 'Signed Poster', amount: 50, name: 'Carter Scott', email: 'carter.scott@example.com', card_reference: '5042198763940215', date: new Date('2025-05-10'), status: 'Success' },
    { id: 35, reward: 'VIP Access', amount: 100, name: 'Luna Green', email: 'luna.green@example.com', card_reference: '2719384056183927', date: new Date('2025-05-24'), status: 'Success' },
    { id: 36, reward: 'Digital Art', amount: 10, name: 'Levi Adams', email: 'levi.adams@example.com', card_reference: '9834061725482910', date: new Date('2025-06-06'), status: 'Success' },
    { id: 37, reward: 'Sticker Pack', amount: 5, name: 'Zoe Baker', email: 'zoe.baker@example.com', card_reference: '1469203875640182', date: new Date('2025-06-19'), status: 'Success' },
    { id: 38, reward: 'T-Shirt', amount: 25, name: 'Isaac Gonzalez', email: 'isaac.gonzalez@example.com', card_reference: '6092847315208493', date: new Date('2025-07-02'), status: 'Success' },
    { id: 39, reward: 'Coffee Mug', amount: 15, name: 'Nora Perez', email: 'nora.perez@example.com', card_reference: '3481759206143827', date: new Date('2025-07-16'), status: 'Success' },
    { id: 40, reward: 'Signed Poster', amount: 50, name: 'Owen Ramirez', email: 'owen.ramirez@example.com', card_reference: '7926140358291047', date: new Date('2025-08-01'), status: 'Success' },
    { id: 41, reward: 'VIP Access', amount: 100, name: 'Hazel Torres', email: 'hazel.torres@example.com', card_reference: '2649813057482016', date: new Date('2025-08-15'), status: 'Success' },
    { id: 42, reward: 'Digital Art', amount: 10, name: 'Christopher Flores', email: 'chris.flores@example.com', card_reference: '5310972864019285', date: new Date('2025-08-28'), status: 'Success' },
    { id: 43, reward: 'Sticker Pack', amount: 5, name: 'Penelope Rivera', email: 'penelope.rivera@example.com', card_reference: '4087521936284710', date: new Date('2025-09-10'), status: 'Success' },
    { id: 44, reward: 'T-Shirt', amount: 25, name: 'David Cruz', email: 'david.cruz@example.com', card_reference: '6973201458390271', date: new Date('2025-09-24'), status: 'Success' },
    { id: 45, reward: 'Coffee Mug', amount: 15, name: 'Madison Edwards', email: 'madison.edwards@example.com', card_reference: '1504896273841059', date: new Date('2025-10-08'), status: 'Success' },
    { id: 46, reward: 'Signed Poster', amount: 50, name: 'Wyatt Collins', email: 'wyatt.collins@example.com', card_reference: '8234165907423018', date: new Date('2025-10-21'), status: 'Success' },
    { id: 47, reward: 'VIP Access', amount: 100, name: 'Grace Stewart', email: 'grace.stewart@example.com', card_reference: '2790351846093527', date: new Date('2025-11-05'), status: 'Success' },
    { id: 48, reward: 'Digital Art', amount: 10, name: 'Samuel Sanchez', email: 'samuel.sanchez@example.com', card_reference: '5167082943618204', date: new Date('2025-11-19'), status: 'Success' },
    { id: 49, reward: 'Sticker Pack', amount: 5, name: 'Hannah Morris', email: 'hannah.morris@example.com', card_reference: '3420195867240918', date: new Date('2025-12-02'), status: 'Success' },
    { id: 50, reward: 'T-Shirt', amount: 25, name: 'Julian Rogers', email: 'julian.rogers@example.com', card_reference: '6082714935182047', date: new Date('2025-12-16'), status: 'Success' }
];


export default function DonorsTable() {

    const [donors, setDonors] = useState<Donor[]>([]);
    const [sorting, setSorting] = useState<SortingState>([]);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        // TODO fetch real data from the backend
        setDonors(TEST_DATA);
    }, []);

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
            cell: info => info.getValue().toISOString().split('T')[0],
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
                    placeholder="Contributor, Amount, etc..."
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