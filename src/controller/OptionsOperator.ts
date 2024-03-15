import {InsightError, InsightResult} from "./IInsightFacade";
import QueryOperator from "./QueryOperator";
export default class OptionsOperator {
	private queryOperator: QueryOperator;
	private optionsKey = ["COLUMNS", "ORDER"];

	constructor(queryOperator: QueryOperator) {
		this.queryOperator = queryOperator;
	}

	public async handleOptions(queryS: any, filtered: InsightResult[], transform: boolean): Promise<InsightResult[]> {

		// If columns not present throw error
		let keys = Object.keys(queryS);

		// Check if there is a key that does not match the valid options keys
		const invalidKey = keys.some((key) => !this.optionsKey.includes(key));
		if (invalidKey) {
			throw new InsightError("Invalid key in OPTIONS");
		}

		if (!keys.includes("COLUMNS")) {
			throw new InsightError("No columns");
		}


		if (this.queryOperator.emptyWhere && !transform) {
			let columns: string[] = queryS.COLUMNS;
			const datasetHandle: string = this.queryOperator.grabDatasetNameFromQueryKey(columns[0]);
			await this.queryOperator.validateAndSetDataset(datasetHandle);
			filtered = this.queryOperator.getDataset();
		}


		let columns: string[] = this.parseColumns(queryS.COLUMNS);

		if (columns.length < 1) {
			throw new InsightError("Columns is empty");
		}


		// Filters for the needed columns
		let updatedArray: InsightResult[] = filtered.map((insight) => {
			let newInsight: InsightResult = {};
			columns.forEach((field) => {
				if (Object.prototype.hasOwnProperty.call(insight, field)) {
					newInsight[field] = insight[field];
				} else {
					throw new InsightError("Keys in COLUMNS must be in GROUP or APPLY");
				}
			});
			return newInsight;
		});

		if (keys.includes("ORDER")) {
			if (typeof queryS.ORDER === "string") {
				const order: string = queryS.ORDER;

				// Handle the case where "ORDER" is a string
				const toSortBy: string =  this.queryOperator.parseField(order);
				if (!columns.includes(toSortBy)) {
					throw new InsightError("Sort key is not present in columns.");
				}

				this.staticSort(updatedArray, toSortBy);

			} else if (typeof queryS.ORDER === "object" && queryS.ORDER !== null) {
				const orderObjectKeys: string[] = Object.keys(queryS.ORDER);
				const orderObjectVals = Object.values(queryS.ORDER);
				const orderDir: string = queryS.ORDER.dir;
				const orderKeyList: string[] = queryS.ORDER.keys;
				// Check if order object has correct keys

				this.dynamicSort(updatedArray, orderKeyList, orderDir);

			} else {
				throw new InsightError("Invalid Order Config");
			}

		}

		return updatedArray;
	}


	private staticSort(array: InsightResult[], key: string): InsightResult[] {
		return array.sort((a, b) => {
			if (a[key] < b[key]) {
				return -1;
			}
			if (a[key] > b[key]) {
				return 1;
			}
			return 0;
		});
	}

	private dynamicSort(array: InsightResult[], keys: string[], direction: string): InsightResult[] {
		return array.sort((a, b) => {
			let sort: number;
			for (let key of keys) {
				if (a[key] !== b[key]) {
					// Assuming we are sorting strings or numbers only
					if (a[key] < b[key]) {
						sort = -1;
					}
					if (a[key] > b[key]) {
						sort = 1;
					}
				}
			}
			sort = 0; // if all keys are equal

			if (direction === "UP") {
				return sort;
			} else if (direction === "DOWN") {
				return sort * -1;
			} else {
				throw new InsightError("Invalid direction in sort");
			}
		});
	}

	private parseColumns(columns: string[]): string[] {
		const parsedColumnsPromises = columns.map((item) => this.queryOperator.parseField(item));
		return  (parsedColumnsPromises);
	}

}
