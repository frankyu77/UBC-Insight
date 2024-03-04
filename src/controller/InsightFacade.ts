import JSZip from "jszip";
import {
	IInsightFacade,
	InsightDataset,
	InsightDatasetKind,
	InsightError,
	InsightResult,
	NotFoundError,
	ResultTooLargeError
} from "./IInsightFacade";
import * as fs from "fs";
import path from "node:path";
import Section from "./Section";
import Dataset from "./Dataset";
import QueryOperator from "./QueryOperator";
import HandleDataset from "./HandleDataset";
import ResultUtilities from "./ResultUtilities";

const fsPromises = require("fs").promises;

export default class InsightFacade implements IInsightFacade {
	private datasetsAddedSoFar: Dataset[] = [];
	private idDatasetsAddedSoFar: string[] = [];
	private dir = "./data";
	private handleDataset = new HandleDataset();


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
			if (kind === InsightDatasetKind.Sections) {
				// checks if dataset already exists
				this.handleDataset.isThereDatasetDir(id)
					.then(async (exists) => {
						if (exists || this.idDatasetsAddedSoFar.includes(id)) {
							throw new InsightError("Dataset already added");
						}

						// if it does not exist then unzip the dataset and read it
						return await JSZip.loadAsync(content, {base64: true});
					})
					.then(async (zip: JSZip) => {
						let currentDataset = new Dataset();
						currentDataset.setIDName(id);

					// call to helper to handle reading the zip file
						await this.handleDataset.handleSectionsZip(zip, reject, currentDataset);

					// reject if there are no valid sections
						if (!currentDataset.getValidity()) {
							reject(new InsightError("No valid sections in dataset"));
							return;
						}

						await this.handleDataset.addDatasetToDisk(currentDataset);
						this.datasetsAddedSoFar.push(currentDataset);

						this.idDatasetsAddedSoFar.push(currentDataset.getIDName());
						resolve(this.idDatasetsAddedSoFar);
					})
					.catch((error: any) => {
						reject(new InsightError("Invalid Content"));
					});
			} else if (kind === InsightDatasetKind.Rooms) {
				// checks if dataset already exists
				this.handleDataset.isThereDatasetDir(id)
					.then(async (exists) => {
						if (exists || this.idDatasetsAddedSoFar.includes(id)) {
							throw new InsightError("Dataset already added");
						}

						// if it does not exist then unzip the dataset and read it
						return await JSZip.loadAsync(content, {base64: true});
					})
					.then(async (zip: JSZip) => {
						let currentDataset = new Dataset();
						currentDataset.setIDName(id);

						// call to helper to handle reading the zip file
//* **************************************************CHANGE THIS LINE***************************************************
						// await this.handleDataset.handleSectionsZip(zip, reject, currentDataset);

						// reject if there are no valid sections
						if (!currentDataset.getValidity()) {
							reject(new InsightError("No valid sections in dataset"));
							return;
						}

						await this.handleDataset.addDatasetToDisk(currentDataset);
						this.datasetsAddedSoFar.push(currentDataset);

						this.idDatasetsAddedSoFar.push(currentDataset.getIDName());
						resolve(this.idDatasetsAddedSoFar);
					})
					.catch((error: any) => {
						reject(new InsightError("Invalid Content"));
					});
			} else {
				reject(new InsightError("Not a valid kind"));
				return;
			}
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
			this.handleDataset.isThereDatasetDir(id)
				.then(async (exists) => {
					if (!exists) {
						throw new NotFoundError("Valid ID has not been added yet");
					} else {
						// if so then remove the dataset
						fs.unlink(this.handleDataset.getDatasetDirPath(id), (error) => {
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
			fs.readFile(this.handleDataset.getDatasetDirPath(file), "utf8", (err, data) => {
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
	public async performQuery(query: unknown): Promise<InsightResult[]> {

		return new Promise<InsightResult[]>( (resolve, reject) => {
			let queryOperator = new QueryOperator(this.idDatasetsAddedSoFar);
			let resultUtilities = new ResultUtilities();
			let queryS: any = query;
			try {
				resultUtilities.checkIfValidJson(queryS);
				resultUtilities.checkBaseEbnf(queryS);
			} catch (error) {
				return reject(error);
			}

			let result: InsightResult[];

			queryOperator.handleWhere(queryS.WHERE, undefined).then( (resultWhere) => {

				result = resultUtilities.convertBoolean(resultWhere, queryOperator.getDataset());
				result = resultUtilities.checkResultLength(result);
				result = queryOperator.handleOptions(queryS.OPTIONS, result);
				result = resultUtilities.compatibleFormat(queryOperator, result);

				return resolve(result);
			}).catch((error) => {
				return reject(error);// new InsightError(error.message));
			});

		});
	}
}
