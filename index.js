// Idea: robot warehouse, packages come in asking to be delivered to the correct person
// Depending on the destination, packages need to be routed to different belts
// Robot will pick up a package and bring it to a belt
// Packages can be low, medium, high priority
// User can add a package and give it a destination; it will be given very high priority
//      - Robot will immediately be assigned to pick up the package and bring it to the correct belt
//      - Upon being put in the belt, the package will immediately leave
// After the warehouse simulation, can add a delivery simulation

// If you want robots to avoid colliding with each other, you can create "pathway" classes
// which are lines on the ground. Each "pathway" must be reserved by a robot, and if a
// robot doesn't know which pathway it's going to next, it idles on its current path until
// a pathway frees up

const ROBOT_SPEED = 2; // TODO: If the integer doesn't hit perfectly, the robot gets stuck

const Enums = {
    'Directive': { // Robot states
        'Idle': 0, // Stopped in place.
        'Fetch': 1, // Moving to pick up package.
        'Deliver': 2, // Delivering package to belt.
        'Shutdown': 3, // Moving back to charge station.
    },
};

class Path { // Dispatcher can return a series of paths to the destination rather than the destination itself
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.occupied = false;
    }

    draw(canvasElement) {
        canvasElement.fillStyle = "#0099ff";
        canvasElement.fillRect(this.x - 35, this.y, 80, 10);
        canvasElement.fillRect(this.x, this.y - 35, 10, 80);
    }
}

class Charger {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    draw(canvasElement) {
        canvasElement.strokeStyle = "#00aa00";
        canvasElement.fillStyle = "#008800";
        canvasElement.fillRect(this.x - 30, this.y - 30, 60, 60);
        canvasElement.strokeRect(this.x - 30, this.y - 30, 60, 60);
    }
}

class Robot { // Status light on robot depending upon its state
    constructor(x, y, batteryLevel) {
        this.x = x;
        this.y = y;
        this.batteryLevel = batteryLevel;
        this.currPackage = null;
        this.chargeStation = null;
        this.currDirective = Enums.Directive.Idle;
    }

    tick() {
        switch (this.currDirective) {
            case Enums.Directive.Idle:
                break;
            case Enums.Directive.Fetch:
                if (this.currPackage) { // TODO: Consolidate movement logic into one place such that movement code to package, charger, and belt isn't copied
                    if (this.x < this.currPackage.x) {
                        this.x += ROBOT_SPEED;
                    } else if (this.x > this.currPackage.x) {
                        this.x -= ROBOT_SPEED;
                    } else if (this.y < this.currPackage.y) {
                        this.y += ROBOT_SPEED;
                    } else if (this.y > this.currPackage.y) {
                        this.y -= ROBOT_SPEED;
                    } else {
                        this.currDirective = Enums.Directive.Deliver;
                    }
                }
                break;
            case Enums.Directive.Deliver:
                if (this.currPackage.destination) {
                    if (this.x < this.currPackage.destination.x) {
                        this.x += ROBOT_SPEED;
                        this.currPackage.x += ROBOT_SPEED;
                    } else if (this.x > this.currPackage.destination.x) {
                        this.x -= ROBOT_SPEED;
                        this.currPackage.x -= ROBOT_SPEED;
                    } else if (this.y < this.currPackage.destination.y) {
                        this.y += ROBOT_SPEED;
                        this.currPackage.y += ROBOT_SPEED;
                    } else if (this.y > this.currPackage.destination.y) {
                        this.y -= ROBOT_SPEED;
                        this.currPackage.y -= ROBOT_SPEED;
                    } else {
                        this.currDirective = Enums.Directive.Shutdown;
                        this.chargeStation = dispatcher.requestCharger();
                    }
                }
                break;
            case Enums.Directive.Shutdown:
                if (this.chargeStation) {
                    if (this.x < this.chargeStation.x) {
                        this.x += ROBOT_SPEED;
                    } else if (this.x > this.chargeStation.x) {
                        this.x -= ROBOT_SPEED;
                    } else if (this.y < this.chargeStation.y) {
                        this.y += ROBOT_SPEED;
                    } else if (this.y > this.chargeStation.y) {
                        this.y -= ROBOT_SPEED;
                    } else {
                        this.currDirective = Enums.Directive.Idle;
                    }
                }
                break;
        }
    }

    draw(canvasElement) {
        canvasElement.strokeStyle = "#555555";
        canvasElement.fillStyle = "#888888";
        canvasElement.fillRect(this.x - 25, this.y - 25, 50, 50);
        canvasElement.strokeRect(this.x - 25, this.y - 25, 50, 50);
    }
}

class Shelf {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    draw(canvasElement) {
        canvasElement.strokeStyle = "#aa0000";
        canvasElement.fillStyle = "#880000";
        canvasElement.fillRect(this.x - 30, this.y - 30, 60, 60);
        canvasElement.strokeRect(this.x - 30, this.y - 30, 60, 60);
    }
}

class Package {
    constructor(x, y, destination) {
        this.x = x;
        this.y = y;
        this.destination = destination;
    }

    draw(canvasElement) {
        canvasElement.strokeStyle = "#c79d6d";
        canvasElement.fillStyle = "#f5c187";
        canvasElement.fillRect(this.x - 20, this.y - 20, 40, 40);
        canvasElement.strokeRect(this.x - 20, this.y - 20, 40, 40);
    }
}

class Belt {
    constructor(x, y, currDirective) {
        this.x = x;
        this.y = y;
        this.currDirective = currDirective;
    }

    draw(canvasElement) {
        canvasElement.strokeStyle = "#a32222";
        canvasElement.fillStyle = "#e83535";
        canvasElement.fillRect(this.x - 25, this.y - 25, 50, 50);
        canvasElement.strokeRect(this.x - 25, this.y - 25, 50, 50);
    }
}

class Dispatcher { // TODO: convert to singleton
    constructor() {
        this.paths = [];
        this.chargers = [];
        this.robots = [];
        this.shelves = [];
        this.packages = [];
        this.belts = [];

        const horizontalPaths = Math.floor((window.innerWidth - 100) / 80);
        const verticalPaths = Math.floor((window.innerHeight - 100) / 80);
        for (let i = 0; i < verticalPaths; i++) {
            const pathRow = [];
            for (let j = 0; j < horizontalPaths; j++) {
                pathRow.push(
                    new Path(j * 80 + 50, i * 80 + 100)
                );
            }
            this.paths.push(pathRow);
        }

        for (let i = 0; i < verticalPaths; i++) {
            if (i % 2 === 0) {
                this.chargers.push(
                    new Charger(horizontalPaths * 80 + 20, i * 80 + 105)
                );
            }
            this.robots.push(
                new Robot(horizontalPaths * 80 + 20, i * 80 + 105)
            );
        }

        for (let i = 0; i < horizontalPaths - 2; i++) {
            this.shelves.push(
                new Shelf(i * 80 + 55, 50, 1)
            );
            this.packages.push(
                new Package(i * 80 + 55, 50, 1)
            );
            if (i % 2 === 0) {
                this.belts.push(
                    new Belt(i * 80 + 55, verticalPaths * 80 + 80)
                );
            }
        }

        this.packages[0].destination = this.belts[0];
        this.robots[0].currPackage = this.packages[0];
        this.robots[0].currDirective = Enums.Directive.Fetch;
    }
    
    requestCharger() {
        return this.chargers[0];
    }

    requestNextPackage() {
        return this.packages[0];
    }

    tick() { // I really don't want dispatcher to have a tick... it might be necessary for new packages

    }
}

let dispatcher = null;

function init() {
    const canvas = document.getElementById("canvas");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    if (canvas.getContext) {
        dispatcher = new Dispatcher();
        window.requestAnimationFrame(draw);
    }


}

function draw() {
    const canvas = document.getElementById("canvas");

    if (canvas.getContext) {
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        ctx.strokeRect(0, 0, window.innerWidth, window.innerHeight);

        for (const pathRow of dispatcher.paths) {
            for (const path of pathRow) {
                path.draw(ctx);
            }
        }

        for (const charger of dispatcher.chargers) {
            charger.draw(ctx);
        }

        for (const belt of dispatcher.belts) {
            belt.draw(ctx);
        }

        for (const shelf of dispatcher.shelves) {
            shelf.draw(ctx);
        }

        for (const robot of dispatcher.robots) {
            robot.tick();
            robot.draw(ctx);
        }

        for (const package of dispatcher.packages) {
            package.draw(ctx);
        }

        window.requestAnimationFrame(draw);
    }
}

init();