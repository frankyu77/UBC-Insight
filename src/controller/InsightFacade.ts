import {IInsightFacade, InsightDataset, InsightDatasetKind, InsightError, InsightResult} from "./IInsightFacade";
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
			} catch (error: any) {
				return reject(error.message)
			}

			let result : InsightResult[];

			try {
				 result = this.handleWhere(queryS.WHERE);
			} catch (error: any) {
				return reject(error.message);
			}

			this.handleOptions(queryS.OPTIONS, result);


			return reject("Not implemented.")
		});

	}

	private  handleBaseEbnf(queryS : any) {
		const keysArray = Object.keys(queryS);
		if (keysArray.length === 2 && keysArray.includes("WHERE") && keysArray.includes("OPTIONS")) {
			return
		}
		throw new InsightError("Invalid query! (No OPTIONS or WHERE)")
	}


	private  handleWhere(queryS : any) : InsightResult[] {

		const keys = Object.keys(queryS);

		if (keys.length > 1) {
			throw new InsightError("More than one key in WHERE");
		}

		// Create an array of InsightResult objects
		let insightsArray: InsightResult[] = [
			{
				key1: "value1",
				key2: 100
			}
		];


		// Terminating calls are IS, EQ, GT, LT
		// AND, OR, NOT have to be recursive
		// TODO: query key parser;
		switch (keys[0]) {
			case "AND":
				return insightsArray;
			case "OR":
				return insightsArray;
			case "IS":
				return insightsArray;
			case "EQ":
				return this.handleEq(queryS, undefined);
			case "GT":
				return insightsArray;
			case "LT":
				return insightsArray;
			case "NOT":
				return insightsArray;
			default:
				throw new InsightError("Invalid filter key")
		}
	}

	// Takes a query key and returns a valid dataset id to search for and valid mfield and sfield.
	// Throws Insight Error if not a valid query string.
	private queryKeyParser(queryKey : string) : any {

	}


	// If there is no InsightResult passed in, create an insight result based on the queryKey
	// This insight result will have all the fields and sections of the requested dataset
	private handleEq( queryS: any, prevResult : any) : InsightResult[] {

		console.log(queryS);
		const parsedQueryKey : any = this.queryKeyParser(queryS);
		const mField : string = "avg";
		const idString : string = "sections";
		const toCompare: number = 99;



		let insightsArray: InsightResult[] = [
			{
				sections_avg: 99
			}
		];
		return insightsArray;
	}
	private handleOptions(queryS : any, result :  InsightResult[]) : InsightResult[] {
		// Create an array of InsightResult objects
		let insightsArray: InsightResult[] = [
			{
				key1: "value1",
				key2: 100
			}
		];

		return insightsArray;
	}


	public async listDatasets(): Promise<InsightDataset[]> {
		return Promise.reject("Not implemented.");
	}
}

