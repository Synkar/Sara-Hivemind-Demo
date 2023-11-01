<template>
  <div class="flex justify-center items-center container mx-auto px-4">
    <div class="flex flex-col gap-4 w-full mt-4">
      <div class="flex justify-between items-center">
        <h1 class="text-lg text-left">Pickup and Delivery DEMO</h1>
        <div>
          <UButton
            @click="toggleConfig"
            icon="i-heroicons-cog-6-tooth"
            size="xl"
            square
            variant="link"
            color="gray"
          />
        </div>
      </div>
      <div class="flex">
        <div class="flex flex-col whitespace-nowrap gap-2">
          <UButton>Pickup 01</UButton>
          <UButton>Pickup 02</UButton>
          <UButton>Pickup 03</UButton>
          <UButton>Pickup 04</UButton>
          <UButton>Pickup 05</UButton>
        </div>
        <div class="flex text-left w-full px-4">logs</div>
        <div class="flex flex-col whitespace-nowrap gap-2">
          <UButton color="purple">Delivery 01</UButton>
          <UButton color="purple">Delivery 02</UButton>
          <UButton color="purple">Delivery 03</UButton>
          <UButton color="purple">Delivery 04</UButton>
          <UButton color="purple">Delivery 05</UButton>
        </div>
      </div>
      <div class="flex">
        <UButton block color="gray">Enviar</UButton>
      </div>
    </div>
    <UModal v-model="showConfig">
      <UCard
        :ui="{
          ring: '',
          divide: 'divide-y divide-gray-100 dark:divide-gray-800',
        }"
      >
        <template #header>
          <div class="flex justify-between items-center">
            <div>Hivemind Configuration</div>
            <UButton
              @click="toggleConfig"
              icon="i-heroicons-x-mark"
              size="sm"
              square
              variant="link"
              color="red"
            />
          </div>
        </template>
        <UForm class="flex flex-col gap-4">
          <UDivider label="Operation" />
          <UFormGroup label="Operation" name="operation">
            <USelectMenu
              placeholder="Choose the Operation"
              v-model="state.operation"
              :options="operations"
              value-attribute="uuid"
              option-attribute="name"
            >
              <template #label>
                <span v-if="currentOperation">{{
                  currentOperation?.name
                }}</span>
                <span v-else>Choose the Operation</span>
              </template>
            </USelectMenu>
          </UFormGroup>
          <UDivider label="Window Configuration" />
          <UFormGroup label="Window Upper" name="window-upper">
            <UInput
              placeholder="Window Upper Time"
              v-model="state.window.upper"
            ></UInput>
          </UFormGroup>
          <UFormGroup label="Window Upper" name="window-upper">
            <UInput
              placeholder="Window Upper Time"
              v-model="state.window.lower"
            ></UInput>
          </UFormGroup>
        </UForm>
        <template #footer>
          <div class="flex justify-end"></div>
        </template>
      </UCard>
    </UModal>
  </div>
</template>

<script setup lang="ts">
const pickups = ref([]);
const deliveries = ref([]);
const showConfig = ref(false);

const operations = ref([
  {
    uuid: "1",
    name: "Operation Test",
  },
]);

const currentOperation = computed(() => {
  return operations.value.find((o) => o.uuid === state.operation);
});

const toggleConfig = () => {
  showConfig.value = !showConfig.value;
};

const state = reactive({
  operation: undefined,
  window: {
    upper: 9999,
    lower: 0,
  },
});
</script>
