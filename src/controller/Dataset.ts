import Section from "./Section";
import {InsightDatasetKind} from "./IInsightFacade";

export default class Dataset {
	private idName: string = "";
	private validSections: Section[] = [];
	private kind: InsightDatasetKind = InsightDatasetKind.Sections;
	private isValidDataset: boolean = false;

	public setIDName(id: string) {
		this.idName = id;
	}

	public addValidSection(section: Section) {
		this.validSections.push(section);
	}

	public setKind(datasetKind: InsightDatasetKind) {
		this.kind = datasetKind;
	}

	public setValidity(bool: boolean) {
		this.isValidDataset = bool;
	}

	public getIDName() {
		return this.idName;
	}

	public getValidSections() {
		return this.validSections;
	}

	public getKind() {
		return this.kind;
	}

	public getValidity() {
		return this.isValidDataset;
	}
}
