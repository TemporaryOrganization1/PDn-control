import type { Data } from "../data.js";

export async function checkScreenshot (sr: Data) {
    try {
        if (await sr.open ("/")) {
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