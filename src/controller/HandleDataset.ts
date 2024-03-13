import Dataset from "./Dataset";
import {InsightError} from "./IInsightFacade";
import path from "node:path";
import Section from "./Section";
import JSZip from "jszip";
import {parse, defaultTreeAdapter} from "parse5";
import TraverseTable, {BuildingInfo} from "./TraverseTable";

const fsPromises = require("fs").promises;

export default class HandleDataset {
	private dir: string = "./data";
	public traverseTable: TraverseTable = new TraverseTable();
	public buildingLinkedFromIndex: BuildingInfo[] = [];


    // converts dataset object to JSON string then add to disk
	public async addDatasetToDisk(dataset: Dataset) {
		let jsonString = JSON.stringify(dataset, null, "\t");
		let newPath = this.getDatasetDirPath(dataset.getIDName());
		try {
			await this.saveToDataDir(newPath, jsonString);
		} catch (error) {
			throw new InsightError("Error when saving to disk");
		}
	}

    // gets the path to the dataset
	public getDatasetDirPath(id: string): string {
		return path.join(this.dir, `${id}`);
	}

    // writes the file to data directory
	public async saveToDataDir(newPath: string, jsonString: string): Promise<void> {
		try {
			await fsPromises.writeFile(newPath, jsonString);
		} catch (e) {
			throw new InsightError("Error when writing to disk");
		}
	}

    // checks if dataset already exists
	public async isThereDatasetDir(id: string): Promise<boolean> {
		return new Promise<boolean>( (resolve, reject) => {
			const filePath = this.getDatasetDirPath(id);
			fsPromises.access(filePath).then(() => {
				resolve(true);
			}).catch(() => {
				resolve(false);
			});
		});

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

    // iterates through all courses and sections and adds only valid sections to the dataset
	public async handleSectionsZip(zip: JSZip, reject: (reason?: any) => void, dataset: Dataset) {
		const promises: unknown[] = [];
		let coursesFolderExists = false;
        // iterate through the zip folder
		zip.forEach((relativePath: string, zipEntry: JSZip.JSZipObject) => {
			if (relativePath.startsWith("courses")
                && !relativePath.includes("courses/.")
                && !relativePath.endsWith("/")) {
				coursesFolderExists = true;

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

		if (coursesFolderExists === false) {
			throw new InsightError("Courses folder not found");
		}

	}

	// iterates through all the building files and the index.htm file
	public async handleRoomsZip(zip: JSZip, reject: (reason?: any) => void, dataset: Dataset) {
		const promises: unknown[] = [];
		let relevantFoldersExist = false;
		let indexExist = false;

		// iterate through the zip folder
		zip.forEach(async (relativePath: string, zipEntry: JSZip.JSZipObject) => {
			// console.log(relativePath);

			// handles the index.htm file
			if (relativePath.endsWith("index.htm")) {
				indexExist = true;
				this.parseIndexHTML(promises, zipEntry, reject);

			}

		});
		await Promise.all(promises);

		zip.forEach(async (relativePath: string, zipEntry: JSZip.JSZipObject) => {
			// check if the folders exist
			if (relativePath === "campus/" ||
				relativePath === "campus/discover/" ||
				relativePath === "campus/discover/buildings-and-classrooms/") {

				relevantFoldersExist = relevantFoldersExist && true;
			}


			if (relativePath.startsWith("campus/discover/buildings-and-classrooms/") && relativePath.endsWith(".htm")) {
				for (const buildingInfo of this.buildingLinkedFromIndex) {
					if (buildingInfo.link === relativePath) {
						this.parseBuildingFile(promises, zipEntry, reject, dataset, buildingInfo);
					}
				}
			}

		});
		await Promise.all(promises);
	}


	// reads the index.htm file
	private parseIndexHTML(promises: unknown[], zipEntry: JSZip.JSZipObject, reject: (reason?: any) => void) {
		promises.push(
			zipEntry.async("string").then(async (contentInFile) => {
				// parses the file into a list of JSON objects
				try {
					const document = parse(contentInFile, {treeAdapter: defaultTreeAdapter});
					this.buildingLinkedFromIndex = this.traverseTable.handleIndexHTML(document);
				} catch (error) {
					console.log(error);
					reject(new InsightError("Error while parsing index.htm file"));
				}
			}).catch((error) => {
				reject(new InsightError("Error while adding dataset"));
			})
		);
	}

	// reads the building file
	private parseBuildingFile(promises: unknown[],
		zipEntry: JSZip.JSZipObject,
		reject: (reason?: any) => void,
		dataset: Dataset,
		buildingInfo: BuildingInfo) {

		promises.push(
			zipEntry.async("string").then(async (contentInFile) => {
				// parses the file into a list of JSON objects
				try {
					const document = parse(contentInFile, {treeAdapter: defaultTreeAdapter});
					await this.traverseTable.handleBuildingFile(document, dataset, buildingInfo);
				} catch (error) {
					console.log(error);
					reject(new InsightError("Error while parsing building file"));
				}
			}).catch((error) => {
				reject(new InsightError("Error while adding dataset f"));
			})
		);
	}
}
