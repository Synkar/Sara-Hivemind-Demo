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
          <span>Pickup</span>
          <UButton
            v-for="(p, i) in pickups"
            @click="selectPickup(p.uuid)"
            :color="selectedPickup == p.uuid ? 'green' : 'indigo'"
            >{{ p.name }}</UButton
          >
        </div>
        <div class="flex text-left w-full px-4">Logs:</div>
        <div class="flex flex-col whitespace-nowrap gap-2">
          <span>Delivery</span>
          <UButton
            :color="selectedDelivery == d.uuid ? 'green' : 'purple'"
            v-for="(d, i) in deliveries"
            @click="selectDelivery(d.uuid)"
            >{{ d.name }}</UButton
          >
        </div>
      </div>
      <div class="flex">
        <UButton block color="gray" @click="createRequest"
          >Send Request</UButton
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
import { z } from "zod";
definePageMeta({
  middleware: ["auth"],
});

const auth = useAuth();
const hivemind = useHivemind();
const toast = useToast();

const pickups = ref<LandmarksList[]>([]);
const deliveries = ref<LandmarksList[]>([]);

const savingConfig = ref(false);
const loadingLandmarks = ref(false);
const sendingRequest = ref(false);

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
    };
    console.log(requestBody);
    await hivemind.createRequest(requestBody);
    sendingRequest.value = false;
  } else {
    toast.add({
      icon: "i-heroicons-exclamation-circle",
      title:
        "Please select both pickup and delivery landmark to send a request!",
      color: "red",
    });
  }
}

onMounted(async () => {
  if (auth.logged) {
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
    }
  }
});
</script>
