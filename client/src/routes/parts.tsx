export const DATA_COLUMNS = {
	"": {
		"Part ID": "id",
		"Subteam Association": "subteam",
		"Part Name": "name",
		"Manufacturer Part Name": "manufacturer_name",
		Manufacturer: "manufacturer",
		"Part Number": "part_number",
		"Part Categories": "categories",
		"Part Purchase Link": "purchase_link",
		"Part Description": "description",
		"Part Location": "location",
		"Part Quantity": "quantity",
		"part isSpecial": "is_special",
	},
} as const;

export const PART_LOOKUP_COLUMNS = {
	"": {
		"Part Name": "name",
		"Part Purchase Link": "purchase_link",
		"Part Quantity": "quantity",
	},
} as const;
