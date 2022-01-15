const axios = require('axios');
const fs = require('fs');
const path = require('path');
const diff = require('diff');

function folderCheck(path, repositoryUrl, folder, files = []) {
  try {
    fs.readdirSync(path).forEach(file => {
      if (fs.lstatSync(`${path}/${file}`).isDirectory()) {
        folderCheck(`${path}/${file}`, repositoryUrl, folder, files);
      } else {
        if (repositoryUrl.includes('github.com')) {
          let filePath = repositoryUrl.split('github.com')[1].slice(1);
          filePath = filePath.slice(0, filePath.lastIndexOf('.git'));
          files.push({
            file: `${path}/${file}`,
            url: `https://raw.githubusercontent.com/${filePath}/master/${ `${path}/${file}`.substring(`${__dirname}/${folder}/${filePath.split('/')[1]}/`.length) }`,
          });
        }
        // else if (true) {  // TODO: add support for other code hosting services
        //
        // }
        else {
          console.log(`Code hosted at: ${repositoryUrl} is not supported at this time`);
        }
      }
    });
    return files;
  } catch (err) {
    throw err;
  }
}
module.exports = {
    check(packages = [], folder = 'node_modules', verbose = false) {
      const folderPath = path.resolve(`${__dirname}/${folder}`);
      let response = [];

      return new Promise(async (resolve, reject) => {
        if (packages.length === 0) {
          try {
            const files = (await fs.readdirSync(folderPath));
            files.forEach((file) => {
              if (file[0] !== '.' && (fs.existsSync(`${folderPath}/${file}/package.json`))) {
                packages.push(file);
              }
            });
          } catch (err) {
            reject(err);
          }
        } else {
          try {
            for (let i = 0; i < packages.length; i++) {
              if (!(await fs.existsSync(`${folderPath}/${packages[i]}`))) {
                console.log(`Unable to find package: ${packages[i]} at the path: ${folderPath}/${packages[i]}`);
                console.log('Please double check that you have the package installed');
                console.log('exiting program');
                process.exit(0);
              } else if (!(await fs.existsSync(`${folderPath}/${packages[i]}/package.json`))) {
                if (verbose) {
                  console.log(`Unable to find a package.json file in the package: ${packages[i]} at the path: ${folderPath}/${packages[i]}`);
                  console.log('Skipping package');
                }
                package.splice(i, 1);
              }
            }
          } catch (err) {
            reject(err);
          }
        }

        let fileCheck = [];

        packages.forEach((package) => {
          try {
            let info = require(`${folderPath}/${package}/package.json`);
            if (info.repository) {
              if (typeof info.repository === 'object' && info.repository.type && info.repository.type === 'git') {
                fileCheck = [...fileCheck, ...folderCheck(`${folderPath}/${package}`, info.repository.url, folder)];
              } else if (typeof info.repository === 'string') {
                // TODO: get repo if the link is a string
              } else {
                console.log(`Unknown repository type for package: ${package}, skipping package.`);
              }
            }
          } catch (err) {
            reject(err);
          }
        });

        for (let f of fileCheck) {
          try {
            let urlRes = (await axios.get(f.url)).data;
            let fileRes = (await fs.readFileSync(f.file, {encoding:'utf8'}));
            if (urlRes && fileRes && urlRes !== fileRes) {
              response.push({
                file: f.file,
                diff: [],
              })
              try {
                diff.diffLines(urlRes, fileRes, { newlineIsToken: false, ignoreWhitespace: true }).forEach((i) => response.find((e) => e.file === f.file).diff.push(i));
              } catch (e) {
                try {
                  diff.diffJson(urlRes, fileRes, { newlineIsToken: false }).forEach((i) => response.find((e) => e.file === f.file).diff.push(i));
                } catch (err) {
                  if (verbose) {
                    console.log(`\x1b[0m --- Unable to show diff of the file: ${f.file} due to an unknown error, skipping file --- `);
                  }
                }
              }
            }
          } catch (e) {
            if (e.response && e.response.status >= 400) {
              if (verbose) {
                console.warn(`Unable to retrieve: ${f.url}`);
              }
            } else {
              reject(e);
            }
          }
        }
        resolve(response);
      });
  }
}
