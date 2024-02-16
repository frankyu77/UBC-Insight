import {
	InsightError,
	InsightResult,
} from "./IInsightFacade";
import path from "node:path";


const fsPromises = require("fs").promises;

export default class QueryOperator {

	private datasetToQuery: InsightResult[] = [];
	private _datasetToQueryId: string = "";
	private dir = "./data";
	private idDatasetsAddedSoFar: string[] = [];


	constructor(test: string[]) {
		this.idDatasetsAddedSoFar = test;
	}

	public datasetToQueryId(): string {
		return this._datasetToQueryId;

	}

	private setDataset(dataset: InsightResult[]){
		this.datasetToQuery = dataset;
	}

	public getDataset(): InsightResult[] {
		return this.datasetToQuery;
	}

	private getDatasetDirPath(id: string): string {
		return path.join(this.dir, `${id}`);
	}


	public  handleBaseEbnf(queryS: any) {
		const keysArray = Object.keys(queryS);
		if (keysArray.length === 2 && keysArray.includes("WHERE") && keysArray.includes("OPTIONS")) {
			return;
		}
		throw new InsightError("Invalid query! (No OPTIONS or WHERE)");
	}


	public async handleWhere(queryS: any, prevResult: any): Promise<boolean[]> {

		const keys = Object.keys(queryS);

		if (keys.length > 1) {
			throw new InsightError("More than one key in WHERE");
		}

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
				return this.handleNot(queryS, prevResult);
			default:
				throw new InsightError("Invalid filter key");
		}
	}


	// Takes a query key and returns a valid dataset id to search for and valid mfield and sfield.
	// Throws Insight Error if not a valid query string.
	private queryKeyParser(queryKey: any): any {
		const keys = Object.keys(queryKey);
		const vals: any = Object.values(queryKey);

		// Strores idstring and m or s field into parsedArray
		// Does this need to be number | string !!!!!!!!
		let parsedArray: Array<number | string> = keys[0].split("_", 2);

		// Add the val
		parsedArray.push(vals[0]);


		// Validate parsedArray
		// Check if there are more than 1 key in
		if (keys.length > 1 || keys.length === 0) {
			throw new InsightError("Wrong number of keys");
		}

		// Check if a valid m or sfield is passed and check if the types are numbrs are right
		switch (parsedArray[1]) {
			case "dept" :
				break;

		}

		return parsedArray;
	}


	// All sections in the dataset outside of the given conditions
	private async handleNot(queryS: any, prevResult: InsightResult[]): Promise<boolean[]> {
		// Validate whether you have too many keys in OR !!!!!!
		let toDelete: boolean[] = await this.handleWhere(queryS["NOT"], prevResult);

		return toDelete.map((x) => !x);
	}

	// Takes two insight result arrays and joins the two together
	private async handleOr(queryS: any, prevResult: InsightResult[] ): Promise<boolean[]> {
		// Validate whether you have too many keys in OR !!!!!!

		// Add to a set
		let result1: boolean[] = await this.handleWhere(queryS["OR"][0], prevResult);
		let result2: boolean[] = await this.handleWhere(queryS["OR"][1], prevResult);

		//
		// const [result1, result2] = await Promise.all([
		// 	this.handleWhere(queryS["OR"][0], prevResult),
		// 	this.handleWhere(queryS["OR"][1], prevResult),
		// ]);


		// const intersection: boolean[] =  [];
		// for (let i = 0; i < result1.length; i++) {
		// 	intersection.push(result1[i] || result2[i]);
		// }


		// result1.forEach((value, index) => {
		// 	result1[index] = value|| result2[index];
		// })
		// return result1.map((value, index) => value || result2[index]);
		for (let i = 0; i < result1.length; i++) {
			result1[i] = result1[i] || result2[i];
		}
		return result1;
	}

	// // Checks if 2 InsightResult objects are equal
	// private isInsightResultsEqual(insight1: InsightResult, insight2: InsightResult): boolean {
	// 	return (insight1.uuid === insight2.uuid);
	// }


	// Takes two insight result arrays and only joins the same sections together
	private async handleAnd(queryS: any, prevResult: InsightResult[]): Promise<boolean[]> {
		// Validate whether you have too many keys in AND !!!!!!

		let resultArray1: boolean[] = await this.handleWhere(queryS["AND"][0], prevResult);
		let resultArray2: boolean[] = await this.handleWhere(queryS["AND"][1], prevResult);


		// const [resultArray1, resultArray2] = await Promise.all([
		// 	this.handleWhere(queryS["AND"][0], prevResult),
		// 	this.handleWhere(queryS["AND"][1], prevResult),
		// ]);

		// const intersection: boolean[] =  [];
		// for (let i = 0; i < resultArray1.length; i++) {
		// 	intersection.push(resultArray1[i] && resultArray2[i]);
		// }

		// resultArray1.forEach((value, index) => {
		// 	resultArray1[index] = value && resultArray2[index];
		// })

		// return resultArray1.map((value, index) : boolean => {
		// 	if(value){
		// 		return value && resultArray2[index];
		// 	}
		// 	return false;
		// });

		// for (let i = 0; i < result1.length; i++) {
		// 	result1[i] = result1[i] || result2[i];
		// }
		// return result1;

		for (let i = 0; i < resultArray1.length; i++) {
			if(resultArray1[i]){
				resultArray1[i] = resultArray1[i]  && resultArray2[i];
			}

		}
		return resultArray1;

	}


	// If there is no InsightResult passed in, create an insight result based on the queryKey
	// This insight result will have all the fields and sections of the requested dataset
	private async handleSComparison( queryS: any, prevResult: InsightResult[]): Promise<boolean[]> {

		const parsedQueryKey: any = this.queryKeyParser(queryS["IS"]);
		const idString: string = parsedQueryKey[0];
		const sField: string = parsedQueryKey[1];
		const toCompare: string = parsedQueryKey[2];
		const key: string = sField;

		let booleanArray: boolean[] = [];
		let insightsArray: InsightResult[] = prevResult;

		if (insightsArray === undefined) {
			// 1. Validate dataset ID
			// 2. Bring in entire data as InsightResult[]

			// Check if 2 datasets are being checked !!!!!!!!!!!!!!!!!!!!!
			insightsArray = this.getDataset();
			if (insightsArray.length < 1) {
				insightsArray = await this.validateDataset(idString);
			}
		}


		insightsArray.forEach((_, index) => {
			if (!this.matchesQueryPattern(String(insightsArray[index][key]), toCompare)) {
				booleanArray.push(false);
			} else {
				booleanArray.push(true);
			}
		});

		return booleanArray;
	}

	private  matchesQueryPattern(input: string, queryPattern: string): boolean {
		// Check if the pattern starts and/or ends with an asterisk
		const startsWithAsterisk = queryPattern.startsWith("*");
		const endsWithAsterisk = queryPattern.endsWith("*");

		// Remove asterisks from the pattern for comparison
		const cleanPattern = queryPattern.replace(/^\*|\*$/g, "");

		if (startsWithAsterisk && endsWithAsterisk) {
			// Contains inputstring
			return input.includes(cleanPattern);
		} else if (startsWithAsterisk) {
			// Ends with inputstring
			return input.endsWith(cleanPattern);
		} else if (endsWithAsterisk) {
			// Starts with inputstring
			return input.startsWith(cleanPattern);
		} else {
			// Matches inputstring exactly
			return input === cleanPattern;
		}
	}


	// Checks if the given idString is a valid dataset name
	// If it is, it returns an entire dataset in InsightResult form
	private async validateDataset(idString: string): Promise<InsightResult[]> {

		if (!this.idDatasetsAddedSoFar.includes(idString)) {
			throw new InsightError("Dataset not found");
		}
		const data = await fsPromises.readFile(this.getDatasetDirPath(idString)).catch(() => {
			throw new InsightError("Error file read.");
		} );

		const object = JSON.parse(data);
		this.setDataset(JSON.parse(JSON.stringify(object.validSections)));

		this._datasetToQueryId = object.idName;

		return object.validSections;
	}


	// If there is no InsightResult passed in, create an insight result based on the queryKey
	// This insight result will have all the fields and sections of the requested dataset
	private async handleMComparison
	( queryS: any, prevResult: InsightResult[], comparator: string): Promise<boolean[]> {

		const parsedQueryKey: any = this.queryKeyParser(queryS[comparator]);
		const idString: string = parsedQueryKey[0];
		const mField: string = parsedQueryKey[1];
		const toCompare: number = parsedQueryKey[2];
		const key: string = mField;

		let booleanArray: boolean[] = [];
		let insightsArray: InsightResult[] = prevResult;

		if (insightsArray === undefined) {
			// 1. Validate dataset ID
			// 2. Bring in entire data as InsightResult[]

			insightsArray = this.getDataset();
			if (insightsArray.length < 1) {
				insightsArray = await this.validateDataset(idString);
			}

		}
		// // Check if 2 datasets are being checked !!!!!!!!!!!!!!!!!!!!!
		// if (idString != this.datasetToQueryId()) {
		// 	throw new InsightError("Querying 2 datasets");
		// }

		// Apply condition and shorten InsightResult array
		switch (comparator) {
			case "EQ" :
				insightsArray.forEach((_, index) => {
					if (Number(insightsArray[index][key]) !== toCompare) {
						booleanArray.push(false);
					} else {
						booleanArray.push(true);
					}
				});

				break;
			case "LT" :
				insightsArray.forEach((_, index) => {
					if (Number(insightsArray[index][key]) >= toCompare) {
						booleanArray.push(false);
					} else {
						booleanArray.push(true);
					}
				});

				break;
			case "GT" :
				insightsArray.forEach((_, index) => {
					if (Number(insightsArray[index][key]) <= toCompare) {
						booleanArray.push(false);
					} else {
						booleanArray.push(true);
					}
				});
				break;
		}

		// Return InsightResult Array
		return  booleanArray;
	}

	public handleOptions(queryS: any, prevResult:  InsightResult[]): InsightResult[] {

		// If columns not present throw error
		let keys = Object.keys(queryS);


		if (!keys.includes("COLUMNS")) {
			throw new InsightError("No columns");
		}

		// Columns to keep
		const columns: string[] = this.parseColumns(queryS.COLUMNS);

		if (columns.length < 1) {
			throw new InsightError("Columns is empty");
		}

		// Filters for the needed columns
		const updatedArray: InsightResult[] = prevResult.map((insight) => {
			let newInsight: InsightResult = {};
			columns.forEach((field) => {
				// Object.prototype.hasOwnProperty.call(insight, field
				if(Object.prototype.hasOwnProperty.call(insight, field)) {
					newInsight[field] = insight[field];
				}
			});
			return newInsight;
		});

		if (keys.includes("ORDER")) {
			const toSortBy: string = this.parseField(queryS.ORDER);
			if (!columns.includes(toSortBy)) {
				throw new InsightError("Sort key is not present in columns.");
			}
			updatedArray.sort((a, b) => {
				if (a[toSortBy] < b[toSortBy]) {
					return -1;
				}
				if (a[toSortBy] > b[toSortBy]) {
					return 1;
				}
				return 0;
			});
		}

		// If sort present, id must be in columns


		return updatedArray;
	}

	private parseColumns(columns: string[]) {
		let parsedColumns: string[] = columns.map((item) => {
			return this.parseField(item);
		});
		return parsedColumns;
	}

	private parseField(field: string) {
		const parts = field.split("_");
		// Check if there is a second part; if not, return an empty string or the original item
		return parts[1] || "";
	}
}
