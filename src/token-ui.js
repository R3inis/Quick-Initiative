import OBR from "@owlbear-rodeo/sdk";

const SETTINGS_KEY = "com.my-extension/roll-settings";

OBR.onReady(async () => {
  const modInput = document.getElementById("modInput");
  const radios = document.getElementsByName("rollType");
  const saveBtn = document.getElementById("saveBtn");

  // 1. Load existing settings when the popover opens
  const selection = await OBR.player.getSelection();
  if (selection && selection.length > 0) {
    const items = await OBR.scene.items.getItems(selection);
    const item = items[0];
    
    if (item.metadata[SETTINGS_KEY]) {
      modInput.value = item.metadata[SETTINGS_KEY].modifier; // Fills in 0, 1, 2, etc.
      radios.forEach(r => {
        if (r.value === item.metadata[SETTINGS_KEY].rollType) r.checked = true;
      });
    } else {
      modInput.value = ""; // Leaves it blank (N/A) if never set
    }
  }

  // 2. Explicitly save the settings ONLY when the button is clicked
  saveBtn.onclick = async () => {
    const val = modInput.value;
    const currentSelection = await OBR.player.getSelection();
    
    if (currentSelection && currentSelection.length > 0) {
      await OBR.scene.items.updateItems(currentSelection, (items) => {
        for (let i of items) {
          if (!i.metadata) i.metadata = {};
          
          if (val === "") {
            // The user left it blank (N/A) -> Remove the data so the scanner ignores it
            delete i.metadata[SETTINGS_KEY];
          } else {
            // The user typed a number (including 0) -> Save it explicitly
            const modifier = parseInt(val) || 0; 
            let rollType = "flat";
            radios.forEach(r => { if (r.checked) rollType = r.value; });
            i.metadata[SETTINGS_KEY] = { modifier, rollType };
          }
        }
      });
    }
    
    OBR.notification.show("Initiative settings saved!");
    OBR.popover.close("com.my-extension/setup-popover");
  };
});