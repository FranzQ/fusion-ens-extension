const invalidChars = /[!@#$%^&*()+\=\[\]{};'"\\|,<>\/?]+/;
const multiChainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](\.[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9])*\.[a-zA-Z0-9]+$/;

// Rotating ENS names for the title
const rotatingEnsNames = [
    'ABENA.ETH',
    'FRED.UNI.ETH',
    'SES.X',
    'FRANZ.DOT',
    'VITALIK.ETH',
    'ONSHOW.SOL',
    'JESSE.BASE.ETH',
];

let currentEnsIndex = 0;

function rotateEnsName() {
    const ensNameElement = document.getElementById('rotatingEnsName');
    if (ensNameElement) {
        ensNameElement.textContent = rotatingEnsNames[currentEnsIndex];
        currentEnsIndex = (currentEnsIndex + 1) % rotatingEnsNames.length;
    }
}

// Chain configuration
const chainConfig = {
    'eth': {
        name: 'ethereum',
        displayName: 'Ethereum',
        explorer: 'https://etherscan.io/address/',
        api: 'ens'
    },
    'btc': {
        name: 'bitcoin',
        displayName: 'Bitcoin',
        explorer: 'https://blockstream.info/address/',
        api: 'ens'
    },
    'doge': {
        name: 'dogecoin',
        displayName: 'Dogecoin',
        explorer: 'https://dogechain.info/address/',
        api: 'ens'
    },
    'xrp': {
        name: 'xrp',
        displayName: 'XRP',
        explorer: 'https://xrpscan.com/account/',
        api: 'ens'
    },
    'ltc': {
        name: 'litecoin',
        displayName: 'Litecoin',
        explorer: 'https://blockchair.com/litecoin/address/',
        api: 'ens'
    },
    'ada': {
        name: 'cardano',
        displayName: 'Cardano',
        explorer: 'https://cardanoscan.io/address/',
        api: 'ens'
    },
    'base': {
        name: 'base',
        displayName: 'Base',
        explorer: 'https://basescan.org/address/',
        api: 'ens'
    },
    'name': {
        name: 'name',
        displayName: 'Name',
        explorer: null,
        api: 'ens'
    },
    'sol': {
        name: 'SOL',
        displayName: 'Solana',
        explorer: 'https://solscan.io/account/',
        api: 'ens'
    },
    'bio': {
        name: 'bio',
        displayName: 'Bio',
        explorer: null,
        api: 'ens'
    },
    'arbi': {
        name: 'ARB1',
        displayName: 'Arbitrum',
        explorer: 'https://arbiscan.io/address/',
        api: 'ens'
    },
    'polygon': {
        name: 'polygon',
        displayName: 'Polygon',
        explorer: 'https://polygonscan.com/address/',
        api: 'ens'
    },
    'avax': {
        name: 'avalanche',
        displayName: 'Avalanche',
        explorer: 'https://snowtrace.io/address/',
        api: 'ens'
    },
    'bsc': {
        name: 'bsc',
        displayName: 'BNB Chain',
        explorer: 'https://bscscan.com/address/',
        api: 'ens'
    },
    'op': {
        name: 'optimism',
        displayName: 'Optimism',
        explorer: 'https://optimistic.etherscan.io/address/',
        api: 'ens'
    },
    'zora': {
        name: 'zora',
        displayName: 'Zora',
        explorer: 'https://explorer.zora.energy/address/',
        api: 'ens'
    },
    'linea': {
        name: 'linea',
        displayName: 'Linea',
        explorer: 'https://lineascan.build/address/',
        api: 'ens'
    },
    'scroll': {
        name: 'scroll',
        displayName: 'Scroll',
        explorer: 'https://scrollscan.com/address/',
        api: 'ens'
    },
    'mantle': {
        name: 'mantle',
        displayName: 'Mantle',
        explorer: 'https://explorer.mantle.xyz/address/',
        api: 'ens'
    },
    'celo': {
        name: 'celo',
        displayName: 'Celo',
        explorer: 'https://explorer.celo.org/address/',
        api: 'ens'
    },
    'gnosis': {
        name: 'gnosis',
        displayName: 'Gnosis',
        explorer: 'https://gnosisscan.io/address/',
        api: 'ens'
    },
    'fantom': {
        name: 'fantom',
        displayName: 'Fantom',
        explorer: 'https://ftmscan.com/address/',
        api: 'ens'
    },
    'x': {
        name: 'x',
        displayName: 'Twitter/X',
        explorer: null,
        api: 'ens'
    },
    'url': {
        name: 'url',
        displayName: 'Website',
        explorer: null,
        api: 'ens'
    },
    'github': {
        name: 'github',
        displayName: 'GitHub',
        explorer: null,
        api: 'ens'
    }
};

// Detect chain from domain name
function detectChain(domainName) {
    const match = domainName.match(/\.([^.]+)$/);
    if (match && chainConfig[match[1]]) {
        return match[1];
    }
    // If TLD is not supported, return null to indicate unsupported chain
    return null;
}

// Multi-chain resolution with timeout and parallel requests
async function resolveENS(domainName, network = 'mainnet') {
    const timeout = 5000; // 5 second timeout
    const chain = detectChain(domainName);


    // Create a timeout promise
    const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout')), timeout);
    });

    let promises = [];

    // Check if this is an ETH subdomain (.base.eth, .uni.eth, etc.) first
    const isEthSubdomain = domainName.endsWith('.eth') && domainName.includes('.');

    if (isEthSubdomain) {
        // For ETH subdomains (.base.eth, .uni.eth, etc.), use ENS Ideas API only
        promises = [
            fetch(`https://api.ensideas.com/ens/resolve/${domainName}`)
                .then(response => response.ok ? response.json() : null)
                .then(data => data?.address || null)
                .catch(() => null)
        ];
    } else if (chain === 'eth') {
        // For .eth domains, use different APIs based on network
        if (network === 'testnet') {
            // For testnet, use local ENS server only
            promises = [
                // Try local ENS testnet server
                fetch(`http://localhost:3001/resolve/${domainName}?network=sepolia`)
                    .then(response => response.ok ? response.json() : null)
                    .then(data => data?.success ? data.data.address : null)
                    .catch(() => null)
            ];
        } else {
            // For mainnet, use local ENS server with testnet resolution logic
            promises = [
                // Try local ENS server with mainnet network
                fetch(`http://localhost:3001/resolve/${domainName}?network=mainnet`)
                    .then(response => response.ok ? response.json() : null)
                    .then(data => data?.success ? data.data.address : null)
                    .catch(() => null)
            ];
        }
    } else {
        // For multi-chain domains (.btc, .sol, .doge, etc.), use local server first
        if (network === 'testnet') {
            promises = [
                // Try local ENS server for multi-chain resolution
                fetch(`http://localhost:3001/resolve/${domainName}?network=sepolia`)
                    .then(response => response.ok ? response.json() : null)
                    .then(data => data?.success ? data.data.address : null)
                    .catch(() => null),

                // Fallback: External API
                fetch(`https://api.ensideas.com/ens/resolve/${domainName}`)
                    .then(response => response.ok ? response.json() : null)
                    .then(data => data?.address || null)
                    .catch(() => null)
            ];
        } else {
            promises = [
                // Primary: Local ENS server (handles multi-chain)
                fetch(`http://localhost:3001/resolve/${domainName}?network=mainnet`)
                    .then(response => response.ok ? response.json() : null)
                    .then(data => data?.success ? data.data.address : null)
                    .catch(() => null),

                // Fallback: ENS Ideas API
                fetch(`https://api.ensideas.com/ens/resolve/${domainName}`)
                    .then(response => response.ok ? response.json() : null)
                    .then(data => data?.address || null)
                    .catch(() => null),

                // Additional fallback: ENS Node API
                fetch(`https://api.alpha.ensnode.io/name/${domainName}`)
                    .then(response => response.ok ? response.json() : null)
                    .then(data => data?.address || data?.resolver?.address || null)
                    .catch(() => null)
            ];
        }
    }

    try {
        // Try each promise sequentially until one succeeds
        for (const promise of promises) {
            try {
                const result = await Promise.race([promise, timeoutPromise]);
                if (result) {
                    return result;
                }
            } catch (error) {
                // Continue to next promise
                continue;
            }
        }
        return null;
    } catch (error) {
        return null;
    }
}

// DNSSEC validation function
async function validateDNSSEC(domainName) {
    try {
        console.log('🔍 Validating DNSSEC for:', domainName);

        // Use Cloudflare's DNS-over-HTTPS with DNSSEC validation
        const response = await fetch(`https://cloudflare-dns.com/dns-query?name=${domainName}&type=A&do=1`, {
            headers: {
                'Accept': 'application/dns-json'
            }
        });

        if (!response.ok) {
            console.log('❌ DNS query failed:', response.status);
            return { isValid: false, reason: 'DNS query failed' };
        }

        const data = await response.json();
        console.log('📡 DNS response:', data);

        // Check if DNSSEC validation was performed
        const hasDNSSEC = data.AD === true; // AD flag indicates DNSSEC validation

        console.log('🔒 DNSSEC validation result:', hasDNSSEC);

        return {
            isValid: hasDNSSEC,
            reason: hasDNSSEC ? 'DNSSEC validated' : 'No DNSSEC validation'
        };
    } catch (error) {
        console.log('❌ DNSSEC validation error:', error);
        return { isValid: false, reason: 'Validation failed' };
    }
}

// Fetch profile picture from ENS metadata
async function fetchProfilePicture(ensName, address) {
    try {
        // Try to get avatar from ENS metadata
        const response = await fetch(`https://metadata.ens.domains/mainnet/${address}/avatar`);
        if (response.ok) {
            const avatarUrl = await response.text();
            if (avatarUrl && avatarUrl !== 'data:image/svg+xml;base64,' && avatarUrl.trim() !== '') {
                return avatarUrl;
            }
        }

        // Fallback: try ENS Ideas API for avatar
        const ensResponse = await fetch(`https://api.ensideas.com/ens/resolve/${ensName}`);
        if (ensResponse.ok) {
            const data = await ensResponse.json();
            if (data?.avatar) {
                return data.avatar;
            }
        }

        return null;
    } catch (error) {
        console.log("Error fetching profile picture:", error);
        return null;
    }
}

async function resolve() {
    if (isResolving) {
        console.log("Already resolving, please wait");
        return;
    }

    if (!searchElement || !lblValue || !lblHidden) {
        console.log("DOM elements not ready");
        return;
    }

    isResolving = true;
    const userInput = searchElement.value.trim();
    hideResult();
    showLoading();

    if (!userInput) {
        hideLoading();
        toast("Please enter an ENS name", 3000);
        return;
    }

    if (invalidChars.test(userInput)) {
        hideLoading();
        toast("Request contains invalid characters", 3000);
        return;
    }

    // Add .eth suffix if not provided and no other TLD is present
    let domainName = userInput;
    if (!domainName.includes('.')) {
        domainName = domainName + '.eth';
    }

    // Basic validation for multi-chain domain format
    if (!multiChainRegex.test(domainName)) {
        hideLoading();
        toast("Invalid domain name format", 3000);
        return;
    }

    try {
        // Detect chain and resolve the domain name
        const chain = detectChain(domainName);

        if (!chain) {
            hideLoading();
            toast("Unsupported chain TLD. Supported: .eth, .btc, .doge, .xrp, .ltc, .ada, .base, .name, .sol, .bio, .arbi, .polygon, .avax, .bsc, .op, .zora, .linea, .scroll, .mantle, .celo, .gnosis, .fantom", 5000);
            return;
        }

        const address = await resolveENS(domainName, settings.network);

        if (address) {
            // Show success message for debugging
            if (domainName.includes('.base.eth')) {
                toast(`✅ Resolved ${domainName}`, 2000);
            }
            // Fetch profile picture (only for .eth domains and mainnet)
            let profilePicture = null;
            if (chain === 'eth' && settings.network === 'mainnet') {
                profilePicture = await fetchProfilePicture(domainName, address);
            }

            // Validate DNSSEC for .eth domains
            let dnssecInfo = null;
            if (chain === 'eth') {
                console.log('🔍 Starting DNSSEC validation for .eth domain:', domainName);
                dnssecInfo = await validateDNSSEC(domainName);
                console.log('🔍 DNSSEC validation completed:', dnssecInfo);
            } else {
                console.log('⏭️ Skipping DNSSEC validation for non-eth domain:', chain);
            }

            // Display result with chain information
            const chainInfo = chainConfig[chain];
            showResult(address, chainInfo);
            await display(address, profilePicture, chainInfo, dnssecInfo);
        } else if (chain !== 'eth') {
            // For non-eth chains, try to get the .eth address as fallback
            const nameWithoutTLD = domainName.replace(/\.[^.]+$/, '');
            const ensName = nameWithoutTLD + '.eth';

            // Try to resolve the .eth version
            const ethAddress = await resolveENS(ensName, settings.network);
            if (ethAddress) {
                toast(`${chainConfig[chain].displayName} address not found, but ${nameWithoutTLD}.eth resolves to ${ethAddress}`, 4000);
            } else {
                toast(`${chainConfig[chain].displayName} address not found`, 3000);
            }
        } else {
            if (settings.network === 'testnet') {
                toast(`Domain not found on testnet. Most ENS domains only exist on mainnet.`, 4000);
            } else {
                toast(`${chainConfig[chain].displayName} address not found or not resolved`, 3000);
            }
        }
    } catch (error) {
        console.log("Error during resolution:", error);
        toast("Error resolving ENS name", 3000);
    } finally {
        hideLoading();
        isResolving = false;
    }
}

async function explore() {
    if (!searchElement) return;

    const userInput = searchElement.value.trim();

    if (!userInput) {
        toast("Please enter a domain name first", 3000);
        return;
    }

    if (invalidChars.test(userInput)) {
        toast("Request contains invalid characters", 3000);
        return;
    }

    let domainName = userInput;
    if (!domainName.includes('.')) {
        domainName = domainName + '.eth';
    }

    // Detect chain and resolve the domain name
    const chain = detectChain(domainName);

    if (!chain) {
        toast("Unsupported chain TLD. Supported: .eth, .btc, .base, .name, .sol, .bio, .arbi, .polygon, .avax, .bsc, .op, .zora, .linea, .scroll, .mantle, .celo, .gnosis, .fantom", 5000);
        return;
    }

    const address = await resolveENS(domainName, settings.network);

    if (address) {
        // Open appropriate block explorer for the resolved address
        const chainInfo = chainConfig[chain];
        if (chainInfo.explorer) {
            chrome.tabs.create({ url: `${chainInfo.explorer}${address}` });
        } else if (chain === 'url') {
            // For URLs, open the website
            chrome.tabs.create({ url: address });
        } else if (chain === 'github') {
            // For GitHub, open the GitHub profile
            chrome.tabs.create({ url: `https://github.com/${address}` });
        } else if (chain === 'x') {
            // For Twitter/X, open the profile
            chrome.tabs.create({ url: `https://x.com/${address}` });
        } else {
            // For name/bio, just copy to clipboard
            navigator.clipboard.writeText(address);
            toast(`${chainInfo.displayName} copied to clipboard`, 2000);
        }
    } else {
        toast(`${chainConfig[chain].displayName} address not found`, 3000);
    }
}

async function openEfp() {
    if (!searchElement) return;

    const userInput = searchElement.value.trim();

    if (!userInput) {
        toast("Please enter a domain name first", 3000);
        return;
    }

    if (invalidChars.test(userInput)) {
        toast("Request contains invalid characters", 3000);
        return;
    }

    let domainName = userInput;
    if (!domainName.includes('.')) {
        domainName = domainName + '.eth';
    }

    // Only open EFP for .eth domains
    if (!domainName.endsWith('.eth')) {
        toast("EFP is only available for .eth domains", 3000);
        return;
    }

    // Open EFP (Ethereum Farcaster Profile) for the domain
    chrome.tabs.create({ url: `https://efp.app/${domainName}` });
}

async function exploreEthXyz() {
    if (!searchElement) return;

    const userInput = searchElement.value.trim();

    if (!userInput) {
        toast("Please enter a domain name first", 3000);
        return;
    }

    if (invalidChars.test(userInput)) {
        toast("Request contains invalid characters", 3000);
        return;
    }

    let domainName = userInput;
    // Add .eth suffix if no TLD is provided
    if (!domainName.includes('.')) {
        domainName = domainName + '.eth';
    }

    // Detect chain and open appropriate explorer
    const chain = detectChain(domainName);

    if (!chain) {
        toast("Unsupported chain TLD. Supported: .eth, .btc, .base, .name, .sol, .bio, .arbi, .polygon, .avax, .bsc, .op, .zora, .linea, .scroll, .mantle, .celo, .gnosis, .fantom", 5000);
        return;
    }

    if (chain === 'eth') {
        // For .eth domains, open app.ens.domains profile page
        const nameForEnsDomains = domainName.replace(/\.eth$/, '');
        chrome.tabs.create({ url: `https://app.ens.domains/${nameForEnsDomains}.eth` });
    } else {
        // For non-eth domains, show a message that app.ens.domains is only for .eth domains
        toast("Shift+Enter opens app.ens.domains profile pages for .eth domains only", 3000);
    }
}

const copy = async () => {
    if (!lblValue || !lblHidden) return;

    if (lblValue.innerHTML != "..." && lblValue.innerHTML != "Invalid ENS name format") {
        try {
            // Ensure document is focused before copying
            if (!document.hasFocus()) {
                window.focus();
                // Wait a bit for focus to be established
                await new Promise(resolve => setTimeout(resolve, 100));
            }

            await navigator.clipboard.writeText(lblHidden.innerHTML);
            toast("Copied to clipboard", 2000);
        } catch (error) {
            console.log('Copy failed:', error);
            // Fallback: try using execCommand for older browsers
            try {
                const textArea = document.createElement('textarea');
                textArea.value = lblHidden.innerHTML;
                textArea.style.position = 'fixed';
                textArea.style.left = '-999999px';
                textArea.style.top = '-999999px';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                toast("Copied to clipboard", 2000);
            } catch (fallbackError) {
                console.log('Fallback copy failed:', fallbackError);
                toast("Copy failed", 2000);
            }
        }
    }
};

const focusInput = () => {
    if (searchElement) {
        searchElement.focus();
    }
};

// Auto-complete functionality
const setupAutoComplete = () => {
    if (!searchElement) return;

    searchElement.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            const value = e.target.value.trim();

            // Only auto-complete if doesn't already have a TLD
            if (value && !value.includes('.')) {
                // Check if it looks like a domain name (alphanumeric, no spaces)
                if (/^[a-zA-Z0-9-]+$/.test(value)) {
                    searchElement.value = value + '.eth';
                    // Position cursor before .eth
                    searchElement.setSelectionRange(value.length, value.length);
                }
            }
        }
    });
};

const showLoading = () => {
    const btnContent = document.querySelector('.btn-content');
    const btnLoading = document.querySelector('.btn-loading');
    const resolveBtn = document.getElementById('btnResolve');

    if (btnContent && btnLoading && resolveBtn) {
        btnContent.style.display = 'none';
        btnLoading.style.display = 'flex';
        resolveBtn.classList.add('loading');
        resolveBtn.disabled = true;
    }
};

const hideLoading = () => {
    const btnContent = document.querySelector('.btn-content');
    const btnLoading = document.querySelector('.btn-loading');
    const resolveBtn = document.getElementById('btnResolve');

    if (btnContent && btnLoading && resolveBtn) {
        btnContent.style.display = 'flex';
        btnLoading.style.display = 'none';
        resolveBtn.classList.remove('loading');
        resolveBtn.disabled = false;
    }
};

const showResult = (address, chainInfo) => {
    const resultCard = document.getElementById("resultCard");
    if (resultCard) {
        resultCard.style.display = "block";

        // Update the result label to show chain information
        const resultLabel = resultCard.querySelector('.result-label');
        if (resultLabel) {
            resultLabel.textContent = `Resolved ${chainInfo.displayName} Address`;
        }

        // Show/hide EFP button based on whether it's an .eth domain
        if (efpBtn) {
            if (chainInfo.name === 'ethereum') {
                efpBtn.style.display = 'flex';
            } else {
                efpBtn.style.display = 'none';
            }
        }
    }
};

const hideResult = () => {
    const resultCard = document.getElementById("resultCard");
    if (resultCard) {
        resultCard.style.display = "none";
    }
};

const toast = (message, duration) => {
    var tt = document.getElementById("snackbar");
    tt.innerHTML = message;
    tt.className = "show";
    setTimeout(function () {
        tt.className = tt.className.replace("show", "");
    }, duration);
};

const shorten = (text) => {
    return `${text.substr(0, 12)}...${text.slice(-12)}`;
};

// Typewriter effect for displaying addresses
const typewriterEffect = async (element, text, speed = 100) => {
    element.innerHTML = '';
    for (let i = 0; i < text.length; i++) {
        element.innerHTML += text[i];
        // Add a blinking cursor effect
        element.innerHTML += '<span class="cursor">|</span>';
        await new Promise(resolve => setTimeout(resolve, speed));
        // Remove cursor before adding next character
        element.innerHTML = element.innerHTML.replace('<span class="cursor">|</span>', '');
    }
    // Add a brief pause at the end
    await new Promise(resolve => setTimeout(resolve, 200));
};

const display = async (info, profilePicture = null, chainInfo = null, dnssecInfo = null) => {
    if (!lblValue || !lblHidden) {
        console.log("Display elements not ready");
        return;
    }

    try {
        // Update profile picture if available (only for Ethereum)
        const profilePicElement = document.getElementById('profilePicture');
        const defaultIcon = document.querySelector('.default-icon');
        if (profilePicElement && defaultIcon) {
            if (profilePicture && chainInfo && chainInfo.name === 'Ethereum') {
                profilePicElement.src = profilePicture;
                profilePicElement.style.display = 'block';
                defaultIcon.style.display = 'none';
                profilePicElement.onerror = () => {
                    profilePicElement.style.display = 'none';
                    defaultIcon.style.display = 'block';
                };
            } else {
                profilePicElement.style.display = 'none';
                defaultIcon.style.display = 'block';
            }
        }

        // Display address with typewriter effect
        await typewriterEffect(lblValue, info, 80);
        lblHidden.innerHTML = info;

        // Show DNSSEC trust indicator inline with the address
        console.log('🎯 DNSSEC info:', dnssecInfo);
        if (dnssecInfo && dnssecInfo.isValid) {
            showInlineTrustIndicator('DNSSEC Validated', 'success');
        } else if (dnssecInfo && !dnssecInfo.isValid) {
            showInlineTrustIndicator('No DNSSEC', 'warning');
        } else {
            console.log('❌ No DNSSEC info available');
        }

        // Wait a bit before copying to clipboard
        setTimeout(() => {
            copy();
        }, 500);
    } catch (error) {
        console.log("Error in display function:", error);
        // Fallback: just set the text directly
        if (lblValue && lblHidden) {
            lblValue.innerHTML = info;
            lblHidden.innerHTML = info;
        }
    }
};

// Show inline trust indicator in the resolved address section
const showInlineTrustIndicator = (message, type) => {

    // Remove existing trust indicator
    const existingIndicator = document.getElementById('inlineTrustIndicator');
    if (existingIndicator) {
        existingIndicator.remove();
    }

    // Find the container that comes after the keyboard shortcuts section
    let targetContainer = null;

    // Look for the keyboard shortcuts section first
    const keyboardShortcuts = document.querySelector('.keyboard-shortcuts') ||
        document.querySelector('[class*="shortcut"]') ||
        document.querySelector('div:contains("Keyboard Shortcuts")') ||
        Array.from(document.querySelectorAll('div')).find(div =>
            div.textContent?.includes('Keyboard Shortcuts') ||
            div.textContent?.includes('Tab') ||
            div.textContent?.includes('Enter')
        );

    // Hide the keyboard shortcuts section
    if (keyboardShortcuts) {
        keyboardShortcuts.style.display = 'none';
        console.log('🙈 Hidden keyboard shortcuts section');
    }

    if (keyboardShortcuts) {
        // Find the next sibling or parent's next sibling
        targetContainer = keyboardShortcuts.nextElementSibling ||
            keyboardShortcuts.parentElement?.nextElementSibling ||
            keyboardShortcuts.parentElement;
        console.log('📍 Found keyboard shortcuts, target container:', targetContainer);
    } else {
        // Fallback: look for the main container
        targetContainer = document.querySelector('.container') ||
            document.querySelector('main') ||
            document.body;
        console.log('📍 Using fallback container:', targetContainer);
    }

    if (!targetContainer) {
        console.log('❌ Could not find target container');
        return;
    }

    // Create new inline trust indicator
    const indicator = document.createElement('div');
    indicator.id = 'inlineTrustIndicator';
    indicator.textContent = message; // Use textContent to avoid encoding issues
    indicator.style.cssText = `
        display: block;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 10px;
        font-weight: bold;
        text-align: center;
        width: fit-content;
        margin-left: auto;
        margin-right: auto;
        clear: both;
        position: relative;
        z-index: 10;
        ${type === 'success' ?
            'background-color: #d4edda; color: #155724; border: 1px solid #c3e6cb;' :
            'background-color: #fff3cd; color: #856404; border: 1px solid #ffeaa7;'
        }
    `;

    // Insert the indicator right after the keyboard shortcuts section
    if (keyboardShortcuts && keyboardShortcuts.nextElementSibling) {
        // Insert after the keyboard shortcuts section
        keyboardShortcuts.parentElement.insertBefore(indicator, keyboardShortcuts.nextElementSibling);
    } else if (keyboardShortcuts) {
        // Insert after the keyboard shortcuts section
        keyboardShortcuts.parentElement.appendChild(indicator);
    } else {
        // Fallback: insert at the beginning of the target container
        targetContainer.insertBefore(indicator, targetContainer.firstChild);
    }

    console.log('✅ Inline trust indicator added to address section');

    // Auto-remove after 10 seconds and show keyboard shortcuts back
    setTimeout(() => {
        if (indicator.parentNode) {
            indicator.remove();
            console.log('🗑️ Inline trust indicator removed');
        }

        // Show the keyboard shortcuts section back
        if (keyboardShortcuts) {
            keyboardShortcuts.style.display = '';
            console.log('👁️ Showing keyboard shortcuts section back');
        }
    }, 10000);
};

// Show trust indicator (keeping the old function for compatibility)
const showTrustIndicator = (message, type) => {
    console.log('🎨 Creating trust indicator:', message, type);

    // Remove existing trust indicator
    const existingIndicator = document.getElementById('trustIndicator');
    if (existingIndicator) {
        existingIndicator.remove();
    }

    // Create new trust indicator
    const indicator = document.createElement('div');
    indicator.id = 'trustIndicator';
    indicator.textContent = message;
    indicator.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 8px 12px;
        border-radius: 6px;
        font-size: 14px;
        font-weight: bold;
        z-index: 10000;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        ${type === 'success' ?
            'background-color: #d4edda; color: #155724; border: 2px solid #c3e6cb;' :
            'background-color: #fff3cd; color: #856404; border: 2px solid #ffeaa7;'
        }
    `;

    // Add to the popup container
    const container = document.querySelector('.container') || document.body;
    container.appendChild(indicator);

    console.log('✅ Trust indicator added to DOM');

    // Auto-remove after 8 seconds (longer for testing)
    setTimeout(() => {
        if (indicator.parentNode) {
            indicator.remove();
            console.log('🗑️ Trust indicator removed');
        }
    }, 8000);
};

const clearFields = () => {
    if (searchElement) searchElement.value = "";
    if (lblValue) lblValue.innerHTML = "...";

    // Clear profile picture
    const profilePicElement = document.getElementById('profilePicture');
    const defaultIcon = document.querySelector('.default-icon');
    if (profilePicElement && defaultIcon) {
        profilePicElement.style.display = 'none';
        defaultIcon.style.display = 'block';
    }

    // Clear trust indicators
    const trustIndicator = document.getElementById('trustIndicator');
    if (trustIndicator) {
        trustIndicator.remove();
    }
    const inlineTrustIndicator = document.getElementById('inlineTrustIndicator');
    if (inlineTrustIndicator) {
        inlineTrustIndicator.remove();
    }

    // Show keyboard shortcuts back if they were hidden
    const keyboardShortcuts = document.querySelector('.keyboard-shortcuts') ||
        document.querySelector('[class*="shortcut"]') ||
        Array.from(document.querySelectorAll('div')).find(div =>
            div.textContent?.includes('Keyboard Shortcuts') ||
            div.textContent?.includes('Tab') ||
            div.textContent?.includes('Enter')
        );

    if (keyboardShortcuts && keyboardShortcuts.style.display === 'none') {
        keyboardShortcuts.style.display = '';
        console.log('👁️ Showing keyboard shortcuts section back (cleared)');
    }

    hideResult();
};

// Settings management
let settings = {
    autoReplace: true,
    network: 'mainnet', // 'mainnet' or 'testnet'
};

// Prevent multiple rapid resolve calls
let isResolving = false;

// DOM elements (will be initialized in window.onload)
let searchElement, resolveBtn, resultCard, lblValue, lblHidden, copyBtn, explorerBtn, efpBtn, settingsBtn, settingsModal, closeSettingsBtn, autoReplaceToggle, ethPriceText, mainnetBtn, testnetBtn, networkIndicator, customResolverInput, deployResolverBtn, resolverStatusIndicator, resolverStatusText;

// Load settings from storage
async function loadSettings() {
    try {
        const result = await chrome.storage.sync.get(['ensResolverSettings']);
        if (result.ensResolverSettings) {
            settings = { ...settings, ...result.ensResolverSettings };
        }

        // Only set toggle states if elements exist
        if (autoReplaceToggle) {
            autoReplaceToggle.checked = settings.autoReplace;
        }

        // Load custom resolver if set
        if (customResolverInput && result.ensResolverSettings?.customResolver) {
            customResolverInput.value = result.ensResolverSettings.customResolver;
            validateCustomResolver();
        }

        // Set network button states
        if (mainnetBtn && testnetBtn) {
            if (settings.network === 'mainnet') {
                mainnetBtn.classList.add('active');
                testnetBtn.classList.remove('active');
            } else {
                mainnetBtn.classList.remove('active');
                testnetBtn.classList.add('active');
            }
        }

        // Update header network indicator
        updateNetworkIndicator();

        // Set initial in-page resolution state (only if we have an active tab)
        try {
            // This function is no longer used, so we remove it.
        } catch (error) {
            // This is normal when popup is opened without an active tab
            console.log('Could not initialize in-page resolution - no active tab');
        }
    } catch (error) {
        console.log('Error loading settings:', error);
    }
}

// Save settings to storage
async function saveSettings() {
    try {
        await chrome.storage.sync.set({ ensResolverSettings: settings });
    } catch (error) {
        console.log('Error saving settings:', error);
    }
}

// Update network indicator in header
function updateNetworkIndicator() {
    if (!networkIndicator) return;

    const networkDot = networkIndicator.querySelector('.network-dot');
    const networkText = networkIndicator.querySelector('.network-text');

    if (networkDot && networkText) {
        if (settings.network === 'mainnet') {
            networkDot.className = 'network-dot mainnet';
            networkText.textContent = 'Mainnet';
        } else {
            networkDot.className = 'network-dot testnet';
            networkText.textContent = 'Testnet';
        }
    }
}

// Fetch and display ETH price
async function fetchEthPrice() {
    if (!ethPriceText) return;

    try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd&include_24hr_change=true');
        const data = await response.json();

        if (data.ethereum) {
            const price = data.ethereum.usd;
            const change24h = data.ethereum.usd_24h_change;
            const isUp = change24h >= 0;
            const changeColor = isUp ? '#4CAF50' : '#FF6B6B';
            const arrowSVG = isUp
                ? `<svg style="vertical-align:middle" width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 19V5M12 5L6 11M12 5L18 11" stroke="${changeColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`
                : `<svg style="vertical-align:middle" width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 5v14M12 19l6-6M12 19l-6-6" stroke="${changeColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

            ethPriceText.innerHTML = `
                <span style="font-weight: bold;">$${price.toLocaleString()}</span>
                <span style="color: ${changeColor}; margin-left: 4px;">${arrowSVG} ${Math.abs(change24h).toFixed(2)}%</span>
            `;
        } else {
            ethPriceText.textContent = 'Price unavailable';
        }
    } catch (error) {
        console.log('Error fetching ETH price:', error);
        ethPriceText.textContent = 'Price unavailable';
    }
}

// Fetch and display ENS price
async function fetchEnsPrice() {
    const ensPriceText = document.getElementById('ensPriceText');
    if (!ensPriceText) return;

    try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum-name-service&vs_currencies=usd&include_24hr_change=true');
        const data = await response.json();

        if (data['ethereum-name-service']) {
            const price = data['ethereum-name-service'].usd;
            const change24h = data['ethereum-name-service'].usd_24h_change;
            const isUp = change24h >= 0;
            const changeColor = isUp ? '#4CAF50' : '#FF6B6B';
            const arrowSVG = isUp
                ? `<svg style="vertical-align:middle" width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 19V5M12 5L6 11M12 5L18 11" stroke="${changeColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`
                : `<svg style="vertical-align:middle" width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 5v14M12 19l6-6M12 19l-6-6" stroke="${changeColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

            ensPriceText.innerHTML = `
                <span style="font-weight: bold;">$${price.toLocaleString()}</span>
                <span style="color: ${changeColor}; margin-left: 4px;">${arrowSVG} ${Math.abs(change24h).toFixed(2)}%</span>
            `;
        } else {
            ensPriceText.textContent = 'Price unavailable';
        }
    } catch (error) {
        console.log('Error fetching ENS price:', error);
        ensPriceText.textContent = 'Price unavailable';
    }
}



// Custom Resolver Functions
function validateCustomResolver() {
    const resolverUrl = customResolverInput.value.trim();
    const statusIndicator = resolverStatusIndicator;
    const statusText = resolverStatusText;

    if (!resolverUrl) {
        statusIndicator.className = 'status-indicator';
        statusText.textContent = 'Using default resolver';
        return;
    }

    try {
        new URL(resolverUrl);
        statusIndicator.className = 'status-indicator';
        statusText.textContent = 'Custom resolver configured';

        // Save custom resolver to storage
        chrome.storage.sync.set({
            customResolver: resolverUrl
        });
    } catch (error) {
        statusIndicator.className = 'status-indicator error';
        statusText.textContent = 'Invalid URL format';
    }
}

async function openRemixWithResolver() {
    // Solidity code for a basic ENS resolver
    const resolverCode = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@ensdomains/ens-contracts/contracts/resolvers/Resolver.sol";

/**
 * @title Basic ENS Resolver
 * @dev A simple ENS resolver that can be customized for your needs
 * @author Fusion ENS
 */
contract BasicResolver is Resolver {
    
    // Mapping to store addresses for names
    mapping(bytes32 => address) private addresses;
    
    // Events
    event AddressChanged(bytes32 indexed node, address a);
    
    /**
     * @dev Sets the address for a given ENS name
     * @param node The ENS node hash
     * @param a The address to set
     */
    function setAddr(bytes32 node, address a) external {
        addresses[node] = a;
        emit AddressChanged(node, a);
    }
    
    /**
     * @dev Returns the address for a given ENS name
     * @param node The ENS node hash
     * @return The address associated with the node
     */
    function addr(bytes32 node) public view override returns (address) {
        return addresses[node];
    }
    
    /**
     * @dev Sets multiple records for a node
     * @param node The ENS node hash
     * @param key The record key
     * @param value The record value
     */
    function setText(bytes32 node, string calldata key, string calldata value) external {
        _setText(node, key, value);
    }
    
    /**
     * @dev Sets the content hash for a node
     * @param node The ENS node hash
     * @param hash The content hash
     */
    function setContenthash(bytes32 node, bytes calldata hash) external {
        _setContenthash(node, hash);
    }
}`;

    try {
        // Copy the code to clipboard
        await navigator.clipboard.writeText(resolverCode);

        // Open Remix in a new tab
        chrome.tabs.create({ url: 'https://remix.ethereum.org/' });

        // Show instructions
        toast('Code copied! Paste it in Remix and create a new file called "BasicResolver.sol"', 5000);

    } catch (error) {
        console.log('Clipboard copy failed:', error);

        // Fallback: just open Remix
        chrome.tabs.create({ url: 'https://remix.ethereum.org/' });
        toast('Opening Remix... Create a new file and use the resolver template from the documentation', 4000);
    }
}

// Initialize extension
window.onload = async () => {
    // Initialize DOM elements
    searchElement = document.getElementById("uinput");
    resolveBtn = document.getElementById("btnResolve");
    resultCard = document.getElementById("resultCard");
    lblValue = document.getElementById("lblValue");
    lblHidden = document.getElementById("lblHidden");
    copyBtn = document.getElementById("copyBtn");
    explorerBtn = document.getElementById("btnExplorer");
    efpBtn = document.getElementById("btnEfp");
    settingsBtn = document.getElementById("settingsBtn");
    settingsModal = document.getElementById("settingsModal");
    closeSettingsBtn = document.getElementById("closeSettingsBtn");
    autoReplaceToggle = document.getElementById("autoReplaceToggle");
    ethPriceText = document.getElementById("ethPriceText");
    mainnetBtn = document.getElementById("mainnetBtn");
    testnetBtn = document.getElementById("testnetBtn");
    networkIndicator = document.getElementById("networkIndicator");
    customResolverInput = document.getElementById("customResolverInput");
    deployResolverBtn = document.getElementById("deployResolverBtn");
    resolverStatusIndicator = document.getElementById("resolverStatusIndicator");
    resolverStatusText = document.getElementById("resolverStatusText");

    // Start rotating ENS names in the title
    rotateEnsName(); // Set initial name
    setInterval(rotateEnsName, 1000); // Rotate every second

    // Set up event listeners
    explorerBtn.onclick = explore;
    efpBtn.onclick = openEfp;
    resolveBtn.onclick = resolve;
    copyBtn.onclick = copy;
    deployResolverBtn.onclick = openRemixWithResolver;
    customResolverInput.addEventListener('input', validateCustomResolver);
    settingsBtn.onclick = () => {
        settingsModal.style.display = "flex";
    };
    closeSettingsBtn.onclick = () => {
        settingsModal.style.display = "none";
    };

    // Close modal when clicking outside
    settingsModal.onclick = (e) => {
        if (e.target === settingsModal) {
            settingsModal.style.display = "none";
        }
    };

    // Handle toggle changes
    if (autoReplaceToggle) {
        autoReplaceToggle.onchange = () => {
            settings.autoReplace = autoReplaceToggle.checked;
            saveSettings();

            // Send setting to content script
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs[0]) {
                    chrome.tabs.sendMessage(tabs[0].id, {
                        action: 'updateAutoReplace',
                        enabled: settings.autoReplace
                    }, (response) => {
                        if (chrome.runtime.lastError) {
                            // Content script not available, ignore
                        }
                    });
                }
            });
        };
    }

    // Handle network button changes
    if (mainnetBtn && testnetBtn) {
        mainnetBtn.onclick = () => {
            settings.network = 'mainnet';
            mainnetBtn.classList.add('active');
            testnetBtn.classList.remove('active');
            updateNetworkIndicator();
            saveSettings();

            // Send network setting to content script
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs[0]) {
                    chrome.tabs.sendMessage(tabs[0].id, {
                        action: 'updateNetwork',
                        network: settings.network
                    }, (response) => {
                        if (chrome.runtime.lastError) {
                            // Content script not available, ignore
                        }
                    });
                }
            });
        };

        testnetBtn.onclick = () => {
            settings.network = 'testnet';
            mainnetBtn.classList.remove('active');
            testnetBtn.classList.add('active');
            updateNetworkIndicator();
            saveSettings();

            // Send network setting to content script
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs[0]) {
                    chrome.tabs.sendMessage(tabs[0].id, {
                        action: 'updateNetwork',
                        network: settings.network
                    }, (response) => {
                        if (chrome.runtime.lastError) {
                            // Content script not available, ignore
                        }
                    });
                }
            });
        };
    }

    if (searchElement) {
        searchElement.addEventListener("keydown", function (event) {
            if (event.code === "Enter" && !event.ctrlKey && !event.metaKey && !event.shiftKey) {
                event.preventDefault();
                resolve();
            } else if (event.code === "Space") {
                event.preventDefault();
            }
        });
    }

    // Add keyboard shortcuts
    document.addEventListener("keydown", function (event) {
        // Ctrl/Cmd + Enter: Open on Etherscan
        if ((event.ctrlKey || event.metaKey) && event.code === "Enter") {
            event.preventDefault();
            explore();
        }
        // Shift + Enter: Open on app.ens.domains
        if (event.shiftKey && event.code === "Enter") {
            event.preventDefault();
            exploreEthXyz();
        }
    });

    // Load settings first
    await loadSettings();

    // Focus input immediately
    if (searchElement) {
        focusInput();
    }

    // Add auto-complete functionality
    if (searchElement) {
        setupAutoComplete();
    }

    // Fetch ETH and ENS prices
    fetchEthPrice();
    fetchEnsPrice();
}; 