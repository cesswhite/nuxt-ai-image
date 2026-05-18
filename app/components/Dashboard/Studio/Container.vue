<template>
  <div class="h-screen w-full relative">
    <div class="h-screen w-full overflow-y-scroll bg-default pr-64 pb-40">
      <DashboardStudioPreviewPanel />
    </div>

    <div class="fixed right-0 top-0 z-10 flex h-screen w-64 items-start bg-elevated/95 p-2 pt-3 ring-1 ring-default/60 backdrop-blur-md">
      <DashboardStudioActionsSidebar />
    </div>
    <DashboardStudioBottomPanel />
  </div>
</template>
