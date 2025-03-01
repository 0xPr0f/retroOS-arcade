# 🎮 RetroOS Arcade

A web-based arcade gaming platform that simulates a desktop operating system experience. Play classic games like Snake, Tetris, and Minesweeper in a familiar desktop environment.

[RetroOS contracts](https://github.com/0xPr0f/retroOS-contracts) for the arcade.

## ✨ Features

- 🖥️ Complete window management system:
  - Window dragging and repositioning
  - Window resizing/maximizing
  - Minimize/maximize/close controls
  - Multi-window support
- 🕹️ Classic arcade games, including on-chain gaming experiences
- ⛓️ On-chain apps and tooling
- 🎨 Customizable apps and user interface
- 🔓 Open-source platform for developers to deploy their own apps
- 🧪 Experimental persistent state management:
  - Uses [nuqs](https://www.npmjs.com/package/nuqs) for type-safe URL query parameters
  - Enables deep linking capabilities
  - Maintains app state across page reloads
  - Perfect for sharing specific app configurations
  - Note: This feature is currently experimental and may cause unexpected behavior

## 🚀 Quick Start

### 📋 Prerequisites

- [Node.js 23+](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
- [pnpm](https://pnpm.io/installation)
- [Mozilla Firefox](https://www.mozilla.org/en-US/firefox/new) (recommended for development)

### 💻 Installation

1. Clone the repository:

```bash
git clone https://github.com/0xPr0f/arcade-vista.git
```

2. Install dependencies:

```bash
pnpm i
```

3. Set up environment variables:

```bash
cp env.example .env
```

4. Start the development server:

```bash
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## 👩‍💻 For Developers

RetroOS Arcade is an open platform where developers can deploy their own applications. To learn more about building and deploying apps on our platform, visit our [Developer Documentation](/src/components/apps/README.md).

## ⚠️ Known Issues

- The application is currently in an experimental phase

- Performance may vary across different browsers and devices
- Best performance is achieved using Mozilla Firefox
- URL-based state management (nuqs) may cause:
  - Long URLs with complex app states

## 🛠️ Built With

- [Next.js](https://nextjs.org/) - The React Framework for the Web
- [TypeScript](https://www.typescriptlang.org/) - JavaScript with syntax for types.

## 🔧 Partner Tech

- [Para](https://www.getpara.com/) - Seamless Web3 onboarding with embedded and pre-generated wallets for a frictionless user experience

## 🤝 Contributing

We welcome contributions! Please read our [contributing guidelines](/CONTRIBUTION.md) to get started.
