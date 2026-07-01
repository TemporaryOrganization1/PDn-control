export function getDomain(url: string): string | null {
    try {
        return new URL(url).host;
    } catch {
        return null;
    }
}

export function getMainDomain(url: string): string | null {
    try {
        const hostPart = url.split('/')[0] ?? '';
        const host = url.includes('://')
            ? new URL(url).hostname
            : (hostPart.split(':')[0] ?? '');
        if (!host || /\s/.test(host)) {
            return null;
        }

        const parts = host.split('.');
        if (host === 'localhost' || parts.every(part => part !== '' && !Number.isNaN(Number(part)))) {
            return host;
        }

        const specialTlds = [
            'co.uk', 'org.uk', 'me.uk', 'ac.uk',
            'com.ru', 'net.ru', 'org.ru',
            'com.ua', 'net.ua', 'org.ua',
            'com.by', 'org.by',
            'com.kz', 'net.kz', 'org.kz',
        ];

        const lastTwo = parts.slice(-2).join('.');
        if (specialTlds.includes(lastTwo)) {
            return parts.slice(-3).join('.');
        }

        return parts.slice(-2).join('.');
    } catch {
        return null;
    }
}
