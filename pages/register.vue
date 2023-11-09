<template>
  <div class="flex justify-center items-center min-h-[calc(100vh-92px)]">
    <UCard class="w-96 p-6 flex flex-col gap-4">
      <div class="flex items-center gap-2">
        <font-awesome-icon icon="fa-solid fa-brain" class="text-4xl" />
        <h1 class="text-xl">Hivemind Demo | Register</h1>
      </div>
      <UForm
        ref="form"
        class="w-full pt-4 flex flex-col gap-2"
        :schema="schema"
        :state="state"
        @submit="onSubmit"
      >
        <UFormGroup label="Username" name="username">
          <UInput placeholder="Type your username" v-model="state.username" />
        </UFormGroup>
        <UFormGroup label="Password" name="password">
          <UInput
            type="password"
            placeholder="Type your password"
            v-model="state.password"
          />
        </UFormGroup>
        <UFormGroup label="Confirm Password" name="confirmPassword">
          <UInput
            type="password"
            placeholder="Confirm your password"
            v-model="state.confirmPassword"
          />
        </UFormGroup>
        <div class="flex mt-2">
          <UButton type="submit" block>Register</UButton>
        </div>
        <ULink
          to="/"
          class="text-center"
          active-class="text-primary"
          inactive-class="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
        >
          Click here to login
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

const schema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters long"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  confirmPassword: z
    .string()
    .min(6, "Password must be at least 6 characters long"),
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
        message: "Passwords do not match",
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
        title: "User created Successfully!",
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
