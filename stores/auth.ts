import type { Credentials } from "@prisma/client";
import { defineStore } from "pinia";

type User = Partial<{
  id: number;
  username: string;
  password: string;
  createdAt: string;
  updatedAt: string;
  selectedCredential: number | null;
}>;

type AuthState = {
  token: string;
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
    token: "",
    logged: false,
    user: undefined,
    hasCredentials: false,
    appSelected: "",
    apps: undefined,
    app: undefined,
  }),
  getters: {
    accessToken: (state) => state.token,
  },
  actions: {
    login(token: string) {
      this.token = token;
      this.logged = true;
    },
    logout() {
      this.token = "";
      this.logged = false;
      this.user = undefined;
    },
    tryLogin() {
      if (process.client) {
        const token = localStorage.getItem("token");
        if (token) {
          this.login(token);
          return true;
        }
      }
      return false;
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
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        });
        this.apps = JSON.parse(JSON.stringify(request));
        console.log(this.apps);
        return this.apps;
      } catch (e) {
        throw e;
      }
    },
    async createApp(body: CreateAppBody) {
      try {
        const request = await $fetch("/api/apps", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
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
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
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
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
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
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        });
        this.setCredentials(request.appId);
        return request;
      } catch (e) {
        throw e;
      }
    },
  },
});
