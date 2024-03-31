import './App.css'
import React, {useState} from "react";

function ViewDataset() {
    const [insertResultMsg, setInsertResultMsg] = useState("");
    const [isError, setIsError] = useState(false);

    async function handleView(event) {
        event.preventDefault();

        try {
            const response = await fetch(`http://localhost:4321/datasets`, {
                method: 'GET'
            });

            const messageElement = document.getElementById("insertViewDataset");
            if (response.ok) {
                const responseData = await response.json();

                messageElement.textContent = "Data listed successfully!";
                setInsertResultMsg(JSON.stringify(responseData.result));
            } else {
                const errorMessage = await response.json();
                console.error(errorMessage);

                messageElement.textContent = "Error removing data!";
                setIsError(true);
                setInsertResultMsg("Error removing data!");

            }
        } catch (err) {
            console.log("ERRORRRRRRRR");
            console.log(err);
            setIsError(true);
            setInsertResultMsg("Error removing data!");
        }
    }

    return (
        <div className={"my-form"} id="viewDiv">
            <h1>View Datasets</h1>
            <button className={"form-control"} type="submit" onClick={handleView}>
                View
            </button>
            <div id="insertViewDataset" className={isError ? "error" : "noError"}>{insertResultMsg}</div>
        </div>

    );
}


export default ViewDataset;
