import {InsightDataset, InsightDatasetKind} from "./IInsightFacade";

export default class InsightDatasetObject implements InsightDataset {
	public id: string = "";
	public kind: InsightDatasetKind = InsightDatasetKind.Sections;
	public numRows: number = 0;

	public setID(id: string) {
		this.id = id;
	}

	public setKind(kind: string) {
		if (kind === "sections") {
			this.kind = InsightDatasetKind.Sections;
		}
		this.kind = InsightDatasetKind.Rooms;
	}

	public setNumRows(num: number) {
		this.numRows = num;
	}
}
