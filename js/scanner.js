const scannerDiv = document.querySelector(".scanner");

const camera = scannerDiv.querySelector("h1 .fa-camera");
const stopCam = scannerDiv.querySelector("h1 .fa-circle-stop");

const form = scannerDiv.querySelector(".scanner-form");
const img = form.querySelector("img");
const video = form.querySelector("video");
const content = form.querySelector(".content");
const fileInput = form.querySelector(".content input");
const contentText = form.querySelector(".content header");
const uploadBtn = form.querySelector(".content button");

const textarea = scannerDiv.querySelector(".scanner-details textarea");
const copyBtn = scannerDiv.querySelector(".scanner-details .copy");
const closeBtn = scannerDiv.querySelector(".scanner-details .close");



// Input File activated on buton click
uploadBtn.addEventListener("click", (event) => {
    event.preventDefault();
    fileInput.click();
});

form.addEventListener("dragover", (event) => {
    event.preventDefault();
    form.style = "border: 2px solid #777";
    contentText.textContent = "Release to Upload File";
});

form.addEventListener("dragleave", (event) => {
    form.style = "border: 2px dashed #777";
    contentText.textContent = "Drag & Drop to Upload File";
});

form.addEventListener("drop", (event) => {
    form.style = "border: 2px dashed #777";
    event.preventDefault();
    let file = event.dataTransfer.files[0];
    if (!file) return;
    fetchRequest(file);
});

// Scan QR Code Image
fileInput.addEventListener("change", (event) => {
    let file = event.target.files[0];
    if (!file) return;
    fetchRequest(file);
    event.target.value = '';
})

function fetchRequest(file) {
    let formData = new FormData();
    formData.append("file", file);

    contentText.innerText = "Scanning QR Code...";

    //Delay Function call by 0.5 sec to display above text
    setTimeout(() => {
        fetch(`https://api.qrserver.com/v1/read-qr-code/`, {
            method: "POST", body: formData
        }).then(res => res.json()).then(result => {
            let text = result[0].symbol[0].data;

            if (!text)
                return contentText.innerText = "Couldn't Scan QR Code";

            scannerDiv.classList.add("active");
            form.classList.add("active-img");

            img.src = URL.createObjectURL(file);
            textarea.innerText = text;
        })
    }
        , 500);
}

// Scan QR Code Camera
let scanner;

camera.addEventListener("click", () => {
    camera.style.display = "none";
    form.classList.add("pointerEvents");
    contentText.innerText = "Scanning QR Code...";

    scanner = new Instascan.Scanner({ video: video });

    Instascan.Camera.getCameras()
        .then(cameras => {
            if (cameras.length > 0) {
                scanner.start(cameras[0]).then(() => {
                    form.classList.add("active-video");
                    stopCam.style.display = "inline-block";
                })
            } else {
                console.log("No Cameras Found");
            }
        })
        .catch(err => console.error(err))

    // addListener not addEventListener
    scanner.addListener("scan", c => {
        scannerDiv.classList.add("active");
        textarea.innerText = c;
    })
})


// Copy
copyBtn.addEventListener("click", () => {
    let text = textarea.textContent;
    navigator.clipboard.writeText(text);
})

// Close
closeBtn.addEventListener("click", () => stopScan());
stopCam.addEventListener("click", () => stopScan());

// Stop Scan
function stopScan() {
    contentText.innerText = "Drag & Drop to Upload File";

    camera.style.display = "inline-block";
    stopCam.style.display = "none";

    form.classList.remove("active-video", "active-img", "pointerEvents");
    scannerDiv.classList.remove("active");

    if (scanner) scanner.stop();
}