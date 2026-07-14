import type { Browser } from "puppeteer";
import { checkForms } from "./checks/forms.js";
import type { Data } from "./data.js";
import { checkSslConnection, prepareSslConnection } from "./checks/ssl.js";
import { prepareHttpsConnection } from "./checks/https.js";
import { checkCountry, prepareCountryChecks } from "./checks/country.js";
import { prepareCookieChecks } from "./checks/cookies.js";
import { checkAi } from "./checks/ai.js";
import { checkScreenshot } from "./checks/screenshot.js";
import type { ScanOptions } from "./runner.js";

const prepares = [
    prepareHttpsConnection,
    prepareSslConnection,
    prepareCountryChecks,
    prepareCookieChecks
];

export async function prepare (sr: Data) {
    for (const fn of prepares) {
        await fn (sr);
    }
}

export async function check (sr: Data, _type: string, options: ScanOptions) {
    if (options.captureImages) {
        await checkScreenshot(sr);
    }
    await checkSslConnection(sr);
    await checkCountry(sr);
    // The legacy fast/detail field cannot change the category matrix or entitlements.
    await sr.onProgress (40, "check_ai", [], [], undefined);
    await checkAi(sr, options.aiIterations, options.detailLevel);
}
