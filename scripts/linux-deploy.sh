#!/bin/bash
set -e

echo "=========================================="
echo "  OpenClaw 一键部署脚本"
echo "=========================================="
echo ""

# 检测系统
detect_os() {
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        OS=$ID
        OS_LIKE=$ID_LIKE
    elif [ -f /etc/redhat-release ]; then
        OS="centos"
    else
        OS=$(uname -s | tr '[:upper:]' '[:lower:]')
    fi
    echo "🖥️  系统: $OS $(uname -m)"
}

# 安装 Node.js
install_node() {
    if command -v node &> /dev/null; then
        local node_major=$(node -v | sed 's/v//' | cut -d. -f1)
        if [ "$node_major" -ge 18 ]; then
            echo "✅ Node.js $(node -v) 已安装"
            return 0
        else
            echo "⚠️  Node.js 版本过低 ($(node -v))，需要 >= 18"
        fi
    fi

    echo "📦 安装 Node.js 22..."

    case "$OS" in
        ubuntu|debian|linuxmint|pop)
            curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
            sudo apt-get install -y nodejs
            ;;
        centos|rhel|fedora|rocky|alma|opencloudos)
            curl -fsSL https://rpm.nodesource.com/setup_22.x | sudo bash -
            sudo yum install -y nodejs || sudo dnf install -y nodejs
            ;;
        alpine)
            sudo apk add nodejs npm
            ;;
        arch|manjaro)
            sudo pacman -S --noconfirm nodejs npm
            ;;
        *)
            # 通用方式：使用 nvm
            echo "🔧 未识别的发行版，使用 nvm 安装..."
            if ! command -v nvm &> /dev/null; then
                curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
                export NVM_DIR="$HOME/.nvm"
                [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
            fi
            nvm install 22
            nvm alias default 22
            ;;
    esac

    echo "✅ Node.js $(node -v) 安装成功"
}

# 安装 OpenClaw
install_openclaw() {
    echo "📦 安装 OpenClaw 汉化版..."

    # 检查是否需要修复 npm 权限
    local npm_prefix=$(npm config get prefix 2>/dev/null || echo "/usr/local")
    if [ ! -w "$npm_prefix/lib" ] 2>/dev/null; then
        # 无写入权限，使用用户目录
        if [ "$(id -u)" -ne 0 ]; then
            echo "🔧 配置 npm 用户目录..."
            mkdir -p ~/.npm-global
            npm config set prefix '~/.npm-global'
            export PATH=~/.npm-global/bin:$PATH
            if ! grep -q '.npm-global/bin' ~/.bashrc 2>/dev/null; then
                echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
            fi
        fi
    fi

    npm install -g @qingchencloud/openclaw-zh --registry https://registry.npmmirror.com

    # 验证
    if command -v openclaw &> /dev/null; then
        echo "✅ OpenClaw $(openclaw --version) 安装成功"
    else
        echo "❌ openclaw 命令未找到，请检查 PATH"
        echo "   尝试: source ~/.bashrc && openclaw --version"
        exit 1
    fi
}

# 初始化配置
init_config() {
    mkdir -p ~/.openclaw

    if [ -f ~/.openclaw/openclaw.json ]; then
        echo "✅ 配置文件已存在，跳过初始化"
        return 0
    fi

    echo "📝 写入默认配置..."
    cat > ~/.openclaw/openclaw.json << 'EOF'
{
  "mode": "local",
  "tools": {
    "profile": "full",
    "sessions": {
      "visibility": "all"
    }
  },
  "gateway": {
    "port": 18789,
    "bind": "lan",
    "auth": {}
  },
  "models": {
    "providers": {}
  }
}
EOF

    echo "✅ 配置已写入 ~/.openclaw/openclaw.json"
}

# 安装 systemd 服务
install_service() {
    # 检查 systemd 是否可用
    if ! command -v systemctl &> /dev/null; then
        echo "⚠️  systemd 不可用，使用 nohup 后台启动..."
        nohup openclaw gateway start > ~/.openclaw/gateway.log 2>&1 &
        echo $! > ~/.openclaw/gateway.pid
        echo "✅ Gateway 已后台启动 (PID: $(cat ~/.openclaw/gateway.pid))"
        return 0
    fi

    echo "⚙️  配置 systemd 服务..."

    local node_path=$(dirname $(which node))
    local openclaw_path=$(which openclaw)

    sudo tee /etc/systemd/system/openclaw.service > /dev/null << SVCEOF
[Unit]
Description=OpenClaw Gateway
After=network.target

[Service]
Type=simple
User=$USER
Environment=PATH=$node_path:/usr/local/bin:/usr/bin:/bin
ExecStart=$openclaw_path gateway start
Restart=on-failure
RestartSec=5
WorkingDirectory=$HOME

[Install]
WantedBy=multi-user.target
SVCEOF

    sudo systemctl daemon-reload
    sudo systemctl enable openclaw
    sudo systemctl start openclaw

    # 等待启动
    sleep 3
    if sudo systemctl is-active --quiet openclaw; then
        echo "✅ Gateway 服务已启动并设为开机自启"
    else
        echo "⚠️  Gateway 服务可能未启动，请检查: journalctl -u openclaw -n 20"
    fi
}

# 获取服务器 IP
get_server_ip() {
    local ip=$(hostname -I 2>/dev/null | awk '{print $1}')
    if [ -z "$ip" ]; then
        ip=$(ip route get 1 2>/dev/null | awk '{print $7; exit}')
    fi
    if [ -z "$ip" ]; then
        ip="localhost"
    fi
    echo "$ip"
}

# 主流程
main() {
    detect_os
    echo ""

    install_node
    echo ""

    install_openclaw
    echo ""

    init_config
    echo ""

    install_service
    echo ""

    local server_ip=$(get_server_ip)
    local port=$(grep -o '"port":[[:space:]]*[0-9]*' ~/.openclaw/openclaw.json 2>/dev/null | head -1 | grep -o '[0-9]*' || echo "18789")

    echo "=========================================="
    echo "  ✅ 部署完成！"
    echo "=========================================="
    echo ""
    echo "  Gateway 地址: http://${server_ip}:${port}"
    echo ""
    echo "  管理命令:"
    if command -v systemctl &> /dev/null; then
        echo "    sudo systemctl status openclaw   # 查看状态"
        echo "    sudo systemctl restart openclaw  # 重启"
        echo "    journalctl -u openclaw -f        # 查看日志"
    else
        echo "    cat ~/.openclaw/gateway.pid      # 查看 PID"
        echo "    tail -f ~/.openclaw/gateway.log  # 查看日志"
        echo "    kill \$(cat ~/.openclaw/gateway.pid)  # 停止"
    fi
    echo ""
    echo "  下一步:"
    echo "    1. 编辑 ~/.openclaw/openclaw.json 添加模型 API Key"
    if command -v systemctl &> /dev/null; then
        echo "    2. sudo systemctl restart openclaw"
    else
        echo "    2. 重启 Gateway"
    fi
    echo "    3. 用 ClawPanel 或 ClawApp 连接管理"
    echo ""
}

main "$@"
