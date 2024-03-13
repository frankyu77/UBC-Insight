import Decimal from "decimal.js";
import {InsightError, InsightResult} from "./IInsightFacade";
import QueryOperator from "./QueryOperator";
export default class TransformOperator {
	private queryOperator: QueryOperator;
	constructor(queryOperator: QueryOperator) {
		this.queryOperator = queryOperator;
	}

	public handleTransformations(query: any, result: InsightResult[]): InsightResult[] {
        // Check keys length and its names
		this.validateTransformationKeys(query);
		let grouped: Map<string, InsightResult[]>  = this.handleGroup(query, result);

		let applyArray: string[] = query.APPLY;


        // Take each group
		grouped.forEach((groupArray: InsightResult[]) => {
			applyArray.forEach((value, index, array) =>  {
				const applyKeyArray: string[] =  Object.keys(value);
				const applyName = applyKeyArray[0];
				const applyRuleArray: string[] = Object.values(value);
				const applyRule: string = applyRuleArray[0];

				// if (this.queryOperator.applyNames.includes(applyName)) {
				// 	throw new InsightError("Duplicate apply names identified");
				// }

                // Calculate apply rule
				const calculatedApplyRule: number = this.calculateApplyRule(applyRule, groupArray);

                // Add to the current groupArray with the right applyName
				groupArray[0][applyName] = calculatedApplyRule;
				this.queryOperator.applyNames.push(applyName);
			});
		});

        // only take the first of each array in every value of the map
		result = [];
		grouped.forEach( (value, key, map) => {
			result.push(value[0]);
		});

		return result;
	}

	private calculateApplyRule(applyRuleObject: string, groupArray: InsightResult[]): number {

		const applyKeyArray: string[] =  Object.keys(applyRuleObject);
		const applyValueArray: string[] = Object.values(applyRuleObject);
		const parsedField: string = this.queryOperator.parseField(applyValueArray[0]);
		switch (applyKeyArray[0]) {
			case "MIN" : {
				let smallest: number = Number.MAX_VALUE;
				for (let i = 1; i < groupArray.length; i++) {
					if (Number(groupArray[i][parsedField]) < smallest) {
						smallest = Number(groupArray[i][parsedField]);
					}
				}
				return smallest;
			}
			case "AVG" : {
				let totalAvg : Decimal = new Decimal(0);
				for (let i = 1; i < groupArray.length; i++) {
					let decimal = new Decimal(groupArray[i][parsedField]);
					totalAvg = totalAvg.add(decimal); // Update totalAvg with the new value
				}
				let avg = totalAvg.toNumber() / groupArray.length - 1;
				return Number(avg.toFixed(2));
			}

			case "SUM": {
				let totalSum : Decimal = new Decimal(0);
				for (let i = 1; i < groupArray.length; i++) {
					let decimal = new Decimal(groupArray[i][parsedField]);
					totalSum = totalSum.add(decimal);
				}
				return Number(totalSum.toFixed(2));
			}
			case "MAX" : {
				let largest: number = Number.MIN_VALUE;
				for (let i = 1; i < groupArray.length; i++) {
					if (Number(groupArray[i][parsedField]) > largest) {
						largest = Number(groupArray[i][parsedField]);
					}
				}
				return largest;
			}
			case "COUNT" : {
				const occurrences = new Map<number | string, number>();

				for (let i = 1; i < groupArray.length; i++) {
					const currentCount = occurrences.get(groupArray[i][parsedField]) || 0;
					occurrences.set(groupArray[i][parsedField], currentCount + 1);
				}
				return occurrences.size; // This is the sum of all occurrences.
			}
		}
		return 0;
	}

	private handleGroup(query: any, result: InsightResult[]) {
		let groupsArray: string[] = query.GROUP;
		let map: Map<string, InsightResult[]> = new Map<string, InsightResult[]>();
		let tempResult: InsightResult = {};

        // Iterate sections in result
		result.forEach((section, index) => {

            // Create a groupKey for the section to match in maps.
			let groupKey: string = "";

			groupsArray.forEach((mOrSkey) => {
				const parsedField: string = this.queryOperator.parseField(mOrSkey);
				groupKey += section[parsedField] + " |";
				tempResult[parsedField] = section[parsedField];
			});

			groupKey += " group";

			if (!map.has(groupKey)) {
				map.set(groupKey, [tempResult]);
			}

			map.get(groupKey)?.push(section);
			tempResult = {};

		});
		return map;
	}

	private validateTransformationKeys(query: any): void {
		return;
	}
}
