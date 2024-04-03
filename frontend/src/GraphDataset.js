import React, { useState } from "react";
import HorizontalGraph from "./graphs/horizontalGraph";
import LineGraph from "./graphs/lineGraph";

function GraphDataset() {
    const [horizontalGraphData, setHorizontalGraphData] = useState([]);
    const [lineGraphData, setLineGraphData] = useState([]);


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
                setHorizontalGraphData(responseData.result);
            } else {
                console.error(await response.json());
                setHorizontalGraphData([]);
            }
        } catch (err) {
            console.error(err);
            setHorizontalGraphData([]);
        }
    };

    const handleFails = async (event) => {
        event.preventDefault();

        // const query = "{ \"WHERE\": { \"GT\": { \"sections_fail\": 0 } }, \"OPTIONS\": { \"COLUMNS\": [ \"sections_dept\", \"sections_year\", \"numFails\" ], \"ORDER\": { \"dir\": \"UP\", \"keys\": [ \"numFails\", \"sections_dept\", \"sections_year\" ] } }, \"TRANSFORMATIONS\": { \"GROUP\": [ \"sections_dept\", \"sections_year\" ], \"APPLY\": [ { \"numFails\": { \"SUM\": \"sections_fail\" } } ] } }";
        // const query = "{ \"WHERE\": { \"GT\": { \"sections_fail\": 100 } }, \"OPTIONS\": { \"COLUMNS\": [ \"sections_dept\", \"sections_year\", \"sections_fail\" ], \"ORDER\": { \"dir\": \"UP\", \"keys\": [ \"sections_dept\", \"sections_fail\", \"sections_year\" ] } } }";
        // const query = "{ \"WHERE\": { \"AND\": [ { \"GT\": { \"sections_fail\": 10 } }, { \"NOT\": { \"EQ\": { \"sections_year\": 1900 } } } ] }, \"OPTIONS\": { \"COLUMNS\": [ \"sections_dept\", \"sections_year\", \"sections_fail\" ], \"ORDER\": { \"dir\": \"UP\", \"keys\": [ \"sections_dept\", \"sections_year\" ] } } }";
        const query = "{ \"WHERE\": { \"AND\": [ { \"NOT\": { \"EQ\": { \"sections_year\": 1900 } } }, { \"GT\": { \"sections_fail\": 0 } } ] }, \"OPTIONS\": { \"COLUMNS\": [ \"sections_dept\", \"sections_year\", \"sumFail\" ], \"ORDER\": { \"dir\": \"UP\", \"keys\": [ \"sections_dept\", \"sections_year\" ] } }, \"TRANSFORMATIONS\": { \"GROUP\": [ \"sections_dept\", \"sections_year\" ], \"APPLY\": [ { \"sumFail\": { \"SUM\": \"sections_fail\" } } ] } }";
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
                setLineGraphData(responseData.result);
            } else {
                console.error(await response.json());
                setLineGraphData([]);
            }
        } catch (err) {
            console.error(err);
            setLineGraphData([]);
        }
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
        setLineGraphData([]);
    };

    console.log("Rendering QueryDataset");

    return (
        <div style={{marginBottom: '50px'}}>
            <form className={"graph-form"} id="graphForm">
                <h1>Graph Dataset</h1>
                <div className="button-container">
                    <button id={"avgButton"} className={"form-control"} type="button" onClick={handleAvgs}>
                        Click to see all departments and their averages!
                    </button>

                    <button id={"coursesButton"} className={"form-control"} type="button">
                        Click to see number of courses offered by each dept!
                    </button>

                    <button id={"failsButton"} className={"form-control"} type="button" onClick={handleFails}>
                        Click to see number of fails for departments over the years!
                    </button>
                </div>

            </form>
            <button className={"clearButton"} onClick={clearGraphData}>
                Clear Graph
            </button>
            <div>
                {horizontalGraphData.length > 0 && <HorizontalGraph alphabet={horizontalGraphData}/>}
            </div>
            <div>
                {lineGraphData.length > 0 && <LineGraph data={lineGraphData}/>}
            </div>
        </div>
    );
}

export default GraphDataset;
