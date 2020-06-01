/**
 * @author Eduardo Fernandez (edufdez.es)
 * @copyright (c) 2020 Eduardo Fernandez - All rights reserved, just ask me to use it at <yo@edufdez.es>
 */

var Terminal = (function () {
    //#region vars and const

    var firstPrompt = true;
    var prompt = "";

    //#endregion

    var promptInput = function (term, callback) {
        var inputField;
        if (document.getElementById('TermianlInput') != null) {
            inputField = document.getElementById('TermianlInput');
        } else {
            inputField = document.createElement('input');

            inputField.id = 'TermianlInput';

            inputField.style.position = 'absolute';
            inputField.style.zIndex = '-100';
            inputField.style.outline = 'none';
            inputField.style.border = 'none';
            inputField.style.opacity = '0';
            inputField.style.fontSize = '0.2em';

            term.inputLine.textContent = prompt;
            term._input.style.display = 'block';

            term.html.appendChild(inputField);
            cursorBlink(inputField, term);
        }

        inputField.onblur = function () {
            term.cursor.style.display = 'none';
        };

        inputField.onfocus = function () {
            inputField.value = term.inputLine.textContent;
            term.cursor.style.display = 'inline';
        };

        term.html.onclick = function () {
            inputField.focus();
        };

        inputField.onkeydown = function (e) {
            // keys in order: left, up, right, down, tab
            if (e.which === 37 || e.which === 38 || e.which === 39 || e.which === 40 || e.which === 9) {
                e.preventDefault();

                if (e.which === 38 && term.upCallback != null) {
                    term.upCallback();
                }

                if (e.which === 40 && term.downCallback != null) {
                    term.downCallback();
                }

            } else if (e.which !== 13) { // enter key
                if (e.which == 8) { // backspace key
                    if (term.inputLine.textContent.length <= prompt.length) { // this prevent the prompt to be removed
                        e.preventDefault();
                    }
                }
                setTimeout(function () {
                    term.inputLine.textContent = inputField.value;
                }, 1);
            }
            
            inputField.focus();
        };

        inputField.onkeyup = function (e) {
            inputField.focus();
            
            if (e.which === 13) { // enter key
                terminal._input.style.display = 'none';
                var inputValue = inputField.value;
                terminal.println(inputValue);
                terminal.html.removeChild(inputField);

                callback(inputValue.substring(prompt.length, inputValue.length));
            }
        };

        if (firstPrompt) {
            firstPrompt = false;
            setTimeout(function () { inputField.focus(); }, 50);
        } else {
            inputField.focus();
        }
    };

    /**
     * This make the cursor blink every half a second, like a real terminal
     * 
     * @param {Object} input the input field
     * @param {Object} term the terminal object
     */
    var cursorBlink = function (input, term) {
        var cursor = term.cursor;

        setTimeout(function () {
            if (input.parentElement && term.cursorShoudBlink) {
                cursor.style.visibility = cursor.style.visibility === 'visible' ? 'hidden' : 'visible';
                cursorBlink(input, term);
            } else {
                cursor.style.visibility = 'visible';
            }
        }, 500);
    };

    var TerminalConstructor = function (id) {
        this.html = document.createElement('div');
        this.html.className = 'Terminal';
        if (typeof (id) === 'string') { this.html.id = id; }

        this.innerWindow = document.createElement('div');
        this.output = document.createElement('p');
        this.inputLine = document.createElement('span'); // the span element where the users input is put
        this.inputLine.id = "inputLine";
        this.cursor = document.createElement('span');
        this._input = document.createElement('p'); // the full element administering the user input, including cursor

        this.cursorShoudBlink = true;

        this.upCallback = null;
        this.downCallback = null;

        this.println = function (msg) {
            if (msg == null) {
                msg = "\b";
            }

            var line = document.getElementById('lastLine');
            if (line != null) {
                line.id = null;
            }

            var newLine = document.createElement('div');
            newLine.id = 'lastLine';
            newLine.textContent = msg;

            this.output.appendChild(newLine);
            window.scrollTo(0, document.body.scrollHeight);
        };

        this.print = function (msg) {
            var line = document.getElementById('lastLine');
            if (line == null) {
                this.println(msg);
            } else {
                line.textContent += msg;
            }
            window.scrollTo(0, document.body.scrollHeight);
        };

        this.printHTML = function (code) {
            var line = document.getElementById('lastLine');
            if (line != null) {
                line.id = null;
            }

            var newLine = document.createElement('div');
            newLine.innerHTML = code;

            this.output.appendChild(newLine);
            window.scrollTo(0, document.body.scrollHeight);
        };

        this.input = function (callback) {
            promptInput(this, callback);
        };

        this.clear = function () {
            this.output.innerHTML = '';
        };

        this.setPrompt = function (string) {
            prompt = string;
        };

        this.getPrompt = function () {
            return prompt;
        };

        this.blinkingCursor = function (bool) {
            this.cursorShoudBlink = bool;
        };

        this.setUpCallback = function (callback) {
            this.upCallback = callback;
        };

        this.setDownCallback = function (callback) {
            this.downCallback = callback;
        };

        this._input.appendChild(this.inputLine);
        this._input.appendChild(this.cursor);
        this.innerWindow.appendChild(this.output);
        this.innerWindow.appendChild(this._input);
        this.html.appendChild(this.innerWindow);

        this.html.style.width = '100%';
        this.html.style.height = '100%';
        this.html.style.margin = '0';
        this.innerWindow.style.padding = '10px';
        this._input.style.margin = '0';
        this.output.style.margin = '0';
        this.cursor.style.background = 'white';
        this._input.style.display = 'none';

        // we need something to make the cursor, just a letter and then i hide it, solved.
        this.cursor.innerHTML = 'H';
        this.cursor.style.display = 'none';
    };

    return TerminalConstructor;
}());
