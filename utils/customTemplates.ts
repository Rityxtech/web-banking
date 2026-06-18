export function getBankNameFromSource(source: string): string {
    const builtInNames: Record<string, string> = {
        nonghyup: 'Nonghyup Bank',
        paypal: 'PayPal',
        wise: 'Wise',
        citibank: 'Citibank',
        peoplechoice: "People's Choice",
        unicredit: 'UniCredit',
        bangkokbank: 'Bangkok Bank',
        kasikornbank: 'Kasikornbank (KBank)',
        scb: 'Siam Commercial Bank',
        ktb: 'Krung Thai Bank',
        bankayudhya: 'Bank of Ayudhya',
        tmbthanachart: 'TMBThanachart Bank',
        cimbthai: 'CIMB Thai Bank',
        uobthai: 'United Overseas Bank Thailand',
        standardcharteredthai: 'Standard Chartered Bank Thailand',
        icbcthai: 'ICBC Thai',
        westernunion: 'Western Union',
        moneygram: 'MoneyGram',
    };
    return builtInNames[source] || 'Support Team';
}

export function getParentTypeFromSource(source: string): string | null {
    const builtInTypes: Record<string, string> = {
        nonghyup: 'nonghyup',
        paypal: 'paypal',
        wise: 'wise',
        citibank: 'citibank',
        peoplechoice: 'peoplechoice',
        unicredit: 'unicredit',
        bangkokbank: 'bangkokbank',
        kasikornbank: 'kasikornbank',
        scb: 'scb',
        ktb: 'ktb',
        bankayudhya: 'bankayudhya',
        tmbthanachart: 'tmbthanachart',
        cimbthai: 'cimbthai',
        uobthai: 'uobthai',
        standardcharteredthai: 'standardcharteredthai',
        icbcthai: 'icbcthai',
        westernunion: 'westernunion',
        moneygram: 'moneygram',
    };
    return builtInTypes[source] || null;
}
