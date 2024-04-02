import './App.css'
import React, { useEffect, useState } from 'react';


function AddDataset() {
    // for testing purposes to see that data was added successfully
    const [insertResultMsg, setInsertResultMsg] = useState("");
    const [isError, setIsError] = useState(false);


     async function handleSubmit(event) {
        event.preventDefault();

        const datasetId = document.getElementById("datasetId").value;
        const datasetKind = document.getElementById("datasetKind").value;
        const datasetFileInput = document.getElementById("datasetFile");
        const datasetContent = datasetFileInput.files[0];

         try {
             const fileBlob = new Blob([datasetContent]);
             const requestOptions = {
                 method: 'PUT',
                 headers: {
                     'Content-Type': 'application/octet-stream', // Set the content type as binary
                 },
                 body: fileBlob,
             };
             const response = await fetch(`http://localhost:4321/dataset/${datasetId}/${datasetKind}`, requestOptions);

             const messageElement = document.getElementById("insertAddDatasetMsg");
             if (response.ok) {
                 await response.json();

                 messageElement.textContent = "Data inserted successfully!";
                 setInsertResultMsg("SUCCESS \n You Entered: " + datasetId);

                 document.getElementById("datasetId").value = "";
                 document.getElementById("datasetKind").value = "";
             } else {
                 const errorMessage = await response.json();
                 console.error(errorMessage);

                 messageElement.textContent = "Error inserting data!";
                 setIsError(true);
                 setInsertResultMsg("Error inserting data!");

             }
         } catch (err) {
             console.log("ERRORRRRRRRR");
             console.log(err);
             setIsError(true);
             setInsertResultMsg("Error inserting data!");
         }
    };

    useEffect(() => {
        document.getElementById("addForm").addEventListener("submit", handleSubmit);
        return () => {
            document.getElementById("addForm").removeEventListener("submit", handleSubmit);
        };
    }, []);

    return (
        <div style={{marginBottom: '50px'}}>
            <form className={"my-form"}
                // onSubmit={handleSubmit}
                  id="addForm"
            >
                <h1>Add Dataset</h1>

                <label htmlFor="datasetId">Dataset ID:</label><br/>
                <input
                    // className={"form-control"}
                    type="text"
                    id="datasetId"
                    placeholder="Enter dataset ID"
                /><br/>

                <label htmlFor="datasetKind">Dataset Kind:</label><br/>
                <input
                    // className={"form-control"}
                    type="text"
                    id="datasetKind"
                    placeholder="Enter 'sections' or 'rooms'"
                /><br/>

                <input
                    className={"form-control"}
                    type="file"
                    id="datasetFile"
                    name="filename"
                /><br/>

                <button className={"form-control"} type="submit">
                    Add
                </button>

                <div id="insertAddDatasetMsg" className={isError ? "error" : "noError"}>{insertResultMsg}</div>
            </form>


        </div>
    );
}


export default AddDataset;
