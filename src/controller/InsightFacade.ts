import {IInsightFacade, InsightDataset, InsightDatasetKind, InsightResult} from "./IInsightFacade";
import * as string_decoder from "string_decoder";

export default class InsightFacade implements IInsightFacade {
	constructor() {
		console.log("InsightFacadeImpl::init()");
	}

	public async addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
		return Promise.reject("Not implemented.");
	}

	public async removeDataset(id: string): Promise<string> {
		return Promise.reject("Not implemented.");
	}

	public async performQuery(query: unknown): Promise<InsightResult[]> {

		let queryS: any;
		try {
			JSON.stringify(query);
			queryS = query;
		} catch (error) {
			return Promise.reject("Not a valid JSON."); // Not a string, can't be JSON
		}

		for (const key in queryS){
			console.log(key);
		}

		return Promise.reject("Not implemented.");
	}


	public async listDatasets(): Promise<InsightDataset[]> {
		return Promise.reject("Not implemented.");
	}
}

