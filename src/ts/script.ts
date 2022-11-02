import { omikuji } from "./modules/omikuji/omikuji";

// イベント実行
document.addEventListener("DOMContentLoaded", () => {
    let btn: HTMLButtonElement = document.querySelector('.inner__text-btn') as HTMLButtonElement;
    btn!.addEventListener('click', omikuji, false);
}, false);