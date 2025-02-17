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

		let columns: string[] = queryS.COLUMNS;


		if (columns.length < 1) {
			throw new InsightError("Columns is empty");
		}

		filtered = await this.grabFilteredIfNeeded(transform, columns, filtered);


		columns = this.parseColumns(queryS.COLUMNS);


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

				const toSortBy: string =  this.queryOperator.parseField(order);
				this.checkOneWaySortBy(columns, toSortBy);

				this.oneWaySort(updatedArray, toSortBy);

			} else if (typeof queryS.ORDER === "object" && queryS.ORDER !== null) {
				this.checkDirectionalOrderKeys(queryS);
				const orderDir: string = queryS.ORDER.dir;
				const toSortBy: string[] = this.parseColumns(queryS.ORDER.keys);
				this.checkDirectionalSortBy(toSortBy, columns);

				this.directionalSort(updatedArray, toSortBy, orderDir);
			} else {
				throw new InsightError("Invalid Order Config");
			}
		}

		return updatedArray;
	}


	private checkOneWaySortBy(columns: string[], toSortBy: string) {
		if (!columns.includes(toSortBy)) {
			throw new InsightError("Sort key is not present in columns.");
		}
	}

	private checkDirectionalSortBy(toSortBy: string[], columns: string[]) {
		if (!toSortBy.every((key) => columns.includes(key))) {
			throw new InsightError("One or more sort keys are not present in columns.");
		}
	}

	private checkDirectionalOrderKeys(queryS: any) {
		if (typeof queryS.ORDER.dir !== "string" || !Array.isArray(queryS.ORDER.keys)
			|| !queryS.ORDER.keys.every((key: any) => typeof key === "string")) {
			throw new InsightError("Directional order configuration is invalid.");
		}
	}

	private async grabFilteredIfNeeded(transform: boolean, columns: string[], filtered: InsightResult[]) {
		if (this.queryOperator.emptyWhere && !transform) {
			const datasetHandle: string = this.queryOperator.grabDatasetNameFromQueryKey(columns[0]);
			await this.queryOperator.validateAndSetDataset(datasetHandle);
			filtered = this.queryOperator.getDataset();
		}
		return filtered;
	}

	private oneWaySort(array: InsightResult[], key: string): InsightResult[] {
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

	private directionalSort(array: InsightResult[], keys: string[], direction: string): InsightResult[] {
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
