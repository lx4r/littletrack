import { EllipsisVerticalIcon, TrashIcon } from "@heroicons/react/24/solid";
import { useEffect, useRef } from "react";

interface KebabMenuProps {
	onBatchDeleteClick: () => void;
}

const KebabMenu = ({ onBatchDeleteClick }: KebabMenuProps) => {
	const detailsRef = useRef<HTMLDetailsElement>(null);

	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (
				detailsRef.current &&
				!detailsRef.current.contains(event.target as Node)
			) {
				detailsRef.current.open = false;
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	const handleBatchDeleteClick = () => {
		onBatchDeleteClick();
		if (detailsRef.current) {
			detailsRef.current.open = false;
		}
	};

	return (
		<details ref={detailsRef} className="relative">
			<summary
				aria-label="Open menu"
				className="rounded-full bg-neutral-600 p-1 text-neutral-200 hover:bg-neutral-700 hover:text-neutral-100 list-none focus:ring-2 focus:ring-neutral-500 focus:ring-offset-1"
			>
				<EllipsisVerticalIcon className="h-5 w-5" />
			</summary>
			<div className="absolute right-0 top-8 z-10 w-48 rounded-md bg-neutral-700 shadow-lg ring-1 ring-black ring-opacity-5">
				<div className="py-1">
					<button
						type="button"
						onClick={handleBatchDeleteClick}
						className="flex w-full items-center gap-2 px-4 py-2 text-sm text-neutral-200 hover:bg-neutral-600"
					>
						<TrashIcon className="h-4 w-4" />
						Batch delete
					</button>
				</div>
			</div>
		</details>
	);
};

export default KebabMenu;
