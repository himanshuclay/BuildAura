<template>
  <!-- container -->
  <aside
    class="sidebar"
    :class="{
      collapsed,
      'mobile': isMobile,
      'is-mobile-open': mobileOpen
    }"
    role="navigation"
    aria-label="Sidebar"
  >
    <!-- header -->
    <div class="sidebar-header">
      <slot name="brand">
        <NuxtLink to="/" class="brand">MyApp</NuxtLink>
      </slot>

      <div class="spacer" />

      <!-- collapse toggle (hidden on mobile) -->
      <button
        v-if="!isMobile"
        class="icon-btn"
        @click="toggleCollapse"
        :aria-label="collapsed ? 'Expand sidebar' : 'Collapse sidebar'"
        :title="collapsed ? 'Expand' : 'Collapse'"
      >
        <span v-html="icons.menu" />
      </button>

      <!-- mobile close -->
      <button
        v-if="isMobile"
        class="icon-btn"
        @click="closeMobile"
        aria-label="Close menu"
        title="Close"
      >
        ×
      </button>
    </div>

    <!-- optional top slot (e.g., search) -->
    <div v-if="!collapsed" class="top-slot">
      <slot name="top" />
    </div>

    <!-- nav -->
    <nav class="sidebar-nav" @keydown="onKeydownList">
      <ul class="nav-root">
        <li
          v-for="(item, idx) in items"
          :key="idx"
          :class="['nav-item', { active: isActive(item) }]"
        >
          <!-- group -->
          <div v-if="item.children && item.children.length" class="nav-group">
            <button
              class="nav-link group-toggle"
              :aria-expanded="!!openGroups[idx]"
              :aria-controls="'group-' + idx"
              @click="toggleGroup(idx)"
            >
              <span class="icon" v-html="item.icon || icons.folder" />
              <span class="label" v-show="!collapsed">{{ item.label }}</span>
              <span class="chev" v-show="!collapsed" :class="{ open: !!openGroups[idx] }">▾</span>
            </button>

            <ul
              :id="'group-' + idx"
              class="sub-nav"
              v-show="!collapsed && openGroups[idx]"
            >
              <li
                v-for="(child, cidx) in item.children"
                :key="cidx"
                :class="['sub-item', { active: isActive(child) }]"
              >
                <NuxtLink class="nav-link" :to="child.to" @click="onNavigate">
                  <span class="icon" v-html="child.icon || icons.dot" />
                  <span class="label">{{ child.label }}</span>
                </NuxtLink>
              </li>
            </ul>
          </div>

          <!-- single link -->
          <NuxtLink
            v-else
            class="nav-link"
            :to="item.to"
            @click="onNavigate"
          >
            <span class="icon" v-html="item.icon || icons.file" />
            <span class="label" v-show="!collapsed">{{ item.label }}</span>
          </NuxtLink>
        </li>
      </ul>
    </nav>

    <!-- footer -->
    <div class="sidebar-footer" v-show="!collapsed">
      <slot name="footer" />
    </div>
  </aside>

  <!-- backdrop for mobile -->
  <div
    v-if="isMobile && mobileOpen"
    class="backdrop"
    @click="closeMobile"
  />
</template>

<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRoute } from 'vue-router'

/**
 * PROPS
 * - items: [{ label, to, icon?, matchExact?, children?: [{ label, to, icon? }] }]
 * - collapsedDefault: Boolean
 * - breakpoint: Number (px) under which it behaves as a mobile drawer
 * - storageKeyPrefix: String to namespace localStorage keys
 */
const props = defineProps({
  items: {
    type: Array,
    default: () => ([
      { label: 'Dashboard', to: '/', icon: '' },
    //   {
    //     label: 'Products',
    //     icon: '',
    //     children: [
    //       { label: 'All Products', to: '/products' },
    //       { label: 'Create', to: '/products/new' }
    //     ]
    //   },
      { label: 'Generate Signature', to: '/generate-signature' },
      { label: 'Employee', to: '/employee' },
      { label: 'Validation', to: '/validation' },
    //   { label: 'Settings', to: '/settings' }
    ])
  },
  collapsedDefault: { type: Boolean, default: false },
  breakpoint: { type: Number, default: 992 },
  storageKeyPrefix: { type: String, default: 'sidebar' }
})

/* simple inline SVG icons */
const icons = {
  menu:
    '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>',
  folder:
    '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h6a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" fill="none" stroke-width="2"/></svg>',
  file:
    '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12V8z" stroke="currentColor" fill="none" stroke-width="2"/><path d="M14 2v6h6" stroke="currentColor" fill="none" stroke-width="2"/></svg>',
  dot:
    '<svg xmlns="http://www.w3.org/2000/svg" width="6" height="6" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4" fill="currentColor"/></svg>'
}

const route = useRoute()

// state
const collapsed = ref(false)
const mobileOpen = ref(false)
const isMobile = ref(false)
const openGroups = reactive({}) // { idx: true/false }

// localStorage keys
const LS_COLLAPSED = `${props.storageKeyPrefix}:collapsed`
const LS_GROUPS = `${props.storageKeyPrefix}:groups`

function loadState () {
  if (typeof window === 'undefined') return
  try {
    const c = localStorage.getItem(LS_COLLAPSED)
    collapsed.value = c === null ? props.collapsedDefault : c === '1'

    const g = localStorage.getItem(LS_GROUPS)
    if (g) {
      const parsed = JSON.parse(g)
      Object.keys(parsed).forEach(k => { openGroups[k] = !!parsed[k] })
    }
  } catch {}
}

function saveGroups () {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(LS_GROUPS, JSON.stringify(openGroups))
  } catch {}
}

function toggleCollapse () {
  collapsed.value = !collapsed.value
  if (typeof window !== 'undefined') {
    localStorage.setItem(LS_COLLAPSED, collapsed.value ? '1' : '0')
  }
}

function toggleGroup (idx) {
  openGroups[idx] = !openGroups[idx]
  saveGroups()
}

function isActive (item) {
  if (!item) return false
  if (item.matchExact) return route.path === item.to
  if (item.to) return route.path.startsWith(item.to)
  if (item.children && item.children.length) {
    return item.children.some(c => isActive(c))
  }
  return false
}

function onNavigate () {
  if (isMobile.value) closeMobile()
}

function onKeydownList (e) {
  // basic accessibility: close on Escape (mobile)
  if (e.key === 'Escape' && isMobile.value && mobileOpen.value) {
    closeMobile()
  }
}

function handleResize () {
  if (typeof window === 'undefined') return
  isMobile.value = window.innerWidth < props.breakpoint
  if (!isMobile.value) {
    mobileOpen.value = false
  }
}

function openMobile () { if (isMobile.value) mobileOpen.value = true }
function closeMobile () { mobileOpen.value = false }
function toggleMobile () { isMobile.value ? (mobileOpen.value = !mobileOpen.value) : null }

defineExpose({ openMobile, closeMobile, toggleMobile })

// auto-expand parent group for active child (first mount)
function expandActiveParents () {
  props.items.forEach((it, idx) => {
    if (it.children && it.children.some(c => isActive(c))) {
      openGroups[idx] = true
    }
  })
  saveGroups()
}

onMounted(() => {
  loadState()
  handleResize()
  window.addEventListener('resize', handleResize)
  expandActiveParents()
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
})

// close drawer on route change (mobile)
watch(() => route.fullPath, () => {
  if (isMobile.value) closeMobile()
})
</script>

<style scoped>
:root { /* in case you want to copy CSS vars elsewhere */ }

.sidebar {
  --w: 260px;
  --w-collapsed: 72px;
  --bg: #0f172a;       /* slate-900 */
  --bg-2: #111827;     /* gray-900 */
  --txt: #e5e7eb;      /* gray-200 */
  --muted: #94a3b8;    /* slate-400 */
  --accent: #36a2ef;
  inset: 0 auto 0 0;
  width: var(--w);
  background: linear-gradient(180deg, var(--bg), var(--bg-2));
  color: var(--txt);
  display: flex;
  flex-direction: column;
  z-index: 1000;
  border-right: 1px solid rgba(255,255,255,0.06);
  transform: translateX(0);
  transition: width .2s ease, transform .25s ease;
}

.sidebar.collapsed { width: var(--w-collapsed); }
.sidebar.mobile { transform: translateX(-100%); }
.sidebar.mobile.is-mobile-open { transform: translateX(0); }

.sidebar-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 10px 12px 12px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.brand {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  color: #fff;
  text-decoration: none;
  font-size: 16px;
}
.spacer { flex: 1; }

.icon-btn {
  width: 34px;
  height: 34px;
  border: 1px solid rgba(255,255,255,0.12);
  background: transparent;
  color: #cbd5e1;
  border-radius: 8px;
  cursor: pointer;
  display: grid;
  place-items: center;
}
.icon-btn:hover { background: rgba(255,255,255,0.06); }

.top-slot { padding: 10px 10px 0 12px; }

.sidebar-nav {
  overflow-y: auto;
  padding: 8px 6px 10px 6px;
  flex: 1;
}
.nav-root { list-style: none; margin: 0; padding: 0; }

.nav-item { margin: 4px 0; }

.nav-link {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 10px 10px 12px;
  border-radius: 10px;
  color: var(--txt);
  text-decoration: none;
  font-size: 14px;
  border: 1px solid transparent;
  background: transparent;
  cursor: pointer;
}
.nav-link:hover { background: rgba(255,255,255,0.06); }

.nav-item.active > .nav-link,
.sub-item.active .nav-link {
  background: rgba(54,162,239,0.18);
  border-color: rgba(54,162,239,0.35);
  color: #fff;
}

.icon { display: inline-grid; place-items: center; width: 18px; min-width: 18px; }
.label { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.group-toggle { text-align: left; }

.sub-nav {
  list-style: none;
  margin: 4px 0 6px 0;
  padding: 0 0 0 34px;
}
.sub-item .nav-link { padding: 8px 8px 8px 10px; font-size: 13px; }

.chev { margin-left: auto; transition: transform .15s ease; opacity: .9; }
.chev.open { transform: rotate(180deg); }

.sidebar-footer {
  padding: 10px 12px 14px 12px;
  border-top: 1px solid rgba(255,255,255,0.06);
  font-size: 13px;
  color: var(--muted);
}

/* collapsed: hide labels and submenus */
.sidebar.collapsed .label,
.sidebar.collapsed .sub-nav,
.sidebar.collapsed .chev { display: none; }
.sidebar.collapsed .nav-link { justify-content: center; padding: 10px; }

/* backdrop for mobile */
.backdrop {
  position: fixed; inset: 0;
  background: rgba(0,0,0,.45);
  z-index: 999;
}
</style>
