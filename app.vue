<template>
  <div>
    <UCard class="w-full" :ui="{ rounded: 'rounded-none' }">
      <div class="flex justify-between items-center">
        <div>
          <font-awesome-icon icon="fa-solid fa-brain" class="text-4xl" />
        </div>
        <div>
          <UTooltip text="Open User Configuration" :shortcuts="['U']">
            <UButton
              @click="toggleUserConfig"
              icon="i-heroicons-user"
              size="xl"
              square
              variant="link"
              color="gray"
              v-if="auth.logged"
            />
          </UTooltip>
          <UTooltip text="Toggle Color Mode" :shortcuts="['ctrl', 'k']">
            <ColorMode></ColorMode>
          </UTooltip>
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
          <UForm :schema="userKeySchema" :state="keyState" @submit="onSubmit">
            <div class="flex items-end justify-between">
              <UFormGroup label="App Id" name="appId">
                <UInput
                  placeholder="Type your App Id"
                  v-model="keyState.appId"
                />
              </UFormGroup>
              <UFormGroup label="App Secret" name="appSecret">
                <UInput
                  placeholder="Type your App Secret"
                  v-model="keyState.appSecret"
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
              <div v-for="(k, i) in keys">
                <div class="flex justify-between items-center w-full">
                  <div>{{ k.appId }}</div>
                  <div @click="deleteKey(k.appId)">
                    <UButton
                      icon="i-heroicons-trash"
                      square
                      size="sm"
                      variant="link"
                      color="red"
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
            <UButton @click="setSelectedKey">Save</UButton>
          </div>
        </template>
      </UCard>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { z } from "zod";
import type { FormSubmitEvent } from "@nuxt/ui/dist/runtime/types";
import type { Credentials } from "@prisma/client";

const auth = useAuth();
const toast = useToast();

const showUserConfig = ref(false);
let keys = ref<Credentials[]>([]);

const keySelected = ref<string>();

const userKeySchema = z.object({
  appId: z.string(),
  appSecret: z.string(),
});

type UserKeySchema = z.output<typeof userKeySchema>;

const keyState = reactive({
  appId: undefined,
  appSecret: undefined,
});

async function onSubmit(event: FormSubmitEvent<UserKeySchema>) {
  const body = event.data as UserKeySchema;

  await auth.createApp(body);
  keyState.appId = undefined;
  keyState.appSecret = undefined;

  await auth.listApps();
  keys.value = auth.apps as unknown as Credentials[];
  await auth.getSelectedApp();
  keySelected.value = auth.appSelected;
}

async function setSelectedKey() {
  if (keySelected && keySelected.value) {
    try {
      const selectedKey = await auth.getSelectedApp();
      if (selectedKey.appId != keySelected.value)
        await auth.setSelectedApp(keySelected.value);
    } catch (e) {
      await auth.setSelectedApp(keySelected.value);
    }
  }
  showUserConfig.value = false;
}

const toggleUserConfig = () => {
  showUserConfig.value = !showUserConfig.value;
};

const deleteKey = async (appId: string) => {
  const deleted = await auth.deleteApp(appId);
  if (deleted) {
    toast.add({
      title: "Key Deleted Successfully!",
      icon: "i-heroicons-check-circle",
      color: "green",
    });

    try {
      await auth.listApps();
      keys.value = auth.apps as unknown as Credentials[];
      await auth.getSelectedApp();
      keySelected.value = auth.appSelected;
    } catch (e) {
      keySelected.value = undefined;
    }
  }
};

defineShortcuts({
  u: {
    usingInput: false,
    handler: () => {
      toggleUserConfig();
    },
  },
});

onMounted(async () => {
  if (auth.logged) {
    console.log("mounted");
    await auth.listApps();
    if (auth.apps && auth.apps.length > 0) {
      keys.value = auth.apps as unknown as Credentials[];
      await auth.getSelectedApp();
      keySelected.value = auth.appSelected;
    } else {
      toast.add({
        icon: "i-heroicons-exclamation-circle",
        title:
          "You don't have any App Credentials Registered, click on user icon to set one",
        color: "yellow",
      });
    }
  }
});

watch(
  auth,
  async (newValue, oldValue) => {
    if (!oldValue.logged && newValue.logged) {
      console.log("watch");
      await auth.listApps();
      keys.value = auth.apps as unknown as Credentials[];
      await auth.getSelectedApp();
      keySelected.value = auth.appSelected;
    }
  },
  {
    deep: true,
  }
);
</script>
./stores/auth
