// Part 1: Humble Beginnings

// function listInventory(adventurer) {
//   return adventurer.inventory;
// }

// const adventurer = {
//   name: "Robin",
//   health: 10,
//   inventory: ["sword", "potion", "artifact"],
//   companion: {
//     name: "Leo",
//     type: "Cat",
//     petCompanion: {
//       name: "Frank",
//       type: "Flea",
//       pcInventory: ["small hat", "sunglasses"]
//     }
//   },
//   roll(mod = 0) {
//     const result = Math.floor(Math.random() * 20) + 1 + mod;
//     console.log(`${this.name} rolled a ${result}.`);
//   }
// };

// console.log(listInventory(adventurer));

// Part 2: Class Fantasy

class Character {
    constructor(name) {
        this.name = name;
        this.health = 100;
        this.inventory = [];
        this.companion = {
            name: name,
            type: "",
            petCompanion: {
                name: "",
                type: "",
                pcInventory: []
            }
        };
    }
    roll(mod = 0) {
        const result = Math.floor(Math.random() * 20) + 1 + mod;
        console.log(`${this.name} rolled a ${result}.`);
    }
}

const robin = new Character("Robin");
robin.inventory = ["sword", "potion", "artifact"];
robin.companion = new Character("Leo");
robin.companion.type = "Cat";
robin.companion.petCompanion = new Character("Frank");
robin.companion.petCompanion.type = "Flea";
robin.companion.petCompanion.pcInventory = ["small hat", "sunglasses"];

console.log(`${robin.name}
${robin.health} / 100 HP
Inventory: ${robin.inventory}
Companion:
    ${robin.companion.name}
    Type: ${robin.companion.type}
    Pet's Companion:
        ${robin.companion.petCompanion.name}
        Type: ${robin.companion.petCompanion.type}
        Inventory: ${robin.companion.petCompanion.pcInventory}\n`
);

robin.roll();

// Part 3: Class Features

class Adventurer extends Character {
    constructor(name, role) {
        super(name);
        this.role = role;
        this.inventory.push("bedroll", "50 gold");
    }

    rest() {
        this.health = 100;
        console.log(`${this.name} rests and recovers to full health.`);
    }

    scout() {
        console.log(`${this.name} scouts ahead...`);
    }
}