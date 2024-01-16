import {IInsightFacade, InsightDataset, InsightDatasetKind, InsightError, InsightResult} from "./IInsightFacade";
export default class InsightFacade implements IInsightFacade {
    addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {

        //stub
        // return new Promise<string[]> ((resolve) => {
        //     let test: string[] = [];
        //     test.push(id);
        //     resolve(test);
        // })
        return Promise.resolve([id]);
        //throw new InsightError("errrrrr");
    }

    removeDataset(id: string): Promise<string> {

        //stub
        // return new Promise<string> ((resolve) => {
        //     resolve("");
        // });
        //return Promise.resolve(id);
        throw new InsightError("remove error");
    }

    performQuery(query: unknown): Promise<InsightResult[]> {

        //stub
        // return new Promise<InsightResult[]> ((resolve) => {
        //    let test: InsightResult[] = [];
        //    resolve(test);
        // });
        return Promise.resolve(
            [
                { "sections_dept": "math", "sections_avg": 97.09 },
                { "sections_dept": "math", "sections_avg": 97.09 },
                { "sections_dept": "epse", "sections_avg": 97.09 },
                { "sections_dept": "epse", "sections_avg": 97.09 },
                { "sections_dept": "math", "sections_avg": 97.25 },
                { "sections_dept": "math", "sections_avg": 97.25 },
                { "sections_dept": "epse", "sections_avg": 97.29 },
                { "sections_dept": "epse", "sections_avg": 97.29 },
                { "sections_dept": "nurs", "sections_avg": 97.33 },
                { "sections_dept": "nurs", "sections_avg": 97.33 },
                { "sections_dept": "epse", "sections_avg": 97.41 },
                { "sections_dept": "epse", "sections_avg": 97.41 },
                { "sections_dept": "cnps", "sections_avg": 97.47 },
                { "sections_dept": "cnps", "sections_avg": 97.47 },
                { "sections_dept": "math", "sections_avg": 97.48 },
                { "sections_dept": "math", "sections_avg": 97.48 },
                { "sections_dept": "educ", "sections_avg": 97.5 },
                { "sections_dept": "nurs", "sections_avg": 97.53 },
                { "sections_dept": "nurs", "sections_avg": 97.53 },
                { "sections_dept": "epse", "sections_avg": 97.67 },
                { "sections_dept": "epse", "sections_avg": 97.69 },
                { "sections_dept": "epse", "sections_avg": 97.78 },
                { "sections_dept": "crwr", "sections_avg": 98 },
                { "sections_dept": "crwr", "sections_avg": 98 },
                { "sections_dept": "epse", "sections_avg": 98.08 },
                { "sections_dept": "nurs", "sections_avg": 98.21 },
                { "sections_dept": "nurs", "sections_avg": 98.21 },
                { "sections_dept": "epse", "sections_avg": 98.36 },
                { "sections_dept": "epse", "sections_avg": 98.45 },
                { "sections_dept": "epse", "sections_avg": 98.45 },
                { "sections_dept": "nurs", "sections_avg": 98.5 },
                { "sections_dept": "nurs", "sections_avg": 98.5 },
                { "sections_dept": "nurs", "sections_avg": 98.58 },
                { "sections_dept": "nurs", "sections_avg": 98.58 },
                { "sections_dept": "epse", "sections_avg": 98.58 },
                { "sections_dept": "epse", "sections_avg": 98.58 },
                { "sections_dept": "epse", "sections_avg": 98.7 },
                { "sections_dept": "nurs", "sections_avg": 98.71 },
                { "sections_dept": "nurs", "sections_avg": 98.71 },
                { "sections_dept": "eece", "sections_avg": 98.75 },
                { "sections_dept": "eece", "sections_avg": 98.75 },
                { "sections_dept": "epse", "sections_avg": 98.76 },
                { "sections_dept": "epse", "sections_avg": 98.76 },
                { "sections_dept": "epse", "sections_avg": 98.8 },
                { "sections_dept": "spph", "sections_avg": 98.98 },
                { "sections_dept": "spph", "sections_avg": 98.98 },
                { "sections_dept": "cnps", "sections_avg": 99.19 },
                { "sections_dept": "math", "sections_avg": 99.78 },
                { "sections_dept": "math", "sections_avg": 99.78 }
            ]
        )
    }

    listDatasets(): Promise<InsightDataset[]>{

        //stub
        // return new Promise<InsightDataset[]> ((resolve) => {
        //     let test: InsightDataset[] = [];
        //     resolve(test);
        // });
        //return Promise.resolve([{id: "ubc", kind: InsightDatasetKind.Sections, numRows: 64612}]);
        return Promise.resolve([]);

    }
}