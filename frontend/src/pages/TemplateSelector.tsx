import { useState, useEffect } from 'react';
import templateService from '../services/templateService';
import type { InvoiceTemplate } from '../types/InvoiceTemplate';
import { Link } from 'react-router-dom';

export default function TemplateSelector() {
    const [presets, setPresets] = useState<InvoiceTemplate[]>([]);
    const [custom, setCustom] = useState<InvoiceTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'presets' | 'custom'>('presets');

    useEffect(() => {
        loadDataAsync();
    }, []);

    const loadDataAsync = async () => {
        try {
            const [presetsData, customData] = await Promise.all([
                templateService.getPresets(),
                templateService.getCustom()
            ]);
            setPresets(presetsData);
            setCustom(customData);
        } catch (error) {
            console.error('Failed to load templates:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDuplicate = async (templateId: string, name: string) => {
        try {
            await templateService.duplicate(templateId, { name: `${name} (Copy)` });
            await loadDataAsync();
        } catch (error) {
            console.error('Failed to duplicate template:', error);
        }
    };

    return (
        <div className="p-8">

            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-slate-900 mb-2" style={{ letterSpacing: '-0.02em' }}>
                    Invoice Templates
                </h1>
                <p className="text-slate-600 text-lg">
                    Choose a preset template or customize your own
                </p>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mb-8 border-b border-slate-200">
                <button
                    className={`px-6 py-3 font-semibold transition-all relative ${activeTab === 'presets'
                        ? 'text-indigo-600'
                        : 'text-slate-600 hover:text-slate-900'
                        }`}
                    onClick={() => setActiveTab('presets')}
                >
                    Preset Templates ({presets.length})
                    {activeTab === 'presets' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />
                    )}
                </button>
                <button
                    className={`px-6 py-3 font-semibold transition-all relative ${activeTab === 'custom'
                        ? 'text-indigo-600'
                        : 'text-slate-600 hover:text-slate-900'
                        }`}
                    onClick={() => setActiveTab('custom')}
                >
                    My Templates ({custom.length})
                    {activeTab === 'custom' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />
                    )}
                </button>
            </div>

            {/* Loading */}
            {loading && (
                <div className="flex justify-center py-20">
                    <div className="text-slate-500">Loading templates...</div>
                </div>
            )}

            {/* Template Grid */}
            {!loading && (
                <>
                    {/* Preset Templates */}
                    {activeTab === 'presets' && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {presets.map((template) => (
                                <div
                                    key={template._id}
                                    className="card-modern hover:shadow-xl transition-all cursor-pointer group"
                                >
                                    {/* Template Preview Thumbnail */}
                                    <div className="h-48 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl mb-4 flex items-center justify-center">
                                        <span className="text-6xl opacity-20">📄</span>
                                    </div>

                                    {/* Template Info */}
                                    <div className="mb-4">
                                        <h3 className="text-lg font-bold text-slate-900 mb-2">
                                            {template.config.name}
                                        </h3>
                                        <p className="text-sm text-slate-600">
                                            {template.config.description || 'Professional invoice template'}
                                        </p>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        <Link
                                            to={`/templates/customize/${template._id}`}
                                            className="flex-1 btn btn-primary btn-sm"
                                        >
                                            Customize
                                        </Link>
                                        <button
                                            onClick={() => handleDuplicate(template._id, template.config.name)}
                                            className="btn btn-ghost btn-sm"
                                            title="Duplicate"
                                        >
                                            📋
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Custom Templates */}
                    {activeTab === 'custom' && (
                        <>
                            {custom.length === 0 ? (
                                <div className="text-center py-20">
                                    <div className="text-6xl mb-4">🎨</div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-2">
                                        No Custom Templates Yet
                                    </h3>
                                    <p className="text-slate-600 mb-6">
                                        Start by customizing a preset template
                                    </p>
                                    <button
                                        onClick={() => setActiveTab('presets')}
                                        className="btn btn-primary"
                                    >
                                        Browse Presets
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {custom.map((template) => (
                                        <div
                                            key={template._id}
                                            className="card-modern hover:shadow-xl transition-all cursor-pointer group relative"
                                        >
                                            {template.isDefault && (
                                                <div className="absolute top-4 right-4 bg-indigo-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                                                    Default
                                                </div>
                                            )}

                                            <div className="h-48 bg-gradient-to-br from-indigo-50 to-violet-50 rounded-xl mb-4 flex items-center justify-center">
                                                <span className="text-6xl opacity-20">✨</span>
                                            </div>

                                            <div className="mb-4">
                                                <h3 className="text-lg font-bold text-slate-900 mb-2">
                                                    {template.name}
                                                </h3>
                                                <p className="text-sm text-slate-600">
                                                    Used {template.usageCount} times
                                                </p>
                                            </div>

                                            <div className="flex gap-2">
                                                <Link
                                                    to={`/templates/customize/${template._id}`}
                                                    className="flex-1 btn btn-primary btn-sm"
                                                >
                                                    Edit
                                                </Link>
                                                <button
                                                    onClick={() => handleDuplicate(template._id, template.name)}
                                                    className="btn btn-ghost btn-sm"
                                                >
                                                    📋
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </>
            )}

        </div>
    );
}
