import { supabase } from '../services/supabase';

export interface CustomTemplate {
    id: string;
    name: string;
    parentId: string;
    logo: string;
    color: string;
    createdAt: number;
}

export const CLONABLE_TEMPLATE_MAP: Record<string, { transferType: string; originalName: string; originalLogo: string; localLogoPath?: string; color: string }> = {
    paypal_withdrawal: {
        transferType: 'paypal',
        originalName: 'PayPal',
        originalLogo: 'https://upload.wikimedia.org/wikipedia/commons/b/b7/PayPal_Logo_Icon_2014.svg',
        color: 'bg-blue-600',
    },
    wise_withdrawal: {
        transferType: 'wise',
        originalName: 'Wise',
        originalLogo: 'https://upload.wikimedia.org/wikipedia/commons/e/e8/Wise_Logo_512x124.svg',
        color: 'bg-green-700',
    },
    citibank_deposit: {
        transferType: 'citibank',
        originalName: 'Citibank',
        originalLogo: 'https://upload.wikimedia.org/wikipedia/commons/7/73/Citi_logo_March_2023.svg',
        color: 'bg-blue-700',
    },
    peoplechoice_deposit: {
        transferType: 'peoplechoice',
        originalName: "People's Choice",
        originalLogo: '',
        localLogoPath: '/peoplechoice-logo.png',
        color: 'bg-lime-600',
    },
    nonghyup_deposit: {
        transferType: 'nonghyup',
        originalName: 'Nonghyup Bank',
        originalLogo: '',
        localLogoPath: '/nonghyup-logo.png',
        color: 'bg-blue-800',
    },
};

export async function getCustomTemplates(): Promise<CustomTemplate[]> {
    try {
        const { data, error } = await supabase.from('mvp_custom_templates').select('*');
        if (error) {
            console.error('[getCustomTemplates] Supabase error:', error.message);
            return [];
        }
        return (data || []).map((row: any) => ({
            id: row.id,
            name: row.name,
            parentId: row.parent_id,
            logo: row.logo,
            color: row.color,
            createdAt: new Date(row.created_at).getTime(),
        }));
    } catch (e) {
        console.error('[getCustomTemplates] Unexpected error:', e);
        return [];
    }
}

export async function saveCustomTemplate(template: CustomTemplate): Promise<void> {
    try {
        const { error } = await supabase.from('mvp_custom_templates').insert({
            id: template.id,
            name: template.name,
            parent_id: template.parentId,
            logo: template.logo,
            color: template.color,
        });
        if (error) {
            console.error('[saveCustomTemplate] Supabase error:', error.message);
            throw error;
        }
    } catch (e: any) {
        console.error('[saveCustomTemplate] Failed:', e.message || e);
        throw e;
    }
}

export async function deleteCustomTemplate(id: string): Promise<void> {
    try {
        const { error } = await supabase.from('mvp_custom_templates').delete().eq('id', id);
        if (error) {
            console.error('[deleteCustomTemplate] Supabase error:', error.message);
            throw error;
        }
    } catch (e: any) {
        console.error('[deleteCustomTemplate] Failed:', e.message || e);
        throw e;
    }
}

export function getBankNameFromSource(source: string, customTemplates?: CustomTemplate[]): string {
    const builtInNames: Record<string, string> = {
        nonghyup: 'Nonghyup Bank',
        paypal: 'PayPal',
        wise: 'Wise',
        citibank: 'Citibank',
        peoplechoice: "People's Choice",
    };
    if (builtInNames[source]) return builtInNames[source];

    if (customTemplates) {
        const custom = customTemplates.find((t) => t.id === source);
        if (custom) return custom.name;
    }

    return 'Support Team';
}

export function getParentTypeFromSource(source: string): string | null {
    const builtInTypes: Record<string, string> = {
        nonghyup: 'nonghyup',
        paypal: 'paypal',
        wise: 'wise',
        citibank: 'citibank',
        peoplechoice: 'peoplechoice',
    };
    if (builtInTypes[source]) return builtInTypes[source];

    // Custom IDs follow the pattern: custom_{parentId}_{timestamp}
    // e.g. custom_paypal_withdrawal_1712345678901
    if (source.startsWith('custom_')) {
        const parts = source.split('_');
        if (parts.length >= 3) {
            const parentId = parts.slice(1, -1).join('_');
            return CLONABLE_TEMPLATE_MAP[parentId]?.transferType || null;
        }
    }
    return null;
}

export function customizeTemplateHtml(
    html: string,
    originalName: string,
    customName: string,
    originalLogo: string,
    customLogo: string,
    originalSource?: string,
    customSource?: string
): string {
    if (!html) return html;
    let result = html;

    if (originalLogo && customLogo && originalLogo !== customLogo) {
        const escapedLogo = originalLogo.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        result = result.replace(new RegExp(escapedLogo, 'g'), customLogo);
    }

    if (originalName && customName && originalName !== customName) {
        // Replace only when the name is not inside a larger word (e.g. TransferWise)
        const escaped = originalName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        try {
            // Use negative lookbehind/ahead for word chars to avoid partial matches
            result = result.replace(new RegExp(`(?<![a-zA-Z0-9_])${escaped}(?![a-zA-Z0-9_])`, 'gi'), customName);
        } catch {
            // Fallback for environments without lookbehind
            result = result.split(originalName).join(customName);
            try {
                result = result.replace(new RegExp(escaped, 'gi'), customName);
            } catch {}
        }
    }

    if (originalSource && customSource && originalSource !== customSource) {
        result = result.replace(new RegExp(`source=${originalSource}`, 'g'), `source=${customSource}`);
    }

    return result;
}
