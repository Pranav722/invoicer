import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import templateService from '../services/templateService';
import type { InvoiceTemplate, TemplateConfig } from '../../../shared/types/InvoiceTemplate';
import { InvoiceRenderer } from '../components/invoice/InvoiceRenderer';
import { CustomizationPanel } from '../components/editor/CustomizationPanel';
import { generateMockInvoice } from '../utils/mockDataGenerator';

export default function TemplateEditor() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [template, setTemplate] = useState<InvoiceTemplate | null>(null);
    const [liveConfig, setLiveConfig] = useState<TemplateConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [previewScale, setPreviewScale] = useState(0.6);
    const [mockInvoice] = useState(generateMockInvoice());

    useEffect(() => {
        loadTemplate();
    }, [id]);

    const loadTemplate = async () => {
        try {
            if (!id) return;
            const data = await templateService.getById(id);
            setTemplate(data);
            setLiveConfig(data.config);
            setLoading(false);
        } catch (error) {
            console.error('Failed to load template:', error);
            setLoading(false);
        }
    };

    const handleConfigChange = (path: string, value: any) => {
        if (!liveConfig) return;

        const newConfig = { ...liveConfig };
        setNestedProperty(newConfig, path, value);
        setLiveConfig(newConfig);
        setIsDirty(true);
    };

    const setNestedProperty = (obj: any, path: string, value: any) => {
        const keys = path.split('.');
        let current = obj;

        for (let i = 0; i < keys.length - 1; i++) {
            if (!current[keys[i]]) {
                current[keys[i]] = {};
            }
            current = current[keys[i]];
        }

        current[keys[keys.length - 1]] = value;
    };

    const handleSave = async () => {
        if (!template || !liveConfig) return;

        setSaving(true);
        try {
            if (template.type === 'preset') {
                // Duplicate as custom template
                const newTemplate = await templateService.duplicate(template._id, {
                    name: `${template.config.name} (Custom)`,
                    modifications: liveConfig
                });
                navigate(`/templates/customize/${newTemplate._id}`);
            } else {
                // Update existing custom template
                await templateService.update(template._id, {
                    config: liveConfig
                });
                setIsDirty(false);
            }
        } catch (error) {
            console.error('Failed to save template:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleReset = () => {
        if (template) {
            setLiveConfig(template.config);
            setIsDirty(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-slate-600">Loading template...</div>
            </div>
        );
    }

    if (!template || !liveConfig) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-slate-600">Template not found</div>
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col">

            {/* Top Bar */}
            <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/templates')}
                        className="text-slate-600 hover:text-slate-900 transition"
                    >
                        ← Back
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900">
                            {template.config.name}
                        </h1>
                        <p className="text-sm text-slate-600">
                            {template.type === 'preset' ? 'Preset Template' : 'Custom Template'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {isDirty && (
                        <span className="text-sm text-amber-600 font-medium">
                            • Unsaved changes
                        </span>
                    )}

                    <div className="flex items-center gap-2 text-sm text-slate-600">
                        <span>Preview:</span>
                        <input
                            type="range"
                            min="0.4"
                            max="1"
                            step="0.1"
                            value={previewScale}
                            onChange={(e) => setPreviewScale(parseFloat(e.target.value))}
                            className="w-24"
                        />
                        <span>{Math.round(previewScale * 100)}%</span>
                    </div>

                    {isDirty && (
                        <button
                            onClick={handleReset}
                            className="btn btn-ghost btn-sm"
                        >
                            Reset
                        </button>
                    )}

                    <button
                        onClick={handleSave}
                        disabled={saving || !isDirty}
                        className="btn btn-primary btn-sm"
                    >
                        {saving ? 'Saving...' : template.type === 'preset' ? 'Save as Custom' : 'Save Changes'}
                    </button>
                </div>
            </div>

            {/* Main Content: Split View */}
            <div className="flex-1 flex overflow-hidden">

                {/* Left: Customization Panel */}
                <div className="w-96 bg-slate-50 border-r border-slate-200 overflow-y-auto">
                    <CustomizationPanel
                        config={liveConfig}
                        onChange={handleConfigChange}
                    />
                </div>

                {/* Right: Live Preview */}
                <div className="flex-1 bg-slate-100 overflow-auto p-8">
                    <div className="flex justify-center">
                        <div className="bg-white shadow-2xl" style={{
                            transform: `scale(${previewScale})`,
                            transformOrigin: 'top center',
                            transition: 'transform 0.2s ease'
                        }}>
                            <InvoiceRenderer
                                invoice={mockInvoice}
                                template={{ ...template, config: liveConfig }}
                                scale={1}
                            />
                        </div>
                    </div>
                </div>

            </div>

        </div>
    );
}
