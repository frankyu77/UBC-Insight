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
import Section from "./Section";
import {callbackify} from "node:util";
import Dataset from "./Dataset";

export default class InsightFacade implements IInsightFacade {
/* *********************************************************************************************************************
	✅create a datasetClass along with the sectionsClass so that you can store the list of valid sections inside the
	datasetClass and that way you can you just parse the entire datasetClass as a JSONObject and then just store that
	into the disk
	makes it easier, so that you don't have to read the fold and check that the folder name matches whatever id ur
	getting and going from there

	✅also want to store the list of datasetClass Objects so that you can have access to it in memory rather than only
	relying on the disk since that is very costly. This way if youre still working on the same instance of
	InsightFacade itll be easier to access the datasets that you have added, but if you create a new instance of
	InsightFacade, you can access all the previously added datasets from the disk

TODO
	must handle the case of new instance of InsightFacade having access to all the previously added datasets, so that
	when you addDataset, it will return all the previously added datasets as well, also for listDataset and stuff. Must
	create some array where it can read the data directory and if the datasets are not in the locally created array,
	then you would add those datasets from the disk into the local array??
*/ // ******************************************************************************************************************

	private listID: string[] = [];
	private datasetsAddedSoFar: Dataset[] = [];
	private idDatasetsAddedSoFar: string[] = [];
	private dir = "./data";

	public async addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
		console.log("😀");

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

			// check if the dataset is already added
			const dataAlreadyAdded = this.isThereDatasetDir(id);
			console.log(dataAlreadyAdded);
			if (dataAlreadyAdded) {
				console.log("asfasfasf");
				reject(new InsightError("Dataset already added"));
				return;
			}

			// this.createDatasetDir(id);  // creates a directory for the dataset inside data dir
			let currentDataset = new Dataset();
			currentDataset.setIDName(id);

			JSZip.loadAsync(content, {base64: true})
				.then(async (zip: JSZip) => {
					await this.handleZip(zip, reject, currentDataset);
					if (!currentDataset.getValidity()) {
						reject(new InsightError("No valid sections in dataset"));   // SOMEHOW HANDLE IS ZERO VALID DS
					}

					this.addDatasetToDisk(currentDataset);
					this.datasetsAddedSoFar.push(currentDataset);
					/*
					* TODO
					*  change how to implement this part. probably want to iterate through disk and check if there are
					*  datasets that are not in your local array and add those in, then you return the total list of ids
					* */
					// change this
					this.idDatasetsAddedSoFar.push(currentDataset.getIDName());
					resolve(this.idDatasetsAddedSoFar);
				})
				.catch((error: any) => {
					console.log(error);
					reject(new InsightError("Not base64"));
				});
		});

	}

	private addDatasetToDisk(dataset: Dataset) {
		let jsonString = JSON.stringify(dataset, null, "\t");
		let newPath = this.getDatasetDirPath(dataset.getIDName());
		this.saveToDataDir(newPath, jsonString);
	}

	private getDatasetDirPath(id: string): string {
		return path.join(this.dir, `${id}`);
	}

	private async handleZip(zip: JSZip, reject: (reason?: any) => void, dataset: Dataset) {
		const promises: unknown[] = [];
		// iterate through the zip folder
		zip.forEach((relativePath: string, zipEntry: JSZip.JSZipObject) => {
			// console.log(relativePath);
			if (relativePath.startsWith("courses")
				&& !relativePath.includes("courses/.")
				&& !relativePath.endsWith("/")) {

				// console.log(relativePath);
				// read the content in the file
				promises.push(
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
									// console.log(test);
									let newSection = this.createSection(object);
									if (!(newSection.getCourseID() === "invalid")) {
										dataset.setValidity(true);
										dataset.addValidSection(newSection);

										// this.listValidSections.push(newSection);

										// console.log("valid section!!");
										// console.log(this.listValidSections.length);


										// let jsonString = JSON.stringify(newSection);
										// if (typeof newSection !== "boolean") {
										// 	let newPath = this.getSectionPath(newSection.getSectionID(), datasetID);
										// 	this.saveToDataDir(newPath, jsonString);
										// }
									}
								}
								console.log("end of for loop");
							}
						} catch(error) {
							console.log("this is the error: " + error);
							reject(new InsightError("Error while parsing file"));
						}
					}).catch((error) => {
						console.log(error);
						reject(new InsightError("Error while adding dataset"));
					})
				);


			}
		});

		await Promise.all(promises);
		console.log("end of for each*********");
		console.log(dataset.getValidSections().length);

	}

	private saveToDataDir(newPath: string, jsonString: string) {
		fsPromises.writeFile(newPath, jsonString).then(() => {
			console.log("File written successfully");
		}).catch(() => {
			console.log("error when writing file");
		});
	}

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

	private isThereDatasetDir(id: string): boolean {
		const filePath = this.getDatasetDirPath(id);
		return fs.existsSync(filePath); // Check if the file exists

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
        // return Promise.resolve([{id: "ubc", kind: InsightDatasetKind.Section, numRows: 64612}]);
		return Promise.resolve([]);

	}
}
