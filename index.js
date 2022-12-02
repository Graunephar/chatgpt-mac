const { menubar } = require("menubar");

const path = require("path");
const {
  app,
  nativeImage,
  shell,
  Menu,
  MenuItem,
  globalShortcut,
} = require("electron");

const image = nativeImage.createFromPath(
  path.join(__dirname, `images/newiconTemplate.png`)
);

const mb = menubar({
  browserWindow: {
    icon: image,
    transparent: path.join(__dirname, `images/iconApp.png`),
    webPreferences: {
      webviewTag: true,
      nativeWindowOpen: true,
    },
    width: 450,
    height: 550,
  },
  preloadWindow: true,
  showDockIcon: false,
  icon: image,
});

mb.on("ready", () => {
  app.dock.hide();

  const { window } = mb;

  const menu = new Menu();

  let isShown = false;
  menu
    .on("after-show", () => {
      isShown = true;
    })
    .on("after-hide", () => {
      isShown = false;
    })
    .on("focus-lost", () => {
      isShown = false;
    });

  globalShortcut.register("CommandOrControl+Shift+g", () => {
    console.log(window.isFocused(), window.isVisible());
    if (window.isVisible()) {
      mb.hideWindow();
    } else {
      mb.showWindow();
      mb.app.show();
      mb.app.focus();
    }
  });

  Menu.setApplicationMenu(menu);

  // open devtools
  // window.webContents.openDevTools();

  // open in new window
  app.on("web-contents-created", (event, contents) => {
    contents.on("will-navigate", (event, navigationUrl) => {
      event.preventDefault();
      shell.openExternal(navigationUrl);
    });
  });

  console.log("Menubar app is ready.");
});

// prevent background flickering
mb.app.commandLine.appendSwitch(
  "disable-backgrounding-occluded-windows",
  "true"
);

// restore focus to previous app on hiding
mb.on("after-hide", () => {
  mb.app.hide();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
