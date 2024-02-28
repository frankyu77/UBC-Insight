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
import ResultUtilities from "./ResultUtilities";

const fsPromises = require("fs").promises;

export default class InsightFacade implements IInsightFacade {
	private datasetsAddedSoFar: Dataset[] = [];
	private idDatasetsAddedSoFar: string[] = [];
	private dir = "./data";


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
			String(object.id),
			object.Course,
			object.Title,
			object.Professor,
			object.Subject,
			(object.Section === "overall") ? 1900 : Number(object.Year),
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

		return new Promise<InsightResult[]>( (resolve, reject) => {
			let queryOperator = new QueryOperator(this.idDatasetsAddedSoFar);
			let resultUtilities = new ResultUtilities();
			let queryS: any;
			try {
				queryS = resultUtilities.checkIfValidJson(query);
				queryOperator.handleBaseEbnf(queryS);
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
