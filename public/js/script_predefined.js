let Smash = {
  folder: "scripts/smash/",
  scriptfiles: {
    mash_jump: "Mash Jump",
    mash_ad4: "Mash Roll Left",
    mash_ad6: "Mash Roll Right",
    mash_shield: "Mash Shield",
    sdi_1: "SDI down left",
    sdi_3: "SDI down right",
    sdi_7: "SDI up left",
    sdi_9: "SDI up right",
    hold_shield: "Hold Shield",
  },
  initOptions() {
    let select = document.getElementById('SmashScripts');

    for (var key in this.scriptfiles) {
      var option = document.createElement("option");
      option.text = this.scriptfiles[key];
      option.value = key;
      select.add(option);
    }
    select.onchange = () => {
      let file = select.options[select.selectedIndex].value;
      let url = this.folder + file + ".txt";
      ScriptLoader.loadScript(url);
      openTASWindow();
    }
  }
}

let ScriptLoader = {
  window: null,
  openScriptWindow() {
    hideAllWindows();
    this.window.classList.remove("hidden");
  },
  /**
   *
   */
  loadScript(url) {
    fetch(url)
      .then(function(response) {
        response.text().then(function(text) {
          currentScriptParser.setScript(text);
        });
      });
  },
  init() {
    this.window = document.getElementById('ScriptContainer');

    document.getElementById('defaultScripts').onclick = () => {
      this.openScriptWindow();
    }
    document.getElementById('CloseScripts').onclick = () => {
      openTASWindow();
    }

    Smash.initOptions();
  }
}

ScriptLoader.init();
//  let url = this.folder + file + ".txt";
