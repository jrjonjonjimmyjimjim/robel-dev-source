// Idea: robot warehouse, packages come in asking to be delivered to the correct person
// Depending on the destination, packages need to be routed to different trucks
// Robot will pick up a package and bring it to a truck
// Packages can be low, medium, high priority
// User can add a package and give it a destination; it will be given very high priority
//      - Robot will immediately be assigned to pick up the package and bring it to the correct truck
//      - Upon being put in the truck, the truck will immediately leave
// After the warehouse simulation, can add a delivery simulation

const ROBOT_SPEED = 1;

const Enums = {
    'Directive': { // Robot states
        'Idle': 0, // Stopped in place.
        'Fetch': 1, // Moving to pick up package.
        'Deliver': 2, // Delivering package to truck.
        'Shutdown': 3 // Moving back to charge station.
    }
};

class Destination {
    constructor(zipcode, state, city, street) {
        this.zipcode = zipcode;
        this.state = state;
        this.city = city;
        this.street = street;
    }
}

class Robot {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.currPackage = null;
        this.currDirective = Enums.Directive.Idle;
    }

    tick() {
        switch (this.currDirective) {
            case Enums.Directive.Idle:
                break;
            case Enums.Directive.Fetch:
                if (this.currPackage) {
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
                break;
            case Enums.Directive.Shutdown:
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

class Truck {
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

let robots = [];
let packages = [];

function init() {
    const canvas = document.getElementById("canvas");
    if (canvas.getContext) {
    
        for (let i = 0; i < 6; i++) {
            robots.push(
                new Robot(700, i * 80 + 50)
            );
        }

        for (let i = 0; i < 10; i++) {
            packages.push(
                new Package(i * 80 + 20, 20, new Destination('12345-6789', 'CO', 'Denver', '123 Adventure St'))
            );
        }
        
        robots[0].currPackage = packages[0];
        robots[0].currDirective = Enums.Directive.Fetch;
        window.requestAnimationFrame(draw);
    }


}

function draw() {
    const canvas = document.getElementById("canvas");

    if (canvas.getContext) {
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, 800, 500);
        ctx.strokeRect(0, 0, 800, 500);

        for (let robot of robots) {
            robot.tick(ctx);
            robot.draw(ctx);
        }

        for (let package of packages) {
            package.draw(ctx);
        }

        window.requestAnimationFrame(draw);
    }
}

init();