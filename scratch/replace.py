import re

filepath = r'c:\Users\Bello Imam\Documents\quran-circle\src\app\page.tsx'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Imports
content = content.replace(
    "import { Logo } from '@/components/logo';",
    "import { Logo } from '@/components/logo';\nimport { ThemeToggle } from '@/components/theme-toggle';"
)

# Header
content = content.replace(
    '<Link href="/login" className="hover:text-white transition-colors hidden sm:block text-sm font-medium">Log in</Link>',
    '<ThemeToggle />\n            <Link href="/login" className="hover:text-foreground transition-colors hidden sm:block text-sm font-medium">Log in</Link>'
)
content = content.replace('hover:text-white', 'hover:text-foreground')

# Replace colors safely
content = content.replace('text-white', 'text-foreground')
content = content.replace('text-gray-300', 'text-muted-foreground')
content = content.replace('text-gray-400', 'text-muted-foreground')
content = content.replace('text-gray-500', 'text-muted-foreground')
content = content.replace('text-gray-600', 'text-muted-foreground/80')

content = content.replace('bg-white/5', 'bg-black/5 dark:bg-white/5')
content = content.replace('bg-white/10', 'bg-black/10 dark:bg-white/10')
content = content.replace('bg-white/20', 'bg-black/20 dark:bg-white/20')

content = content.replace('border-white/5', 'border-black/5 dark:border-white/5')
content = content.replace('border-white/10', 'border-black/10 dark:border-white/10')
content = content.replace('border-white/20', 'border-black/20 dark:border-white/20')

content = content.replace('bg-[#16181D]', 'bg-card border dark:border-white/10')
content = content.replace('bg-[#1A1C20]', 'bg-popover')

# Button colors
content = content.replace('bg-primary text-black', 'bg-primary text-primary-foreground')
content = content.replace('bg-white text-black', 'bg-foreground text-background')
content = content.replace('hover:bg-gray-200', 'hover:bg-foreground/90')

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Replaced content")
