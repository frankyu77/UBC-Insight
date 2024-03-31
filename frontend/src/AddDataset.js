import './App.css'
import React, { useEffect, useState } from 'react';


function AddDataset() {
    // Function to handle form submission
    const [insertResultMsg, setInsertResultMsg] = useState("");
    const [isError, setIsError] = useState(false);


     async function handleSubmit(event) {
        event.preventDefault(); // Prevents the default form submit action

        const datasetId = document.getElementById("datasetId").value;
        const datasetKind = document.getElementById("datasetKind").value;
        // const datasetContent = document.getElementById("datasetFile").value;

        const datasetFileInput = document.getElementById("datasetFile");

         // Access the selected file from the input element

        const datasetContent = datasetFileInput.files[0];
        console.log(datasetContent);

        console.log(datasetId);
        console.log(datasetKind);
        console.log(datasetContent.name);

         try {
             // const formData = new FormData();
             // // formData.append('file', datasetContent);
             // formData.append('file', datasetContent);
             // formData.append('id', datasetId); // Append other form fields if required
             // formData.append('kind', datasetKind);
             // console.log(formData);

             const fileBlob = new Blob([datasetContent]);
             const requestOptions = {
                 method: 'PUT',
                 headers: {
                     'Content-Type': 'application/octet-stream', // Set the content type as binary
                 },
                 body: fileBlob,
             };
             const response = await fetch(`http://localhost:4321/dataset/${datasetId}/${datasetKind}`, requestOptions);


             // const response = await fetch(`http://localhost:4321/dataset/${datasetId}/${datasetKind}`, {
             //     method: 'PUT',
             //     body: formData
             // })
             console.log("after fetch");

             // const responseData = await response.json();
             // console.log(responseData);

             const messageElement = document.getElementById("insertAddDatasetMsg");
             if (response.ok) {
                 const responseData = await response.json();
                 console.log(responseData);

                 messageElement.textContent = "Data inserted successfully!";
                 setInsertResultMsg("SUCCESS \n You Entered: " + datasetId);
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
                /><br/>

                <label htmlFor="datasetKind">Dataset Kind:</label><br/>
                <input
                    // className={"form-control"}
                    type="text"
                    id="datasetKind"
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
            </form>

            <div id="insertAddDatasetMsg" className={isError ? "error" : "noError"}>{insertResultMsg}</div>

        </div>
    );
}


export default AddDataset;
