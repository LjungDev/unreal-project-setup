# Unreal Project Setup

- [Unreal Project Setup](#unreal-project-setup)
  - [Overview](#overview)
    - [Post-Usage Workflow Tips](#post-usage-workflow-tips)
      - [Update Content files](#update-content-files)
      - [Diffing .uasset Files](#diffing-uasset-files)
      - [Pulling Upstream Changes](#pulling-upstream-changes)
  - [Installation / Usage](#installation--usage)
    - [Git settings](#git-settings)
  - [Notes](#notes)

## Overview

This is a helper CLI to setup an Unreal Project using an approach of splitting
the `Content` folder into a separate git repository and linking it as a submodule.

This CLI takes an Unreal project dir and a desired new Content dir location,
and does the following:

- Moves the `Content` folder into the new dir
- Initializes it as a new git repo
- Sets up git lfs and tracks some relevant file extensions
- Commits any existing files
- Sets up the initial Unreal project dir as a git repo
- Moves all files into a subdir named after the project
- Adds a git submodule of the new Content repo as the `Content` dir
- Adds a suitable .gitignore file to the project
- Adds a basic boilerplate `README.md` to the project
- Adds a APGLv3 `LICENSE` file (attributed to your default git user name)

This takes the structure from something like this:

```
MyUnrealProject
  - MyCoolGame.uproject
  - Binaries
  - Content
  - ...
```

And creates:

```
MyUnrealProject
  - .git
  - MyCoolGame
    - MyCoolGame.uproject
    - Binaries
    - Content -> D:\MyContent\MyCoolGame_Assets
    - ...
```

### Post-Usage Workflow Tips

After running this CLI you need to handle committing content separately from
code/other files.

Using the in-editor Source Control UI is not recommended as it doesn't support
git submodules (as of writing).

#### Update Content files

To update and commit content files you run the git commands from inside the
`Content` dir and commit as usual.

After adding commits to the `Content` dir, the submodule pointer will be updated
in the root repo. Make sure to also commit that change (after committing the
`Content` repo).

#### Diffing .uasset Files

Diffing can be done with the `diff` argument of the Unreal Editor bin file.
Checkout the DiffUE script in my [Scripts repo](https://github.com/LjungDev/Scripts)
for more info.

#### Pulling Upstream Changes

If content files has changed remotely the git command is slightly different
for a submodule than a regular repository. From the root project dir (not the
`Content` dir), run:

```shell
git submodule update --remote --rebase
```

This should update the remote submodule.

## Installation / Usage

This CLI is a Node project and requires `Node>=19.2` and `Yarn>=1.22`.

First run `yarn install` to install all dependencies.

Then use with:

```shell
yarn start --projectDir <MyProjectDir> --newContentDir <MyNewContentDir>
```

For example, to get the result of the example structure, run:

```shell
yarn start --projectDir C:\UnrealProjects\MyUnrealProject --newContentDir D:\MyContent\MyCoolGame_Assets
```

For more detailed info use the `help` command:

```shell
yarn start --help
```

### Git settings

A few optional arguments can be provided to change the git user settings used for creating the Content repo and Project repo:

```shell
yarn start --projectDir C:\UnrealProjects\MyUnrealProject --newContentDir D:\MyContent\MyCoolGame_Assets --gitUserName "Anna Andersson" --gitUserEmail "anna@example.com" --gitSigningKey "ABCDEF0123456789"
```

## Notes

- This CLI has only been tested on Windows (10) however it should probably
  run on other platforms as well as it doesn't use any Windows-specific commands.
- Make sure to run the command as the same user as the one intended to run future
  git commands, otherwise you might end up with "dubious ownership" issues.
- On Windows, if any of the directories are on a network drive you might need to
  specify them a UNC path instead of by drive letter (to get the UNC/remote root
  path of a network drive use the command `net use`).
- It is best to run this CLI on a fresh project and/or make a backup before running.
