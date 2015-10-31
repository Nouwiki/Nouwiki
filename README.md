# Nouwiki

Flexible Wiki Software, early prototype. Written in NodeJS but will use Rust in some places for performance.

## Goals

- Users
	- [ ] Be **easy** enough for the layman
	- [ ] Be **powerful** enough for the developer.
	- [ ] Be **good** enough for the academic.
	- [ ] Be **beautiful** enough for the designer.
- Anywhere & Everything
	- **Edit anywhere**
		- [x] Plain text editor (Atom, Sublime, Vim, Emacs, etc)
		- [x] Markup specific editors
		- [ ] In-Browser
		- [ ] Custom Nouwiki Editor
	- **Use any language**
		- [x] Markdown
		- [ ] Asciidoc
		- [ ] Mediawiki
		- etc
	- **Serve anywhere**
		- [x] Open HTML files locally (no server)
		- [x] Serve files through something simple such as `http-server` or `python -m SimpleHTTPServer`
		- [x] Static website hosting services.
		- [ ] Use GitHub as the backend.
		- [ ] Use Nouwiki client itself as the backend, locally or on a dedicated server (this setup has the greatest number of features).
	- **Multiple build targets**
		- [x] *Fragments*: no `<html>`, `<head>` or `<body>` just the HTML content as it comes directly from the Markup parser.
		- [x] *Static*: Full HTML but only for reading.
		- [ ] *Dynamic*: Full HTML plus interface for editing content within browser and other dynamic features
		- [ ] *md.html*: Pure markup but with some JS at the end which allows viewing the whole document as HTML and degrades nicely to plaintext if HTML support is not presant (e.x. in a text editor)
		- [ ] *Standalone*: Each page as a standalone HTML file, all assets within the file itself (css, img, font, etc).
		- [ ] *Full Standalone*: Entire wiki in a single HTML file.
	- **View anywhere**
		- [x] Text browsers
		- [x] Browsers with JavaScript disabled
		- [x] Modern browsers
		- [x] Mobile browsers
- Apps & Plugins
	- [ ] **Electron App**:  App that uses the same frontend as the dynamic build of markdown content plus OS features, useful if you just want a local wiki, and perhaps as an editor for content that's being served on GitHub or a dedicated server.
	- [ ] **Atom plugin**: Same as the Electron app but for those who want to use Atom.
	- [ ] **Sublime plugin**: Same but Sublime.
- Misc
	- [ ] **Universal asset manager** (audio, css, font, img, js, text, video, etc)
	- [ ] Markup with YAML, TOML, or JSON **front-matter**
	- [ ] **Extend** entire wikis or just individual pages with your own JS or CSS
	- [ ] **Extend** the markup parsing with plugins.
	- [ ] **Scale** from a personal notebook to Wikipedia-sized wikis.

## Install

Note that this is a very early prototype, but if you want to play with it:

- `npm i -g git+https://github.com/01AutoMonkey/nouwiki.git`
- `nouwiki new wiki ./directory`

## ToDo

- Misc
	- Solve the problem of the markdown files not being served as plain text on GitHub pages.
- Dynamic
	- Use React + Redux for UI and dynamic behavior?
	- Build to Dynamic and md.html
	- Experiment with the possibility of RW with JS-Git
	- Choose a Markdown editor:
		- SimpleMDE
		- Ace Editor
		- Something else?
