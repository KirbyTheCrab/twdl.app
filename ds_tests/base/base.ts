import { test as base } from "@playwright/test";
import { LoginPage } from "../pages/Login/login";
import { DashboardPage } from "../pages/Dashboard/dashboard";
type page = {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
};

export const test = base.extend<page>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },
});

export { expect } from "@playwright/test";
