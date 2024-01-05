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
        <span class="text-sm leading-5"
          >{{ $t("components.table.rowsPerPage") }}:</span
        >

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
          :placeholder="$t('components.table.statusFilter')"
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
            {{ $t("components.table.columns") }}
          </UButton>
        </USelectMenu>

        <UButton
          icon="i-heroicons-funnel"
          color="gray"
          size="xs"
          :disabled="search === '' && selectedStatus.length === 0"
          @click="resetFilters"
        >
          {{ $t("components.table.resetFilters") }}
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
            {{ $t("components.table.pagination.showing") }}
            <span class="font-medium">{{ pageFrom }}</span>
            {{ $t("components.table.pagination.to") }}
            <span class="font-medium">{{ pageTo }}</span>
            {{ $t("components.table.pagination.of") }}
            <span class="font-medium">{{ pageTotal }}</span>
            {{ $t("components.table.pagination.results") }}
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

const $t = useI18n().t;

// Columns
const columns = [
  {
    key: "uuid",
    label: $t("components.table.fields.uuid"),
    sortable: false,
  },
  {
    key: "externalId",
    label: $t("components.table.fields.externalId"),
    sortable: false,
  },
  {
    key: "robotAssigned",
    label: $t("components.table.fields.robot"),
    sortable: false,
  },
  {
    key: "status",
    label: $t("components.table.fields.status"),
    sortable: false,
  },
  {
    key: "actions",
    label: $t("components.table.fields.actions"),
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
    label: $t("components.table.status.queued"),
    value: false,
  },
  {
    key: "ASSIGNED",
    label: $t("components.table.status.assigned"),
    value: false,
  },
  {
    key: "RUNNING",
    label: $t("components.table.status.running"),
    value: false,
  },
  {
    key: "FINISHED",
    label: $t("components.table.status.finished"),
    value: false,
  },
  {
    key: "CANCELLED",
    label: $t("components.table.status.cancelled"),
    value: false,
  },
  {
    key: "LOCKED",
    label: $t("components.table.status.locked"),
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
  return request?.label || $t("components.table.status.unknown");
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
      for (const r in hivemind.requests.results) {
        if (hivemind.requests.results[r].status == "RUNNING") {
          const robot = hivemind.requests.results[r].robotAssigned;
          if (robot) {
            const routes = await hivemind.listRoutes(robot);
            nodesOfRequest.set(hivemind.requests.results[r].uuid, routes);
          }
        }
      }
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
      title: $t("components.table.feedbacks.cancel"),
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

const unlockContainer = async (row: RequestRetrieve) => {
  const request = await hivemind.continueRequest(row.operation.uuid, row.uuid);
  if (request) {
    toast.add({
      title: $t("components.table.feedbacks.unlock"),
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
