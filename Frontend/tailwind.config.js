/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            colors: {
                primary: "#F8D3E1",
                accent1: "#FADCE6",
                accent2: "#FFF3F6",
            },
        },
    },
    plugins: [],
};
