# 🛡️ Rage Store: Automated License Provisioning Bot

## 📌 Project Overview
A secure, Node.js-based Discord integration designed to automate customer onboarding and license validation for **Rage Store** software products. 

Instead of manual account creation, this bot acts as a middleware bridge between the community Discord server and the **KeyAuth API**, allowing users to securely redeem their purchased license keys and provision their own accounts seamlessly.

## 🚀 Business Impact
* **Zero-Touch Provisioning:** Eliminates the need for manual admin intervention after a sale. Customers purchase a key, run a slash command (`/registerkey`), and gain immediate access to the software.
* **Multi-App Architecture:** Built with a scalable fallback loop that dynamically checks license validity across multiple software environments (e.g., `ragestore` and `painelragePRO`).
* **Enhanced Security:** Implemented input sanitization to prevent injection attacks and utilizes ephemeral Discord interactions to ensure sensitive credentials (passwords and keys) are never exposed in public channels.

## 🛠️ Technical Highlights
* **Stack:** Node.js, `discord.js` (v14), `axios` for HTTP requests.
* **API Integration:** Deep integration with KeyAuth REST API, managing session initialization (INIT) and cryptographic user registration workflows.
* **Environment Security:** Strict adherence to security best practices using `dotenv` to isolate application secrets, Discord tokens, and API owner IDs from the codebase.
* **Asynchronous Error Handling:** Robust `try-catch` structures and API response validation to handle session timeouts or invalid payloads gracefully.

## 💡 How it works under the hood
1. User triggers the Discord UI Modal via Slash Commands.
2. The bot sanitizes the input and initializes an encrypted session with the KeyAuth server.
3. A fallback loop tests the sanitized key against configured product lines.
4. Upon validation, the user is provisioned, and the hardware ID (HWID) binding process is primed for their first software launch.