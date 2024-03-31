    import './App.css'
    import React, { useState } from 'react';

    function AddDataset() {

        const [datasetId, setDatasetId] = useState('');
        const [datasetType, setDatasetType] = useState('');

        // Function to update state based on input changes
        const handleDatasetIdChange = (event) => {
            setDatasetId(event.target.value);
        };

        const handleDatasetTypeChange = (event) => {
            setDatasetType(event.target.value);
        };

        // Function to handle form submission
        const handleSubmit = (event) => {
            event.preventDefault(); // Prevents the default form submit action
            console.log(datasetId);
            console.log(datasetType);
        };



        return (
            <>
            <div style={{ marginBottom: '50px' }}>
                <form className={"my-form"}
                      onSubmit={handleSubmit}>
                    <h1>Add Dataset</h1>
                    <label htmlFor="datasetId">Dataset ID:</label><br/>
                    <input
                        className={"form-control"}
                        type="text"
                        value={datasetId}
                        onChange={handleDatasetIdChange}
                    /><br/>
                    <label htmlFor="datasetKind">Dataset Kind:</label><br/>
                    <input
                        className={"form-control"}
                        type="text"
                        value={datasetType}
                        onChange={handleDatasetTypeChange}
                    /><br/>
                    <input
                        className={"form-control"}
                        type="file"
                        id="myFile"
                        name="filename"
                    /><br/>
                    <input
                        className={"form-control"}
                        type="submit"
                        value="Add"
                    />
                </form>
            </div>
            </>

        );
    }


    export default AddDataset;
