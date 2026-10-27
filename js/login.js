// ===============================
// TrustETL Login JavaScript
// ===============================

const loginForm = document.getElementById("loginForm");

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

const emailError = document.getElementById("emailError");
const passwordError = document.getElementById("passwordError");
const formMessage = document.getElementById("formMessage");

const loginButton = document.getElementById("loginButton");
const togglePassword = document.getElementById("togglePassword");


// ===============================
// SHOW / HIDE PASSWORD
// ===============================

if (togglePassword) {
    togglePassword.addEventListener("click", function () {

        if (passwordInput.type === "password") {
            passwordInput.type = "text";
            togglePassword.textContent = "Hide";
        } else {
            passwordInput.type = "password";
            togglePassword.textContent = "Show";
        }

    });
}


// ===============================
// EMAIL VALIDATION
// ===============================

function validateEmail() {

    const email = emailInput.value.trim();

    emailError.textContent = "";
    emailInput.classList.remove("input-invalid", "input-valid");

    if (email === "") {
        emailError.textContent = "Email is required.";
        emailInput.classList.add("input-invalid");
        return false;
    }

    if (email.length > 100) {
        emailError.textContent = "Email must be less than 100 characters.";
        emailInput.classList.add("input-invalid");
        return false;
    }

    if (/\s/.test(email)) {
        emailError.textContent = "Email cannot contain spaces.";
        emailInput.classList.add("input-invalid");
        return false;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    if (!emailPattern.test(email)) {
        emailError.textContent = "Please enter a valid email address.";
        emailInput.classList.add("input-invalid");
        return false;
    }

    if (email.includes("..")) {
        emailError.textContent = "Email cannot contain consecutive dots.";
        emailInput.classList.add("input-invalid");
        return false;
    }

    emailInput.classList.add("input-valid");

    return true;
}


// ===============================
// PASSWORD VALIDATION
// ===============================

function validatePassword() {

    const password = passwordInput.value;

    passwordError.textContent = "";
    passwordInput.classList.remove("input-invalid", "input-valid");

    if (password === "") {
        passwordError.textContent = "Password is required.";
        passwordInput.classList.add("input-invalid");
        return false;
    }

    if (password.length < 8) {
        passwordError.textContent = "Password must contain at least 8 characters.";
        passwordInput.classList.add("input-invalid");
        return false;
    }

    if (password.length > 64) {
        passwordError.textContent = "Password cannot exceed 64 characters.";
        passwordInput.classList.add("input-invalid");
        return false;
    }

    if (/\s/.test(password)) {
        passwordError.textContent = "Password cannot contain spaces.";
        passwordInput.classList.add("input-invalid");
        return false;
    }

    passwordInput.classList.add("input-valid");

    return true;
}


// ===============================
// LIVE VALIDATION
// ===============================

emailInput.addEventListener("blur", validateEmail);

passwordInput.addEventListener("blur", validatePassword);


// Clear error while typing

emailInput.addEventListener("input", function () {

    emailError.textContent = "";
    emailInput.classList.remove("input-invalid");

});

passwordInput.addEventListener("input", function () {

    passwordError.textContent = "";
    passwordInput.classList.remove("input-invalid");

});


// ===============================
// LOGIN
// ===============================

loginForm.addEventListener("submit", function (event) {

    event.preventDefault();

    formMessage.textContent = "";

    const emailValid = validateEmail();
    const passwordValid = validatePassword();

    if (!emailValid || !passwordValid) {

        formMessage.textContent =
            "Please fix the errors before continuing.";

        return;
    }


    // Get values

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    // Remember checkbox

    const rememberMe =
        document.getElementById("rememberMe");



    // ===============================
    // DEMO LOGIN
    // ===============================

    // Generate name from email

    let namePart = email.split("@")[0];

    namePart = namePart
        .replace(/[._-]/g, " ")
        .replace(/\s+/g, " ")
        .trim();

    const displayName = namePart
        .split(" ")
        .map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        )
        .join(" ");


    // ===============================
    // SAVE USER INFORMATION
    // ===============================

    localStorage.setItem(
        "trustetl_name",
        displayName
    );

    localStorage.setItem(
        "trustetl_email",
        email
    );

    localStorage.setItem(
        "trustetl_logged_in",
        "true"
    );


    if (rememberMe && rememberMe.checked) {

        localStorage.setItem(
            "trustetl_remember",
            "true"
        );

    } else {

        localStorage.removeItem(
            "trustetl_remember"
        );

    }


    // IMPORTANT:
    // Never store the password in localStorage.


    // ===============================
    // SUCCESS MESSAGE
    // ===============================

    formMessage.textContent =
        "Login successful! Redirecting...";

    formMessage.classList.add("success");


    loginButton.disabled = true;
    loginButton.textContent = "Logging in...";


    // Redirect to homepage

    setTimeout(function () {

        window.location.href = "index.html";

    }, 800);

});


// ===============================
// DEMO LOGIN BUTTON
// ===============================

const demoLogin = document.getElementById("demoLogin");

if (demoLogin) {

    demoLogin.addEventListener("click", function () {

        localStorage.setItem(
            "trustetl_name",
            "Manav"
        );

        localStorage.setItem(
            "trustetl_email",
            "manav@trustetl.demo"
        );

        localStorage.setItem(
            "trustetl_logged_in",
            "true"
        );

        localStorage.setItem(
            "trustetl_demo",
            "true"
        );


        window.location.href = "index.html";

    });

}


// ===============================
// FORGOT PASSWORD
// ===============================

const forgotPassword =
    document.getElementById("forgotPassword");

if (forgotPassword) {

    forgotPassword.addEventListener("click", function (event) {

        event.preventDefault();

        alert(
            "Password reset functionality will be connected to the backend later."
        );

    });

}


// ===============================
// CREATE ACCOUNT
// ===============================

const createAccount =
    document.getElementById("createAccount");

if (createAccount) {
    createAccount.addEventListener("click", function (event) {
        event.preventDefault();
        window.location.href = "Register.html";
    });
}