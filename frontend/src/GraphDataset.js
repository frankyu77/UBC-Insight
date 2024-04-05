import React, { useState } from "react";
import HorizontalGraph from "./graphs/horizontalGraph";
import LineGraph from "./graphs/lineGraph";
import PieChart from "./graphs/PieChart"

function GraphDataset() {
    const [horizontalGraphData, setHorizontalGraphData] = useState([]);
    const [lineGraphData, setLineGraphData] = useState([]);
    const [pieChartData, setPieChartData] = useState([]);
    const [datasetID, setDatsetID] = useState("");
    const [IDMsg, setIDMsg] = useState("");
    const [graphMsg, setGraphMsg] = useState("");


    const handleAvgs = async (event) => {
        event.preventDefault();

        const query = `{ "WHERE": {}, "OPTIONS": { "COLUMNS": [ "${datasetID}_dept", "overallAvg" ], "ORDER": { "dir": "UP", "keys": [ "${datasetID}_dept", "overallAvg" ] } }, "TRANSFORMATIONS": { "GROUP": [ "${datasetID}_dept" ], "APPLY": [ { "overallAvg": { "AVG": "${datasetID}_avg" } } ] } }`;

        try {
            const response = await fetch(`http://localhost:4321/query`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ query: query })
            });

            const messageElement = document.getElementById("insertGraphMsg");
            if (response.ok) {
                const responseData = await response.json();
                setHorizontalGraphData(responseData.result);



                messageElement.textContent = "Graph Successful";
                setGraphMsg("Graph Successful");

            } else {
                console.error(await response.json());
                setHorizontalGraphData([]);

                messageElement.textContent = "Invalid ID";
                setGraphMsg("Invalid ID");
            }
        } catch (err) {
            console.error(err);
            setHorizontalGraphData([]);

            const messageElement = document.getElementById("insertGraphMsg");
            messageElement.textContent = "Invalid ID";
            setGraphMsg("Invalid ID");
        }
    };

    const handleFails = async (event) => {
        event.preventDefault();

        // const query = "{ \"WHERE\": { \"GT\": { \"sections_fail\": 0 } }, \"OPTIONS\": { \"COLUMNS\": [ \"sections_dept\", \"sections_year\", \"numFails\" ], \"ORDER\": { \"dir\": \"UP\", \"keys\": [ \"numFails\", \"sections_dept\", \"sections_year\" ] } }, \"TRANSFORMATIONS\": { \"GROUP\": [ \"sections_dept\", \"sections_year\" ], \"APPLY\": [ { \"numFails\": { \"SUM\": \"sections_fail\" } } ] } }";
        // const query = "{ \"WHERE\": { \"GT\": { \"sections_fail\": 100 } }, \"OPTIONS\": { \"COLUMNS\": [ \"sections_dept\", \"sections_year\", \"sections_fail\" ], \"ORDER\": { \"dir\": \"UP\", \"keys\": [ \"sections_dept\", \"sections_fail\", \"sections_year\" ] } } }";
        // const query = "{ \"WHERE\": { \"AND\": [ { \"GT\": { \"sections_fail\": 10 } }, { \"NOT\": { \"EQ\": { \"sections_year\": 1900 } } } ] }, \"OPTIONS\": { \"COLUMNS\": [ \"sections_dept\", \"sections_year\", \"sections_fail\" ], \"ORDER\": { \"dir\": \"UP\", \"keys\": [ \"sections_dept\", \"sections_year\" ] } } }";
        // const query = "{ \"WHERE\": { \"AND\": [ { \"NOT\": { \"EQ\": { \"sections_year\": 1900 } } }, { \"GT\": { \"sections_fail\": 50 } } ] }, \"OPTIONS\": { \"COLUMNS\": [ \"sections_dept\", \"sections_year\", \"sumFail\" ], \"ORDER\": { \"dir\": \"UP\", \"keys\": [ \"sections_dept\", \"sections_year\" ] } }, \"TRANSFORMATIONS\": { \"GROUP\": [ \"sections_dept\", \"sections_year\" ], \"APPLY\": [ { \"sumFail\": { \"SUM\": \"sections_fail\" } } ] } }";
        // const query = "{ \"WHERE\": { \"AND\": [ { \"NOT\": { \"EQ\": { \"sections_year\": 1900 } } }, { \"GT\": { \"sections_fail\": 50 } } ] }, \"OPTIONS\": { \"COLUMNS\": [ \"sections_dept\", \"sections_year\", \"sumFail\" ], \"ORDER\": { \"dir\": \"UP\", \"keys\": [ \"sections_dept\", \"sections_year\", \"sumFail\" ] } }, \"TRANSFORMATIONS\": { \"GROUP\": [ \"sections_dept\", \"sections_year\" ], \"APPLY\": [ { \"sumFail\": { \"SUM\": \"sections_fail\" } } ] } }";
        const query = `{ "WHERE": { "AND": [ { "NOT": { "EQ": { "${datasetID}_year": 1900 } } }, { "GT": { "${datasetID}_fail": 50 } } ] }, "OPTIONS": { "COLUMNS": [ "${datasetID}_dept", "${datasetID}_year", "sumFail" ], "ORDER": { "dir": "UP", "keys": [ "${datasetID}_year", "sumFail" ] } }, "TRANSFORMATIONS": { "GROUP": [ "${datasetID}_dept", "${datasetID}_year" ], "APPLY": [ { "sumFail": { "SUM": "${datasetID}_fail" } } ] } }`;
        try {
            const response = await fetch(`http://localhost:4321/query`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ query: query })
            });

            const messageElement = document.getElementById("insertGraphMsg");

            if (response.ok) {
                const responseData = await response.json();
                setLineGraphData(responseData.result);

                messageElement.textContent = "Graph Successful";
                setGraphMsg("Graph Successful");
            } else {
                console.error(await response.json());
                setLineGraphData([]);

                messageElement.textContent = "Invalid ID";
                setGraphMsg("Invalid ID");
            }
        } catch (err) {
            console.error(err);
            setLineGraphData([]);

            const messageElement = document.getElementById("insertGraphMsg");
            messageElement.textContent = "Invalid ID";
            setGraphMsg("Invalid ID");
        }
    }

    const handleCourses = async (event) => {
        event.preventDefault();

        const query = `{ "WHERE": {}, "OPTIONS": { "COLUMNS": [ "${datasetID}_dept", "count" ], "ORDER": { "dir": "UP", "keys": [ "count", "${datasetID}_dept" ] } }, "TRANSFORMATIONS": { "GROUP": [ "${datasetID}_dept" ], "APPLY": [ { "count": { "COUNT": "${datasetID}_uuid" } } ] } }`;

        try {
            const response = await fetch(`http://localhost:4321/query`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ query: query })
            });

            const messageElement = document.getElementById("insertGraphMsg");

            if (response.ok) {
                const responseData = await response.json();
                setPieChartData(responseData.result);

                messageElement.textContent = "Graph Successful";
                setGraphMsg("Graph Successful");
            } else {
                console.error(await response.json());
                setPieChartData([]);

                messageElement.textContent = "Invalid ID";
                setGraphMsg("Invalid ID");
            }
        } catch (err) {
            console.error(err);
            setPieChartData([]);

            const messageElement = document.getElementById("insertGraphMsg");
            messageElement.textContent = "Invalid ID";
            setGraphMsg("Invalid ID");
        }
    }

    const setID = async (event) => {
        event.preventDefault();

        const id = document.getElementById("datasetQueryID").value;
        const messageElement = document.getElementById("insertIDMsg");

        setDatsetID(id);
        messageElement.textContent = "Data ID inputted successfully";
        setIDMsg("Data ID inputted successfully")

    }

    // useEffect(() => {
    //     document.getElementById("graphForm").addEventListener("submit", handleAvgs);
    //     document.getElementById("avgButton").addEventListener("click", handleAvgs);
    //     // document.getElementById("coursesButton").addEventListener("click", handleCourses);
    //     // document.getElementById("failsButton").addEventListener("click", handleFails);
    //
    //     return () => {
    //         document.getElementById("graphForm").removeEventListener("submit", handleAvgs);
    //         document.getElementById("avgButton").removeEventListener("click", handleAvgs);
    //         // document.getElementById("coursesButton").removeEventListener("click", handleCourses);
    //         // document.getElementById("failsButton").removeEventListener("click", handleFails);
    //     };
    // }, []);

    const clearGraphData = () => {
        setHorizontalGraphData([]);
        setPieChartData([]);
        setLineGraphData([]);
    };

    console.log("Rendering QueryDataset");

    return (
        <div style={{marginBottom: '50px'}}>

            <form className={"my-form"} id="queryForm">



                {/*<div id="insertQueryDatasetMsg" className={isError ? "error" : "noError"}>{insertResultMsg}</div>*/}

            </form>

            <form className={"graph-form"} id="graphForm">
                <h1>Graph Dataset</h1>
                <label htmlFor="datasetId">Enter in the dataset you would like to graph:</label><br/>
                <input
                    type="text"
                    id="datasetQueryID"
                    placeholder="Enter dataset ID"
                /><br/>

                <button className={"form-control"} onClick={setID}>
                    Enter
                </button>

                <div id="insertIDMsg" style={{paddingBottom: "8px"}}>{IDMsg}</div>


                <div className="button-container">
                    <button id={"avgButton"} className={"form-control"} type="button" onClick={handleAvgs}>
                        Click to see all departments and their averages!
                    </button>

                    <button id={"coursesButton"} className={"form-control"} type="button" onClick={handleCourses}>
                        Click to see number of courses offered by each dept!
                    </button>

                    <button id={"failsButton"} className={"form-control"} type="button" onClick={handleFails}>
                        Click to see number of fails for departments over the years!
                    </button>
                </div>

                <div id="insertGraphMsg" style={{paddingBottom: "8px"}}>{graphMsg}</div>

            </form>
            <button className={"clearButton"} onClick={clearGraphData}>
                Clear Graph
            </button>
            <div>
                {horizontalGraphData.length > 0 && <HorizontalGraph alphabet={horizontalGraphData} datasetID = {datasetID}/>}
            </div>
            <div>
                {pieChartData.length > 0 && <PieChart data={pieChartData} datasetID = {datasetID}/>}
            </div>
            <div>
                {lineGraphData.length > 0 && <LineGraph data={lineGraphData} datasetID = {datasetID}/>}
            </div>
        </div>
    );
}

export default GraphDataset;
