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
npm run track-css
```

You can modify the functions that will run by using

```bash
npm run track-css --mode dpfel
```

<ul>
    <li>D - Check if css classes are being used on front files</li>
    <li>P - Check If css classes are in correct paths given their use</li>
    <li>F - Check if used classes have definitions on css files</li>
    <li>E - List expressions on class attributes on front files</li>
    <li>L - Check for duplicate definitions of classes on css files</li>
</ul>

This will scan the front-end files and CSS/SCSS files in the project directory and generate a json log file with refactoring suggestions in the logs folder.
If no option is passed all functions will be executed

## Configuration

Default configuration after installation

```bash
"cssTracker": {
    "blacklist": {
        "cssPaths": [],
        "notUsedCss": [
            "./node_modules",
            ".public",
            "./.cache",
            "./build"
        ],
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

<ul>
    <li>blacklist - especifies classes and paths to not look into.</li>
    <ul>
        <li>cssPaths - Used for not look into that path for css files</li>
        <li>notUsedCss - Used in case you want check the classes inside but not check if you are not using them</li>
        <li>duplicateCss - Used in case you want check the classes inside but not check if they are duplicated here</li>
        <li>moveCssPaths - Used in case you want check the classes inside but not considering move them from there</li>
        <li>frontPaths - Used for not look into that path for front files</li>
    </ul>
    <li>frontFiles - Extensions to look for front files</li>
    <li>cssFiles - Extensions to look for css files</li>
    <li>outputLog - Where the output log will be generated</li>
</ul>

## Result

This is an example of result

```bash
{
  "notUsedClasses": [
    {
      "class": "pop-down-left",
      "paths": [{ "path": "src/components/popup/style.scss", "lines": [21] }]
    }
  ],
  "moveClass": [
    {
      "class": "card",
      "moveFrom": "src/components/popup",
      "moveTo": "src/components",
      "occurrences": [
        "src/components/popup/popup.tsx",
        "src/components/account/account.tsx"
      ]
    }
  ],
  "noDefinitions": [
    {
      "class": "squared",
      "paths": [{ "path": "src/components/index.tsx", "lines": [355] }]
    }
  ],
  "expressions": [
    {
      "expression": "checkPosition() ? position : ",
      "paths": [{ "path": "src/components/popup/popup.tsx", "lines": [84] }]
    }
  ],
  "duplicateDefs": [
    {
      "class": "card",
      "paths": [
        {
          "path": "src/components/account/style.scss",
          "lines": [58, 63]
        },
        { "path": "src/components/style.scss", "lines": [78, 93] }
      ]
    }
  ]
}
```

<ul>
    <li>notUsedClasses are classes declared in css but not used in front, its path defines its definition</li>
    <li>moveClass are suggestions to move classes to a place that encompasses all occurrences</li>
    <li>noDefinitions represent classes being used but with no definition on the searched css</li>
    <li>expressions are codes in front that may produces classes dynamically, to have attention on them</li>
    <li>duplicateDefs are classes with more than one definition on css</li>
</ul>

## GitHub

[Github Link](https://github.com/Raprogue/CssTracker)

## License

This project is licensed under the MIT License.
