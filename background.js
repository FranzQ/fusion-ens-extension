// Background script for ENS Resolver

// API Configuration
const API_BASE_URL = 'https://api.fusionens.com';
// const API_BASE_URL = 'http://localhost:3001';

// Track external API usage for analytics
async function trackExternalAPIUsage(domain, success, chain, network, externalAPI = 'ensdata') {
    try {
        await fetch(`${API_BASE_URL}/analytics/track-external`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                domain: domain,
                source: 'chrome-extension',
                success: success,
                chain: chain,
                network: network,
                external_api: externalAPI
            })
        });
    } catch (error) {
        // Silently fail - analytics shouldn't break the main functionality
        console.log('Analytics tracking failed:', error);
    }
}

// Multi-chain configuration
const chainConfig = {
    eth: { name: 'ethereum', displayName: 'Ethereum', explorer: 'https://etherscan.io/address/' },
    btc: { name: 'BTC', displayName: 'Bitcoin', explorer: 'https://blockstream.info/address/' },
    doge: { name: 'dogecoin', displayName: 'Dogecoin', explorer: 'https://dogechain.info/address/' },
    xrp: { name: 'xrp', displayName: 'XRP', explorer: 'https://xrpscan.com/account/' },
    ltc: { name: 'litecoin', displayName: 'Litecoin', explorer: 'https://blockchair.com/litecoin/address/' },
    ada: { name: 'cardano', displayName: 'Cardano', explorer: 'https://cardanoscan.io/address/' },
    base: { name: 'base', displayName: 'Base', explorer: 'https://basescan.org/address/' },
    sol: { name: 'SOL', displayName: 'Solana', explorer: 'https://solscan.io/account/' },
    arbi: { name: 'ARB1', displayName: 'Arbitrum', explorer: 'https://arbiscan.io/address/' },
    polygon: { name: 'polygon', displayName: 'Polygon', explorer: 'https://polygonscan.com/address/' },
    avax: { name: 'avax', displayName: 'Avalanche', explorer: 'https://snowtrace.io/address/' },
    bsc: { name: 'bsc', displayName: 'BNB Chain', explorer: 'https://bscscan.com/address/' },
    op: { name: 'op', displayName: 'Optimism', explorer: 'https://optimistic.etherscan.io/address/' },
    zora: { name: 'zora', displayName: 'Zora', explorer: 'https://explorer.zora.energy/address/' },
    linea: { name: 'linea', displayName: 'Linea', explorer: 'https://lineascan.build/address/' },
    scroll: { name: 'scroll', displayName: 'Scroll', explorer: 'https://scrollscan.com/address/' },
    mantle: { name: 'mantle', displayName: 'Mantle', explorer: 'https://explorer.mantle.xyz/address/' },
    celo: { name: 'celo', displayName: 'Celo', explorer: 'https://explorer.celo.org/address/' },
    gnosis: { name: 'gnosis', displayName: 'Gnosis', explorer: 'https://gnosisscan.io/address/' },
    fantom: { name: 'fantom', displayName: 'Fantom', explorer: 'https://ftmscan.com/address/' },
    x: { name: 'com.twitter', displayName: 'Twitter/X', explorer: null },
    url: { name: 'url', displayName: 'Website', explorer: null },
    github: { name: 'com.github', displayName: 'GitHub', explorer: null },
    name: { name: 'name', displayName: 'Name', explorer: null },
    bio: { name: 'description', displayName: 'Bio', explorer: null }
};

// Convert domain name to new format (name.eth:chain) if needed
function convertToNewFormat(domainName) {
    // If already in new format, return as-is
    if (domainName.includes(':')) {
        return domainName;
    }

    // Handle old format (name.chain) - convert to new format
    const match = domainName.match(/\.([^.]+)$/);
    if (match && chainConfig[match[1]]) {
        const tld = match[1];
        const nameWithoutTLD = domainName.replace(`.${tld}`, '');

        // For .eth domains, return as-is
        if (tld === 'eth') {
            return domainName;
        }

        // For other chains, convert to new format
        return `${nameWithoutTLD}.eth:${tld}`;
    }

    // If no TLD or unsupported, add .eth
    if (!domainName.includes('.')) {
        return domainName + '.eth';
    }

    return domainName;
}

// Detect chain from domain name - supports both new format (name.eth:chain) and old format (name.chain)
function detectChain(domainName) {
    // Check for new format (name.eth:chain)
    const colonIndex = domainName.lastIndexOf(':');
    if (colonIndex !== -1) {
        const targetChain = domainName.substring(colonIndex + 1);
        if (chainConfig[targetChain]) {
            return chainConfig[targetChain];
        }
        return null;
    }

    // Handle old format (name.chain) - backward compatibility
    const parts = domainName.split('.');
    const tld = parts[parts.length - 1];
    return chainConfig[tld] || null;
}

// Multi-chain resolution function
async function resolveMultiChain(domainName, network = 'mainnet') {
    const chainInfo = detectChain(domainName);

    if (!chainInfo) {
        return null;
    }

    // Convert to new format for server requests
    const serverDomainName = convertToNewFormat(domainName);

    try {
        // For .eth domains, use different APIs based on network
        if (domainName.endsWith('.eth')) {
            const timeout = 5000;
            const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), timeout));

            let promises = [];
            if (network === 'testnet') {
                // For testnet, use local ENS server only
                promises = [
                    // Try local ENS testnet server
                    fetch(`${API_BASE_URL}/resolve/${serverDomainName}?network=sepolia&source=chrome-extension`)
                        .then(r => r.ok ? r.json() : null)
                        .then(d => d?.success ? d.data.address : null)
                        .catch(() => null)
                ];
            } else {
                // For mainnet, use local ENS server with testnet resolution logic
                promises = [
                    // Try local ENS server with mainnet network
                    fetch(`${API_BASE_URL}/resolve/${serverDomainName}?network=mainnet&source=chrome-extension`)
                        .then(r => r.ok ? r.json() : null)
                        .then(d => d?.success ? d.data.address : null)
                        .catch(() => null)
                ];
            }

            const results = await Promise.race([
                Promise.all(promises),
                timeoutPromise
            ]);
            return results.find(r => r !== null) || null;
        } else {
            // For other TLDs, use different APIs based on network
            if (network === 'testnet') {
                // For testnet, use local ENS server for multi-chain resolution
                const response = await fetch(`${API_BASE_URL}/resolve/${serverDomainName}?network=sepolia&source=chrome-extension`);

                if (!response.ok) {
                    return null;
                }

                const data = await response.json();

                if (data.success && data.data && data.data.address) {
                    return data.data.address;
                }
                return null;
            } else {
                // For mainnet, use local ENS server with testnet resolution logic
                const response = await fetch(`${API_BASE_URL}/resolve/${serverDomainName}?network=mainnet&source=chrome-extension`);

                if (!response.ok) {
                    return null;
                }

                const data = await response.json();

                if (data.success && data.data && data.data.address) {
                    return data.data.address;
                }
                return null;
            }
        }
    } catch (error) {
        return null;
    }
}

// Handle messages from popup and content script
chrome.runtime.onMessage.addListener(
    (message, sender, sendResponse) => {

        if (message.action === 'resolveMultiChain') {
            // Handle multi-chain resolution requests from content script
            const network = message.network || 'mainnet';
            resolveMultiChain(message.domainName, network).then(result => {
                sendResponse({ success: true, data: result, chainInfo: detectChain(message.domainName) });
            }).catch(error => {
                sendResponse({ success: false, error: error.message });
            });
            return true; // Keep message channel open for async response
        } else if (message.action === 'toggleInPage') {
            // Toggle in-page resolution (now handled by content script)
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs[0]) {
                    chrome.tabs.sendMessage(tabs[0].id, {
                        action: 'toggleInPage',
                        enabled: message.enabled
                    }, (response) => {
                        if (chrome.runtime.lastError) {
                        } else {
                        }
                    });
                }
            });
        } else if (message.action === 'getInPageStatus') {
            // Get in-page resolution status
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs[0]) {
                    chrome.tabs.sendMessage(tabs[0].id, {
                        action: 'getInPageStatus'
                    }, (response) => {
                        if (chrome.runtime.lastError) {
                            sendResponse({ enabled: false });
                        } else {
                            sendResponse({ enabled: true });
                        }
                    });
                } else {
                    sendResponse({ enabled: false });
                }
            });
            return true; // Keep message channel open for async response
        }
    }
); 