// Background script for ENS Resolver
console.log('ENS Resolver: Background script loaded');

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

// Detect chain from domain name
function detectChain(domainName) {
    const parts = domainName.split('.');
    const tld = parts[parts.length - 1];
    return chainConfig[tld] || null;
}

// Multi-chain resolution function
async function resolveMultiChain(domainName, network = 'mainnet') {
    const chainInfo = detectChain(domainName);
    console.log('Background resolving:', domainName, 'Chain info:', chainInfo);

    if (!chainInfo) {
        console.log('No chain info found for:', domainName);
        return null;
    }

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
                    fetch(`http://localhost:3001/resolve/${domainName}?network=sepolia`)
                        .then(r => r.ok ? r.json() : null)
                        .then(d => d?.success ? d.data.address : null)
                        .catch(() => null)
                ];
            } else {
                // For mainnet, use local ENS server with testnet resolution logic
                promises = [
                    // Try local ENS server with mainnet network
                    fetch(`http://localhost:3001/resolve/${domainName}?network=mainnet`)
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
                const response = await fetch(`http://localhost:3001/resolve/${domainName}?network=sepolia`);

                if (!response.ok) {
                    console.log('Local server response not ok:', response.status, response.statusText);
                    return null;
                }

                const data = await response.json();
                console.log('Local server response:', data);

                if (data.success && data.data && data.data.address) {
                    return data.data.address;
                }
                return null;
            } else {
                // For mainnet, use local ENS server with testnet resolution logic
                const response = await fetch(`http://localhost:3001/resolve/${domainName}?network=mainnet`);

                if (!response.ok) {
                    console.log('Local server response not ok:', response.status, response.statusText);
                    return null;
                }

                const data = await response.json();
                console.log('Local server response:', data);

                if (data.success && data.data && data.data.address) {
                    return data.data.address;
                }
                return null;
            }
        }
    } catch (error) {
        console.log('Background resolution error:', error);
        return null;
    }
}

// Handle messages from popup and content script
chrome.runtime.onMessage.addListener(
    (message, sender, sendResponse) => {
        console.log('ENS Resolver: Received message:', message);

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
                            console.log('ENS Resolver: Content script not available');
                        } else {
                            console.log('ENS Resolver: In-page resolution toggled');
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