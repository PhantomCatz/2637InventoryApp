// TODO: Part lookup.
// - Search part name, manufacturer part name, subteam, category CSV, part number, and part id.
// - Filters for subteam, manufacturer, and is_special come from getPartFilterOptions().
// - Category filters are a CSV. categoriesContain() is true when every filter word is in part.categories. Order does not matter.
// - searchParts() loads matches. listParts() covers an empty search. partMatches() filters a list already in memory.
// - Show PART_LOOKUP_COLUMNS: part name, purchase link, and quantity.
// - A row opens #/part/:id, which loads getPart().

function PartLookupPage(): React.ReactElement {
	return <></>;
}

export default PartLookupPage;
