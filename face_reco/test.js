import fs from "fs";

const files = fs.readdirSync("../scrape_faces/known_faces");

console.log(files);