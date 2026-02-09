import React from 'react';
import { Badge } from './Badge';
import { Button } from './Button';

interface Column {
    key: string;
    label: string;
    sortable?: boolean;
    render?: (value: any, row: any) => React.ReactNode;
}

interface TableProps {
    columns: Column[];
    data: any[];
    loading?: boolean;
    onSort?: (key: string) => void;
    onRowClick?: (row: any) => void;
    emptyMessage?: string;
}

export const Table: React.FC<TableProps> = ({
    columns,
    data,
    loading = false,
    onSort,
    onRowClick,
    emptyMessage = 'No data available'
}) => {
    if (loading) {
        return (
            <div className="card-modern">
                <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="skeleton h-16"></div>
                    ))}
                </div>
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="card-modern text-center py-16">
                <div className="text-6xl mb-4">📊</div>
                <p className="text-slate-500 text-lg">{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div className="card-modern overflow-hidden p-0">
            <div className="overflow-x-auto">
                <table className="table-modern">
                    <thead>
                        <tr>
                            {columns.map((column) => (
                                <th
                                    key={column.key}
                                    onClick={() => column.sortable && onSort?.(column.key)}
                                    className={column.sortable ? 'cursor-pointer hover:bg-slate-200 transition' : ''}
                                >
                                    <div className="flex items-center gap-2">
                                        {column.label}
                                        {column.sortable && (
                                            <span className="text-slate-400">⇅</span>
                                        )}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((row, index) => (
                            <tr
                                key={row.id || index}
                                onClick={() => onRowClick?.(row)}
                                className={onRowClick ? 'cursor-pointer' : ''}
                            >
                                {columns.map((column) => (
                                    <td key={column.key}>
                                        {column.render
                                            ? column.render(row[column.key], row)
                                            : row[column.key]}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// Example usage component
export const InvoiceTable: React.FC<{ invoices: any[] }> = ({ invoices }) => {
    const columns: Column[] = [
        {
            key: 'invoiceNumber',
            label: 'Invoice #',
            sortable: true,
            render: (value) => (
                <span className="font-semibold text-indigo-600">{value}</span>
            )
        },
        {
            key: 'vendorName',
            label: 'Vendor',
            sortable: true
        },
        {
            key: 'total',
            label: 'Amount',
            sortable: true,
            render: (value) => (
                <span className="font-bold text-slate-900">${value.toLocaleString()}</span>
            )
        },
        {
            key: 'status',
            label: 'Status',
            render: (value) => <Badge variant={value === 'paid' ? 'success' : value === 'pending' ? 'warning' : 'error'}>{value}</Badge>
        },
        {
            key: 'dueDate',
            label: 'Due Date',
            sortable: true,
            render: (value) => (
                <span className="text-slate-600">
                    {new Date(value).toLocaleDateString()}
                </span>
            )
        },
        {
            key: 'actions',
            label: 'Actions',
            render: (_, row) => (
                <div className="flex gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            // Handle view
                        }}
                    >
                        View
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            // Handle edit
                        }}
                    >
                        Edit
                    </Button>
                </div>
            )
        }
    ];

    return (
        <Table
            columns={columns}
            data={invoices}
            onRowClick={(row) => console.log('Row clicked:', row)}
            onSort={(key) => console.log('Sort by:', key)}
            emptyMessage="No invoices found. Create your first invoice to get started!"
        />
    );
};
