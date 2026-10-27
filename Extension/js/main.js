'use strict';


try {
    window.csInterface = new CSInterface();
    window.tips = new window.TipsModule();
    window.stopwatch = new window.StopwatchModule();
} catch (e) {
    console.error("HAOMI Studio: Initialization error:", e);
}

document.addEventListener("DOMContentLoaded", () => {
    try {
        window.tools = new window.ToolsModule();
        window.colorPicker = new window.ColorPickerModule();
        window.settings = new window.SettingsModule();
        window.cardNav = new window.CardNavModule();
        window.bubbleText = new window.BubbleTextModule();
        window.colorPalette = new window.ColorPaletteModule();
        window.dashboard = new window.DashboardModule();
        window.modal = new window.ModalModule();
    } catch (e) {
        console.error("HAOMI Studio: Module initialization error:", e);
    }
});
