#!/usr/bin/env node

const CURR_DIR = process.cwd()

const program = require('commander')
const chalk = require('chalk')
const fs = require('fs')

function capitalizeFirstLetters (str, num) {
  return `${str.substring(0, num).toUpperCase()}${str.substr(num)}`
}

function parseName (name) {
  if (name[0].toLowerCase() !== 'k') {
    console.warn("Kongponents typically start with 'K'.")

    return capitalizeFirstLetters(name, 1)
  }

  return capitalizeFirstLetters(name, 2)
}

function createDirectoryContents (templatePath, newProjectPath, transformPath, transformContents) {
  const filesToCreate = fs.readdirSync(templatePath)

  return filesToCreate.map(file => {
    const origFilePath = `${templatePath}/${file}`
    const stats = fs.statSync(origFilePath)

    if (stats.isFile()) {
      const contents = fs.readFileSync(origFilePath, 'utf8')
      const writePath = `${newProjectPath}/${file}`

      fs.writeFileSync(transformPath(writePath), transformContents(contents), 'utf8')
    }

    return transformPath(file)
  })
}

program
  .version('0.0.1')

program
  .command('create <name>')
  .description('create a kongponent')
  .usage('[options] <name>')
  .option('-d, --kdescription [description]', 'Description of your Kongponent')
  .action(function (name, options) {
    if (!name) {
      console.error(chalk.red.bold('Missing Option: name. Please specify a name with -n'))

      return
    }

    // args
    const kname = parseName(name)
    const kdescription = options.kdescription || `${kname} description here.`

    // paths
    const templatePath = `${__dirname}/template`
    const packagesPath = 'packages'
    const componentPath = `${CURR_DIR}/${packagesPath}/${kname}`

    if (fs.existsSync(componentPath)) {
      throw Error(`${componentPath} already exists.`)
    }

    fs.mkdirSync(componentPath)

    const files = createDirectoryContents(
      templatePath,
      componentPath,
      path => path.replace(/KTemplate/g, kname),
      contents => contents
        .replace(/{%kongponent_name%}/g, kname)
        .replace(/{%kongponent_description%}/g, kdescription))

    console.log(chalk.greenBright('Kongponent created!'))

    const { exec } = require('child_process')

    exec(`tree packages/${kname}`, (err, stdout) => {
      console.log('\nFiles generated:')
      if (err) {
        console.log(chalk.blue(files.join('\n')))

        return
      }

      // tree output
      console.log(chalk.blue(stdout))
    })
  })

program.parse(process.argv)