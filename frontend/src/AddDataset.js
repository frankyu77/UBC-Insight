import './App.css'
import React, { useEffect, useState } from 'react';


function AddDataset() {

    // Function to handle form submission
     function handleSubmit(event) {
        event.preventDefault(); // Prevents the default form submit action

        const datasetId = document.getElementById("datasetID").value;
        const datasetKind = document.getElementById("datasetKind").value;

        console.log(datasetId);
        console.log(datasetKind);
    };

    useEffect(() => {
        document.getElementById("addForm").addEventListener("submit", handleSubmit);
    }, []);

    return (
        <>
        <div style={{ marginBottom: '50px' }}>
            <form className={"my-form"}
                  onSubmit={handleSubmit}
                  id = "addForm"
            >
                <h1>Add Dataset</h1>
                <label htmlFor="datasetId">Dataset ID:</label><br/>
                <input
                    className={"form-control"}
                    type="text"
                    id = "datasetId"
                /><br/>
                <label htmlFor="datasetKind">Dataset Kind:</label><br/>
                <input
                    className={"form-control"}
                    type="text"
                    id = "datasetKind"
                /><br/>
                <input
                    className={"form-control"}
                    type="file"
                    id="myFile"
                    name="filename"
                /><br/>
                <button
                    className={"form-control"}
                    type="submit">
                    Add
                </button>
            </form>
        </div>
        </>

    );
}


export default AddDataset;
