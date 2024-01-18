import {IInsightFacade, InsightDataset, InsightDatasetKind, InsightResult} from "./IInsightFacade";

export default class InsightFacade implements IInsightFacade {
    addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
        return Promise.resolve([]);
    }

    listDatasets(): Promise<InsightDataset[]> {
        return Promise.resolve([]);
    }

    performQuery(query: unknown): Promise<InsightResult[]> {
        return Promise.resolve([]);
    }

    removeDataset(id: string): Promise<string> {
        return Promise.resolve("");
    }

}

