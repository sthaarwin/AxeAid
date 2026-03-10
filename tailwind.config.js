/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
    presets: [require("nativewind/preset")],
    theme: {
        extend: {
            colors: {
                primary: '#25bdf8',
                background: '#0f1d23',
                surface: '#111827',
                'surface-light': '#1a2634',
                success: '#22c55e',
            }
        },
    },
    plugins: [],
}
