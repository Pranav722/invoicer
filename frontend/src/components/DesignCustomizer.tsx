import type { DesignConfig, ColorTheme, InvoiceLayout, TableVariant } from '../types/InvoiceDesign';
import { designConfigs } from '../data/invoiceDesigns';

interface DesignCustomizerProps {
    settings: DesignConfig;
    onChange: (settings: DesignConfig) => void;
}

const colorThemes: { id: ColorTheme; label: string; primary: string }[] = [
    { id: 'corporate-blue', label: 'Corporate', primary: '#2563eb' },
    { id: 'modern-slate', label: 'Modern', primary: '#475569' },
    { id: 'creative-purple', label: 'Creative', primary: '#7c3aed' },
    { id: 'finance-green', label: 'Finance', primary: '#059669' },
    { id: 'warm-orange', label: 'Warm', primary: '#ea580c' },
    { id: 'luxury-gold', label: 'Luxury', primary: '#d97706' },
    { id: 'nature-teal', label: 'Nature', primary: '#0d9488' },
    { id: 'midnight-neon', label: 'Neon', primary: '#06b6d4' },
    { id: 'ocean-gradient', label: 'Ocean', primary: '#0ea5e9' },
    { id: 'monochrome', label: 'Mono', primary: '#000000' }
];

export default function DesignCustomizer({ settings, onChange }: DesignCustomizerProps) {

    const updateTheme = (field: keyof DesignConfig['theme'], value: string) => {
        onChange({
            ...settings,
            theme: { ...settings.theme, [field]: value }
        });
    };

    const updateTypography = (field: keyof DesignConfig['typography'], value: any) => {
        onChange({
            ...settings,
            typography: { ...settings.typography, [field]: value }
        });
    };

    const updateComponents = (field: keyof DesignConfig['components'], value: any) => {
        onChange({
            ...settings,
            components: { ...settings.components, [field]: value }
        });
    };

    const applyThemePreset = (themeId: ColorTheme) => {
        // Find a preset definition to copy colors from? or just set the theme ID? 
        // For now, let's find a design that uses this theme or define defaults
        // Actually, let's just update the primary color based on our local list for now
        // A better approach might be to have a separate 'themes' data file, but for now we'll just set primary
        const theme = colorThemes.find(t => t.id === themeId);
        if (theme) {
            onChange({
                ...settings,
                theme: {
                    ...settings.theme,
                    primary: theme.primary,
                    // We could map other colors here if we had a full theme palette definition
                }
            });
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-8">
            <div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">Design Customization</h3>
                <p className="text-sm text-slate-600">Fine-tune your selected template</p>
            </div>

            {/* Layout & Typography */}
            <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Typography</h4>

                {/* Font Family */}
                <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-2">Font Family</label>
                    <div className="grid grid-cols-3 gap-2">
                        {[
                            { label: 'Sans', value: 'font-sans' },
                            { label: 'Serif', value: 'font-serif' },
                            { label: 'Mono', value: 'font-mono' }
                        ].map(opt => (
                            <button
                                key={opt.value}
                                onClick={() => updateTypography('fontFamily', opt.value)}
                                className={`px-3 py-2 text-sm border rounded-md transition-colors ${settings.typography.fontFamily === opt.value
                                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                                    : 'border-slate-200 hover:border-slate-300'
                                    }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Header Case */}
                <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-2">Header Format</label>
                    <div className="grid grid-cols-3 gap-2">
                        {['uppercase', 'capitalize', 'lowercase'].map((c) => (
                            <button
                                key={c}
                                onClick={() => updateTypography('headerCase', c)}
                                className={`px-3 py-2 text-sm border rounded-md transition-colors capitalize ${settings.typography.headerCase === c
                                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                                    : 'border-slate-200 hover:border-slate-300'
                                    }`}
                            >
                                {c}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Font Size */}
                <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-2">Base Size</label>
                    <div className="grid grid-cols-3 gap-2">
                        {['compact', 'standard', 'large'].map((s) => (
                            <button
                                key={s}
                                onClick={() => updateTypography('fontSize', s)}
                                className={`px-3 py-2 text-sm border rounded-md transition-colors capitalize ${settings.typography.fontSize === s
                                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                                    : 'border-slate-200 hover:border-slate-300'
                                    }`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <hr className="border-slate-100" />

            {/* Colors */}
            <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Theme Colors</h4>

                {/* Color Pickers */}
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Primary</label>
                        <div className="flex gap-2">
                            <input
                                type="color"
                                value={settings.theme.primary.startsWith('#') ? settings.theme.primary : '#000000'} // Handle Tailwind classes gracefully? No, input color needs hex. 
                                // Ideally we should convert tailwind class to hex or just support hex in the new design system.
                                // The new system seems to support both based on usage, but <input type="color"> needs hex.
                                onChange={(e) => updateTheme('primary', e.target.value)}
                                className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                            />
                            <input
                                type="text"
                                value={settings.theme.primary}
                                onChange={(e) => updateTheme('primary', e.target.value)}
                                className="flex-1 px-2 py-1 text-xs border border-slate-300 rounded"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Secondary</label>
                        <div className="flex gap-2">
                            <input
                                type="color"
                                value={settings.theme.secondary.startsWith('#') ? settings.theme.secondary : '#cccccc'}
                                onChange={(e) => updateTheme('secondary', e.target.value)}
                                className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                            />
                            <input
                                type="text"
                                value={settings.theme.secondary}
                                onChange={(e) => updateTheme('secondary', e.target.value)}
                                className="flex-1 px-2 py-1 text-xs border border-slate-300 rounded"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Background</label>
                        <div className="flex gap-2">
                            <input
                                type="color"
                                value={settings.theme.background.startsWith('#') ? settings.theme.background : '#ffffff'}
                                onChange={(e) => updateTheme('background', e.target.value)}
                                className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                            />
                            <input
                                type="text"
                                value={settings.theme.background}
                                onChange={(e) => updateTheme('background', e.target.value)}
                                className="flex-1 px-2 py-1 text-xs border border-slate-300 rounded"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Text</label>
                        <div className="flex gap-2">
                            <input
                                type="color"
                                value={settings.theme.text.startsWith('#') ? settings.theme.text : '#000000'}
                                onChange={(e) => updateTheme('text', e.target.value)}
                                className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                            />
                            <input
                                type="text"
                                value={settings.theme.text}
                                onChange={(e) => updateTheme('text', e.target.value)}
                                className="flex-1 px-2 py-1 text-xs border border-slate-300 rounded"
                            />
                        </div>
                    </div>
                </div>

                {/* Theme Presets */}
                <div>
                    <label className="block text-xs font-medium text-slate-600 mb-2">Quick Palettes</label>
                    <div className="flex flex-wrap gap-2">
                        {colorThemes.map(t => (
                            <button
                                key={t.id}
                                onClick={() => applyThemePreset(t.id)}
                                className="w-6 h-6 rounded-full border border-slate-200 hover:scale-110 transition-transform"
                                style={{ backgroundColor: t.primary }}
                                title={t.label}
                            />
                        ))}
                    </div>
                </div>
            </div>

            <hr className="border-slate-100" />

            {/* Components */}
            <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Components</h4>

                {/* Border Radius */}
                <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-2">Corner Radius</label>
                    <select
                        value={settings.components.borderRadius}
                        onChange={(e) => updateComponents('borderRadius', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="rounded-none">Sharp (Square)</option>
                        <option value="rounded-sm">Slight</option>
                        <option value="rounded-md">Standard</option>
                        <option value="rounded-lg">Large</option>
                        <option value="rounded-xl">Extra Large</option>
                        <option value="rounded-3xl">Pill</option>
                    </select>
                </div>

                {/* Shadows */}
                <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-2">Depth (Shadow)</label>
                    <select
                        value={settings.components.shadow}
                        onChange={(e) => updateComponents('shadow', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="shadow-none">Flat (No Shadow)</option>
                        <option value="shadow-sm">Subtle</option>
                        <option value="shadow-md">Medium</option>
                        <option value="shadow-lg">Elevated</option>
                        <option value="shadow-xl">High</option>
                        <option value="shadow-2xl">Floating</option>
                    </select>
                </div>

                {/* Logo Position */}
                <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-2">Logo Position</label>
                    <div className="grid grid-cols-3 gap-2">
                        {['left', 'center', 'right'].map((pos) => (
                            <button
                                key={pos}
                                onClick={() => updateComponents('logoPosition', pos)}
                                className={`px-3 py-2 text-sm border rounded-md transition-colors capitalize ${settings.components.logoPosition === pos
                                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                                    : 'border-slate-200 hover:border-slate-300'
                                    }`}
                            >
                                {pos}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Table Style */}
                <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-2">Table Style</label>
                    <select
                        value={settings.tableStyles}
                        onChange={(e) => onChange({ ...settings, tableStyles: e.target.value as TableVariant })}
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="simple-border">Simple Border</option>
                        <option value="striped">Striped Rows</option>
                        <option value="floating-card">Floating Cards</option>
                        <option value="minimal-lines">Minimal Lines</option>
                        <option value="bold-header">Bold Header</option>
                        <option value="compact-grid">Compact Grid</option>
                    </select>
                </div>
            </div>
        </div>
    );
}
