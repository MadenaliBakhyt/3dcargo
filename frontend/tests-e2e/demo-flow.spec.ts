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

  test("the demo pack fills the truck's width (3 pallets abreast) before extending its length", async ({ page }) => {
    // Regression test: the packer used to prioritize extending along the
    // truck's length before ever using its width, hugging one wall in a
    // single line. It should instead fill a row across the width first.
    await page.goto("/");
    await page.getByRole("button", { name: /Попробовать демо/i }).click();
    await expect(page.getByText("Весь груз успешно размещён")).toBeVisible({ timeout: 15_000 });

    await page.getByRole("tab", { name: "Порядок размещения" }).click();
    const rows = page.locator("table tbody tr");
    // Columns: № | Груз | Машина | X | Y | Z | ...
    const firstThreeY = await Promise.all(
      [0, 1, 2].map((i) => rows.nth(i).locator("td").nth(4).textContent())
    );
    // The euro truck is 245cm wide and each pallet 80cm -- the first three
    // placements should sit side by side (y = 0, 80, 160), not stacked
    // behind one another at the same y.
    expect(new Set(firstThreeY).size).toBe(3);
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

  test("a single cargo type with a large quantity renders fully in the 3D scene without WebGL errors", async ({ page }) => {
    // Regression test: drei's <Instances> allocates its buffer once at the size it had when
    // mounted (0 items, before any calculation). Without remounting on count change, adding a
    // cargo type with more instances than that overflows the GPU buffer and nothing renders.
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });

    await page.goto("/");
    await selectEuroTruck(page);
    await addCargo(page, { name: "Коробка 200", length: "50", width: "40", height: "40", weight: "10", quantity: "200" });

    await page.getByRole("button", { name: /Рассчитать размещение/i }).click();
    await expect(page.getByText("Весь груз успешно размещён")).toBeVisible({ timeout: 20_000 });
    await expect(page.getByRole("definition").filter({ hasText: "200 / 200" })).toBeVisible();

    await page.waitForTimeout(500);
    expect(consoleErrors.filter((e) => e.includes("WebGL"))).toEqual([]);
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

  test("switching the loading side mirrors placements to the opposite wall", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /Попробовать демо/i }).click();
    await expect(page.getByText("Весь груз успешно размещён")).toBeVisible({ timeout: 15_000 });

    await page.getByRole("tab", { name: "Порядок размещения" }).click();
    const firstRowLeft = page.locator("table tbody tr").first();
    const yCellLeft = await firstRowLeft.locator("td").nth(4).textContent();

    await page.getByLabel("Сторона погрузки").click();
    await page.getByRole("option", { name: "Справа" }).click();
    await page.getByRole("button", { name: /Рассчитать размещение/i }).click();
    await expect(page.getByText("Весь груз успешно размещён")).toBeVisible({ timeout: 15_000 });

    const firstRowRight = page.locator("table tbody tr").first();
    const yCellRight = await firstRowRight.locator("td").nth(4).textContent();

    // Same dense pack, mirrored across the truck's width -- not the same Y.
    expect(yCellRight).not.toBe(yCellLeft);
  });

  test("enabling 'prefer stacking' stacks boxes instead of spreading them across the floor", async ({ page }) => {
    await page.goto("/");
    await selectEuroTruck(page);
    await addCargo(page, {
      name: "Коробка малая",
      length: "50",
      width: "50",
      height: "50",
      weight: "10",
      quantity: "6",
    });

    await page.getByRole("button", { name: /Рассчитать размещение/i }).click();
    await expect(page.getByText("Весь груз успешно размещён")).toBeVisible({ timeout: 15_000 });

    await page.getByRole("tab", { name: "Порядок размещения" }).click();
    const zCellsFlat = await page.locator("table tbody tr td:nth-child(6)").allTextContents();
    // Default: floor is nowhere near full (euro truck fits far more than 6
    // of these), so every box should sit on the floor, z = 0.
    expect(zCellsFlat.every((z) => z === "0")).toBe(true);

    await page.getByRole("tab", { name: "3D" }).click();
    await page.getByLabel("Сначала штабелировать").click();
    await page.getByRole("button", { name: /Рассчитать размещение/i }).click();
    await expect(page.getByText("Весь груз успешно размещён")).toBeVisible({ timeout: 15_000 });

    await page.getByRole("tab", { name: "Порядок размещения" }).click();
    const zCellsStacked = await page.locator("table tbody tr td:nth-child(6)").allTextContents();
    // With the toggle on, at least one box must be off the floor even
    // though there's still plenty of unused floor space available.
    expect(zCellsStacked.some((z) => z !== "0")).toBe(true);
  });

  test("all vehicle presets, including the new trailer types, are selectable", async ({ page }) => {
    await page.goto("/");
    await page.getByLabel("Транспорт").click();

    for (const name of ["Трал (площадка)", "Тентованный 105 м³", "Тентованный 120 м³", "Прицеп для перевозки автомобилей"]) {
      await expect(page.getByRole("option", { name })).toBeVisible();
    }

    await page.getByRole("option", { name: "Тентованный 120 м³" }).click();
    // ru-RU number formatting uses a non-breaking space as the thousands separator.
    await expect(page.getByText(/1.600 см × 250 см × 300 см/)).toBeVisible();
  });

  test("renaming, saving as a file, starting a new project, and reopening the file restores it", async ({ page }) => {
    await page.goto("/");
    const nameInput = page.getByLabel("Название проекта");
    await nameInput.fill("Мой тестовый проект");
    await nameInput.blur();

    await page.getByRole("button", { name: /Попробовать демо/i }).click();
    await expect(page.getByText("Весь груз успешно размещён")).toBeVisible({ timeout: 15_000 });

    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("button", { name: /Сохранить как файл/i }).click(),
    ]);
    // Cyrillic names must still produce a real (non-generic) filename -- see toFilenameStem.
    expect(download.suggestedFilename()).not.toBe("download");
    expect(download.suggestedFilename()).toMatch(/\.json$/);
    const savePath = await download.path();
    if (!savePath) throw new Error("download did not save to disk");

    await page.getByRole("button", { name: "Новый расчёт", exact: true }).click();
    await page.getByRole("button", { name: "Очистить" }).click();
    await expect(nameInput).toHaveValue("Новый расчёт");

    await page.getByRole("button", { name: "Загрузить", exact: true }).click();
    await page.locator('input[type="file"]').setInputFiles(savePath);
    await expect(nameInput).toHaveValue("Мой тестовый проект");
    await expect(page.locator("table")).toContainText("Паллета A");
  });
});
