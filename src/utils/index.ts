import { networkInterfaces } from "os";

export function getLocalIP() {
    const interfaces = networkInterfaces();
    for (const name in interfaces) {
        if (!interfaces[name]) {
            continue;
        }
        for (const iface of interfaces[name]) {
            // 检查是否为 IPv4 且不是内部地址（如 127.0.0.1）
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return '127.0.0.1'; // 如果未找到，返回默认本地地址
}