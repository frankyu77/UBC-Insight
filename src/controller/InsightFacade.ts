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
        return new Promise<InsightResult[]> ((resolve) => {
           let test: InsightResult[] = [];
           resolve(test);
        });
    }

    listDatasets(): Promise<InsightDataset[]>{

        //stub
        return new Promise<InsightDataset[]> ((resolve) => {
            let test: InsightDataset[] = [];
            resolve(test);
        });
    }
}