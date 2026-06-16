export interface CustomTemplate {
    id: string;
    name: string;
    parentId: string;
    logo: string;
    color: string;
    createdAt: number;
}

const STORAGE_KEY = 'veltrix_custom_templates';

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

export function getCustomTemplates(): CustomTemplate[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        return JSON.parse(raw) as CustomTemplate[];
    } catch {
        return [];
    }
}

export function saveCustomTemplate(template: CustomTemplate): void {
    const existing = getCustomTemplates();
    existing.push(template);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
}

export function deleteCustomTemplate(id: string): void {
    const existing = getCustomTemplates();
    const filtered = existing.filter((t) => t.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

export function getBankNameFromSource(source: string): string {
    const builtInNames: Record<string, string> = {
        nonghyup: 'Nonghyup Bank',
        paypal: 'PayPal',
        wise: 'Wise',
        citibank: 'Citibank',
        peoplechoice: "People's Choice",
    };
    if (builtInNames[source]) return builtInNames[source];

    const customTemplates = getCustomTemplates();
    const custom = customTemplates.find((t) => t.id === source);
    if (custom) return custom.name;

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

    const customTemplates = getCustomTemplates();
    const custom = customTemplates.find((t) => t.id === source);
    if (custom) {
        return CLONABLE_TEMPLATE_MAP[custom.parentId]?.transferType || null;
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
