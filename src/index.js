const electron = require('electron');
const ipcRenderer = electron.ipcRenderer;

var $ = jQuery = require("jquery");

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

const beep = () => {
    var oscillator = audioCtx.createOscillator();
    var gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    gainNode.gain.value = 1; // volume
    oscillator.frequency.value = 2310; // frequency
    oscillator.type = 'sawtooth'; // type

    oscillator.start();

    setTimeout(
        function () {
            oscillator.stop();
        },
        250 // duration
    );
};

document.addEventListener('DOMContentLoaded', function () {
    $('#start-btn').on('click', () => {
        ipcRenderer.send('on-start-click', 'do-it');
    });
    $('#stop-btn').hide();

    document.onkeydown = function (evt) {
        evt = evt || window.event;
        var isEscape = false;
        var isDev = false;
        var isRestart = false;
        if ("key" in evt) {
            isEscape = (evt.key === "Escape" || evt.key === "Esc");
            isDev = (evt.ctrlKey && evt.shiftKey && evt.key === "I");
            isRestart = (evt.ctrlKey && evt.shiftKey && evt.key === "R");
        } else {
            isEscape = (evt.keyCode === 27);
            isDev = (evt.ctrlKey && evt.shiftKey && evt.keyCode === 73);
            isRestart = (evt.ctrlKey && evt.shiftKey && evt.keyCode === 82);
        }
        if (isEscape) {
            ipcRenderer.send('on-go-back', 'do-it');
        }
        if (isDev) {
            ipcRenderer.send('on-dev-click', 'do-it');
        }
        if (isRestart) {
            ipcRenderer.send('on-restart-click', 'do-it');
        }
    };
});

ipcRenderer.on('on-serial-open', () => {
    // hide start-btn
    $('#start-btn').hide();
    $('#stop-btn').show();
    $('#stop-btn').on('click', () => {
        ipcRenderer.send('on-stop-click', 'do-it');
    });
    $('#status').text('Connected');
});

ipcRenderer.on('on-serial-close', () => {
    $('#start-btn').show();
    $('#stop-btn').hide();
    $('#status').text('Not Connected');
});

ipcRenderer.on('on-serial-data', (_event, data) => {
    console.log("on-serial-data:", data);
    $('#output-text').text(data);
    beep();
});
