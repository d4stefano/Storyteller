# Storyteller Backend

## Overview
The backend of the Storyteller project is built using TypeScript and Express. It provides an API to interact with the Ollama interface for generating stories.

## Setup Instructions

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd Storyteller/backend
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Run the Application**
   ```bash
   npm start
   ```

## API Usage

### Endpoints

- **GET /api/story**
  - Description: Generates a story based on the provided parameters.
  - Request Body: 
    ```json
    {
      "title": "string",
      "genre": "string",
      "length": "number"
    }
    ```
  - Response:
    ```json
    {
      "story": "string"
    }
    ```

## Development

- The backend is structured into controllers, routes, and types for better organization and maintainability.
- The main entry point is located in `src/app.ts`.

## License
This project is licensed under the MIT License.