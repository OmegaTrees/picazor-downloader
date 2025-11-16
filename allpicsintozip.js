// ==UserScript==
// @name         Zip Full-Size Images + Auto Bottom Scroll + Progress
// @namespace    http://tampermonkey.net/
// @version      2.5
// @description  ZIP full-size images with progress + fast bottom scroll
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

    // SCROLL LOOP
    let bottomScrollActive = false;
    let bottomScrollInterval = null;

    function startBottomScroll() {
        if (bottomScrollActive) return;
        bottomScrollActive = true;
        bottomScrollInterval = setInterval(() => {
            window.scrollTo(0, document.body.scrollHeight);
        }, 50);
    }

    function stopBottomScroll() {
        bottomScrollActive = false;
        clearInterval(bottomScrollInterval);
    }

    async function init() {
        const JSZip = await loadJSZip().catch(() => null);
        if (!JSZip) {
            alert("JSZip failed to load!");
            return;
        }

        // --- ZIP button ---
        const zipBtn = document.createElement("button");
        zipBtn.textContent = "ZIP Full Images";
        zipBtn.style.position = "fixed";
        zipBtn.style.top = "20px";
        zipBtn.style.right = "20px";
        zipBtn.style.zIndex = 999999;
        zipBtn.style.padding = "10px 15px";
        zipBtn.style.background = "#007bff";
        zipBtn.style.color = "#fff";
        zipBtn.style.border = "none";
        zipBtn.style.borderRadius = "6px";
        zipBtn.style.cursor = "pointer";
        zipBtn.style.fontSize = "14px";
        document.body.appendChild(zipBtn);

        // --- Bottom Scroll button ---
        const scrollBtn = document.createElement("button");
        scrollBtn.textContent = "Scroll Bottom";
        scrollBtn.style.position = "fixed";
        scrollBtn.style.top = "60px";
        scrollBtn.style.right = "20px";
        scrollBtn.style.zIndex = 999999;
        scrollBtn.style.padding = "10px 15px";
        scrollBtn.style.background = "#28a745";
        scrollBtn.style.color = "#fff";
        scrollBtn.style.border = "none";
        scrollBtn.style.borderRadius = "6px";
        scrollBtn.style.cursor = "pointer";
        scrollBtn.style.fontSize = "14px";
        document.body.appendChild(scrollBtn);

        // --- Progress Bar ---
        const progressWrapper = document.createElement("div");
        progressWrapper.style.position = "fixed";
        progressWrapper.style.top = "100px";
        progressWrapper.style.right = "20px";
        progressWrapper.style.width = "250px";
        progressWrapper.style.height = "20px";
        progressWrapper.style.backgroundColor = "#ddd";
        progressWrapper.style.borderRadius = "10px";
        progressWrapper.style.overflow = "hidden";
        progressWrapper.style.display = "none";
        progressWrapper.style.zIndex = 999999;

        const progressBar = document.createElement("div");
        progressBar.style.height = "100%";
        progressBar.style.width = "0%";
        progressBar.style.backgroundColor = "#007bff";
        progressWrapper.appendChild(progressBar);
        document.body.appendChild(progressWrapper);

        // --- Scroll toggle ---
        scrollBtn.addEventListener("click", () => {
            if (!bottomScrollActive) {
                startBottomScroll();
                scrollBtn.textContent = "Stop Scroll";
                scrollBtn.style.background = "#dc3545";
            } else {
                stopBottomScroll();
                scrollBtn.textContent = "Scroll Bottom";
                scrollBtn.style.background = "#28a745";
            }
        });

        // --- ZIP functionality ---
        zipBtn.addEventListener("click", async () => {
            stopBottomScroll(); // stop if scrolling

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

            if (downloadList.length === 0) {
                alert("No full-size images found!");
                return;
            }

            progressWrapper.style.display = "block";
            progressBar.style.width = "0%";

            const zip = new JSZip();
            let count = 0;

            for (let url of downloadList) {
                try {
                    const blob = await fetch(url).then(r => r.blob());
                    zip.file(url.split("/").pop(), blob);
                } catch (e) {
                    console.warn("Failed:", url);
                }
                count++;
                progressBar.style.width = ((count / downloadList.length) * 100).toFixed(2) + "%";
            }

            const zipBlob = await zip.generateAsync({ type: "blob" });
            const a = document.createElement("a");
            a.href = URL.createObjectURL(zipBlob);
            a.download = "images.zip";
            a.click();

            progressWrapper.style.display = "none";
            alert("ZIP ready!");
        });
    }

    init();
})();
