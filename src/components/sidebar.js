/**
 * 侧边导航栏
 */
import { navigate, getCurrentRoute } from '../router.js'
import { toggleTheme, getTheme } from '../lib/theme.js'

const NAV_ITEMS = [
  {
    section: '概览',
    items: [
      { route: '/dashboard', label: '仪表盘', icon: 'dashboard' },
      { route: '/services', label: '服务管理', icon: 'services' },
      { route: '/logs', label: '日志查看', icon: 'logs' },
    ]
  },
  {
    section: '配置',
    items: [
      { route: '/models', label: '模型配置', icon: 'models' },
      { route: '/gateway', label: 'Gateway', icon: 'gateway' },
    ]
  },
  {
    section: '数据',
    items: [
      { route: '/memory', label: '记忆文件', icon: 'memory' },
    ]
  },
  {
    section: '扩展',
    items: [
      { route: '/extensions', label: '扩展工具', icon: 'extensions' },
    ]
  },
  {
    section: '',
    items: [
      { route: '/about', label: '关于', icon: 'about' },
    ]
  }
]

const ICONS = {
  dashboard: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>',
  services: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>',
  logs: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>',
  models: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12"/></svg>',
  gateway: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>',
  memory: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>',
  extensions: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>',
  about: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
}

let _delegated = false

export function renderSidebar(el) {
  const current = getCurrentRoute()

  let html = `
    <div class="sidebar-header">
      <div class="sidebar-logo">
        <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
          <g fill="currentColor">
            <circle cx="256" cy="280" r="55"/>
            <ellipse cx="140" cy="200" rx="32" ry="70" transform="rotate(-30 140 200)"/>
            <ellipse cx="372" cy="200" rx="32" ry="70" transform="rotate(30 372 200)"/>
            <ellipse cx="256" cy="380" rx="32" ry="70"/>
          </g>
        </svg>
      </div>
      <span class="sidebar-title">ClawPanel</span>
    </div>
    <nav class="sidebar-nav">
  `

  for (const section of NAV_ITEMS) {
    html += `<div class="nav-section">
      <div class="nav-section-title">${section.section}</div>`

    for (const item of section.items) {
      const active = current === item.route ? ' active' : ''
      html += `<div class="nav-item${active}" data-route="${item.route}">
        ${ICONS[item.icon] || ''}
        <span>${item.label}</span>
      </div>`
    }
    html += '</div>'
  }

  html += '</nav>'

  // 主题切换按钮
  const isDark = getTheme() === 'dark'
  const sunIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>'
  const moonIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>'

  html += `
    <div class="sidebar-footer">
      <div class="nav-item" id="btn-theme-toggle">
        ${isDark ? sunIcon : moonIcon}
        <span>${isDark ? '日间模式' : '夜间模式'}</span>
      </div>
    </div>
  `

  el.innerHTML = html

  // 事件委托：只绑定一次，避免重复绑定
  if (!_delegated) {
    _delegated = true
    el.addEventListener('click', (e) => {
      // 导航点击
      const navItem = e.target.closest('.nav-item[data-route]')
      if (navItem) {
        navigate(navItem.dataset.route)
        return
      }
      // 主题切换
      const themeBtn = e.target.closest('#btn-theme-toggle')
      if (themeBtn) {
        toggleTheme()
        renderSidebar(el)
      }
    })
  }
}
