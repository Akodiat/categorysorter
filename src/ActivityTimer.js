
class ActivityTimer {
    idleTimer;
    stopwatchTimer;
    activeTime;
    lastActiveTimestamp;
    lastTickTimestamp;

    constructor(
        idleTime = 5 * 60, // 5 minutes
        tickLength = 60, // 1 minute
        initialActiveTime = 0,
        onUpdate = ()=>{}
    ) {
        this.idleTime = idleTime;
        this.tickLength = tickLength;
        this.onUpdate = onUpdate;
        this.reset(initialActiveTime);
    }

    // Get current timestamp
    getCurrentTime() {
        return Date.now() / 1000; // Milliseconds to seconds
    }

    // Reset the activity timer
    reset(initialActiveTime = 0) {
        this.activeTime = initialActiveTime;
        const currentTimestamp = this.getCurrentTime();
        this.lastActiveTimestamp = currentTimestamp;
        this.lastTickTimestamp = currentTimestamp;
        this.resetIdleTimer();
    }

    // Reset the idle timer
    // To be called when the user is active
    resetIdleTimer() {
        this.lastActiveTimestamp = this.getCurrentTime();
        clearTimeout(this.idleTimer);
        this.idleTimer = setTimeout(
            ()=>this.stop(),
            this.idleTime * 1000 // Seconds to milliseconds
        );
        if (this.stopwatchTimer === undefined) {
            // If we resume after being idle, reset
            // the last tick timestamp
            this.lastTickTimestamp = this.lastActiveTimestamp;
            this.start();
        }
    }

    // Stop the activity timer
    stop() {
        // Do one last tick
        const currentTimestamp = this.getCurrentTime();
        this.activeTime += currentTimestamp - this.lastTickTimestamp;

        // Remove the time passed since last activity was detected
        const idleDuration = currentTimestamp-this.lastActiveTimestamp;
        this.activeTime -= idleDuration;

        console.log(`User has been idle for ${idleDuration}s. Timer stopped at ${this.activeTime}s.`);
        clearTimeout(this.stopwatchTimer);
        this.stopwatchTimer = undefined;

        this.onUpdate(this.activeTime);
    }

    // Start or continue the activity timer
    // This is also called after every tick
    start() {
        this.stopwatchTimer = setTimeout(
            ()=>this.tick(),
            this.tickLength * 1000 // Seconds to milliseconds
        )
    }

    // Handle a timestep, update active time
    tick() {
        // Change this to using timestap if
        // you need more accuracy
        const currentTimestamp = this.getCurrentTime();
        this.activeTime += currentTimestamp - this.lastTickTimestamp;
        this.lastTickTimestamp = currentTimestamp;

        console.log(`${this.activeTime}s`);
        this.onUpdate(this.activeTime);
        this.start();
    }
}

export {ActivityTimer}