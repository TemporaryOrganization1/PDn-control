import type { Data } from "../data.js";

async function waitForScreenshotReady(sr: Data): Promise<void> {
    await sr.page.waitForFunction(() => document.readyState === 'complete', { timeout: 5000 }).catch(() => undefined);
    await sr.page.waitForNetworkIdle({ idleTime: 1200, timeout: 6000 }).catch(() => undefined);
    await sr.page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))).catch(() => undefined);
    await new Promise((resolve) => setTimeout(resolve, 2500));
    await sr.page.evaluate(() => window.scrollTo(0, 0)).catch(() => undefined);
}

export async function checkScreenshot (sr: Data) {
    try {
        if (await sr.open ("/")) {
            await waitForScreenshotReady(sr);
            const img = await sr.page.screenshot ({encoding: 'binary', 'type': 'png'});
            if (img) {
                const res = await sr.uploadImage (img);
                if (res) {
                    sr.result.screenshotId = res.image_id;
                    console.log (res.image_id);
                }
            }
        }
    }
    catch (e) {
        if (e instanceof Error) {
            console.error ('checkScreenshot failed', e.message);
        }
    }
}
