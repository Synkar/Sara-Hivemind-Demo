<template>
  <div>
    <UCard class="w-full">
      <div class="flex justify-between items-center">
        <div>
          <font-awesome-icon icon="fa-solid fa-brain" class="text-4xl" />
        </div>
        <div>
          <UButton
            @click="toggleUserConfig"
            icon="i-heroicons-user"
            size="xl"
            square
            variant="link"
            color="gray"
          />
          <ColorMode></ColorMode>
        </div>
      </div>
    </UCard>
    <UContainer>
      <NuxtPage></NuxtPage>
    </UContainer>
    <UNotifications />
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
const toast = useToast();

type Keys = {
  appId: string;
  showSecret?: boolean;
}[];

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

const keySelected = ref(keys.value[0].appId);

const secretMap = ref<Map<string, string>>(
  new Map([
    ["test", "123456"],
    ["test2", "123456"],
  ])
);

const userState = reactive({
  appId: undefined,
  appSecret: undefined,
});

const toggleUserConfig = () => {
  showUserConfig.value = !showUserConfig.value;
};

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
