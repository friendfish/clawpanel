/**
 * 消息渠道管理
 * 配置 Telegram / Discord 等外部消息接入，凭证校验后写入 openclaw.json
 */
import { api } from '../lib/tauri-api.js'
import { toast } from '../components/toast.js'
import { showContentModal, showConfirm } from '../components/modal.js'
import { icon } from '../lib/icons.js'

// ── 渠道注册表：定义每个支持的消息渠道的元数据和表单规格 ──

const PLATFORM_REGISTRY = {
  qqbot: {
    label: 'QQ 机器人',
    iconName: 'message-square',
    desc: '内置 QQ 机器人接入能力，通过 QQ 开放平台快速启用',
    guide: [
      '使用手机 QQ 扫描二维码，<a href="https://q.qq.com/qqbot/openclaw/login.html" target="_blank" style="color:var(--accent);text-decoration:underline">打开 QQ 机器人开放平台</a> 完成注册登录',
      '点击「创建机器人」，设置机器人名称和头像',
      '创建完成后，在机器人详情页复制 <b>AppID</b> 和 <b>AppSecret</b>（AppSecret 仅显示一次，请妥善保存）',
      '将 AppID 和 AppSecret 填入下方表单，点击「校验凭证」验证后保存',
      'ClawPanel 会自动安装 QQBot 社区插件并写入配置，保存后 Gateway 自动重载生效',
    ],
    guideFooter: '<div style="margin-top:8px;font-size:var(--font-size-xs);color:var(--text-tertiary)">详细教程：<a href="https://cloud.tencent.com/developer/article/2626045" target="_blank" style="color:var(--accent);text-decoration:underline">腾讯云 - 快速搭建 AI 私人 QQ 助理</a></div>',
    fields: [
      { key: 'appId', label: 'AppID', placeholder: '如 1903224859', required: true },
      { key: 'appSecret', label: 'AppSecret', placeholder: '如 cisldqspngYlyPdc', secret: true, required: true },
    ],
    pluginRequired: '@sliverp/qqbot@latest',
  },
  telegram: {
    label: 'Telegram',
    iconName: 'send',
    desc: '通过 BotFather 创建机器人，用 Bot Token 接入',
    guide: [
      '在 Telegram 中搜索 <a href="https://t.me/BotFather" target="_blank" style="color:var(--accent);text-decoration:underline">@BotFather</a>，发送 <b>/newbot</b> 创建机器人',
      '按提示设置机器人名称和用户名，成功后 BotFather 会返回 <b>Bot Token</b>',
      '获取你的 Telegram 用户 ID：发送消息给 <a href="https://t.me/userinfobot" target="_blank" style="color:var(--accent);text-decoration:underline">@userinfobot</a> 即可查看',
      '将 Bot Token 和用户 ID 填入下方表单，点击「校验凭证」验证后保存',
    ],
    fields: [
      { key: 'botToken', label: 'Bot Token', placeholder: '123456:ABC-DEF...', secret: true, required: true },
      { key: 'allowedUsers', label: '允许的用户 ID', placeholder: '多个用逗号分隔，如 12345, 67890', required: true },
    ],
  },
  discord: {
    label: 'Discord',
    iconName: 'message-circle',
    desc: '通过 Discord Developer Portal 创建 Bot 应用接入',
    guide: [
      '前往 <a href="https://discord.com/developers/applications" target="_blank" style="color:var(--accent);text-decoration:underline">Discord Developer Portal</a>，点击 New Application 创建应用',
      '进入应用 → 左侧 <b>Bot</b> 页面 → 点击 Reset Token 生成 Bot Token，并开启 <b>Message Content Intent</b>',
      '左侧 <b>OAuth2</b> → URL Generator，勾选 bot 权限，复制链接将 Bot 邀请到你的服务器',
      '将 Bot Token 和服务器 ID 填入下方表单，点击「校验凭证」验证后保存',
    ],
    fields: [
      { key: 'token', label: 'Bot Token', placeholder: 'MTIz...', secret: true, required: true },
      { key: 'guildId', label: '服务器 ID', placeholder: '右键服务器 → 复制服务器 ID', required: false },
      { key: 'channelId', label: '频道 ID（可选）', placeholder: '不填则监听所有频道', required: false },
    ],
  },
}

// ── 页面生命周期 ──

export async function render() {
  const page = document.createElement('div')
  page.className = 'page'

  page.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">消息渠道</h1>
      <p class="page-desc">内置 QQ 机器人，并支持 Telegram、Discord 等外部消息渠道接入</p>
    </div>
    <div id="platforms-configured" style="margin-bottom:var(--space-lg)"></div>
    <div class="config-section">
      <div class="config-section-title">可接入平台</div>
      <div id="platforms-available" class="platforms-grid"></div>
    </div>
  `

  const state = { configured: [] }
  await loadPlatforms(page, state)

  return page
}

export function cleanup() {}

// ── 数据加载 ──

async function loadPlatforms(page, state) {
  try {
    const list = await api.listConfiguredPlatforms()
    state.configured = Array.isArray(list) ? list : []
  } catch (e) {
    toast('加载平台列表失败: ' + e, 'error')
    state.configured = []
  }
  renderConfigured(page, state)
  renderAvailable(page, state)
}

// ── 已配置平台渲染 ──

function renderConfigured(page, state) {
  const el = page.querySelector('#platforms-configured')
  if (!state.configured.length) {
    el.innerHTML = ''
    return
  }

  el.innerHTML = `
    <div class="config-section">
      <div class="config-section-title">已接入</div>
      <div class="platforms-grid">
        ${state.configured.map(p => {
          const reg = PLATFORM_REGISTRY[p.id]
          const label = reg?.label || p.id
          const ic = icon(reg?.iconName || 'radio', 22)
          return `
            <div class="platform-card ${p.enabled ? 'active' : 'inactive'}" data-pid="${p.id}">
              <div class="platform-card-header">
                <span class="platform-emoji">${ic}</span>
                <span class="platform-name">${label}</span>
                <span class="platform-status-dot ${p.enabled ? 'on' : 'off'}"></span>
              </div>
              <div class="platform-card-actions">
                <button class="btn btn-sm btn-secondary" data-action="edit">${icon('edit', 14)} 编辑</button>
                <button class="btn btn-sm btn-secondary" data-action="toggle">${p.enabled ? icon('pause', 14) + ' 禁用' : icon('play', 14) + ' 启用'}</button>
                <button class="btn btn-sm btn-danger" data-action="remove">${icon('trash', 14)}</button>
              </div>
            </div>
          `
        }).join('')}
      </div>
    </div>
  `

  // 绑定事件
  el.querySelectorAll('.platform-card').forEach(card => {
    const pid = card.dataset.pid
    card.querySelector('[data-action="edit"]').onclick = () => openConfigDialog(pid, page, state)
    card.querySelector('[data-action="toggle"]').onclick = async () => {
      const cur = state.configured.find(p => p.id === pid)
      if (!cur) return
      try {
        await api.toggleMessagingPlatform(pid, !cur.enabled)
        toast(`${PLATFORM_REGISTRY[pid]?.label || pid} 已${cur.enabled ? '禁用' : '启用'}`, 'success')
        await loadPlatforms(page, state)
      } catch (e) { toast('操作失败: ' + e, 'error') }
    }
    card.querySelector('[data-action="remove"]').onclick = async () => {
      const yes = await showConfirm(`确定移除 ${PLATFORM_REGISTRY[pid]?.label || pid}？配置将被删除。`)
      if (!yes) return
      try {
        await api.removeMessagingPlatform(pid)
        toast('已移除', 'info')
        await loadPlatforms(page, state)
      } catch (e) { toast('移除失败: ' + e, 'error') }
    }
  })
}

// ── 可接入平台渲染 ──

function renderAvailable(page, state) {
  const el = page.querySelector('#platforms-available')
  const configuredIds = new Set(state.configured.map(p => p.id))

  el.innerHTML = Object.entries(PLATFORM_REGISTRY).map(([pid, reg]) => {
    const done = configuredIds.has(pid)
    return `
      <button class="platform-pick ${done ? 'configured' : ''}" data-pid="${pid}">
        <span class="platform-emoji">${icon(reg.iconName, 28)}</span>
        <span class="platform-pick-name">${reg.label}</span>
        <span class="platform-pick-desc">${reg.desc}</span>
        ${done ? `<span class="platform-pick-badge">已接入</span>` : ''}
      </button>
    `
  }).join('')

  el.querySelectorAll('.platform-pick').forEach(btn => {
    btn.onclick = () => openConfigDialog(btn.dataset.pid, page, state)
  })
}

// ── 配置弹窗（新增 / 编辑共用） ──

async function openConfigDialog(pid, page, state) {
  const reg = PLATFORM_REGISTRY[pid]
  if (!reg) { toast('未知平台', 'error'); return }

  // 尝试加载已有配置
  let existing = {}
  let isEdit = false
  try {
    const res = await api.readPlatformConfig(pid)
    if (res?.exists && res.values) {
      existing = res.values
      isEdit = true
    }
  } catch {}

  const formId = 'platform-form-' + Date.now()

  const fieldsHtml = reg.fields.map((f, i) => {
    const val = existing[f.key] || ''
    return `
      <div class="form-group">
        <label class="form-label">${f.label}${f.required ? ' *' : ''}</label>
        <div style="display:flex;gap:8px">
          <input class="form-input" name="${f.key}" type="${f.secret ? 'password' : 'text'}"
                 value="${escapeAttr(val)}" placeholder="${f.placeholder || ''}"
                 ${i === 0 ? 'autofocus' : ''} style="flex:1">
          ${f.secret ? `<button type="button" class="btn btn-sm btn-secondary toggle-vis" data-field="${f.key}">显示</button>` : ''}
        </div>
      </div>
    `
  }).join('')

  const guideHtml = reg.guide?.length ? `
    <div style="background:var(--bg-tertiary);padding:12px 16px;border-radius:var(--radius-md);margin-bottom:var(--space-md)">
      <div style="font-weight:600;font-size:var(--font-size-sm);margin-bottom:6px">接入步骤</div>
      <ol style="margin:0;padding-left:20px;font-size:var(--font-size-sm);color:var(--text-secondary);line-height:1.8">
        ${reg.guide.map(s => `<li>${s}</li>`).join('')}
      </ol>
      ${reg.guideFooter || ''}
    </div>
  ` : ''

  const content = `
    ${guideHtml}
    ${isEdit ? `<div style="background:var(--accent-muted);color:var(--accent);padding:8px 14px;border-radius:var(--radius-md);font-size:var(--font-size-sm);margin-bottom:var(--space-md)">当前已有配置，修改后点击保存即可覆盖</div>` : ''}
    <form id="${formId}">
      ${fieldsHtml}
    </form>
    <div id="verify-result" style="margin-top:var(--space-sm)"></div>
  `

  const modal = showContentModal({
    title: `${isEdit ? '编辑' : '接入'} ${reg.label}`,
    content,
    buttons: [
      { label: '校验凭证', className: 'btn btn-secondary', id: 'btn-verify' },
      { label: isEdit ? '保存' : '接入并保存', className: 'btn btn-primary', id: 'btn-save' },
    ],
    width: 520,
  })

  // 外部链接用系统浏览器打开
  modal.addEventListener('click', (e) => {
    const a = e.target.closest('a[href]')
    if (!a) return
    const href = a.getAttribute('href')
    if (href && (href.startsWith('http://') || href.startsWith('https://'))) {
      e.preventDefault()
      import('@tauri-apps/plugin-shell').then(({ open }) => open(href)).catch(() => window.open(href, '_blank'))
    }
  })

  // 密码显隐
  modal.querySelectorAll('.toggle-vis').forEach(btn => {
    btn.onclick = () => {
      const input = modal.querySelector(`input[name="${btn.dataset.field}"]`)
      if (!input) return
      const show = input.type === 'password'
      input.type = show ? 'text' : 'password'
      btn.textContent = show ? '隐藏' : '显示'
    }
  })

  // 收集表单值
  const collectForm = () => {
    const obj = {}
    reg.fields.forEach(f => {
      const el = modal.querySelector(`input[name="${f.key}"]`)
      if (el) obj[f.key] = el.value.trim()
    })
    return obj
  }

  // 校验按钮
  const btnVerify = modal.querySelector('#btn-verify')
  const btnSave = modal.querySelector('#btn-save')
  const resultEl = modal.querySelector('#verify-result')

  btnVerify.onclick = async () => {
    const form = collectForm()
    // 前端基础检查
    for (const f of reg.fields) {
      if (f.required && !form[f.key]) {
        toast(`请填写「${f.label}」`, 'warning')
        return
      }
    }
    btnVerify.disabled = true
    btnVerify.textContent = '校验中...'
    resultEl.innerHTML = ''
    try {
      const res = await api.verifyBotToken(pid, form)
      if (res.valid) {
        const details = (res.details || []).join(' · ')
        resultEl.innerHTML = `
          <div style="background:var(--success-muted);color:var(--success);padding:10px 14px;border-radius:var(--radius-md);font-size:var(--font-size-sm)">
            ${icon('check', 14)} 凭证有效${details ? ' — ' + details : ''}
          </div>`
      } else {
        const errs = (res.errors || ['校验失败']).join('<br>')
        resultEl.innerHTML = `
          <div style="background:var(--error-muted, #fee2e2);color:var(--error);padding:10px 14px;border-radius:var(--radius-md);font-size:var(--font-size-sm)">
            ${icon('x', 14)} ${errs}
          </div>`
      }
    } catch (e) {
      resultEl.innerHTML = `<div style="color:var(--error);font-size:var(--font-size-sm)">校验请求失败: ${e}</div>`
    } finally {
      btnVerify.disabled = false
      btnVerify.textContent = '校验凭证'
    }
  }

  // 保存按钮
  btnSave.onclick = async () => {
    const form = collectForm()
    for (const f of reg.fields) {
      if (f.required && !form[f.key]) {
        toast(`请填写「${f.label}」`, 'warning')
        return
      }
    }
    btnSave.disabled = true
    btnVerify.disabled = true
    btnSave.textContent = '保存中...'

    try {
      // 如果需要安装插件，先安装并显示日志
      if (reg.pluginRequired) {
        btnSave.textContent = '安装插件中...'
        resultEl.innerHTML = `
          <div style="background:var(--bg-tertiary);border-radius:var(--radius-md);padding:12px;margin-top:var(--space-sm)">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
              ${icon('download', 14)}
              <span style="font-size:var(--font-size-sm);font-weight:600">安装插件</span>
              <span id="plugin-progress-text" style="font-size:var(--font-size-xs);color:var(--text-tertiary);margin-left:auto">0%</span>
            </div>
            <div style="height:4px;background:var(--bg-secondary);border-radius:2px;overflow:hidden;margin-bottom:8px">
              <div id="plugin-progress-bar" style="height:100%;background:var(--accent);width:0%;transition:width 0.3s"></div>
            </div>
            <div id="plugin-log-box" style="font-family:var(--font-mono);font-size:11px;color:var(--text-secondary);max-height:120px;overflow-y:auto;line-height:1.6;white-space:pre-wrap;word-break:break-all"></div>
          </div>
        `
        const logBox = resultEl.querySelector('#plugin-log-box')
        const progressBar = resultEl.querySelector('#plugin-progress-bar')
        const progressText = resultEl.querySelector('#plugin-progress-text')

        // 监听 Tauri 事件
        let unlistenLog, unlistenProgress
        try {
          const { listen } = await import('@tauri-apps/api/event')
          unlistenLog = await listen('plugin-log', (e) => {
            logBox.textContent += e.payload + '\n'
            logBox.scrollTop = logBox.scrollHeight
          })
          unlistenProgress = await listen('plugin-progress', (e) => {
            const pct = e.payload
            progressBar.style.width = pct + '%'
            progressText.textContent = pct + '%'
          })
        } catch {}

        try {
          await api.installQqbotPlugin()
        } catch (e) {
          toast('插件安装失败: ' + e, 'error')
          btnSave.disabled = false
          btnVerify.disabled = false
          btnSave.textContent = isEdit ? '保存' : '接入并保存'
          if (unlistenLog) unlistenLog()
          if (unlistenProgress) unlistenProgress()
          return
        }
        if (unlistenLog) unlistenLog()
        if (unlistenProgress) unlistenProgress()
      }

      // 写入配置
      btnSave.textContent = '写入配置...'
      await api.saveMessagingPlatform(pid, form)
      toast(`${reg.label} 配置已保存，Gateway 正在重载`, 'success')
      modal.close?.() || modal.remove?.()
      await loadPlatforms(page, state)
    } catch (e) {
      toast('保存失败: ' + e, 'error')
    } finally {
      btnSave.disabled = false
      btnVerify.disabled = false
      btnSave.textContent = isEdit ? '保存' : '接入并保存'
    }
  }
}

function escapeAttr(str) {
  return (str || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
