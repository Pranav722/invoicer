import { Card, CardBody, Button } from '../components/ui';
import TemplateGallery from '../components/TemplateGallery';
import type { InvoiceLayout } from '../types/invoice-layout.types';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function Templates() {
    const navigate = useNavigate();
    const [selectedLayout, setSelectedLayout] = useState<InvoiceLayout | null>(null);

    const handleSelectTemplate = (layout: InvoiceLayout) => {
        setSelectedLayout(layout);
    };

    const handleUseTemplate = () => {
        if (selectedLayout) {
            // Navigate to create invoice with selected template
            navigate(`/invoices/create?template=${selectedLayout.id}`);
        }
    };

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Invoice Templates</h1>
                    <p className="text-gray-600">Browse and select from 14 professionally designed layouts</p>
                </div>
                {selectedLayout && (
                    <Button variant="primary" size="lg" onClick={handleUseTemplate}>
                        Use {selectedLayout.name} →
                    </Button>
                )}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Card elevated>
                    <CardBody>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center text-2xl">
                                📄
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-gray-900">14</div>
                                <div className="text-sm text-gray-600">Total Templates</div>
                            </div>
                        </div>
                    </CardBody>
                </Card>

                <Card elevated>
                    <CardBody>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-success-50 flex items-center justify-center text-2xl">
                                💼
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-gray-900">5</div>
                                <div className="text-sm text-gray-600">Professional</div>
                            </div>
                        </div>
                    </CardBody>
                </Card>

                <Card elevated>
                    <CardBody>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-warning-50 flex items-center justify-center text-2xl">
                                ✨
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-gray-900">4</div>
                                <div className="text-sm text-gray-600">Modern</div>
                            </div>
                        </div>
                    </CardBody>
                </Card>

                <Card elevated>
                    <CardBody>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-info-50 flex items-center justify-center text-2xl">
                                🎨
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-gray-900">3</div>
                                <div className="text-sm text-gray-600">Creative</div>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* Template Gallery */}
            <TemplateGallery
                selectedLayoutId={selectedLayout?.id}
                onSelectLayout={handleSelectTemplate}
            />

            {/* Bottom CTA */}
            {selectedLayout && (
                <div className="mt-8 p-6 bg-primary-50 rounded-xl border border-primary-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-primary-900 mb-1">
                                Ready to create your invoice?
                            </h3>
                            <p className="text-sm text-primary-700">
                                You've selected <strong>{selectedLayout.name}</strong> - {selectedLayout.description}
                            </p>
                        </div>
                        <Button variant="primary" size="lg" onClick={handleUseTemplate}>
                            Create Invoice →
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
