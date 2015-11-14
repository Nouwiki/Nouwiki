# Nouwiki

Flexible Wiki Software, early prototype. Written in Node for awesome and Rust for performance.

## Features & Goals

- [ ] Multiple collaboration models (solve Wikipedia bureaucracy).
- [ ] Edit anywhere (text editor, markup editor, nouwiki editor, in-browser editor, etc).
- [ ] Serve anywhere (**static:** local filesystem, simple server, static web hosting. **dynamic:** github, local nouwiki server, dedicated nouwiki server)
- [x] View anywhere (text, no-js, modern browser, mobile).
- [ ] Use any language (markdown, asciidoc, mediawiki, etc).
- [ ] Wikilinks in all languages.
- [ ] Multiple build targets (fragments, static, md.html, standalone, full-standalone, dynamic).
- [ ] Great text editor support (atom+sublime+vim+emacs plugins. custom nouwiki editor).
- [ ] Theme/Template support.
- [ ] Extendable (extend markup parsers, extend functionality (js) and look (css) globally or page-specific with custom js, css, etc).
- [ ] Scales (from a personal notebook to the size of wikipedia).
- [ ] Federated (cross node wikilinks, fork, push, pull).
- [ ] Universal Asset Manager (audio, css, font, img, js, text, video, etc)
- [ ] YAML, TOML, JSON front-matter
- [ ] Can easily function as a sub-app of your own app (an integrated wiki for your app)
- [ ] Flexible (see above).

In more abstract terms we want it to be:

- [ ] Easy enough for the layman.
- [ ] Powerful enough for the developer.
- [ ] Good enough for the academic.
- [ ] Beautiful enough for the designer.

## Install

Note that this is a very early prototype, but if you want to play with it:

- `npm i -g git+https://github.com/01AutoMonkey/nouwiki.git`
- `nouwiki new wiki ./directory`
- `nouwiki build static ./directory`
- `cd ./directory/site`
- `http-server`

## ToDo

- Saner split between dev dependancies and regular dependancies.
- Next Stage
	- in-browser editing on github (using in-browser markdown parsing + js-git)
	- Make sure all current build targets work
	- Reconsider commander options