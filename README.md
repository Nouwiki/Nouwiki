# Nouwiki

Flexible Wiki software, early prototype. Written in NodeJS but will use Rust in some places if necessary for performance.

## Goals

- Be **easy** enough for the layman
- Be **powerful** enough for the developer.
- Be **good** enough for the academic.
- Be **beautiful** enough for the designer.
- **Edit anywhere** (plain text editor such as Atom or Sublime, Markdown specific editors, In-Browser, Specially designed Nouwiki editor)
- **Serve anywhere**:
	- Opening HTML files locally (no server)
	- Serving files through something simple such as `python -m SimpleHTTPServer`
	- Using GitHub as the backend and [JS-Git](https://github.com/creationix/js-git) for in-browser write access, or just edit locally and push.
	- Using the Nouwiki client itself as a backend, either locally or on a dedicated server, this setup has the greatest number of features.
- **Multiple build targets**:
	- Fragments: no `<html>`, `<head>` or `<body>` just the direct HTML content from the Markdown.
	- Static: Full HTML but only for reading.
	- Dynamic: Full HTML plus interface for editing content within browser and other dynamic features.
	- md.html: Pure markup but with some JS at the end which allows viewing the whole document as HTML and degrades nicely to plaintext if HTML support is not presant (e.x. in a text editor)
	- Standalone: Each page as a standalone HTML file, all assets within the file itself (css, img, font, etc).
- **Electron App**:  App that uses the same frontend as the dynamic build of markdown content plus OS features, useful if you just want a local wiki, and perhaps as an editor for content that's being served on GitHub or a dedicated server.
- **Atom plugin**: Same as the Electron app but for those who want to use Atom.
- **Sublime plugin**: Same but Sublime.
- **Universal asset manager** (audio, css, font, img, js, text, video, etc)
- Markdown with YAML, TOML, or JSON **front-matter**
- **Extend** entire wikis or just individual pages with your own JS or CSS
- **Extend** the markdown parser with plugins (we use markdown-it).

## Install

Note that this is a very early prototype, but if you want to play with it:

- `npm i -g git+https://github.com/01AutoMonkey/nouwiki.git`
- `nouwiki new wiki ./directory`

## ToDo

- Misc
	- Python's `SimpleHTTPServer` and Node's `http-server` don't treat HTML files without extensions as HTML
	- Solve the problem of the markdown files not being served as plain text on GitHub pages.
- Dynamic
	- Use React + Redux for UI and dynamic behavior?
	- Build to Dynamic and md.html
	- Experiment with the possibility of RW with JS-Git
	- Choose a Markdown editor:
		- SimpleMDE
		- Ace Editor
		- Something else?
