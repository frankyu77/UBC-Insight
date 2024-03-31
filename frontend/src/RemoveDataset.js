import './App.css'
import React, { useState } from 'react';

function RemoveDataset() {

    // State to hold the input value
    const [inputValue, setInputValue] = useState('');
    // Set the document title using useEffect

    // Function to update state based on input changes
    const handleInputChange = (event) => {
        setInputValue(event.target.value);
    };

    // Function to handle form submission
    const handleSubmit = (event) => {
        event.preventDefault(); // Prevents the default form submit action
        console.log(inputValue); // Do something with the input value
        // For example, send it to a server or display it somewhere
    };



    return (
        <>
            <div style={{marginBottom: '50px'}}>
                <form className={"my-form"}
                      onSubmit={handleSubmit}>
                    <h1>Remove Dataset</h1>
                    <label htmlFor="datasetId">Dataset ID:</label><br/>
                    <input
                        className={"form-control"}
                        type="text"
                        value={inputValue}
                        onChange={handleInputChange}
                    /><br/>
                    <input
                        className={"form-control"}
                        type="submit"
                        value="Remove"
                    />
                </form>
            </div>
        </>

    );
}


export default RemoveDataset;
