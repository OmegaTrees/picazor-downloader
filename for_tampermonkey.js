// ==UserScript==
// @name         Download Full-Size Images (Remove 500px_ prefix)
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Finds images with 500px_ prefix and downloads full-size versions
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function () {

    // Create a button
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

    document.body.appendChild(btn);

    // When clicked
    btn.addEventListener("click", () => {

        const imgs = document.querySelectorAll("img");

        imgs.forEach(img => {

            let src = img.src;

            if (!src) return;

            // If relative URL, convert to absolute
            if (src.startsWith("/")) {
                src = location.origin + src;
            }

            // Only modify images that start with '500px_'
            const newSrc = src.replace(/\/500px_/, "/");

            // If filename changed, download new version
            if (newSrc !== src) {
                downloadImage(newSrc);
            }

        });

        alert("Download started for all full-size images!");

    });

    // Helper: download file
    function downloadImage(url) {
        const a = document.createElement("a");
        a.href = url;

        // Extract filename
        a.download = url.split("/").pop();
        document.body.appendChild(a);
        a.click();
        a.remove();
    }

})();
