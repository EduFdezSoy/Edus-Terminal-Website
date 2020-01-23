var terminal = new Terminal();
var is_sudo = false;
var is_temp_sudo = false;
var HISTORY = [];
var HISTORY_LAST = HISTORY.length;
var FILE_LIST = [
    ".",
    "..",
    "header",
    "motd",
    "about-me",
    "about-the-page",
    "socials",
    "contact",
    "dear-recruiter"
];


async function loadTerm() {
    document.getElementById("terminal").append(terminal.html);
    terminal.setPrompt("Guest@edufdez-es:~$ ");
    terminal.setUpCallback(historyUp);
    terminal.setDownCallback(historyDown);

    await printHeader();
    await printMOTD();

    showPrompt();
}

/**
 * Commands available and function each one calls
 * @param {String} command 
 */
async function commands(command) {
    var firstWord = trimSpaces(command).split(' ')[0];
    saveCommands(command);

    switch (firstWord) {
        case "help":
            await printHelp();
            break;

        case "clear":
            await doClear();
            break;

        case "ls":
            await printFileList();
            break;

        case "cat":
            await printCat(command);
            break;

        case "sudo":
            await doSudo(command);
            break;

        case "touch":
            await printTouch();
            break;

        case "cd":
            await print("no, you can't change the current directory in here.");
            break;

        case "":
            await print("");
            break;

        case "rm":
            await deleteFile(command);
            break;

        case "exit":
            await doExit();
            break;

        default:
            await print(command + ": command not found, type 'help' to see a list of commands.");
            break;
    }
}

//#region command functions

async function printHeader() {
    await loadText('txt/header.html', print);
    terminal.println();

    return;
}

async function printMOTD() {
    await loadText('txt/motd.html', print);
    terminal.println();

    return;
}

async function printHelp() {
    terminal.println();
    await loadText('txt/help.html', print);
    terminal.println();

    return;
}

async function doClear() {
    terminal.clear();
    await printHeader();

    return;
}

async function doExit() {
    if (is_sudo) {
        is_sudo = false;
        terminal.setPrompt("Guest@edufdez-es:~$ ");
    } else {
        await print("Bye!");
        console.log("I can't close this, I am JavaScript and do not have permissions to do that.");
        await sleep(1000);
        terminal.println();
    }

    return;
}

async function printFileList() {
    FILE_LIST.sort();

    terminal.println();
    await print(FILE_LIST);
    terminal.println();

    return;
}

async function printCat(command) {
    words = trimSpaces(command).split(' ');

    if (words.length > 2) {
        await print("Too many arguments");
    } else {
        if (words[1] == "." || words[1] == "..") {
            if (is_sudo || is_temp_sudo)
                await print("What are you trying? This is not a real shell, there's nothing in there.");
            else
                await print("cat: Permission denied");
        } else if (FILE_LIST.findIndex((element) => element == words[1]) != -1) {
            terminal.println();
            await loadText('txt/' + words[1] + '.html', print);
            terminal.println();
        } else {
            await print("cat: " + words[1] + ": No such file or directory");
        }
    }

    // remove temp sudo if it is set
    if (is_temp_sudo)
        is_temp_sudo = false;

    return;
}

async function printTouch() {
    if (is_sudo || is_temp_sudo)
        await print("you touched that");
    else
        await print("don't touch that!");


    // remove temp sudo if it is set
    if (is_temp_sudo)
        is_temp_sudo = false;

    return;
}

async function doSudo(command) {
    var words = trimSpaces(command).split(' ');

    if (words[0] == "sudo") {
        // if it is sudo su or only sudo 
        if (words[1] == null || words[1] == "su") {
            is_sudo = true;

            terminal.setPrompt("Guest@edufdez-es:~# ");
            await print("You have now Super Cow Powers.");
        } else {
            // if it is a command with sudo
            is_temp_sudo = true;

            command = "";
            words.shift();
            words.forEach(e => {
                command += e + " ";
            });

            await commands(command);
        }
    }

    return;
}

async function deleteFile(command) {
    words = trimSpaces(command).split(' ');

    if (words.length == 2) { // [0] is rm, [1] a file or something
        var index = FILE_LIST.findIndex((e) => e == words[1]);
        if (index != -1) {
            FILE_LIST.splice(index, 1);
            await print("rm: File deleted");
        } else {
            await print("rm: cannot remove '" + words[1] + "': No such file or directory");
        }
    } else if (words.length == 3) { // [0] is rm, [1] may be an arg and [2] a file or something
        // if the file is in the list we delete it
        var index = FILE_LIST.findIndex((e) => e == words[2]);
        if (index != -1) {
            FILE_LIST.splice(index, 1);
            await print("rm: File deleted");
        } else if (words[2] == "/") { // if we are deleting '/'
            if (words[1].toUpperCase() == "-RF")
                if (is_sudo || is_temp_sudo)
                    await rmRfSlash();
                else
                    await print("rm: Permission denied");
            else
                await print("rm: invalid option " + words[1]);
        } else {
            await print("rm: cannot remove '" + words[2] + "': No such file or directory");
        }
    } else {
        if (words.length < 2) {
            await print("rm: Argument expected.");
        } else {
            await print("rm: Too many arguments.");
        }
    }

    // remove temp sudo if it is set
    if (is_temp_sudo)
        is_temp_sudo = false;

    return;
}

async function rmRfSlash() {
    terminal.blinkingCursor(false);
    terminal.setPrompt(" ");
    await sleep(5000);
    terminal.clear();

    terminal.println();
    await sleep(2000);
    await print("You deleted everything.");
    await sleep(3000);
    await print("Are you satisfied?");
    await sleep(20000);
    terminal.println();
    await print("There's nothing here anymore, go home.");
    await sleep(5000);
    await print("Or reload the page.");

    // this will launch an exception, the element will not be in the html until this function ends
    // but we dont want it to end so its ok
    document.getElementById('TermianlInput').style.display = 'none';

    return;
}

//#endregion
//#region utils functions

async function showPrompt() {
    await terminal.input(async function (res) {
        await commands(res);
        showPrompt();
    });

    return;
}

async function print(text) {
    var lines;
    if (Array.isArray(text)) {
        lines = text;
    } else {
        lines = text.split('\n');
    }

    for (var i = 0; i < lines.length; i++) {
        terminal.printHTML(lines[i]);
        await sleep(25);
    }

    return;
}

async function loadText(url, callback) {
    await fetch(url)
        .then(res => { return res.text(); })
        .then(res => callback(res));

    return;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function trimSpaces(text) {
    return text.replace(/\s+/g, ' ').trim();
}

function saveCommands(command) {
    if (trimSpaces(command)) {
        HISTORY.push(command);
        HISTORY_LAST = HISTORY.length;
    }
}

function historyUp() {
    var line = document.getElementById('inputLine');
    line.textContent = terminal.getPrompt();

    var input = document.getElementById('TermianlInput');
    input.value = terminal.getPrompt();

    if (HISTORY_LAST > 0) {
        HISTORY_LAST--;
        line.textContent += HISTORY[HISTORY_LAST];
        document.getElementById('TermianlInput').value += HISTORY[HISTORY_LAST];
    }
}

function historyDown() {
    var line = document.getElementById('inputLine');
    line.textContent = terminal.getPrompt();

    var input = document.getElementById('TermianlInput');
    input.value = terminal.getPrompt();

    if (HISTORY_LAST < HISTORY.length) {
        line.textContent += HISTORY[HISTORY_LAST];
        document.getElementById('TermianlInput').value += HISTORY[HISTORY_LAST];
        HISTORY_LAST++;
    }  
}

//#endregion
