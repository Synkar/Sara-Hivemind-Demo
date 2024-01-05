<template>
  <div class="flex justify-center items-center min-h-[calc(100vh-92px)]">
    <UCard class="w-96 p-6 flex flex-col gap-4">
      <div class="flex items-center gap-2">
        <font-awesome-icon icon="fa-solid fa-brain" class="text-4xl" />
        <h1 class="text-xl">
          {{ $t("name") }} | {{ $t("pages.register.title") }}
        </h1>
      </div>
      <UForm
        ref="form"
        class="w-full pt-4 flex flex-col gap-2"
        :schema="schema"
        :state="state"
        @submit="onSubmit"
      >
        <UFormGroup
          :label="$t('pages.register.form.username.label')"
          name="username"
        >
          <UInput
            :placeholder="$t('pages.register.form.username.placeholder')"
            v-model="state.username"
          />
        </UFormGroup>
        <UFormGroup
          :label="$t('pages.register.form.password.label')"
          name="password"
        >
          <UInput
            type="password"
            :placeholder="$t('pages.register.form.password.placeholder')"
            v-model="state.password"
          />
        </UFormGroup>
        <UFormGroup
          :label="$t('pages.register.form.passwordConfirmation.label')"
          name="confirmPassword"
        >
          <UInput
            type="password"
            :placeholder="
              $t('pages.register.form.passwordConfirmation.placeholder')
            "
            v-model="state.confirmPassword"
          />
        </UFormGroup>
        <div class="flex mt-2">
          <UButton type="submit" block>{{
            $t("pages.register.form.submit")
          }}</UButton>
        </div>
        <ULink
          to="/"
          class="text-center"
          active-class="text-primary"
          inactive-class="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
        >
          {{ $t("pages.register.form.links.login") }}
        </ULink>
      </UForm>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { z } from "zod";
import type { FormSubmitEvent } from "#ui/types";
import type { H3Error } from "h3";

const form = ref();
const toast = useToast();
const router = useRouter();

const $t = useI18n().t;

const schema = z.object({
  username: z
    .string()
    .min(
      3,
      $t("errors.minLength").replace("{0}", "username").replace("{1}", "3")
    ),
  password: z
    .string()
    .min(
      6,
      $t("errors.minLength").replace("{0}", "password").replace("{1}", "6")
    ),
  confirmPassword: z
    .string()
    .min(
      6,
      $t("errors.minLength").replace("{0}", "password").replace("{1}", "6")
    ),
});

type Schema = z.output<typeof schema>;

const state = reactive({
  username: undefined,
  password: undefined,
  confirmPassword: undefined,
});

const onSubmit = async (event: FormSubmitEvent<Schema>) => {
  const formData = event.data;
  if (formData.password !== formData.confirmPassword) {
    form.value.setErrors([
      {
        path: "confirmPassword",
        message: $t("pages.register.errors.passwordsNotMatch"),
      },
    ]);
    return;
  }
  try {
    const request = await $fetch("/api/register", {
      method: "POST",
      body: JSON.stringify(formData),
    });
    if (request) {
      toast.add({
        color: "green",
        title: $t("pages.register.success"),
        icon: "i-heroicons-circle-check",
      });
      router.push("/");
    }
  } catch (e) {
    const error = e as H3Error;
    toast.add({
      color: "red",
      title: error.message,
      icon: "i-heroicons-exclamation-circle",
    });
  }
};
</script>
