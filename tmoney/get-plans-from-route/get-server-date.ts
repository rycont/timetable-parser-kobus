import {} from "@debutter/dom";
import { cachedFetch } from "../../common/cached-fetch.ts";

const URI = "https://intercitybus.tmoney.co.kr/runinf/runInf.do"

async function getServerDate() {
    const text = await cachedFetch("tmoney-run-information.json", URI)
}