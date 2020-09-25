import fs from "fs";

const FILE_PATH = "./db/followers.json";

const save = (data) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(FILE_PATH, data, (err) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(data);
    });
  });
}

const load = () => {
  return new Promise((resolve, reject) => {
    fs.readFile(FILE_PATH, (err, result) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(JSON.parse(resolve.toString()));
    });
  });
}

export {
  save,
  load
}