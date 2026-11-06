// Tailwind theme (must load right after the Tailwind CDN script)
tailwind.config = {
        theme: {
            extend: {
                colors: {
                    gold: {
                        light: '#E6CA65',
                        DEFAULT: '#C5A059',
                        dark: '#9A7B39',
                    },
                    darkslate: {
                        light: '#2A323D',
                        DEFAULT: '#1A202C',
                        dark: '#0F1319',
                    },
                    warmbeige: '#F9F6F0',
                },
                fontFamily: {
                    cairo: ['Cairo', 'sans-serif'],
                    tajawal: ['Tajawal', 'sans-serif'],
                }
            }
        }
    }
