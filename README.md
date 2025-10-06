# 🔗 Fusion ENS Extension

A powerful browser extension for resolving ENS names across multiple chains with enhanced security features.

---

## ✨ Features

### 🔐 **DNSSEC Security Validation**
- **Real-time DNSSEC validation** for .eth domains
- **Visual security indicators**: 🔒 Secure / ⚠️ Warning
- **Cryptographic verification** of DNS responses
- **Enhanced trust** for ENS resolutions

### 🌐 **Multi-Chain Resolution**
- **New Format**: `name.eth:chain` (e.g., `onshow.eth:btc`)
- **Supported Chains**: Bitcoin, Solana, Dogecoin, XRP, Litecoin, Bitcoin Cash, Cardano, Polkadot, Avalanche, Polygon, Base, Arbitrum, Optimism, BSC
- **Smart Autocomplete**: Type `:` after `.eth` to see chain suggestions
- **Arrow Key Navigation**: Use ↑↓ to cycle through available chains
- **Tab Completion**: Press Tab to auto-complete selected chain

### 🎯 **Smart Resolution**
- **Fusion ENS API integration** for mainnet and testnet
- **Fallback mechanisms** for reliability
- **Profile picture support** for .eth domains
- **Auto-copy** resolved addresses

---

## 🚀 Quick Start

### **Method 1: Full Format**
1. **Click the extension icon**
2. **Type a name** → e.g. `onshow`
3. **Press Tab** → auto-completes to `onshow.eth`
4. **Type `:`** → shows chain suggestions
5. **Use ↑↓** to select chain → **Press Tab** to complete
6. **Press Enter** → address appears and copied automatically

**Example Flow:**
`onshow` → Tab → `onshow.eth` → `:` → ↑↓ → Tab → `onshow.eth:btc` → Enter

### **Method 2: Shortcut Format**
1. **Type name directly with colon** → e.g. `onshow:btc`
2. **Press Enter** → automatically becomes `onshow.eth:btc` and resolves

**Example Flow:**
`onshow:btc` → Enter (auto-inserts .eth)

---

## 🔍 Multi-Chain Examples

**New Format (Recommended):**
- `onshow.eth:btc` → Bitcoin address
- `onshow.eth:sol` → Solana address
- `alice.eth:base` → Base network address
- `bob.eth:doge` → Dogecoin address

**Shortcut Format (Auto-inserts .eth):**
- `vitalik:btc` → Bitcoin address (becomes `onshow.eth:btc`)
- `onshow:sol` → Solana address (becomes `onshow.eth:sol`)
- `ses:url` → Website URL (becomes `ses.eth:url`)
- `alice:x` → Twitter/X profile (becomes `alice.eth:x`)

**Legacy Format (Still Supported):**
- `ses.sol` → Solana address
- `vitalik.btc` → Bitcoin address
- `alice.base` → Base network address

**Social Profiles:**
- `ses.x` → Twitter/X profile
- `ses.github` → GitHub page
- `ses.url` → Website
- `ses.name` → Display name
- `ses.bio` → Short bio

**Each result includes:**
- ✅ Full address with DNSSEC validation
- ✅ Copy button
- ✅ Link to correct block explorer
- ✅ Security status indicator

---

## ⌨️ Keyboard Shortcuts

- **Tab** → Auto-complete `.eth` or selected chain
- **:** → Show chain suggestions (after `.eth`)
- **↑↓** → Navigate through chain suggestions
- **Enter** → Resolve
- **Escape** → Close suggestions
- **Ctrl/Cmd+Enter** → Open explorer/profile
- **Shift+Enter** → Open `app.ens.domains` profile

---

## 🛡️ Security Features

### **DNSSEC Validation**
- Validates cryptographic signatures for .eth domains
- Shows security status with visual indicators
- Temporarily hides shortcuts to highlight security info
- Uses Cloudflare's DNS-over-HTTPS for validation

### **Network Support**
- **Mainnet**: Full ENS resolution with DNSSEC
- **Testnet**: Sepolia testnet support
- **Fusion ENS API**: Production ENS resolution server

---

## 🎨 User Interface

- **Clean, modern design** with dark theme
- **Real-time price tracking** for ETH and ENS tokens
- **ENS avatar support** for .eth domains
- **Auto-replace functionality** for webpages
- **Settings panel** for customization

---

## 🔧 Technical Details

- **Fusion ENS API**: Production resolution server for enhanced control
- **Multi-chain Support**: 14+ supported blockchain networks with proper address decoding
- **Smart Autocomplete**: Intuitive chain suggestion system with keyboard navigation
- **DNSSEC Integration**: Real-time security validation for .eth domains
- **Profile Integration**: ENS metadata and avatar support
- **Address Decoding**: Proper decoding for Bitcoin (P2WPKH), Solana (Base58), Dogecoin (P2PKH), and Ethereum-compatible chains
- **Backward Compatibility**: Supports both new `name.eth:chain` and legacy `name.chain` formats 