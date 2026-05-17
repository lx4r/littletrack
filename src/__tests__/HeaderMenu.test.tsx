import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { expect, it } from "vitest";
import { HeaderMenu } from "../HeaderMenu";
import type { ThemePreference } from "../useTheme";

const DEFAULT_PROPS = {
	preference: "system" as ThemePreference,
	setPreference: () => {},
	hasTimeEntries: false,
	onBatchDeleteClick: () => {},
};

it("is closed initially", () => {
	render(<HeaderMenu {...DEFAULT_PROPS} />);

	expect(screen.queryByRole("menu")).not.toBeInTheDocument();
});

it("opens on button click", async () => {
	const user = userEvent.setup();

	render(<HeaderMenu {...DEFAULT_PROPS} />);
	await user.click(screen.getByRole("button", { name: "Menu" }));

	expect(screen.getByRole("menu")).toBeVisible();
});

it("closes when button is clicked again", async () => {
	const user = userEvent.setup();

	render(<HeaderMenu {...DEFAULT_PROPS} />);
	await user.click(screen.getByRole("button", { name: "Menu" }));
	await user.click(screen.getByRole("button", { name: "Menu" }));

	expect(screen.queryByRole("menu")).not.toBeInTheDocument();
});

it("closes on outside click", async () => {
	const user = userEvent.setup();

	render(<HeaderMenu {...DEFAULT_PROPS} />);
	await user.click(screen.getByRole("button", { name: "Menu" }));
	await user.click(document.body);

	expect(screen.queryByRole("menu")).not.toBeInTheDocument();
});
