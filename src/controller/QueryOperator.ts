import HandleDataset from "./HandleDataset";
import {
	InsightError,
	InsightResult,
	ResultTooLargeError,
} from "./IInsightFacade";
import path from "node:path";
const fsPromises = require("fs").promises;

export default class QueryOperator {

	protected datasetToQuery: InsightResult[] = [];
	protected _datasetToQueryId: string = "";
	protected dir = "./data";
	protected idDatasetsAddedSoFar: string[] = [];
	public applyNames: Set<string> = new Set<string>();
	public emptyWhere: boolean = false;

	public mkey: string[] = [];
	public skey: string[] = [];

	private handleDataset = new HandleDataset();


	constructor(idDatasets: string[]) {
		this.idDatasetsAddedSoFar = idDatasets;
	}

	public getQueryingDatasetId(): string {
		return this._datasetToQueryId;

	}

	public getApplyNames(): Set<string> {
		return this.applyNames;

	}

	public setDatasetToQueryId(id: string): void {
		this._datasetToQueryId = id;
	}

	public setDataset(dataset: InsightResult[]){
		this.datasetToQuery = dataset;
	}

	public getDataset(): InsightResult[] {
		return this.datasetToQuery;
	}

	public getDatasetIds(): string[] {
		return this.idDatasetsAddedSoFar;
	}

	public getDatasetDirPath(id: string): string {
		return path.join(this.dir, `${id}`);
	}

	public  parseField(field: string) {
		if (typeof field !== "string") {
			throw new InsightError("Invalid type in OPTIONS");
		}

		if (this.applyNames.has(field)) {
			return field;
		}

		const parts = field.split("_");
		// Check if there is a second part; if not, return an empty string or the original item

		const datasetToQueryId: string = parts[0];
		const mOrSKey: string = parts[1];

		if (this.getQueryingDatasetId() !== datasetToQueryId) {
			throw new InsightError("Querying 2 Datasets.");
		}

		if (!(this.mkey.includes(mOrSKey) || this.skey.includes(mOrSKey))) {
			throw new InsightError("Invalid mkey or skey in columns.");
		}

		return parts[1] || "";
	}

	public checkIfValidJson(query: any): void {
		try {
			JSON.stringify(query);
		} catch (error) {
			throw new InsightError("Not a valid JSON.");  // Not a string, can't be JSON
		}
	}

	public grabDatasetNameFromQueryKey(queryKey: string): string {
		const parts = queryKey.split("_");
		// Check if there is a second part; if not, return an empty string or the original item
		return parts[0];
	}

	public  checkBaseEbnf(queryS: any) {
		const keysArray = Object.keys(queryS);
		if (keysArray.length === 2 && keysArray.includes("WHERE") && keysArray.includes("OPTIONS")) {
			return false;
		} else if (keysArray.length === 3 && keysArray.includes("WHERE") && keysArray.includes("OPTIONS") &&
			keysArray.includes("TRANSFORMATIONS")) {
			return true;
		}
		throw new InsightError("Invalid query! (No OPTIONS or WHERE)");
	}

	public convertBoolean(boolArr: boolean[]): InsightResult[] {
		const converted: InsightResult[] = this.getDataset().filter((value, index) => {
			return boolArr[index];
		});
		// Yes
		return converted;
	}

	public compatibleFormat(result: InsightResult[]) {
		const prefix: string = this.getQueryingDatasetId() + "_";
		const applyNames: Set<string> = this.getApplyNames();

		return result.map((obj) => {
			const newObj: InsightResult = {};
			Object.entries(obj).forEach(([key, value]) => {
				if (applyNames.has(key)) {
					newObj[key] = value;
				} else {
					newObj[`${prefix}${key}`] = value;
				}
			});
			return newObj;
		});
	}

	public checkResultLength(result: InsightResult[]): InsightResult[] {
		if (result.length > 5000) {
			throw new ResultTooLargeError("Result greater than 5000");
		}
		return result;
	}

	// Checks if the given idString is a valid dataset name
	// If it is, it returns an entire dataset in InsightResult form
	public async validateAndSetDataset(idString: string): Promise<void> {
		// asdfasdfasdf
		// if (!this.getDatasetIds().includes(idString)) {
		let dataExists = await this.handleDataset.isThereDatasetDir(idString);
		if (!dataExists) {
			throw new InsightError("Dataset not found");
		}
		const data = await fsPromises.readFile(this.getDatasetDirPath(idString)).catch(() => {
			throw new InsightError("Error file read.");
		} );

		const object = JSON.parse(data);
		if (object.kind === "sections") {
			this.mkey =  ["avg", "pass", "fail", "audit", "year"];
			this.skey = ["dept", "id", "instructor", "title", "uuid"];
			this.setDataset(JSON.parse(JSON.stringify(object.validSections)));
		} else {
			this.mkey =  ["lat", "lon", "seats"];
			this.skey = ["fullname" , "shortname" , "number" , "name" ,
				"address" , "type" , "furniture" , "href"];
			this.setDataset(JSON.parse(JSON.stringify(object.validRooms)));
		}
		this.setDatasetToQueryId(object.idName);
	}


}


