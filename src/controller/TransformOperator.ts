import Decimal from "decimal.js";
import {InsightError, InsightResult} from "./IInsightFacade";
import QueryOperator from "./QueryOperator";
export default class TransformOperator {
	private queryOperator: QueryOperator;
	constructor(queryOperator: QueryOperator) {
		this.queryOperator = queryOperator;
	}

	public async handleTransformations(query: any, result: InsightResult[]): Promise<InsightResult[]> {
		// Check keys length and its names
		this.validateTransformationKeys(query);
		let grouped: Map<string, InsightResult[]> = await this.handleGroup(query, result);

		let applyArray: string[] = query.APPLY;

		for (let groupArray of grouped.values()) {
			const localApplyNames = new Set<string>();

			for (let value of applyArray) {
				const applyKeyArray: string[] = Object.keys(value);
				const applyName = applyKeyArray[0];
				const applyRuleArray: string[] = Object.values(value);
				const applyRule: string = applyRuleArray[0];

				if (localApplyNames.has(applyName)) {
					throw new InsightError("Duplicate apply names identified");
				}

				// Calculate apply rule
				const calculatedApplyRule: number = this.calculateApplyRule(applyRule, groupArray);

				// Add to the current groupArray with the right applyName
				groupArray[0][applyName] = calculatedApplyRule;
				localApplyNames.add(applyName);
			}
			this.queryOperator.applyNames = localApplyNames;
		}

		// only take the first of each array in every value of the map
		result = [];
		grouped.forEach((group) => {
			result.push(group[0]);
		});
		return result;
	}

	private  calculateApplyRule(applyRuleObject: string, groupArray: InsightResult[]): number {
		const applyKeyArray: string[] = Object.keys(applyRuleObject);
		const applyValueArray: string[] = Object.values(applyRuleObject);
		const parsedField: string = this.queryOperator.parseField(applyValueArray[0]);
		switch (applyKeyArray[0]) {
			case "MIN" : {
				return this.min(groupArray, parsedField);
			}
			case "AVG" : {
				let avg = this.sum(groupArray, parsedField).toNumber() / (groupArray.length - 1);
				return Number(avg.toFixed(2));
			}

			case "SUM": {
				let totalSum = this.sum(groupArray, parsedField);
				return Number(totalSum.toFixed(2));
			}
			case "MAX" : {
				return this.max(groupArray, parsedField);
			}
			case "COUNT" : {
				const occurrences = this.getOccurences(groupArray, parsedField);
				return occurrences.size;
			}
			default : {
				throw new InsightError("Invalid apply token.");
			}
		}
	}


	private getOccurences(groupArray: InsightResult[], parsedField: string) {
		const occurrences = new Map<number | string, number>();
		for (let i = 1; i < groupArray.length; i++) {
			const currentCount = occurrences.get(groupArray[i][parsedField]) || 0;
			occurrences.set(groupArray[i][parsedField], currentCount + 1);
		}
		return occurrences;
	}

	private max(groupArray: InsightResult[], parsedField: string) {
		let largest: number = Number.MIN_VALUE;
		for (let i = 1; i < groupArray.length; i++) {
			if (Number(groupArray[i][parsedField]) > largest) {
				largest = Number(groupArray[i][parsedField]);
			}
		}
		return largest;
	}

	private min(groupArray: InsightResult[], parsedField: string) {
		let smallest: number = Number.MAX_VALUE;
		for (let i = 1; i < groupArray.length; i++) {
			if (Number(groupArray[i][parsedField]) < smallest) {
				smallest = Number(groupArray[i][parsedField]);
			}
		}
		return smallest;
	}

	private sum(groupArray: InsightResult[], parsedField: string) {
		let totalSum: Decimal = new Decimal(0);
		for (let i = 1; i < groupArray.length; i++) {
			let decimal = new Decimal(groupArray[i][parsedField]);
			totalSum = totalSum.add(decimal);
		}
		return totalSum;
	}

	private async handleGroup(query: any, result: InsightResult[]): Promise<Map<string, InsightResult[]>> {
		let groupsArray: string[] = query.GROUP;
		let map: Map<string, InsightResult[]> = new Map<string, InsightResult[]>();
		let tempResult: InsightResult = {};
		if (this.queryOperator.emptyWhere) {
			const datasetName: string = this.queryOperator.grabDatasetNameFromQueryKey(groupsArray[0]);
			await this.queryOperator.validateAndSetDataset(datasetName);
			result = this.queryOperator.getDataset();
		}

		for (let section of result) {
			let groupKey: string = "";

			for (let mOrSkey of groupsArray) {
				const parsedField: string = this.queryOperator.parseField(mOrSkey);
				groupKey += section[parsedField] + " |";
				tempResult[parsedField] = section[parsedField];
			}

			groupKey += " group";

			if (!map.has(groupKey)) {
				map.set(groupKey, [tempResult]);
			}

			map.get(groupKey)?.push(section);
			tempResult = {};
		}
		return map;
	}

	private validateTransformationKeys(query: any): void {
		const transformationKeys: string[] = Object.keys(query);
		if (transformationKeys.length === 2 && transformationKeys.includes("GROUP") &&
			transformationKeys.includes("APPLY")) {
			return;
		}
		throw new InsightError("Invalid transformation keys.");
	}
}
