const
    git = require("nodegit"),
    prompt = require("prompt"),
    P = require("bluebird"),
    espree = require("espree");

console.log(`Current dir: ${process.cwd()}`);

const repoP = git.Repository.open(process.cwd()).catch(err => console.log(`Error! ${err}`));

prompt.start();

prompt.get(["branch", "module"], (err, { branch, module }) => {
    console.log(`Inspecting module ${module} on branch ${branch}`);
    getBranchHead(repoP, branch)
        .then(getFile(module))
        .then(analyze);
});

const print = blob => {
    const content = blob.toString().split('\n');
    console.log(`${content.length} lines`);
};

const constant = val => () => val;
const isPromise = obj =>
    !!(obj.then && obj.done && obj.state);

const waitForDeps = func => (...args) =>
    P.all(args.map(arg => P.resolve(arg))).then(func);

const getBranchHead = waitForDeps(([repo, branch]) => {
    return repo.getBranchCommit(branch);
});

const getFile = name => commit => {
    return commit.getEntry(name).then(entry => entry.getBlob());
};

const analyze = file => {
    console.log("Analyzing...");

    const ast = espree.parse(file);
    console.log(JSON.stringify(ast));
};
