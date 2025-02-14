# AI Storyboard Generator

This template provides a minimal setup to get AI-powered storyboard generation working in Vite with React and TypeScript.

## 🔐 API Key Setup (Important!)

1. Sign up for a FAL.ai account at https://fal.ai
2. Get your API key from the FAL.ai dashboard
3. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
4. Add your API key to `.env`:
   ```
   VITE_FAL_AI_API_KEY=your_fal_ai_api_key_here
   ```

⚠️ **Security Warnings:**
- NEVER commit your `.env` file
- NEVER share your API key
- NEVER push your API key to public repositories
- The `.env` file is already in `.gitignore`

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default {
  // other rules...
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json', './tsconfig.node.json'],
    tsconfigRootDir: __dirname,
  },
}
```

- Replace `plugin:@typescript-eslint/recommended` to `plugin:@typescript-eslint/recommended-type-checked` or `plugin:@typescript-eslint/strict-type-checked`
- Optionally add `plugin:@typescript-eslint/stylistic-type-checked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and add `plugin:react/recommended` & `plugin:react/jsx-runtime` to the `extends` list

## Scripts

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run ESLint
npm run lint
```

## Features

- ⚡️ React + TypeScript + Vite
- 🎨 Tailwind CSS for styling
- 🤖 FAL.ai Realistic Vision model integration
- 📱 Responsive design
- 🖼️ 720x1280 (9:16) image generation
- 🔄 Individual image regeneration
- 🔒 Secure environment variable handling

## Project Structure

```
/
├── src/
│   ├── components/         # React components
│   │   ├── ImageLoadingPlaceholder.tsx
│   │   ├── StoryboardPrompt.tsx
│   │   └── StoryboardSequence.tsx
│   ├── utils/
│   │   └── falAi.ts       # FAL.ai integration
│   ├── App.tsx            # Main app component
│   └── main.tsx           # Entry point
├── public/                 # Static assets
├── .env.example           # Environment variables template
└── package.json           # Dependencies and scripts
```

## Deployment

To deploy your app:

1. Build your application:
   ```bash
   npm run build
   ```

2. Preview the build:
   ```bash
   npm run preview
   ```

3. Deploy the `dist` folder to your hosting provider

## Type Support For `.env` Files

This project includes type support for environment variables through `vite-env.d.ts`. You can find more details in Vite's documentation.