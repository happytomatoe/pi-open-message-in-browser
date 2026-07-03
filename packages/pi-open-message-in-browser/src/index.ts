import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { loadSettings, saveSettings, type Settings } from "./settings";
import { getAssets, convertMarkdownToHtml, generateHtmlDocument, writeAndOpenHtml } from "mdopen";

export default function openLastInBrowserExtension(pi: ExtensionAPI) {
	pi.registerCommand("open-last-in-browser", {
		description: "Opens the last assistant response in a browser",
		handler: async (_args, ctx) => {
			const branch = ctx.sessionManager.getBranch();
			const lastAssistantEntry = branch.slice().reverse().find(entry => 
				entry.type === "message" && entry.message.role === "assistant"
			);
			
			if (!lastAssistantEntry || lastAssistantEntry.type !== "message") {
				ctx.ui.notify("No assistant message found", "error");
				return;
			}

			const content = lastAssistantEntry.message.content;
			if (!content || content.length === 0) {
				ctx.ui.notify("Assistant message is empty", "error");
				return;
			}

			const text = content
				.filter((c: any) => c.type === "text")
				.map((c: any) => c.text)
				.join("\n");

			if (!text) {
				ctx.ui.notify("No text content found in assistant message", "error");
				return;
			}

			try {
				ctx.ui.notify("Generating HTML...", "info");
				const settings = loadSettings();
				const { css, js } = await getAssets(settings.theme);
				const htmlBody = await convertMarkdownToHtml(text);
				const fullHtml = generateHtmlDocument(htmlBody, css, js, settings.theme);
				
				const { filePath, opened } = await writeAndOpenHtml(fullHtml, {
					browser: settings.browser,
					exportDir: settings.exportDir,
					filenamePrefix: "pi-export",
				});
				if (opened) {
					ctx.ui.notify("Opened in browser!", "success");
				} else {
					ctx.ui.notify(`Could not open browser automatically. File saved to: ${filePath}`, "warning");
				}
			} catch (error) {
				console.error(error);
				ctx.ui.notify("Failed to generate HTML", "error");
			}
		},
	});

	pi.registerCommand("open-last-in-browser:settings", {
		description: "Configure open-last-in-browser settings",
		handler: async (_args, ctx) => {
			const settings = loadSettings();
			
			const newBrowser = await ctx.ui.input("Browser Command", settings.browser);
			if (newBrowser === undefined) return; // Cancelled
			
			const newExportDir = await ctx.ui.input("Export Directory", settings.exportDir);
			if (newExportDir === undefined) return; // Cancelled

			const newTheme = await ctx.ui.select(`Theme (current: ${settings.theme})`, ["light", "dark", "auto"]);
			if (newTheme === undefined) return; // Cancelled

			saveSettings({
				browser: newBrowser || settings.browser,
				exportDir: newExportDir || settings.exportDir,
				theme: (newTheme as Settings["theme"]) || settings.theme
			});

			ctx.ui.notify("Settings saved!", "success");
		},
	});
}
