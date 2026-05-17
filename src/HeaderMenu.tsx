import { EllipsisVerticalIcon } from "@heroicons/react/24/solid";
import { useEffect, useRef, useState } from "react";
import type { ThemePreference } from "./useTheme";

interface Props {
	preference: ThemePreference;
	setPreference: (preference: ThemePreference) => void;
	hasTimeEntries: boolean;
	onBatchDeleteClick: () => void;
}

export function HeaderMenu({
	preference,
	setPreference,
	hasTimeEntries,
	onBatchDeleteClick,
}: Props) {
	const [isOpen, setIsOpen] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!isOpen) {
			return;
		}

		const handleMouseDown = (e: MouseEvent) => {
			if (
				containerRef.current &&
				!containerRef.current.contains(e.target as Node)
			) {
				setIsOpen(false);
			}
		};
		document.addEventListener("pointerdown", handleMouseDown);

		return () => document.removeEventListener("pointerdown", handleMouseDown);
	}, [isOpen]);

	return (
		<div className="relative" ref={containerRef}>
			<button
				type="button"
				aria-label="Menu"
				aria-haspopup="menu"
				aria-expanded={isOpen}
				onClick={() => setIsOpen((prev) => !prev)}
				className="rounded p-1 text-neutral-600 hover:bg-neutral-200 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-700 dark:hover:text-neutral-100"
			>
				<EllipsisVerticalIcon className="h-5 w-5" />
			</button>

			{isOpen && (
				<div
					role="menu"
					className="absolute right-0 z-10 mt-1 w-36 rounded-md border border-neutral-200 bg-white py-1 shadow-md dark:border-neutral-700 dark:bg-neutral-800"
				>
					{(["system", "light", "dark"] as const).map((option) => (
						<button
							key={option}
							role="menuitem"
							type="button"
							onClick={() => {
								setPreference(option);
								setIsOpen(false);
							}}
							className={`flex w-full items-center px-3 py-1.5 text-sm capitalize ${
								preference === option
									? "bg-neutral-100 font-medium text-neutral-900 dark:bg-neutral-700 dark:text-neutral-100"
									: "text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
							}`}
						>
							{option}
						</button>
					))}
					{hasTimeEntries && (
						<>
							<hr className="my-1 border-neutral-200 dark:border-neutral-700" />
							<button
								role="menuitem"
								type="button"
								onClick={() => {
									onBatchDeleteClick();
									setIsOpen(false);
								}}
								className="flex w-full items-center px-3 py-1.5 text-neutral-600 text-sm hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
							>
								Select dates to delete
							</button>
						</>
					)}
				</div>
			)}
		</div>
	);
}
