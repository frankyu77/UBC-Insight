import './App.css'
import React, {useEffect, useState} from "react";

function QueryDataset() {
	const [insertResultMsg, setInsertResultMsg] = useState("");
	const [isError, setIsError] = useState(false);

	async function handleQuery(event) {
		event.preventDefault();

		const query = document.getElementById("datasetQuery").value;

		try {
			const response = await fetch(`http://localhost:4321/query`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ query: query })
			});

			const messageElement = document.getElementById("insertQueryDatasetMsg");
			if (response.ok) {
				const responseData = await response.json();

				messageElement.textContent = "Data listed successfully!";
				setInsertResultMsg(JSON.stringify(responseData.result));
			} else {
				const errorMessage = await response.json();
				console.error(errorMessage);

				messageElement.textContent = "Error querying data!";
				setIsError(true);
				setInsertResultMsg("Error querying data!");

			}
		} catch (err) {
			console.log("ERRORRRRRRRR");
			console.log(err);
			setIsError(true);
			setInsertResultMsg("Error querying data!");
		}
	}

	useEffect(() => {
		document.getElementById("queryForm").addEventListener("submit", handleQuery);
		return () => {
			document.getElementById("queryForm").removeEventListener("submit", handleQuery);
		};
	}, []);

	return (
		<div style={{marginBottom: '50px'}}>
			<form className={"my-form"}
				  id="queryForm">

				<h1>Query Dataset</h1>
				<label htmlFor="datasetId">Query:</label><br/>
				<input
					type="text"
					id="datasetQuery"
					placeholder="Enter query"
				/><br/>

				<button className={"form-control"} type="submit">
					Query
				</button>

				<div id="insertQueryDatasetMsg" className={isError ? "error" : "noError"}>{insertResultMsg}</div>

			</form>


		</div>

	);
}


export default QueryDataset;
