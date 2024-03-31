import './App.css'
import React, {useEffect, useState} from "react";

function RemoveDataset() {
    const [insertResultMsg, setInsertResultMsg] = useState("");
    const [isError, setIsError] = useState(false);

    async function handleRemove(event) {
        event.preventDefault();

        const removeID = document.getElementById("datasetIDToRemove").value;

        try {
            const response = await fetch(`http://localhost:4321/dataset/${removeID}`, {
                method: 'DELETE'
            });

            const messageElement = document.getElementById("insertRemoveDatasetMsg");
            if (response.ok) {
                const responseData = await response.json();

                messageElement.textContent = "Data removed successfully!";
                setInsertResultMsg("You SUCCESSFULLY REMOVED: " + responseData.result);

                document.getElementById("datasetIDToRemove").value = "";
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


    useEffect(() => {
        document.getElementById("removeForm").addEventListener("submit", handleRemove);
        return () => {
            document.getElementById("removeForm").removeEventListener("submit", handleRemove);
        };
    }, []);

    return (
        <div style={{marginBottom: '50px'}}>
            <form className={"my-form"}
                  id="removeForm">
                <h1>Remove Dataset</h1>
                <label htmlFor="datasetId">Dataset ID:</label><br/>
                <input
                    type="text"
                    id="datasetIDToRemove"
                    placeholder="Enter dataset ID to remove"
                /><br/>
                <button className={"form-control"} type="submit">
                    Remove
                </button>
                <div id="insertRemoveDatasetMsg" className={isError ? "error" : "noError"}>{insertResultMsg}</div>
            </form>


        </div>

    );
}


export default RemoveDataset;
