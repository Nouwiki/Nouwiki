var path = require('path');
var fs = require('fs-extra');
var Promise = require('bluebird');
var nodegit = require("nodegit");

var ensureDir = Promise.promisify(fs.ensureDir);
var remove = Promise.promisify(fs.remove);


function initRepo(root) {
  var repository;
  var index;

  var isBare = 0;
  return nodegit.Repository.init(root, isBare)
  .then(function(repo) {
    repository = repo;
  })
  .then(function(){
    return repository.refreshIndex();
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
    var t = Math.floor(new Date() / 1000);
    var author = nodegit.Signature.create("Anonymous",
      "anonymous@anonymous.com", t, 0);
    var committer = nodegit.Signature.create("Anonymous",
      "anonymous@anonymous.com", t, 0);
    return repository.createCommit("HEAD", author, committer, "nouwiki wiki init", oid, []);
  })
  .catch(function(err) {
    console.error('err:', err);
    process.exit(1);
  });
}

function addAndCommitFiles(root, file_paths, message) {
  var repository;
  var repoPath;
  var index;
  var oid;

  return nodegit.Repository.open(root)
  .then(function(repo) {
    repository = repo;
    repoPath = repository.workdir();
    return ensureDir(repoPath);
  })
  .then(function() {
    return repository.refreshIndex();
  })
  .then(function(indexResult) {
    index = indexResult;
    return index.read(1);
  })
  .then(function() {
    return index.addAll(file_paths);
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
    var t = Math.floor(new Date() / 1000);
    var author = nodegit.Signature.create("Anonymous",
      "anonymous@anonymous.com", t, 0);
    var committer = nodegit.Signature.create("Anonymous",
      "anonymous@anonymous.com", t, 0);
    return repository.createCommit("HEAD", author, committer, message, oid, [parent]);
  })
  .catch(function(err) {
    console.error('err:', err);
    process.exit(1);
  });
}

function removeAndCommitFiles(root, file_paths, message) {
  var repository;
  var repoPath;
  var index;
  var oid;

  return nodegit.Repository.open(root)
  .then(function(repo) {
    repository = repo;
    repoPath = repository.workdir();
    return ensureDir(repoPath);
  })
  .then(function() {
    return repository.refreshIndex();
  })
  .then(function(indexResult) {
    index = indexResult;
    return index.read(1);
  })
  .then(function() {
    var tasks = [];
    file_paths.forEach(function(fpath) {
      var fullPath = fpath;
      tasks.push(remove(fullPath));
    });
    return Promise.all(tasks);
  })
  .then(function() {
    return index.removeAll(file_paths);
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
    var t = Math.floor(new Date() / 1000);
    var author = nodegit.Signature.create("Anonymous",
      "anonymous@anonymous.com", t, 0);
    var committer = nodegit.Signature.create("Anonymous",
      "anonymous@anonymous.com", t, 0);
    return repository.createCommit("HEAD", author, committer, message, oid, [parent]);
  })
  .catch(function(err) {
    console.error('err:', err);
    process.exit(1);
  });
}


exports.initRepo = initRepo;
exports.addAndCommitFiles = addAndCommitFiles;
exports.removeAndCommitFiles = removeAndCommitFiles;
