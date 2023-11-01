<template>
  <div class="flex justify-center items-center container mx-auto px-4">
    <div class="flex flex-col gap-4 w-full mt-4">
      <div class="flex justify-between items-center">
        <h1 class="text-lg text-left">Pickup and Delivery DEMO</h1>
        <div>
          <UButton
            @click="toggleUserConfig"
            icon="i-heroicons-user"
            size="xl"
            square
            variant="link"
            color="gray"
          />
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
    <UModal v-model="showUserConfig">
      <UCard
        :ui="{
          ring: '',
          divide: 'divide-y divide-gray-100 dark:divide-gray-800',
        }"
      >
        <template #header>
          <div class="flex justify-between items-center">
            <div>User Configuration</div>
            <UButton
              @click="toggleUserConfig"
              icon="i-heroicons-x-mark"
              size="sm"
              square
              variant="link"
              color="red"
            />
          </div>
        </template>
        <div class="flex flex-col gap-4">
          <UForm>
            <div class="flex items-end justify-between">
              <UFormGroup label="App Id" name="appId">
                <UInput
                  placeholder="Type your App Id"
                  v-model="userState.appId"
                />
              </UFormGroup>
              <UFormGroup label="App Secret" name="appSecret">
                <UInput
                  placeholder="Type your App Secret"
                  v-model="userState.appSecret"
                />
              </UFormGroup>
              <UButton
                type="submit"
                icon="i-heroicons-plus"
                square
                size="sm"
              ></UButton>
            </div>
          </UForm>
          <div class="flex flex-col gap-4">
            <h1>Your Apps:</h1>
            <div class="flex flex-col">
              <div v-for="k in keys">
                <div class="flex justify-between items-center w-full">
                  <div>{{ k.appId }}</div>
                  <div @click="copySecret(k.appId)" v-if="k.showSecret">
                    <span>{{ secretMap.get(k.appId) }}</span>
                    <UButton
                      icon="i-heroicons-clipboard"
                      square
                      size="sm"
                      variant="link"
                    />
                  </div>
                  <div @click="revealSecret(k.appId)" v-else>
                    <span class="text-primary">***********</span>
                    <UButton
                      icon="i-heroicons-eye"
                      square
                      size="sm"
                      variant="link"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <template #footer>
          <div class="flex flex-col items-end gap-2">
            <UFormGroup label="Selected Key" name="selectedKey" class="w-full">
              <USelectMenu
                v-model="keySelected"
                :options="keys"
                value-attribute="appId"
                option-attribute="appId"
              >
                <template #label>
                  <div class="flex justify-between items-center w-full">
                    <div>{{ keySelected }}</div>
                  </div>
                </template>
              </USelectMenu>
            </UFormGroup>
            <UButton>Save</UButton>
          </div>
        </template>
      </UCard>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import type { UButton, UFormGroup } from "#ui-colors/components";
import { ref } from "vue";
const toast = useToast();

type Keys = {
  appId: string;
  showSecret?: boolean;
}[];

const pickups = ref([]);
const deliveries = ref([]);
const showConfig = ref(false);
const showUserConfig = ref(false);
const keys = ref<Keys>([
  {
    appId: "test",
    showSecret: false,
  },
  {
    appId: "test2",
    showSecret: false,
  },
]);
const operations = ref([
  {
    uuid: "1",
    name: "Operation Test",
  },
]);
const keySelected = ref(keys.value[0].appId);
const currentOperation = computed(() => {
  return operations.value.find((o) => o.uuid === state.operation);
});

const secretMap = ref<Map<string, string>>(
  new Map([
    ["test", "123456"],
    ["test2", "123456"],
  ])
);

const toggleConfig = () => {
  showConfig.value = !showConfig.value;
};

const toggleUserConfig = () => {
  showUserConfig.value = !showUserConfig.value;
};

const state = reactive({
  operation: undefined,
  window: {
    upper: 9999,
    lower: 0,
  },
});

const userState = reactive({
  appId: undefined,
  appSecret: undefined,
});

const revealSecret = (appId: string) => {
  const key = keys.value.find((k) => k.appId === appId);
  if (key) {
    key.showSecret = !key.showSecret;
  }
};

const copySecret = (appId: string) => {
  const key = keys.value.find((k) => k.appId === appId);
  if (key) {
    navigator.clipboard.writeText(secretMap.value.get(appId) || "");
    toast.add({
      title: "Copied to clipboard",
      icon: "i-heroicons-check-circle",
    });
  }
};
</script>
