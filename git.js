var path = require('path');
var fs = require('fs-extra');
var promisify = require("promisify-node");
var nodegit = require("nodegit");

fs.ensureDir = promisify(fs.ensureDir);

var author = nodegit.Signature.create("Anonymous",
  "anonymous@anonymous.com", 123456789, 60);
var committer = nodegit.Signature.create("Anonymous",
  "anonymous@anonymous.com", 123456789, 60);

function initRepo(root) {
  var repository;
  var index;

  var isBare = 0;
  nodegit.Repository.init(root, isBare)
  .then(function(repo) {
    repository = repo;
  })
  .then(function(){
    return repository.openIndex();
  })
  .then(function(i) {
    index = i;
    return index.read(1);
  })
  .then(function() {
    return index.addAll("*");
  })
  .then(function() {
    return index.write();
  })
  .then(function() {
    return index.writeTree();
  })
  .then(function(oid) {
    return repository.createCommit("HEAD", author, committer, "nouwiki wiki init", oid, []);
  })
  .done(function(commitId) {
    console.log("New Commit: ", commitId);
  });
}

function addAndCommitPage(root, page, message) {
  var dotgit = path.join(root, ".git");

  var repository;
  var index;
  var oid;

  console.log(page)

  nodegit.Repository.open(dotgit)
  .then(function(repo) {
    repository = repo;
    return fs.ensureDir(repository.workdir());
  })
  .then(function() {
    return repository.openIndex();
  })
  .then(function(indexResult) {
    index = indexResult;
    return index.read(1);
  })
  .then(function() {
    index.addByPath("markup/"+page+".md");
    index.addByPath(page+".html");
    return index;
  })
  .then(function() {
    return index.write();
  })
  .then(function() {
    return index.writeTree();
  })
  .then(function(oidResult) {
    oid = oidResult;
    return nodegit.Reference.nameToId(repository, "HEAD");
  })
  .then(function(head) {
    return repository.getCommit(head);
  })
  .then(function(parent) {
    return repository.createCommit("HEAD", author, committer, message, oid, [parent]);
  })
  .done(function(commitId) {
    console.log("New Commit: ", commitId);
  });
}

function addAndCommitPages(root, pages, message) {
  var dotgit = path.join(root, ".git");

  var repository;
  var index;
  var oid;

  console.log(pages)

  nodegit.Repository.open(dotgit)
  .then(function(repo) {
    repository = repo;
    return fs.ensureDir(repository.workdir());
  })
  .then(function() {
    return repository.openIndex();
  })
  .then(function(indexResult) {
    index = indexResult;
    return index.read(1);
  })
  .then(function() {
    var i;
    for (var p in pages) {
      index.addByPath("markup/"+pages[p]+".md");
      i = index.addByPath(pages[p]+".html");
    }
    return i;
  })
  .then(function() {
    return index.write();
  })
  .then(function() {
    return index.writeTree();
  })
  .then(function(oidResult) {
    oid = oidResult;
    return nodegit.Reference.nameToId(repository, "HEAD");
  })
  .then(function(head) {
    return repository.getCommit(head);
  })
  .then(function(parent) {
    return repository.createCommit("HEAD", author, committer, message, oid, [parent]);
  })
  .done(function(commitId) {
    console.log("New Commit: ", commitId);
  });
}


function addAndCommitFile(root, file_path, message) {
  var dotgit = path.join(root, ".git");

  var repository;
  var index;
  var oid;

  nodegit.Repository.open(dotgit)
  .then(function(repo) {
    repository = repo;
    return fs.ensureDir(repository.workdir());
  })
  .then(function() {
    return repository.openIndex();
  })
  .then(function(indexResult) {
    index = indexResult;
    return index.read(1);
  })
  .then(function() {
    return index.addAll(file_path);
  })
  .then(function() {
    return index.write();
  })
  .then(function() {
    return index.writeTree();
  })
  .then(function(oidResult) {
    oid = oidResult;
    return nodegit.Reference.nameToId(repository, "HEAD");
  })
  .then(function(head) {
    return repository.getCommit(head);
  })
  .then(function(parent) {
    return repository.createCommit("HEAD", author, committer, message, oid, [parent]);
  })
  .done(function(commitId) {
    console.log("New Commit: ", commitId);
  });
}

function addAndCommitFiles(root, file_paths, message) {
  var dotgit = path.join(root, ".git");

  var repository;
  var index;
  var oid;

  nodegit.Repository.open(dotgit)
  .then(function(repo) {
    repository = repo;
    return fs.ensureDir(repository.workdir());
  })
  .then(function() {
    return repository.openIndex();
  })
  .then(function(indexResult) {
    index = indexResult;
    return index.read(1);
  })
  .then(function() {
    var i;
    for (var fp in file_paths) {
      i = index.addAll(file_paths[fp]);
    }
    return i;
  })
  .then(function() {
    return index.write();
  })
  .then(function() {
    return index.writeTree();
  })
  .then(function(oidResult) {
    oid = oidResult;
    return nodegit.Reference.nameToId(repository, "HEAD");
  })
  .then(function(head) {
    return repository.getCommit(head);
  })
  .then(function(parent) {
    return repository.createCommit("HEAD", author, committer, message, oid, [parent]);
  })
  .done(function(commitId) {
    console.log("New Commit: ", commitId);
  });
}


exports.initRepo = initRepo;
exports.addAndCommitPage = addAndCommitPage;
exports.addAndCommitPages = addAndCommitPages;
exports.addAndCommitFile = addAndCommitFile;
exports.addAndCommitFiles = addAndCommitFiles;
