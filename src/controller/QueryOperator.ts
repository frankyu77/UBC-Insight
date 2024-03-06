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

	private mkey = ["avg", "pass", "fail", "audit", "year", "lat", 'lon', 'seats'];
	private skey = ["dept", "id", "instructor", "title", "uuid",
		'fullname' , 'shortname' , 'number' , 'name' , 'address' , 'type' , 'furniture' , 'href'];
	private optionsKey = ["COLUMNS", "ORDER"];

	constructor(idDatasets: string[]) {
		this.idDatasetsAddedSoFar = idDatasets;
	}

	public getQueryingDatasetId(): string {
		return this._datasetToQueryId;

	}

	private setDatasetToQueryId(id: string): void {
		this._datasetToQueryId = id;
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


	public async handleWhere(queryS: any): Promise<boolean[]> {

		const keys = Object.keys(queryS);

		if (keys.length > 1) {
			throw new InsightError("More than one key in WHERE");
		}

		// Terminating calls are IS, EQ, GT, LT
		// AND, OR, NOT have to be recursive
		// TODO: query key parser;
		switch (keys[0]) {
			case "AND":
				return this.handleAnd(queryS["AND"]);
			case "OR":
				return this.handleOr(queryS["OR"]);
			case "IS":
				return this.handleSComparison(queryS["IS"]);
			case "EQ":
				return this.handleMComparison(queryS["EQ"], "EQ");
			case "GT":
				return this.handleMComparison(queryS["GT"], "GT");
			case "LT":
				return this.handleMComparison(queryS["LT"], "LT");
			case "NOT":
				return this.handleNot(queryS["NOT"]);
			default:
				throw new InsightError("Invalid filter key");
		}
	}


	// Takes a query key and returns a valid dataset id to search for and valid mfield and sfield.
	// Throws Insight Error if not a valid query string.
	private async queryKeyParser(queryKey: any): Promise<any> {
		const keys = Object.keys(queryKey);
		const vals: any = Object.values(queryKey);

		// Check if there are more than 1 key in
		if (keys.length !== 1) {
			throw new InsightError("Wrong number of keys");
		}

		// Strores idstring and m or s field into parsedArray
		let parsedArray: Array<number | string> = keys[0].split("_", 2);

		// Add the val
		parsedArray.push(vals[0]);

		const datasetToQueryId : string = String(parsedArray[0]);
		const key : string = String(parsedArray[1]);
		const value : string | number = parsedArray[2];

		if (this.getQueryingDatasetId()  === "") {
			await this.validateAndSetDataset(datasetToQueryId);
		} else if (this.getQueryingDatasetId() !== datasetToQueryId) {
			throw new InsightError("Querying 2 Datasets.");
		}

		if (this.mkey.includes(key)) {
			if (typeof value !== "number") {
				throw new InsightError("Invalid mfield type");
			}
			return parsedArray;
		} else if (this.skey.includes(key)) {
			if (typeof value !== "string") {
				throw new InsightError("Invalid sfield type");
			}
			return parsedArray;
		} else {
			throw new InsightError("Invalid skey or mkey");
		}

	}


	// All sections in the dataset outside of the given conditions
	private async handleNot(queryS: any): Promise<boolean[]> {
		const keys = Object.keys(queryS);

		if (keys.length !== 1) {
			throw new InsightError("Wrong number of keys");
		}

		let toDelete: boolean[] = await this.handleWhere(queryS);

		return toDelete.map((x) => !x);
	}

	// Takes two insight result arrays and joins the two together
	private async handleOr(queryS: any): Promise<boolean[]> {
		const filters = Object.keys(queryS);

		if (filters.length === 0) {
			throw new InsightError("No keys found in OR");
		}

		// Map each filter to a promise returned by handleWhere
		const promises =  filters.map(async (filter) => await this.handleWhere(queryS[filter]));

		// Use Promise.all to wait for all promises to resolve
		const results = await Promise.all(promises);

		// Assuming all results are boolean arrays of the same length.
		// Initialize resultArray with false for each element.
		let resultArray = new Array(results[0].length).fill(false);

		// Combine the results using logical OR
		results.forEach((newResult) => {
			for (let i = 0; i < resultArray.length; i++) {
				resultArray[i] = resultArray[i] || newResult[i];
			}
		});

		return resultArray;
	}


	// Takes two insight result arrays and only joins the same sections together
	private async handleAnd(queryS: any): Promise<boolean[]> {
		const filters = Object.keys(queryS);

		if (filters.length === 0) {
			throw new InsightError("No keys found in OR");
		}

		// Map each filter to a promise returned by handleWhere
		const promises =  filters.map(async (filter) => await this.handleWhere(queryS[filter]));

		// Use Promise.all to wait for all promises to resolve
		const results = await Promise.all(promises);

		// Assuming all results are boolean arrays of the same length.
		// Initialize resultArray with false for each element.
		let resultArray = new Array(results[0].length).fill(true);

		// Combine the results using logical OR
		results.forEach((newResult) => {
			for (let i = 0; i < resultArray.length; i++) {
				if (resultArray[i]) {
					resultArray[i] = resultArray[i]  && newResult[i];
				}
			}
		});

		return resultArray;
	}


	// If there is no InsightResult passed in, create an insight result based on the queryKey
	// This insight result will have all the fields and sections of the requested dataset
	private async handleSComparison(queryS: any): Promise<boolean[]> {

		const parsedQueryKey: any =  await this.queryKeyParser(queryS);
		const sField: string = parsedQueryKey[1];
		const toCompare: string = parsedQueryKey[2];

		let booleanArray: boolean[] = [];
		let insightsArray: InsightResult[] = this.getDataset();

		insightsArray.forEach((_, index) => {
			if (!this.matchesQueryPattern(String(insightsArray[index][sField]), toCompare)) {
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
	private async validateAndSetDataset(idString: string): Promise<void> {

		if (!this.idDatasetsAddedSoFar.includes(idString)) {
			throw new InsightError("Dataset not found");
		}
		const data = await fsPromises.readFile(this.getDatasetDirPath(idString)).catch(() => {
			throw new InsightError("Error file read.");
		} );

		const object = JSON.parse(data);
		this.setDataset(JSON.parse(JSON.stringify(object.validSections)));
		this.setDatasetToQueryId(object.idName);

		// return object.validSections;
	}


	// If there is no InsightResult passed in, create an insight result based on the queryKey
	// This insight result will have all the fields and sections of the requested dataset
	private async handleMComparison
	( queryS: any, comparator: string): Promise<boolean[]> {

		const parsedQueryKey: any = await this.queryKeyParser(queryS);
		const mField: string = parsedQueryKey[1];
		const toCompare: number = parsedQueryKey[2];
		const key: string = mField;

		let booleanArray: boolean[] = [];
		let insightsArray: InsightResult[] = this.getDataset();


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

	public handleOptions(queryS: any, filtered:  InsightResult[]): InsightResult[] {

		// If columns not present throw error
		let keys = Object.keys(queryS);


		// Check if there is a key that does not match the valid options keys
		const invalidKey = keys.some((key) => !this.optionsKey.includes(key));
		if (invalidKey) {
			throw new InsightError("Invalid key in OPTIONS");
		}

		if (!keys.includes("COLUMNS")) {
			throw new InsightError("No columns");
		}

		// Columns to keep
		const columns: string[] = this.parseColumns(queryS.COLUMNS);

		if (columns.length < 1) {
			throw new InsightError("Columns is empty");
		}

		// Filters for the needed columns
		const updatedArray: InsightResult[] = filtered.map((insight) => {
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

		return updatedArray;
	}

	private parseColumns(columns: string[]) {
		let parsedColumns: string[] = columns.map((item) => {
			return this.parseField(item);
		});
		return parsedColumns;
	}

	private parseField(field: string) {
		// //	CHECK IF THIS IS THE CORRECT DATASET ID
		if (typeof field !== "string") {
			throw new InsightError("Invalid type in OPTIONS");
		}

		const parts = field.split("_");
		// Check if there is a second part; if not, return an empty string or the original item

		if (this.getQueryingDatasetId() !== String(parts[0])) {
			throw new InsightError("Querying 2 Datasets.");
		}

		if (!(this.mkey.includes(parts[1]) || this.skey.includes(parts[1]))) {
			throw new InsightError("Invalid mkey or skey in columns.");
		}

		return parts[1] || "";
	}
}
