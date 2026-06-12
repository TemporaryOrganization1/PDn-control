import type { Browser } from "puppeteer";
import { checkForms } from "./checks/forms.js";
import type { Data } from "./data.js";
import { prepareSslConnection } from "./checks/ssl.js";
import { prepareHttpsConnection } from "./checks/https.js";
import { prepareCountryChecks } from "./checks/country.js";
import { prepareCookieChecks } from "./checks/cookies.js";
import { checkAi } from "./checks/ai.js";

const checks = [
    checkAi
];

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

export async function check (sr: Data) {
    for (const fn of checks) {
        await fn (sr);
    }
}