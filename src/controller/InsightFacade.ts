import {
    IInsightFacade,
    InsightDataset,
    InsightDatasetKind,
    InsightError,
    InsightResult,
    NotFoundError
} from "./IInsightFacade";
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
        return Promise.resolve(id);
        //throw new InsightError("remove error");
        //throw new NotFoundError();
    }

    performQuery(query: unknown): Promise<InsightResult[]> {

        //stub
        // return new Promise<InsightResult[]> ((resolve) => {
        //    let test: InsightResult[] = [];
        //    resolve(test);
        // });
        // return Promise.resolve(
        //     [{"sections_dept":"adhe","sections_id":"329","sections_avg":90.02},{"sections_dept":"adhe","sections_id":"412","sections_avg":90.16},{"sections_dept":"adhe","sections_id":"330","sections_avg":90.17},{"sections_dept":"adhe","sections_id":"412","sections_avg":90.18},{"sections_dept":"adhe","sections_id":"330","sections_avg":90.5},{"sections_dept":"adhe","sections_id":"330","sections_avg":90.72},{"sections_dept":"adhe","sections_id":"329","sections_avg":90.82},{"sections_dept":"adhe","sections_id":"330","sections_avg":90.85},{"sections_dept":"adhe","sections_id":"330","sections_avg":91.29},{"sections_dept":"adhe","sections_id":"330","sections_avg":91.33},{"sections_dept":"adhe","sections_id":"330","sections_avg":91.33},{"sections_dept":"adhe","sections_id":"330","sections_avg":91.48},{"sections_dept":"adhe","sections_id":"329","sections_avg":92.54},{"sections_dept":"adhe","sections_id":"329","sections_avg":93.33},{"sections_dept":"sowk","sections_id":"570","sections_avg":95},{"sections_dept":"rhsc","sections_id":"501","sections_avg":95},{"sections_dept":"psyc","sections_id":"501","sections_avg":95},{"sections_dept":"psyc","sections_id":"501","sections_avg":95},{"sections_dept":"obst","sections_id":"549","sections_avg":95},{"sections_dept":"nurs","sections_id":"424","sections_avg":95},{"sections_dept":"nurs","sections_id":"424","sections_avg":95},{"sections_dept":"musc","sections_id":"553","sections_avg":95},{"sections_dept":"musc","sections_id":"553","sections_avg":95},{"sections_dept":"musc","sections_id":"553","sections_avg":95},{"sections_dept":"musc","sections_id":"553","sections_avg":95},{"sections_dept":"musc","sections_id":"553","sections_avg":95},{"sections_dept":"musc","sections_id":"553","sections_avg":95},{"sections_dept":"mtrl","sections_id":"599","sections_avg":95},{"sections_dept":"mtrl","sections_id":"564","sections_avg":95},{"sections_dept":"mtrl","sections_id":"564","sections_avg":95},{"sections_dept":"math","sections_id":"532","sections_avg":95},{"sections_dept":"math","sections_id":"532","sections_avg":95},{"sections_dept":"kin","sections_id":"500","sections_avg":95},{"sections_dept":"kin","sections_id":"500","sections_avg":95},{"sections_dept":"kin","sections_id":"499","sections_avg":95},{"sections_dept":"epse","sections_id":"682","sections_avg":95},{"sections_dept":"epse","sections_id":"682","sections_avg":95},{"sections_dept":"epse","sections_id":"606","sections_avg":95},{"sections_dept":"edcp","sections_id":"473","sections_avg":95},{"sections_dept":"edcp","sections_id":"473","sections_avg":95},{"sections_dept":"econ","sections_id":"516","sections_avg":95},{"sections_dept":"econ","sections_id":"516","sections_avg":95},{"sections_dept":"crwr","sections_id":"599","sections_avg":95},{"sections_dept":"crwr","sections_id":"599","sections_avg":95},{"sections_dept":"crwr","sections_id":"599","sections_avg":95},{"sections_dept":"crwr","sections_id":"599","sections_avg":95},{"sections_dept":"crwr","sections_id":"599","sections_avg":95},{"sections_dept":"crwr","sections_id":"599","sections_avg":95},{"sections_dept":"crwr","sections_id":"599","sections_avg":95},{"sections_dept":"cpsc","sections_id":"589","sections_avg":95},{"sections_dept":"cpsc","sections_id":"589","sections_avg":95},{"sections_dept":"cnps","sections_id":"535","sections_avg":95},{"sections_dept":"cnps","sections_id":"535","sections_avg":95},{"sections_dept":"bmeg","sections_id":"597","sections_avg":95},{"sections_dept":"bmeg","sections_id":"597","sections_avg":95},{"sections_dept":"adhe","sections_id":"329","sections_avg":96.11}]
        // )

        throw new InsightError();
        //return Promise.resolve([]);
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