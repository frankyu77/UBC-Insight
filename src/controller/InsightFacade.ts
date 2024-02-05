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
const fsPromises = require("fs").promises;
import path from "node:path";
import Sections from "./Sections";
import {callbackify} from "node:util";

export default class InsightFacade implements IInsightFacade {
	// private readonly dataDirectory: string = 'data/';
	private readonly dataDirectory: string = path.join(__dirname, "data/"); // ********** MIGHT HAVE TO CHANGE THIS
	private listID: string[] = [];
	private listValidSections: any = [];
	private atLeastOneValidSection: boolean = false;

	public async addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
		return new Promise<string[]> ( (resolve, reject) => {
			// check if the id is valid
			if (!this.isValidID(id)) {
				reject(new InsightError("Not a valid ID"));
				return;
			}

			// NEED TO CHECK IF VALID BASE64 STRING ************************************************

			// check if the dataset is already added
			const dataAlreadyAdded = this.isDatasetAdded(id);
			console.log(dataAlreadyAdded);
			if (dataAlreadyAdded) {
				console.log("asfasfasf");
				reject(new InsightError("Dataset already added"));
				return;
			}

			// iterate through the zip folder //------------------------------->>>>>>>>> not sure why this is failing
			// ------------------------------->>>>>>>>> idk if readFile takes in the file name or base-64
			// ------------------------------->>>>>>>>> maybe have to convert content back to file name
			fsPromises.readFile("/Users/frank/IdeaProjects/c0_team328/test/resources/archives/oneValidSection.zip")
				.then(async (dataRead: Buffer) => {
					return await JSZip.loadAsync(dataRead).catch(() => {
						console.log("error while reading zip");
					});
				})
				.catch((error: any) => {
					console.log(error);
				})
				.then((zip: JSZip) => {
					this.handleZip(zip, reject);
					if (!this.atLeastOneValidSection) {
						reject(new InsightError("No valid sections in dataset"));   // SOMEHOW HANDLE IS ZERO VALID DS
					}
				})
				.catch((error: any) => {
					console.log(error);
					reject(new InsightError("Error while adding dataset"));
				});


			// add the data set to disk, and also store the id to a local array
			// const path = this.getDatasetFilePath(id);
			// fsPromises.writeFile(path, content).then(() => {
			// 	console.log("File written successfully");
			// 	this.listID.push(id);
			// 	resolve(this.listID);
			// }).catch(() => {
			// 	console.log("error when writing file");
			// })


		});

	}

	private handleZip(zip: JSZip, reject: (reason?: any) => void) {
		// iterate through the zip folder
		zip.forEach((relativePath: string, zipEntry: JSZip.JSZipObject) => {
			// console.log(relativePath);
			if (relativePath.startsWith("courses")
				&& !relativePath.includes("courses/.")
				&& !relativePath.endsWith("/")) {

				// console.log(relativePath);
				// read the content in the file
				zipEntry.async("string").then((contentInFile) => {

					// console.log("reached zipEntry.async");
					// console.log(contentInFile);
					// parses the file into a list of JSON objects

					try {
						let parsedCourseJSONObjects = JSON.parse(contentInFile);
						let result = parsedCourseJSONObjects.result;
						if (result.length === 0) {
							console.log("invalid section");
						} else {
							// iterate through the JSON objects in the file
							for (const object of result) {
								// let test: string = object.Course;
								// console.log(test);
								let newSection = this.createSection(object);
								if (newSection === false) {
									// do nothing --> skip over it
									// console.log("invalid section detected");
								} else {
									// add section to disk????
									this.atLeastOneValidSection = true;
									this.listValidSections.push(newSection);
									// console.log("valid section!!");
									// console.log(this.listValidSections.length);

									let jsonString = JSON.stringify(newSection);
									if (typeof newSection !== "boolean") {
										let newPath = this.getDatasetFilePath(newSection.getSectionID());
										this.saveToDataDir(newPath, jsonString);
									}
								}

								// pass into the Sections class and have it handle assigning each field to the object
								// if the object has one field that is undefined, then you want to skip that section
								// as long as the ENTIRE DATASET has AT LEAST ONE VALID SECTION, then it is okay
							}
							console.log("end of for loop");
						}
					} catch(error) {
						console.log("error while parsing file: invalid json format");
						console.log("this is the error: " + error);
					}
				}).catch((error) => {
					console.log(error);
					reject(new InsightError("Error while adding dataset"));
				});
			}
		});


	}

	private saveToDataDir(newPath: string, jsonString: string) {
		fsPromises.writeFile(newPath, jsonString).then(() => {
			console.log("File written successfully");
		}).catch(() => {
			console.log("error when writing file");
		});
	}

	private createSection(object: any): Sections|boolean {
		let currentSection = new Sections(
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
			return false;
		}
	}

	private isAValidSection(section: Sections): boolean {
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

	private isDatasetAdded(id: string): boolean {
		const filePath = this.getDatasetFilePath(id);
		return fs.existsSync(filePath); // Check if the file exists

	}

	private getDatasetFilePath(id: string): string {
		return path.join(this.dataDirectory, `${id}.json`);
	}

	private isValidID(id: string): boolean {
		return /^[^\s_]+$/.test(id);
	}

	public removeDataset(id: string): Promise<string> {

        // stub
        // return new Promise<string> ((resolve) => {
        //     resolve("");
        // });
		return Promise.resolve(id);
        // throw new InsightError("remove error");
        // throw new NotFoundError();
	}

	public performQuery(query: unknown): Promise<InsightResult[]> {

        // stub
        // return new Promise<InsightResult[]> ((resolve) => {
        //    let test: InsightResult[] = [];
        //    resolve(test);
        // });
        // return Promise.resolve(
        //     [{"sections_dept":"adhe","sections_id":"329","sections_avg":90.02},{"sections_dept":"adhe","sections_id":"412","sections_avg":90.16},{"sections_dept":"adhe","sections_id":"330","sections_avg":90.17},{"sections_dept":"adhe","sections_id":"412","sections_avg":90.18},{"sections_dept":"adhe","sections_id":"330","sections_avg":90.5},{"sections_dept":"adhe","sections_id":"330","sections_avg":90.72},{"sections_dept":"adhe","sections_id":"329","sections_avg":90.82},{"sections_dept":"adhe","sections_id":"330","sections_avg":90.85},{"sections_dept":"adhe","sections_id":"330","sections_avg":91.29},{"sections_dept":"adhe","sections_id":"330","sections_avg":91.33},{"sections_dept":"adhe","sections_id":"330","sections_avg":91.33},{"sections_dept":"adhe","sections_id":"330","sections_avg":91.48},{"sections_dept":"adhe","sections_id":"329","sections_avg":92.54},{"sections_dept":"adhe","sections_id":"329","sections_avg":93.33},{"sections_dept":"sowk","sections_id":"570","sections_avg":95},{"sections_dept":"rhsc","sections_id":"501","sections_avg":95},{"sections_dept":"psyc","sections_id":"501","sections_avg":95},{"sections_dept":"psyc","sections_id":"501","sections_avg":95},{"sections_dept":"obst","sections_id":"549","sections_avg":95},{"sections_dept":"nurs","sections_id":"424","sections_avg":95},{"sections_dept":"nurs","sections_id":"424","sections_avg":95},{"sections_dept":"musc","sections_id":"553","sections_avg":95},{"sections_dept":"musc","sections_id":"553","sections_avg":95},{"sections_dept":"musc","sections_id":"553","sections_avg":95},{"sections_dept":"musc","sections_id":"553","sections_avg":95},{"sections_dept":"musc","sections_id":"553","sections_avg":95},{"sections_dept":"musc","sections_id":"553","sections_avg":95},{"sections_dept":"mtrl","sections_id":"599","sections_avg":95},{"sections_dept":"mtrl","sections_id":"564","sections_avg":95},{"sections_dept":"mtrl","sections_id":"564","sections_avg":95},{"sections_dept":"math","sections_id":"532","sections_avg":95},{"sections_dept":"math","sections_id":"532","sections_avg":95},{"sections_dept":"kin","sections_id":"500","sections_avg":95},{"sections_dept":"kin","sections_id":"500","sections_avg":95},{"sections_dept":"kin","sections_id":"499","sections_avg":95},{"sections_dept":"epse","sections_id":"682","sections_avg":95},{"sections_dept":"epse","sections_id":"682","sections_avg":95},{"sections_dept":"epse","sections_id":"606","sections_avg":95},{"sections_dept":"edcp","sections_id":"473","sections_avg":95},{"sections_dept":"edcp","sections_id":"473","sections_avg":95},{"sections_dept":"econ","sections_id":"516","sections_avg":95},{"sections_dept":"econ","sections_id":"516","sections_avg":95},{"sections_dept":"crwr","sections_id":"599","sections_avg":95},{"sections_dept":"crwr","sections_id":"599","sections_avg":95},{"sections_dept":"crwr","sections_id":"599","sections_avg":95},{"sections_dept":"crwr","sections_id":"599","sections_avg":95},{"sections_dept":"crwr","sections_id":"599","sections_avg":95},{"sections_dept":"crwr","sections_id":"599","sections_avg":95},{"sections_dept":"crwr","sections_id":"599","sections_avg":95},{"sections_dept":"cpsc","sections_id":"589","sections_avg":95},{"sections_dept":"cpsc","sections_id":"589","sections_avg":95},{"sections_dept":"cnps","sections_id":"535","sections_avg":95},{"sections_dept":"cnps","sections_id":"535","sections_avg":95},{"sections_dept":"bmeg","sections_id":"597","sections_avg":95},{"sections_dept":"bmeg","sections_id":"597","sections_avg":95},{"sections_dept":"adhe","sections_id":"329","sections_avg":96.11}]
        // )

		throw new InsightError();
        // return Promise.resolve([]);
	}

	public listDatasets(): Promise<InsightDataset[]>{

        // stub
        // return new Promise<InsightDataset[]> ((resolve) => {
        //     let test: InsightDataset[] = [];
        //     resolve(test);
        // });
        // return Promise.resolve([{id: "ubc", kind: InsightDatasetKind.Sections, numRows: 64612}]);
		return Promise.resolve([]);

	}
}
