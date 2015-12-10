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

## Install

Note that this is a very early prototype, but if you want to play with it:

- `npm i -g git+https://github.com/01AutoMonkey/nouwiki.git`
- `nouwiki new wiki ./directory`
- `nouwiki build ./directory`
- `nouwiki serve ./directory -p 8000`

## ToDo

- Support `file:///` and therefor also `python -m SimpleHTTPServer`, etc.
- Version control

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
