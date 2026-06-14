import type { Data } from "../data.js";

export async function checkForms (sr: Data) {
    await sr.initLinks();
    console.log(`hi: ${sr.baseUrl}`);
}