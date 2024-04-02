import React, { useEffect, useState } from "react";
import HorizontalGraph from "./graphs/horizontalGraph";

function GraphDataset() {
    const [graphData, setGraphData] = useState([]);


    const handleAvgs = async (event) => {
        event.preventDefault();

        const query = "{ \"WHERE\": {}, \"OPTIONS\": { \"COLUMNS\": [ \"sections_dept\", \"overallAvg\" ], \"ORDER\": { \"dir\": \"UP\", \"keys\": [ \"sections_dept\", \"overallAvg\" ] } }, \"TRANSFORMATIONS\": { \"GROUP\": [ \"sections_dept\" ], \"APPLY\": [ { \"overallAvg\": { \"AVG\": \"sections_avg\" } } ] } }";

        try {
            const response = await fetch(`http://localhost:4321/query`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ query: query })
            });

            if (response.ok) {
                const responseData = await response.json();
                setGraphData(responseData.result);
            } else {
                console.error(await response.json());
                setGraphData([]);
            }
        } catch (err) {
            console.error(err);
            setGraphData([]);
        }
    };


    useEffect(() => {
        document.getElementById("graphForm").addEventListener("submit", handleAvgs);
        document.getElementById("avgButton").addEventListener("click", handleAvgs);
        // document.getElementById("coursesButton").addEventListener("click", handleCourses);
        // document.getElementById("failsButton").addEventListener("click", handleFails);

        return () => {
            document.getElementById("graphForm").removeEventListener("submit", handleAvgs);
            document.getElementById("avgButton").removeEventListener("click", handleAvgs);
            // document.getElementById("coursesButton").removeEventListener("click", handleCourses);
            // document.getElementById("failsButton").removeEventListener("click", handleFails);
        };
    }, []);

    const clearGraphData = () => {
        setGraphData([]);
    };

    console.log("Rendering QueryDataset");

    return (
        <div style={{marginBottom: '50px'}}>
            <form className={"graph-form"} id="graphForm">
                <h1>Graph Dataset</h1>
                <div className="button-container">
                    <button id={"avgButton"} className={"form-control"} type="button">
                        Click to see all departments and their averages!
                    </button>

                    <button id={"coursesButton"} className={"form-control"} type="button">
                        Click to see number of courses offered by each dept!
                    </button>

                    <button id={"failsButton"} className={"form-control"} type="button">
                        Click to see number of fails for departments over the years!
                    </button>
                </div>
                <button className={"clearButton"} onClick={clearGraphData}>
                    Clear Graph
                </button>
            </form>

            <div>
                {graphData.length > 0 && <HorizontalGraph alphabet={graphData}/>}
            </div>
        </div>
    );
}

export default GraphDataset;
