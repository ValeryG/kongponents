<template>
  <div
    v-if="isVisible"
    :aria-label="title"
    aria-modal="true"
    class="k-modal-fullscreen isOpen"
    role="dialog"
    @keyup.enter="proceed"
    @keyup.esc="close"
  >
    <div
      ref="modalBodyContent"
      class="k-modal-fullscreen-dialog"
      :class="{ 'has-footer': $slots['footer-content'] }"
      tabindex="0"
    >
      <div class="k-modal-fullscreen-body-header">
        <div
          v-if="$slots['body-header'] || bodyHeader"
          class="body-header"
        >
          <slot name="body-header">
            {{ bodyHeader }}
          </slot>
        </div>
        <div
          v-if="$slots['body-header-description'] || bodyHeaderDescription"
          class="body-header-description"
        >
          <slot name="body-header-description">
            {{ bodyHeaderDescription }}
          </slot>
        </div>
      </div>

      <div class="k-modal-fullscreen-body">
        <slot name="default" />
      </div>

      <!-- Header at the bottom to allow proper tabindex -->
      <div class="k-modal-fullscreen-header">
        <div
          aria-level="2"
          class="k-modal-fullscreen-header-description"
          role="heading"
        >
          <div class="k-modal-fullscreen-title">
            <span class="header-icon pr-2 my-auto">
              <slot name="header-icon">
                <KIcon :icon="iconString" />
              </slot>
            </span>
            <span class="header-content my-auto">
              <slot name="header-content">{{ title }}</slot>
            </span>
          </div>
          <div class="k-modal-fullscreen-action ml-3">
            <div class="k-modal-fullscreen-action-buttons">
              <slot name="action-buttons">
                <KButton
                  :appearance="cancelButtonAppearance"
                  class="cancel-button"
                  @click="close"
                >
                  {{ cancelButtonText }}
                </KButton>
                <KButton
                  :appearance="actionButtonAppearance"
                  class="proceed-button"
                  @click="proceed"
                >
                  {{ actionButtonText }}
                </KButton>
              </slot>
            </div>
          </div>
        </div>
      </div>
      <!-- Footer -->
      <div
        v-if="$slots['footer-content']"
        class="k-modal-fullscreen-footer"
      >
        <slot name="footer-content" />
        <div class="k-modal-fullscreen-action ml-3">
          <div class="k-modal-fullscreen-action-buttons">
            <slot name="action-buttons">
              <KButton
                :appearance="actionButtonAppearance"
                class="proceed-button"
                @click="proceed"
              >
                {{ actionButtonText }}
              </KButton>
            </slot>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { watch, ref, computed, onMounted, onUnmounted, onBeforeUnmount, nextTick, PropType } from 'vue'
import KButton from '@/components/KButton/KButton.vue'
import KIcon from '@/components/KIcon/KIcon.vue'
import type { ButtonAppearance } from '@/types'

const props = defineProps({
  /**
  * Set the text of the title, if using title slot
  */
  title: {
    type: String,
    required: true,
  },
  /**
  * Set the title in the body
  */
  bodyHeader: {
    type: String,
    default: '',
  },
  /**
  * Text to display as a description of the body's title
  */
  bodyHeaderDescription: {
    type: String,
    default: '',
  },
  /**
  *  Pass whether or not the modal should be visible
  */
  isVisible: {
    type: Boolean,
    default: false,
  },
  /**
  * Set the text of the close/cancel button
  */
  cancelButtonText: {
    type: String,
    default: 'Cancel',
  },
  /**
  * Set the text of the action/proceed button
  */
  actionButtonText: {
    type: String,
    default: 'Save',
  },
  /**
  * Set the appearance of the action/proceed button
  */
  actionButtonAppearance: {
    type: String as PropType<ButtonAppearance>,
    default: 'primary',
  },
  /**
  * Set the appearance of the close/cancel button
  */
  cancelButtonAppearance: {
    type: String as PropType<ButtonAppearance>,
    default: 'outline',
  },
  /**
  *  Pass the type of icon for the header on the left
  */
  iconString: {
    type: String,
    default: 'kong',
  },
})

const emit = defineEmits(['canceled', 'proceed'])

const modalBodyContent = ref(null)
const isOpen = computed(() => {
  return !!props.isVisible
})

watch(() => props.isVisible, async () => {
  if (isOpen.value) {
    document.body.style.overflow = 'hidden'

    await nextTick()

    if (modalBodyContent.value) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      modalBodyContent.value.focus()
    }
  } else {
    document.body.style.overflow = ''
  }
})

const handleKeydown = (e: any) => {
  if (props.isVisible) {
    if (e.keyCode === 27) { // `esc` key
      close()
    } else if (e.keyCode === 13) { // `enter` key
      proceed()
    }
  }
}

const close = () => {
  emit('canceled')
}

const proceed = () => {
  emit('proceed')
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.body.style.overflow = ''
})
</script>

<style lang="scss" scoped>
@import '@/styles/variables';
@import '@/styles/functions';
$kmodalfullscreen-viewport-md: 992px;
$fullscreen-modal-padding: 64px;

.k-modal-fullscreen-dialog {
  background: var(--white);
  bottom: 0;
  left: 0;
  padding-top: $fullscreen-modal-padding * 2;
  position: fixed;
  right: 0;
  top: 0;
  width: 100vw;
  z-index: 9999;

  @media (min-width: $viewport-md) {
    padding-top: $fullscreen-modal-padding;
  }

  &.has-footer {
    padding-bottom: $fullscreen-modal-padding * 2;

    @media (min-width: $viewport-md) {
      padding-bottom: $fullscreen-modal-padding;
    }
    .k-modal-fullscreen-header {
      position: absolute;
    }
  }
}

.k-modal-fullscreen-header {
  background-color: var(--white);
  border-bottom: 1px solid var(--grey-300);
  display: flex;
  flex-direction: column;
  padding: var(--spacing-lg) 0;
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 1009;

  .k-modal-fullscreen-header-description {
    color: var(--KModalFullscreenHeaderColor, var(--black-500, color(black-500)));
    display: flex;
    flex-direction: column;
    font-size: var(--KModalFullscreenHeaderSize, 20px);
    font-weight: var(--KModalFullscreenHeaderWeight, 600);
    justify-content: space-between;

    @media (min-width: $viewport-md) {
      flex-direction: row;
    }
  }
}

.k-modal-fullscreen-footer {
  align-items: center;
  background-color: var(--white);
  border-top: 1px solid var(--grey-300);
  bottom: 0;
  box-shadow: 0px 0px 20px color(black-10);
  display: inline-flex;
  justify-content: space-between;
  padding: var(--spacing-lg) 0;
  padding-left: var(--spacing-xl, spacing(xl));
  position: fixed;
  width: 100%;
  z-index: 1009;
}

.k-modal-fullscreen-title {
  display: inline-flex;
  justify-content: center;
  margin-bottom: var(--spacing-xs, spacing(xs));
  position: relative;

  @media (min-width: $viewport-md) {
    justify-content: flex-start;
    margin-bottom: 0;
    margin-left: 36px;
  }
}

.k-modal-fullscreen-action {
  display: inline-flex;
  justify-content: center;
  margin-right: var(--spacing-xl, spacing(xl));

  & button,
  & :deep(button) {
    font-size: 13px;
    font-weight: 600;
    height: 40px;
    line-height: 13px;
    margin-left: var(--spacing-md, spacing(md));
  }

  @media (min-width: $viewport-md) {
    justify-content: flex-end;
  }
}

.k-modal-fullscreen-body-header,
.k-modal-fullscreen-body {
  color: var(--KModalFullscreenColor, var(--black-500, color(black-500)));
  padding-left: var(--spacing-lg);
  padding-right: var(--spacing-lg);

  @media (min-width: $viewport-md) {
    padding-left: 120px;
    padding-right: 120px;
  }

  @media (min-width: $kmodalfullscreen-viewport-md) {
    padding-left: 230px;
    padding-right: 230px;
  }
}

.k-modal-fullscreen-body {
  padding-bottom: var(--spacing-lg);
  @media (min-width: $viewport-md) {
    padding-bottom: $fullscreen-modal-padding;
  }
}

.k-modal-fullscreen-body-header {
  margin-bottom: var(--spacing-xl);
  margin-top: $fullscreen-modal-padding;
  padding-bottom: 0;
  padding-top: 0;

  .body-header {
    font-size: var(--type-xxxl, type(xxxl));
    font-weight: 600;
    line-height: var(--type-xxxl, type(xxxl));
    margin-bottom: -4px;
  }

  .body-header-description {
    color: var(--grey-600);
    font-size: 14px;
    font-weight: 400;
    line-height: var(--type-xl, type(xl));
    margin-top: var(--spacing-md);
  }
}

.k-modal-fullscreen-body-description h2 {
  border: none;
}

.k-modal-fullscreen.isOpen .k-modal-fullscreen-dialog {
  overflow-y: auto;
}

.header-content {
  border-left: 1px solid var(--grey-300);
  display: inline-block;
  line-height: 24px;
  margin-top: var(--spacing-xxs, spacing(xxs));
  padding-left: 6px;
}

.k-modal-fullscreen-action-buttons {
  button,
  :deep(button) {
    margin-left: var(--spacing-md, spacing(md));
  }

  @media (min-width: $viewport-md) {
    margin-left: auto;
  }
}
</style>

<style lang="scss">
.header-icon {
  .kong-icon.kong-icon-kong {
    position: relative;
    top: 1px;
  }
}
</style>
