
let ensTooltip = null;
let ensTooltipTarget = null;
let ensTooltipTimeout = null;
let autoReplaceEnabled = true; // Default to true, will be updated from settings
let currentNetwork = 'mainnet'; // Default to mainnet, will be updated from settings

// Multi-chain configuration
const chainConfig = {
    eth: { name: 'ethereum', displayName: 'Ethereum', explorer: 'https://etherscan.io/address/' },
    btc: { name: 'BTC', displayName: 'Bitcoin', explorer: 'https://blockstream.info/address/' },
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

// Multi-chain regex for flexible TLD validation - supports both old format (name.chain) and new format (name.eth:chain)
const multiChainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](\.[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9])*(\.[a-zA-Z0-9]+)?(:[a-zA-Z0-9]+)?$/;

// Detect chain from domain name
function detectChain(domainName) {
    const parts = domainName.split('.');
    const tld = parts[parts.length - 1];
    return chainConfig[tld] || null;
}

// Listen for settings changes from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'updateAutoReplace') {
        autoReplaceEnabled = message.enabled;
    } else if (message.action === 'updateNetwork') {
        currentNetwork = message.network;
    }
});

function isLikelyDomainName(value) {
    return typeof value === 'string' &&
        value.trim().length > 3 &&
        multiChainRegex.test(value.trim()) &&
        value.includes('.');
}

async function resolveMultiChain(domainName) {
    const chainInfo = detectChain(domainName);

    if (!chainInfo) {
        return null;
    }

    try {
        // Use background script to avoid CORS issues
        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage({
                action: 'resolveMultiChain',
                domainName: domainName,
                network: currentNetwork
            }, (response) => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else if (response && response.success) {
                    resolve(response.data);
                } else {
                    resolve(null);
                }
            });
        });
    } catch (error) {
        return null;
    }
}

function showMultiChainTooltip(target, resolvedData, chainInfo, error) {
    if (ensTooltip) ensTooltip.remove();
    ensTooltip = document.createElement('div');
    ensTooltip.className = 'ens-resolver-tooltip';
    ensTooltip.style.position = 'absolute';
    ensTooltip.style.zIndex = 99999;
    ensTooltip.style.background = '#011A25';
    ensTooltip.style.color = '#E8F4FD';
    ensTooltip.style.padding = '8px 14px';
    ensTooltip.style.borderRadius = '8px';
    ensTooltip.style.fontSize = '14px';
    ensTooltip.style.fontFamily = 'Inter, sans-serif';
    ensTooltip.style.boxShadow = '0 4px 16px rgba(0,0,0,0.18)';
    ensTooltip.style.border = '1px solid #0080BC';
    ensTooltip.style.pointerEvents = 'auto';
    ensTooltip.style.userSelect = 'text';
    ensTooltip.style.display = 'flex';
    ensTooltip.style.alignItems = 'center';
    ensTooltip.style.gap = '10px';
    ensTooltip.style.maxWidth = '400px';
    ensTooltip.style.wordBreak = 'break-all';

    if (error) {
        ensTooltip.innerHTML = `<span style="color:#FF6B6B">${error}</span>`;
    } else {
        const displayName = chainInfo ? chainInfo.displayName : 'Unknown';
        const copyButton = `<button style="background:#0080BC;border:none;border-radius:50%;width:24px;height:24px;display:flex;align-items:center;justify-content:center;cursor:pointer;" title="Copy"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 4V16C8 17.1046 8.89543 18 10 18H18C19.1046 18 20 17.1046 20 16V7.24264C20 6.97742 19.8946 6.7228 19.7071 6.53553L16.4645 3.29289C16.2772 3.10536 16.0226 3 15.7574 3H10C8.89543 3 8 3.89543 8 5V4Z" stroke="white" stroke-width="2"/><path d="M16 18V20C16 21.1046 15.1046 22 14 22H6C4.89543 22 4 21.1046 4 20V8C4 6.89543 4.89543 6 6 6H8" stroke="white" stroke-width="2"/></svg></button>`;

        ensTooltip.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 4px; flex: 1;">
                <div style="font-size: 12px; color: rgba(255,255,255,0.7);">${displayName}</div>
                <div style="font-weight:600;">${resolvedData}</div>
            </div>
            ${copyButton}
        `;
    }

    document.body.appendChild(ensTooltip);

    // Position below input
    const rect = target.getBoundingClientRect();
    ensTooltip.style.left = `${rect.left + window.scrollX}px`;
    ensTooltip.style.top = `${rect.bottom + window.scrollY + 4}px`;
    ensTooltipTarget = target;

    // Copy button
    if (!error) {
        const btn = ensTooltip.querySelector('button');
        if (btn) {
            btn.onclick = () => {
                navigator.clipboard.writeText(resolvedData);
                btn.innerHTML = '✓';
                setTimeout(() => {
                    btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 4V16C8 17.1046 8.89543 18 10 18H18C19.1046 18 20 17.1046 20 16V7.24264C20 6.97742 19.8946 6.7228 19.7071 6.53553L16.4645 3.29289C16.2772 3.10536 16.0226 3 15.7574 3H10C8.89543 3 8 3.89543 8 5V4Z" stroke="white" stroke-width="2"/><path d="M16 18V20C16 21.1046 15.1046 22 14 22H6C4.89543 22 4 21.1046 4 20V8C4 6.89543 4.89543 6 6 6H8" stroke="white" stroke-width="2"/></svg>`;
                }, 1200);
            };
        }
    }
}

function hideENSTooltip() {
    if (ensTooltip) {
        ensTooltip.remove();
        ensTooltip = null;
        ensTooltipTarget = null;
    }
    if (ensTooltipTimeout) {
        clearTimeout(ensTooltipTimeout);
        ensTooltipTimeout = null;
    }
}

function autoReplaceDomainName(element, resolvedData) {
    if (!autoReplaceEnabled) return;

    // Store cursor position
    const start = element.selectionStart;
    const end = element.selectionEnd;

    // Replace the domain name with the resolved data
    const currentValue = element.value;
    const domainName = currentValue.trim();
    const beforeDomain = currentValue.substring(0, currentValue.indexOf(domainName));
    const afterDomain = currentValue.substring(currentValue.indexOf(domainName) + domainName.length);
    const newValue = beforeDomain + resolvedData + afterDomain;

    element.value = newValue;

    // Restore cursor position after the resolved data
    const newPosition = beforeDomain.length + resolvedData.length;
    element.setSelectionRange(newPosition, newPosition);

    // Trigger input event to notify any listeners
    element.dispatchEvent(new Event('input', { bubbles: true }));
}

function handleInputEvent(e) {
    const el = e.target;
    if (!(el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement)) return;
    const value = el.value.trim();

    if (isLikelyDomainName(value)) {
        // Debounce
        if (ensTooltipTimeout) clearTimeout(ensTooltipTimeout);
        ensTooltipTimeout = setTimeout(async () => {
            if (el.value.trim() !== value) return; // Value changed

            const chainInfo = detectChain(value);
            const resolvedData = await resolveMultiChain(value);

            if (el.value.trim() !== value) return; // Value changed again

            if (resolvedData) {
                showMultiChainTooltip(el, resolvedData, chainInfo, null);
                // Auto-replace if enabled
                autoReplaceDomainName(el, resolvedData);
            }
        }, 600);
    } else {
        hideENSTooltip();
    }
}

document.addEventListener('input', handleInputEvent, true);
document.addEventListener('scroll', () => {
    if (ensTooltip && ensTooltipTarget) {
        const rect = ensTooltipTarget.getBoundingClientRect();
        ensTooltip.style.left = `${rect.left + window.scrollX}px`;
        ensTooltip.style.top = `${rect.bottom + window.scrollY + 4}px`;
    }
}, true);
document.addEventListener('click', (e) => {
    if (ensTooltip && !ensTooltip.contains(e.target)) hideENSTooltip();
}, true);

// Tooltip styles
const style = document.createElement('style');
style.textContent = `.ens-resolver-tooltip { transition: opacity 0.2s; }
.ens-resolver-tooltip button { transition: background 0.2s; }
.ens-resolver-tooltip button:active { background: #005c8a; }`;
document.head.appendChild(style);