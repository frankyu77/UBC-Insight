import JSZip from "jszip";
import {
	IInsightFacade,
	InsightDataset,
	InsightDatasetKind,
	InsightError,
	InsightResult,
	NotFoundError
} from "./IInsightFacade";
import Section from "./Sections";
import * as fs from "fs";
const fsPromises = require("fs").promises;
import path from "node:path";

export default class InsightFacade implements IInsightFacade {
	// private readonly dataDirectory: string = 'data/';
	private readonly dataDirectory: string = path.join(__dirname, "data/");
	private listID: string[] = [];

	public addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
		//	template for how to create a section
		//	let section = new Section(
		// 	"CPSC",
		// 	"101",
		// 	"computer science",
		// 	"gregor",
		// 	"science",
		// 	2022,
		// 	88,
		// 	100,
		// 	30,
		// 	10
		// );

		return new Promise<string[]> ((resolve, reject) => {
			// check if the id is valid
			if (!this.isValidID(id)) {
				reject(new InsightError("Not a valid ID"));
				return;
			}

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
			fsPromises.readFile(content)
				.then((dataRead: Buffer) => {
					return JSZip.loadAsync(dataRead);
				})
				.then((zip: JSZip) => {
					// iterate through the zip folder
					zip.forEach((relativePath: string, zipEntry: JSZip.JSZipObject) => {
						if (!zipEntry.dir && relativePath.endsWith(".json")) { // check if it's a .json file

							// read the content in the file
							zipEntry.async("string").then((contentInFile) => {

								// parses the file into a list of JSON objects
								let parsedJSONObjects = JSON.parse(contentInFile);

								// iterate through the JSON objects in the file
								for (let i = 0; i < parsedJSONObjects.length; i++) {
									console.log(parsedJSONObjects[i]);
									// in here want to have a condition to check that the said json object it valid
									// if so, then you add that to the disk, if not then you dont add it, etc.
									// continue until it iterates through the entire file of json objects
								}

							}).catch((error) => {
								reject(new InsightError("Error while adding dataset"));
							});
						} else {
							reject(new InsightError("Invalid JSON file"));
						}
					});
				})
				.catch(() => {
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

	private isDatasetAdded(id: string): boolean {
		const filePath = this.getDatasetFilePath(id);
		// try {
		// 	fs.readFileSync(filePath);
		// 	return true;
		// } catch (error) {
		// 	console.log('false thrown')
		// 	return false;
		// }
		return fs.existsSync(filePath); // Check if the file exists

	}

	private getDatasetFilePath(id: string): string {
		// return `${this.dataDirectory}${id}.json`;
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
