const check = require('./methods.js').check;
const path = require('path');
const fs = require('fs');

const args = process.argv.splice(1);

const folder = (args.includes('-f') || args.includes('--folder'))
  ? ((args[args.indexOf('-f')] && args[args.indexOf('-f') + 1]) || (args[args.indexOf('--folder')] && args[args.indexOf('--folder') + 1])) : 'node_modules';
let packages = (args.includes('--package') ? [args[args.indexOf('--package') + 1]] : null) || (args.includes('-p') ? [args[args.indexOf('-p') + 1]] : []);
const verbose = (args.includes('--verbose') || args.includes('-v'));
const help = (args.includes('-h') || args.includes('--help'));
const folderPath = path.resolve(`${__dirname}/${folder}`);

if (help) {
  console.log(`Usage:`);
  console.log(`------`);
  console.log(`m [options]`);
  console.log(`Options:`);
  console.log(`--------`);
  console.log(`-f, --folder:   specify a folder to check (defaults to node_modules)`);
  console.log('-p, --package:  specify a package to check (defaults to all packages in the folder)');
  console.log('-v, --verbose:  output additional logs');
  console.log('-h, --help:     show the help menu');
  process.exit(0);
}

if (!fs.existsSync(folderPath)) {
  console.log(`Could not find the folder: ${folder}`);
  console.log('exiting program');
  process.exit(0);
}

check(packages, folder, verbose).then((files) => {
  files.forEach((i) => {
    console.log(`\x1b[0m${'Difference detected in file:'} ${i.file}`);
    console.log(`\x1b[32m${'Added'}\x1b[89m \x1b[91m${'Removed'}\x1b[39m \x1b[0m`);
    console.log(`Diff shown below:`);
    i.diff.forEach((d) => {
      d.added ? process.stdout.write(`\x1b[32m${d.value}\x1b[89m`) : d.removed ? process.stdout.write(`\x1b[91m${d.value}\x1b[39m`) : process.stdout.write(`\x1b[0m-----------\n`);
    });
    console.log('');
  });
}).catch((err) => {
  console.warn(err);
  console.log('exiting program');
  process.exit(1);
})
