import type { Credentials } from "@prisma/client";
import { defineStore } from "pinia";
import nJwt from "njwt";

type User = Partial<{
  id: number;
  username: string;
  password: string;
  createdAt: string;
  updatedAt: string;
  selectedCredential: number | null;
}>;

type AuthState = {
  logged: boolean;
  user?: User;
  hasCredentials: boolean;
  appSelected: string;
  apps?: Credentials[];
  app?: {
    id: number;
    appId: string;
    appSecret?: string;
    createdAt: string;
    updatedAt: string;
    usersId: number | null;
  };
};

type CreateAppBody = {
  appId: string;
  appSecret: string;
};

export const useAuth = defineStore("auth", {
  state: (): AuthState => ({
    logged: false,
    user: undefined,
    hasCredentials: false,
    appSelected: "",
    apps: undefined,
    app: undefined,
  }),
  actions: {
    login() {
      this.logged = true;
    },
    logout() {
      this.logged = false;
      this.user = undefined;
    },
    setCredentials(appId: string) {
      this.hasCredentials = true;
      this.appSelected = appId;
    },
    removeCredentials() {
      this.hasCredentials = false;
      this.appSelected = "";
    },
    async getCredentials() {
      if (this.appSelected) return this.appSelected;
      else {
        const app = await this.getSelectedApp();
        this.appSelected = app.appId;
        return this.appSelected;
      }
    },
    async listApps() {
      try {
        const request = await $fetch("/api/apps", {
          method: "GET",
        });
        this.apps = JSON.parse(JSON.stringify(request));
        return this.apps;
      } catch (e) {
        throw e;
      }
    },
    async createApp(body: CreateAppBody) {
      try {
        const request = await $fetch("/api/apps", {
          method: "POST",
          body,
        });
        this.app = request;
        return request;
      } catch (e) {
        throw e;
      }
    },
    async deleteApp(appId: string) {
      try {
        const request = await $fetch(`/api/apps/${appId}`, {
          method: "DELETE",
        });
        return request;
      } catch (e) {
        throw e;
      }
    },
    async setSelectedApp(selectedApp: string) {
      try {
        await $fetch("/api/apps/set", {
          method: "POST",
          body: {
            appId: selectedApp,
          },
        });
        this.setCredentials(selectedApp);
        return true;
      } catch {
        return false;
      }
    },
    async getSelectedApp() {
      try {
        const request = await $fetch("/api/apps/selected", {
          method: "GET",
        });
        this.setCredentials(request.appId);
        return request;
      } catch (e) {
        throw e;
      }
    },
    async getMe() {
      try {
        const request = await $fetch("/api/me", {
          method: "GET",
        });
        this.user = request.user;
        return request;
      } catch (e) {
        throw e;
      }
    },
  },
});
