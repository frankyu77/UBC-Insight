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
				 result = this.handleWhere(queryS.WHERE, undefined);
			} catch (error: any) {
				return reject(error.message);
			}

			this.handleOptions(queryS.OPTIONS, result);


			return reject("result");
		});

	}

	private  handleBaseEbnf(queryS : any) {
		const keysArray = Object.keys(queryS);
		if (keysArray.length === 2 && keysArray.includes("WHERE") && keysArray.includes("OPTIONS")) {
			return
		}
		throw new InsightError("Invalid query! (No OPTIONS or WHERE)")
	}


	private  handleWhere(queryS : any, prevResult: any) : InsightResult[] {

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
				return this.handleAnd(queryS,prevResult);
			case "OR":
				return this.handleOr(queryS, prevResult);
			case "IS":
				return this.handleSComparison(queryS, prevResult);
			case "EQ":
				return this.handleMComparison(queryS, prevResult, "EQ");
			case "GT":
				return this.handleMComparison(queryS, prevResult, "GT");
			case "LT":
				return this.handleMComparison(queryS, prevResult, "LT");
			case "NOT":
				return insightsArray;
			default:
				throw new InsightError("Invalid filter key")
		}
	}





	// Takes a query key and returns a valid dataset id to search for and valid mfield and sfield.
	// Throws Insight Error if not a valid query string.
	private queryKeyParser(queryKey : any) : any {
		const keys = Object.keys(queryKey);
		const vals : any = Object.values(queryKey);



		//Strores idstring and m or s field into parsedArray
		//Does this need to be number | string !!!!!!!!
		let parsedArray : (number | string)[] = keys[0].split("_", 2);

		//Add the val
		parsedArray.push(vals[0]);


		//Validate parsedArray
		//Check if there are more than 1 key in
		if (keys.length > 1 || keys.length == 0) {
			throw new InsightError("Wrong number of keys");
		}

		//Check if a valid m or sfield is passed and check if the types are numbrs are right
		switch (parsedArray[1]) {
			case "dept" :
				break;

		}

		return parsedArray;
	}


	// Takes two insight result arrays and joins the two together
	private handleOr(queryS : any, prevResult : any ) : any {
		const keys = Object.keys(queryS);

		//Add to a set
		let result1 : InsightResult[] = this.handleWhere(queryS[keys[0]], prevResult);
		let result2 : InsightResult[] = this.handleWhere(queryS[keys[1]], prevResult);

		let joinedArray : InsightResult[] = result1.concat(result2);

		console.log(joinedArray);

		return joinedArray;
	}

	// Takes two insight result arrays and only joins the same sections together
	private handleAnd(queryS: any, prevResult: any) : any {

	}

	// If there is no InsightResult passed in, create an insight result based on the queryKey
	// This insight result will have all the fields and sections of the requested dataset
	private handleSComparison( queryS: any, prevResult : any) : any {
		const parsedQueryKey : any = this.queryKeyParser(queryS["IS"]);
		const idString : string = parsedQueryKey[0];
		const sField : string = parsedQueryKey[1];
		const toCompare: string = parsedQueryKey[2];
		const key : string = idString+"_"+sField;

		// Check if prev InsightResult is empty,
		// if empty is grab all dataset and create InsightResult
		// Assume below is the given prev InsightResult
		let insightsArray: InsightResult[] = [
			{
				"sections_instructor": "hodgson, antony",
				"sections_id": "501",
				"sections_avg": 95.15
			},
			{
				"sections_instructor": "hodgson, antony",
				"sections_id": "597",
				"sections_avg": 83.83
			},
			{
				"sections_instructor": "hodgson, antony",
				"sections_id": "597",
				"sections_avg": 84.33
			},
			{
				"sections_dept": "busi",
				"sections_id": "330",
				"sections_instructor" : "ASDDD",
				"sections_avg": 4
			},
			{
				"sections_instructor": "",
				"sections_id": "475",
				"sections_avg": 1
			}
		];

		const updatedToCompare : RegExp = this.createNewRegex(String(toCompare));

		var i = insightsArray.length
		while (i--) {
			console.log(insightsArray[i][key]);
			if (String(insightsArray[i][key]).search(updatedToCompare) == -1) {
				insightsArray.splice(i, 1);
			}
		}

		console.log(insightsArray);
		return insightsArray;
	}

	private createNewRegex(toCompare: string) : RegExp {
		const updatedToCompare : string = toCompare.replace("*", ".*")
		return new RegExp(updatedToCompare, "gi")
	}



	// If there is no InsightResult passed in, create an insight result based on the queryKey
	// This insight result will have all the fields and sections of the requested dataset
	private handleMComparison( queryS: any, prevResult : any, comparator : string) : InsightResult[] {

		const parsedQueryKey : any = this.queryKeyParser(queryS[comparator]);
		const idString : string = parsedQueryKey[0];
		const mField : string = parsedQueryKey[1];
		const toCompare: number = parsedQueryKey[2];
		const key : string = idString+"_"+mField;


		// Check if prev InsightResult is empty,
		// if empty is grab all dataset and create InsightResult
		//Assume below is the given prev InsightResult
		let insightsArray: InsightResult[] = [
			{
				"sections_instructor": "hodgson, antony",
				"sections_id": "501",
				"sections_avg": 95.15
			},
			{
				"sections_instructor": "hodgson, antony",
				"sections_id": "597",
				"sections_avg": 83.83
			},
			{
				"sections_instructor": "hodgson, antony",
				"sections_id": "597",
				"sections_avg": 84.33
			},
			{
				"sections_dept": "busi",
				"sections_id": "330",
				"sections_instructor" : "ASDDD",
				"sections_avg": 4
			},
			{
				"sections_instructor": "",
				"sections_id": "475",
				"sections_avg": 1
			}
		];

		//Apply condition and shorten InsightResult array
		var i = insightsArray.length
		switch (comparator) {
			case "EQ" :
				while (i--) {
					if (Number(insightsArray[i][key]) != toCompare) {
						insightsArray.splice(i, 1);
					}
				}
				break;
			case "LT" :
				while (i--) {
					if (Number(insightsArray[i][key]) > toCompare) {
						insightsArray.splice(i, 1);
					}
				}
				break;
			case "GT" :
				while (i--) {
					if (Number(insightsArray[i][key]) < toCompare) {
						insightsArray.splice(i, 1);
					}
				}
				break;
		}
		console.log(insightsArray);

		//Return InsightResult Array
		return  insightsArray;
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

