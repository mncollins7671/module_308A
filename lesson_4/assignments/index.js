document.addEventListener("DOMContentLoaded", () => {
    // The breed selection input element.
    const breedSelect = document.getElementById("breedSelect");
    // The information section div element.
    const infoDump = document.getElementById("infoDump");
    // The progress bar div element.
    const progressBar = document.getElementById("progressBar");
    // The get favourites button element.
    const getFavouritesBtn = document.getElementById("getFavouritesBtn");

    const API_KEY = "live_SNCML8Xxb7IsKryioXxRzZyDit11gwnp843J41JGkF9rklhVQtwfcHv5HuKMxFxi";
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

    // Functions

    function updateProgressBar(progress) {
        if (progress.lengthComputable) {
            const percentComplete = (progress.loaded / progress.total) * 100;
            progressBar.style.width = `${percentComplete}%`;
        } else {
            progressBar.style.width = "100%";
        }
    }

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

        if (!selectedBreed) {
            console.log("No breed selected");
            return;
        }

        console.log("Loading breed:", selectedBreed);

        try {
            const response = await axios.get("/images/search", {
                params: {
                    breed_id: selectedBreed,
                    limit: 10
                },
                onDownloadProgress: updateProgressBar
            });

            const images = response.data;

            console.log("Images loaded:", images.length);

            clearCarousel();

            if (images.length === 0) {
                infoDump.innerHTML = "<p>No images available for this breed.</p>";
                return;
            }

            images.forEach(image => {
                const carouselItem = createCarouselItem(
                    image.url,
                    selectedBreed,
                    image.id
                );
                appendCarousel(carouselItem);
            });

            startCarousel();

            const breedInfo = breedList.find(breed => breed.id === selectedBreed);

            if (breedInfo) {
                infoDump.innerHTML = `
          <div class="card p-4">
            <h2 class="mb-3">${breedInfo.name}</h2>
            <div class="row">
              <div class="col-md-6">
                <p><strong>Origin:</strong> ${breedInfo.origin || 'Unknown'}</p>
                <p><strong>Temperament:</strong> ${breedInfo.temperament || 'Unknown'}</p>
                <p><strong>Life Span:</strong> ${breedInfo.life_span || 'Unknown'} years</p>
              </div>
              <div class="col-md-6">
                <p><strong>Weight:</strong> ${breedInfo.weight?.metric || 'Unknown'} kg</p>
                <p><strong>Affection Level:</strong> ${breedInfo.affection_level ? '⭐'.repeat(breedInfo.affection_level) : 'Unknown'}</p>
                <p><strong>Child Friendly:</strong> ${breedInfo.child_friendly ? '⭐'.repeat(breedInfo.child_friendly) : 'Unknown'}</p>
              </div>
            </div>
            <p class="mt-3">${breedInfo.description || 'No description available'}</p>
            ${breedInfo.wikipedia_url ? `<a href="${breedInfo.wikipedia_url}" target="_blank" class="btn btn-primary mt-2">Learn More on Wikipedia</a>` : ''}
          </div>
        `;
            }
        } catch (error) {
            console.error("Error loading breed carousel:", error);
            infoDump.innerHTML = "<p class='text-danger'>Error loading images for this breed.</p>";
        }
    }

    function createCarouselItem(imgSrc, imgAlt, imgId) {
        const template = document.querySelector("#carouselItemTemplate");
        const clone = template.content.firstElementChild.cloneNode(true);

        const img = clone.querySelector("img");
        img.src = imgSrc;
        img.alt = imgAlt;

        const favBtn = clone.querySelector(".favourite-button");
        favBtn.setAttribute("data-img-id", imgId);
        favBtn.addEventListener("click", () => {
            favourite(imgId);
        });

        return clone;
    }

    function clearCarousel() {
        const carousel = document.querySelector("#carouselInner");
        while (carousel.firstChild) {
            carousel.removeChild(carousel.firstChild);
        }
    }

    function appendCarousel(element) {
        const carousel = document.querySelector("#carouselInner");
        const activeItem = document.querySelector(".carousel-item.active");
        if (!activeItem) element.classList.add("active");
        carousel.appendChild(element);
    }

    function startCarousel() {
        const multipleCardCarousel = document.querySelector("#carouselExampleControls");

        if (window.matchMedia("(min-width: 768px)").matches) {
            const carouselWidth = $(".carousel-inner")[0].scrollWidth;
            const cardWidth = $(".carousel-item").width();
            let scrollPosition = 0;

            $("#carouselExampleControls .carousel-control-next").unbind();
            $("#carouselExampleControls .carousel-control-next").on("click", function () {
                if (scrollPosition < carouselWidth - cardWidth * 4) {
                    scrollPosition += cardWidth;
                    $("#carouselExampleControls .carousel-inner").animate(
                        { scrollLeft: scrollPosition },
                        600
                    );
                }
            });

            $("#carouselExampleControls .carousel-control-prev").unbind();
            $("#carouselExampleControls .carousel-control-prev").on("click", function () {
                if (scrollPosition > 0) {
                    scrollPosition -= cardWidth;
                    $("#carouselExampleControls .carousel-inner").animate(
                        { scrollLeft: scrollPosition },
                        600
                    );
                }
            });
        } else {
            $(multipleCardCarousel).addClass("slide");
        }
    }

    async function favourite(imgId) {
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

    console.log("DOM loaded, initializing app...");
    initialLoad();
});