import type { DesignConfig } from '../types/InvoiceDesign';

export const designConfigs: DesignConfig[] = [
    // 1. The Standard Corporate
    {
        id: 'corp-standard',
        name: 'Corporate Classic',
        description: 'Clean, reliable, blue-based design standard for B2B.',
        layout: 'classic-top',
        theme: { primary: 'bg-blue-600', secondary: 'bg-blue-50', background: 'bg-white', text: 'text-slate-800', surface: 'bg-white' },
        typography: { fontFamily: 'font-sans', headerCase: 'capitalize', fontSize: 'standard' },
        components: { borderRadius: 'rounded-md', shadow: 'shadow-sm', logoPosition: 'left' },
        tableStyles: 'striped'
    },
    // 2. The Modern SaaS
    {
        id: 'modern-saas',
        name: 'Tech Modern',
        description: 'Dark mode aesthetic with sleek grays.',
        layout: 'banner-header',
        theme: { primary: 'bg-indigo-600', secondary: 'bg-indigo-900', background: 'bg-slate-900', text: 'text-slate-200', surface: 'bg-slate-800' },
        typography: { fontFamily: 'font-sans', headerCase: 'uppercase', fontSize: 'standard' },
        components: { borderRadius: 'rounded-xl', shadow: 'shadow-2xl', logoPosition: 'left' },
        tableStyles: 'floating-card'
    },
    // 3. The Minimalist
    {
        id: 'minimal-ink',
        name: 'Ink Minimal',
        description: 'High whitespace, black and white only.',
        layout: 'minimal-centered',
        theme: { primary: 'bg-black', secondary: 'bg-gray-100', background: 'bg-white', text: 'text-black', surface: 'bg-white' },
        typography: { fontFamily: 'font-serif', headerCase: 'lowercase', fontSize: 'large' },
        components: { borderRadius: 'rounded-none', shadow: 'shadow-none', logoPosition: 'center' },
        tableStyles: 'minimal-lines'
    },
    // 4. The Sidebar Creative
    {
        id: 'creative-sidebar',
        name: 'Creative Studio',
        description: 'Left sidebar navigation style invoice.',
        layout: 'sidebar-left',
        theme: { primary: 'bg-violet-500', secondary: 'bg-violet-100', background: 'bg-stone-50', text: 'text-stone-800', surface: 'bg-white' },
        typography: { fontFamily: 'font-sans', headerCase: 'uppercase', fontSize: 'standard' },
        components: { borderRadius: 'rounded-r-xl', shadow: 'shadow-lg', logoPosition: 'left' },
        tableStyles: 'simple-border'
    },
    // 5. The Financial Grid
    {
        id: 'finance-grid',
        name: 'Wall Street',
        description: 'Dense information, grid lines, serious.',
        layout: 'classic-top',
        theme: { primary: 'bg-emerald-700', secondary: 'bg-emerald-50', background: 'bg-gray-50', text: 'text-gray-900', surface: 'bg-white' },
        typography: { fontFamily: 'font-mono', headerCase: 'capitalize', fontSize: 'compact' },
        components: { borderRadius: 'rounded-sm', shadow: 'shadow-none', logoPosition: 'right' },
        tableStyles: 'compact-grid'
    },
    // 6. The Bold Header
    {
        id: 'bold-header',
        name: 'Impact',
        description: 'Huge colored header area.',
        layout: 'banner-header',
        theme: { primary: 'bg-rose-600', secondary: 'bg-rose-50', background: 'bg-white', text: 'text-gray-800', surface: 'bg-white' },
        typography: { fontFamily: 'font-sans', headerCase: 'uppercase', fontSize: 'large' },
        components: { borderRadius: 'rounded-none', shadow: 'shadow-md', logoPosition: 'center' },
        tableStyles: 'bold-header'
    },
    // 7. The Split Vertical
    {
        id: 'split-view',
        name: 'Dual Tone',
        description: '50/50 vertical split layout.',
        layout: 'split-vertical',
        theme: { primary: 'bg-teal-600', secondary: 'bg-teal-800', background: 'bg-white', text: 'text-gray-800', surface: 'bg-teal-50' },
        typography: { fontFamily: 'font-sans', headerCase: 'capitalize', fontSize: 'standard' },
        components: { borderRadius: 'rounded-none', shadow: 'shadow-none', logoPosition: 'left' },
        tableStyles: 'minimal-lines'
    },
    // 8. The Receipt Style
    {
        id: 'receipt-mono',
        name: 'Thermal Receipt',
        description: 'Looks like a long shop receipt.',
        layout: 'minimal-centered',
        theme: { primary: 'bg-gray-800', secondary: 'bg-gray-200', background: 'bg-yellow-50', text: 'text-gray-800', surface: 'bg-white' },
        typography: { fontFamily: 'font-mono', headerCase: 'uppercase', fontSize: 'compact' },
        components: { borderRadius: 'rounded-none', shadow: 'shadow-none', logoPosition: 'center' },
        tableStyles: 'compact-grid'
    },
    // 9. The Luxury
    {
        id: 'luxury-serif',
        name: 'Gatsby',
        description: 'Gold accents, elegant serif fonts.',
        layout: 'classic-top',
        theme: { primary: 'bg-amber-600', secondary: 'bg-amber-50', background: 'bg-stone-50', text: 'text-stone-900', surface: 'bg-stone-100' },
        typography: { fontFamily: 'font-serif', headerCase: 'capitalize', fontSize: 'standard' },
        components: { borderRadius: 'rounded-sm', shadow: 'shadow-xl', logoPosition: 'center' },
        tableStyles: 'minimal-lines'
    },
    // 10. The Pill (Round UI)
    {
        id: 'round-ui',
        name: 'Bubble Pop',
        description: 'Heavily rounded corners, soft UI.',
        layout: 'classic-top',
        theme: { primary: 'bg-pink-500', secondary: 'bg-pink-100', background: 'bg-gray-50', text: 'text-gray-700', surface: 'bg-white' },
        typography: { fontFamily: 'font-sans', headerCase: 'capitalize', fontSize: 'standard' },
        components: { borderRadius: 'rounded-[2rem]', shadow: 'shadow-sm', logoPosition: 'left' },
        tableStyles: 'floating-card'
    },
    // 11. The Blueprint
    {
        id: 'blueprint',
        name: 'Architect',
        description: 'Blue background, white lines.',
        layout: 'classic-top',
        theme: { primary: 'bg-white', secondary: 'bg-blue-800', background: 'bg-blue-600', text: 'text-white', surface: 'bg-blue-600' },
        typography: { fontFamily: 'font-mono', headerCase: 'uppercase', fontSize: 'compact' },
        components: { borderRadius: 'rounded-none', shadow: 'shadow-none', logoPosition: 'right' },
        tableStyles: 'simple-border' // Needs white borders overrides
    },
    // 12. The Sidebar Right
    {
        id: 'sidebar-right',
        name: 'Right Align',
        description: 'Navigation and totals on the right.',
        layout: 'sidebar-right',
        theme: { primary: 'bg-cyan-600', secondary: 'bg-cyan-50', background: 'bg-white', text: 'text-slate-700', surface: 'bg-gray-50' },
        typography: { fontFamily: 'font-sans', headerCase: 'capitalize', fontSize: 'standard' },
        components: { borderRadius: 'rounded-l-xl', shadow: 'shadow-md', logoPosition: 'right' },
        tableStyles: 'striped'
    },
    // 13. The Neo-Brutalism
    {
        id: 'neo-brutal',
        name: 'Hard Edge',
        description: 'Thick black borders, bold colors, no shadows.',
        layout: 'banner-header',
        theme: { primary: 'bg-lime-400', secondary: 'bg-purple-400', background: 'bg-white', text: 'text-black', surface: 'bg-white' },
        typography: { fontFamily: 'font-mono', headerCase: 'uppercase', fontSize: 'large' },
        components: { borderRadius: 'rounded-none', shadow: 'shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]', logoPosition: 'left' },
        tableStyles: 'bold-header'
    },
    // 14. The Soft Gradient
    {
        id: 'soft-grad',
        name: 'Aurora',
        description: 'Mesh gradient background.',
        layout: 'classic-top',
        theme: { primary: 'bg-fuchsia-600', secondary: 'bg-fuchsia-50', background: 'bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50', text: 'text-slate-800', surface: 'bg-white/80 backdrop-blur-sm' },
        typography: { fontFamily: 'font-sans', headerCase: 'capitalize', fontSize: 'standard' },
        components: { borderRadius: 'rounded-2xl', shadow: 'shadow-lg', logoPosition: 'center' },
        tableStyles: 'minimal-lines'
    },
    // 15. The Compact List
    {
        id: 'compact-list',
        name: 'Data Density',
        description: 'For invoices with 50+ items.',
        layout: 'classic-top',
        theme: { primary: 'bg-slate-600', secondary: 'bg-slate-200', background: 'bg-white', text: 'text-slate-900', surface: 'bg-white' },
        typography: { fontFamily: 'font-sans', headerCase: 'uppercase', fontSize: 'compact' },
        components: { borderRadius: 'rounded', shadow: 'shadow-sm', logoPosition: 'left' },
        tableStyles: 'compact-grid'
    },
    // 16. The Boxed
    {
        id: 'boxed-ui',
        name: 'Card Stack',
        description: 'Every section is in a distinct card box.',
        layout: 'classic-top',
        theme: { primary: 'bg-orange-500', secondary: 'bg-orange-50', background: 'bg-gray-200', text: 'text-gray-800', surface: 'bg-white' },
        typography: { fontFamily: 'font-sans', headerCase: 'capitalize', fontSize: 'standard' },
        components: { borderRadius: 'rounded-lg', shadow: 'shadow-md', logoPosition: 'left' },
        tableStyles: 'floating-card'
    },
    // 17. The Swiss International
    {
        id: 'swiss-intl',
        name: 'Helvetica Style',
        description: 'Asymmetric grid, large type, orange accent.',
        layout: 'split-vertical',
        theme: { primary: 'bg-red-600', secondary: 'bg-gray-100', background: 'bg-white', text: 'text-black', surface: 'bg-white' },
        typography: { fontFamily: 'font-sans', headerCase: 'lowercase', fontSize: 'large' },
        components: { borderRadius: 'rounded-none', shadow: 'shadow-none', logoPosition: 'left' },
        tableStyles: 'bold-header'
    },
    // 18. The Eco
    {
        id: 'eco-friendly',
        name: 'Nature',
        description: 'Earth tones, soft borders.',
        layout: 'sidebar-left',
        theme: { primary: 'bg-green-700', secondary: 'bg-green-100', background: 'bg-stone-100', text: 'text-stone-800', surface: 'bg-white' },
        typography: { fontFamily: 'font-serif', headerCase: 'capitalize', fontSize: 'standard' },
        components: { borderRadius: 'rounded-xl', shadow: 'shadow-sm', logoPosition: 'center' },
        tableStyles: 'simple-border'
    },
    // 19. The Futuristic
    {
        id: 'future-tech',
        name: 'Cyber',
        description: 'Black bg, neon blue text, holographic feel.',
        layout: 'banner-header',
        theme: { primary: 'bg-cyan-500', secondary: 'bg-cyan-900', background: 'bg-black', text: 'text-cyan-400', surface: 'bg-gray-900' },
        typography: { fontFamily: 'font-mono', headerCase: 'uppercase', fontSize: 'standard' },
        components: { borderRadius: 'rounded-none', shadow: 'shadow-[0_0_15px_rgba(6,182,212,0.5)]', logoPosition: 'right' },
        tableStyles: 'minimal-lines'
    },
    // 20. The Letterhead
    {
        id: 'letterhead',
        name: 'Official Letter',
        description: 'Looks like a typed formal letter.',
        layout: 'minimal-centered',
        theme: { primary: 'bg-gray-900', secondary: 'bg-white', background: 'bg-white', text: 'text-gray-900', surface: 'bg-white' },
        typography: { fontFamily: 'font-serif', headerCase: 'capitalize', fontSize: 'standard' },
        components: { borderRadius: 'rounded-none', shadow: 'shadow-none', logoPosition: 'center' },
        tableStyles: 'simple-border'
    }
];
