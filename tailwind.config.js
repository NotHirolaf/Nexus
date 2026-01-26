/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class', // <--- This is the key fix. It stops system preference from overriding our classes.
    theme: {
        extend: {},
    },
    plugins: [],
}
