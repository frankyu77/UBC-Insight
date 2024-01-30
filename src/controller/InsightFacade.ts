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

		// Check if it is a JSON file
		if (typeof query !== "string") {
			return Promise.reject("Not a string input."); // Not a string, can't be JSON
		}

		try {
			// const jsonData = JSON.parse(input as string);
			// return typeof jsonData === "object" && jsonData !== null;
		} catch (error) {
			return Promise.reject("Not av valid JSON."); // Not a string, can't be JSON
		}

		return Promise.reject("Not implemented.");
	}

	public async listDatasets(): Promise<InsightDataset[]> {
		return Promise.reject("Not implemented.");
	}
}

