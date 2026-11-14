import "./public/stylesheets/partPage.css";
import Header from "../parts/header";

export type PartProps = {
	partID: number;
	isSpecial: boolean;
	specialID: never;
};

export type SpecialPartProps = {
	partID: number;
	isSpecial: boolean;
	specialID: number;
};

export type PartPageProps = PartProps | SpecialPartProps;

function PartPage(props: PartPageProps): React.ReactElement {
	if(props.specialID){
		return (
			<>
            <Header name={"Special Part" + props.partID + " Unit " + props.specialID}/>
			{/*
				TODO display the following details:
				- part name
				- part subteam association
				- part name (team)
				- part purchase link
				- part categories
				- part description
				- unit status
				- unit location
				- unit description
			*/}
			</>
    	);
	}
	if(props.isSpecial){
		return (
			<>
			<Header name={"Part" + props.partID + "("+ /*UNIT QTY*/ "Units)"} />
			
			{/*
				TODO display the following part details:
				- part name
				- part subteam association
				- part manufacturer
				- part purchase link
				- part categories
				- part description
				
				List all units in a table with the following details:
				- unit name
				- unit ID
				- unit photo (low prio)

			*/}
			</>
		);
	}
	return (
		<>
		<h1>Part {props.partID}</h1>
		{/*
			TODO: load this part with getPart(partID) and display:
			- part name
			- part subteam association
			- part manufacturer
			- part purchase link
			- part categories
			- part description
			- part location
		*/}
		</>
	);
}

export default PartPage;
