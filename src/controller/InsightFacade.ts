import {IInsightFacade, InsightDataset, InsightDatasetKind, InsightError, InsightResult} from "./IInsightFacade";
export default class InsightFacade implements IInsightFacade {
    addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {

        //stub
        // return new Promise<string[]> ((resolve) => {
        //     let test: string[] = [];
        //     test.push(id);
        //     resolve(test);
        // })
        return Promise.resolve(["CPSC110"]);
        // throw new InsightError("errrrrr");
    }

    removeDataset(id: string): Promise<string> {

        //stub
        // return new Promise<string> ((resolve) => {
        //     resolve("");
        // });
        //return Promise.resolve(id);
        throw new InsightError("errrrrr");
    }

    performQuery(query: unknown): Promise<InsightResult[]> {

        //stub
        // return new Promise<InsightResult[]> ((resolve) => {
        //    let test: InsightResult[] = [];
        //    resolve(test);
        // });
        return Promise.resolve(
            [
                { "ubc_dept": "adhe", "ubc_id": "329", "ubc_avg": 90.02 },
                { "ubc_dept": "adhe", "ubc_id": "412", "ubc_avg": 90.16 },
                { "ubc_dept": "adhe", "ubc_id": "330", "ubc_avg": 90.17 },
                { "ubc_dept": "adhe", "ubc_id": "412", "ubc_avg": 90.18 },
                { "ubc_dept": "adhe", "ubc_id": "330", "ubc_avg": 90.5 },
                { "ubc_dept": "adhe", "ubc_id": "330", "ubc_avg": 90.72 },
                { "ubc_dept": "adhe", "ubc_id": "329", "ubc_avg": 90.82 },
                { "ubc_dept": "adhe", "ubc_id": "330", "ubc_avg": 90.85 },
                { "ubc_dept": "adhe", "ubc_id": "330", "ubc_avg": 91.29 },
                { "ubc_dept": "adhe", "ubc_id": "330", "ubc_avg": 91.33 },
                { "ubc_dept": "adhe", "ubc_id": "330", "ubc_avg": 91.33 },
                { "ubc_dept": "adhe", "ubc_id": "330", "ubc_avg": 91.48 },
                { "ubc_dept": "adhe", "ubc_id": "329", "ubc_avg": 92.54 },
                { "ubc_dept": "adhe", "ubc_id": "329", "ubc_avg": 93.33 },
                { "ubc_dept": "sowk", "ubc_id": "570", "ubc_avg": 95 },
                { "ubc_dept": "rhsc", "ubc_id": "501", "ubc_avg": 95 },
                { "ubc_dept": "psyc", "ubc_id": "501", "ubc_avg": 95 },
                { "ubc_dept": "psyc", "ubc_id": "501", "ubc_avg": 95 },
                { "ubc_dept": "obst", "ubc_id": "549", "ubc_avg": 95 },
                { "ubc_dept": "nurs", "ubc_id": "424", "ubc_avg": 95 },
                { "ubc_dept": "nurs", "ubc_id": "424", "ubc_avg": 95 },
                { "ubc_dept": "musc", "ubc_id": "553", "ubc_avg": 95 },
                { "ubc_dept": "musc", "ubc_id": "553", "ubc_avg": 95 },
                { "ubc_dept": "musc", "ubc_id": "553", "ubc_avg": 95 },
                { "ubc_dept": "musc", "ubc_id": "553", "ubc_avg": 95 },
                { "ubc_dept": "musc", "ubc_id": "553", "ubc_avg": 95 },
                { "ubc_dept": "musc", "ubc_id": "553", "ubc_avg": 95 },
                { "ubc_dept": "mtrl", "ubc_id": "599", "ubc_avg": 95 },
                { "ubc_dept": "mtrl", "ubc_id": "564", "ubc_avg": 95 },
                { "ubc_dept": "mtrl", "ubc_id": "564", "ubc_avg": 95 },
                { "ubc_dept": "math", "ubc_id": "532", "ubc_avg": 95 },
                { "ubc_dept": "math", "ubc_id": "532", "ubc_avg": 95 },
                { "ubc_dept": "kin", "ubc_id": "500", "ubc_avg": 95 },
                { "ubc_dept": "kin", "ubc_id": "500", "ubc_avg": 95 },
                { "ubc_dept": "kin", "ubc_id": "499", "ubc_avg": 95 },
                { "ubc_dept": "epse", "ubc_id": "682", "ubc_avg": 95 },
                { "ubc_dept": "epse", "ubc_id": "682", "ubc_avg": 95 },
                { "ubc_dept": "epse", "ubc_id": "606", "ubc_avg": 95 },
                { "ubc_dept": "edcp", "ubc_id": "473", "ubc_avg": 95 },
                { "ubc_dept": "edcp", "ubc_id": "473", "ubc_avg": 95 },
                { "ubc_dept": "econ", "ubc_id": "516", "ubc_avg": 95 },
                { "ubc_dept": "econ", "ubc_id": "516", "ubc_avg": 95 },
                { "ubc_dept": "crwr", "ubc_id": "599", "ubc_avg": 95 },
                { "ubc_dept": "crwr", "ubc_id": "599", "ubc_avg": 95 },
                { "ubc_dept": "crwr", "ubc_id": "599", "ubc_avg": 95 },
                { "ubc_dept": "crwr", "ubc_id": "599", "ubc_avg": 95 },
                { "ubc_dept": "crwr", "ubc_id": "599", "ubc_avg": 95 },
                { "ubc_dept": "crwr", "ubc_id": "599", "ubc_avg": 95 },
                { "ubc_dept": "crwr", "ubc_id": "599", "ubc_avg": 95 },
                { "ubc_dept": "cpsc", "ubc_id": "589", "ubc_avg": 95 },
                { "ubc_dept": "cpsc", "ubc_id": "589", "ubc_avg": 95 },
                { "ubc_dept": "cnps", "ubc_id": "535", "ubc_avg": 95 },
                { "ubc_dept": "cnps", "ubc_id": "535", "ubc_avg": 95 },
                { "ubc_dept": "bmeg", "ubc_id": "597", "ubc_avg": 95 },
                { "ubc_dept": "bmeg", "ubc_id": "597", "ubc_avg": 95 },
                { "ubc_dept": "adhe", "ubc_id": "329", "ubc_avg": 96.11 }
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