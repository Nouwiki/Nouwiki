# Nouwiki

Flexible Wiki Software, early prototype. Applies [Universal App](https://github.com/01AutoMonkey/Universal-App) principles.

Nouwiki's vision is of a wiki-network where in the abstract there are no admins and everyone can edit, but has self-organizing quality control. This is attained through the use of "inter-wiki-links" and ease of collaboration between administered nodes which together make up a single whole.

## Install & Run

Note that this is a very early prototype, but if you want to play with it:

1. `npm i -g git+https://github.com/Nouwiki/Nouwiki.git`
2. `nouwiki forge ./wiki_directory`
4. `nouwiki serve ./wiki_directory -p 8080`

## Host Wiki on GitHub

`Instructions pending`

## Features & Goals

In the abstract we want it to be:

- [ ] Easy enough for the layman.
- [ ] Powerful enough for the developer.
- [ ] Good enough for the academic.
- [ ] Beautiful enough for the designer.

In more concrete terms:

- [ ] Multiple collaboration models (solve Wikipedia's bureaucracy).
- [ ] Edit anywhere
  - [x] text editor
  - [x] markup editor
  - [ ] nouwiki editor
  - [x] in-browser nouwiki editor
- [ ] Serve anywhere
  - [x] local filesystem (`file:///`)
  - [x] simple server (`http-server`, `python -m SimpleHTTPServer`, etc)
  - [x] dropbox
  - [x] github
  - [x] static web hosting
  - [x] heroku, etc
  - [x] local nouwiki server
  - [x] dedicated nouwiki server
- [x] View anywhere
	- [x] text-browser
	- [x] no-js
	- [x] modern browser
	- [x] mobile
- [ ] Multiple Modes
  - [x] static (works with anything, including `file://`, needs to be built using `nouwiki build ./wiki_dir`)
  - [x] dynamic_read (single index.html which can read and render content files, no need for building anything, no write support though)
  - [ ] git (use git as a backend, ideal for github hosting)
  - [x] nouwiki (the most fully featured backend)
- [ ] Use any markup language
	- [x] markdown
	- [ ] asciidoc
	- [ ] mediawiki
  - etc
- [ ] Wikilink support in all markup languages.
	- [x] markdown
	- [ ] asciidoc
	- [ ] mediawiki
  - etc
- [ ] Great text editor support (atom+sublime+vim+emacs plugins. custom nouwiki editor).
- [x] Theme/Template support.
- [ ] Extendability (extend the markup parsers, nouwiki plugins, add your own js or css globally or locally on a page, etc).
  - [x] Markup Parser Plugins
  - [x] Per page and Global JS, CSS, etc.
- [ ] Scales (from a personal notebook to the size of wikipedia).
- [ ] Federated (cross node wikilinks, fork, push, pull).
- [ ] Universal Asset Manager (audio, font, html, img, pdf, js, json, style, text, video, etc)
- [ ] Front-Matter
	- [ ] YAML
	- [x] TOML
	- [ ] JSON
- [ ] Can easily function as a sub-app of your own app (an integrated wiki for your app)
- [ ] Designed with learning in mind (spaced repetition, quizzes, annotations, discussion, etc)
- [ ] Flexible (see above).

## UI+Backend Features

- [x] Title Search
- [ ] Text Search
- [ ] Per tab Travel History
- [ ] Asset Management
- [ ] Wiki
	- [ ] Create
	- [ ] Remove
	- [ ] Rename
- [ ] Page
	- [x] Create
	- [x] Remove
	- [ ] Rename
	- [ ] View & Restore old version of page + see diff
	- [ ] Be able to edit Front-Matter as a HTML form
- [ ] User Account Singup/Login/Manage
