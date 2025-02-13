<template>
    <nav
      :class="{ collapsed: !expanded, 'tmp-showing': tmpShowing, showing: mobileShowing }"
      class="group flex flex-col fixed md:relative w-full md:w-k-sidebar-width z-10"
      @mouseenter="onMouseEnter"
      @mouseleave="onMouseLeave"
    >
      <section class="home-search-block p-6 flex gap-2">
        <HomeButton />
        <SearchForm class="flex-1" />
      </section>

      <section v-koel-overflow-fade class="pt-2 pb-10 overflow-y-auto space-y-8">
        <SidebarYourMusicSection />
        <SidebarPlaylistsSection />
        <SidebarManageSection v-if="showManageSection" />
      </section>

      <section v-if="!isPlus && isAdmin" class="p-6 flex-1 flex flex-col-reverse">
        <BtnUpgradeToPlus />
      </section>

      <SidebarToggleButton
        class="opacity-0 no-hover:opacity-100 group-hover:opacity-100 transition"
        v-model="expanded"
        :class="expanded || 'opacity-100'"
      />
    </nav>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import { eventBus } from '@/utils'
import { useAuthorization, useKoelPlus, useLocalStorage, useRouter, useUpload } from '@/composables'

import SidebarPlaylistsSection from './SidebarPlaylistsSection.vue'
import SearchForm from '@/components/ui/SearchForm.vue'
import BtnUpgradeToPlus from '@/components/koel-plus/BtnUpgradeToPlus.vue'
import SidebarYourMusicSection from './SidebarYourLibrarySection.vue'
import SidebarManageSection from './SidebarManageSection.vue'
import SidebarToggleButton from '@/components/layout/main-wrapper/sidebar/SidebarToggleButton.vue'
import HomeButton from '@/components/layout/main-wrapper/sidebar/HomeButton.vue'

const { onRouteChanged } = useRouter()
const { isAdmin } = useAuthorization()
const { allowsUpload } = useUpload()
const { isPlus } = useKoelPlus()
const { get: lsGet, set: lsSet } = useLocalStorage()

const mobileShowing = ref(false)
const expanded = ref(!lsGet('sidebar-collapsed', false))

watch(expanded, value => lsSet('sidebar-collapsed', !value))

const showManageSection = computed(() => isAdmin.value || allowsUpload.value)

let tmpShowingHandler: number | undefined
const tmpShowing = ref(false)

const onMouseEnter = () => {
  if (expanded.value) return;

  tmpShowingHandler = window.setTimeout(() => {
    if (expanded.value) return
    tmpShowing.value = true
  }, 500)
}

const onMouseLeave = (e: MouseEvent) => {
  if (!e.relatedTarget) {
    return
  }

  if (tmpShowingHandler) {
    clearTimeout(tmpShowingHandler)
    tmpShowingHandler = undefined
  }

  tmpShowing.value = false
}

onRouteChanged(_ => (mobileShowing.value = false))

/**
 * Listen to toggle sidebar event to show or hide the sidebar.
 * This should only be triggered on a mobile device.
 */
eventBus.on('TOGGLE_SIDEBAR', () => (mobileShowing.value = !mobileShowing.value))
</script>

<style lang="postcss" scoped>
@import '@/../css/partials/mixins.pcss';

nav {
  @apply bg-k-bg-secondary;
  -ms-overflow-style: -ms-autohiding-scrollbar;
  box-shadow: 0 0 5px 0 rgba(0, 0, 0, 0.1);

  &.collapsed {
    @apply w-[24px] transition-[width] duration-200;

    > *:not(.btn-toggle) {
      @apply hidden;
    }

    &.tmp-showing {
      @apply absolute h-screen z-50 bg-k-bg-primary w-k-sidebar-width shadow-2xl;

      > *:not(.btn-toggle) {
        @apply block;
      }

      > .home-search-block {
        @apply flex;
      }
    }
  }

  @media screen and (max-width: 768px) {
    @mixin themed-background;
    z-index: 999;

    transform: translateX(-100vw);
    transition: transform .2s ease-in-out;
    height: calc(100vh - var(--header-height));

    &.showing {
      transform: translateX(0);
    }
  }
}
</style>
