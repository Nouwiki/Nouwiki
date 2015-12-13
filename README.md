# Nouwiki

Flexible Wiki Software, early prototype. Applies [Universal App](https://github.com/01AutoMonkey/Universal-App) principles.

Nouwiki's vision is of a wiki-network where humanity collaborates on documenting the world, with seamless and automatic handling of bureaucratic friction, that is you wakeup, have some coffee, sit in front of your computer, and start contributing, without having to worry about if your days work will "disgruntle the admins" or get deleted, and get that effect without having to isolate your work.

## Features & Goals

- [ ] Multiple collaboration models (solve Wikipedia's bureaucracy).
- [ ] Edit anywhere (text editor, markup editor, nouwiki editor, in-browser editor, etc).
- [ ] Serve anywhere (local filesystem (`file:///`), simple server (`http-server`, `python -m SimpleHTTPServer`, etc), localstorage, static web hosting, github, local nouwiki server, dedicated nouwiki server)
- [x] View anywhere (text-browser, no-js, modern browser, mobile).
- [ ] Use any language (markdown, asciidoc, mediawiki, etc).
- [ ] Wikilink support in all markup languages.
- [ ] Multiple build targets (fragments, static, md.html, standalone, full-standalone, dynamic).
- [ ] Great text editor support (atom+sublime+vim+emacs plugins. custom nouwiki editor).
- [ ] Theme/Template support.
- [ ] Extendability (extend the markup parsers, nouwiki plugins, add your own js or css globally or locally on a page, etc).
- [ ] Scales (from a personal notebook to the size of wikipedia).
- [ ] Federated (cross node wikilinks, fork, push, pull).
- [ ] Universal Asset Manager (audio, font, img, js, style, text, video, etc)
- [ ] YAML, TOML, JSON front-matter
- [ ] Can easily function as a sub-app of your own app (an integrated wiki for your app)
- [ ] Designed with learning in mind (spaced repetition, quizzes, annotations, discussion, etc)
- [ ] Flexible (see above).

In more abstract terms we want it to be:

- [ ] Easy enough for the layman.
- [ ] Powerful enough for the developer.
- [ ] Good enough for the academic.
- [ ] Beautiful enough for the designer.

## Install & Run

Note that this is a very early prototype, but if you want to play with it:

- `npm i -g git+https://github.com/01AutoMonkey/nouwiki.git`
- `nouwiki forge ./wiki_directory`
- `nouwiki build ./wiki_directory`
- `nouwiki serve ./wiki_directory -p 8080`

## Host Wiki on GitHub

- Create empty GitHub repo (don't initialize it with anything).
- Create [a gh-pages branch](https://pages.github.com) (also don't initialize it with anything).
- `nouwiki forge ./my_github_wiki`
- `nouwiki build ./my_github_wiki`
- `cd ./my_github_wiki`
- `git remote add origin https://github.com/User/Repo.git`
- `git push -u origin master`
- `git push -f origin master:gh-pages` (see more ways to sync master and gh-pages [here](http://oli.jp/2011/github-pages-workflow/))

## ToDo

- ...
