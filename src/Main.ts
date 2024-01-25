// Run from `src/Main.ts`
import * as fs from "fs-extra";
import * as zip from "jszip";

import {
    IInsightFacade,
    InsightDatasetKind,
    NotFoundError,
    ResultTooLargeError,
    InsightError,
    InsightDataset,
    InsightResult,
} from "./controller/IInsightFacade";
import InsightFacade from "./controller/InsightFacade";


const insightFacade: IInsightFacade = new InsightFacade();


const futureRows: Promise<InsightResult[]> = insightFacade.performQuery({});
const futureRemovedId: Promise<string> = insightFacade.removeDataset("foo");
const futureInsightDatasets: Promise<InsightDataset[]> = insightFacade.listDatasets();
const futureAddedIds: Promise<string[]> = insightFacade.addDataset("bar", "baz", InsightDatasetKind.Sections);


futureInsightDatasets.then((insightDatasets) => {
    const {id, numRows, kind} = insightDatasets[0];
});


const errors: Error[] = [
    new ResultTooLargeError("foo"),
    new NotFoundError("bar"),
    new InsightError("baz"),
];