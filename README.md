# Project Name

This is a project for processing CSS data about a project. It provides suggestions for refactoring and finding duplicate CSS classes. It works by scanning the front-end files and CSS/SCSS files to find the occurrences of CSS classes and then provides log messages with refactoring suggestions.

## Installation

To use this project, you need to have Node.js installed on your machine. You can download it [here](https://nodejs.org/).

Navigate to the project directory and install the module using the following command:

```bash
npm install css-tracker
```

## Usage

Run the command on the project folder

```bash
npm run css-tracker
```

You can modify the functions that will run by using

```bash
npm run css-tracker --mode dpfel
```

D - Check if css classes are being used on front files
P - Check If css classes are in correct paths given their use
F - Check if used classes have definitions on css files
E - List expressions on class attributes on front files
L - Check for duplicate definitions of classes on css files

This will scan the front-end files and CSS/SCSS files in the project directory and generate a log file with refactoring suggestions in the logs folder.
If no option is passed all functions will be executed

## Configuration

Default configuration after installation

```bash
"cssTracker": {
    "blacklist": {
        "cssPaths": [],
        "moveCssPaths": [
            "./node_modules",
            ".public",
            "./.cache",
            "./build"
        ],
        "frontPaths": [
            "./node_modules",
            ".public",
            "./.cache",
            "./build"
        ],
        "cssClasses": []
    },
    "frontFiles": [
        ".tsx",
        ".jsx",
        ".html"
    ],
    "cssFiles": [
        ".css",
        ".scss"
    ],
    "outputLog": "./logs.txt"
}
```

blacklist - especifies classes and paths to not look into.
    cssPaths - Used for not look into that path for css files
    moveCssPaths - Used in case you want check the classes inside but not considering move them from there
    frontPaths - Used for not look into that path for front files
frontFiles - Extensions to look for front files
cssFiles - Extensions to look for css files
outputLog - Where the output log will be generated

## License

This project is licensed under the MIT License.
