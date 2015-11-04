# Nouwiki

Flexible Wiki Software, early prototype. Written in Node for awesome and in Rust for performance.

## Features & Goals

- [ ] Multiple collaboration models (solve Wikipedia bureaucracy).
- [ ] Edit anywhere (text editor, markup editor, in-browser, etc).
- [ ] Serve anywhere (static: local filesystem, simple server, static web hosting. dynamic: github, local nouwiki server, dedicated nouwiki server)
- [x] View anywhere (text, no-js, modern browser, mobile).
- [ ] Use any language (markdown, asciidoc, mediawiki, etc).
- [ ] Wikilinks in all languages.
- [ ] Multiple build targets (fragments, static, dynamic, md.html, standalone, full-standalone).
- [ ] Great text editor support (atom, sublime, vim, emacs plugin. custom nouwiki editor).
- [ ] Theme support.
- [ ] Extendable (extend markup parsers, extend functionality and themes globally or page-specific with custom js, css, etc).
- [ ] Scales (personal notebook to wikipedia scale).
- [ ] Federated (cross node wikilinks, fork, push, pull).
- [ ] Universal Asset Manager (audio, css, font, img, js, text, video, etc)
- [ ] YAML, TOML, JSON front-matter
- [ ] Flexible (see above).

## Install

Note that this is a very early prototype, but if you want to play with it:

- `npm i -g git+https://github.com/01AutoMonkey/nouwiki.git`
- `nouwiki new wiki ./directory`
- `nouwiki build static ./directory`
- `cd ./directory/site`
- `http-server`

## ToDo

- ...
