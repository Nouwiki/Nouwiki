# CHANGE LOG

## 22 March 2016

- Bugs
  - Markdown preview was using the dynamic plugins instead of nouwiki plugins.
  - Title search was broken.
- Features & Other
  - The content folder has merged with the wiki folder.
  - When running a wiki with a full backend (nouwiki) you can still access the static version and dynamic version easily.
  - And when running it with something like `http-server` the index.html file is configured to static or dynamic in nouwiki.toml but both can be also accessed through static.html and dynamic.html.
