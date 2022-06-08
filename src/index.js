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

const path = require('path');
const audio_1_file = path.join(__dirname, '/assets/audio-1.mp3');
const audio_2_file = path.join(__dirname, '/assets/audio-2.mp3');
const audio_3_file = path.join(__dirname, '/assets/audio-3.mp3');
const audio_4_file = path.join(__dirname, '/assets/audio-4.mp3');
const audio_5_file = path.join(__dirname, '/assets/audio-5.mp3');

let audio = new Audio();
// let audio_2 = new Audio(audio_2_file);
// let audio_3 = new Audio(audio_3_file);
// let audio_4 = new Audio(audio_4_file);
// let audio_5 = new Audio(audio_5_file);

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
    // beep();

    if (data == 1) {
        // audio_2.pause();
        // audio_3.pause();
        // audio_4.pause();
        audio.pause();
        audio = new Audio(audio_1_file);
        audio.play();
    }
    else if (data == 2) {
        // audio_1.pause();
        // audio_3.pause();
        // audio_4.pause();
        audio.pause();
        audio = new Audio(audio_2_file);
        audio.play();
    }
    else if (data == 3) {
        // audio_1.pause();
        // audio_2.pause();
        // audio_4.pause();
        audio.pause();
        audio = new Audio(audio_3_file);
        audio.play();
    }
    else if (data == 4) {
        // audio_1.pause();
        // audio_2.pause();
        // audio_3.pause();
        // audio_5.pause();
        audio.pause();
        audio = new Audio(audio_4_file);
        audio.play();
    }
    else if (data == 5) {
        // audio_1.pause();
        // audio_2.pause();
        // audio_3.pause();
        // audio_4.pause();
        audio.pause();
        audio = new Audio(audio_5_file);
        audio.play();
    }
});
