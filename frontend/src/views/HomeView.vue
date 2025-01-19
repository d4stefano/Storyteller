<template>
  <div class="home-container">
    <div class="home" ref="homeCard">
      <img alt="OWL-E logo" src="@/assets/logo.svg" class="logo">
      <h1>OWL-E: Building Worlds, Word by Word</h1>
      <p>Like a wise owl with a digital heart, Owl-e helps you create captivating stories.</p>
      <form @submit.prevent="generateStory">
        <div class="clean-form-container">
          <button v-if="isFormUpdated" type="button" @click="resetForm" class="icon-button reset-button">
            Clean Form
          </button>
        </div>

        <label for="genre">Genre:</label>
        <select v-model="genre" id="genre">
          <option v-for="genreOption in genres" :key="genreOption.value" :value="genreOption.value">
            {{ genreOption.label }}
          </option>
        </select>

        <label for="tone">Tone:</label>
        <select v-model="tone" id="tone">
          <option v-for="toneOption in tones" :key="toneOption.value" :value="toneOption.value">
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

        <button type="submit" class="submit-button" :disabled="isLoading">
          {{ isLoading ? 'Generating...' : 'Generate Story' }}
        </button>
      </form>
      <div v-if="story" class="story-container">
        <h2>Your Story:</h2>
        <p>{{ story }}</p>
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
    const story = ref('');
    const isLoading = ref(false);
    const homeCard = ref<HTMLElement | null>(null);

    const isFormUpdated = computed(() => {
      return genre.value || tone.value || length.value || themes.value.some(theme => theme.value) || settings.value.some(setting => setting.type || setting.value) || characters.value.some(character => character.name || character.description);
    });

    const resetForm = () => {
      genre.value = '';
      tone.value = '';
      themes.value = [{ value: '' }];
      length.value = '';
      settings.value = [{ type: '', value: '' }];
      characters.value = [{ name: '', description: '' }];
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
      isLoading.value = true;
      try {
        const response = await fetch('http://localhost:3000/api/story', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            genre: genre.value,
            tone: tone.value,
            themes: themes.value.map(theme => theme.value),
            length: length.value,
            settings: settings.value,
            characters: characters.value,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Fetch error:', response.status, errorText);
          throw new Error(`Failed to generate story: ${response.status} ${errorText}`);
        }

        if (!response.body) {
          throw new Error('Response body is null');
        }
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let storyContent = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          storyContent += decoder.decode(value, { stream: true });
          story.value = storyContent; // Update the story as chunks are received
        }

        story.value = storyContent; // Final update with the complete story
      } catch (error) {
        console.error('Error during fetch:', error); // Log the error details
        story.value = `Error: ${(error as Error).message}`;
      } finally {
        isLoading.value = false;
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
      story,
      isLoading,
      isFormUpdated,
      resetForm,
      addTheme,
      removeTheme,
      addSetting,
      removeSetting,
      addCharacter,
      removeCharacter,
      generateStory,
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
  gap: 10px;
}

.clean-form-container {
  display: flex;
  justify-content: center;
  width: 100%;
  height: 33px; /* Ensure space is always present */
}

.label-group {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  width: 100%;
  gap: 10px;
}

label {
  margin-top: 10px;
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
  border: none;
  cursor: pointer;
  font-size: 12px;
  height: 33px;
  display: flex;
  align-items: flex-start;
}

.add-button {
  color: #252d44;
  border: 1px solid #252d44;
  background-color: #fcfffd;
}

.add-button:hover {
  color: #252d44;
  border: 1px solid #252d44;
  background-color: #fcfffd;
}

.remove-button, .reset-button {
  background-color: #7e5074;
  color: white;
}

.reset-button {
  margin-bottom: 0;
  margin-top: 20px;
  height: 25px;
  padding: 6px 20px;
}

.remove-button:hover, .reset-button:hover {
  background-color: #7e5074;
}

.label-group button {
  margin-bottom: 0;
}

.submit-button {
  background-color: #252d44;
  color: white;
  width: 100%;
  margin-top: 10px;
}

.submit-button:disabled {
  background-color: #9E9E9E;
  cursor: not-allowed;
}

.submit-button:hover:not(:disabled) {
  background-color: #252d44;
}

.story-container {
  margin-top: 20px;
  padding: 20px;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
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

  form {
    gap: 5px;
  }

  select, input {
    padding: 6px;
  }

  button {
    padding: 8px 16px;
    margin-bottom: 6px;
    font-size: 14px;
  }

  .story-container {
    padding: 15px;
  }
}

@media (min-width: 768px) {
  .home {
    padding: 80px 20px 20px 20px;
    margin-top: 80px;
  }

  form {
    gap: 10px;
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
    max-width: 700px;
  }
}

@media (min-width: 1200px) {
  .home {
    max-width: 1000px;
  }
}
</style>