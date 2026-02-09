import React from 'react';
import type { TableConfig, ColorPalette, FontConfig } from '../../types/InvoiceTemplate';

interface TableComponentProps {
    items: any[];
    subtotal: number;
    tax: number;
    total: number;
    config: TableConfig;
    colors: ColorPalette;
    fonts: { heading: FontConfig; body: FontConfig; label: FontConfig };
}

export function TableComponent({ items, subtotal, tax, total, config, colors, fonts }: TableComponentProps) {
    const getBorderStyle = () => {
        switch (config.borderStyle) {
            case 'all':
                return { border: `${config.borderWidth}px solid ${config.borderColor}` };
            case 'horizontal':
                return { borderTop: `${config.borderWidth}px solid ${config.borderColor}`, borderBottom: `${config.borderWidth}px solid ${config.borderColor}` };
            case 'none':
                return {};
            default:
                return {};
        }
    };

    const tableClass = `table-${config.style}`;

    const headerStyle: React.CSSProperties = {
        backgroundColor: config.header.backgroundColor,
        color: config.header.textColor,
        fontSize: `${config.header.fontSize}px`,
        fontWeight: config.header.fontWeight,
        textTransform: config.header.textTransform,
        padding: `${config.header.padding}px`,
    };

    const getRowStyle = (index: number): React.CSSProperties => ({
        backgroundColor: index % 2 === 0
            ? config.rows.backgroundColor
            : config.rows.alternateRowBg || config.rows.backgroundColor,
        color: config.rows.textColor,
        fontSize: `${config.rows.fontSize}px`,
        padding: `${config.rows.padding}px`
    });

    return (
        <div>
            <table
                style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontFamily: fonts.body.family,
                    ...getBorderStyle()
                }}
                className={tableClass}
            >
                <thead>
                    <tr style={headerStyle}>
                        <th style={{
                            textAlign: config.columns.description.alignment,
                            width: config.columns.description.width,
                            padding: `${config.header.padding}px`
                        }}>
                            Description
                        </th>
                        <th style={{
                            textAlign: config.columns.quantity.alignment,
                            width: config.columns.quantity.width,
                            padding: `${config.header.padding}px`
                        }}>
                            Qty
                        </th>
                        <th style={{
                            textAlign: config.columns.rate.alignment,
                            width: config.columns.rate.width,
                            padding: `${config.header.padding}px`
                        }}>
                            Rate
                        </th>
                        <th style={{
                            textAlign: config.columns.amount.alignment,
                            width: config.columns.amount.width,
                            padding: `${config.header.padding}px`
                        }}>
                            Amount
                        </th>
                    </tr>
                </thead>

                <tbody>
                    {items.map((item, index) => (
                        <tr
                            key={item._id || index}
                            style={getRowStyle(index)}
                            className={config.rows.hoverEffect ? 'hover:bg-opacity-80' : ''}
                        >
                            <td style={{
                                textAlign: config.columns.description.alignment,
                                padding: `${config.rows.padding}px`,
                                borderBottom: config.borderStyle === 'all' || config.borderStyle === 'horizontal'
                                    ? `${config.borderWidth}px solid ${config.borderColor}`
                                    : 'none'
                            }}>
                                {item.description}
                            </td>
                            <td style={{
                                textAlign: config.columns.quantity.alignment,
                                padding: `${config.rows.padding}px`,
                                borderBottom: config.borderStyle === 'all' || config.borderStyle === 'horizontal'
                                    ? `${config.borderWidth}px solid ${config.borderColor}`
                                    : 'none'
                            }}>
                                {item.quantity}
                            </td>
                            <td style={{
                                textAlign: config.columns.rate.alignment,
                                padding: `${config.rows.padding}px`,
                                borderBottom: config.borderStyle === 'all' || config.borderStyle === 'horizontal'
                                    ? `${config.borderWidth}px solid ${config.borderColor}`
                                    : 'none'
                            }}>
                                ${item.rate.toFixed(2)}
                            </td>
                            <td style={{
                                textAlign: config.columns.amount.alignment,
                                padding: `${config.rows.padding}px`,
                                borderBottom: config.borderStyle === 'all' || config.borderStyle === 'horizontal'
                                    ? `${config.borderWidth}px solid ${config.borderColor}`
                                    : 'none'
                            }}>
                                ${item.amount.toFixed(2)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Totals Section */}
            <div
                className={config.totals.position === 'full-width' ? 'w-full' : 'ml-auto max-w-sm'}
                style={{
                    marginTop: '24px',
                    backgroundColor: config.totals.backgroundColor,
                    padding: '16px'
                }}
            >
                <div className="flex justify-between mb-2">
                    <span style={{ fontWeight: config.totals.labelWeight }}>Subtotal:</span>
                    <span style={{ fontWeight: config.totals.valueWeight }}>${subtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between mb-2">
                    <span style={{ fontWeight: config.totals.labelWeight }}>Tax:</span>
                    <span style={{ fontWeight: config.totals.valueWeight }}>${tax.toFixed(2)}</span>
                </div>

                <div
                    className="flex justify-between pt-3 border-t"
                    style={{
                        borderColor: colors.border,
                        fontSize: `${config.totals.totalFontSize}px`,
                        fontWeight: config.totals.highlightTotal ? 700 : config.totals.valueWeight,
                        color: config.totals.highlightTotal ? colors.primary : colors.text
                    }}
                >
                    <span>Total:</span>
                    <span>${total.toFixed(2)}</span>
                </div>
            </div>
        </div>
    );
}
