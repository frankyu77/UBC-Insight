import {IInsightFacade, InsightDataset, InsightDatasetKind, InsightError, InsightResult} from "./IInsightFacade";
import * as string_decoder from "string_decoder";
import * as fs from "fs";
import path from "node:path";
import Section from "./Section";
import Dataset from "./Dataset";

const fsPromises = require("fs").promises;

export default class InsightFacade implements IInsightFacade {
	private datasetsAddedSoFar: Dataset[] = [];
	private idDatasetsAddedSoFar: string[] = [];
	private dir = "./data";
	constructor() {
		console.log("InsightFacadeImpl::init()");
	}

	public async addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
		return Promise.reject("Not implemented.");
	}

	public async removeDataset(id: string): Promise<string> {
		return Promise.reject("Not implemented.");
	}


	// EVERY QUERY MUST HAVE:
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
				return reject(error.message);
			}

			let result: InsightResult[];

			try {
				result = this.handleWhere(queryS.WHERE, undefined);
			} catch (error: any) {
				return reject(error.message);
			}

			// console.log(result);

			this.handleOptions(queryS.OPTIONS, result);


			return reject("result");
		});

	}

	private  handleBaseEbnf(queryS: any) {
		const keysArray = Object.keys(queryS);
		if (keysArray.length === 2 && keysArray.includes("WHERE") && keysArray.includes("OPTIONS")) {
			return;
		}
		throw new InsightError("Invalid query! (No OPTIONS or WHERE)");
	}


	private  handleWhere(queryS: any, prevResult: any): InsightResult[] {

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
	private handleNot(queryS: any, prevResult: any): any {
		// Validate whether you have too many keys in OR !!!!!!

		let result1: InsightResult[] = this.handleWhere(queryS["NOT"], prevResult);


		console.log(result1);


	}

	// Takes two insight result arrays and joins the two together
	private handleOr(queryS: any, prevResult: any ): any {
		// const keys = Object.keys(queryS["OR"]);


		// Validate whether you have too many keys in OR !!!!!!

		// Add to a set
		let result1: InsightResult[] = this.handleWhere(queryS["OR"][0], prevResult);
		let result2: InsightResult[] = this.handleWhere(queryS["OR"][1], prevResult);

		let joinedArray: InsightResult[] = result1.concat(result2);
		const uniqueArray = [...new Set(joinedArray)];

		return uniqueArray;
	}

	// Checks if 2 InsightResult objects are equal
	private isInsightResultsEqual(insight1: InsightResult, insight2: InsightResult): boolean {


		const keys1 = Object.keys(insight1);
		const keys2 = Object.keys(insight2);
		if (keys1.length !== keys2.length) {
			return false;
		}
		for (const key of keys1) {
			if (insight1[key] !== insight2[key]) {
				return false;
			}
		}
		return true;
	}


	// Takes two insight result arrays and only joins the same sections together
	private handleAnd(queryS: any, prevResult: any): any {
		// Validate whether you have too many keys in AND !!!!!!

		let resultArray1: InsightResult[] = this.handleWhere(queryS["AND"][0], prevResult);
		let resultArray2: InsightResult[] = this.handleWhere(queryS["AND"][1], prevResult);


		const intersection = resultArray1.filter((insight1) =>
			resultArray2.some((insight2) => this.isInsightResultsEqual(insight1, insight2))
		);

		return intersection;

	}

	// gets the path to the dataset
	private getDatasetDirPath(id: string): string {
		return path.join(this.dir, `${id}`);
	}

	// checks if dataset already exists
	private async isThereDatasetDir(id: string): Promise<boolean> {
		return new Promise<boolean>( (resolve, reject) => {
			const filePath = this.getDatasetDirPath(id);
			fsPromises.access(filePath).then(() => {
				resolve(true);
			}).catch(() => {
				resolve(false);
			});
		});

	}

	// If there is no InsightResult passed in, create an insight result based on the queryKey
	// This insight result will have all the fields and sections of the requested dataset
	private handleSComparison( queryS: any, prevResult: any): any {
		const parsedQueryKey: any = this.queryKeyParser(queryS["IS"]);
		const idString: string = parsedQueryKey[0];
		const sField: string = parsedQueryKey[1];
		const toCompare: string = parsedQueryKey[2];
		const key: string = idString + "_" + sField;

		// Check if prev InsightResult is empty,
		// if empty is grab all dataset and create InsightResult
		// Assume below is the given prev InsightResult
		let insightsArray: InsightResult[] =  [
			{
				sections_dept: "rhsc",
				sections_instructor: "",
				sections_avg: 95
			},
			{
				sections_dept: "epse",
				sections_instructor: "",
				sections_avg: 95
			},
			{
				sections_dept: "epse",
				sections_instructor: "zumbo, bruno",
				sections_avg: 95
			},
			{
				sections_dept: "econ",
				sections_instructor: "",
				sections_avg: 95
			},
			{
				sections_dept: "econ",
				sections_instructor: "gallipoli, giovanni",
				sections_avg: 95
			}
		];

		const updatedToCompare: RegExp = this.createNewRegex(String(toCompare));

		let i = insightsArray.length;
		while (i--) {
			if (String(insightsArray[i][key]).search(updatedToCompare) === -1) {
				insightsArray.splice(i, 1);
			}
		}
		return insightsArray;
	}

	private createNewRegex(toCompare: string): RegExp {
		const updatedToCompare: string = toCompare.replace("*", ".*");
		try {
			return new RegExp(updatedToCompare, "gi");
		} catch (error) {
			throw new InsightError("Special characters used incorrectly.");
		}
	}


	// If there is no InsightResult passed in, create an insight result based on the queryKey
	// This insight result will have all the fields and sections of the requested dataset
	private handleMComparison( queryS: any, prevResult: any, comparator: string): InsightResult[] {

		const parsedQueryKey: any = this.queryKeyParser(queryS[comparator]);
		const idString: string = parsedQueryKey[0];
		const mField: string = parsedQueryKey[1];
		const toCompare: number = parsedQueryKey[2];
		const key: string = idString + "_" + mField;

		let insightsArray: InsightResult[] = prevResult;

		if (insightsArray === undefined) {
			// 1. Validate dataset ID
			// 2. Bring in entire data as InsightResult[]

			if (this.idDatasetsAddedSoFar.includes(idString)) {
				console.log("!");
			}
		}

		// Check if prev InsightResult is empty,
		// if empty is grab all dataset and create InsightResult
		// Assume below is the given prev InsightResult
		insightsArray =  [
			{
				sections_dept: "rhsc",
				sections_instructor: "",
				sections_avg: 100
			}
		];

		// Apply condition and shorten InsightResult array
		let i = insightsArray.length;
		switch (comparator) {
			case "EQ" :
				while (i--) {
					if (Number(insightsArray[i][key]) !== toCompare) {
						insightsArray.splice(i, 1);
					}
				}
				break;
			case "LT" :
				while (i--) {
					if (Number(insightsArray[i][key]) >= toCompare) {
						insightsArray.splice(i, 1);
					}
				}
				break;
			case "GT" :
				while (i--) {
					if (Number(insightsArray[i][key]) <= toCompare) {
						insightsArray.splice(i, 1);
					}
				}
				break;
		}

		// Return InsightResult Array
		return  insightsArray;
	}


	private handleOptions(queryS: any, result:  InsightResult[]): InsightResult[] {
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

