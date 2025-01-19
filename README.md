# Storyteller Project

Welcome to the Storyteller project! This workspace consists of a backend application written in TypeScript that interfaces with the Ollama API, and a frontend application built with Vue.js to create an interactive storyteller portal.

## Project Structure

```
Storyteller
├── backend
│   ├── src
│   │   ├── app.ts
│   │   ├── controllers
│   │   │   └── index.ts
│   │   ├── routes
│   │   │   └── index.ts
│   │   └── types
│   │       └── index.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
├── frontend
│   ├── src
│   │   ├── App.vue
│   │   ├── main.ts
│   │   ├── components
│   │   │   └── HelloWorld.vue
│   │   └── views
│   │       └── Home.vue
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
└── README.md
```

## Backend Setup

1. Navigate to the `backend` directory.
2. Install dependencies:
   ```
   npm install
   ```
3. Start the server:
   ```
   npm start
   ```

The backend API will be available at `http://localhost:3000`.

## Frontend Setup

1. Navigate to the `frontend` directory.
2. Install dependencies:
   ```
   npm install
   ```
3. Start the frontend application:
   ```
   npm run serve
   ```

The frontend application will be available at `http://localhost:8080`.

## Usage

- Use the frontend portal to interact with the backend API and generate stories.
- The backend handles requests for story generation through the Ollama interface.

## Contributing

Feel free to contribute to the project by submitting issues or pull requests. Your feedback and contributions are welcome!

## License

This project is licensed under the MIT License.