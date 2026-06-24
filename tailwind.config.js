
module.exports = {
  mode: 'jit',
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    'node_modules/daisyui/dist/**/*.js',
    'node_modules/react-daisyui/dist/**/*.js',
  ],
  daisyui: {
    themes: ['corporate', 'black'],
  },
  plugins: [require('@tailwindcss/typography'), require('daisyui'), require("tailwindcss-animate")],
    theme: {
    	extend: {
    		colors: {
    			border: 'hsl(var(--border))',
    			input: 'hsl(var(--input))',
    			ring: 'hsl(var(--ring))',
    			neutral: {
    				'950': '#0a0a0a'
    			},
    			background: 'hsl(var(--background))',
    			foreground: 'hsl(var(--foreground))',
    			card: {
    				DEFAULT: 'hsl(var(--card))',
    				foreground: 'hsl(var(--card-foreground))'
    			},
    			popover: {
    				DEFAULT: 'hsl(var(--popover))',
    				foreground: 'hsl(var(--popover-foreground))'
    			},
    			primary: {
    				DEFAULT: 'hsl(var(--primary))',
    				foreground: 'hsl(var(--primary-foreground))'
    			},
    			secondary: {
    				DEFAULT: 'hsl(var(--secondary))',
    				foreground: 'hsl(var(--secondary-foreground))'
    			},
    			muted: {
    				DEFAULT: 'hsl(var(--muted))',
    				foreground: 'hsl(var(--muted-foreground))'
    			},
    			accent: {
    				DEFAULT: 'hsl(var(--accent))',
    				foreground: 'hsl(var(--accent-foreground))'
    			},
    			destructive: {
    				DEFAULT: 'hsl(var(--destructive))',
    				foreground: 'hsl(var(--destructive-foreground))'
    			},
    			chart: {
    				'1': 'hsl(var(--chart-1))',
    				'2': 'hsl(var(--chart-2))',
    				'3': 'hsl(var(--chart-3))',
    				'4': 'hsl(var(--chart-4))',
    				'5': 'hsl(var(--chart-5))'
    			},
    			sidebar: {
    				DEFAULT: 'hsl(var(--sidebar-background))',
    				foreground: 'hsl(var(--sidebar-foreground))',
    				primary: 'hsl(var(--sidebar-primary))',
    				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
    				accent: 'hsl(var(--sidebar-accent))',
    				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
    				border: 'hsl(var(--sidebar-border))',
    				ring: 'hsl(var(--sidebar-ring))'
    			}
    		},
    		animation: {
    			'accordion-down': 'accordion-down 0.2s ease-out',
    			'accordion-up': 'accordion-up 0.2s ease-out',
    			first: 'moveVertical 30s ease infinite',
    			second: 'moveInCircle 20s reverse infinite',
    			third: 'moveInCircle 40s linear infinite',
    			fourth: 'moveHorizontal 40s ease infinite',
    			fifth: 'moveInCircle 20s ease infinite',
    			'spin-slow': 'spin 16s linear infinite',
    			'collapse-input': 'collapse-input .25s ease-in-out',
    			'expand-input': 'collapse-input .25s ease-in-out reverse',
    			'fade-in': 'fade-in .15s ease-out forwards',
    			orbit: 'orbit calc(var(--duration)*1s) linear infinite',
    			'radar-spin': 'radar-spin 10s linear infinite',
    			spotlight: 'spotlight 2s ease .75s 1 forwards'
    		},
    		keyframes: {
    			'collapse-input': {
    				'0%': {
    					height: '2.5rem',
    					opacity: 1,
    					'margin-bottom': '.75rem'
    				},
    				'100%': {
    					height: 0,
    					opacity: 0,
    					'margin-bottom': 0
    				}
    			},
    			orbit: {
    				'0%': {
    					transform: 'rotate(0deg) translateY(calc(var(--radius) * 1px)) rotate(0deg)'
    				},
    				'100%': {
    					transform: 'rotate(360deg) translateY(calc(var(--radius) * 1px)) rotate(-360deg)'
    				}
    			},
    			'background-float': {
    				'0%': {
    					transform: 'translate(0, 0)'
    				},
    				'20%': {
    					transform: 'translate(10px, 15px)'
    				},
    				'40%': {
    					transform: 'translate(-10px, -10px) scale(1.1)'
    				},
    				'60%': {
    					transform: 'translate(0, 0) scale(1.05)'
    				},
    				'80%': {
    					transform: 'translate(5px, -5px) scale(1.1)'
    				},
    				'100%': {
    					transform: 'translate(0, 0) scale(1)'
    				}
    			},
    			'fade-in': {
    				'0%': {
    					opacity: 0,
    					transform: 'translateY(-10px)'
    				},
    				'100%': {
    					opacity: 1,
    					transform: 'translateY(0)'
    				}
    			},
    			'accordion-down': {
    				from: {
    					height: '0'
    				},
    				to: {
    					height: 'var(--radix-accordion-content-height)'
    				}
    			},
    			'accordion-up': {
    				from: {
    					height: 'var(--radix-accordion-content-height)'
    				},
    				to: {
    					height: '0'
    				}
    			},
    			moveHorizontal: {
    				'0%': {
    					transform: 'translateX(-50%) translateY(-10%)'
    				},
    				'50%': {
    					transform: 'translateX(50%) translateY(10%)'
    				},
    				'100%': {
    					transform: 'translateX(-50%) translateY(-10%)'
    				}
    			},
    			moveInCircle: {
    				'0%': {
    					transform: 'rotate(0deg)'
    				},
    				'50%': {
    					transform: 'rotate(180deg)'
    				},
    				'100%': {
    					transform: 'rotate(360deg)'
    				}
    			},
    			moveVertical: {
    				'0%': {
    					transform: 'translateY(-50%)'
    				},
    				'50%': {
    					transform: 'translateY(50%)'
    				},
    				'100%': {
    					transform: 'translateY(-50%)'
    				}
    			},
    			'radar-spin': {
    				from: {
    					transform: 'rotate(20deg)'
    				},
    				to: {
    					transform: 'rotate(380deg)'
    				}
    			},
    			spotlight: {
    				'0%': {
    					opacity: 0,
    					transform: 'translate(-72%, -62%) scale(0.5)'
    				},
    				'100%': {
    					opacity: 1,
    					transform: 'translate(-50%,-40%) scale(1)'
    				}
    			}
    		},
    		boxShadow: {
    			'menu-dark': '0 1rem 3rem -1rem rgba(59,130,246,.2)',
    			menu: '0 1rem 3rem -1rem rgba(0,0,0,.3)'
    		},
    		width: {
    			'86': '21.5rem',
    			'120': '30rem'
    		},
    		borderRadius: {
    			lg: 'var(--radius)',
    			md: 'calc(var(--radius) - 2px)',
    			sm: 'calc(var(--radius) - 4px)'
    		},
    		fontFamily: {
    			jakarta: [
    				'Plus Jakarta Sans',
    				'sans-serif'
    			]
    		}
    	}
    },
  plugins: [

  ],
};


