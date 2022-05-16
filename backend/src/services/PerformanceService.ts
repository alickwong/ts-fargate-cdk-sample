export default class PerformanceService {
	private hrStart: any;
	private timeLogList: any[] = [];

	public startTimer() {
		this.timeLogList = [];
		this.hrStart = process.hrtime();
	}

	public getCurrentHrEndMessage() {
		let hrend = process.hrtime(this.hrStart);
		return hrend[1] / 1000000;
	}

	public addTimeLog(actionName: string) {
		console.log(2322222);
		this.timeLogList.push({ action: actionName, timeUsed: this.getCurrentHrEndMessage() + 'ms' });
	}

	public getTimeLogList() {
		return this.timeLogList;
	}
}
