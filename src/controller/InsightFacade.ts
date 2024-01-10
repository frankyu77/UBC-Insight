import {IInsightFacade, InsightDataset, InsightDatasetKind, InsightResult} from "./IInsightFacade";
export class InsightFacade implements IInsightFacade {
    addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {

        //stub
        return new Promise<string[]> ((resolve) => {
            let test: string[] = [];
            resolve(test);
        });
    }

    removeDataset(id: string): Promise<string> {

        //stub
        return new Promise<string> ((resolve) => {
            resolve("");
        });
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