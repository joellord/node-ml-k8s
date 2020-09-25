// Scrape profile pictures from Twitter followers

const Twitter = require("twitter");
const keys = require("./keys.json");

const request = require("request");
const fs = require("fs");

const client = new Twitter(keys);

let downloadImage = (uri, filename) => {
  let p = new Promise((resolve, reject) => {
    request.head(uri, (err, res, body) => {
      try {
        request(uri).pipe(fs.createWriteStream(filename)).on("close", resolve());
      } catch(e) {
        reject(e);
      }
    });
  });

  return p;
}

let fetchUsers = (cursor) => {
  let p = new Promise((resolve, reject) => {
    client.get("followers/list", {cursor: cursor ? cursor : -1, count: 200}, (err, results) => {
      if (err) {
        console.log("Rate limit exceeded");
        process.exit(err[0].code);
        reject(err);
        return;
      }
      
      console.log("Fetched 200 followers");
      resolve(results);
      return;
    });
  });

  return p;
}

let fetchAllUsers = async () => {
  let p = new Promise(async (resolve, reject) => {
    const imgLinks = [];

    let results = await fetchUsers().catch(e => console.log(e));
  
    while (results.next_cursor_str != "0") {
      console.log(`Cursor ${results.next_cursor_str}`)
      results.users.map(follower => {
        let img = follower.profile_image_url;
        let link = {
          handle: follower.screen_name,
          image: img.replace("_normal", ""),
          extension: img.substr(img.lastIndexOf(".") + 1).toLowerCase().replace(/[^a-z]/g, "")
        }
        imgLinks.push(link);
      });
  
      results = await fetchUsers(results.next_cursor_str).catch(e => console.log(e));
    }

    resolve(imgLinks);
  });

  return p;
}

fetchAllUsers().then(data => {
  console.log(`Fetched ${data.length} followers`);
  fs.writeFileSync("followers.json", JSON.stringify(data));
  return data;
}).then(async (imgLinks) => {
  console.log(`Preparing to fetch ${imgLinks.length} profile pictures`);

  for (let i = 0; i < imgLinks.length; i++) {
    try {
      await downloadImage(imgLinks[i].image, `known_faces/${imgLinks[i].handle}.${imgLinks[i].extension}`);
    } catch (e) {
      console.log(`Failed to download image for ${imgLinks[i].handle}`);
      console.log(e);
    }
  }
});

// client.get("followers/list", async (err, results) => {
//   let imgLinks = [];
//   console.log(`Found ${results.users.length} followers`);
//   results.users.map(follower => {
//     let img = follower.profile_image_url;
//     let link = {
//       handle: follower.screen_name,
//       image: img.replace("_normal", ""),
//       extension: img.substr(img.lastIndexOf(".") + 1)
//     }
//     imgLinks.push(link);
//   });

//   console.log(`Preparing to fetch ${imgLinks.length} profile pictures`);

//   for (let i = 0; i < imgLinks.length; i++) {
//     await downloadImage(imgLinks[i].image, `known_faces/${imgLinks[i].handle}.${imgLinks[i].extension}`);
//   }

//   console.log("Done");
// });