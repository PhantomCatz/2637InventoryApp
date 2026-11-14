import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../parts/header";
import { createPart } from "../utils/inventoryRequest.ts";
import { partInputError } from "../utils/inventoryValidate.ts";

import type { PartInput } from "../types/inventory.ts";

// TODO: Build this form with Form from ../parts/formItems.
// Required: subteam, name, description, quantity (0 is allowed), is_special (0 or 1).
// Optional: manufacturer_name, manufacturer, part_number, purchase_link, location, categories.
// categories is a comma-separated list of words. normalizePartInput() formats it.
// Each input writes into `part`. Submit runs partInputError(), then createPart(), then opens the new part.

const EMPTY_PART: PartInput = {
	subteam: "",
	name: "",
	manufacturer_name: null,
	part_number: null,
	manufacturer: null,
	categories: null,
	purchase_link: null,
	description: "",
	location: null,
	quantity: 0,
	is_special: 0,
};

function PartCreate(): React.ReactElement {
	const navigate = useNavigate();
	const [part] = useState<PartInput>(EMPTY_PART);
	const [error, setError] = useState("");

	useEffect(() => {
		document.title = "New Part";
	}, []);

	async function handleCreate(): Promise<void> {
		const message = partInputError(part);
		if (message !== null) {
			setError(message);
			return;
		}

		try {
			const id = await createPart(part);
			await navigate(`/part/${id}`);
		} catch (err: unknown) {
			if (err instanceof Error) {
				setError(err.message);
				return;
			}
			setError("Could not create the part.");
		}
	}

	return (
		<>
			<Header name="New Part" back="#/" />
			{error === "" ? null : <p>{error}</p>}
			<button
				type="button"
				onClick={() => {
					void handleCreate();
				}}
			>
				Create part
			</button>
		</>
	);
}

export default PartCreate;
