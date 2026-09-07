/*
 * TrustETL - Main JavaScript
 * Simple frontend interactions for the student prototype.
 */

document.addEventListener("DOMContentLoaded", function () {
    setupUploadPage();
    setupDragAndDrop();
    setupSmoothScrolling();
});

/*
 * Handles file selection on upload.html.
 */
function setupUploadPage() {
    const fileInput = document.getElementById("fileInput");
    const fileDetails = document.getElementById("fileDetails");
    const fileName = document.getElementById("fileName");
    const fileSize = document.getElementById("fileSize");
    const continueButton = document.getElementById("continueButton");
    const removeFileButton = document.getElementById("removeFile");

    if (!fileInput) {
        return;
    }

    fileInput.addEventListener("change", function () {
        if (fileInput.files.length === 0) {
            return;
        }

        const selectedFile = fileInput.files[0];

        if (!isValidFile(selectedFile)) {
            alert("Please select a CSV, XLSX, XLS, or JSON file smaller than 50 MB.");
            fileInput.value = "";
            return;
        }

        showSelectedFile(selectedFile);
    });

    if (removeFileButton) {
        removeFileButton.addEventListener("click", function () {
            fileInput.value = "";
            fileDetails.classList.add("hidden");
            continueButton.classList.add("disabled");
        });
    }

    function showSelectedFile(file) {
        fileName.textContent = file.name;
        fileSize.textContent = formatFileSize(file.size);

        fileDetails.classList.remove("hidden");
        continueButton.classList.remove("disabled");

        // Save the filename so another page can use it in this prototype.
        localStorage.setItem("trustetl_dataset", file.name);
    }
}

/*
 * Checks the uploaded file type and size.
 */
function isValidFile(file) {
    const allowedExtensions = [".csv", ".xlsx", ".xls", ".json"];
    const fileName = file.name.toLowerCase();

    const hasValidExtension = allowedExtensions.some(function (extension) {
        return fileName.endsWith(extension);
    });

    const maximumSize = 50 * 1024 * 1024;

    return hasValidExtension && file.size <= maximumSize;
}

/*
 * Converts bytes into a readable file size.
 */
function formatFileSize(bytes) {
    if (bytes < 1024) {
        return bytes + " B";
    }

    if (bytes < 1024 * 1024) {
        return (bytes / 1024).toFixed(1) + " KB";
    }

    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

/*
 * Adds drag-and-drop support to the upload area.
 */
function setupDragAndDrop() {
    const dropZone = document.getElementById("dropZone");
    const fileInput = document.getElementById("fileInput");

    if (!dropZone || !fileInput) {
        return;
    }

    ["dragenter", "dragover"].forEach(function (eventName) {
        dropZone.addEventListener(eventName, function (event) {
            event.preventDefault();
            dropZone.classList.add("dragging");
        });
    });

    ["dragleave", "drop"].forEach(function (eventName) {
        dropZone.addEventListener(eventName, function (event) {
            event.preventDefault();
            dropZone.classList.remove("dragging");
        });
    });

    dropZone.addEventListener("drop", function (event) {
        const droppedFiles = event.dataTransfer.files;

        if (droppedFiles.length === 0) {
            return;
        }

        fileInput.files = droppedFiles;

        // Trigger the same validation used by normal file selection.
        fileInput.dispatchEvent(new Event("change"));
    });
}

/*
 * Enables smooth scrolling for links that point to sections on the same page.
 */
function setupSmoothScrolling() {
    const anchorLinks = document.querySelectorAll('a[href^="#"]');

    anchorLinks.forEach(function (link) {
        link.addEventListener("click", function (event) {
            const targetId = link.getAttribute("href");

            if (targetId === "#") {
                return;
            }

            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                event.preventDefault();

                targetElement.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }
        });
    });
}
