const { app, BrowserWindow, ipcMain, Menu, MenuItem, dialog } = require('electron');
const path = require('path');
const Serialport = require('serialport');
const Readline = require('@serialport/parser-readline');
const fixPath = require('fix-path');

fixPath();

//var temp_data = 0;
//var last_data = 100;
var read_data_allowed = false;
var is_dialog_opened = false;
var is_serialport_opened = false;
var is_devtool_opened = false;
var is_app_quit = false;

var selected_port = 'No Selected Port';

var serialport = null;

const createWindow = () => {
    const mainWindow = new BrowserWindow({
        width: 1125,
        height: 600,
        minWidth: 1125,
        minHeight: 600,
        icon: path.join(__dirname, 'icon.ico'),
        resizable: true,
        fullscreenable: true,
        webPreferences: {
            nodeIntegration: true
        },
        show: false
    });

    mainWindow.loadFile(path.join(__dirname, 'index.html'));
    mainWindow.setMenu(null);

    mainWindow.on('ready-to-show', () => {
        mainWindow.show();
        // get the stored value of 'isMaximized' from local storage using executeJavaScript
        mainWindow.webContents.executeJavaScript(`
            localStorage.getItem('isMaximized')
        `).then(isMaximized => {
            if (isMaximized) {
                mainWindow.maximize();
            }
        }).catch(err => {
            console.log(err);
        });
    });

    // listen when window is maximized
    mainWindow.on('maximize', () => {
        // save to local storage by executing mainWindow.webContents.executeJavaScript
        mainWindow.webContents.executeJavaScript(`
            localStorage.setItem('isMaximized', true);
        `);
    });

    // listen when window is unmaximized
    mainWindow.on('unmaximize', () => {
        // save to local storage by executing mainWindow.webContents.executeJavaScript
        mainWindow.webContents.executeJavaScript(`
            localStorage.setItem('isMaximized', false);
        `);
    });




    // mainWindow.webContents.openDevTools(); // Open the DevTools.

    ipcMain.on('on-dev-click', (event, arg) => {
        if (is_devtool_opened) {
            if (!is_app_quit && !mainWindow.isDestroyed()) {
                mainWindow.webContents.closeDevTools();
                is_devtool_opened = false;
            }
        } else {
            if (!is_app_quit && !mainWindow.isDestroyed()) {
                mainWindow.webContents.openDevTools();
                is_devtool_opened = true;
            }
        }
    });

    ipcMain.on('on-restart-click', (event, arg) => {
        if (!is_app_quit && !mainWindow.isDestroyed()) {
            is_app_quit = true;
            app.relaunch();
            app.quit();
        }
    });

    ipcMain.on('on-start-click', (event, arg) => {
        if (!is_app_quit && !mainWindow.isDestroyed()) {
            initSerialPort();
        }
    });

    ipcMain.on('on-stop-click', (event, arg) => {
        if (!is_app_quit && !mainWindow.isDestroyed()) {
            closeSerialPort();
        }
    });

    ipcMain.on('escape-key', (event, arg) => {
        if (!is_dialog_opened) {
            closeSerialPort();
            if (mainWindow != null) {
                mainWindow.destroy();
            }
        }
    });

    // const setMainMenu = () => {
    //     Menu.setApplicationMenu(Menu.buildFromTemplate(
    //         [{
    //             label: 'System',
    //             submenu: [{
    //                 label: 'Restart',
    //                 click() {
    //                     app.relaunch();
    //                     app.quit();
    //                 }
    //             },
    //             {
    //                 label: 'Exit  [ESC]',
    //                 click() {
    //                     app.quit();
    //                 }
    //             }
    //             ]
    //         },
    //         {
    //             label: 'Tools',
    //             submenu: [{
    //                 label: 'Configure device port   ' + '(' + selected_port + ')',
    //                 id: 'change_port',
    //                 click() {
    //                     getAvailablePorts();
    //                 }
    //             }]
    //         },
    //         {
    //             label: 'About',
    //             submenu: [{
    //                 label: 'License'
    //             }]
    //         },
    //         ]
    //     ));
    // }

    const getAvailablePorts = () => {
        Serialport.list().then(function (ports_data) {
            // console.log('serial-ports-list: ', ports_data);
            if (ports_data.length === 0) {

                is_dialog_opened = true;

                dialog.showMessageBox(mainWindow, {
                    type: 'info',
                    title: 'IMC - Hardware Devices',
                    message: 'No Ports Found!',
                    detail: 'Please connect the hardware device',
                    buttons: ['Cancel', '* Refresh *']
                }).then(res => {
                    // console.log("res_1: ", res);
                    is_dialog_opened = false;
                    if (res) {
                        if (res.response == 1) {
                            setTimeout(() => getAvailablePorts(), 1000);  // refresh after 1 second
                        }
                    }
                });
            } else {
                const menu = new Menu();
                menu.append(new MenuItem({
                    label: 'Cancel',
                    id: 'Cancel',
                    click: () => { }
                }));
                menu.append(new MenuItem({
                    label: '* Refresh *',
                    id: 'refresh',
                    click: () => {
                        setTimeout(() => getAvailablePorts(), 1000);
                    }
                }));

                for (var i = 0; i < ports_data.length; i++) {
                    const name = ports_data[i].path;
                    const displayName = name == selected_port ? name + " (Current Selected)" : name;
                    menu.append(new MenuItem({
                        label: displayName,
                        id: 'port-' + i,
                        click: (item, _window) => {
                            if (item.id.startsWith('port-')) {
                                const positionStr = item.id.split('-')[1];
                                const position = parseInt(positionStr);
                                const port_name = ports_data[position].path;
                                savePort(port_name);
                            }
                        }
                    }));
                }

                menu.popup(mainWindow);

                // let options = {
                //     type: 'info',
                //     title: 'IMC - Hardware Devices',
                //     message: 'Select Port',
                //     // detail: 'Ports: ' + ports_data,
                //     buttons: btns_display
                // };

                // is_dialog_opened = true;

                // dialog.showMessageBox(mainWindow, options).then(res => {
                //     // console.log("res_2: ");
                //     // console.log(res);
                //     is_dialog_opened = false;
                //     if (res) {
                //         if (res.response == 1) {
                //             setTimeout(function () {
                //                 getAvailablePorts(); // refresh
                //             }, 1000);
                //         } else if (res.response > 1) {
                //             // for (var i = 0; i < btns.length; i++) {
                //             //     console.log('found port:' + `${btns[i]}`);
                //             // }
                //             const position = res.response;
                //             // console.log('selected position:' + position);
                //             const name = btns[position];
                //             // console.log('selected port:' + name);
                //             savePort(name);
                //         }
                //     }
                // });
            }
        });
    }

    const savePort = (portName) => {
        selected_port = portName;
        // console.log('port saved: ' + portName);
        // Menu.setApplicationMenu(Menu.buildFromTemplate(
        //     [{
        //         label: 'System',
        //         submenu: [{
        //             label: 'Restart',
        //             click() {
        //                 app.relaunch();
        //                 app.quit();
        //             }
        //         },
        //         {
        //             label: 'Exit  [ESC]',
        //             click() {
        //                 app.quit();
        //             }
        //         }
        //         ]
        //     },
        //     {
        //         label: 'Tools',
        //         submenu: [{
        //             label: 'Configure device port   ' + '(' + selected_port + ')',
        //             id: 'change_port',
        //             click() {
        //                 // console.log('Oh, hi there!');
        //                 getAvailablePorts();
        //             }
        //         }]
        //     },
        //     {
        //         label: 'About',
        //         submenu: [{
        //             label: 'License'
        //         }]
        //     },
        //     ]
        // ));
        if (serialport && serialport.isOpen) {
            serialport.close();
            serialport = null;
            is_serialport_opened = false;
        }
        setTimeout(() => initSerialPort(), 1000);
    }

    const initSerialPort = () => {
        if (selected_port === 'No Selected Port') {
            //showWarnignDialog();
            getAvailablePorts();
            return;
        }
        try {
            serialport = new Serialport(selected_port, {
                baudRate: 9600,
                autoOpen: false
            });

            const parser = serialport.pipe(new Readline({ delimiter: '\n' }));

            // console.log('serial-port: trying to open');
            serialport.open(err => {
                if (err) {
                    console.log('serial-port: error open: ', err.message);
                }
            });

            serialport.on('open', () => {
                is_serialport_opened = true;
                // console.log('serial-port: ' + selected_port + ' opened');
                mainWindow.webContents.send('on-serial-open', 'do-it');
            });

            parser.on('data', data => {
                // console.log('serial-data: received: ', data);
                //if (read_data_allowed) {
                try {
                    data = data + "";
                    var temp_data = parseInt(data);
                    if (temp_data != NaN) {
                        // console.log("data: " + temp_data);
                        // code...
                        mainWindow.webContents.send('on-serial-data', temp_data);
                    }
                } catch (err) {
                    console.log('serial-data: error: ', err.message);
                }
                //}
            });

            parser.on('close', () => {
                is_serialport_opened = false;
                console.log('serial-closed');
                mainWindow.webContents.send('on-serial-close', 'do-it');
            });

            parser.on('error', err => {
                console.log('serial-error: ', err);
                showWarnignDialog();
            });

            parser.on('end', () => {
                console.log('serial-ended');
            });

        } catch (e) {
            console.log('serial-port: caught: ', e);
        }
    }

    const closeSerialPort = () => {
        if (serialport && serialport.isOpen) {
            serialport.close();
            is_serialport_opened = false;
            mainWindow.webContents.send('on-serial-close', 'do-it');
        }
    }

    const showWarnignDialog = () => {
        var this_message = selected_port == 'No Selected Port' ?
            'ERROR! The Hardware Device Not Found.' :
            'ERROR! The Hardware Device On \'' + selected_port + '\' Not Found.';

        is_dialog_opened = true;

        dialog.showMessageBox(mainWindow, {
            type: 'error',
            title: 'Lift - Connection error',
            message: this_message,
            detail: 'Please make sure the hardware device is connected and you select the corresponding port of the device.',
            buttons: ['Restart And Configure Port']
        }).then(res => {
            // console.log(res);
            is_dialog_opened = false;
            if (res) {
                setTimeout(() => {
                    app.relaunch();
                    app.quit();
                }, 1000);
            }
        });
    }

    // setMainMenu();
};

if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
    is_app_quit = true;
    app.quit();
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
    is_app_quit = true;
});

app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});