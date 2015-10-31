# Nouwiki

Flexible Wiki Software, early prototype. Written in NodeJS but will use Rust in some places for performance.

## Features

- [ ] Edit anywhere (text editor, in-browser, etc).
- [ ] Serve anywhere (static: local filesystem, simple server, static web hosting. dynamic: github, local nouwiki server, dedicated nouwiki server)
- [x] View anywhere (text, no-js, modern browser, mobile).
- [ ] Use any language (markdown, asciidoc, mediawiki, etc).
- [ ] Wikilinks in all languages.
- [ ] Multiple build targets (fragments, static, dynamic, md.html, standalone, full-standalone).
- [ ] Great text editor support (atom, sublime, vim, emacs plugin. custom nouwiki editor).
- [ ] Extendable (extend markup parsers, extend functionality and themes with custom js, css, etc).
- [ ] Scales (personal notebook to wikipedia scale).
- [ ] Federated (cross node wikilinks, fork, push, pull).
- [ ] Universal Asset Manager (audio, css, font, img, js, text, video, etc)
- [ ] YAML, TOML, JSON front-matter
- [ ] Flexible (see above).

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
