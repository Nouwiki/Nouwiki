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

Written in NodeJS but will use Rust in some places if necissary for performance.

## Install

Note that this is a very early prototype, but if you want to play with it:

- `npm i -g git+https://github.com/01AutoMonkey/nouwiki.git`
- `nouwiki new wiki ./directory`

## ToDo

- Solve the problem of the markdown files not being served as plain text on GitHub pages.
- Create a build command (currently it just build the initial index.md file)
- Build to Dynamic and md.html
- Create Dynamic front end with support for GitHub as backend through JS-Git.
- Choose a Markdown editor:
	- SimpleMDE
	- Ace Editor
	- Something else?