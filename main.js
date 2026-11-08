import OBR from "@owlbear-rodeo/sdk";

OBR.onReady(() => {
  OBR.contextMenu.create({
    id: "com.my-extension.initiative-roller",
    icons: [
      {
        icon: "/dice.svg",
        label: "Roll Initiative",
        filter: {
          // This ensures the button only appears on Character tokens, not map props or drawings
          every: [{ key: "layer", value: "CHARACTER" }]
        }
      }
    ],
    onClick: (context) => {
      // Get the first token that was selected
      const item = context.items[0];

      // Prompt the user for the number (modifier) to add
      const modifierInput = prompt(`Enter initiative modifier for ${item.name}:`, "0");

      // If the user clicks "Cancel" on the prompt, stop the function
      if (modifierInput === null) return;

      // Convert the input to an integer (defaulting to 0 if they typed letters)
      const modifier = parseInt(modifierInput) || 0;

      // Generate random int between 1 and 20
      const d20 = Math.floor(Math.random() * 20) + 1;
      const total = d20 + modifier;

      // Display the result as a pop-up notification in the VTT
      OBR.notification.show(`${item.name} rolled Initiative: [ ${d20} ] + ${modifier} = ${total}`);
    }
  });
});