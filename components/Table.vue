<template>
  <UCard
    v-show="props.operation"
    class="w-full"
    :ui="{
      base: 'mb-5',
      ring: '',
      divide: 'divide-y divide-gray-200 dark:divide-gray-700',
      header: { padding: 'p-0' },
      rounded: 'rounded-t-none',
      body: {
        padding: '',
        base: 'divide-y divide-gray-200 dark:divide-gray-700',
      },
      footer: { padding: 'p-4' },
    }"
  >
    <!-- Header and Action buttons -->
    <div class="flex justify-between items-center w-full px-4 py-3">
      <div class="flex items-center gap-1.5">
        <span class="text-sm leading-5">Rows per page:</span>

        <USelect
          v-model="pageCount"
          :options="[3, 5, 10, 20, 30, 40]"
          class="me-2 w-20"
          size="xs"
        />
      </div>

      <div class="flex gap-1.5 items-center">
        <USelectMenu
          v-model="selectedStatus"
          :options="requestStatus"
          multiple
          placeholder="Status"
          class="w-40"
          v-if="false"
        />
        <UButton
          @click="listRequests"
          icon="i-heroicons-arrow-path"
          size="xs"
          square
          color="indigo"
          label="Refresh"
        />

        <USelectMenu v-model="selectedColumns" :options="columns" multiple>
          <UButton icon="i-heroicons-view-columns" color="gray" size="xs">
            Columns
          </UButton>
        </USelectMenu>

        <UButton
          icon="i-heroicons-funnel"
          color="gray"
          size="xs"
          :disabled="search === '' && selectedStatus.length === 0"
          @click="resetFilters"
        >
          Reset
        </UButton>
      </div>
    </div>

    <!-- Table -->
    <UTable
      :rows="rows"
      :columns="columnsTable"
      :loading="pending"
      sort-asc-icon="i-heroicons-arrow-up"
      sort-desc-icon="i-heroicons-arrow-down"
      class="w-full"
      :ui="{ td: { base: 'max-w-[0] truncate' } }"
      @select="select"
    >
      <template #status-data="{ row }">
        <UBadge
          size="xs"
          :label="
            checkCanUnlock(row)
              ? getStatusLabel('LOCKED')
              : getStatusLabel(row.status)
          "
          :color="
            checkCanUnlock(row)
              ? statusColorMap.get('LOCKED')
              : statusColorMap.get(row.status)
          "
          variant="subtle"
        />
      </template>
      <template #externalId-data="{ row }">
        <div v-if="row.externalId != 'undefined'">
          {{ row.externalId }}
        </div>
        <div v-else></div>
      </template>

      <template #actions-data="{ row }">
        <div class="flex gap-2">
          <UButton
            icon="i-heroicons-lock-open"
            size="2xs"
            color="blue"
            variant="outline"
            square
            @click="unlockContainer(row)"
            v-if="checkCanUnlock(row)"
          />

          <UButton
            icon="i-heroicons-x-circle"
            size="2xs"
            color="red"
            variant="outline"
            square
            @click="cancelRequest(row)"
            v-if="row.status != 'FINISHED' && row.status != 'CANCELLED'"
          />
        </div>
      </template>
    </UTable>

    <!-- Number of rows & Pagination -->
    <template #footer>
      <div class="flex flex-wrap justify-between items-center">
        <div>
          <span class="text-sm leading-5">
            Showing
            <span class="font-medium">{{ pageFrom }}</span>
            to
            <span class="font-medium">{{ pageTo }}</span>
            of
            <span class="font-medium">{{ pageTotal }}</span>
            results
          </span>
        </div>

        <UPagination
          v-model="page"
          :page-count="pageCount"
          :total="pageTotal"
          :ui="{
            wrapper: 'flex items-center gap-1',
            rounded: '!rounded-full min-w-[32px] justify-center',
            default: {
              activeButton: {
                variant: 'outline',
              },
            },
          }"
        />
      </div>
    </template>
  </UCard>
</template>

<script lang="ts" setup>
import type { RequestRetrieve } from "~/models/Operation";

// Columns
const columns = [
  {
    key: "uuid",
    label: "UUID",
    sortable: false,
  },
  {
    key: "externalId",
    label: "External ID",
    sortable: false,
  },
  {
    key: "robotAssigned",
    label: "Robot",
    sortable: false,
  },
  {
    key: "status",
    label: "Status",
    sortable: false,
  },
  {
    key: "actions",
    label: "Actions",
    sortable: false,
  },
];

const selectedColumns = ref(columns);
const columnsTable = computed(() =>
  columns.filter((column) => selectedColumns.value.includes(column))
);

// Selected Rows
const selectedRows = ref<any>([]);

function select(row: any) {
  const index = selectedRows.value.findIndex((item: any) => item.id === row.id);
  if (index === -1) {
    selectedRows.value.push(row);
  } else {
    selectedRows.value.splice(index, 1);
  }
}

// Filters
const requestStatus = [
  {
    key: "QUEUED",
    label: "Queued",
    value: false,
  },
  {
    key: "ASSIGNED",
    label: "Assigned",
    value: false,
  },
  {
    key: "RUNNING",
    label: "Running",
    value: false,
  },
  {
    key: "FINISHED",
    label: "Finished",
    value: false,
  },
  {
    key: "CANCELLED",
    label: "Cancelled",
    value: false,
  },
  {
    key: "LOCKED",
    label: "Locked",
    value: false,
  },
];

const statusColorMap = new Map([
  ["QUEUED", "neutral"],
  ["ASSIGNED", "cyan"],
  ["RUNNING", "blue"],
  ["FINISHED", "green"],
  ["CANCELLED", "red"],
  ["LOCKED", "purple"],
]);

const getStatusLabel = (key: string) => {
  const request = requestStatus.find((r) => {
    return r.key == key;
  });
  return request?.label || "No Status";
};

const search = ref("");
const selectedStatus = ref<typeof requestStatus>([]);
const searchStatus = computed(() => {
  if (selectedStatus.value?.length === 0) {
    return "";
  }

  if (selectedStatus?.value?.length > 1) {
    return `?completed=${selectedStatus.value[0].value}&completed=${selectedStatus.value[1].value}`;
  }

  return `?completed=${selectedStatus.value[0].value}`;
});

const resetFilters = () => {
  search.value = "";
  selectedStatus.value = [];
};

// Pagination
const page = ref(1);
const pageCount = ref(10);
const pageTotal = ref(0);
const pageFrom = computed(() => (page.value - 1) * pageCount.value + 1);
const pageTo = computed(() =>
  Math.min(page.value * pageCount.value, pageTotal.value)
);

const props = defineProps<{
  operation: string;
}>();

const pending = ref(false);

const hivemind = useHivemind();
const toast = useToast();

const rows = computed(() => {
  if (
    hivemind.requests &&
    hivemind.requests.results &&
    hivemind.requests.results.length > 0
  ) {
    return hivemind.requests.results;
  } else return [];
});

const listRequests = async () => {
  pending.value = true;
  if (props.operation) {
    await hivemind.listRequests(props.operation, page.value, pageCount.value);
    if (hivemind.requests) {
      pageTotal.value = hivemind.requests.count;
    }
  }
  pending.value = false;
};

const nodesOfRequest = new Map();

const checkCanUnlock = (row: RequestRetrieve) => {
  if (
    row.status == "RUNNING" &&
    nodesOfRequest &&
    nodesOfRequest.has(row.uuid)
  ) {
    const routes = nodesOfRequest.get(row.uuid);
    if (routes && routes.length > 0) {
      const lastRoute = routes[0];
      if (lastRoute && lastRoute.locked) {
        return true;
      }
    }
    return false;
  } else {
    return false;
  }
};

const cancelRequest = async (row: RequestRetrieve) => {
  const request = await hivemind.cancelRequest(row.operation.uuid, row.uuid);
  if (request) {
    toast.add({
      title: "Request Cancelled Successfully!",
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

const unlockContainer = async (row: RequestRetrieve) => {
  const request = await hivemind.continueRequest(row.operation.uuid, row.uuid);
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

onMounted(() => {
  listRequests();
});

watch(
  props,
  (oldValue, newValue) => {
    if (newValue.operation) {
      listRequests();
    }
  },
  {
    deep: true,
  }
);

watch(page, (oldValue, newValue) => {
  listRequests();
});
watch(pageCount, (oldValue, newValue) => {
  listRequests();
});
</script>
