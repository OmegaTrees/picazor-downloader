// ==UserScript==
// @name         Zip Full-Size Images (Dynamic JSZip Loader)
// @namespace    http://tampermonkey.net/
// @version      2.2
// @description  Loads JSZip manually so CSP cannot block it
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function () {
    // Load JSZip dynamically
    function loadJSZip() {
        return new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.src = "https://unpkg.com/jszip@3.10.1/dist/jszip.min.js";
            script.onload = () => resolve(window.JSZip);
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    async function init() {
        const JSZip = await loadJSZip().catch(() => null);

        if (!JSZip) {
            alert("JSZip still failed to load. Try again or switch networks.");
            return;
        }

        // --- create button ---
        const btn = document.createElement("button");
        btn.textContent = "ZIP Full Images";
        btn.style.position = "fixed";
        btn.style.top = "20px";
        btn.style.right = "20px";
        btn.style.zIndex = 999999;
        btn.style.padding = "10px 15px";
        btn.style.background = "#007bff";
        btn.style.color = "#fff";
        btn.style.border = "none";
        btn.style.borderRadius = "6px";
        btn.style.cursor = "pointer";
        btn.style.fontSize = "14px";
        btn.style.boxShadow = "0 0 10px rgba(0,0,0,0.4)";
        document.body.appendChild(btn);

        btn.addEventListener("click", async () => {

            const imgs = document.querySelectorAll("img");
            const downloadList = [];

            imgs.forEach(img => {
                let src = img.src;

                if (!src) return;

                if (src.startsWith("/"))
                    src = location.origin + src;

                const full = src.replace(/\/500px_/, "/");

                if (full !== src)
                    downloadList.push(full);
            });

            alert("Full-size images: " + downloadList.length + "\nBuilding ZIP…");

            const zip = new JSZip();

            for (let url of downloadList) {
                try {
                    const blob = await fetch(url).then(r => r.blob());
                    zip.file(url.split("/").pop(), blob);
                } catch (e) {
                    console.warn("Failed:", url);
                }
            }

            const zipBlob = await zip.generateAsync({ type: "blob" });

            const a = document.createElement("a");
            a.href = URL.createObjectURL(zipBlob);
            a.download = "images.zip";
            a.click();

            alert("ZIP ready!");
        });
    }

    init();
})();
