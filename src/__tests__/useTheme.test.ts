import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useTheme } from "../useTheme";

type ChangeHandler = (e: Partial<MediaQueryListEvent>) => void;

function mockMatchMedia({ systemPrefersDark }: { systemPrefersDark: boolean }) {
	const listeners: ChangeHandler[] = [];

	vi.stubGlobal("matchMedia", () => ({
		matches: systemPrefersDark,
		addEventListener: (_: string, handler: ChangeHandler) => {
			listeners.push(handler);
		},
		removeEventListener: (_: string, handler: ChangeHandler) => {
			const index = listeners.indexOf(handler);
			if (index !== -1) {
				listeners.splice(index, 1);
			}
		},
	}));

	return {
		trigger: (matches: boolean) => {
			for (const listener of listeners) {
				listener({ matches });
			}
		},
		listenerCount: () => listeners.length,
	};
}

beforeEach(() => {
	const store = new Map<string, string>();
	vi.stubGlobal("localStorage", {
		getItem: (key: string) => store.get(key) ?? null,
		setItem: (key: string, value: string) => store.set(key, value),
	});

	document.documentElement.classList.remove("dark");
});

describe("useTheme", () => {
	it("defaults to system preference when localStorage is empty", () => {
		mockMatchMedia({ systemPrefersDark: false });

		const { result } = renderHook(() => useTheme());

		expect(result.current.preference).toBe("system");
	});

	it("reads existing preference from localStorage on mount", () => {
		localStorage.setItem("theme", "dark");

		const { result } = renderHook(() => useTheme());

		expect(result.current.preference).toBe("dark");
	});

	it("dark preference adds .dark class to <html>", () => {
		mockMatchMedia({ systemPrefersDark: false });
		localStorage.setItem("theme", "dark");

		renderHook(() => useTheme());

		expect(document.documentElement.classList.contains("dark")).toBe(true);
	});

	it("light preference does not add .dark class to <html>", () => {
		mockMatchMedia({ systemPrefersDark: false });
		localStorage.setItem("theme", "light");

		renderHook(() => useTheme());

		expect(document.documentElement.classList.contains("dark")).toBe(false);
	});

	it("system preference + OS prefers dark adds .dark class to <html>", () => {
		mockMatchMedia({ systemPrefersDark: true });

		renderHook(() => useTheme());

		expect(document.documentElement.classList.contains("dark")).toBe(true);
	});

	it("system preference + OS prefers light does not add .dark class to <html>", () => {
		mockMatchMedia({ systemPrefersDark: false });

		renderHook(() => useTheme());

		expect(document.documentElement.classList.contains("dark")).toBe(false);
	});

	it("changing preference persists the new value to localStorage", () => {
		mockMatchMedia({ systemPrefersDark: false });

		const { result } = renderHook(() => useTheme());
		act(() => result.current.setPreference("dark"));

		expect(localStorage.getItem("theme")).toBe("dark");
	});

	it("in system mode, updates theme when matchMedia fires a change event", () => {
		const media = mockMatchMedia({ systemPrefersDark: false });

		renderHook(() => useTheme());

		expect(document.documentElement.classList.contains("dark")).toBe(false);

		act(() => media.trigger(true));

		expect(document.documentElement.classList.contains("dark")).toBe(true);

		act(() => media.trigger(false));

		expect(document.documentElement.classList.contains("dark")).toBe(false);
	});

	it("switching away from system removes the matchMedia listener", () => {
		const media = mockMatchMedia({ systemPrefersDark: false });

		const { result } = renderHook(() => useTheme());

		expect(media.listenerCount()).toBe(1);

		act(() => result.current.setPreference("dark"));

		expect(media.listenerCount()).toBe(0);
	});
});
