export default class Queue<T> {
	private storage: T[] = [];

	public enqueue(item: T) {
		this.storage.push(item);
	}

	public dequeue(): T {
		if (this.storage.length !== 0) {
			const item = this.storage.shift()!;
			if (typeof item === "undefined") {
				throw new Error("Attempted to dequeue an item of the wrong type.");
			}
			return item as T;
		} else {
			throw new Error("Queue is empty.");
		}
	}

	public size(): number {
		return this.storage.length;
	}

	public isEmpty(): boolean {
		if (this.storage.length > 0) {
			return false;
		}
		return true;
	}
}
