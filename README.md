# Nouwiki

Flexible Wiki software, early prototype. Written in NodeJS but will use Rust in some places if necissary for performance.

## Goals

- Servable through:
	- Opening html files locally (no server)
	- Serving files through something simple like `python -m SimpleHTTPServer`
	- Using GitHub as a backend and [JS-Git](https://github.com/creationix/js-git) for Write access, or just edit locally and push.
	- Using the Nouwiki client itself as a backend, either locally or on a deticated server, allowing for more features then when using GitHub as backend.
- Multiple build targets:
	- Fragments: no `<html>`, `<head>` or `<body>` just the direct HTML content from the Markdown.
	- Static: Full HTML but only for reading.
	- Dynamic: Full HTML and interface for editing content within browser, plus other dynamic features.
	- md.html: Pure markup but with some JS at the end which allows viewing the whole document as HTML and degrades nicely to plaintext if HTML support is not presant (e.x. in a text editor)
- Electron app: a app that uses the same frontend as the dynamic build of markdown content, useful if you just want a local wiki, and perhaps as an editor for content that's being served on GitHub or a dedicated server.
- Atom plugin: Same as the Electron app but for those who want to use Atom.
- Sublime plugin: Same but Sublime.

## Install

Note that this is a very early prototype, but if you want to play with it:

- `npm i -g git+https://github.com/01AutoMonkey/nouwiki.git`
- `nouwiki new wiki ./directory`

## ToDo

- Misc
	- Consdier if we should have empty directories if github doesn't support it and instead of copying just copy the folders with content and use `fs` to create the empty directories.
	- Solve the problem of the markdown files not being served as plain text on GitHub pages.
	- Create a build command (currently it just build the initial index.md file)
- Dynamic
	- Use React + Redux for UI and dynamic behavior?
	- Build to Dynamic and md.html
	- Experiment with the possibility of RW with JS-Git
	- Choose a Markdown editor:
		- SimpleMDE
		- Ace Editor
		- Something else?