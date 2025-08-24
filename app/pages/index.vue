<script setup lang="ts">
import laveuse from "@/assets/img/laveuse.svg"
import secheuse from "@/assets/img/secheuse.svg"
</script>

<template>
  <div class="min-h-screen w-full">
    <div class="mx-auto max-w-2xl pt-30 ">
      <div class="mx-auto flex flex-col justify-center md:flex-row max-w-7xl gap-10">
        <Machine
          title="laveuse"
          timer-id="laveuse_timer"
          :timer="1800"
          :timer_label="30"
          :img="laveuse"
        />
        <Machine
          title="secheuse"
          timer-id="secheuse_timer"
          :timer="3600"
          :timer_label="60"
          :img="secheuse"
        />
      </div>
    </div>
  </div>
</template>
