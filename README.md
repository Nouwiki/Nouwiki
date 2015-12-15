# Nouwiki

Flexible Wiki Software, early prototype. Applies [Universal App](https://github.com/01AutoMonkey/Universal-App) principles.

Nouwiki's vision is of a wiki-network where in the abstract there are no admins and everyone can edit, but with self-organized quality control. This is attained through "inter-wiki-links" and collaboration between classically administered nodes which together make up a single whole.

## Install & Run

Note that this is a very early prototype, but if you want to play with it:

- `npm i -g git+https://github.com/01AutoMonkey/nouwiki.git`
- `nouwiki forge ./wiki_directory`
- `nouwiki build ./wiki_directory`
- `nouwiki serve ./wiki_directory -p 8080`

## Host Wiki on GitHub

- Create empty GitHub repo (don't initialize it with anything).
- `nouwiki forge ./my_github_wiki`
- `nouwiki build ./my_github_wiki`
- `cd ./my_github_wiki`
- `git remote add origin https://github.com/User/Repo.git`
- `git push -u origin master`
- Create [a gh-pages branch](https://pages.github.com) (also don't initialize it with anything).
- *make changes to wiki and commit (automatically committed if you edit through browser)*
- `git push -u origin master && git push -f origin master:gh-pages` (see more ways to sync master and gh-pages [here](http://oli.jp/2011/github-pages-workflow/))

## Features & Goals

- [ ] Multiple collaboration models (solve Wikipedia's bureaucracy).
- [ ] Edit anywhere
 	- [x] text editor
	- [x] markup editor
	- [ ] nouwiki editor
	- [x] in-browser nouwiki editor
- [ ] Serve anywhere
	- [ ] local filesystem (`file:///`)
	- [ ] simple server (`http-server`, `python -m SimpleHTTPServer`, etc)
	- [ ] localstorage
	- [ ] static web hosting
	- [x] github
	- [x] local nouwiki server
	- [ ] dedicated nouwiki server
- [x] View anywhere
	- [x] text-browser
	- [x] no-js
	- [x] modern browser
	- [x] mobile
- [ ] Use any language
	- [x] markdown
	- [ ] asciidoc
	- [ ] mediawiki
- [ ] Wikilink support in all markup languages.
	- [x] markdown
	- [ ] asciidoc
	- [ ] mediawiki
- [ ] Multiple build targets
	- [ ] fragments
	- [ ] static
	- [ ] md.html
	- [ ] standalone
	- [ ] full-standalone
	- [x] dynamic
- [ ] Great text editor support (atom+sublime+vim+emacs plugins. custom nouwiki editor).
- [ ] Theme/Template support.
- [ ] Extendability (extend the markup parsers, nouwiki plugins, add your own js or css globally or locally on a page, etc).
- [ ] Scales (from a personal notebook to the size of wikipedia).
- [ ] Federated (cross node wikilinks, fork, push, pull).
- [ ] Universal Asset Manager (audio, font, img, js, style, text, video, etc)
- [ ] Front-Matter
	- [ ] YAML
	- [x] TOML
	- [ ] JSON
- [ ] Can easily function as a sub-app of your own app (an integrated wiki for your app)
- [ ] Designed with learning in mind (spaced repetition, quizzes, annotations, discussion, etc)
- [ ] Flexible (see above).

In more abstract terms we want it to be:

- [ ] Easy enough for the layman.
- [ ] Powerful enough for the developer.
- [ ] Good enough for the academic.
- [ ] Beautiful enough for the designer.

## UI+Backend Features

- [ ] Search
- [ ] Per tab Travel History
- [ ] Asset Management
- [ ] Wiki
	- [ ] Create
	- [ ] Remove
	- [ ] Rename
- [ ] Page
	- [x] Create
	- [ ] Remove
	- [ ] Rename
- [ ] User Account Singup/Login/Manage

## ToDo

- ...
