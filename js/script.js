// ==========================================
// TRUSTETL MAIN JAVASCRIPT
// ==========================================


// ==========================================
// PROFILE ELEMENTS
// ==========================================

const profileButton =
    document.getElementById("profileButton");

const profileMenu =
    document.getElementById("profileMenu");

const profileName =
    document.getElementById("profileName");

const profileEmail =
    document.getElementById("profileEmail");

const profileLarge =
    document.getElementById("profileLarge");

const profileImageInput =
    document.getElementById("profileImageInput");

const changeProfile =
    document.getElementById("changeProfile");

const accountSettings =
    document.getElementById("accountSettings");

const helpSupport =
    document.getElementById("helpSupport");

const logoutButton =
    document.getElementById("logoutButton");


// ==========================================
// USER DATA FROM LOGIN
// ==========================================

const savedName =
    localStorage.getItem("trustetl_name");

const savedEmail =
    localStorage.getItem("trustetl_email");


const userName =
    savedName || "Manav";


const userEmail =
    savedEmail || "user@trustetl.com";


// ==========================================
// PROFILE INITIAL
// ==========================================

function getInitial(name) {

    if (!name) {

        return "M";

    }

    return name
        .charAt(0)
        .toUpperCase();

}


const initial =
    getInitial(userName);


// ==========================================
// DISPLAY USER INFORMATION
// ==========================================

if (profileName) {

    profileName.textContent =
        userName;

}


if (profileEmail) {

    profileEmail.textContent =
        userEmail;

}


if (profileButton) {

    profileButton.textContent =
        initial;

}


if (profileLarge) {

    profileLarge.textContent =
        initial;

}


// ==========================================
// PROFILE IMAGE
// ==========================================

const savedProfileImage =
    localStorage.getItem(
        "trustetl_profile"
    );


function setProfileImage(image) {

    if (!profileButton ||
        !profileLarge) {

        return;

    }


    if (image) {

        profileButton.textContent = "";

        profileLarge.textContent = "";


        profileButton.style.backgroundImage =
            `url("${image}")`;

        profileButton.style.backgroundSize =
            "cover";

        profileButton.style.backgroundPosition =
            "center";


        profileLarge.style.backgroundImage =
            `url("${image}")`;

        profileLarge.style.backgroundSize =
            "cover";

        profileLarge.style.backgroundPosition =
            "center";


    } else {

        profileButton.style.backgroundImage =
            "none";

        profileLarge.style.backgroundImage =
            "none";


        profileButton.textContent =
            initial;

        profileLarge.textContent =
            initial;

    }

}


if (savedProfileImage) {

    setProfileImage(
        savedProfileImage
    );

}


// ==========================================
// OPEN PROFILE MENU
// ==========================================

if (profileButton) {

    profileButton.addEventListener(
        "click",
        function(event) {

            event.stopPropagation();

            profileMenu.classList.toggle(
                "show"
            );

        }
    );

}


// ==========================================
// CLOSE PROFILE MENU
// ==========================================

document.addEventListener(
    "click",
    function(event) {

        if (
            profileMenu &&
            !profileMenu.contains(
                event.target
            ) &&
            event.target !== profileButton
        ) {

            profileMenu.classList.remove(
                "show"
            );

        }

    }
);


// ==========================================
// CHANGE PROFILE PHOTO
// ==========================================

if (
    changeProfile &&
    profileImageInput
) {

    changeProfile.addEventListener(
        "click",
        function() {

            profileImageInput.click();

        }
    );

}


// ==========================================
// IMAGE UPLOAD
// ==========================================

if (profileImageInput) {

    profileImageInput.addEventListener(
        "change",
        function() {

            const file =
                profileImageInput.files[0];


            if (!file) {

                return;

            }


            // Check image type

            if (!file.type.startsWith("image/")) {

                alert(
                    "Please select a valid image."
                );

                return;

            }


            // Maximum 2 MB

            if (
                file.size >
                2 * 1024 * 1024
            ) {

                alert(
                    "Profile image must be smaller than 2 MB."
                );

                profileImageInput.value = "";

                return;

            }


            const reader =
                new FileReader();


            reader.onload =
                function(event) {

                    const image =
                        event.target.result;


                    localStorage.setItem(
                        "trustetl_profile",
                        image
                    );


                    setProfileImage(
                        image
                    );

                };


            reader.readAsDataURL(file);

        }
    );

}


// ==========================================
// ACCOUNT SETTINGS
// ==========================================

if (accountSettings) {

    accountSettings.addEventListener(
        "click",
        function() {

            alert(
                "Account settings will be connected to the backend later."
            );

        }
    );

}


// ==========================================
// HELP
// ==========================================

if (helpSupport) {

    helpSupport.addEventListener(
        "click",
        function() {

            alert(
                "TrustETL Help & Support will be available soon."
            );

        }
    );

}


// ==========================================
// LOGOUT
// ==========================================

if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        function() {

            const confirmLogout =
                confirm(
                    "Are you sure you want to logout?"
                );


            if (!confirmLogout) {

                return;

            }


            localStorage.removeItem(
                "trustetl_logged_in"
            );

            localStorage.removeItem(
                "trustetl_demo"
            );


            window.location.href =
                "login.html";

        }
    );

}


// ==========================================
// LOGIN PROTECTION
// ==========================================

function checkLogin() {

    const loggedIn =
        localStorage.getItem(
            "trustetl_logged_in"
        );


    const currentPage =
        (window.location.pathname
            .split("/")
            .pop() || "")
            .toLowerCase();


    if (
        currentPage !== "login.html" &&
        currentPage !== "" &&
        !loggedIn
    ) {

        window.location.href =
            "login.html";

    }

}


checkLogin();


// ==========================================
// SMOOTH SCROLL
// ==========================================

document.querySelectorAll(
    'a[href^="#"]'
).forEach(
    function(link) {

        link.addEventListener(
            "click",
            function(event) {

                const targetId =
                    link.getAttribute("href");


                if (
                    targetId === "#" ||
                    !targetId
                ) {

                    return;

                }


                const target =
                    document.querySelector(
                        targetId
                    );


                if (target) {

                    event.preventDefault();

                    target.scrollIntoView({
                        behavior: "smooth"
                    });

                }

            }
        );

    }
);


// ==========================================
// TRUSTETL - HAMBURGER MENU & COLLAPSIBLE DRAWER
// ==========================================

function initHamburgerMenu() {

    const currentPath =
        window.location.pathname.toLowerCase();

    // Do not show application navigation on the standalone login page
    if (currentPath.endsWith("login.html")) {
        return;
    }

    // Hide any permanent sidebar that might be present in page markup
    document.querySelectorAll(".dashboard-layout > .sidebar, aside.sidebar:not(.trustetl-drawer)").forEach(function(el) {
        el.style.display = "none";
    });

    // 1. Create hamburger button if not present
    let toggleBtn =
        document.getElementById("trustetlMenuToggle");

    if (!toggleBtn) {

        toggleBtn =
            document.createElement("button");

        toggleBtn.id =
            "trustetlMenuToggle";

        toggleBtn.className =
            "trustetl-menu-toggle";

        toggleBtn.setAttribute("type", "button");
        toggleBtn.setAttribute("aria-label", "Toggle navigation menu");
        toggleBtn.setAttribute("aria-expanded", "false");
        toggleBtn.setAttribute("title", "Menu");

        toggleBtn.innerHTML =
            '<span class="hamburger-bar"></span>' +
            '<span class="hamburger-bar"></span>' +
            '<span class="hamburger-bar"></span>';

        document.body.prepend(toggleBtn);

    }

    // 2. Create overlay if not present
    let overlay =
        document.getElementById("trustetlOverlay");

    if (!overlay) {

        overlay =
            document.createElement("div");

        overlay.id =
            "trustetlOverlay";

        overlay.className =
            "trustetl-overlay";

        document.body.appendChild(overlay);

    }

    // 3. Create collapsible drawer if not present
    let drawer =
        document.getElementById("trustetlDrawer");

    if (!drawer) {

        drawer =
            document.createElement("aside");

        drawer.id =
            "trustetlDrawer";

        drawer.className =
            "trustetl-drawer";

        drawer.setAttribute("aria-hidden", "true");

        drawer.innerHTML =
            '<div class="drawer-header">' +
                '<div class="drawer-brand">' +
                    '<div class="drawer-brand-logo">TE</div>' +
                    '<span class="drawer-brand-name">Trust<span>ETL</span></span>' +
                '</div>' +
                '<button class="drawer-close-btn" id="trustetlDrawerClose" type="button" aria-label="Close menu">&times;</button>' +
            '</div>' +
            '<nav class="drawer-nav">' +

                '<!-- WORKSPACE -->' +
                '<div class="drawer-section">' +
                    '<div class="drawer-section-title">WORKSPACE</div>' +
                    '<a class="drawer-link" href="index.html" data-page="index.html">' +
                        '<span class="drawer-link-icon">🏠</span>' +
                        '<span class="drawer-link-text">Home</span>' +
                    '</a>' +
                    '<a class="drawer-link" href="dashboard.html" data-page="dashboard.html">' +
                        '<span class="drawer-link-icon">📊</span>' +
                        '<span class="drawer-link-text">Dashboard</span>' +
                    '</a>' +
                    '<a class="drawer-link" href="upload.html" data-page="upload.html">' +
                        '<span class="drawer-link-icon">📤</span>' +
                        '<span class="drawer-link-text">Upload Dataset</span>' +
                    '</a>' +
                    '<a class="drawer-link" href="datasets.html" data-page="datasets.html">' +
                        '<span class="drawer-link-icon">📁</span>' +
                        '<span class="drawer-link-text">Datasets</span>' +
                    '</a>' +
                    '<a class="drawer-link" href="profiling.html" data-page="profiling.html">' +
                        '<span class="drawer-link-icon">🔍</span>' +
                        '<span class="drawer-link-text">Profiling</span>' +
                    '</a>' +
                    '<a class="drawer-link" href="pipeline.html" data-page="pipeline.html">' +
                        '<span class="drawer-link-icon">⚡</span>' +
                        '<span class="drawer-link-text">Pipeline</span>' +
                    '</a>' +
                '</div>' +

                '<!-- AGENTS -->' +
                '<div class="drawer-section">' +
                    '<div class="drawer-section-title">AGENTS</div>' +
                    '<a class="drawer-link" href="coder.html" data-page="coder.html">' +
                        '<span class="drawer-link-icon">⌘</span>' +
                        '<span class="drawer-link-text">Coder Agent</span>' +
                    '</a>' +
                    '<a class="drawer-link" href="critic.html" data-page="critic.html">' +
                        '<span class="drawer-link-icon">⚡</span>' +
                        '<span class="drawer-link-text">Critic Agent</span>' +
                    '</a>' +
                    '<a class="drawer-link" href="validator.html" data-page="validator.html">' +
                        '<span class="drawer-link-icon">✓</span>' +
                        '<span class="drawer-link-text">Validator</span>' +
                    '</a>' +
                '</div>' +

                '<!-- OUTPUT -->' +
                '<div class="drawer-section">' +
                    '<div class="drawer-section-title">OUTPUT</div>' +
                    '<a class="drawer-link" href="lineage.html" data-page="lineage.html">' +
                        '<span class="drawer-link-icon">☊</span>' +
                        '<span class="drawer-link-text">Lineage</span>' +
                    '</a>' +
                    '<a class="drawer-link" href="report.html" data-page="report.html">' +
                        '<span class="drawer-link-icon">📋</span>' +
                        '<span class="drawer-link-text">Reports</span>' +
                    '</a>' +
                    '<a class="drawer-link" href="about.html" data-page="about.html">' +
                        '<span class="drawer-link-icon">ℹ️</span>' +
                        '<span class="drawer-link-text">About</span>' +
                    '</a>' +
                '</div>' +

            '</nav>';

        document.body.appendChild(drawer);

    }

    // 4. Highlight active page
    let rawPage =
        window.location.pathname.split("/").pop().toLowerCase();

    if (!rawPage || rawPage === "") {
        rawPage = "index.html";
    }

    const drawerLinks =
        drawer.querySelectorAll(".drawer-link");

    drawerLinks.forEach(function(link) {

        const page =
            (link.getAttribute("data-page") ||
             link.getAttribute("href") || "").toLowerCase();

        if (page === rawPage) {
            link.classList.add("active");
        } else {
            link.classList.remove("active");
        }

    });

    // 5. Drawer open / close handlers
    function openMenu() {
        document.body.classList.add("drawer-open");
        drawer.classList.add("open");
        overlay.classList.add("active");
        toggleBtn.classList.add("menu-open");
        toggleBtn.setAttribute("aria-expanded", "true");
        drawer.setAttribute("aria-hidden", "false");
    }

    function closeMenu() {
        document.body.classList.remove("drawer-open");
        drawer.classList.remove("open");
        overlay.classList.remove("active");
        toggleBtn.classList.remove("menu-open");
        toggleBtn.setAttribute("aria-expanded", "false");
        drawer.setAttribute("aria-hidden", "true");
    }

    // Toggle button click
    toggleBtn.addEventListener("click", function(event) {
        event.stopPropagation();
        if (drawer.classList.contains("open")) {
            closeMenu();
        } else {
            openMenu();
        }
    });

    // Close button click
    const closeBtn =
        document.getElementById("trustetlDrawerClose");

    if (closeBtn) {
        closeBtn.addEventListener("click", function(event) {
            event.stopPropagation();
            closeMenu();
        });
    }

    // Overlay click closes the drawer
    overlay.addEventListener("click", function() {
        closeMenu();
    });

    // Escape key closes the drawer
    document.addEventListener("keydown", function(event) {
        if (event.key === "Escape" && drawer.classList.contains("open")) {
            closeMenu();
        }
    });

}

// Initialize when DOM is ready
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initHamburgerMenu);
} else {
    initHamburgerMenu();
}


