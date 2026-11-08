import OBR from "@owlbear-rodeo/sdk";

const SETTINGS_KEY = "com.my-extension/roll-settings";
const TRACKER_KEY = "com.pretty-initiative/metadata"; 

OBR.onReady(() => {
  // 1. Context Menu: Setup Token
  OBR.contextMenu.create({
    id: "com.my-extension/setup-token",
    icons: [
      { icon: "/icon.svg", label: "Setup Initiative", filter: { every: [{ key: "layer", value: "CHARACTER" }] } }
    ],
    onClick: (context) => {
      OBR.popover.open({
        id: "com.my-extension/setup-popover",
        url: "/token-ui.html",
        height: 200,
        width: 250,
        anchorElementId: context.items[0].id
      });
    }
  });

  // 2. Context Menu: Roll Individual Token
  OBR.contextMenu.create({
    id: "com.my-extension/roll-and-send",
    icons: [
      { icon: "/icon.svg", label: "Roll & Send to Tracker", filter: { every: [{ key: "layer", value: "CHARACTER" }] } }
    ],
    onClick: async (context) => {
      const itemIds = context.items.map(item => item.id);
      await rollAndSend(itemIds);
      OBR.notification.show(`Rolled initiative for ${itemIds.length} token(s).`);
    }
  });

  // 3. Create the Main Tool (Appears on the left vertical toolbar)
  OBR.tool.create({
    id: "com.my-extension/initiative-tool",
    icons: [
      { icon: "/icon.svg", label: "Initiative Roller" }
    ],
    defaultMode: "com.my-extension/initiative-mode",
    defaultMetadata: {}
  });

  // 4. Create the Tool Mode (Required for a Tool to function)
  OBR.tool.createMode({
    id: "com.my-extension/initiative-mode",
    icons: [
      { icon: "/icon.svg", label: "Initiative Mode", filter: { activeTools: ["com.my-extension/initiative-tool"] } }
    ],
    preventDrag: { document: true } // Prevents accidentally panning the map when clicking around
  });

  // 5. Create the Tool Action (The clickable button in the secondary horizontal bar)
  OBR.tool.createAction({
    id: "com.my-extension/roll-all-action",
    icons: [
      { icon: "/icon.svg", label: "Roll All Setup Tokens", filter: { activeTools: ["com.my-extension/initiative-tool"] } }
    ],
    onClick: async () => {
      const allItems = await OBR.scene.items.getItems();
      
      // Filter specifically for Character tokens that have had the Setup UI run on them
      const setupTokens = allItems.filter(item => 
        item.layer === "CHARACTER" && 
        item.metadata[SETTINGS_KEY] !== undefined
      );

      if (setupTokens.length === 0) {
        OBR.notification.show("No tokens found with initiative set up!");
        return;
      }
      
      const itemIds = setupTokens.map(item => item.id);
      await rollAndSend(itemIds);
      OBR.notification.show(`Global Roll: Sent ${itemIds.length} character(s) to the tracker.`);
    }
  });
});

// Helper function to handle the math and metadata injection safely
async function rollAndSend(itemIds) {
  if (!itemIds || itemIds.length === 0) return;
  
  await OBR.scene.items.updateItems(itemIds, (items) => {
    for (let item of items) {
      const settings = item.metadata[SETTINGS_KEY] || { modifier: 0, rollType: "flat" };
      
      let roll1 = Math.floor(Math.random() * 20) + 1;
      let roll2 = Math.floor(Math.random() * 20) + 1;
      let baseRoll = roll1;

      if (settings.rollType === "advantage") baseRoll = Math.max(roll1, roll2);
      if (settings.rollType === "disadvantage") baseRoll = Math.min(roll1, roll2);

      const total = baseRoll + settings.modifier;

      if (!item.metadata) item.metadata = {};
      const existingTrackerData = item.metadata[TRACKER_KEY] || {};
      
      item.metadata[TRACKER_KEY] = {
        ...existingTrackerData,
        count: total.toString(), 
        visible: true            
      };
    }
  });
}