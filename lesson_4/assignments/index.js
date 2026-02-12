import * as Carousel from "./carousel.js";
import axios from "axios";

// The breed selection input element.
const breedSelect = document.getElementById("breedSelect");
// The information section div element.
const infoDump = document.getElementById("infoDump");
// The progress bar div element.
const progressBar = document.getElementById("progressBar");
// The get favourites button element.
const getFavouritesBtn = document.getElementById("getFavouritesBtn");

const API_KEY = "live_SNCML8Xxb7IsKryioXxRzZyDit11gwnp843J41JGkF9rklhVQtwfcHv5HuKMxFxi";
const breedurl = "https://api.thecatapi.com/v1/breeds";
let breedList = [];
let favourites = new Set();

// Axios

axios.defaults.baseURL = "https://api.thecatapi.com/v1";
axios.defaults.headers.common["x-api-key"] = API_KEY;

axios.interceptors.request.use(config => {
    console.log("Request started:", config.url);
    config.metadata = { startTime: new Date() };
    progressBar.style.width = "0%";
    document.body.style.cursor = "progress";
    return config;
},
    error => {
        return Promise.reject(error);
    }
);

axios.interceptors.response.use(response => {
    const endTime = new Date();
    const duration = endTime - response.config.metadata.startTime;
    console.log(`Request to ${response.config.url} completed in ${duration} ms`);
    document.body.style.cursor = "default";
    return response;
},
    error => {
        document.body.style.cursor = "default";
        console.error("Request failed:", error);
        return Promise.reject(error);
    }
);

// Functions

function updateProgressBar(progress) {
    if (progress.lengthComputable) {
        const percentComplete = (progress.loaded / progress.total) * 100;
        progressBar.style.width = `${percentComplete}%`;
    } else {
        progressBar.style.width = "100%";
    }
}

// Initial app loading functions

async function initialLoad() {
    try {
        const response = await axios.get("/breeds");
        breedList = response.data;
        breedList.forEach(breed => {
            const option = document.createElement("option");
            option.value = breed.id;
            option.textContent = breed.name;
            breedSelect.appendChild(option);
        });
        breedSelect.addEventListener("change", breedCarousel);
        await breedCarousel();
    } catch (error) {
        console.error("Error loading breeds:", error);
        infoDump.innerHTML = "<p class='text-danger'>Failed to load cat breeds. Please try again later.</p>";
    }
}

async function breedCarousel() {
    const selectedBreed = breedSelect.value;
    if (!selectedBreed) return;

    try {
        const response = await axios.get("/images/search", {
            params: {
                breed_id: selectedBreed,
                limit: 10
            },
            onDownloadProgress: updateProgressBar
        });
        const images = response.data;
        Carousel.clear();

        if (images.length === 0) {
            infoDump.innerHTML = "<p>No images found for this breed.</p>";
            return;
        }
        images.forEach(image => {
            const carouselItem = Carousel.createCarouselItem(
                image.url,
                selectedBreed,
                image.id
            );
            Carousel.appendCarousel(carouselItem);
        });
        Carousel.start();
        const breedInfo = breedList.find(breed => breed.id === selectedBreed);

        if (breedInfo) {
            infoDump.innerHTML = `
                <h2>${breedInfo.name}</h2>
                <p><strong>Origin:</strong> ${breedInfo.origin}</p>
                <p><strong>Temperament:</strong> ${breedInfo.temperament}</p>
                <p><strong>Life Span:</strong> ${breedInfo.life_span}</p>
                <p><strong>Description:</strong> ${breedInfo.description}</p>
            `;
        }
    } catch (error) {
        console.error("Error loading breed carousel:", error);
        infoDump.innerHTML = "<p class='text-danger'>Failed to load images for this breed. Please try again later.</p>";
    }
}

export async function favourite(imgId) {
    try {

        if (favouritedImages.has(imgId)) {

            const response = await axios.get("/favourites");
            const favourites = response.data;
            const fav = favourites.find(f => f.image_id === imgId);

            if (fav) {

                await axios.delete(`/favourites/${fav.id}`);
                favouritedImages.delete(imgId);
                console.log(`Removed favourite: ${imgId}`);

                const favButton = document.querySelector(`[data-img-id="${imgId}"]`);

                if (favButton) {
                    favButton.style.color = "lightpink";
                }
            }
        } else {
            const response = await axios.post("/favourites", {
                image_id: imgId
            });

            favouritedImages.add(imgId);
            console.log(`Added favourite: ${imgId}`);

            const favButton = document.querySelector(`[data-img-id="${imgId}"]`);
            if (favButton) {
                favButton.style.color = "red";
            }
        }
    } catch (error) {
        console.error("Error managing favourite:", error);
        alert("Error updating favourite. Please try again.");
    }
}

async function getFavourites() {
    try {
        const response = await axios.get("/favourites", {
            onDownloadProgress: updateProgressBar
        });

        const favourites = response.data;

        Carousel.clear();

        infoDump.innerHTML = `<h2 class="text-center">Your Favourite Cats</h2>`;

        if (favourites.length === 0) {
            infoDump.innerHTML += "<p class='text-center'>You haven't favourited any cats yet!</p>";
            return;
        }

        favouritedImages.clear();
        favourites.forEach(fav => favouritedImages.add(fav.image_id));

        favourites.forEach(fav => {
            const carouselItem = Carousel.createCarouselItem(
                fav.image.url,
                "Favourite Cat",
                fav.image_id
            );
            Carousel.appendCarousel(carouselItem);

            setTimeout(() => {
                const favButton = document.querySelector(`[data-img-id="${fav.image_id}"]`);
                if (favButton) {
                    favButton.style.color = "red";
                }
            }, 100);
        });

        Carousel.start();

    } catch (error) {
        console.error("Error loading favourites:", error);
        infoDump.innerHTML = "<p class='text-danger'>Error loading favourites. Please try again.</p>";
    }
}

getFavouritesBtn.addEventListener("click", getFavourites);

initialLoad();