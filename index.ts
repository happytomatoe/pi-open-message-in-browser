import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { loadSettings, saveSettings } from "./settings";
import { getAssets } from "./assets";
import { convertMarkdownToHtml } from "./converter";
import { generateHtmlDocument } from "./template";
import { writeAndOpenHtml } from "./browser";

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
				const { css, js } = await getAssets();
				const htmlBody = convertMarkdownToHtml(text);
				const fullHtml = generateHtmlDocument(htmlBody, css, js);
				
				const { filePath, opened } = await writeAndOpenHtml(fullHtml);
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

			saveSettings({
				browser: newBrowser || settings.browser,
				exportDir: newExportDir || settings.exportDir
			});

			ctx.ui.notify("Settings saved!", "success");
		},
	});
}
