import { Request, Response } from 'express';
import ollama from 'ollama';

class IndexController {
    /**
     * Generates a story based on the provided prompt.
     * @param {import('express').Request} req - The request object containing the prompt.
     * @param {import('express').Response} res - The response object to send the generated story.
     */
    async getStory(req: Request, res: Response) {
        try {
            const { genre, tone, themes, length, settings, characters } = req.body;
            let prompt = "";
            
            // Construct the story customization JSON object based on the provided elements
            let storyCustomization = "{";
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

            // Used the customixed prompt if any elements were provided, otherwise use the default prompt
            if (storyCustomization.length > 1) {
                storyCustomization = storyCustomization.replace(/,$/, '}'); // Replace the trailing comma with the closing bracket
                prompt += `Write a story based on the following elements: ${storyCustomization}
                    Ensure the story has a clear beginning, middle and end, with proper pacing and character development. The dialogue should feel natural, and the narrative should align with the tone and genre specified. Provide vivid descriptions, build tension appropriately, and include a satisfying conclusion. Return it in simple text putting its title at the beginning and separate from its chapters by an empty line. Then return each chapter separated by the other by an empty line and with their title return at the begin in a separate line.
                    Example:
                    "The Enchanted Forest
                    
                    The Journey Begins
                    Once upon a time...

                    Wizard's Hut
                    They travelled deep into the forest..."`;
            } else {
                prompt = `Write a story with a clear beginning, middle and end, with proper pacing and character development. The dialogue should feel natural, and the narrative should align with the tone and genre you will decide. Provide vivid descriptions, build tension appropriately, and include a satisfying conclusion. Return it in simple text putting its title at the beginning and separate from its chapters by an empty line. Then return each chapter separated by the other by an empty line and with their title return at the begin in a separate line.
                    Example:
                        "The Enchanted Forest
                        
                        The Journey Begins
                        Once upon a time...

                        Wizard's Hut
                        They travelled deep into the forest..."`;
            };

            await this.generateStory(prompt, res);
        } catch (error) {
            res.status(500).json({ error: 'Failed to generate story' });
        }
    }

    /**
     * Calls the Ollama interface to generate a story based on the provided prompt.
     * @param {string} prompt - The prompt to generate the story from.
     * @param {Response} res - The response object to stream the story to.
     * @returns {Promise<void>} - The generated story content.
     */
    async generateStory(prompt: string, res: Response): Promise<void> {
        const responseIterator = await ollama.generate({
            model: 'mistral',
            prompt: prompt, 
            /* VERSION 1:
            `
                    {
                        "name": "InspectorY",
                        "description": "A tenacious detective who will stop at nothing to uncover the truth."
                    }
                ]
            }
            Example:
            JSON
            {
                "title": "The Enchanted Forest",
                "chapters": [
                    {
                        "chapter_title": "The Journey Begins",
                        "content": "Once upon a time..."
                    },
                    {
                        "chapter_title": "The Wizard's Hut",
                        "content": "They travelled deep into the forest..."
                    }
                ]
            }`,*/

            /* VERSION 2 (better for visualization on frontend):
            `Write a story based on the following elements:
            {
                "genre": "mystery",
                "tone": "dramatic",
                "themes": ["whodunit", "deception", "familysecrets"],
                "length": "novella",
                "setting": {
                    "city": "Paris",
                    "era": "1920s"
                },
                "characters": [
                    {
                        "name": "MadameX",
                        "description": "A glamorous socialite with a hidden past."
                    },
                    {
                        "name": "InspectorY",
                        "description": "A tenacious detective who will stop at nothing to uncover the truth."
                    }
                ]
            }
            Ensure the story has a clear beginning, middle and end, with proper pacing and character development. The dialogue should feel natural, and the narrative should align with the tone and genre specified. Provide vivid descriptions, build tension appropriately, and include a satisfying conclusion. Return it in simple text putting its title at the begining and separate from its chapters by an empty line. Then return each chapter separated by the other by an empty line and with their title return at the begin in a separate line.
            Example:
            "The Enchanted Forest
            
            The Journey Begins
            Once upon a time...

            Wizard's Hut
            They travelled deep into the forest..."
            `,*/
            format: "json",
            stream: true
        });

        
        // res.write(''); // Start of JSON array

        // let isFirstChunk = true;

        for await (const response of responseIterator) {
            // if (!isFirstChunk) {
            //     res.write(','); // Separate JSON objects with a comma
            // }
            res.write(response.response);
            // isFirstChunk = false;
        }

        // res.write(']'); // End of JSON array
        res.end();
    }
}

export default IndexController;