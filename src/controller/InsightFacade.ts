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


	//EVERY QUERY MUST HAVE:
	// - WHERE
	// - OPTIONS with non-empty COLUMNS
	public async performQuery(query: unknown): Promise<InsightResult[]> {

		return new Promise<InsightResult[]>((resolve, reject) => {

			let queryS: any;
			try {
				JSON.stringify(query);
				queryS = query;
			} catch (error) {
				return reject("Not a valid JSON."); // Not a string, can't be JSON
			}

			// Check if where and options are present
			try {
				this.handleBaseEbnf(queryS);
			} catch (error) {
				return reject("No where or options")
			}

			// this.handleWhere(queryS.WHERE);


			return reject("Not implemented.")
		});

	}

	private  handleBaseEbnf(queryS : any) {
		const keysArray = Object.keys(queryS);
		if (keysArray.length === 2 && keysArray.includes("WHERE") && keysArray.includes("OPTIONS")) {
			return
		}
		throw new Error("Invalid query! (No OPTIONS or WHERE)")
	}
	// private  handleWhere(queryS : any) : InsightResult[] {
	// 	console.log(queryS)
	//
	// }

	// private handleGt( queryS: any, prevResult : InsightResult[]) : InsightResult[] {
	// }
	public async listDatasets(): Promise<InsightDataset[]> {
		return Promise.reject("Not implemented.");
	}
}

