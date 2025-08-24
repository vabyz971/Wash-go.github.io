<script setup lang="ts">
import logo from "@/assets/img/Icon.svg"
</script>

<template>
  <header class="absolute inset-x-0 top-0 z-50">
    <nav aria-label="Global" class="p-6">
      <div class="flex lg:flex-1">
        <NuxtLink to="/" class="m-1.5 p-1.5">
          <img :src="logo" alt="logo wash and go" class="h-18 w-auto md:h-28">
        </NuxtLink>
      </div>
    </nav>
  </header>
</template>