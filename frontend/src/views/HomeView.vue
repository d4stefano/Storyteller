<template>
  <div class="home-container">
    <div class="home" ref="homeCard">
      <img alt="OWL-E logo" src="@/assets/logo.svg" class="logo">
      <h1>OWL-E: Building Worlds, Word by Word</h1>
      <p>Like a wise owl with a digital heart, Owl-e helps you create captivating stories.</p>
      <form @submit.prevent="generateStory">
        <div class="clean-form-container">
          <button v-if="isFormUpdated" type="button" @click="resetForm" class="reset-button">
            Clean Form
          </button>
        </div>

        <label for="ageRange">Age Range (for story content):</label>
        <select v-model="ageRange" id="ageRange" @change="updateSelectors">
          <option value="children">Children (e.g., 0-12)</option>
          <option value="teenager">Teenager/Adolescents (e.g., 13-17)</option>
          <option value="adults">Adults (e.g., 18+)</option>
        </select>

        <label for="genre">Genre:</label>
        <select v-model="genre" id="genre">
          <option v-for="genreOption in filteredGenres" :key="genreOption.value" :value="genreOption.value">
            {{ genreOption.label }}
          </option>
        </select>

        <label for="tone">Tone:</label>
        <select v-model="tone" id="tone">
          <option v-for="toneOption in filteredTones" :key="toneOption.value" :value="toneOption.value">
            {{ toneOption.label }}
          </option>
        </select>

        <label for="length">Length:</label>
        <select v-model="length" id="length">
          <option v-for="lengthOption in lengths" :key="lengthOption.value" :value="lengthOption.value">
            {{ lengthOption.label }}
          </option>
        </select>

        <div class="label-group">
          <label>Themes:</label>
          <button type="button" @click="addTheme" class="icon-button add-button">
            <font-awesome-icon icon="plus" />
          </button>
        </div>
        <div v-for="(theme, index) in themes" :key="index" class="input-group">
          <input v-model="theme.value" placeholder="Theme" class="theme-input">
          <button type="button" @click="removeTheme(index)" class="icon-button remove-button">
            <font-awesome-icon icon="trash-alt" />
          </button>
        </div>

        <div class="label-group">
          <label>Settings:</label>
          <button type="button" @click="addSetting" class="icon-button add-button">
            <font-awesome-icon icon="plus" />
          </button>
        </div>
        <div v-for="(setting, index) in settings" :key="index" class="input-group">
          <input v-model="setting.type" placeholder="Type (e.g., City, Era)">
          <input v-model="setting.value" placeholder="Value">
          <button type="button" @click="removeSetting(index)" class="icon-button remove-button">
            <font-awesome-icon icon="trash-alt" />
          </button>
        </div>

        <div class="label-group">
          <label>Characters:</label>
          <button type="button" @click="addCharacter" class="icon-button add-button">
            <font-awesome-icon icon="plus" />
          </button>
        </div>
        <div v-for="(character, index) in characters" :key="index" class="input-group">
          <input v-model="character.name" placeholder="Character name">
          <input v-model="character.description" placeholder="Character description">
          <button type="button" @click="removeCharacter(index)" class="icon-button remove-button">
            <font-awesome-icon icon="trash-alt" />
          </button>
        </div>

        <button type="submit" class="submit-button" :disabled="isGeneratingStory">
          {{ isGeneratingStory ? 'Generating' : 'Generate Story' }}<span v-if="isGeneratingStory" class="blinking-dots"></span>
        </button>
      </form>
      <div v-if="story" class="tabs">
        <button @click="currentView = 'story'" :class="{ active: currentView === 'story' }">{{ refinementResponse ? 'Original Story' : 'Story' }}</button>
        <button v-if="refinementResponse" @click="currentView = 'refinement'" :class="{ active: currentView === 'refinement' }">Refined Story</button>
      </div>
      <div v-if="story" class="story-container">
        <div v-if="currentView === 'story'">
          <div class="story-content">
            <h2>{{ story.title }}</h2>
            <div v-for="(chapter, index) in story.chapters" :key="index">
              <h3>{{ chapter.chapterTitle }}</h3>
              <p>{{ chapter.content }}</p>
            </div>
          </div>
        </div>
        <div v-if="currentView === 'refinement' && refinementResponse">
          <div class="story-content">
            <p>{{ refinementResponse }}</p>
          </div>
        </div>
      </div>
      <div v-if="!isGeneratingStory && story" class="refinement-container">
        <input v-model="refinementMessage" placeholder="Refine your story" />
        <button @click="sendRefinement" :disabled="isSendingRefinement || !refinementMessage">
          {{ isSendingRefinement ? 'Refining' : 'Refine' }}<span v-if="isSendingRefinement" class="blinking-dots"></span>
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch, computed } from 'vue';
import { genres, tones, lengths } from '@/config/selectors';

export default defineComponent({
  name: 'HomeView',
  setup() {
    const genre = ref('');
    const tone = ref('');
    const themes = ref([{ value: '' }]);
    const length = ref('');
    const settings = ref([{ type: '', value: '' }]);
    const characters = ref([{ name: '', description: '' }]);
    const ageRange = ref('children'); // Default to 'children'
    const story = ref<{ title: string, chapters: { chapterTitle: string, content: string }[] } | null>(null);
    const isGeneratingStory = ref(false);
    const isSendingRefinement = ref(false);
    const history = ref<{ role: string, content: string }[]>([]); // Store the interaction history
    const refinementMessage = ref('');
    const refinementResponse = ref('');
    const currentView = ref('story'); // Track the current view (story or refinement)
    const homeCard = ref<HTMLElement | null>(null);

    const filteredGenres = computed(() => {
      if (ageRange.value === 'children') {
        return genres.filter(genreOption => genreOption.ageMinimalRequirement === 'children');
      } else if (ageRange.value === 'teenager') {
        return genres.filter(genreOption => genreOption.ageMinimalRequirement === 'teenager' || genreOption.ageMinimalRequirement === 'children');
      } else {
        return genres;
      }
    });

    const filteredTones = computed(() => {
      if (ageRange.value === 'children') {
        return tones.filter(toneOption => toneOption.ageMinimalRequirement === 'children');
      } else if (ageRange.value === 'teenager') {
        return tones.filter(toneOption => toneOption.ageMinimalRequirement === 'teenager' || toneOption.ageMinimalRequirement === 'children');
      } else {
        return tones;
      }
    });

    const isFormUpdated = computed(() => {
      return genre.value || tone.value || length.value || themes.value.some(theme => theme.value) || settings.value.some(setting => setting.type || setting.value) || characters.value.some(character => character.name || character.description);
    });

    const resetForm = () => {
      ageRange.value = 'children';
      genre.value = '';
      tone.value = '';
      themes.value = [{ value: '' }];
      length.value = '';
      settings.value = [{ type: '', value: '' }];
      characters.value = [{ name: '', description: '' }];
    };

    const updateSelectors = () => {
      const newFilteredGenres = filteredGenres.value;
      if (!newFilteredGenres.some(genreOption => genreOption.value === genre.value)) {
        genre.value = ''; // Reset genre if not present in the new age range
      }

      const newFilteredTones = filteredTones.value;
      if (!newFilteredTones.some(toneOption => toneOption.value === tone.value)) {
        tone.value = ''; // Reset tone if not present in the new age range
      }
    };

    const addTheme = () => {
      themes.value.push({ value: '' });
    };

    const removeTheme = (index: number) => {
      themes.value.splice(index, 1);
    };

    const addSetting = () => {
      settings.value.push({ type: '', value: '' });
    };

    const removeSetting = (index: number) => {
      settings.value.splice(index, 1);
    };

    const addCharacter = () => {
      characters.value.push({ name: '', description: '' });
    };

    const removeCharacter = (index: number) => {
      characters.value.splice(index, 1);
    };

    const generateStory = async () => {
      isGeneratingStory.value = true;
      try {
        // Clean up history and reset card and tab status
        history.value = [];
        story.value = null;
        refinementResponse.value = '';
        currentView.value = 'story';

        const customization = {
          ageRange: ageRange.value,
          genre: genre.value,
          tone: tone.value,
          themes: themes.value.map(theme => theme.value),
          length: length.value,
          settings: settings.value,
          characters: characters.value
        };

        const response = await fetch('http://localhost:3000/api/story', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(customization),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Fetch error:', response.status, errorText);
          throw new Error(`Failed to generate story: ${response.status} ${errorText}`);
        }

        const storyData = await response.json();
        story.value = JSON.parse(storyData); // Parse the JSON string into an object
        history.value.push({ role: 'assistant', content: JSON.stringify(storyData) }); // Store the generated story in history
      } catch (error) {
        console.error('Error during fetch:', error); // Log the error details
        story.value = { title: 'Error', chapters: [{ chapterTitle: 'Error', content: (error as Error).message }] };
      } finally {
        isGeneratingStory.value = false; // Re-enable the submit button
      }
    };

    const sendRefinement = async () => {
      isSendingRefinement.value = true;
      try {
        const messages = [...history.value, { role: 'user', content: refinementMessage.value }];

        const response = await fetch('http://localhost:3000/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ messages, ageRange: ageRange.value }),
        });

        currentView.value = 'refinement'; // Switch to refinement view
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Fetch error:', response.status, errorText);
          throw new Error(`Failed to send refinement: ${response.status} ${errorText}`);
        }

        if (!response.body) {
          throw new Error('Response body is null');
        }
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let chatContent = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          chatContent += decoder.decode(value, { stream: true });
          refinementResponse.value = chatContent; // Append the chat response to the refinement response
        }

        history.value.push({ role: 'user', content: refinementMessage.value }); // Store the refinement message in history
        history.value.push({ role: 'assistant', content: chatContent }); // Store the chat response in history
        refinementMessage.value = ''; // Clear the refinement input field
      } catch (error) {
        console.error('Error during fetch:', error); // Log the error details
        refinementResponse.value += `\nError: ${(error as Error).message}`;
      } finally {
        isSendingRefinement.value = false; // Re-enable the refinement button
      }
    };

    watch(story, () => {
      if (homeCard.value) {
        homeCard.value.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
    });

    return {
      genres,
      tones,
      lengths,
      genre,
      tone,
      themes,
      length,
      settings,
      characters,
      ageRange,
      filteredGenres,
      filteredTones,
      story,
      isGeneratingStory,
      isSendingRefinement,
      isFormUpdated,
      resetForm,
      updateSelectors,
      history,
      refinementMessage,
      refinementResponse,
      currentView,
      addTheme,
      removeTheme,
      addSetting,
      removeSetting,
      addCharacter,
      removeCharacter,
      generateStory,
      sendRefinement,
      homeCard,
    };
  },
});
</script>

<style scoped>
.home-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100%;
}

.home {
  position: relative;
  padding: 20px;
  text-align: center;
  background-color: #d3fcfb;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(37, 45, 68, 0.1);
}

.logo {
  width: 150px;
  height: 150px;
}

form {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 5px;
}

.clean-form-container {
  display: flex;
  justify-content: center;
  width: 100%;
  height: 28px; /* Ensure space is always present */
  align-items: center;
  margin-top: 10px;
}

.label-group {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  width: 100%;
  gap: 10px;
}

label {
  font-weight: bold;
}

select, input {
  width: 100%;
  padding: 8px;
  margin-bottom: 10px;
  background-color: #fcfffd;
  border: 1px solid #252d44;
  border-radius: 5px;
}

.input-group {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 10px;
}

.theme-input {
  flex: 1;
}

button {
  padding: 10px 20px;
  font-size: 16px;
  border: none;
  border-radius: 5px;
  margin-bottom: 10px;
  cursor: pointer;
}

.icon-button {
  border-width: 1px;
  border-style: solid;
  cursor: pointer;
  font-size: 12px;
  height: 33px;
  display: flex;
  align-items: flex-start;
}

.add-button {
  color: #252d44;
  border-color: #252d44;
  background-color: #fcfffd;
}

.add-button:hover {
  color: #252d44;
  background-color: #fcfffd;
}

.remove-button {
  border-color: #7e5074;
}

.remove-button, .reset-button {
  background-color: #7e5074;
  color: white;
}

.reset-button {
  margin-bottom: 0;
  padding: 6px 20px;
}

.remove-button:hover, .reset-button:hover {
  background-color: #7e5074;
}

.label-group button {
  margin-bottom: 0;
}

.submit-button, .refinement-container button {
  background-color: #252d44;
  color: white;
}

.submit-button {
  width: 100%;
  margin-top: 10px;
}

.submit-button:disabled, .refinement-container button:disabled {
  background-color: #9E9E9E;
  cursor: not-allowed;
}

.submit-button:hover:not(:disabled) {
  background-color: #252d44;
}

.blinking-dots::after {
  content: '...';
  animation: blink 1.5s steps(1, end) infinite;
}

@keyframes blink {
  0%, 20% {
    content: '';
  }
  40% {
    content: '.';
  }
  60% {
    content: '..';
  }
  80%, 100% {
    content: '...';
  }
}

.story-container, .refinement-response-container {
  position: relative;
  margin-top: -25px;
  background-color: #fff;
  border-radius: 0 10px 10px 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  z-index: 1;
}

.tabs {
  position: relative;
  display: flex;
  margin-bottom: 10px;
  margin-top: 10px;
  z-index: 0;
}

.tabs button {
  font-weight: bold;
  font-size: 16px;
  padding: 10px 20px;
  border-radius: 5px 10px 0 0;
  cursor: pointer;
  background-color: rgba(0, 0, 0, 0.1);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.tabs button.active {
  background-color: #fff;
  color: #252d44;
}

.story-container {
  padding: 15px;
}

.story-content {
  white-space: pre-wrap; /* Preserve whitespace and line breaks */
}

.refinement-container {
  margin-top: 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.refinement-container button {
  width: 100%;
  margin-bottom: 0px;
}

.refinement-container input {
  width: 100%;
  margin-bottom: 0px;
}

h2 {
  margin-top: 20px;
}

p {
  white-space: pre-wrap;
}

@media (min-width: 480px) {
  .home {
    padding: 10px;
    padding: 60px 20px 20px;
  }

  .logo {
    position: absolute;
    top: -75px;
    left: 50%;
    transform: translateX(-50%);
  }

  select, input {
    padding: 6px;
  }

  button {
    padding: 8px 16px;
    margin-bottom: 10px;
    font-size: 14px;
  }

  .refinement-container {
    margin-top: 20px;
    display: flex;
    flex-wrap: nowrap;
    gap: 10px;
  }

  .refinement-container button {
    width: 150px;
  }
}

@media (min-width: 768px) {
  .home {
    width: 500px;
    padding: 80px 20px 20px 20px;
    margin-top: 80px;
  }

  select, input {
    padding: 8px;
  }

  button {
    padding: 10px 20px;
    margin-bottom: 8px;
    font-size: 16px;
  }

  .story-container {
    padding: 20px;
  }
}

@media (min-width: 1024px) {
  .home {
    width: 600px;
  }

  .icon-button {
    height: 33px;
  }
}

@media (min-width: 1200px) {
  form {
    gap: 10px;
  }
}
</style>