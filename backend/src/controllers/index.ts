import { Request, Response } from 'express';
import ollama, { Message } from 'ollama';
import {Filter} from 'bad-words';

class IndexController {
    /**
     * Generates a story based on the provided prompt.
     * @param {import('express').Request} req - The request object containing the prompt.
     * @param {import('express').Response} res - The response object to send the generated story.
     */
    async getStory(req: Request, res: Response) {
        try {
            const { ageRange, genre, tone, themes, length, settings, characters } = req.body;
            let prompt = "";
            
            // Construct the story customization JSON object based on the provided elements
            let storyCustomization = `{"reader age range": "${ageRange}",`;
            if (genre) {
                storyCustomization += `"genre": "${genre}",`;
            }
            if (tone) {
                storyCustomization += `"tone": "${tone}",`;
            }
            if (themes && themes.length > 0 && themes[0]) {
                storyCustomization += `"themes": ${JSON.stringify(themes)},`;
            }
            if (length) {
                storyCustomization += `"length": "${length}",`;
            }
            if (settings && settings.length > 0 && settings[0].type) {
                storyCustomization += `"setting": ${JSON.stringify(settings)},`;
            }
            if (characters && characters.length > 0 && characters[0].name) {
                storyCustomization += `"characters": ${JSON.stringify(characters)},`;
            }

            
            storyCustomization = storyCustomization.replace(/,$/, '}'); // Replace the trailing comma with the closing bracket
            prompt += `Write a story based on the following elements: ${storyCustomization}
                Ensure the story has a clear beginning, middle and end, with proper pacing and character development. The dialogue should feel natural, and the narrative should align with the reader age range, tone and genre selected. Provide vivid descriptions, build tension appropriately, and include a satisfying conclusion. 
                Return it in a JSON object with the following structure:
                    title (string): The title of the book.
                    chapters (array of objects): An array where each object represents a chapter. Each chapter object has the following properties:
                    chapterTitle (string): The title of the chapter.
                    content (string): The textual content of the chapter.
                Example:
                JSON
                {
                    "title": "The Enchanted Forest",
                    "chapters": [
                        {
                        "chapterTitle": "The Journey Begins",
                        "content": "Once upon a time..."
                        },
                        {
                        "chapterTitle": "The Wizard's Hut",
                        "content": "They travelled deep into the forest..."
                        }
                    ]
                }`;

            await this.generateStory(prompt, ageRange, res);
        } catch (error) {
            if (!res.headersSent) {
                res.status(500).json({ error: 'Failed to generate story' });
            }
        }
    }

    /**
     * Calls the Ollama interface to generate a story based on the provided prompt.
     * @param {string} prompt - The prompt to generate the story from.
     * @param {string} ageRange - The age range to be consider for the response.
     * @param {Response} res - The response object to send the story to.
     */
    async generateStory(prompt: string, ageRange: string, res: Response) {
        try {
            const response = await ollama.generate({
                model: 'mistral',
                prompt: prompt,
                format: "json",
                stream: false
            });

            let filteredResponse = response.response;

            // Filter the response based on the age range
            if (ageRange === 'children' || ageRange === 'teenager') {
                const filter = new Filter();
                filteredResponse = filter.clean(response.response);
            }

            res.json(filteredResponse);
        } catch (error) {
            if (!res.headersSent) {
                res.status(500).json({ error: 'Failed to generate story' });
            }
        }
    }

    /**
     * Calls the Ollama chat interface to generate a chat response based on the provided prompt.
     * @param {Message[]} messages - The prompt to generate the chat response from.
     * @param {string} ageRange - The age range to be consider for the response.
     * @param {Response} res - The response object to stream the chat response to.
     */
    async chat(messages: Message[], ageRange: string, res: Response) {
        try {
            const responseIterator = await ollama.chat({
                model: 'mistral',
                messages: messages,
                format: "json",
                stream: true
            });

            for await (const response of responseIterator) {
                let filteredResponse = response.message.content;

                // Filter the response based on the age range
                if (ageRange === 'children' || ageRange === 'teenager') {
                    const filter = new Filter();
                    filteredResponse = filter.clean(response.message.content);
                }

                res.write(filteredResponse);
            }

            res.end();
        } catch (error) {
            if (!res.headersSent) {
                res.status(500).json({ error: 'Failed to generate chat response' });
            }
        }
    }

    /**
     * Handles chat requests and connects to the Ollama chat API.
     * @param {import('express').Request} req - The request object containing the chat messages and the age range of the conversation.
     * @param {import('express').Response} res - The response object to send the chat response.
     */
    async postChat(req: Request, res: Response) {
        try {
            const messages: Message[] = req.body.messages;
            const ageRange: string = req.body.ageRange;
            await this.chat(messages, ageRange, res);
        } catch (error) {
            if (!res.headersSent) {
                res.status(500).json({ error: 'Failed to process chat request' });
            }
        }
    }
}

export default IndexController;