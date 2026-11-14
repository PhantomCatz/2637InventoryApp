import "dotenv/config";
import express from "express";
import { requestDatabase, submitData } from "./database.ts";
import { registerPartRoutes } from "./partRoutes.ts";
import type { TableName } from "./types/database.ts";

const API_BASE_URL = "/api/";
const API_GET_ENDPOINTS: {
	[endpointUrl: string]: string | [string, string[]];
} = {
	"partDetails/:partID":[
		`SELECT * FROM parts WHERE id=?`,
		["partID"],
	],
	"isSpecial/:partID": [
		`SELECT is_special FROM parts WHERE id=?;`,
		["partID"],
	],
	"partDetails/:partID/:specialID":[
		`SELECT * FROM special_parts WHERE partID=? and id=?`,
		["partID", "specialID"],
	],
	"parts/all": `SELECT * FROM parts`,
	"parts/:subteam": [
		`SELECT * FROM parts WHERE subteam=?`,
		["subteam"]
	],
	
};
// TODO: figure out typing so that server can easily match client (tRPC?)
const API_POST_ENDPOINTS: {
	[endpointUrl: string]: TableName | ((data: unknown) => Promise<unknown>);
} = {
	"part/special/": "special_parts"
};

// eslint-disable-next-line @typescript-eslint/no-magic-numbers
const PORT = process.env.SERVER_PORT || 3001;

const app = express();

app.use(
	express.json({
		limit: "16mb",
	}),
);

app.use((_request, response, next) => {
	//TODO: should this be removed?
	response.header("Access-Control-Allow-Origin", "*");
	response.header(
		"Access-Control-Allow-Headers",
		"Origin, X-Requested-With, Content-Type, Accept",
	);
	next();
});

app.listen(PORT, () => {
	console.info(`Server listening on ${PORT}`);
});

registerPartRoutes(app);

for (const [endpoint, items] of Object.entries(API_GET_ENDPOINTS)) {
	const endpointUrl = API_BASE_URL + endpoint;
	console.info(`Lisenting to GET at: ${endpointUrl}`);

	const [query, substitutions] =
		typeof items === "string" ? [items, []] : [items[0], items[1]];

	app.get(endpointUrl, async function (request, response) {
		let result;

		const substitutionValues = substitutions.map(
			(parameter) => request.params[parameter],
		);

		console.info(
			`GET ${endpointUrl} with ${substitutions.map((parameter) => `${parameter}=${request.params[parameter]}`).join(", ")}`,
		);

		try {
			result = await requestDatabase(query, {
				substitution: substitutionValues,
			});
		} catch (err) {
			console.error(`ERROR: `, err);

			// eslint-disable-next-line @typescript-eslint/no-magic-numbers
			response.status(500);
			response.json(null);
			return response;
		}

		if (result === null) {
			// eslint-disable-next-line @typescript-eslint/no-magic-numbers
			response.status(500);
		}

		response.json(result);
		return response;
	});
}

for (const [endpoint, items] of Object.entries(API_POST_ENDPOINTS)) {
	const endpointUrl = API_BASE_URL + endpoint;
	console.info(`Lisenting to POST at: ${endpointUrl}`);

	app.post(endpointUrl, async function (request, response) {
		let result;

		const data = request.body as unknown;

		try {
			if (typeof items === "string") {
				if (!(typeof data === "object") || data === null) {
					// eslint-disable-next-line @typescript-eslint/no-magic-numbers
					response.status(400);
					response.json(null);
					return response;
				}

				result = await submitData(data, items);
			} else {
				result = await items(data);
			}
		} catch (err) {
			console.error(`ERROR: `, err);

			// eslint-disable-next-line @typescript-eslint/no-magic-numbers
			response.status(500);
			response.json(null);
			return response;
		}

		if (result === null) {
			// eslint-disable-next-line @typescript-eslint/no-magic-numbers
			response.status(500);
		}

		response.json(result);
		return response;
	});
}
