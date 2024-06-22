const fs = require("node:fs/promises")
const { app } = require("electron")

// import fs from "node:fs/promises";
// import { app } from "electron";

// export  let logger = async (error, type) => {
 let logger = async (error, type) => {
  let date = new Date();

  let dateError = date.toString();

  let monthPart = date.getMonth() + 1;
  let dateFilePart = date.toISOString().split("T")[0];

  // console.log(dateFilePart);

  let userPath = app.getPath("documents");
  let logFolder = userPath + "/PSM_DB_logs";
  try {
    await fs.readdir(userPath + "/PSM_DB_logs");
  } catch (rej) {
    await fs.mkdir(userPath + "/PSM_DB_logs");
  }

  try {
    await fs.readdir(`${logFolder}/${date.getFullYear()}`);
  } catch (rej) {
    await fs.mkdir(`${logFolder}/${date.getFullYear()}`);
  }

  logFolder = `${logFolder}/${date.getFullYear()}`;

  try {
    await fs.readdir(
      `${logFolder}/${monthPart}.${date.toLocaleString("en-us", {
        month: "long",
      })}`
    );
  } catch (rej) {
    await fs.mkdir(
      `${logFolder}/${monthPart}.${date.toLocaleString("en-us", {
        month: "long",
      })}`
    );
  }

  let logFolderWithMonth = `${logFolder}/${monthPart}.${date.toLocaleString(
    "en-us",
    { month: "long" }
  )}`;

  try {
    await fs.readdir(`${logFolderWithMonth}/${dateFilePart}`);
  } catch (rej) {
    await fs.mkdir(`${logFolderWithMonth}/${dateFilePart}`);
  }

  let logFinalFolder = `${logFolderWithMonth}/${dateFilePart}`;

  console.log(logFinalFolder);

  switch (type) {
    case "error": {
      try {
        fs.readFile(`${logFinalFolder}/errors.txt`);

        fs.appendFile(
          `${logFinalFolder}/errors.txt`,
          `[${dateError}] {${error}} \n\n`,
          {
            encoding: "utf-8",
          }
        );
      } catch (rej) {
        fs.writeFile(
          `${logFinalFolder}/errors.txt`,
          `[${dateError}] {${error}} \n\n`,
          {
            encoding: "utf-8",
          }
        );
      }

      break;
    }
    case "info": {
      try {
        fs.readFile(`${logFinalFolder}/info.txt`);

        fs.appendFile(
          `${logFinalFolder}/info.txt`,
          `[${dateError}] {${error}} \n\n`,
          {
            encoding: "utf-8",
          }
        );
      } catch (rej) {
        fs.writeFile(
          `${logFinalFolder}/info.txt`,
          `[${dateError}] {${error}} \n\n`,
          {
            encoding: "utf-8",
          }
        );

        break;
      }
    }

    // console.log(logFolder);
    // fs.readFile()
  }
};


module.exports = {
  logger
}
