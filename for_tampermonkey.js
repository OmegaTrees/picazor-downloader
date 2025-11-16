// ==UserScript==
// @name         Download Full-Size Images (500px remover + Count + Delay)
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  Finds images with 500px_ prefix, reports counts, downloads with delay
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function () {

    const btn = document.createElement("button");
    btn.textContent = "Download Full Images";
    btn.style.position = "fixed";
    btn.style.top = "20px";
    btn.style.right = "20px";
    btn.style.zIndex = 99999;
    btn.style.padding = "10px 15px";
    btn.style.background = "#28a745";
    btn.style.color = "#fff";
    btn.style.border = "none";
    btn.style.borderRadius = "6px";
    btn.style.cursor = "pointer";
    btn.style.fontSize = "14px";
    btn.style.boxShadow = "0 0 10px rgba(0,0,0,0.4)";

    document.body.appendChild(btn);

    btn.addEventListener("click", async () => {

        const imgs = document.querySelectorAll("img");
        const totalFound = imgs.length;

        // Collect only the URLs that need downloading
        const downloadList = [];

        imgs.forEach(img => {
            let src = img.src;
            if (!src) return;

            if (src.startsWith("/")) {
                src = location.origin + src;
            }

            const newSrc = src.replace(/\/500px_/, "/");
            if (newSrc !== src) {
                downloadList.push(newSrc);
            }
        });

        alert(
            "Images Found: " + totalFound +
            "\nImages With 500px_: " + downloadList.length +
            "\nStarting downloads with delay..."
        );

        // Delay between downloads (ms)
        const delay = 300;

        for (let i = 0; i < downloadList.length; i++) {
            downloadImage(downloadList[i]);
            await sleep(delay);
        }

        alert("Finished downloading all full-size images!");

    });

    function downloadImage(url) {
        const a = document.createElement("a");
        a.href = url;
        a.download = url.split("/").pop();
        document.body.appendChild(a);
        a.click();
        a.remove();
    }

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

})();
