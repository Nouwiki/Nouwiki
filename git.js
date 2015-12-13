var path = require('path');
var fs = require('fs-extra');
var promisify = require("promisify-node");
var nodegit = require("nodegit");

fs.ensureDir = promisify(fs.ensureDir);

function initRepo(root) {
  var isBare = 0;
  var repository;
  var index;

  nodegit.Repository.init(root, isBare)
  .then(function(repo) {
    repository = repo;
  })
  .then(function(){
    return repository.openIndex();
  })
  .then(function(idx) {
    index = idx;
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
    var author = nodegit.Signature.create("Anonymous",
      "anonymous@anonymous.com", 123456789, 60);
    var committer = nodegit.Signature.create("Anonymous",
      "anonymous@anonymous.com", 987654321, 90);

    // Since we're creating an inital commit, it has no parents. Note that unlike
    // normal we don't get the head either, because there isn't one yet.
    return repository.createCommit("HEAD", author, committer, "message", oid, []);
  })
  .done(function(commitId) {
    console.log("New Commit: ", commitId);
  });
}

function addAndCommitAll(root, message) {
  var repo;
  var index;
  var oid;

  var dotgit = path.join(root, ".git");

  nodegit.Repository.open(dotgit)
  .then(function(repoResult) {
    repo = repoResult;
    console.log("1")
    return fs.ensureDir(repo.workdir());
  })
  .then(function() {
    console.log("2")
    return repo.openIndex();
  })
  .then(function(indexResult) {
    console.log("3")
    index = indexResult;
    return index.read(1);
  })
  .then(function() {
    console.log("4")
    return index.addAll("*");
  })
  .then(function() {
    console.log("5")
    return index.write();
  })
  .then(function() {
    console.log("6")
    return index.writeTree();
  })
  .then(function(oidResult) {
    console.log("7")
    oid = oidResult;
    return nodegit.Reference.nameToId(repo, "HEAD");
  })
  .then(function(head) {
    console.log("8")
    return repo.getCommit(head);
  })
  .then(function(parent) {
    console.log("9")
    var author = nodegit.Signature.create("Anonymous",
      "anonymous@anonymous.com", 123456789, 60);
    var committer = nodegit.Signature.create("Anonymous",
      "anonymous@anonymous.com", 987654321, 90);

    return repo.createCommit("HEAD", author, committer, message, oid, [parent]);
  })
  .done(function(commitId) {
    console.log("10")
    console.log("New Commit: ", commitId);
  });
}

function addAndCommitPage(root, page, message) {
  var repo;
  var index;
  var oid;

  var dotgit = path.join(root, ".git");
  console.log(dotgit)
  var md = path.join(root, "markup", page+".md");
  var html = path.join(root, page+".html");

  nodegit.Repository.open(dotgit)
  .then(function(repoResult) {
    repo = repoResult;
    console.log(repo.getStatus())
    console.log("1")
    return fs.ensureDir(repo.workdir());
  })
  .then(function() {
    console.log("2")
    return repo.openIndex();
  })
  .then(function(indexResult) {
    console.log("3")
    index = indexResult;
    return index.read(1);
  })
  .then(function() {
    console.log("4")
    return index.addByPath("markup/"+page+".md");
  })
  .then(function() {
    console.log("5")
    return index.write();
  })
  .then(function() {
    console.log("6")
    return index.writeTree();
  })
  .then(function(oidResult) {
    console.log("7")
    oid = oidResult;
    return nodegit.Reference.nameToId(repo, "HEAD");
  })
  .then(function(head) {
    console.log("8")
    return repo.getCommit(head);
  })
  .then(function(parent) {
    console.log("9")
    var author = nodegit.Signature.create("Anonymous",
      "anonymous@anonymous.com", 123456789, 60);
    var committer = nodegit.Signature.create("Anonymous",
      "anonymous@anonymous.com", 987654321, 90);

    return repo.createCommit("HEAD", author, committer, message, oid, [parent]);
  })
  .done(function(commitId) {
    console.log("10")
    console.log("New Commit: ", commitId);
  });

  nodegit.Repository.open(dotgit)
  .then(function(repoResult) {
    repo = repoResult;
    console.log("1")
    return fs.ensureDir(repo.workdir());
  })
  .then(function() {
    console.log("2")
    return repo.openIndex();
  })
  .then(function(indexResult) {
    console.log("3")
    index = indexResult;
    return index.read(1);
  })
  .then(function() {
    console.log("4")
    return index.addByPath(page+".html");
  })
  .then(function() {
    console.log("5")
    return index.write();
  })
  .then(function() {
    console.log("6")
    return index.writeTree();
  })
  .then(function(oidResult) {
    console.log("7")
    oid = oidResult;
    return nodegit.Reference.nameToId(repo, "HEAD");
  })
  .then(function(head) {
    console.log("8")
    return repo.getCommit(head);
  })
  .then(function(parent) {
    console.log("9")
    var author = nodegit.Signature.create("Anonymous",
      "anonymous@anonymous.com", 123456789, 60);
    var committer = nodegit.Signature.create("Anonymous",
      "anonymous@anonymous.com", 987654321, 90);

    return repo.createCommit("HEAD", author, committer, message, oid, [parent]);
  })
  .done(function(commitId) {
    console.log("10")
    console.log("New Commit: ", commitId);
  });
}


function addAndCommitFile(root, file_path, message) {
  var repo;
  var index;
  var oid;

  var dotgit = path.join(root, ".git");

  nodegit.Repository.open(dotgit)
  .then(function(repoResult) {
    repo = repoResult;
    console.log("1")
    return fs.ensureDir(repo.workdir());
  })
  .then(function() {
    console.log("2")
    return repo.openIndex();
  })
  .then(function(indexResult) {
    console.log("3")
    index = indexResult;
    return index.read(1);
  })
  .then(function() {
    console.log("4")
    return index.addAll(file_path);
  })
  .then(function() {
    console.log("5")
    return index.write();
  })
  .then(function() {
    console.log("6")
    return index.writeTree();
  })
  .then(function(oidResult) {
    console.log("7")
    oid = oidResult;
    return nodegit.Reference.nameToId(repo, "HEAD");
  })
  .then(function(head) {
    console.log("8")
    return repo.getCommit(head);
  })
  .then(function(parent) {
    console.log("9")
    var author = nodegit.Signature.create("Anonymous",
      "anonymous@anonymous.com", 123456789, 60);
    var committer = nodegit.Signature.create("Anonymous",
      "anonymous@anonymous.com", 987654321, 90);

    return repo.createCommit("HEAD", author, committer, message, oid, [parent]);
  })
  .done(function(commitId) {
    console.log("10")
    console.log("New Commit: ", commitId);
  });
}


exports.initRepo = initRepo;
exports.addAndCommitAll = addAndCommitAll;
exports.addAndCommitPage = addAndCommitPage;
exports.addAndCommitFile = addAndCommitFile;
