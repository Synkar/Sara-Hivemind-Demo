<template>
  <div class="flex flex-col justify-center items-center container mx-auto px-4">
    <div class="flex flex-col gap-4 w-full mt-4">
      <div class="flex justify-between items-center">
        <div class="flex">
          <h1 class="text-lg text-left">
            {{ $t("pages.dashboard.subtitle") }}
          </h1>
          <UTooltip :text="$t('pages.dashboard.buttons.tour')">
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
        <div>
          <!--
          <UTooltip text="Refresh Landmarks" :shortcuts="['R']">
            <UButton
              @click="refreshLandmarks"
              icon="i-heroicons-arrow-path"
              size="xl"
              square
              variant="link"
              color="blue"
            />
          </UTooltip>
          -->
          <UTooltip
            :text="$t('pages.dashboard.buttons.clearLogs')"
            :shortcuts="['C']"
          >
            <UButton
              @click="clearLogs"
              icon="i-heroicons-minus-circle"
              size="xl"
              square
              variant="link"
              color="gray"
            />
          </UTooltip>
          <UTooltip
            :text="$t('pages.dashboard.buttons.openOperation')"
            :shortcuts="['G']"
          >
            <UButton
              id="operation-config"
              @click="toggleConfig"
              icon="i-heroicons-cog-6-tooth"
              size="xl"
              square
              variant="link"
              color="gray"
            />
          </UTooltip>
        </div>
      </div>
      <div class="flex items-start">
        <div class="flex flex-col whitespace-nowrap gap-2 w-40" id="pickups">
          <span class="w-40">{{ $t("pages.dashboard.pickup") }}</span>
          <!--<span v-if="pf && pf.length > 0">Floor: {{ j }}</span>-->
          <UTooltip
            v-for="(p, i) in pickups"
            :text="$t('pages.dashboard.select') + ' ' + p.name"
            :shortcuts="i != 9 ? [(i + 1).toString()] : ['0']"
            class="w-40"
          >
            <UButton
              truncate
              block
              @click="selectPickup(p.uuid)"
              :color="selectedPickup == p.uuid ? 'green' : 'indigo'"
              :label="p.name"
            >
              <template #trailing>
                <UBadge
                  color="white"
                  variant="solid"
                  :label="$t('pages.dashboard.floor') + ' ' + p.floor"
                ></UBadge>
              </template>
            </UButton>
          </UTooltip>
          <UPagination
            v-if="landmarksTotal > 10"
            v-model="pagePickup"
            :total="landmarksTotal"
            :max="5"
            size="xs"
            :ui="{
              wrapper: 'flex items-center gap-1',
              rounded: '!rounded-full min-w-[28px] justify-center',
              default: {
                activeButton: {
                  variant: 'outline',
                },
              },
            }"
            :prevButton="undefined"
            :nextButton="undefined"
          />
        </div>
        <div class="flex flex-col text-center w-full px-4 justify-center gap-2">
          <div>{{ $t("pages.dashboard.logs") }}</div>
          <UCard
            class="text-left"
            :ui="{ body: { padding: 'px-1 py-1 sm:p-1' } }"
            ><div
              id="logger"
              v-html="log"
              class="h-[455px] overflow-y-scroll p-1 m-1"
            ></div
          ></UCard>
        </div>
        <div class="flex flex-col whitespace-nowrap gap-2 w-40" id="deliveries">
          <span class="text-right w-40">{{
            $t("pages.dashboard.delivery")
          }}</span>
          <!--<span v-if="df && df.length > 0">Floor: {{ j }}</span>-->
          <UTooltip
            v-for="(d, i) in deliveries"
            :text="$t('pages.dashboard.select') + ' ' + d.name"
            :shortcuts="
              i != 9 ? [metaSymbol, (i + 1).toString()] : [metaSymbol, '0']
            "
            class="w-40"
          >
            <UButton
              truncate
              block
              :color="selectedDelivery == d.uuid ? 'green' : 'purple'"
              @click="selectDelivery(d.uuid)"
              :label="d.name"
            >
              <template #trailing>
                <UBadge
                  color="white"
                  variant="solid"
                  :label="$t('pages.dashboard.floor') + ' ' + d.floor"
                ></UBadge> </template
            ></UButton>
          </UTooltip>
          <UPagination
            v-if="landmarksTotal > 10"
            v-model="pageDelivery"
            :total="landmarksTotal"
            :max="5"
            size="xs"
            :ui="{
              wrapper: 'flex items-center gap-1',
              rounded: '!rounded-full min-w-[28px] justify-center',
              default: {
                activeButton: {
                  variant: 'outline',
                },
              },
            }"
            :prevButton="undefined"
            :nextButton="undefined"
          />
        </div>
      </div>
      <div class="flex" id="create-request">
        <UButton block color="gray" @click="createRequest" label="Send Request"
          ><template #trailing
            ><UKbd>{{ $t("pages.dashboard.space") }}</UKbd></template
          ></UButton
        >
      </div>
      <div
        v-show="loadingLandmarks"
        class="flex flex-col justify-center items-center"
      >
        <UProgress animation="carousel" class="mb-1" />
        {{ $t("pages.dashboard.landmark.loading") }}
      </div>
      <div
        v-show="sendingRequest"
        class="flex flex-col justify-center items-center"
      >
        <UProgress animation="carousel" class="mb-1" />
        {{ $t("pages.dashboard.operation.request") }}
      </div>
    </div>
    <UAccordion
      :items="tableAccordion"
      class="mt-4"
      :ui="{ item: { padding: 'pt-0 pb-0' }, default: { class: 'mb-0' } }"
    >
      <template #default="{ item, index, open }">
        <UButton
          color="gray"
          variant="solid"
          class="border-b border-gray-200 dark:border-gray-700"
          :ui="{ rounded: 'rounded-b-none', padding: { sm: 'p-3' } }"
        >
          <template #leading>
            <div
              class="w-6 h-6 rounded-full bg-primary-500 dark:bg-primary-400 flex items-center justify-center -my-1"
            >
              <UIcon
                :name="item.icon"
                class="w-4 h-4 text-white dark:text-gray-900"
              />
            </div>
          </template>

          <span class="truncate text-xl ml-2">{{ item.label }}</span>

          <template #trailing>
            <UIcon
              name="i-heroicons-chevron-right-20-solid"
              class="w-5 h-5 ms-auto transform transition-transform duration-200"
              :class="[open && 'rotate-90']"
            />
          </template>
        </UButton>
      </template>
      <template #requests>
        <Table :operation="selectedOperation"></Table>
      </template>
    </UAccordion>
    <UModal v-model="showConfig">
      <UCard
        :ui="{
          ring: '',
          divide: 'divide-y divide-gray-100 dark:divide-gray-800',
        }"
      >
        <template #header>
          <div class="flex justify-between items-center">
            <div>{{ $t("pages.dashboard.modal.config.title") }}</div>
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
        <UForm
          class="flex flex-col gap-4"
          :schema="configSchema"
          :state="configState"
          @submit="onSubmit"
        >
          <UDivider
            :label="$t('pages.dashboard.modal.config.form.operation.label')"
          />
          <UFormGroup
            :label="$t('pages.dashboard.modal.config.form.operation.label')"
            name="operation"
            id="operationSelect"
          >
            <USelectMenu
              :placeholder="
                $t('pages.dashboard.modal.config.form.operation.placeholder')
              "
              v-model="configState.operation"
              :options="operations"
              value-attribute="uuid"
              option-attribute="name"
            >
              <template #label>
                <span v-if="currentOperation">{{
                  currentOperation?.name
                }}</span>
                <span v-else>{{
                  $t("pages.dashboard.modal.config.form.operation.placeholder")
                }}</span>
              </template>
            </USelectMenu>
          </UFormGroup>
          <div id="pickup-window">
            <UDivider
              :label="
                $t('pages.dashboard.modal.config.form.pickupWindow.title')
              "
            />
            <UFormGroup
              :label="
                $t('pages.dashboard.modal.config.form.pickupWindow.upper.label')
              "
              name="pickup-window-upper"
            >
              <UInput
                :placeholder="
                  $t(
                    'pages.dashboard.modal.config.form.pickupWindow.upper.placeholder'
                  )
                "
                v-model="configState.pickup.window.upper"
              ></UInput>
            </UFormGroup>
            <UFormGroup
              :label="
                $t('pages.dashboard.modal.config.form.pickupWindow.lower.label')
              "
              name="pickup-window-lower"
            >
              <UInput
                :placeholder="
                  $t(
                    'pages.dashboard.modal.config.form.pickupWindow.lower.placeholder'
                  )
                "
                v-model="configState.pickup.window.lower"
              ></UInput>
            </UFormGroup>
          </div>
          <div id="delivery-window">
            <UDivider
              :label="
                $t('pages.dashboard.modal.config.form.deliveryWindow.title')
              "
            />
            <UFormGroup
              :label="
                $t(
                  'pages.dashboard.modal.config.form.deliveryWindow.upper.label'
                )
              "
              name="delivery-window-upper"
            >
              <UInput
                :placeholder="
                  $t(
                    'pages.dashboard.modal.config.form.deliveryWindow.upper.placeholder'
                  )
                "
                v-model="configState.delivery.window.upper"
              ></UInput>
            </UFormGroup>
            <UFormGroup
              :label="
                $t(
                  'pages.dashboard.modal.config.form.deliveryWindow.lower.label'
                )
              "
              name="delivery-window-lower"
            >
              <UInput
                :placeholder="
                  $t(
                    'pages.dashboard.modal.config.form.deliveryWindow.lower.placeholder'
                  )
                "
                v-model="configState.delivery.window.lower"
              ></UInput>
            </UFormGroup>
          </div>
          <div class="flex justify-end" id="save-operation">
            <UButton type="submit">{{
              $t("pages.dashboard.modal.config.form.submit")
            }}</UButton>
          </div>
        </UForm>
        <template #footer>
          <div
            v-show="savingConfig"
            class="flex flex-col justify-center items-center"
          >
            <UProgress animation="carousel" class="mb-1" />
            {{ $t("pages.dashboard.modal.config.form.saving") }}
          </div>
        </template>
      </UCard>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import type { FormSubmitEvent } from "#ui/types";
import type { OperationList, RequestBody } from "../models/Operation";
import type {
  DataUnion,
  LogActions,
  RequestAssignedData,
  RequestCancelledData,
  RequestFinishedData,
  RequestLockedData,
  RequestRunningData,
  RequestStageFinishedData,
  RequestStageStartedData,
} from "~/models/Logs";
import { z } from "zod";
import { Socket, io } from "socket.io-client";
import { useShepherd } from "vue-shepherd";
import { offset } from "@floating-ui/vue";
import imageRequest from "~/assets/images/request.png";
import imageUrl from "~/assets/images/url.png";

definePageMeta({
  middleware: ["auth"],
});

const $t = useI18n().t;

const auth = useAuth();
const hivemind = useHivemind();
const toast = useToast();
const robots = useRobots();
const pickups = computed(() => {
  if (
    hivemind.pickups &&
    hivemind.pickups.results &&
    hivemind.pickups.results.length > 0
  ) {
    return hivemind.pickups.results;
  } else {
    return [];
  }
});
const deliveries = computed(() => {
  if (
    hivemind.deliveries &&
    hivemind.deliveries.results &&
    hivemind.deliveries.results.length > 0
  ) {
    return hivemind.deliveries.results;
  } else {
    return [];
  }
});

const config = useRuntimeConfig();

const landmarksTotal = computed(() => {
  if (hivemind.pickups && hivemind.deliveries) {
    return hivemind.pickups.count;
  } else {
    return 0;
  }
});

const savingConfig = ref(false);
const loadingLandmarks = ref(false);
const sendingRequest = ref(false);

const { metaSymbol } = useShortcuts();

const configSchema = z.object({
  operation: z.string().optional(),
  pickup: z.object({
    window: z.object({
      upper: z.number(),
      lower: z.number(),
    }),
  }),
  delivery: z.object({
    window: z.object({
      upper: z.number(),
      lower: z.number(),
    }),
  }),
});

type ConfigSchema = z.output<typeof configSchema>;

const showConfig = ref(false);

const operations = ref<OperationList[]>([]);
const selectedOperation = ref<string>("");

const currentOperation = computed(() => {
  return operations.value.find((o) => o.uuid === configState.operation);
});

const selectedPickup = ref<string>();
const selectedDelivery = ref<string>();

async function selectPickup(uuid: string) {
  await (selectedPickup.value = uuid);
  if (tourDash.isActive() && tourDash.getCurrentStep().id === "pickups")
    tourDash.next();
}

async function selectDelivery(uuid: string) {
  await (selectedDelivery.value = uuid);
  if (tourDash.isActive() && tourDash.getCurrentStep().id === "deliveries")
    tourDash.next();
}

const toggleConfig = async () => {
  await (showConfig.value = !showConfig.value);

  if (tourDash.isActive() && tourDash.getCurrentStep().id === "config")
    tourDash.next();

  if (!selectedOperation.value && showConfig.value) {
    tourDash.show(1);
  }
};

const startTour = () => {
  tourDash.addStep({
    id: "config",
    attachTo: { element: "#operation-config", on: "top" },
    text: t("pages.dashboard.tour.operationConfig"),
    buttons: [
      {
        async action() {
          await (showConfig.value = true);
          tourDash.next();
          return;
        },
        classes: "shepherd-button-primary",
        text: t("pages.dashboard.tour.buttons.next"),
      },
    ],
    floatingUIOptions: {
      middleware: [offset(15)],
    },
  });
  tourDash.addStep({
    attachTo: { element: "#operationSelect", on: "top" },
    text: t("pages.dashboard.tour.operationSelect"),
    floatingUIOptions: {
      middleware: [offset(15)],
    },
    buttons: [
      {
        async action() {
          await (showConfig.value = false);
          tourDash.back();
          return;
        },
        classes: "shepherd-button-secondary",
        text: t("pages.dashboard.tour.buttons.back"),
      },
      {
        action: tourDash.next,
        classes: "shepherd-button-primary",
        text: t("pages.dashboard.tour.buttons.next"),
      },
    ],
  });
  tourDash.addStep({
    attachTo: { element: "#pickup-window", on: "top" },
    text: t("pages.dashboard.tour.pickupWindow"),
    floatingUIOptions: {
      middleware: [offset(15)],
    },
    buttons: [
      {
        action: tourDash.back,
        classes: "shepherd-button-secondary",
        text: t("pages.dashboard.tour.buttons.back"),
      },
      {
        action: tourDash.next,
        classes: "shepherd-button-primary",
        text: t("pages.dashboard.tour.buttons.next"),
      },
    ],
  });
  tourDash.addStep({
    attachTo: { element: "#delivery-window", on: "top" },
    text: t("pages.dashboard.tour.deliveryWindow"),
    floatingUIOptions: {
      middleware: [offset(15)],
    },
    buttons: [
      {
        action: tourDash.back,
        classes: "shepherd-button-secondary",
        text: t("pages.dashboard.tour.buttons.back"),
      },
      {
        action: tourDash.next,
        classes: "shepherd-button-primary",
        text: t("pages.dashboard.tour.buttons.next"),
      },
    ],
  });
  tourDash.addStep({
    attachTo: { element: "#save-operation", on: "right" },
    text: t("pages.dashboard.tour.saveConfig"),
    floatingUIOptions: {
      middleware: [offset(15)],
    },
    buttons: [
      {
        action: tourDash.back,
        classes: "shepherd-button-secondary",
        text: t("pages.dashboard.tour.buttons.back"),
      },
    ],
  });
  tourDash.addStep({
    id: "pickups",
    attachTo: { element: "#pickups", on: "top" },
    text: t("pages.dashboard.tour.pickupLandmark"),
    buttons: [
      {
        action: tourDash.back,
        classes: "shepherd-button-secondary",
        text: t("pages.dashboard.tour.buttons.back"),
      },
      {
        action: tourDash.next,
        classes: "shepherd-button-primary",
        text: t("pages.dashboard.tour.buttons.next"),
      },
    ],
  });
  tourDash.addStep({
    id: "deliveries",
    attachTo: { element: "#deliveries", on: "top" },
    text: t("pages.dashboard.tour.deliveryLandmark"),
    buttons: [
      {
        action: tourDash.back,
        classes: "shepherd-button-secondary",
        text: t("pages.dashboard.tour.buttons.back"),
      },
      {
        action: tourDash.next,
        classes: "shepherd-button-primary",
        text: t("pages.dashboard.tour.buttons.next"),
      },
    ],
  });
  tourDash.addStep({
    id: "request",
    attachTo: { element: "#create-request", on: "top" },
    text: t("pages.dashboard.tour.sendRequest"),
    floatingUIOptions: {
      middleware: [offset(15)],
    },
    buttons: [
      {
        action: tourDash.back,
        classes: "shepherd-button-secondary",
        text: t("pages.dashboard.tour.buttons.back"),
      },
      {
        action: tourDash.complete,
        classes: "shepherd-button-primary",
        text: t("pages.dashboard.tour.buttons.finish"),
      },
    ],
  });
  tourDash.start();
};

const configState = reactive<ConfigSchema>({
  operation: undefined,
  pickup: {
    window: {
      upper: 9999,
      lower: 0,
    },
  },
  delivery: {
    window: {
      upper: 9999,
      lower: 0,
    },
  },
});

const pagePickup = ref(1);
const pageDelivery = ref(1);

async function onSubmit(event: FormSubmitEvent<ConfigSchema>) {
  savingConfig.value = true;
  if (event.data.operation && event.data.operation != selectedOperation.value) {
    selectedOperation.value = event.data.operation;
    hivemind.setOperationSelected(selectedOperation.value);
    await hivemind.retrieveOperation(selectedOperation.value);
    if (hivemind.operation && hivemind.operation.locality) {
      await refreshPickups();
      await refreshDeliveries();
    }
    if (socket.value) {
      socket.value.close();
      socket.value = undefined;
      connectSocket();
    }
  }
  savingConfig.value = false;
  showConfig.value = false;
  if (selectedOperation.value) {
    await tourDash.next();
    await tourDash.show("pickups");
  }
}

async function createRequest() {
  const externalId = hivemind.getExternalId();
  if (selectedPickup.value && selectedDelivery.value) {
    sendingRequest.value = true;
    const requestBody: RequestBody = {
      operation: configState.operation || hivemind.getOperationSelected(),
      pickup: {
        windowTime: [
          configState.pickup.window.lower,
          configState.pickup.window.upper,
        ],
        landmark: selectedPickup.value,
      },
      delivery: {
        windowTime: [
          configState.delivery.window.lower,
          configState.delivery.window.upper,
        ],
        landmark: selectedDelivery.value,
      },
      externalId: externalId.toString(),
    };
    await hivemind.createRequest(requestBody);
    sendingRequest.value = false;
    selectedDelivery.value = undefined;
    selectedPickup.value = undefined;
    hivemind.incrementExternalId();
  } else {
    toast.add({
      icon: "i-heroicons-exclamation-circle",
      title: $t("pages.dashboard.errors.selectBoth"),
      color: "red",
    });
  }
}

const refreshAll = async () => {
  if (auth.logged) {
    if (!auth.hasCredentials) {
      await auth.getCredentials();
    }
    if (auth.hasCredentials) {
      await hivemind.listOperations();
      selectedOperation.value = hivemind.getOperationSelected();
      if (hivemind.operations) {
        operations.value = hivemind.operations;
        const index = operations.value.findIndex(
          (o) => o.uuid === selectedOperation.value
        );
        if (index < 0) {
          selectedOperation.value = "";
          hivemind.pickups = undefined;
          hivemind.deliveries = undefined;
          if (socket.value) {
            socket.value.close();
            socket.value = undefined;
            clearLogs();
          }
        }
      }
      if (selectedOperation.value) {
        loadingLandmarks.value = true;
        configState.operation = selectedOperation.value;
        await hivemind.retrieveOperation(selectedOperation.value);
        if (hivemind.operation && hivemind.operation.locality) {
          await refreshPickups();
          await refreshDeliveries();
        }
        loadingLandmarks.value = false;
        if (!socket.value) {
          connectSocket();
        }
      } else {
        toast.add({
          icon: "i-heroicons-exclamation-circle",
          title: $t("pages.dashboard.errors.noOperation"),
          color: "yellow",
        });
        startTour();
      }
    } else {
      toast.add({
        icon: "i-heroicons-exclamation-circle",
        title: $t("pages.dashboard.errors.noCredentials"),
        color: "red",
      });
    }
  }
};

const connectSocket = () => {
  console.log(
    `Will connect to socket ${config.public.WS_HOST_PORT} ${config.public.WS_PATH}`
  );
  socket.value = io(`${config.public.WS_HOST_PORT}`, {
    path: `${config.public.WS_PATH}`,
    query: {
      room: selectedOperation.value,
    },
    transports: ["websocket"],
  });

  socket.value.on("connect", () => {
    log.value += `<p>[${$t("pages.dashboard.feedbacks.request.log")}]: ${$t(
      "pages.dashboard.feedbacks.logsConnecting"
    )}: ${hivemind.operation?.name}</p>`;
  });

  socket.value.on("message", async (socketMsg: SocketIO) => {
    messages.value.push(socketMsg);
    log.value += `<p>${await generateMessage(socketMsg)}</p>`;
    nextTick(() => {
      if (
        socketMsg.action == "REQUEST_LOCKED" &&
        typeof socketMsg.data != "string"
      ) {
        const data = socketMsg.data.data as RequestLockedData;
        const b = document.getElementById(`${data.requestId}`);
        if (b) {
          const operation = selectedOperation.value;
          const request = data.requestId;
          b.addEventListener("click", async function () {
            await unlockContainer(operation, request);
          });
        }
      }
      const logger = document.getElementById("logger");
      if (logger) logger.scrollTop = logger.scrollHeight;
    });
  });
};
const refreshPickups = async () => {
  if (hivemind.operation && hivemind.operation.locality) {
    await hivemind.listPickups(
      hivemind.operation.locality,
      10,
      pagePickup.value,
      "name"
    );
  }
};
const refreshDeliveries = async () => {
  if (hivemind.operation && hivemind.operation.locality) {
    await hivemind.listDeliveries(
      hivemind.operation.locality,
      10,
      pageDelivery.value,
      "name"
    );
  }
};

const setPickup = (index: number) => {
  if (pickups.value && pickups.value[index]) {
    selectedPickup.value = pickups.value[index].uuid;
  }
};

const setDelivery = (index: number) => {
  if (deliveries.value && deliveries.value[index]) {
    selectedDelivery.value = deliveries.value[index].uuid;
  }
};

defineShortcuts({
  r: {
    usingInput: false,
    handler: async () => {
      await refreshPickups();
      await refreshDeliveries();
    },
  },
  g: {
    usingInput: false,
    handler: () => {
      showConfig.value = !showConfig.value;
    },
  },
  0: {
    usingInput: false,
    handler: () => {
      setPickup(9);
    },
  },
  1: {
    usingInput: false,
    handler: () => {
      setPickup(0);
    },
  },
  2: {
    usingInput: false,
    handler: () => {
      setPickup(1);
    },
  },
  3: {
    usingInput: false,
    handler: () => {
      setPickup(2);
    },
  },
  4: {
    usingInput: false,
    handler: () => {
      setPickup(3);
    },
  },
  5: {
    usingInput: false,
    handler: () => {
      setPickup(4);
    },
  },
  6: {
    usingInput: false,
    handler: () => {
      setPickup(5);
    },
  },
  7: {
    usingInput: false,
    handler: () => {
      setPickup(6);
    },
  },
  8: {
    usingInput: false,
    handler: () => {
      setPickup(7);
    },
  },
  9: {
    usingInput: false,
    handler: () => {
      setPickup(8);
    },
  },
  meta_0: {
    usingInput: false,
    handler: () => {
      setDelivery(9);
    },
  },
  meta_1: {
    usingInput: false,
    handler: () => {
      setDelivery(0);
    },
  },
  meta_2: {
    usingInput: false,
    handler: () => {
      setDelivery(1);
    },
  },
  meta_3: {
    usingInput: false,
    handler: () => {
      setDelivery(2);
    },
  },
  meta_4: {
    usingInput: false,
    handler: () => {
      setDelivery(3);
    },
  },
  meta_5: {
    usingInput: false,
    handler: () => {
      setDelivery(4);
    },
  },
  meta_6: {
    usingInput: false,
    handler: () => {
      setDelivery(5);
    },
  },
  meta_7: {
    usingInput: false,
    handler: () => {
      setDelivery(6);
    },
  },
  meta_8: {
    usingInput: false,
    handler: () => {
      setDelivery(7);
    },
  },
  meta_9: {
    usingInput: false,
    handler: () => {
      setDelivery(8);
    },
  },
  " ": {
    usingInput: false,
    handler: async () => {
      await createRequest();
    },
  },
});

type SocketIO = {
  action: LogActions;
  data:
    | {
        robotId: string;
        localitySlug: string;
        data?: DataUnion;
      }
    | string;
  issuer: string;
  service: "hivemind";
};

const clearLogs = async () => {
  log.value = "";
};

const unlockContainer = async (operation: string, requestUuid: string) => {
  const request = await hivemind.continueRequest(operation, requestUuid);
  if (request) {
    toast.add({
      title: $t("pages.dashboard.feedbacks.unlocked"),
      icon: "i-heroicons-check-circle",
      color: "green",
    });
  } else {
    toast.add({
      title: $t("errors.unknown"),
      icon: "i-heroicons-exclamation-circle",
      color: "red",
    });
  }
};

const generateMessage = async (message: SocketIO) => {
  if (typeof message.data != "string") {
    const robotName = await robots.getRobotName(message.data.robotId);
    switch (message.action) {
      case "REQUEST_ASSIGNED": {
        const data = message.data.data as RequestAssignedData;
        return `[${robotName}]: ${$t(
          "pages.dashboard.feedbacks.request.title"
        )} #${data.externalRequestId} ${$t(
          "pages.dashboard.feedbacks.request.assigned"
        )}`;
      }
      case "REQUEST_RUNNING": {
        const data = message.data.data as RequestRunningData;
        return `[${robotName}]: ${$t(
          "pages.dashboard.feedbacks.request.title"
        )} #${data.externalRequestId} ${$t(
          "pages.dashboard.feedbacks.request.running"
        )}`;
      }
      case "REQUEST_STAGE_STARTED": {
        const data = message.data.data as RequestStageStartedData;
        return `[${robotName}]: (${data.nodeType}) ${$t(
          "pages.dashboard.feedbacks.request.title"
        )} #${data.externalRequestId} ${$t(
          "pages.dashboard.feedbacks.request.startedStage"
        )} ${data.requestStage}`;
      }
      case "REQUEST_STAGE_FINISHED": {
        const data = message.data.data as RequestStageFinishedData;
        return `[${robotName}]: (${data.nodeType}) ${$t(
          "pages.dashboard.feedbacks.request.title"
        )} #${data.externalRequestId} ${$t(
          "pages.dashboard.feedbacks.request.finishedStage"
        )} ${data.requestStage}`;
      }
      case "REQUEST_LOCKED": {
        const data = message.data.data as RequestLockedData;
        const text = `[${robotName}]: ${$t(
          "pages.dashboard.feedbacks.request.title"
        )} #${data.externalRequestId} ${$t(
          "pages.dashboard.feedbacks.request.locked"
        )} <button title="${$t(
          "pages.dashboard.feedbacks.request.unlock"
        )}" id="${
          data.requestId
        }" type="button" class="unlock-container-button focus:outline-none focus-visible:outline-0 disabled:cursor-not-allowed disabled:opacity-75 flex-shrink-0 font-medium rounded-md text-base gap-x-2.5 p-2.5 text-blue-500 hover:text-blue-600 disabled:text-blue-500 dark:text-blue-400 dark:hover:text-blue-500 dark:disabled:text-blue-400 underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400 inline-flex items-center"><span class="i-heroicons-lock-open flex-shrink-0 h-6 w-6" aria-hidden="true"></span></button>`;
        return text;
      }
      case "REQUEST_CANCELLED": {
        const data = message.data.data as RequestCancelledData;
        return `[${robotName}]: ${$t(
          "pages.dashboard.feedbacks.request.title"
        )} #${data.externalRequestId} ${$t(
          "pages.dashboard.feedbacks.request.cancelled"
        )} ${data.cancelledReason}`;
      }
      case "REQUEST_FINISHED": {
        const data = message.data.data as RequestFinishedData;
        return `[${robotName}]: ${$t(
          "pages.dashboard.feedbacks.request.title"
        )} #${data.externalRequestId} ${$t(
          "pages.dashboard.feedbacks.request.finished"
        )}`;
      }
      case "ROBOT_WAKEUP": {
        return `[${robotName}]: ${$t(
          "pages.dashboard.feedbacks.request.wakeup"
        )}`;
      }
      case "ROBOT_SHUTDOWN": {
        return `[${robotName}]: ${$t(
          "pages.dashboard.feedbacks.request.shutdown"
        )}`;
      }
      default:
        return `[${$t(
          "pages.dashboard.feedbacks.request.unknown"
        )}]: ${JSON.stringify(message.data)}`;
    }
  } else {
    return `[${$t("pages.dashboard.feedbacks.request.log")}]: ${message.data}`;
  }
};

const log = ref<string>("");

const messages = ref<SocketIO[]>([]);

const socket = ref<Socket>();

const { t } = useI18n();

const tourDash = useShepherd({
  defaultStepOptions: {
    cancelIcon: {
      enabled: true,
    },
  },
});
onMounted(async () => {
  await refreshAll();
  //tourDash.start();
});

onUnmounted(() => {
  if (socket.value) socket.value.close();
});

const tableAccordion = [
  {
    label: $t("pages.dashboard.requests"),
    icon: "i-heroicons-arrows-right-left",
    slot: "requests",
  },
];

watch(
  auth,
  async (oldValue, newValue) => {
    if (newValue.hasCredentials && newValue.appSelected) {
      await refreshAll();
    }
  },
  { deep: true }
);
watch(pagePickup, (oldValue, newValue) => {
  refreshPickups();
});
watch(pageDelivery, (oldValue, newValue) => {
  refreshDeliveries();
});
watch(showConfig, (newValue) => {
  if (newValue === false) {
    tourDash.complete();
  }
});
</script>
