/**
 * Generate a QR code value string from hotspot credentials.
 * Format: WIFI:T:WPA;S:<ssid>;P:<password>;;
 * This is the standard WiFi QR format Android cameras can parse.
 */
export const generateHotspotQR = (ssid, password) => {
    return `WIFI:T:WPA;S:${ssid};P:${password};;`;
};

/**
 * Parse a hotspot QR string back into { ssid, password }
 */
export const parseHotspotQR = (qrValue) => {
    try {
        const ssidMatch = qrValue.match(/S:([^;]+)/);
        const passMatch = qrValue.match(/P:([^;]+)/);
        return {
            ssid: ssidMatch ? ssidMatch[1] : '',
            password: passMatch ? passMatch[1] : '',
        };
    } catch {
        return { ssid: '', password: '' };
    }
};
