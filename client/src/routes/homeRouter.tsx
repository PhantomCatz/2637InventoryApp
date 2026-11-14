import "../public/stylesheets/homeRouter.css";
import { useEffect } from "react";
import Header from "../parts/header";

type Props = {
	title: string;
};

function HomeRouter(props: Props): React.ReactElement {
	useEffect(() => {
		document.title = props.title;
	}, [props.title]);

	return (
		<>
			<Header name={"Inventory App"} />

			<home-router>
				<a className="homeButton" href="#part/create">
					New Part
				</a>
				<a className="homeButton" href="#partlookup">
					Part Lookup
				</a>
			</home-router>
		</>
	);
}

export default HomeRouter;
