export default class CountdownController {
	constructor(scene, label) {
		this.scene = scene;
		this.label = label;
	}

	start(duration, finishedCallback) {
		this.stop()

		this.finishedCallback = finishedCallback
		this.remainingTime = duration;

		this.timerEvent = this.scene.time.addEvent({
			delay: 1000,
			repeat: duration / 1000,
			callback: () => {
				this.remainingTime -= 1000;
				this.label.text = this.remainingTime / 1000;
				
				if (this.remainingTime <= 0) {
					if (this.finishedCallback) {
						this.finishedCallback()
					}
					this.stop();
				}
			}
		})
		return this;
	}

	stop() {
		if (this.timerEvent) {
			this.timerEvent.destroy()
			this.timerEvent = undefined
		}
	}

}