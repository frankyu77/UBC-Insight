import {
	InsightError,
	InsightResult,
	ResultTooLargeError,
} from "./IInsightFacade";
import path from "node:path";

export default class QueryOperator {

	protected datasetToQuery: InsightResult[] = [];
	protected _datasetToQueryId: string = "";
	protected dir = "./data";
	protected idDatasetsAddedSoFar: string[] = [];
	public applyNames: string[] = [];

	public mkey: string[] = [];
	public skey: string[] = [];


	constructor(idDatasets: string[]) {
		this.idDatasetsAddedSoFar = idDatasets;
	}

	public getQueryingDatasetId(): string {
		return this._datasetToQueryId;

	}

	public getApplyNames(): string[] {
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

	public parseField(field: string) {
		if (typeof field !== "string") {
			throw new InsightError("Invalid type in OPTIONS");
		}

		if (this.applyNames.includes(field)) {
			return field;
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

	public checkIfValidJson(query: any): void {
		try {
			JSON.stringify(query);
		} catch (error) {
			throw new InsightError("Not a valid JSON.");  // Not a string, can't be JSON
		}
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
			if (boolArr[index]) {
				return true;
			}
		});
		// Yes
		return converted;
	}

	public compatibleFormat(result: InsightResult[]) {
		const prefix: string = this.getQueryingDatasetId() + "_";
		const applyNames: string[] = this.getApplyNames();

		return result.map((obj) => {
			const newObj: InsightResult = {};
			Object.entries(obj).forEach(([key, value]) => {
				if (applyNames.includes(key)) {
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

}


