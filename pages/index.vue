<template>
  <div class="flex justify-center items-center min-h-[calc(100vh-92px)]">
    <UCard class="w-96 p-6">
      <div class="flex flex-col gap-4">
        <div class="flex items-center gap-2">
          <font-awesome-icon icon="fa-solid fa-brain" class="text-4xl" />
          <h1 class="text-xl">
            {{ $t("name") }} | {{ $t("pages.login.title") }}
          </h1>
        </div>
        <UDivider :ui="{ border: { size: { horizontal: 'border-t-2' } } }" />
        <UForm
          :schema="schema"
          class="w-full flex flex-col gap-2"
          :state="state"
          @submit="onSubmit"
        >
          <UFormGroup :label="$t('pages.login.form.username')" name="username">
            <UInput placeholder="Type your username" v-model="state.username" />
          </UFormGroup>
          <UFormGroup :label="$t('pages.login.form.password')" name="password">
            <UInput
              type="password"
              placeholder="Type your password"
              v-model="state.password"
            />
          </UFormGroup>
          <div class="flex mt-2">
            <UButton type="submit" block>{{
              $t("pages.login.form.submit")
            }}</UButton>
          </div>
          <ULink
            to="/register"
            class="text-center"
            active-class="text-primary"
            inactive-class="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            {{ $t("pages.login.links.register") }}
          </ULink>
        </UForm>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { z } from "zod";
import type { FormSubmitEvent } from "#ui/types";
import type { H3Error } from "h3";

const router = useRouter();
const toast = useToast();
const auth = useAuth();

const schema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters long"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

type Schema = z.output<typeof schema>;

const state = reactive({
  username: undefined,
  password: undefined,
});

async function onSubmit(event: FormSubmitEvent<Schema>) {
  try {
    const request = await $fetch("/api/login", {
      method: "POST",
      body: JSON.stringify(event.data),
    });
    if (request) {
      const auth = useAuth();
      auth.login();
      router.push("/dashboard");
    }
  } catch (e) {
    console.log(e);
    const error = e as H3Error;
    if (error.statusCode == 401) {
      toast.add({
        color: "red",
        title: "Username or Password Incorrect!",
        icon: "i-heroicons-exclamation-circle",
      });
    } else {
      toast.add({
        color: "red",
        title: "Something Strange Happened!",
        icon: "i-heroicons-exclamation-circle",
      });
    }
  }
}

onMounted(() => {
  if (!auth.logged) {
    const logged = useCookie("isLogged");
    const value = Boolean(logged.value);
    if (value) {
      useAuth().login();
      router.push("/dashboard");
    }
  }
});
</script>
