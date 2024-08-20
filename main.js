const {app, BrowserWindow, Menu, ipcMain, shell} = require('electron');
const path = require('path');
const os = require('os');
const fs = require('fs');
const resizeImg = require('resize-img');

// condition to check if it is developer mode then to toggle devtools in the window
process.env.NODE_ENV = 'production'; 
const isDev = process.env.NODE_ENV !== 'production';

// condition to check if it is a mac os
const isMac = process.platform === 'darwin';

let mainWindow;

// create a main window to display 
function createMainWindow() {
    mainWindow = new BrowserWindow({
        title: 'Image Resizer',
        width: isDev ? 1000 : 500,
        height: 600,
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: false,
            preload: path.join(__dirname, 'preload.js')
        },
    });

    //open devtools
    if(isDev) {
        mainWindow.webContents.openDevTools();
    }
    // specify the route of the folder to be displayed in the window
    mainWindow.loadFile(path.join(__dirname, './renderer/index.html'));
};

// create about window
function createAboutWindow() {
    const aboutWindow = new BrowserWindow({
        title: 'About Image resizer',
        width: 300,
        height: 300,
    });

    //route to the about window
    aboutWindow.loadFile(path.join(__dirname, './renderer/about.html'));
}

app.whenReady().then(() => {
    createMainWindow(); 

    const mainMenu = Menu.buildFromTemplate(menu);
    Menu.setApplicationMenu(menu);

    // remove mainWindow from memory onclose
    mainWindow.on('closed', () => (mainWindow = null))

    //activate all windows
    app.on('activate', () => {
        if(BrowserWindow.getAllWindows().length === 0) {
            createMainWindow();
        }
    });
});

// Menu Template
const menu = [ 
    ...(isMac ? [{
        label: app.name,
        submenu: [
            {
                label: 'About',
                click: createAboutWindow,
            }
        ]
    }]: []),
    {
        role: 'fileMenu'
    },
    ...(!isMac ? [
        {
            label: 'Help',
            submenu: [
                {
                    label: 'About',
                    click: createAboutWindow,
                },
            ]
        }
    ] : [])
]

// respond to ipcrenderer resize
ipcMain.on('image:resize', (e, options) => {
    options.dest = path.join(os.homedir(), 'imageresizer');
    console.log('Received options:', options);
    resizeImage(options);
});


// resize the image
const resizeImage = async ({ imgPath, width, height, dest }) => {
    if (!imgPath) {
        console.error("imgPath is undefined or invalid.");
        return;
    }

    try {
        const newPath = await resizeImg(fs.readFileSync(imgPath), {
            width: +width,
            height: +height
        });
        const filename = path.basename(imgPath);

        //ceate destination folder if not exist
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest);
        }
        // write folder to destination folder
        fs.writeFileSync(path.join(dest, filename), newPath);

        // send message
        mainWindow.webContents.send('image:done');

        //open destination path
        shell.openPath(dest);   
    } catch (error) {
        console.log(error);
        
    }
}
// when the window is closed no need to explicitly stop our server
app.on('window-all-closed', () => {
    if(!isMac) {
        app.quit();
    }
})