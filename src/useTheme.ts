import { useEffect, useState } from "react";

type ThemePreference = "light" | "dark" | "system";

export function useTheme() {
	const [preference, setPreferenceState] = useState<ThemePreference>(
		() => (localStorage.getItem("theme") as ThemePreference) ?? "system",
	);

	useEffect(() => {
		if (preference === "dark") {
			document.documentElement.classList.toggle("dark", true);
			return;
		}
		if (preference === "light") {
			document.documentElement.classList.toggle("dark", false);
			return;
		}

		const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

		document.documentElement.classList.toggle("dark", mediaQuery.matches);

		const handler = (e: MediaQueryListEvent) =>
			document.documentElement.classList.toggle("dark", e.matches);
		mediaQuery.addEventListener("change", handler);

		return () => mediaQuery.removeEventListener("change", handler);
	}, [preference]);

	const setPreference = (newPreference: ThemePreference) => {
		localStorage.setItem("theme", newPreference);
		setPreferenceState(newPreference);
	};

	return { preference, setPreference };
}
