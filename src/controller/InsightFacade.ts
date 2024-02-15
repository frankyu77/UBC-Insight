import JSZip from "jszip";
import {
	IInsightFacade,
	InsightDataset,
	InsightDatasetKind,
	InsightError,
	InsightResult,
	NotFoundError
} from "./IInsightFacade";
import * as fs from "fs";
import path from "node:path";
import Section from "./Section";
import Dataset from "./Dataset";

const fsPromises = require("fs").promises;

export default class InsightFacade implements IInsightFacade {
	private datasetsAddedSoFar: Dataset[] = [];
	private idDatasetsAddedSoFar: string[] = [];
	private dir = "./data";
	private datasetToQuery: InsightResult[] = [];


	public addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {

		return new Promise<string[]> ( (resolve, reject) => {
			// check if there is a data dir
			if (!fs.existsSync(this.dir)){
				fs.mkdirSync(this.dir);
			}

			// check if the id is valid
			if (!this.isValidID(id)) {
				reject(new InsightError("Not a valid ID"));
				return;
			}

			// check if the kind is Sections and not Rooms
			if (!(kind === InsightDatasetKind.Sections)) {
				reject(new InsightError("Not a valid kind"));
				return;
			}

			// checks if dataset already exists
			this.isThereDatasetDir(id)
				.then(async (exists) => {
					if (exists || this.idDatasetsAddedSoFar.includes(id)) {
						throw new InsightError("Dataset already added");
					}

					// if it does not exist then unzip the dataset and read it
					return await JSZip.loadAsync(content, {base64: true});
				}).then(async (zip: JSZip) => {
					let currentDataset = new Dataset();
					currentDataset.setIDName(id);

				// call to helper to handle reading the zip file
					await this.handleZip(zip, reject, currentDataset);

				// reject if there are no valid sections
					if (!currentDataset.getValidity()) {
						reject(new InsightError("No valid sections in dataset"));
						return;
					}

					await this.addDatasetToDisk(currentDataset);
					this.datasetsAddedSoFar.push(currentDataset);

					this.idDatasetsAddedSoFar.push(currentDataset.getIDName());
					resolve(this.idDatasetsAddedSoFar);
				})
				.catch((error: any) => {
					reject(new InsightError("Invalid Content"));
				});
		});


	}

	// iterates through all courses and sections and adds only valid sections to the dataset
	private async handleZip(zip: JSZip, reject: (reason?: any) => void, dataset: Dataset) {
		const promises: unknown[] = [];
		// iterate through the zip folder
		zip.forEach((relativePath: string, zipEntry: JSZip.JSZipObject) => {
			if (relativePath.startsWith("courses")
				&& !relativePath.includes("courses/.")
				&& !relativePath.endsWith("/")) {

				// read the content in the file
				promises.push(
					zipEntry.async("string").then((contentInFile) => {
						// parses the file into a list of JSON objects
						try {
							let parsedCourseJSONObjects = JSON.parse(contentInFile);
							let result = parsedCourseJSONObjects.result;
							if (result.length !== 0) {
								// iterate through the JSON objects in the file
								for (const object of result) {
									let newSection = this.createSection(object);
									if (!(newSection.getCourseID() === "invalid")) {
										dataset.setValidity(true);
										dataset.addValidSection(newSection);
									}
								}
							}
						} catch(error) {
							reject(new InsightError("Error while parsing file"));
						}
					}).catch((error) => {
						reject(new InsightError("Error while adding dataset"));
					})
				);
			}
		});
		await Promise.all(promises);
	}

	// converts dataset object to JSON string then add to disk
	private async addDatasetToDisk(dataset: Dataset) {
		let jsonString = JSON.stringify(dataset, null, "\t");
		let newPath = this.getDatasetDirPath(dataset.getIDName());
		try {
			await this.saveToDataDir(newPath, jsonString);
		} catch (error) {
			throw new InsightError("Error when saving to disk");
		}
	}

	// gets the path to the dataset
	private getDatasetDirPath(id: string): string {
		return path.join(this.dir, `${id}`);
	}

	// writes the file to data directory
	private async saveToDataDir(newPath: string, jsonString: string): Promise<void> {
		try {
			await fsPromises.writeFile(newPath, jsonString);
		} catch (e) {
			throw new InsightError("Error when writing to disk");
		}
	}

	// creates a Section object, if invalid, then create a Section that is invalid
	private createSection(object: any): Section {
		let currentSection = new Section(
			object.id,
			object.Course,
			object.Title,
			object.Professor,
			object.Subject,
			object.Year,
			object.Avg,
			object.Pass,
			object.Fail,
			object.Audit
		);

		if (this.isAValidSection(currentSection)) {
			return currentSection;
		} else {
			return new Section(
				"invalid",
				"",
				"",
				"",
				"",
				0,
				0,
				0,
				0,
				0
			);
		}
	}

	// checks if the Section is valid or not
	private isAValidSection(section: Section): boolean {
		return !(section.getSectionID() === undefined ||
			section.getCourseID() === undefined ||
			section.getTitle() === undefined ||
			section.getInstructor() === undefined ||
			section.getDepartment() === undefined ||
			section.getYear() === undefined ||
			section.getAvg() === undefined ||
			section.getPass() === undefined ||
			section.getFail() === undefined ||
			section.getAudit() === undefined);
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

	// checks if id provided is valid
	private isValidID(id: string): boolean {
		return /^[^\s_]+$/.test(id);
	}

	public removeDataset(id: string): Promise<string> {
		return new Promise<string> ((resolve, reject) => {
			// check if the id is valid
			if (!this.isValidID(id)) {
				reject(new InsightError("Not a valid ID"));
				return;
			}

			// check if dataset exists
			this.isThereDatasetDir(id)
				.then(async (exists) => {
					if (!exists) {
						throw new NotFoundError("Valid ID has not been added yet");
					} else {
						// if so then remove the dataset
						fs.unlink(this.getDatasetDirPath(id), (error) => {
							if (error) {
								throw new InsightError("Error while removing file");
							} else {
								resolve(id);
							}
						});
					}
				})
				.catch((error) => {
					reject(error);
				});
		});
	}


	public listDatasets(): Promise<InsightDataset[]>{
		let result: InsightDataset[] = [];

		return new Promise<InsightDataset[]> ((resolve, reject) => {
			// read the directory
			fs.readdir(this.dir,  (error, files) => {
				if (error) {
					resolve(result);
					return;
				}

				// keeps track of asynchronous code so that it iterates through all the files before returning
				let pendingFiles = files.length;
				if (pendingFiles === 0) {
					resolve(result);
				}

				// iterate through all the added datasets
				this.iterateThroughFiles(files, reject, result, pendingFiles, resolve);
			});
		});

	}

	// iterate through all datasets and make them into InsightDatasets and add to the return list
	private iterateThroughFiles(files: string[],
		reject: (reason?: any) => void,
		result: InsightDataset[],
		pendingFiles: number,
		resolve: (value: (PromiseLike<InsightDataset[]> | InsightDataset[])) => void) {

		// iterate through each file in data dir
		files.forEach(async (file) => {
			// read the file
			fs.readFile(this.getDatasetDirPath(file), "utf8", (err, data) => {
				if (err) {
					reject(new InsightError("Error when reading file"));
				}

				// this sections just makes the InsightDataset object for each dataset
				const object = JSON.parse(data);
				const currentInsightDataset: InsightDataset = {
					id: object.idName,
					kind: InsightDatasetKind.Sections,
					numRows: object.validSections.length
				};

				if (object.kind === "sections") {
					currentInsightDataset.kind = InsightDatasetKind.Sections;
				} else {
					currentInsightDataset.kind = InsightDatasetKind.Rooms;
				}
				result.push(currentInsightDataset);

				// to keep track of asynchronous code
				pendingFiles--;

				if (pendingFiles === 0) {
					resolve(result);
				}
			});
		});
	}

	// /////////////////////////////////////////////QUERY////////////////////////////////////////////////
	// EVERY QUERY MUST HAVE:
	// - WHERE
	// - OPTIONS with non-empty COLUMNS
	public async performQuery(query: unknown): Promise<InsightResult[]> {

		return new Promise<InsightResult[]>(async (resolve, reject) => {

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
				result = await this.handleWhere(queryS.WHERE, undefined);
			} catch (error: any) {
				return reject(error.message);
			}


			result = this.handleOptions(queryS.OPTIONS, result);

			return resolve(result);
		});

	}

	private  handleBaseEbnf(queryS: any) {
		const keysArray = Object.keys(queryS);
		if (keysArray.length === 2 && keysArray.includes("WHERE") && keysArray.includes("OPTIONS")) {
			return;
		}
		throw new InsightError("Invalid query! (No OPTIONS or WHERE)");
	}


	private async handleWhere(queryS: any, prevResult: any): Promise<InsightResult[]> {

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
	private async handleNot(queryS: any, prevResult: InsightResult[]): Promise<InsightResult[]> {
		// Validate whether you have too many keys in OR !!!!!!

		let result1: InsightResult[] = await this.handleWhere(queryS["NOT"], prevResult);

		// Finds the complement of result 1 in the fullset datasetToQuery
		let fullSet: InsightResult[] = this.datasetToQuery;

		let complement: InsightResult[] = fullSet.filter((fullSetItem) =>
			!result1.some((result1Item) => this.isInsightResultsEqual(result1Item, fullSetItem)));

		return complement;
	}

	// Takes two insight result arrays and joins the two together
	private async handleOr(queryS: any, prevResult: InsightResult[] ): Promise<InsightResult[]> {
		// const keys = Object.keys(queryS["OR"]);


		// Validate whether you have too many keys in OR !!!!!!

		// Add to a set
		let result1: InsightResult[] = await this.handleWhere(queryS["OR"][0], prevResult);
		let result2: InsightResult[] = await this.handleWhere(queryS["OR"][1], prevResult);

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
	private async handleAnd(queryS: any, prevResult: InsightResult[]): Promise<InsightResult[]> {
		// Validate whether you have too many keys in AND !!!!!!

		let resultArray1: InsightResult[] = await this.handleWhere(queryS["AND"][0], prevResult);
		let resultArray2: InsightResult[] = await this.handleWhere(queryS["AND"][1], prevResult);


		const intersection = resultArray1.filter((insight1) =>
			resultArray2.some((insight2) => this.isInsightResultsEqual(insight1, insight2))
		);

		return intersection;

	}


	// If there is no InsightResult passed in, create an insight result based on the queryKey
	// This insight result will have all the fields and sections of the requested dataset
	private async handleSComparison( queryS: any, prevResult: InsightResult[]): Promise<InsightResult[]> {

		const parsedQueryKey: any = this.queryKeyParser(queryS["IS"]);
		const idString: string = parsedQueryKey[0];
		const sField: string = parsedQueryKey[1];
		const toCompare: string = parsedQueryKey[2];
		const key: string = idString + "_" + sField;


		let insightsArray: InsightResult[] = prevResult;

		if (insightsArray === undefined) {
			// 1. Validate dataset ID
			// 2. Bring in entire data as InsightResult[]

			// Check if 2 datasets are being checked !!!!!!!!!!!!!!!!!!!!!1
			insightsArray = await this.validateDataset(idString);
		}

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
		// Escape special characters except for the asterisk
		let cleanString = toCompare.replace(/([.+?^=!:${}()|\[\]\/\\])/g, "\\$1");

		// Determine the pattern based on the presence and position of asterisks
		if (toCompare.startsWith("*") && toCompare.endsWith("*")) {
			// Contains inputstring
			cleanString = cleanString.substring(1, cleanString.length - 1);
			return new RegExp(cleanString, "i"); // Case-insensitive match
		} else if (toCompare.startsWith("*")) {
			// Ends with inputstring
			cleanString = cleanString.substring(1);
			return new RegExp(cleanString + "$", "i"); // Match end, case-insensitive
		} else if (toCompare.endsWith("*")) {
			// Starts with inputstring
			cleanString = cleanString.substring(0, cleanString.length - 1);
			return new RegExp("^" + cleanString, "i"); // Match start, case-insensitive
		} else {
			// Matches inputstring exactly
			return new RegExp("^" + cleanString + "$", "i"); // Exact match, case-insensitive
		}
	}

	// Checks if the given idString is a valid dataset name
	// If it is, it returns an entire dataset in InsightResult form
	private async validateDataset(idString: string): Promise<InsightResult[]> {

		if (!this.idDatasetsAddedSoFar.includes(idString)) {
			throw new InsightError("Dataset not found");
		}
		let insightsArray: InsightResult[];
		const data = await fsPromises.readFile(this.getDatasetDirPath(idString)).catch(() => {
			throw new InsightError("Error file read.");
		} );

		const object = JSON.parse(data);
		insightsArray = object.validSections;
		const prefix: string = idString + "_";

		insightsArray = insightsArray.map((obj) => {
			const newObj: InsightResult = {};
			Object.entries(obj).forEach(([key, value]) => {
				newObj[`${prefix}${key}`] = value;
			});
			return newObj;
		});
		this.datasetToQuery = insightsArray;
		return insightsArray;
	}


	// If there is no InsightResult passed in, create an insight result based on the queryKey
	// This insight result will have all the fields and sections of the requested dataset
	private async handleMComparison( queryS: any, prevResult: InsightResult[], comparator: string)
		: Promise<InsightResult[]> {

		const parsedQueryKey: any = this.queryKeyParser(queryS[comparator]);
		const idString: string = parsedQueryKey[0];
		const mField: string = parsedQueryKey[1];
		const toCompare: number = parsedQueryKey[2];
		const key: string = idString + "_" + mField;

		let insightsArray: InsightResult[] = prevResult;

		if (insightsArray === undefined) {
			// 1. Validate dataset ID
			// 2. Bring in entire data as InsightResult[]

			// Check if 2 datasets are being checked !!!!!!!!!!!!!!!!!!!!!
			insightsArray = await this.validateDataset(idString);
		}


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
	//
	// private getSampleInsightResult() : InsightResult[] {
	// 	let insightsArray: InsightResult[] =  [
	// 		{
	// 			sections_dept: "rhsc",
	// 			sections_instructor: "",
	// 			sections_avg: 95
	// 		},
	// 		{
	// 			sections_dept: "epse",
	// 			sections_instructor: "",
	// 			sections_avg: 95
	// 		},
	// 		{
	// 			sections_dept: "epse",
	// 			sections_instructor: "zumbo, bruno",
	// 			sections_avg: 95
	// 		},
	// 		{
	// 			sections_dept: "econ",
	// 			sections_instructor: "",
	// 			sections_avg: 95
	// 		},
	// 		{
	// 			sections_dept: "econ",
	// 			sections_instructor: "gallipoli, giovanni",
	// 			sections_avg: 95
	// 		}
	// 	];
	// 	return insightsArray;
	// }

	private handleOptions(queryS: any, prevResult:  InsightResult[]): InsightResult[] {

		// If columns not present throw error
		let keys = Object.keys(queryS);
		if (!keys.includes("COLUMNS")) {
			throw new InsightError("No columns");
		}

		// Columns to keep
		const columns: string[] = queryS.COLUMNS;

		if (columns.length < 1) {
			throw new InsightError("Columns is empty");
		}

		// Filters for the needed columns
		const updatedArray: InsightResult[] = prevResult.map((insight) => {
			let newInsight: InsightResult = {};
			columns.forEach((field) => {
				if(insight.hasOwnProperty(field)) {
					newInsight[field] = insight[field];
				}
			});
			return newInsight;
		});


		if (keys.includes("ORDER")) {
			const toSortBy: string = queryS.ORDER;
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

}
