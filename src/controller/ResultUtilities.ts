import {
	InsightError,
	InsightResult,
	ResultTooLargeError,
} from "./IInsightFacade";

export default class ResultUtilities {

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
			return;
		} else if (keysArray.length === 3 && keysArray.includes("WHERE") && keysArray.includes("OPTIONS") &&
		keysArray.includes("TRANSFORMATIONS")) {
			return;
		}
		throw new InsightError("Invalid query! (No OPTIONS or WHERE)");
	}

	public convertBoolean(boolArr: boolean[], dataset: InsightResult[]): InsightResult[] {


		const converted: InsightResult[] = dataset.filter((value, index) => {
			if (boolArr[index]) {
				return true;
			}
		});
		return converted;
	}

	public compatibleFormat(queryOperator: any, result: InsightResult[]) {
		const prefix: string = queryOperator.getQueryingDatasetId() + "_";
		const applyNames: string[] = queryOperator.getApplyNames();

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
