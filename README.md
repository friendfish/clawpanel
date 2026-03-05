<p align="center">
  <img src="public/images/logo-brand.png" width="360" alt="ClawPanel">
</p>

<p align="center">
  OpenClaw 可视化管理面板 — 基于 Tauri v2 的跨平台桌面应用
</p>

<p align="center">
  <a href="https://github.com/qingchencloud/clawpanel/releases/latest">
    <img src="https://img.shields.io/github/v/release/qingchencloud/clawpanel?style=flat-square&color=6366f1" alt="Release">
  </a>
  <a href="https://github.com/qingchencloud/clawpanel/releases/latest">
    <img src="https://img.shields.io/github/downloads/qingchencloud/clawpanel/total?style=flat-square&color=8b5cf6" alt="Downloads">
  </a>
  <a href="https://github.com/qingchencloud/clawpanel/blob/main/LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square" alt="License">
  </a>
  <a href="https://github.com/qingchencloud/clawpanel/actions/workflows/ci.yml">
    <img src="https://img.shields.io/github/actions/workflow/status/qingchencloud/clawpanel/ci.yml?style=flat-square&label=CI" alt="CI">
  </a>
</p>

---

<p align="center">
  <img src="docs/terminal-demo.gif" width="800" alt="ClawPanel 安装演示">
</p>

<p align="center">
  <a href="https://claw.qt.cool/#video">
    <img src="https://img.shields.io/badge/%E2%96%B6%20%E6%BC%94%E7%A4%BA%E8%A7%86%E9%A2%91-38%E7%A7%92%E5%BF%AB%E9%80%9F%E4%BA%86%E8%A7%A3-6366f1?style=for-the-badge" alt="演示视频">
  </a>
</p>

ClawPanel 是 [OpenClaw](https://github.com/1186258278/OpenClawChineseTranslation) AI Agent 框架的可视化管理面板，提供服务管控、模型配置、日志查看、记忆管理等核心功能，一站式管理你的 OpenClaw 实例。

> 🌐 **官网**: [claw.qt.cool](https://claw.qt.cool/)  |  📦 **下载**: [GitHub Releases](https://github.com/qingchencloud/clawpanel/releases/latest)

## 下载安装

前往 [Releases](https://github.com/qingchencloud/clawpanel/releases/latest) 页面下载最新版本，根据你的系统选择对应安装包：

### macOS

| 芯片 | 安装包 | 说明 |
|------|--------|------|
| Apple Silicon (M1/M2/M3/M4) | `ClawPanel_x.x.x_aarch64.dmg` | 2020 年末及之后的 Mac |
| Intel | `ClawPanel_x.x.x_x64.dmg` | 2020 年及之前的 Mac |

> 不确定芯片类型？点击左上角  → 关于本机，查看「芯片」一栏。

安装方式：打开 `.dmg` 文件，将 ClawPanel 拖入「应用程序」文件夹。

> **⚠️ 首次打开提示"无法验证开发者"？** 由于应用未签名，macOS 会拦截。请在终端执行以下命令解除限制：
>
> ```bash
> sudo xattr -rd com.apple.quarantine /Applications/ClawPanel.app
> ```
>
> 或者前往「系统设置 → 隐私与安全性」，找到 ClawPanel 点击「仍要打开」。

### Windows

| 格式 | 安装包 | 说明 |
|------|--------|------|
| EXE 安装器 | `ClawPanel_x.x.x_x64-setup.exe` | 推荐，双击安装 |
| MSI 安装器 | `ClawPanel_x.x.x_x64_en-US.msi` | 企业部署 / 静默安装 |

### Linux

| 格式 | 安装包 | 说明 |
|------|--------|------|
| AppImage | `ClawPanel_x.x.x_amd64.AppImage` | 免安装，`chmod +x` 后直接运行 |
| DEB | `ClawPanel_x.x.x_amd64.deb` | Debian / Ubuntu：`sudo dpkg -i *.deb` |
| RPM | `ClawPanel-x.x.x-1.x86_64.rpm` | Fedora / RHEL：`sudo rpm -i *.rpm` |

### Linux 服务器（无 GUI）

不需要桌面环境，一键命令部署 OpenClaw Gateway，通过端口远程访问：

```bash
curl -fsSL https://raw.githubusercontent.com/qingchencloud/clawpanel/main/scripts/linux-deploy.sh | bash
```

📖 详细教程见 [Linux 服务器部署指南](docs/linux-deploy.md)

## 功能特性

<p align="center">
  <img src="docs/feature-showcase.gif" width="800" alt="功能矩阵">
</p>

- **仪表盘** — 系统概览，服务状态实时监控，快捷操作
- **服务管理** — OpenClaw 启停控制、版本检测与一键升级、Gateway 安装/卸载、配置备份与还原
- **模型配置** — 多服务商管理、模型增删改查、批量连通性测试、延迟检测、拖拽排序、自动保存+撤销
- **网关配置** — 端口、运行模式（本地/云端）、访问权限（本机/局域网）、认证 Token、Tailscale 组网
- **Agent 管理** — Agent 增删改查、身份编辑、模型配置、工作区管理
- **聊天** — 流式响应、Markdown 渲染、会话管理、Agent 选择、快捷指令
- **日志查看** — 多日志源实时查看与关键词搜索
- **记忆管理** — 记忆文件查看/编辑、分类管理、ZIP 导出、Agent 切换
- **扩展工具** — cftunnel 内网穿透管理、ClawApp 状态监控
- **关于** — 版本信息、社群入口、相关项目链接、一键升级

## 功能截图

<p align="center">
  <img src="docs/quick-stats.gif" width="800" alt="ClawPanel 数据概览">
</p>

<p align="center">
  <img src="docs/01.png" width="800" alt="仪表盘">
</p>
<p align="center"><em>仪表盘 — 系统运行概览，服务状态一目了然</em></p>

<p align="center">
  <img src="docs/02.png" width="800" alt="实时聊天">
</p>
<p align="center"><em>实时聊天 — WebSocket 流式对话，支持 Markdown 渲染与多会话管理</em></p>

<p align="center">
  <img src="docs/05.png" width="800" alt="模型配置">
</p>
<p align="center"><em>模型配置 — 多服务商管理，主模型+备选自动切换</em></p>

<p align="center">
  <img src="docs/08.png" width="800" alt="记忆文件">
</p>
<p align="center"><em>记忆文件 — 在线编辑 Agent 核心配置与工作记忆</em></p>

<details>
<summary><strong>查看更多截图</strong></summary>

<p align="center">
  <img src="docs/06.png" width="800" alt="Agent 管理">
</p>
<p align="center"><em>Agent 管理 — 多 Agent 创建、身份配置与工作区管理</em></p>

<p align="center">
  <img src="docs/07.png" width="800" alt="Gateway 配置">
</p>
<p align="center"><em>Gateway 配置 — 端口、访问权限、认证方式可视化配置</em></p>

<p align="center">
  <img src="docs/03.png" width="800" alt="服务管理">
</p>
<p align="center"><em>服务管理 — 启停控制、版本检测、一键升级、配置备份</em></p>

<p align="center">
  <img src="docs/04.png" width="800" alt="日志查看">
</p>
<p align="center"><em>日志查看 — 多日志源实时查看与关键词搜索</em></p>

<p align="center">
  <img src="docs/09.png" width="800" alt="扩展工具">
</p>
<p align="center"><em>扩展工具 — cftunnel 内网穿透、ClawApp 移动客户端管理</em></p>

<p align="center">
  <img src="docs/10.png" width="800" alt="系统诊断">
</p>
<p align="center"><em>系统诊断 — 全面健康检测与一键修复</em></p>

</details>

## 技术架构

<p align="center">
  <img src="docs/architecture.gif" width="800" alt="ClawPanel 生态架构">
</p>

| 层级 | 技术 | 说明 |
|------|------|------|
| 前端 | Vanilla JS + Vite | 零框架依赖，轻量快速 |
| 后端 | Rust + Tauri v2 | 原生性能，跨平台打包 |
| 通信 | Tauri IPC + Shell Plugin | 前后端桥接，本地命令执行 |
| 样式 | 纯 CSS（CSS Variables） | 暗色/亮色主题，玻璃拟态风格 |

```
clawpanel/
├── src/                    # 前端源码
│   ├── pages/              # 10 个页面模块
│   ├── components/         # 通用组件（侧边栏、弹窗、Toast）
│   ├── lib/                # 工具库（Tauri API 封装、主题）
│   ├── style/              # 样式文件
│   ├── router.js           # 路由
│   └── main.js             # 入口
├── src-tauri/              # Rust 后端
│   ├── src/                # Tauri 命令与业务逻辑
│   ├── Cargo.toml          # Rust 依赖
│   └── tauri.conf.json     # Tauri 配置
├── public/                 # 静态资源
├── scripts/                # 开发与构建脚本
│   ├── dev.sh              # 开发模式启动
│   └── build.sh            # 编译与打包
├── .github/workflows/      # CI/CD
│   ├── ci.yml              # 持续集成（push/PR 自动检查）
│   └── release.yml         # 发布构建（全平台打包）
├── index.html              # HTML 入口
├── vite.config.js          # Vite 配置
└── package.json            # 前端依赖
```

## 从源码构建

### 前置条件

- [Node.js](https://nodejs.org/) >= 18
- [Rust](https://www.rust-lang.org/tools/install) (stable)
- Tauri v2 系统依赖（参考 [Tauri 官方文档](https://v2.tauri.app/start/prerequisites/)）

### 安装与开发

```bash
git clone https://github.com/qingchencloud/clawpanel.git
cd clawpanel
npm install
```

#### macOS / Linux

```bash
# 启动完整 Tauri 桌面应用
./scripts/dev.sh

# 仅启动 Vite 前端（浏览器调试，使用 mock 数据）
./scripts/dev.sh web
```

#### Windows

```powershell
# 启动完整 Tauri 桌面应用
npm run tauri dev

# 仅启动 Vite 前端（浏览器调试，使用 mock 数据）
npm run dev
```

### 构建

#### macOS / Linux

```bash
# 编译 debug 版本
./scripts/build.sh

# 仅检查 Rust 编译（最快，不生成产物）
./scripts/build.sh check

# 编译正式发布版本（含打包）
./scripts/build.sh release
```

#### Windows

```powershell
# 检查 Rust 编译
cd src-tauri && cargo check

# 编译正式发布版本
npm run tauri build

# 指定打包格式（NSIS 安装器）
npm run tauri build -- --bundles nsis
```

产物位于 `src-tauri/target/release/` 目录。

## 常见问题

### macOS 提示"已损坏，无法打开"

没有苹果开发者签名，macOS Gatekeeper 会拦截。终端执行：

```bash
sudo xattr -rd com.apple.quarantine /Applications/ClawPanel.app
```

或前往「系统设置 → 隐私与安全性」点击「仍要打开」。

### macOS 检测不到 Node.js

从 Finder/Dock 启动 ClawPanel 时，应用的 PATH 环境变量可能不包含 Node.js 安装路径。

**v0.4.1 已修复**：自动补充 `/usr/local/bin`、`/opt/homebrew/bin`、`~/.nvm`、`~/.volta` 等常见路径。

临时解决：从终端启动 ClawPanel：

```bash
open /Applications/ClawPanel.app
```

### Windows 安装 OpenClaw 报 ENOENT (-4058)

通常是文件权限或 npm 缓存问题：

1. 以管理员身份运行 ClawPanel
2. 或打开 PowerShell（管理员）手动安装：
   ```powershell
   npm install -g @qingchencloud/openclaw-zh --registry https://registry.npmmirror.com
   ```
3. 如果仍报错，清理 npm 缓存：`npm cache clean --force`

### Windows 安装报 exit 128 (access rights)

npm 依赖需要 Git。如果已装 Git 但仍报 128，是因为依赖用了 SSH 协议拉代码但你没配 GitHub SSH Key。运行以下命令改用 HTTPS：

```powershell
git config --global url."https://github.com/".insteadOf ssh://git@github.com/
git config --global url."https://github.com/".insteadOf git@github.com:
```

没装 Git 的请先安装 [Git for Windows](https://git-scm.com/download/win)。**v0.4.2+ 已自动配置 HTTPS 模式。**

### Windows 安装报 EPERM (operation not permitted)

文件被其他进程锁定。先关闭 ClawPanel 和所有 Node.js 进程，以管理员身份打开 PowerShell 重装：

```powershell
npm cache clean --force
npm install -g @qingchencloud/openclaw-zh --registry https://registry.npmmirror.com
```

### 安装后 Node.js 检测不到（Windows）

安装 Node.js 后需要**重启 ClawPanel**，新的 PATH 环境变量才能生效。

如果安装在非默认路径（如 `D:\nodejs`、`F:\AI\Node`），请确认该目录已加入系统 PATH 环境变量。**v0.4.2+ 已自动扫描常见安装路径。**

## 相关项目

| 项目 | 说明 |
|------|------|
| [OpenClaw](https://github.com/1186258278/OpenClawChineseTranslation) | AI Agent 框架 |
| [ClawApp](https://github.com/qingchencloud/clawapp) | 跨平台移动聊天客户端 |
| [cftunnel](https://github.com/qingchencloud/cftunnel) | Cloudflare Tunnel 内网穿透工具 |

## 社区交流

加入社区，交流使用心得、反馈问题、获取最新动态。

<p align="center">
  <img src="docs/qr-qq.png" width="200" alt="QQ 群二维码">
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
  <img src="docs/qr-wechat.png" width="200" alt="微信群二维码">
</p>
<p align="center">
  <strong>QQ 交流群</strong>
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
  <strong>微信交流群</strong>
</p>

| 渠道 | 链接 |
|------|------|
| QQ 群 | [点击加入](https://qt.cool/c/OpenClaw) |
| 微信群 | [点击加入](https://qt.cool/c/OpenClawWx) |
| Discord | [加入 Discord](https://discord.gg/U9AttmsNHh) |
| 元宝派 | [加入元宝派](https://yb.tencent.com/gp/i/LsvIw7mdR7Lb) |
| GitHub Discussions | [参与讨论](https://github.com/qingchencloud/clawpanel/discussions) |
| 反馈 Issue | [提交 Issue](https://github.com/qingchencloud/clawpanel/issues/new) |

## 贡献

欢迎提交 Issue 和 Pull Request。贡献流程详见 [CONTRIBUTING.md](CONTRIBUTING.md)。

## 许可证

[MIT License](LICENSE)
