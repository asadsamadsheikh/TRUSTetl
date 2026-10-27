// ===============================
// TrustETL Registration JavaScript
// ===============================
// Submits the form to POST /api/auth/register (FastAPI).
// No accounts, passwords or tokens are ever stored in the browser.
// All server text is written with textContent / DOM nodes (never innerHTML).

(function () {
    "use strict";

    // ---------- Configuration ----------

    const REGISTER_PATH = "/api/auth/register";
    const REQUEST_TIMEOUT_MS = 15000;
    const LOGIN_PAGE = "Login.html";

    // Limits: keep identical to backend/schemas.py
    // (password limits also match the existing login page: 8-64, no spaces).
    const NAME_MIN = 2;
    const NAME_MAX = 100;
    const EMAIL_MAX = 100;
    const PASSWORD_MIN = 8;
    const PASSWORD_MAX = 64;

    const EMAIL_PATTERN =
        /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)*\.[A-Za-z]{2,}$/;


    function getApiBase() {
        const meta = document.querySelector('meta[name="trustetl-api-base"]');
        const configured = meta ? meta.content.trim() : "";

        if (configured) {
            return configured.replace(/\/+$/, "");
        }

        // Opened straight from disk: talk to the default local backend.
        if (window.location.protocol === "file:") {
            return "http://localhost:8000";
        }

        // Served by FastAPI (or a proxy): same origin.
        return "";
    }


    // ---------- Elements ----------

    const form = document.getElementById("registerForm");
    const formArea = document.getElementById("registerFormArea");
    const successPanel = document.getElementById("successPanel");
    const successTitle = document.getElementById("successTitle");

    const fullNameInput = document.getElementById("fullName");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const confirmInput = document.getElementById("confirmPassword");
    const termsInput = document.getElementById("terms");

    const errorEls = {
        full_name: document.getElementById("fullNameError"),
        email: document.getElementById("emailError"),
        password: document.getElementById("passwordError"),
        confirm: document.getElementById("confirmPasswordError"),
        terms: document.getElementById("termsError")
    };

    const inputsByField = {
        full_name: fullNameInput,
        email: emailInput,
        password: passwordInput,
        confirm: confirmInput,
        terms: termsInput
    };

    const formMessage = document.getElementById("formMessage");
    const submitButton = document.getElementById("registerButton");
    const submitButtonText = document.getElementById("registerButtonText");

    const strengthEl = document.getElementById("passwordStrength");
    const strengthText = document.getElementById("passwordStrengthText");

    if (!form) {
        return;
    }

    let isSubmitting = false;


    // ---------- Helpers ----------

    function setFieldError(field, message) {
        const input = inputsByField[field];
        errorEls[field].textContent = message || "";

        if (!input) {
            return;
        }

        input.classList.remove("valid", "invalid");

        if (message) {
            input.classList.add("invalid");
            input.setAttribute("aria-invalid", "true");
        } else {
            input.removeAttribute("aria-invalid");
        }
    }

    function markValid(field) {
        const input = inputsByField[field];
        errorEls[field].textContent = "";
        input.removeAttribute("aria-invalid");
        input.classList.remove("invalid");

        if (input.type !== "checkbox") {
            input.classList.add("valid");
        }
    }

    function clearFieldState(field) {
        const input = inputsByField[field];
        errorEls[field].textContent = "";
        input.removeAttribute("aria-invalid");
        input.classList.remove("invalid", "valid");
    }

    function normalizeName(value) {
        return value.replace(/\s+/g, " ").trim();
    }

    function clearMessage() {
        formMessage.textContent = "";
        formMessage.classList.remove("error", "success");
    }

    function showMessage(text, type) {
        clearMessage();
        formMessage.textContent = text;

        if (type) {
            formMessage.classList.add(type);
        }
    }

    function showDuplicateMessage() {
        clearMessage();
        formMessage.classList.add("error");

        formMessage.appendChild(document.createTextNode(
            "We couldn’t complete registration with this email address. " +
            "If you already have an account, "
        ));

        const link = document.createElement("a");
        link.href = LOGIN_PAGE;
        link.textContent = "log in instead";
        formMessage.appendChild(link);
        formMessage.appendChild(document.createTextNode("."));
    }


    // ---------- Validators (return true when valid) ----------

    function validateFullName() {
        const name = normalizeName(fullNameInput.value);

        if (name === "") {
            setFieldError("full_name", "Full name is required.");
            return false;
        }

        if (name.length < NAME_MIN) {
            setFieldError("full_name", "Full name must be at least " + NAME_MIN + " characters.");
            return false;
        }

        if (name.length > NAME_MAX) {
            setFieldError("full_name", "Full name must be " + NAME_MAX + " characters or fewer.");
            return false;
        }

        if (/[\u0000-\u001f\u007f]/.test(name)) {
            setFieldError("full_name", "Full name contains invalid characters.");
            return false;
        }

        markValid("full_name");
        return true;
    }

    function validateEmail() {
        const email = emailInput.value.trim();

        if (email === "") {
            setFieldError("email", "Email is required.");
            return false;
        }

        if (email.length > EMAIL_MAX) {
            setFieldError("email", "Email must be " + EMAIL_MAX + " characters or fewer.");
            return false;
        }

        if (/\s/.test(email)) {
            setFieldError("email", "Email cannot contain spaces.");
            return false;
        }

        if (email.includes("..") || !EMAIL_PATTERN.test(email) ||
            email.split("@")[0].startsWith(".") || email.split("@")[0].endsWith(".")) {
            setFieldError("email", "Please enter a valid email address.");
            return false;
        }

        markValid("email");
        return true;
    }

    function validatePassword() {
        const password = passwordInput.value;

        if (password === "") {
            setFieldError("password", "Password is required.");
            return false;
        }

        if (password.length < PASSWORD_MIN) {
            setFieldError("password", "Password must contain at least " + PASSWORD_MIN + " characters.");
            return false;
        }

        if (password.length > PASSWORD_MAX) {
            setFieldError("password", "Password cannot exceed " + PASSWORD_MAX + " characters.");
            return false;
        }

        if (/\s/.test(password)) {
            setFieldError("password", "Password cannot contain spaces.");
            return false;
        }

        markValid("password");
        return true;
    }

    function validateConfirm() {
        const confirm = confirmInput.value;

        if (confirm === "") {
            setFieldError("confirm", "Please confirm your password.");
            return false;
        }

        if (confirm !== passwordInput.value) {
            setFieldError("confirm", "Passwords do not match.");
            return false;
        }

        markValid("confirm");
        return true;
    }

    function validateTerms() {
        if (!termsInput.checked) {
            setFieldError("terms", "You must accept the Terms and Conditions.");
            return false;
        }

        markValid("terms");
        return true;
    }


    // ---------- Password strength (advisory only) ----------

    function scorePassword(password) {
        if (!password) {
            return 0;
        }

        let score = 0;

        if (password.length >= PASSWORD_MIN) { score += 1; }
        if (password.length >= 12) { score += 1; }
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) { score += 1; }
        if (/\d/.test(password) && /[^A-Za-z0-9]/.test(password)) { score += 1; }

        // Too short to be accepted: never rate it above "Weak".
        if (password.length < PASSWORD_MIN) {
            return 1;
        }

        return Math.max(1, Math.min(4, score));
    }

    function updateStrength() {
        const labels = ["—", "Weak", "Fair", "Good", "Strong"];
        const level = scorePassword(passwordInput.value);

        strengthEl.setAttribute("data-level", String(level));
        strengthText.textContent = "Password strength: " + labels[level];
    }


    // ---------- Show / hide password ----------

    function wireToggle(buttonId, input, noun) {
        const button = document.getElementById(buttonId);

        if (!button) {
            return;
        }

        button.addEventListener("click", function () {
            const show = input.type === "password";

            input.type = show ? "text" : "password";
            button.textContent = show ? "Hide" : "Show";
            button.setAttribute("aria-pressed", String(show));
            button.setAttribute("aria-label", (show ? "Hide " : "Show ") + noun);
        });
    }

    wireToggle("togglePassword", passwordInput, "password");
    wireToggle("toggleConfirmPassword", confirmInput, "confirm password");


    // ---------- Live validation ----------

    fullNameInput.addEventListener("blur", validateFullName);
    emailInput.addEventListener("blur", validateEmail);
    passwordInput.addEventListener("blur", validatePassword);
    confirmInput.addEventListener("blur", validateConfirm);

    fullNameInput.addEventListener("input", function () { clearFieldState("full_name"); });

    emailInput.addEventListener("input", function () {
        clearFieldState("email");

        // A "duplicate email" message no longer applies once the email changes.
        if (formMessage.classList.contains("error")) {
            clearMessage();
        }
    });

    passwordInput.addEventListener("input", function () {
        clearFieldState("password");
        updateStrength();

        if (confirmInput.value !== "") {
            validateConfirm();
        }
    });

    confirmInput.addEventListener("input", function () { clearFieldState("confirm"); });

    termsInput.addEventListener("change", function () {
        if (termsInput.checked) {
            markValid("terms");
        }
    });


    // ---------- Submit state ----------

    function setLoading(loading) {
        isSubmitting = loading;
        submitButton.disabled = loading;
        submitButton.classList.toggle("loading", loading);
        submitButton.setAttribute("aria-busy", String(loading));
        submitButtonText.textContent = loading ? "Creating account..." : "Create Account";
    }

    function showSuccess() {
        // Never keep passwords around in the DOM after use.
        passwordInput.value = "";
        confirmInput.value = "";

        formArea.hidden = true;
        successPanel.hidden = false;
        successTitle.focus();
    }


    // ---------- Server error handling ----------

    // Maps FastAPI/Pydantic-style errors ({errors: {field: message}}) to inputs.
    function applyServerFieldErrors(errors) {
        const keyMap = {
            full_name: "full_name",
            email: "email",
            password: "password"
        };

        let first = null;

        Object.keys(errors || {}).forEach(function (key) {
            const field = keyMap[key];

            if (field && typeof errors[key] === "string") {
                setFieldError(field, errors[key]);
                first = first || inputsByField[field];
            }
        });

        return first;
    }

    async function readJson(response) {
        try {
            return await response.json();
        } catch (err) {
            return null;
        }
    }


    // ---------- Submit ----------

    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        // Protection against repeated submissions.
        if (isSubmitting) {
            return;
        }

        clearMessage();

        const results = [
            ["full_name", validateFullName()],
            ["email", validateEmail()],
            ["password", validatePassword()],
            ["confirm", validateConfirm()],
            ["terms", validateTerms()]
        ];

        const firstInvalid = results.find(function (r) { return !r[1]; });

        if (firstInvalid) {
            showMessage("Please fix the errors before continuing.", "error");
            inputsByField[firstInvalid[0]].focus();
            return;
        }

        // Send only what the API needs (no confirm password, no terms flag).
        const payload = {
            full_name: normalizeName(fullNameInput.value),
            email: emailInput.value.trim(),
            password: passwordInput.value
        };

        setLoading(true);

        const controller = new AbortController();
        const timeoutId = window.setTimeout(function () {
            controller.abort();
        }, REQUEST_TIMEOUT_MS);

        try {
            const response = await fetch(getApiBase() + REGISTER_PATH, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify(payload),
                credentials: "omit",
                signal: controller.signal
            });

            if (response.status === 201) {
                showSuccess();
                return;
            }

            if (response.status === 409) {
                showDuplicateMessage();
                emailInput.focus();
                return;
            }

            if (response.status === 422) {
                const body = await readJson(response);
                const first = applyServerFieldErrors(body && body.errors);

                showMessage("Please correct the highlighted fields.", "error");

                if (first) {
                    first.focus();
                }

                return;
            }

            if (response.status === 503) {
                showMessage(
                    "The service is temporarily unavailable. Please try again in a few minutes.",
                    "error"
                );
                return;
            }

            showMessage("Something went wrong on our side. Please try again later.", "error");

        } catch (err) {
            if (err && err.name === "AbortError") {
                showMessage("The request timed out. Please check your connection and try again.", "error");
            } else {
                showMessage(
                    "We couldn’t reach the server. Please check your connection and try again.",
                    "error"
                );
            }
        } finally {
            window.clearTimeout(timeoutId);
            setLoading(false);
        }
    });

})();
