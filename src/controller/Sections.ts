export default class Sections {
	private readonly sectionID: string;
	private readonly courseID: string;
	private readonly title: string;
	private readonly instructor: string;
	private readonly department: string;

	private readonly year: number;
	private readonly avg: number;
	private readonly pass: number;
	private readonly fail: number;
	private readonly audit: number;

	constructor(
		sectionID: string,
		courseID: string,
		title: string,
		instructor: string,
		department: string,
		year: number,
		avg: number,
		pass: number,
		fail: number,
		audit: number
	) {
		this.sectionID = sectionID;
		this.courseID = courseID;
		this.title = title;
		this.instructor = instructor;
		this.department = department;
		this.year = year;
		this.avg = avg;
		this.pass = pass;
		this.fail = fail;
		this.audit = audit;
	}

	public getSectionID(): string {
		return this.sectionID;
	}

	public getCourseID(): string {
		return this.courseID;
	}

	public getTitle(): string {
		return this.title;
	}

	public getInstructor(): string {
		return this.instructor;
	}

	public getDepartment(): string {
		return this.department;
	}

	public getYear(): number {
		return this.year;
	}

	public getAvg(): number {
		return this.avg;
	}

	public getPass(): number {
		return this.pass;
	}

	public getFail(): number {
		return this.fail;
	}

	public getAudit(): number {
		return this.audit;
	}


}


