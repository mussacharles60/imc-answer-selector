const electron = require('electron');
const ipcRenderer = electron.ipcRenderer;

var $ = jQuery = require("jquery");

// const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

// const beep = () => {
//     var oscillator = audioCtx.createOscillator();
//     var gainNode = audioCtx.createGain();

//     oscillator.connect(gainNode);
//     gainNode.connect(audioCtx.destination);

//     gainNode.gain.value = 1; // volume
//     oscillator.frequency.value = 2310; // frequency
//     oscillator.type = 'sawtooth'; // type

//     oscillator.start();

//     setTimeout(
//         function () {
//             oscillator.stop();
//         },
//         250 // duration
//     );
// };

const path = require('path');
// voices powered by https://voicemaker.in/
const audio_1_file = path.join(__dirname, '/assets/audio-1.mp3');
const audio_2_file = path.join(__dirname, '/assets/audio-2.mp3');
const audio_3_file = path.join(__dirname, '/assets/audio-3.mp3');
const audio_4_file = path.join(__dirname, '/assets/audio-4.mp3');
const audio_5_file = path.join(__dirname, '/assets/audio-5.mp3');

var connected = false;

function listenAudioEvents(audio) {
    audio.addEventListener('play', () => {
        $('#amin-container').hide();
        $('#first').hide();
        $('#output-container').show();
    });
    audio.addEventListener('ended', () => {
        $('#amin-container').show();
        if (connected) {
            $('#first').hide();
        } else {
            $('#first').show();
        }
        $('#output-container').hide();
    });
}

let audio = new Audio();
listenAudioEvents(audio);

document.addEventListener('DOMContentLoaded', function () {
    $('#start-btn').on('click', () => {
        ipcRenderer.send('on-start-click', 'do-it');
    });
    $('#stop-btn').hide();
    $('#amin-container').hide();

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
    connected = true;
    $('#start-btn').hide();
    $('#stop-btn').show();
    $('#stop-btn').on('click', () => {
        ipcRenderer.send('on-stop-click', 'do-it');
    });
    $('#status').text('Connected');
    $('#first').hide();
    $('#amin-container').show();
});

ipcRenderer.on('on-serial-close', () => {
    connected = false;
    $('#start-btn').show();
    $('#stop-btn').hide();
    $('#status').text('Not Connected');
    $('#first').hide();
    $('#btns-container').show();
});

ipcRenderer.on('on-serial-data', (_event, data) => {
    $('#amin-container').hide();
    $('#output-container').show();
    console.log("on-serial-data:", data);
    $('#output-text').text(data);
    // beep();
    audio.pause();
    if (data == 1) {
        audio = new Audio(audio_1_file);
    }
    else if (data == 2) {
        audio = new Audio(audio_2_file);
    }
    else if (data == 3) {
        audio = new Audio(audio_3_file);
    }
    else if (data == 4) {
        audio = new Audio(audio_4_file);
    }
    else if (data == 5) {
        audio = new Audio(audio_5_file);
    }
    listenAudioEvents(audio);
    audio.play();
});
