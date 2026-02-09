import { useState } from 'react';
import type { TemplateConfig } from '../../../../shared/types/InvoiceTemplate';

interface CustomizationPanelProps {
    config: TemplateConfig;
    onChange: (path: string, value: any) => void;
}

export function CustomizationPanel({ config, onChange }: CustomizationPanelProps) {
    const [activeSection, setActiveSection] = useState<string>('header');

    const sections = [
        { id: 'header', label: 'Header', icon: '📄' },
        { id: 'typography', label: 'Typography', icon: '🔤' },
        { id: 'colors', label: 'Colors', icon: '🎨' },
        { id: 'table', label: 'Table', icon: '📊' },
        { id: 'footer', label: 'Footer', icon: '📌' },
        { id: 'layout', label: 'Layout', icon: '📐' }
    ];

    return (
        <div className="h-full flex flex-col">

            {/* Section Tabs */}
            <div className="bg-white border-b border-slate-200 p-4">
                <div className="grid grid-cols-3 gap-2">
                    {sections.map((section) => (
                        <button
                            key={section.id}
                            onClick={() => setActiveSection(section.id)}
                            className={`
                px-3 py-2 rounded-lg text-sm font-medium transition-all
                ${activeSection === section.id
                                    ? 'bg-indigo-600 text-white shadow-sm'
                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}
              `}
                        >
                            <span className="mr-1">{section.icon}</span>
                            {section.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Section Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">

                {/* Header Section */}
                {activeSection === 'header' && (
                    <>
                        <div>
                            <label className="block text-sm font-semibold text-slate-900 mb-2">
                                Header Layout
                            </label>
                            <select
                                value={config.header.layout}
                                onChange={(e) => onChange('header.layout', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                <option value="logo-left">Logo Left</option>
                                <option value="logo-center">Logo Center</option>
                                <option value="logo-right">Logo Right</option>
                                <option value="split">Split</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-900 mb-2">
                                Padding (px)
                            </label>
                            <input
                                type="number"
                                value={config.header.padding}
                                onChange={(e) => onChange('header.padding', parseInt(e.target.value))}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-900 mb-2">
                                Background Color
                            </label>
                            <input
                                type="color"
                                value={config.header.backgroundColor || '#ffffff'}
                                onChange={(e) => onChange('header.backgroundColor', e.target.value)}
                                className="w-full h-10 border border-slate-300 rounded-lg cursor-pointer"
                            />
                        </div>

                        <div>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={config.header.borderBottom !== undefined}
                                    onChange={(e) => onChange('header.borderBottom', e.target.checked ? { width: 1, color: config.colors.border, style: 'solid' } : undefined)}
                                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                                />
                                <span className="text-sm font-medium text-slate-900">Show Bottom Border</span>
                            </label>
                        </div>
                    </>
                )}

                {/* Typography Section */}
                {activeSection === 'typography' && (
                    <>
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-slate-900">Heading Font</h3>

                            <div>
                                <label className="block text-sm font-semibold text-slate-900 mb-2">
                                    Font Family
                                </label>
                                <select
                                    value={config.fonts.heading.family}
                                    onChange={(e) => onChange('fonts.heading.family', e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                >
                                    <option value="Inter">Inter</option>
                                    <option value="Georgia">Georgia</option>
                                    <option value="Montserrat">Montserrat</option>
                                    <option value="Roboto">Roboto</option>
                                    <option value="Open Sans">Open Sans</option>
                                    <option value="Playfair Display">Playfair Display</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-900 mb-2">
                                    Size (px): {config.fonts.heading.size}
                                </label>
                                <input
                                    type="range"
                                    min="20"
                                    max="48"
                                    value={config.fonts.heading.size}
                                    onChange={(e) => onChange('fonts.heading.size', parseInt(e.target.value))}
                                    className="w-full"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-900 mb-2">
                                    Weight
                                </label>
                                <select
                                    value={config.fonts.heading.weight}
                                    onChange={(e) => onChange('fonts.heading.weight', parseInt(e.target.value))}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                >
                                    <option value="400">Regular (400)</option>
                                    <option value="500">Medium (500)</option>
                                    <option value="600">Semi-Bold (600)</option>
                                    <option value="700">Bold (700)</option>
                                    <option value="800">Extra-Bold (800)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-900 mb-2">
                                    Color
                                </label>
                                <input
                                    type="color"
                                    value={config.fonts.heading.color}
                                    onChange={(e) => onChange('fonts.heading.color', e.target.value)}
                                    className="w-full h-10 border border-slate-300 rounded-lg cursor-pointer"
                                />
                            </div>
                        </div>

                        <div className="border-t border-slate-200 pt-4 space-y-4">
                            <h3 className="text-lg font-bold text-slate-900">Body Font</h3>

                            <div>
                                <label className="block text-sm font-semibold text-slate-900 mb-2">
                                    Font Family
                                </label>
                                <select
                                    value={config.fonts.body.family}
                                    onChange={(e) => onChange('fonts.body.family', e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                >
                                    <option value="Inter">Inter</option>
                                    <option value="Arial">Arial</option>
                                    <option value="Roboto">Roboto</option>
                                    <option value="Open Sans">Open Sans</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-900 mb-2">
                                    Size (px): {config.fonts.body.size}
                                </label>
                                <input
                                    type="range"
                                    min="10"
                                    max="18"
                                    value={config.fonts.body.size}
                                    onChange={(e) => onChange('fonts.body.size', parseInt(e.target.value))}
                                    className="w-full"
                                />
                            </div>
                        </div>
                    </>
                )}

                {/* Colors Section */}
                {activeSection === 'colors' && (
                    <>
                        <ColorPicker label="Primary" value={config.colors.primary} onChange={(v) => onChange('colors.primary', v)} />
                        <ColorPicker label="Secondary" value={config.colors.secondary} onChange={(v) => onChange('colors.secondary', v)} />
                        <ColorPicker label="Accent" value={config.colors.accent} onChange={(v) => onChange('colors.accent', v)} />
                        <ColorPicker label="Text" value={config.colors.text} onChange={(v) => onChange('colors.text', v)} />
                        <ColorPicker label="Text Muted" value={config.colors.textMuted} onChange={(v) => onChange('colors.textMuted', v)} />
                        <ColorPicker label="Border" value={config.colors.border} onChange={(v) => onChange('colors.border', v)} />
                        <ColorPicker label="Table Header Background" value={config.colors.tableHeaderBg} onChange={(v) => onChange('colors.tableHeaderBg', v)} />
                        <ColorPicker label="Table Header Text" value={config.colors.tableHeaderText} onChange={(v) => onChange('colors.tableHeaderText', v)} />
                    </>
                )}

                {/* Table Section */}
                {activeSection === 'table' && (
                    <>
                        <div>
                            <label className="block text-sm font-semibold text-slate-900 mb-2">
                                Table Style
                            </label>
                            <select
                                value={config.table.style}
                                onChange={(e) => onChange('table.style', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                <option value="classic">Classic</option>
                                <option value="modern">Modern</option>
                                <option value="minimal">Minimal</option>
                                <option value="striped">Striped</option>
                                <option value="bordered">Bordered</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-900 mb-2">
                                Border Style
                            </label>
                            <select
                                value={config.table.borderStyle}
                                onChange={(e) => onChange('table.borderStyle', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                <option value="all">All Borders</option>
                                <option value="horizontal">Horizontal Only</option>
                                <option value="none">No Borders</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-900 mb-2">
                                Header Text Transform
                            </label>
                            <select
                                value={config.table.header.textTransform}
                                onChange={(e) => onChange('table.header.textTransform', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                <option value="none">Normal</option>
                                <option value="uppercase">UPPERCASE</option>
                            </select>
                        </div>

                        <div>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={config.table.totals.highlightTotal}
                                    onChange={(e) => onChange('table.totals.highlightTotal', e.target.checked)}
                                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                                />
                                <span className="text-sm font-medium text-slate-900">Highlight Total</span>
                            </label>
                        </div>
                    </>
                )}

                {/* Footer Section */}
                {activeSection === 'footer' && (
                    <>
                        <div>
                            <label className="block text-sm font-semibold text-slate-900 mb-2">
                                Footer Layout
                            </label>
                            <select
                                value={config.footer.layout}
                                onChange={(e) => onChange('footer.layout', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                <option value="single-column">Single Column</option>
                                <option value="two-column">Two Columns</option>
                                <option value="centered">Centered</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-900 mb-2">
                                Thank You Text
                            </label>
                            <input
                                type="text"
                                value={config.footer.thankYou.text}
                                onChange={(e) => onChange('footer.thankYou.text', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>

                        <div>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={config.footer.paymentInfo.showBankDetails}
                                    onChange={(e) => onChange('footer.paymentInfo.showBankDetails', e.target.checked)}
                                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                                />
                                <span className="text-sm font-medium text-slate-900">Show Bank Details</span>
                            </label>
                        </div>
                    </>
                )}

                {/* Layout Section */}
                {activeSection === 'layout' && (
                    <>
                        <div>
                            <label className="block text-sm font-semibold text-slate-900 mb-2">
                                Page Size
                            </label>
                            <select
                                value={config.layout.pageSize}
                                onChange={(e) => onChange('layout.pageSize', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                <option value="A4">A4</option>
                                <option value="Letter">Letter</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-900 mb-2">
                                Page Margin (px): {config.layout.pageMargin}
                            </label>
                            <input
                                type="range"
                                min="20"
                                max="80"
                                value={config.layout.pageMargin}
                                onChange={(e) => onChange('layout.pageMargin', parseInt(e.target.value))}
                                className="w-full"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-900 mb-2">
                                Section Gap (px): {config.layout.sectionGap}
                            </label>
                            <input
                                type="range"
                                min="16"
                                max="64"
                                value={config.layout.sectionGap}
                                onChange={(e) => onChange('layout.sectionGap', parseInt(e.target.value))}
                                className="w-full"
                            />
                        </div>
                    </>
                )}

            </div>
        </div>
    );
}

function ColorPicker({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
    return (
        <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
                {label}
            </label>
            <div className="flex gap-2">
                <input
                    type="color"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-12 h-10 border border-slate-300 rounded-lg cursor-pointer"
                />
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm"
                    placeholder="#000000"
                />
            </div>
        </div>
    );
}
