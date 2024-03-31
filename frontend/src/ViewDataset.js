import './App.css'
import React, { useState } from 'react';

function ViewDataset() {

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
            <div
                className={"my-form"}>
                <h1>View Datasets</h1>
                <input
                    className={"form-control"}
                    type="submit"
                    value="View"
                />
            </div>
        </>

    );
}


export default ViewDataset;
