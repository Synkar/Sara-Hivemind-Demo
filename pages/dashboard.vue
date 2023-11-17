<template>
  <div class="flex flex-col justify-center items-center container mx-auto px-4">
    <div class="flex flex-col gap-4 w-full mt-4">
      <div class="flex justify-between items-center">
        <h1 class="text-lg text-left">Pickup and Delivery DEMO</h1>
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
          <UTooltip text="Clear Logs" :shortcuts="['C']">
            <UButton
              @click="clearLogs"
              icon="i-heroicons-minus-circle"
              size="xl"
              square
              variant="link"
              color="gray"
            />
          </UTooltip>
          <UTooltip text="Open Operation Configuration" :shortcuts="['G']">
            <UButton
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
        <div class="flex flex-col whitespace-nowrap gap-2 w-40">
          <span class="w-40">Pickup</span>
          <UTooltip
            v-for="(p, i) in pickups"
            :text="'Select ' + p.name"
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
                  :label="'Floor ' + p.floor"
                ></UBadge>
              </template>
            </UButton>
          </UTooltip>
        </div>
        <div class="flex flex-col text-center w-full px-4 justify-center gap-2">
          <div>Logs</div>
          <UCard
            class="text-left"
            :ui="{ body: { padding: 'px-1 py-1 sm:p-1' } }"
            ><div
              id="logger"
              v-html="log"
              class="h-[418px] overflow-y-scroll p-1 m-1"
            ></div
          ></UCard>
        </div>
        <div class="flex flex-col whitespace-nowrap gap-2 w-40">
          <span class="text-right w-40">Delivery</span>
          <UTooltip
            v-for="(d, i) in deliveries"
            :text="'Select ' + d.name"
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
              ><template #trailing>
                <UBadge
                  color="white"
                  variant="solid"
                  :label="'Floor ' + d.floor"
                ></UBadge> </template
            ></UButton>
          </UTooltip>
        </div>
      </div>
      <div class="flex">
        <UButton block color="gray" @click="createRequest" label="Send Request"
          ><template #trailing><UKbd>Space</UKbd></template></UButton
        >
      </div>
      <div
        v-show="loadingLandmarks"
        class="flex flex-col justify-center items-center"
      >
        <UProgress animation="carousel" class="mb-1" />
        Loading Landmarks...
      </div>
      <div
        v-show="sendingRequest"
        class="flex flex-col justify-center items-center"
      >
        <UProgress animation="carousel" class="mb-1" />
        Sending Request...
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
        <UForm
          class="flex flex-col gap-4"
          :schema="configSchema"
          :state="configState"
          @submit="onSubmit"
        >
          <UDivider label="Operation" />
          <UFormGroup label="Operation" name="operation">
            <USelectMenu
              placeholder="Choose the Operation"
              v-model="configState.operation"
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
          <UDivider label="Pickup Window Configuration" />
          <UFormGroup label="Pickup Window Upper" name="pickup-window-upper">
            <UInput
              placeholder="Pickup Window Upper Time"
              v-model="configState.pickup.window.upper"
            ></UInput>
          </UFormGroup>
          <UFormGroup label="Pickup Window Lower" name="pickup-window-lower">
            <UInput
              placeholder="Pickup Window Lower Time"
              v-model="configState.pickup.window.lower"
            ></UInput>
          </UFormGroup>
          <UDivider label="Delivery Window Configuration" />
          <UFormGroup
            label="Delivery Window Upper"
            name="delivery-window-upper"
          >
            <UInput
              placeholder="Delivery Window Upper Time"
              v-model="configState.delivery.window.upper"
            ></UInput>
          </UFormGroup>
          <UFormGroup
            label="Delivery Window Lower"
            name="delivery-window-lower"
          >
            <UInput
              placeholder="Delivery Window Lower Time"
              v-model="configState.delivery.window.lower"
            ></UInput>
          </UFormGroup>
          <div class="flex justify-end">
            <UButton type="submit">Save</UButton>
          </div>
        </UForm>
        <template #footer>
          <div
            v-show="savingConfig"
            class="flex flex-col justify-center items-center"
          >
            <UProgress animation="carousel" class="mb-1" />
            Saving...
          </div>
        </template>
      </UCard>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import type { FormSubmitEvent } from "#ui/types";
import type { OperationList, RequestBody } from "../models/Operation";
import type { LandmarksList } from "~/models/Locality";
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

definePageMeta({
  middleware: ["auth"],
});

const auth = useAuth();
const hivemind = useHivemind();
const toast = useToast();
const robots = useRobots();

const pickups = ref<LandmarksList[]>([]);
const deliveries = ref<LandmarksList[]>([]);

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

function selectPickup(uuid: string) {
  selectedPickup.value = uuid;
}

function selectDelivery(uuid: string) {
  selectedDelivery.value = uuid;
}

const toggleConfig = () => {
  showConfig.value = !showConfig.value;
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

async function onSubmit(event: FormSubmitEvent<ConfigSchema>) {
  savingConfig.value = true;
  if (event.data.operation) {
    selectedOperation.value = event.data.operation;
    hivemind.setOperationSelected(selectedOperation.value);
    await hivemind.retrieveOperation(selectedOperation.value);
    if (hivemind.operation && hivemind.operation.locality) {
      await hivemind.listLandmarks(hivemind.operation.locality);
      if (hivemind.landmarks) {
        pickups.value = hivemind.landmarks;
        deliveries.value = hivemind.landmarks;
      }
    }
  }
  savingConfig.value = false;
  showConfig.value = false;
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
      title:
        "Please select both pickup and delivery landmark to send a request!",
      color: "red",
    });
  }
}

const refreshLandmarks = async () => {
  if (auth.logged) {
    if (!auth.hasCredentials) {
      await auth.getCredentials();
    }
    if (auth.hasCredentials) {
      await hivemind.listOperations();
      if (hivemind.operations) operations.value = hivemind.operations;
      selectedOperation.value = hivemind.getOperationSelected();
      if (selectedOperation.value) {
        loadingLandmarks.value = true;
        configState.operation = selectedOperation.value;
        await hivemind.retrieveOperation(selectedOperation.value);
        if (hivemind.operation && hivemind.operation.locality) {
          await hivemind.listLandmarks(hivemind.operation.locality);
          if (hivemind.landmarks) {
            pickups.value = hivemind.landmarks;
            deliveries.value = hivemind.landmarks;
          }
        }
        loadingLandmarks.value = false;
        if (!socket.value) {
          socket.value = io({
            transports: ["websocket", "polling"],
            query: {
              token: auth.accessToken,
              room: selectedOperation.value,
            },
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
        }
      } else {
        toast.add({
          icon: "i-heroicons-exclamation-circle",
          title: "Please select an operation on configuration",
          color: "yellow",
        });
      }
    } else {
      toast.add({
        icon: "i-heroicons-exclamation-circle",
        title:
          "You don't have any App Credentials Registered, click on user icon to set one",
        color: "red",
      });
    }
  }
};

const setPickup = (index: number) => {
  if (pickups.value[index]) {
    selectedPickup.value = pickups.value[index].uuid;
  }
};

const setDelivery = (index: number) => {
  if (deliveries.value[index]) {
    selectedDelivery.value = deliveries.value[index].uuid;
  }
};

defineShortcuts({
  r: {
    usingInput: false,
    handler: async () => {
      await refreshLandmarks();
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
      title: "Container Unlocked",
      icon: "i-heroicons-check-circle",
      color: "green",
    });
  } else {
    toast.add({
      title: "Something Strange Happened!",
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
        return `[${robotName}]: Request #${data.externalRequestId} Assigned`;
      }
      case "REQUEST_RUNNING": {
        const data = message.data.data as RequestRunningData;
        return `[${robotName}]: Request #${data.externalRequestId} is Running`;
      }
      case "REQUEST_STAGE_STARTED": {
        const data = message.data.data as RequestStageStartedData;
        return `[${robotName}]: (${data.nodeType}) Request #${data.externalRequestId} Started Stage ${data.requestStage}`;
      }
      case "REQUEST_STAGE_FINISHED": {
        const data = message.data.data as RequestStageFinishedData;
        return `[${robotName}]: (${data.nodeType}) Request #${data.externalRequestId} Finished Stage ${data.requestStage}`;
      }
      case "REQUEST_LOCKED": {
        const data = message.data.data as RequestLockedData;
        const text = `[${robotName}]: Request #${data.externalRequestId} Locked <button title="Unlock Container" id="${data.requestId}" type="button" class="unlock-container-button focus:outline-none focus-visible:outline-0 disabled:cursor-not-allowed disabled:opacity-75 flex-shrink-0 font-medium rounded-md text-base gap-x-2.5 p-2.5 text-blue-500 hover:text-blue-600 disabled:text-blue-500 dark:text-blue-400 dark:hover:text-blue-500 dark:disabled:text-blue-400 underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400 inline-flex items-center"><span class="i-heroicons-lock-open flex-shrink-0 h-6 w-6" aria-hidden="true"></span></button>`;
        return text;
      }
      case "REQUEST_CANCELLED": {
        const data = message.data.data as RequestCancelledData;
        return `[${robotName}]: Request #${data.externalRequestId} Cancelled, reason: ${data.cancelledReason}`;
      }
      case "REQUEST_FINISHED": {
        const data = message.data.data as RequestFinishedData;
        return `[${robotName}]: Request #${data.externalRequestId} Finished Successfully`;
      }
      case "ROBOT_WAKEUP": {
        return `[${robotName}]: Robot Wakeup`;
      }
      case "ROBOT_SHUTDOWN": {
        return `[${robotName}]: Robot Shutdown`;
      }
      default:
        return `[UNKNOWN]: ${JSON.stringify(message.data)}`;
    }
  } else {
    return `[LOG]: ${message.data}`;
  }
};

const log = ref<string>("");

const messages = ref<SocketIO[]>([]);

const socket = ref<Socket>();

onMounted(async () => {
  await refreshLandmarks();
});

onUnmounted(() => {
  if (socket.value) socket.value.close();
});

const tableAccordion = [
  {
    label: "Requests",
    icon: "i-heroicons-arrows-right-left",
    slot: "requests",
  },
];

watch(
  auth,
  async (oldValue, newValue) => {
    if (newValue.hasCredentials && newValue.appSelected) {
      await refreshLandmarks();
    }
  },
  { deep: true }
);
</script>
