export function getDomain (url: string): string|null { 
    try { return new URL(url).host; } catch { return null; } 
};

export function getMainDomain(url: string): string | null {
    try {
        const host = new URL(url).host;
        const parts = host.split('.');
        
        // Если это IP-адрес или localhost
        if (parts.length <= 2 && !isNaN(Number(parts[0]))) {
            return host;
        }
        
        // Особые случаи для доменов вроде co.uk, com.ru, org.ua и т.д.
        const specialTlds = [
            'co.uk', 'org.uk', 'me.uk', 'ac.uk',
            'com.ru', 'net.ru', 'org.ru',
            'com.ua', 'net.ua', 'org.ua',
            'com.by', 'org.by',
            'com.kz', 'net.kz', 'org.kz'
        ];
        
        const lastTwo = parts.slice(-2).join('.');
        const lastThree = parts.slice(-3).join('.');
        
        // Проверяем, не входит ли последняя часть в список особых случаев
        if (specialTlds.includes(lastThree)) {
            return parts.slice(-3).join('.');
        }
        
        if (specialTlds.includes(lastTwo)) {
            return parts.slice(-2).join('.');
        }
        
        // Стандартный случай: возвращаем последние 2 части
        return parts.slice(-2).join('.');
    } catch {
        return null;
    }
}