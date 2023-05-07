// Idea: robot warehouse, packages come in asking to be delivered to the correct person
// Depending on the destination, packages need to be routed to different trucks
// Robot will pick up a package and bring it to a truck
// Packages can be low, medium, high priority
// User can add a package and give it a destination; it will be given very high priority
//      - Robot will immediately be assigned to pick up the package and bring it to the correct truck
//      - Upon being put in the truck, the truck will immediately leave
// After the warehouse simulation, can add a delivery simulation

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

    draw(canvasElement) {
        canvasElement.strokeStyle = "#555555";
        canvasElement.fillStyle = "#888888";
        canvasElement.fillRect(this.x, this.y, 50, 50);
        canvasElement.strokeRect(this.x, this.y, 50, 50);
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
        canvasElement.fillRect(this.x, this.y, 40, 40);
        canvasElement.strokeRect(this.x, this.y, 40, 40);
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
        canvasElement.fillRect(this.x, this.y, 50, 50);
        canvasElement.strokeRect(this.x, this.y, 50, 50);
    }
}

function init() {
    const canvas = document.getElementById("canvas");
    if (canvas.getContext) {
        const ctx = canvas.getContext("2d");

        ctx.fillStyle = "rgb(200, 0, 0)";
        ctx.fillRect(10, 10, 50, 50);

        ctx.fillStyle = "rgba(0, 0, 200, 0.5)";
        ctx.fillRect(30, 30, 50, 50);



        let robots = [];
        let packages = [];
    
        const robot1 = new Robot(50, 50);
        robots.push(robot1);
        const robot2 = new Robot(250, 250);
        robots.push(robot2);

        const package1 = new Package(500, 300, new Destination('12345-6789', 'CO', 'Denver', '123 Adventure St'));
        packages.push(package1);
        const package2 = new Package(400, 300, new Destination('12345-6789', 'CO', 'Denver', '416 Saratoga Ave'));
        packages.push(package2);
        
        for (let robot of robots) {
            robot.draw(ctx);
        }

        for (let package of packages) {
            package.draw(ctx);
        }
    }


}

init();