# Nouwiki

Flexible Wiki software, early prototype.

## Goals

- Servable through:
	- **R**: Opening html files locally (no server) (**W**rite through text editor)
	- **R**: Serving files through something simple like `python -m SimpleHTTPServer` (Write through text editor)
	- **RW**: Using GitHub as a backend and [JS-Git](https://github.com/creationix/js-git) for Write access, or just edit locally and push.
	- **RW**: Using the nouwiki client itself as a backend, either locally or on a deticated server, allowing for more features then when using GitHub as backend.
- Markdown is built into:
	- Fragments: no `<html>`, `<head>` or `<body>` just the direct HTML content from the Markdown.
	- Static: Full HTML but only for reading.
	- Dynamic: Full HTML and interface for editing content within browser, plus other dynamic features.
	- md.html: Pure markup but with some JS at the end which allows viewing the whole document as HTML and degrades nicely to plaintext if HTML support is not presant (e.x. in a text editor)
- Electron app?: a app that uses the same frontend as the dynamic build of markdown content.
- Atom plugin?: a plugin that builds nouwiki markdown content on each save event, possibly also for direct editing of non-local Nouwiki instances from within atom instead of the browser frontend or editing it locally.

Written in NodeJS but will use Rust in some places if necissary for performance.

## Install

Note that this is a very early prototype, but if you want to play with it:

- `npm i -g git+https://github.com/01AutoMonkey/nouwiki.git`
- `nouwiki new wiki ./directory`

## ToDo

- Consdier if we should have empty directories if github doesn't support it and instead of copying just copy the folders with content and use `fs` to create the empty directories.
- Solve the problem of the markdown files not being served as plain text on GitHub pages.
- Should we use React + Redux? And of course only for UI and dynamic behavior, the content should be rendered using templates and then we don't need React server side rendering for search engine indexing.
- Create a build command (currently it just build the initial index.md file)
- Build to Dynamic and md.html
- Create Dynamic front end with support for GitHub as backend through JS-Git.
- Choose a Markdown editor:
	- SimpleMDE
	- Ace Editor
	- Something else?