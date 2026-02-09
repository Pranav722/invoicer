import { useState } from 'react';
import type { InvoiceLayout } from '../types/invoice-layout.types';
import { invoiceLayouts, getLayoutsByCategory } from '../constants/invoice-layouts';
import { Card, CardBody, Badge } from './ui';

interface TemplateGalleryProps {
    selectedLayoutId?: string;
    onSelectLayout: (layout: InvoiceLayout) => void;
}

export default function TemplateGallery({ selectedLayoutId, onSelectLayout }: TemplateGalleryProps) {
    const [filter, setFilter] = useState<'all' | 'professional' | 'modern' | 'creative' | 'minimal' | 'technical'>('all');

    const filteredLayouts = filter === 'all'
        ? invoiceLayouts
        : getLayoutsByCategory(filter);

    const categories = ['all', 'professional', 'modern', 'creative', 'minimal', 'technical'] as const;

    return (
        <div>
            {/* Filter Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto">
                {categories.map((category) => (
                    <button
                        key={category}
                        onClick={() => setFilter(category)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${filter === category
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                    </button>
                ))}
            </div>

            {/* Template Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredLayouts.map((layout) => (
                    <Card
                        key={layout.id}
                        className={`cursor-pointer transition hover:shadow-xl group ${selectedLayoutId === layout.id ? 'ring-2 ring-primary-600' : ''
                            }`}
                        onClick={() => onSelectLayout(layout)}
                    >
                        <CardBody>
                            {/* Template Preview */}
                            <div className="aspect-[8.5/11] bg-gray-50 rounded-lg mb-4 flex items-center justify-center overflow-hidden relative">
                                {/* Mini preview visualization */}
                                <div className="w-full h-full p-4 text-xs">
                                    <TemplatePreviewMini layout={layout} />
                                </div>

                                {/* Selected indicator */}
                                {selectedLayoutId === layout.id && (
                                    <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center">
                                        ✓
                                    </div>
                                )}

                                {/* Hover overlay */}
                                <div className="absolute inset-0 bg-primary-600 bg-opacity-0 group-hover:bg-opacity-10 transition flex items-center justify-center">
                                    <span className="text-white font-semibold opacity-0 group-hover:opacity-100 transition">
                                        Select Template
                                    </span>
                                </div>
                            </div>

                            {/* Template Info */}
                            <div>
                                <div className="flex items-start justify-between mb-2">
                                    <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition">
                                        {layout.name}
                                    </h3>
                                    {layout.category && (
                                        <Badge variant="info" className="text-xs">
                                            {layout.category}
                                        </Badge>
                                    )}
                                </div>
                                <p className="text-sm text-gray-600 mb-3">{layout.description}</p>

                                {/* Tags */}
                                {layout.tags && layout.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                        {layout.tags.slice(0, 3).map((tag) => (
                                            <span
                                                key={tag}
                                                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </CardBody>
                    </Card>
                ))}
            </div>
        </div>
    );
}

/**
 * Mini preview component that shows the layout structure
 */
function TemplatePreviewMini({ layout }: { layout: InvoiceLayout }) {
    const { zones, styles } = layout;

    return (
        <div className="w-full h-full bg-white border border-gray-200 rounded p-2 overflow-hidden">
            {/* Header */}
            <div
                className={`h-6 bg-gray-300 rounded mb-1 ${zones.header.columns === 12 ? 'w-full' :
                    zones.header.columns === 6 ? 'w-1/2' : 'w-1/3'
                    } ${zones.header.alignment === 'center' ? 'mx-auto' :
                        zones.header.alignment === 'right' ? 'ml-auto' : ''
                    }`}
            />

            {/* Metadata */}
            <div
                className={`h-4 bg-gray-200 rounded mb-1 ${zones.metadata.columns === 12 ? 'w-full' :
                    zones.metadata.columns === 6 ? 'w-1/2' : 'w-1/3'
                    } ${zones.metadata.alignment === 'center' ? 'mx-auto' :
                        zones.metadata.alignment === 'right' ? 'ml-auto' : ''
                    }`}
            />

            {/* Billing */}
            <div className="flex gap-1 mb-1">
                <div className={`h-5 bg-gray-200 rounded ${styles.billingLayout === 'side-by-side' ? 'w-1/2' : 'w-full'
                    }`} />
                {styles.billingLayout === 'side-by-side' && (
                    <div className="h-5 bg-gray-200 rounded w-1/2" />
                )}
            </div>

            {/* Items table */}
            <div className="space-y-0.5 mb-1">
                <div className="h-2 bg-primary-400 rounded w-full" />
                <div className="h-1.5 bg-gray-100 rounded w-full" />
                <div className="h-1.5 bg-gray-100 rounded w-full" />
                <div className="h-1.5 bg-gray-100 rounded w-full" />
            </div>

            {/* Totals */}
            <div
                className={`h-4 bg-gray-300 rounded ${styles.totalsAlign === 'right' ? 'ml-auto w-1/3' :
                    styles.totalsAlign === 'center' ? 'mx-auto w-1/3' :
                        styles.totalsAlign === 'left' ? 'w-1/3' : 'w-full'
                    }`}
            />
        </div>
    );
}
