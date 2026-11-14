import ReactDOM from "react-dom/client";

import { Login } from "./parts/Login";
import PartCreate from "./routes/partCreate";
import { HashRouter, Navigate, Outlet, Routes, Route } from "react-router-dom";

const rootElement = document.getElementById("root") as HTMLElement;
const root = ReactDOM.createRoot(rootElement);

// Debounce alerting for less annoyance
window.alert = (function () {
	const alert = window.alert;
	let id: number;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let lastMessage: any[] = [];
	const DEBOUNCE_WINDOW = 500;

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	return function (message: any) {
		clearTimeout(id);

		if (!lastMessage.includes(message)) {
			lastMessage.push(message);
		}

		id = setTimeout(function () {
			if (!lastMessage.length) {
				return;
			}

			alert(lastMessage.join("\n"));
			lastMessage = [];
		}, DEBOUNCE_WINDOW);
	};
})();

function RequireAuth(): React.ReactElement {
	const signedIn = sessionStorage.getItem("signedIn") === "1";
	if (!signedIn) {
		return <Navigate to="/login" replace />;
	}
	return <Outlet />;
}

function App(): React.ReactElement {
	return (
		<HashRouter>
			<Routes>
				<Route path="/login" element={<Login />} />
				<Route element={<RequireAuth />}>
					<Route path="/" />
					{/*
						TODO /partlookup: mount PartLookupPage. It calls searchParts() and getPartFilterOptions().
						TODO /part/:partID: mount PartPage. It calls getPart().
					*/}
					<Route path="/partlookup" />
					<Route path="/part/create" element={<PartCreate />} />
					<Route path="/part/:partID" />
					<Route path="/part/:partID/edit" />
					<Route path="/part/:partID/:specialID" />
					<Route path="/part/:partID/:specialID/edit" />
					<Route path="/images" />
					<Route path="/images/:imageID" />
					<Route path="/bom" />
					<Route path="/" />
				</Route>
			</Routes>
		</HashRouter>
	);
}

root.render(<App />);

window.addEventListener("error", (event) => {
	window.alert(event.message);
});

window.addEventListener("unhandledrejection", (event) => {
	window.alert(event);
});
