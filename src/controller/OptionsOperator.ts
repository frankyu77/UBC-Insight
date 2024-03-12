import {InsightError, InsightResult} from "./IInsightFacade";
import QueryOperator from "./QueryOperator";
export default class OptionsOperator {
	private queryOperator: QueryOperator;
	constructor(queryOperator: QueryOperator) {
		this.queryOperator = queryOperator;
	}

	public handleOptions(queryS: any, filtered:  InsightResult[]): InsightResult[] {

        // If columns not present throw error
		let keys = Object.keys(queryS);


        // Check if there is a key that does not match the valid options keys
		const invalidKey = keys.some((key) => !this.queryOperator.optionsKey.includes(key));
		if (invalidKey) {
			throw new InsightError("Invalid key in OPTIONS");
		}

		if (!keys.includes("COLUMNS")) {
			throw new InsightError("No columns");
		}

        // Columns to keep
		const columns: string[] = this.parseColumns(queryS.COLUMNS);

		if (columns.length < 1) {
			throw new InsightError("Columns is empty");
		}

        // Filters for the needed columns
		const updatedArray: InsightResult[] = filtered.map((insight) => {
			let newInsight: InsightResult = {};
			columns.forEach((field) => {
                // Object.prototype.hasOwnProperty.call(insight, field
				if(Object.prototype.hasOwnProperty.call(insight, field)) {
					newInsight[field] = insight[field];
				}
			});
			return newInsight;
		});

		if (keys.includes("ORDER")) {
			const toSortBy: string = this.queryOperator.parseField(queryS.ORDER);
			if (!columns.includes(toSortBy)) {
				throw new InsightError("Sort key is not present in columns.");
			}
			updatedArray.sort((a, b) => {
				if (a[toSortBy] < b[toSortBy]) {
					return -1;
				}
				if (a[toSortBy] > b[toSortBy]) {
					return 1;
				}
				return 0;
			});
		}

		return updatedArray;
	}

	private parseColumns(columns: string[]) {
		let parsedColumns: string[] = columns.map((item) => {
			return this.queryOperator.parseField(item);
		});
		return parsedColumns;
	}
}
