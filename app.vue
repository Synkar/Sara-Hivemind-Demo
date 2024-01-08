<template>
  <div>
    <UCard class="w-full" :ui="{ rounded: 'rounded-none' }">
      <div class="flex justify-between items-center">
        <div>
          <font-awesome-icon icon="fa-solid fa-brain" class="text-4xl" />
        </div>
        <div>
          <UTooltip
            v-if="auth.logged"
            :text="$t('pages.app.tooltips.userConfig')"
            :shortcuts="['U']"
          >
            <UButton
              id="user-config"
              @click="toggleUserConfig"
              icon="i-heroicons-user"
              size="xl"
              square
              variant="link"
              color="gray"
            />
          </UTooltip>
          <UTooltip
            :text="$t('pages.app.tooltips.toogleColorMode')"
            :shortcuts="[metaSymbol, 'K']"
          >
            <ColorMode></ColorMode>
          </UTooltip>
          <UTooltip
            v-if="auth.logged"
            :text="$t('pages.app.tooltips.logout')"
            :shortcuts="[metaSymbol, 'L']"
          >
            <UButton
              @click="logoutUser"
              icon="i-heroicons-arrow-left-on-rectangle"
              size="xl"
              square
              variant="link"
              color="gray"
            />
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
            <div class="flex items-center">
              <div>{{ $t("pages.app.modal.title") }}</div>
              <UTooltip :text="$t('pages.app.modal.tour')">
                <UButton
                  id="tour"
                  @click="startTour"
                  icon="i-heroicons-information-circle"
                  size="sm"
                  square
                  variant="link"
                  color="gray"
                />
              </UTooltip>
            </div>
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
          <UForm
            :schema="userKeySchema"
            :state="keyState"
            @submit="onSubmit"
            id="user-app"
          >
            <div class="flex items-end justify-between">
              <UFormGroup
                :label="$t('pages.app.modal.form.appId.label')"
                name="appId"
              >
                <UInput
                  :placeholder="$t('pages.app.modal.form.appId.placeholder')"
                  v-model="keyState.appId"
                />
              </UFormGroup>
              <UFormGroup
                :label="$t('pages.app.modal.form.appSecret.label')"
                name="appSecret"
              >
                <UInput
                  :placeholder="
                    $t('pages.app.modal.form.appSecret.placeholder')
                  "
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
            <h1>{{ $t("pages.app.modal.yourApps") }}:</h1>
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
          <div class="flex flex-col items-end gap-2" id="save">
            <UFormGroup
              :label="$t('pages.app.modal.selectedApp')"
              name="selectedKey"
              class="w-full"
            >
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
            <UButton @click="setSelectedKey">{{
              $t("pages.app.modal.submit")
            }}</UButton>
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
import { useShepherd } from "vue-shepherd";
import { offset } from "@floating-ui/vue";

const auth = useAuth();
const toast = useToast();
const router = useRouter();

const $t = useI18n().t;

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
  if (tour.isActive()) tour.next();
}

const startTour = () => {
  tour.addStep({
    attachTo: { element: "#user-config", on: "bottom" },
    id: "user-config",
    text: t("pages.userConfig.tour.config"),
    floatingUIOptions: {
      middleware: [offset(15)],
    },
    buttons: [
      {
        async action() {
          await (showUserConfig.value = true);
          tour.next();
          return;
        },
        classes: "shepherd-button-primary",
        text: "Next",
      },
    ],
  });
  tour.addStep({
    attachTo: { element: "#user-app", on: "top" },
    id: "user-app",
    text: t("pages.userConfig.tour.appCredentials"),
    floatingUIOptions: {
      middleware: [offset(15)],
    },
    buttons: [
      {
        action: tour.next,
        classes: "shepherd-button-primary",
        text: "Next",
      },
    ],
  });
  tour.addStep({
    floatingUIOptions: {
      middleware: [offset(15)],
    },
    attachTo: { element: "#save", on: "top" },
    text: t("pages.userConfig.tour.saveApp"),
    buttons: [
      {
        action: tour.back,
        classes: "shepherd-button-secondary",
        text: "Back",
      },
      {
        action: tour.complete,
        classes: "shepherd-button-primary",
        text: "Finish",
      },
    ],
  });
  if (!showUserConfig.value) tour.start();
  else tour.show("user-app");
};

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
  tour.complete();
}

const toggleUserConfig = async () => {
  await (showUserConfig.value = !showUserConfig.value);

  if (auth.apps && auth.apps.length <= 0) {
    tour.start();
  }
  if (
    tour.isActive() &&
    tour.getCurrentStep().id === "user-config" &&
    showUserConfig.value
  ) {
    tour.next();
  }
};

const deleteKey = async (appId: string) => {
  const deleted = await auth.deleteApp(appId);
  if (deleted) {
    toast.add({
      title: $t("pages.app.modal.feedbacks.deleted"),
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

const { metaSymbol } = useShortcuts();

defineShortcuts({
  u: {
    usingInput: false,
    handler: () => {
      toggleUserConfig();
    },
  },
  meta_l: {
    usingInput: false,
    handler: () => {
      logoutUser();
    },
  },
});

const logoutUser = async () => {
  const res = await $fetch("/api/logout", {
    method: "POST",
  });
  if (res) {
    toast.add({
      title: $t("pages.app.modal.feedbacks.logout"),
      icon: "i-heroicons-check-circle",
      color: "green",
    });
    auth.logout();
    router.push("/");
  }
};

const { t } = useI18n();

const tour = useShepherd({
  defaultStepOptions: {
    cancelIcon: {
      enabled: true,
    },
  },
});
onMounted(async () => {
  if (auth.logged) {
    await auth.listApps();
    if (auth.apps && auth.apps.length > 0) {
      keys.value = auth.apps as unknown as Credentials[];
      await auth.getSelectedApp();
      keySelected.value = auth.appSelected;
    } else {
      toast.add({
        icon: "i-heroicons-exclamation-circle",
        title: t("pages.app.modal.feedbacks.noApps"),
        color: "yellow",
      });
      startTour();
    }
  }
});

watch(
  auth,
  async (newValue, oldValue) => {
    if (!oldValue.logged && newValue.logged) {
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
watch(showUserConfig, (newValue) => {
  if (newValue === false) {
    tour.complete();
  }
});
</script>
