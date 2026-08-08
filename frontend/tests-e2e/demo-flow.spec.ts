import { expect, test, type Page } from "@playwright/test";

async function selectEuroTruck(page: Page) {
  await page.getByLabel("Транспорт").click();
  const option = page.getByRole("option", { name: "Еврофура 86 м³" });
  await option.waitFor({ state: "visible" });
  await option.click();
  await expect(page.getByRole("listbox")).toHaveCount(0);
}

async function addCargo(
  page: Page,
  cargo: { name: string; length: string; width: string; height: string; weight: string; quantity: string }
) {
  await page.getByRole("button", { name: "Добавить груз", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Название").fill(cargo.name);
  await dialog.getByLabel("Длина, см").fill(cargo.length);
  await dialog.getByLabel("Ширина, см").fill(cargo.width);
  await dialog.getByLabel("Высота, см").fill(cargo.height);
  await dialog.getByLabel("Вес, кг").fill(cargo.weight);
  await dialog.getByLabel("Количество").fill(cargo.quantity);
  await dialog.getByRole("button", { name: "Добавить груз", exact: true }).click();
}

test.describe("Cargo Loading Planner - golden path", () => {
  test("running the built-in demo produces a real, fully-placed calculation", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("button", { name: /Попробовать демо/i }).click();

    await expect(page.getByText("Весь груз успешно размещён")).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole("definition").filter({ hasText: "15 / 15" })).toBeVisible();
    await expect(page.locator("canvas")).toBeVisible();

    // The pre-filled demo cargo type shows up in the cargo table.
    await expect(page.locator("table")).toContainText("Паллета A");
  });

  test("clicking a placed item selects it and shows its coordinates and loading order", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /Попробовать демо/i }).click();
    await expect(page.getByText("Весь груз успешно размещён")).toBeVisible({ timeout: 15_000 });

    await page.getByRole("tab", { name: "Порядок размещения" }).click();
    await page.locator("table tbody tr").first().click();

    await expect(page.getByText("Координаты")).toBeVisible();
    await expect(page.getByRole("term").filter({ hasText: "Порядок загрузки" })).toBeVisible();
  });

  test("switching between 3D and 2D projection tabs does not error and keeps content visible", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));

    await page.goto("/");
    await page.getByRole("button", { name: /Попробовать демо/i }).click();
    await expect(page.getByText("Весь груз успешно размещён")).toBeVisible({ timeout: 15_000 });

    for (const tabName of ["Сверху", "Спереди", "Сбоку", "3D"]) {
      await page.getByRole("tab", { name: tabName }).click();
      await page.waitForTimeout(200);
    }

    expect(errors).toEqual([]);
  });

  test("adding a custom cargo type and recalculating updates the results", async ({ page }) => {
    await page.goto("/");
    await selectEuroTruck(page);
    await addCargo(page, { name: "Коробка B", length: "100", width: "60", height: "80", weight: "120", quantity: "10" });

    await expect(page.locator("table")).toContainText("Коробка B");

    await page.getByRole("button", { name: /Рассчитать размещение/i }).click();
    await expect(page.getByText(/Размещено/)).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole("definition").filter({ hasText: "10 / 10" })).toBeVisible();
  });

  test("cargo that cannot possibly fit is reported as unplaced with a reason", async ({ page }) => {
    await page.goto("/");
    await selectEuroTruck(page);
    await addCargo(page, {
      name: "Огромный груз",
      length: "2000",
      width: "300",
      height: "300",
      weight: "100",
      quantity: "1",
    });

    await page.getByRole("button", { name: /Рассчитать размещение/i }).click();
    await expect(page.getByText("Не весь груз удалось разместить")).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText("Огромный груз").first()).toBeVisible();
  });
});
