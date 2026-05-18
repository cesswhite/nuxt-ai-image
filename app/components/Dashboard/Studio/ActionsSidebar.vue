    <template>
      <div class="w-full relative h-full">
        <div class="flex w-full flex-col gap-2 px-4">
          <div class="flex gap-2">
            <UButton variant="solid" color="primary" class="flex-1 cursor-pointer" block size="lg"
              :loading="studio.loading" @click="generate">
              Generate
            </UButton>
          </div>
          <UButton variant="outline" color="neutral" size="lg" class="cursor-pointer" block
            :disabled="!studio.lastOutput" @click="clearOutput">
            Clear result
          </UButton>
        </div>
      </div>
    </template>

<script setup lang="ts">
const studio = useStudioStore()
const { generate } = useGenerateImage()

function clearOutput() {
  studio.setOutput('')
  studio.setError(null)
}
</script>
