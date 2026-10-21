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
        window.location.pathname
            .split("/")
            .pop();


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

