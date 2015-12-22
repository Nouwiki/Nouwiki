# Nouwiki

Flexible Wiki Software, early prototype. Applies [Universal App](https://github.com/01AutoMonkey/Universal-App) principles.

Nouwiki's vision is of a wiki-network where in the abstract there are no admins and everyone can edit, but has self-organizing quality control. This is attained through the use of "inter-wiki-links" and ease of collaboration between administered nodes which together make up a single whole.

## Install & Run

Note that this is a very early prototype, but if you want to play with it:

1. `npm i -g git+https://github.com/01AutoMonkey/nouwiki.git`
2. `nouwiki forge ./wiki_directory`
3. `nouwiki build ./wiki_directory`
4. `nouwiki serve ./wiki_directory -p 8080`

## Host Wiki on GitHub

1. Create empty GitHub repo (don't initialize it with anything).
2. `nouwiki forge ./my_github_wiki`
3. `nouwiki build ./my_github_wiki`
4. `cd ./my_github_wiki`
5. `git remote add origin https://github.com/User/Repo.git`
6. `git push -u origin master`
7. Create [a gh-pages branch](https://pages.github.com) (also don't initialize it with anything).
8. *make changes to wiki and commit (automatically committed if you edit through browser)*
9. `git push -u origin master && git push -f origin master:gh-pages` (see more ways to sync master and gh-pages [here](http://oli.jp/2011/github-pages-workflow/))

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

- api get_page should specify a wiki intead of relaying on referer url
- Languages, so I can write in English and Icelandic

- Version control
- Create, delete, and rename wikis from within browser
- Asset Managment

- Version Control
- Create nonexisting pages within browser
- Handle TOML, YAML, JSON, front-matter in-browser through a form
- Asset management
- Manage creation and editing of multiple wikis within browser
- Apply UApp principles and make a Electron version of the in-browser UI

- Don't just use parse.parse in-browser, also add the process of dot templating, etc, and then overwrite the entire page, this is the only way for local js and css to spawn, and it would catch updates in global settings, as well as a change of template.
- Support creating a page that doesn't exist
- Version control
- I want to easily create wikis and the ability to rename them, from within the browser
- Are you sure you want to save/discard?
- Support `file:///` and therefor also `python -m SimpleHTTPServer`, etc.
- Build html on view if it hasn't been built, that way you always see the latest, in view mode in the browser, in edit mode in the browser, and in the edit mode of a text editor, and you never have to call "build" even if there is something left, cause it'll just get built on view, but... this supposes a dynamic viewer with write support.
- Also support md.html, that is there is no build except inside the browser

...

- Create Universal App Boilerplate and base Nouwiki on that.
- Create a prose.io github nouwiki service (first locally), this way we can start editing in-browser
- Create @ wikilink support (using global config and extending markdown-it-wikilink)
- Find or make a attribute markdown extension
- Create a basic nouwiki-server
- Template support
- Larger Front-Matter support (json, yaml, and maybe "decks")
- Asset Managment
- Be able to edit styles and js in-browser.
- Why is template assets part of universal assets?

...

- Solve the .html problem, that is that http-server and nouwiki-server have to both be supported and http-server doesn't support exluding .ext and node koa serve static doesn't automatically handle urls without ext, and the jquery will get the wrong md file because it relies on url and it doesn't use ext but if a file is named test.html.md then I'll view test using test.html, etc
- Optimize current code before going further
- Basic write support

## .html Problem

There is no chance in hell I'll require and perhaps even allow .html for pages in nouwiki server
But GitHub allows it
And file:/// and most simple http servers *require* it

So, save as .html, deal with it intelligently in nouwiki server, allow it on github, but then there is the simple servers, they brake, so it seems like we need an alternative build process for them, that is they brake on the linking side but nowhere else, so all we need to do is support .html linking.

Which we can get through:

- Setting to add .html to [text]() links
- But wait, we also need to add .html to [text](page) links....
- But that is hard when dealing with non-html links and names that end with .html.....

So, rules:

- If link does not have / in it, it's by defintion a page url, so add html then

---

- python -m SimpleHTTPServer does not support "index dot nothing" nor dot nothing URLs
- http-server supports both "index dot nothing" AND dot nothing URLs
- koa-static does not support "index dot nothing" nor nothing URLs
- in-browser js does not distinguish between dot nothing URLs and .html URLs
- .html.html
- So
	- Do we have dot nothing URLs or also support .html?
	- How can the filesystem work for python -m and nouwiki-server?
		- We can't let wikilinks link to .html
		- So we could name files .nothing, but python -m doesn't serve that
		- So we could scratch python -m support
		- Or we could just name everything .html in urls as well
		- That way we would get file:/// support as well!
		- But that would require internal wikilinks to add .html to the link
		- So... there is a requirment, the server of the content must be able to:
			- visit .html files at .nothing
			-

## Dynamic Edit Models

- Text Editor
- Nouwiki Editor
- In-Browser

- GitHub Backend
- Nouwiki Backend

- Nouwiki-Github Edit Service


- Host on GitHub, edit with text editor or in-browser using a prose.io service or with a nouwiki specific editor
- Host on server running a nouwiki specific backend, edit
- Edit locally using a text editor or a nouwiki specific editor



- Saner split between dev dependancies and regular dependancies.
- Next Stage
	- in-browser editing on github (using in-browser markdown parsing + js-git)
		- How do we edit repos that are master and gh-pages where gh-pages are just the site directory?
		- Can we make gh-pages and master identical?
		- Fact: You can't use oauth 100% in the browser because it requires client_secret which can't be plainly written, so our only option is *maybe* to use Basic Auth, and if that doesn't work we need a Prose.io type service, or.. a very minimalistic client_secret service.
	- Make sure all current build targets work
	- Reconsider commander options
	- could we have the HTML in a specific folder? Because there are two things to delete, template assets and html, template assets is easy, html is a bit more difficult due to its location and can be made less difficult by setting it all in a folder, except for index.html which rests in the root, which also makes it easy given its a single file, but.. that would mess up the URLs
	- Elecron GUI should have the options "serve on port: <insert>", which uses the server part of the Universal App.
