<template>
  <div
    class="k-file-upload w-100"
  >
    <KLabel
      v-if="label"
      v-bind="labelAttributes"
      class="cursor-pointer"
      data-testid="k-file-upload-label"
      :for="customInputId"
    >
      {{ label }}
    </KLabel>

    <KInput
      :id="customInputId"
      :key="fileInputKey"
      :accept="accept"
      class="w-100 upload-input"
      :class="{
        'image-upload': type === 'image'
      }"
      :error-message="errorMessage"
      :has-error="hasUploadError"
      :help="help"
      :max-file-size="maximumFileSize"
      type="file"
      @change="onFileChange"
    />

    <KIcon
      v-if="type === 'image'"
      class="image-upload-icon"
      :color="iconColor"
      :icon="icon"
      :size="iconSize"
      @click.prevent="updateFile"
    />

    <a
      v-if="type === 'image'"
      class="image-upload-description"
      href="#"
      @click.prevent="updateFile"
    >
      {{ fileValue ? fileValue : placeholder }}
    </a>
    <KButton
      v-if="fileValue && removable"
      appearance="primary"
      class="remove-button"
      :class="type !== 'file' ? 'move-btn-right' : ''"
      data-testid="remove-button"
      size="small"
      type="reset"
      @click="resetInput"
      @keyup.enter="resetInput"
    >
      <template #icon>
        <KIcon
          icon="close"
          size="16"
        />
      </template>
    </KButton>
    <KButton
      v-if="type === 'file'"
      :appearance="buttonAppearance"
      class="k-file-upload-btn"
      :class="[label ? 'k-file-upload-btn-with-label' : 'k-file-upload-btn-without-label']"
      data-testid="k-file-upload-button"
      size="small"
      @click="updateFile"
      @keyup.enter="updateFile"
    >
      {{ buttonText }}
    </KButton>
    <a
      v-if="type === 'file'"
      class="cursor-pointer display-name"
      :class="[label ? 'has-label' : 'has-no-label']"
      href="#"
      @click="updateFile"
      @keyup.enter="updateFile"
    >
      {{ fileValue ? fileValue : placeholder }}
    </a>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref, PropType } from 'vue'
import KLabel from '@/components/KLabel/KLabel.vue'
import KInput from '@/components/KInput/KInput.vue'
import KButton from '@/components/KButton/KButton.vue'
import KIcon from '@/components/KIcon/KIcon.vue'
import { v1 as uuidv1 } from 'uuid'
import type { FileUploadType, ButtonAppearance } from '@/types'

export default defineComponent({
  name: 'KFileUpload',

  components: {
    KLabel,
    KInput,
    KButton,
    KIcon,
  },

  props: {
    labelAttributes: {
      type: Object,
      default: () => ({}),
    },
    label: {
      type: String,
      default: '',
    },
    /**
     * Test mode - for testing only, strips out generated ids
     */
    testMode: {
      type: Boolean,
      default: false,
    },
    help: {
      type: String,
      default: undefined,
    },
    buttonAppearance: {
      type: String as PropType<ButtonAppearance>,
      default: 'primary',
    },
    buttonText: {
      type: String,
      default: 'Select file',
    },
    fileModel: {
      type: String,
      default: undefined,
    },
    removable: {
      type: Boolean,
      default: true,
    },
    placeholder: {
      type: String,
      default: 'No file selected',
    },
    /**
     * Set whether its file upload or image upload type
     */
    type: {
      type: String as PropType<FileUploadType>,
      default: 'file',
      validator: (value: FileUploadType): boolean => {
        return ['file', 'image'].includes(value)
      },
    },
    accept: {
      type: Array as PropType<string[]>,
      required: true,
    },
    maxFileSize: {
      type: Number,
      default: null,
    },
    /**
     * Set icon size
     */
    iconSize: {
      type: String,
      default: '26',
    },
    icon: {
      type: String,
      default: 'image',
    },
    /**
     * Set icon color
     */
    iconColor: {
      type: String,
      default: undefined,
    },
    hasError: {
      type: Boolean,
      default: false,
    },
    errorMessage: {
      type: String,
      default: 'Please check file size.',
    },
  },

  emits: ['file-added', 'file-removed', 'error'],

  setup(props, { emit }) {
    const customInputId = computed((): string => props.testMode ? 'test-file-upload-id-1234' : uuidv1())
    const maximumFileSize = computed((): Number => {
      if (props.maxFileSize || props.maxFileSize === 0) {
        return props.maxFileSize
      }
      return props.type === 'file' ? 5250000 : 1000000
    })

    const hasUploadError = ref(false)

    // This holds the FileList
    const fileInput = ref<File[]>([])
    // To clear the input value after reset
    const fileInputKey = ref(0)
    // File fakepath
    const fileValue = ref('')
    // Array to store the previously selected FileList when user clicks reopen the file uploader and clicks on Cancel
    const fileClone = ref<File[]>([])

    const onFileChange = (evt: any): void => {
      fileInput.value = evt.target?.files
      fileValue.value = fileInput?.value[0]?.name

      const fileSize = fileInput?.value[0]?.size

      hasUploadError.value = fileSize > maximumFileSize.value

      if (hasUploadError.value) {
        fileInputKey.value++
        emit('error', fileInput.value)
      }

      const inputElem = document.getElementById(customInputId.value) as HTMLInputElement

      if (fileSize) {
        // @ts-ignore
        fileClone.value.push(fileInput.value)
      } else {
        // @ts-ignore
        inputElem.files = fileClone.value[fileClone.value.length - 1]
        // @ts-ignore
        fileInput.value = inputElem.files
        if (inputElem.files) {
          fileValue.value = inputElem.files[inputElem.files.length - 1].name
        }
      }
      emit('file-added', fileInput.value)
    }

    // When KButton for Select file is clicked
    const updateFile = (): void => {
      const inputEl = document.getElementById(customInputId.value)
      if (inputEl) {
        // Simulate button click to trigger input click
        inputEl.click()
      }
    }

    // When Cancel button is clicked
    const resetInput = (): void => {
      fileInput.value = []
      fileValue.value = ''
      fileClone.value = []
      fileInputKey.value++
      hasUploadError.value = false

      emit('file-removed')
    }

    return {
      fileInput,
      customInputId,
      resetInput,
      onFileChange,
      fileInputKey,
      fileValue,
      updateFile,
      hasUploadError,
      fileClone,
      maximumFileSize,
    }
  },
})
</script>

<style lang="scss" scoped>
@import '@/styles/variables';
@import '@/styles/functions';

.k-file-upload {
  position: relative;

  .k-file-upload-btn.k-button {
    border-radius: 100px;
    height: 29px;
    position: absolute;
    right: var(--type-xs);
  }

  .k-file-upload-btn-with-label.k-button {
    top: 35px;
  }

  .k-file-upload-btn-without-label.k-button {
    top: 7px;
  }

  // To hide the button and thumbnail that appears in Safari and firefox after uploading a file
  :deep(.k-input-wrapper) input[type="file"]::-webkit-file-upload-button,
  :deep(.k-input-wrapper) input[type="file"]::file-selector-button {
    cursor: inherit;
    min-height: 100%;
    min-width: 100%;
    opacity: 0;
    pointer-events: none;
    position: absolute;
  }

  :deep(.k-input-wrapper) input[type="file"],
  :deep(.k-input-wrapper) input[type="file"].image-upload {
    color: transparent;
  }

  .remove-button {
    background-color: transparent;
    border: none;
    cursor: pointer;
    height: var(--spacing-lg);
    padding: var(--type-xxs) 6px;
    position: absolute;
    right: 118px;
    top: 38px;

    &:hover,
    &:active {
      background-color: transparent !important;
      box-shadow: 0 0 0 2px var(--white, #ffffff), 0 0 0 4px var(--KButtonPrimaryBase, var(--blue-500, #1155cb));
    }
  }

  .move-btn-right {
    right: 10px;
  }

  .image-upload-icon {
    cursor: pointer;
    left: var(--spacing-xs);
    position: absolute;
    top: var(--type-xxs);
  }

  .image-upload-description {
    color: var(--blue-500);
    cursor: pointer;
    font-size: 13px;
    left: 44px;
    line-height: 20px;
    overflow: hidden;
    position: absolute;
    text-overflow: ellipsis;
    top: var(--type-xs);
    white-space: nowrap;
  }
}
</style>

<style lang="scss">
.k-file-upload {
  .k-input {
    height: 44px;

    + .help {
      cursor: default;
    }
  }

  input[type=file]{
    color:transparent;

    &:hover {
      cursor: pointer;
    }
  }

  .display-name {
    color: var(--black-70);
    left: 20px;
    pointer-events: none;
    position: absolute;
  }

  .has-label {
    top: 40px;
  }

  .has-no-label {
    top: var(--type-xs);
  }
}
</style>
