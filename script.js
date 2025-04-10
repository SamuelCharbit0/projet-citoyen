document.addEventListener("DOMContentLoaded", function () {
    const openMagazineBtn = document.getElementById("open-magazine");
    const closeMagazineBtn = document.getElementById("close-magazine");
    const magazineViewer = document.getElementById("magazine-viewer");
    const magazinePages = document.getElementById("magazine-pages");
    const prevPageBtn = document.getElementById("prev-page");
    const nextPageBtn = document.getElementById("next-page");

    let pdfDoc = null;
    let currentPage = 1;
    let scale = 0.75; // Ajustement du zoom pour voir les pages en entier
    let canvasList = [];

    function renderPage(pageNum) {
        pdfDoc.getPage(pageNum).then(function (page) {
            const viewport = page.getViewport({ scale });

            // Nettoyer les anciennes pages
            magazinePages.innerHTML = "";

            // Créer le canvas principal
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            magazinePages.appendChild(canvas);

            // Affichage en double-page (sauf première et dernière)
            if (pageNum === 1 || pageNum === pdfDoc.numPages) {
                // Page seule (première ou dernière)
                canvas.style.margin = "auto";
            } else if (pageNum % 2 === 0 && pageNum < pdfDoc.numPages) {
                // Double-page
                const nextCanvas = document.createElement("canvas");
                const nextCtx = nextCanvas.getContext("2d");

                magazinePages.style.display = "flex";
                magazinePages.style.justifyContent = "center";
                magazinePages.style.gap = "20px"; // Espacement entre pages

                nextCanvas.height = viewport.height;
                nextCanvas.width = viewport.width;
                magazinePages.appendChild(nextCanvas);

                // Dessiner la première page de la double-page
                const renderTask1 = page.render({
                    canvasContext: ctx,
                    viewport: viewport,
                });

                // Dessiner la deuxième page de la double-page
                pdfDoc.getPage(pageNum + 1).then((nextPage) => {
                    const viewportNext = nextPage.getViewport({ scale });
                    const renderTask2 = nextPage.render({
                        canvasContext: nextCtx,
                        viewport: viewportNext,
                    });

                    renderTask2.promise.then(() => {
                        currentPage = pageNum; // Met à jour la page actuelle
                    });
                });

                return;
            }

            // Si page seule, rendre normalement
            const renderTask = page.render({
                canvasContext: ctx,
                viewport: viewport,
            });

            renderTask.promise.then(() => {
                currentPage = pageNum;
            });
        });
    }

    function checkArrowsVisibility() {
        prevPageBtn.style.display = currentPage > 1 ? "flex" : "none";
        nextPageBtn.style.display = currentPage < pdfDoc.numPages ? "flex" : "none";
    }

    prevPageBtn.addEventListener("click", function () {
        if (currentPage > 1) {
            currentPage -= currentPage === 2 ? 1 : 2; // Gère le passage à une page seule
            renderPage(currentPage);
            checkArrowsVisibility();
        }
    });

    nextPageBtn.addEventListener("click", function () {
        if (currentPage < pdfDoc.numPages) {
            currentPage += currentPage === 1 ? 1 : 2; // Passe à la double page
            renderPage(currentPage);
            checkArrowsVisibility();
        }
    });

    openMagazineBtn.addEventListener("click", function () {
        magazineViewer.classList.remove("hidden");

        if (!pdfDoc) {
            pdfjsLib.getDocument("magazine.pdf").promise.then(function (pdf) {
                pdfDoc = pdf;
                renderPage(currentPage);
                checkArrowsVisibility();
            });
        }
    });

    closeMagazineBtn.addEventListener("click", function () {
        magazineViewer.classList.add("hidden");
    });
});