<script setup lang="ts">
import fond from "@/assets/img/fond_laverie_dark.jpg"
</script>

<template>
  <div class="bg-no-repeat bg-cover bg-center min-h-full" :class="`bg-[url(${fond})]`">
    <UContainer>
      <UApp>
        <HeaderApp />
        <NuxtPage />
      </UApp>
    </UContainer>
  </div>
</template>

<style scoped>

.background {
  background-image: url(fond);
}


</style>