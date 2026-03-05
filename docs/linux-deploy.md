# Linux 服务器部署指南

本文介绍如何在 Linux 服务器上部署 OpenClaw，从零到跑通只需 5 分钟。

适用场景：云服务器、NAS、家庭 HomeLab、无 GUI 的 Linux 主机。

## 目录

- [一键部署](#一键部署)
- [分步安装](#分步安装)
- [配置模型](#配置模型)
- [启动 Gateway](#启动-gateway)
- [开机自启](#开机自启)
- [远程管理](#远程管理)
- [反向代理](#反向代理)
- [常见问题](#常见问题)

---

## 一键部署

复制以下命令到终端，一键完成 Node.js + OpenClaw 安装、配置、启动：

```bash
curl -fsSL https://raw.githubusercontent.com/qingchencloud/clawpanel/main/scripts/linux-deploy.sh | bash
```

> 脚本会自动检测系统环境，安装 Node.js（如未安装），安装 OpenClaw 汉化版，配置默认参数，启动 Gateway。

不想用一键脚本？往下看分步安装。

---

## 分步安装

### 1. 安装 Node.js

OpenClaw 需要 Node.js >= 18。选择适合你的安装方式：

**方式一：包管理器（推荐）**

```bash
# Ubuntu / Debian
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs

# CentOS / RHEL / Fedora
curl -fsSL https://rpm.nodesource.com/setup_22.x | sudo bash -
sudo yum install -y nodejs

# Alpine
apk add nodejs npm
```

**方式二：nvm（多版本管理）**

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
source ~/.bashrc
nvm install 22
```

验证安装：

```bash
node -v   # 应显示 v18+ 版本号
npm -v    # 应显示 npm 版本号
```

### 2. 安装 OpenClaw

```bash
# 使用淘宝镜像源（国内服务器推荐）
npm install -g @qingchencloud/openclaw-zh --registry https://registry.npmmirror.com

# 或使用官方源
npm install -g @qingchencloud/openclaw-zh
```

验证安装：

```bash
openclaw --version
```

### 3. 初始化配置

```bash
# 创建配置目录
mkdir -p ~/.openclaw

# 写入基础配置
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
```

**配置说明：**

| 字段 | 值 | 说明 |
|------|------|------|
| `mode` | `"local"` | 运行模式，必须设置 |
| `tools.profile` | `"full"` | Agent 工具权限，`full` 为全部开启 |
| `gateway.port` | `18789` | Gateway 监听端口 |
| `gateway.bind` | `"lan"` | `"loopback"` 仅本机 / `"lan"` 局域网可访问 |
| `gateway.auth` | `{}` | 认证配置，生产环境建议设置 Token |

**设置访问密钥（推荐）：**

如果你的服务器有公网 IP 或局域网内有其他设备访问，强烈建议设置 Token：

```bash
# 用 jq 修改（需安装 jq）
jq '.gateway.auth = {"mode": "token", "token": "你的密钥"}' ~/.openclaw/openclaw.json > /tmp/oc.json && mv /tmp/oc.json ~/.openclaw/openclaw.json

# 或直接编辑
nano ~/.openclaw/openclaw.json
```

---

## 配置模型

OpenClaw 需要至少一个 AI 模型才能使用。编辑 `~/.openclaw/openclaw.json`，在 `models.providers` 中添加服务商：

### 示例：添加 OpenAI 兼容服务商

```bash
cat > /tmp/add-provider.py << 'PYEOF'
import json, sys
config_path = f"{sys.path[0]}/../.openclaw/openclaw.json".replace(sys.path[0] + "/../", "")
import os
config_path = os.path.expanduser("~/.openclaw/openclaw.json")
with open(config_path) as f:
    config = json.load(f)

# 修改为你的实际服务商信息
provider_id = "my-provider"
config["models"]["providers"][provider_id] = {
    "baseUrl": "https://api.openai.com/v1",
    "apiKey": "sk-xxxx",
    "models": [
        {"id": "gpt-4o", "name": "GPT-4o"},
        {"id": "gpt-4o-mini", "name": "GPT-4o Mini"}
    ]
}

# 设置默认模型
config.setdefault("agents", {}).setdefault("defaults", {})["model"] = {
    "primary": f"{provider_id}/gpt-4o"
}

with open(config_path, "w") as f:
    json.dump(config, f, indent=2, ensure_ascii=False)

print(f"✅ 已添加服务商 {provider_id}")
PYEOF
python3 /tmp/add-provider.py
```

**或者直接编辑 JSON（更直观）：**

```bash
nano ~/.openclaw/openclaw.json
```

在 `models.providers` 中加入：

```json
{
  "models": {
    "providers": {
      "my-provider": {
        "baseUrl": "https://api.openai.com/v1",
        "apiKey": "sk-xxxx",
        "models": [
          { "id": "gpt-4o", "name": "GPT-4o" },
          { "id": "gpt-4o-mini", "name": "GPT-4o Mini" }
        ]
      }
    }
  }
}
```

> 支持任何 OpenAI 兼容 API（DeepSeek、通义千问、智谱、Ollama 等），只需修改 `baseUrl` 和 `apiKey`。

---

## 启动 Gateway

### 前台运行（调试用）

```bash
openclaw gateway start
```

看到类似输出说明启动成功：

```
Gateway listening on http://0.0.0.0:18789
```

按 `Ctrl+C` 停止。

### 后台运行

```bash
# 使用 nohup
nohup openclaw gateway start > ~/.openclaw/gateway.log 2>&1 &
echo $! > ~/.openclaw/gateway.pid

# 查看日志
tail -f ~/.openclaw/gateway.log

# 停止
kill $(cat ~/.openclaw/gateway.pid)
```

### 验证运行

```bash
# 检查端口是否在监听
ss -tlnp | grep 18789

# 测试 API 响应
curl http://localhost:18789/health

# 从其他机器测试（替换为服务器 IP）
curl http://你的服务器IP:18789/health
```

---

## 开机自启

### 方式一：systemd（推荐）

```bash
sudo tee /etc/systemd/system/openclaw.service << EOF
[Unit]
Description=OpenClaw Gateway
After=network.target

[Service]
Type=simple
User=$USER
Environment=PATH=$(dirname $(which node)):$PATH
ExecStart=$(which openclaw) gateway start
Restart=on-failure
RestartSec=5
WorkingDirectory=$HOME

[Install]
WantedBy=multi-user.target
EOF

# 启用并启动
sudo systemctl daemon-reload
sudo systemctl enable openclaw
sudo systemctl start openclaw

# 查看状态
sudo systemctl status openclaw

# 查看日志
journalctl -u openclaw -f
```

**常用命令：**

```bash
sudo systemctl start openclaw     # 启动
sudo systemctl stop openclaw      # 停止
sudo systemctl restart openclaw   # 重启
sudo systemctl status openclaw    # 查看状态
journalctl -u openclaw -f         # 实时日志
```

### 方式二：PM2

```bash
# 安装 PM2
npm install -g pm2

# 启动
pm2 start "openclaw gateway start" --name openclaw

# 设置开机自启
pm2 save
pm2 startup

# 常用命令
pm2 status        # 查看状态
pm2 logs openclaw # 查看日志
pm2 restart openclaw
pm2 stop openclaw
```

### 方式三：Docker（适合隔离部署）

```bash
docker run -d \
  --name openclaw \
  --restart unless-stopped \
  -p 18789:18789 \
  -v ~/.openclaw:/root/.openclaw \
  node:22-slim \
  sh -c "npm install -g @qingchencloud/openclaw-zh --registry https://registry.npmmirror.com && openclaw gateway start"
```

---

## 远程管理

Gateway 启动后，你可以通过以下方式管理：

### 方式一：ClawPanel 桌面端远程连接

在你的 Windows/Mac 电脑上安装 [ClawPanel](https://github.com/qingchencloud/clawpanel/releases/latest)，打开后在 Gateway 配置页选择「云端模式」，填入服务器地址即可远程管理。

### 方式二：ClawApp 移动端

用手机上的 [ClawApp](https://github.com/qingchencloud/clawapp) 连接 Gateway 地址，随时随地与 AI 对话。

### 方式三：API 直接调用

Gateway 兼容 OpenAI API 格式，任何支持 OpenAI API 的客户端都可以直连：

```bash
# 对话测试
curl http://你的服务器IP:18789/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer 你的Token" \
  -d '{
    "model": "gpt-4o",
    "messages": [{"role": "user", "content": "你好"}]
  }'
```

**在第三方客户端中使用：**

| 设置项 | 值 |
|--------|------|
| API Base URL | `http://服务器IP:18789/v1` |
| API Key | 你在 `gateway.auth.token` 中设置的密钥 |
| Model | 你配置的模型 ID（如 `gpt-4o`） |

支持 Cherry Studio、ChatBox、LobeChat、BotGem 等所有兼容 OpenAI API 的客户端。

---

## 反向代理

生产环境建议用 Nginx 反向代理，加上 HTTPS。

### Nginx 配置

```nginx
server {
    listen 443 ssl http2;
    server_name ai.example.com;

    ssl_certificate     /etc/ssl/certs/ai.example.com.pem;
    ssl_certificate_key /etc/ssl/private/ai.example.com.key;

    location / {
        proxy_pass http://127.0.0.1:18789;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # WebSocket 支持（聊天流式响应需要）
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_read_timeout 86400;
    }
}
```

```bash
sudo nginx -t && sudo systemctl reload nginx
```

配置完成后，用 `https://ai.example.com` 替代 IP + 端口访问。

### Cloudflare Tunnel（无需公网 IP）

如果你的服务器没有公网 IP，可以用 [cftunnel](https://github.com/qingchencloud/cftunnel) 一键穿透：

```bash
# 安装 cftunnel
npm install -g cftunnel

# 创建隧道
cftunnel create --name my-ai --hostname ai.example.com --url http://localhost:18789

# 启动
cftunnel start
```

---

## 防火墙

如果需要外部访问，记得开放端口：

```bash
# UFW（Ubuntu）
sudo ufw allow 18789/tcp

# firewalld（CentOS / Fedora）
sudo firewall-cmd --permanent --add-port=18789/tcp
sudo firewall-cmd --reload

# iptables
sudo iptables -A INPUT -p tcp --dport 18789 -j ACCEPT
```

> 如果使用了 Nginx 反向代理，只需开放 80/443 端口，不需要开放 18789。

---

## 升级

```bash
# 升级 OpenClaw
npm install -g @qingchencloud/openclaw-zh --registry https://registry.npmmirror.com

# 重启服务
sudo systemctl restart openclaw
# 或
pm2 restart openclaw
```

---

## 常见问题

### npm install 报错 EACCES（权限不足）

```bash
# 方式一：修复 npm 全局目录权限
mkdir -p ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc

# 然后重新安装
npm install -g @qingchencloud/openclaw-zh
```

### Gateway 启动后外部无法访问

1. 检查 `gateway.bind` 是否为 `"lan"`（不要用 `"loopback"`）
2. 检查防火墙是否放行了端口
3. 云服务器检查安全组规则是否开放端口

```bash
# 验证监听地址
ss -tlnp | grep 18789
# 应显示 0.0.0.0:18789，而不是 127.0.0.1:18789
```

### 端口被占用

```bash
# 查看谁占了端口
sudo lsof -i :18789

# 改用其他端口
jq '.gateway.port = 18790' ~/.openclaw/openclaw.json > /tmp/oc.json && mv /tmp/oc.json ~/.openclaw/openclaw.json
```

### Node.js 版本太低

```bash
node -v
# 如果低于 v18，需要升级

# 使用 nvm 升级
nvm install 22
nvm alias default 22
```

### 内存不足

OpenClaw Gateway 本身占用很小（约 50-100MB），但如果你同时运行 Ollama 等本地模型，建议至少 4GB 内存。

---

## 完整配置参考

```json
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
    "mode": "local",
    "auth": {
      "mode": "token",
      "token": "your-secret-token"
    }
  },
  "models": {
    "providers": {
      "deepseek": {
        "baseUrl": "https://api.deepseek.com/v1",
        "apiKey": "sk-xxxx",
        "models": [
          { "id": "deepseek-chat", "name": "DeepSeek V3" },
          { "id": "deepseek-reasoner", "name": "DeepSeek R1" }
        ]
      }
    }
  },
  "agents": {
    "defaults": {
      "model": {
        "primary": "deepseek/deepseek-chat"
      }
    }
  }
}
```

---

## 一键部署脚本参考

不想记那么多命令？保存以下脚本到服务器，一键搞定：

```bash
#!/bin/bash
set -e

echo "=========================================="
echo "  OpenClaw 一键部署脚本"
echo "=========================================="

# 检查 Node.js
if ! command -v node &> /dev/null || [ "$(node -v | sed 's/v//' | cut -d. -f1)" -lt 18 ]; then
    echo "📦 安装 Node.js 22..."
    curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi
echo "✅ Node.js $(node -v)"

# 安装 OpenClaw
echo "📦 安装 OpenClaw..."
npm install -g @qingchencloud/openclaw-zh --registry https://registry.npmmirror.com
echo "✅ OpenClaw $(openclaw --version)"

# 初始化配置
mkdir -p ~/.openclaw
if [ ! -f ~/.openclaw/openclaw.json ]; then
    echo "📝 写入默认配置..."
    cat > ~/.openclaw/openclaw.json << 'CONF'
{
  "mode": "local",
  "tools": { "profile": "full", "sessions": { "visibility": "all" } },
  "gateway": { "port": 18789, "bind": "lan", "auth": {} },
  "models": { "providers": {} }
}
CONF
fi

# 创建 systemd 服务
echo "⚙️ 配置开机自启..."
sudo tee /etc/systemd/system/openclaw.service > /dev/null << SVCEOF
[Unit]
Description=OpenClaw Gateway
After=network.target

[Service]
Type=simple
User=$USER
Environment=PATH=$(dirname $(which node)):$PATH
ExecStart=$(which openclaw) gateway start
Restart=on-failure
RestartSec=5
WorkingDirectory=$HOME

[Install]
WantedBy=multi-user.target
SVCEOF

sudo systemctl daemon-reload
sudo systemctl enable openclaw
sudo systemctl start openclaw

echo ""
echo "=========================================="
echo "  ✅ 部署完成！"
echo "=========================================="
echo ""
echo "  Gateway 地址: http://$(hostname -I | awk '{print $1}'):18789"
echo ""
echo "  管理命令:"
echo "    sudo systemctl status openclaw   # 查看状态"
echo "    sudo systemctl restart openclaw  # 重启"
echo "    journalctl -u openclaw -f        # 查看日志"
echo ""
echo "  下一步:"
echo "    1. 编辑 ~/.openclaw/openclaw.json 添加你的模型 API Key"
echo "    2. sudo systemctl restart openclaw"
echo "    3. 用 ClawPanel 或 ClawApp 连接 Gateway"
echo ""
```

保存为 `deploy.sh`，然后 `chmod +x deploy.sh && ./deploy.sh`。
