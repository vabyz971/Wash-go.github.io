<template>
  <div class="min-h-screen w-full">
    <div class="mx-auto max-w-2xl pt-30 sm:pt-40">
      <div class="mx-auto grid max-w-7xl gap-10 lg:px-8 xl:grid-cols-3">
        <Machine
          title="laveuse"
          timer-id="laveuse_timer"
          :timer="1800"
          :timer_label="30"
          img="/img/laveuse.svg"
        />
        <Machine
          title="secheuse"
          timer-id="secheuse_timer"
          :timer="3600"
          :timer_label="60"
          img="/img/secheuse.svg"
        />
      </div>
    </div>
  </div>
</template>
