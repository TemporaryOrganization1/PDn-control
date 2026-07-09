import type { Browser } from "puppeteer";
import { checkForms } from "./checks/forms.js";
import type { Data } from "./data.js";
import { checkSslConnection, prepareSslConnection } from "./checks/ssl.js";
import { prepareHttpsConnection } from "./checks/https.js";
import { checkCountry, prepareCountryChecks } from "./checks/country.js";
import { prepareCookieChecks } from "./checks/cookies.js";
import { checkAi } from "./checks/ai.js";
import { checkScreenshot } from "./checks/screenshot.js";

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

export async function check (sr: Data, type: string) {
    await checkScreenshot(sr);
    await checkSslConnection(sr);
    await checkCountry(sr);
    // Run AI check only for "detail" mode
    if (type === "detail") {
        await sr.onProgress (40, "check_ai", [], [], undefined);
        await checkAi(sr);
    }
}