import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { beforeEach, expect, it, vi } from "vitest";
import App from "../App";
import { DEFAULT_APP_PROPS } from "./App_test_helpers";

beforeEach(() => {
	const store = new Map<string, string>();
	vi.stubGlobal("localStorage", {
		getItem: (key: string) => store.get(key) ?? null,
		setItem: (key: string, value: string) => store.set(key, value),
	});

	vi.stubGlobal("matchMedia", () => ({
		matches: false,
		addEventListener: () => {},
		removeEventListener: () => {},
	}));
});

it("selecting a theme persists it and closes the menu", async () => {
	const user = userEvent.setup();

	render(<App {...DEFAULT_APP_PROPS} />);
	await user.click(screen.getByRole("button", { name: "Menu" }));
	await user.click(screen.getByRole("menuitem", { name: "dark" }));

	expect(localStorage.getItem("theme")).toBe("dark");
	expect(
		screen.queryByRole("menuitem", { name: "system" }),
	).not.toBeInTheDocument();
});
