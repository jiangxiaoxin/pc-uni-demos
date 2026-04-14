<template>
  <div
    class="where-tags-input"
    @click="focusInput"
  >
    <span
      v-for="(tag, tagIndex) in tags"
      :key="tagIndex"
      class="where-tag"
      @click.stop="removeTag(tagIndex)"
    >
      {{ tag }}
    </span>
    <span
      ref="inputRef"
      class="where-tags-input__editor"
      contenteditable="true"
      :data-placeholder="placeholder"
      @keydown="handleKeydown"
      @blur="handleBlur"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";

interface Props {
  modelValue: string;
  placeholder?: string;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: "输入后回车",
});

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
}>();

const inputRef = ref<HTMLElement>();

const parseInValue = (value: string): string[] => {
  return value.split(",").filter(Boolean);
};

const tags = computed(() => parseInValue(props.modelValue));

const focusInput = () => {
  inputRef.value?.focus();
};

const addTag = (text: string) => {
  const trimmed = text.trim();
  if (!trimmed) return;
  const currentTags = parseInValue(props.modelValue);
  if (currentTags.includes(trimmed)) return;
  const nextValue = [...currentTags, trimmed].join(",");
  emit("update:modelValue", nextValue);
};

const removeTag = (tagIndex: number) => {
  const currentTags = parseInValue(props.modelValue);
  currentTags.splice(tagIndex, 1);
  emit("update:modelValue", currentTags.join(","));
};

const handleBlur = (event: FocusEvent) => {
  const target = event.target as HTMLElement;
  const text = (target.innerText || "").trim();
  if (text) {
    addTag(text);
  }
  target.innerText = "";
};

const handleKeydown = (event: KeyboardEvent) => {
  const target = event.target as HTMLElement;
  if (event.key === "Enter") {
    event.preventDefault();
    const text = (target.innerText || "").trim();
    if (text) {
      addTag(text);
    }
    target.innerText = "";
    return;
  }
  if (event.key === "Backspace") {
    const text = (target.innerText || "").trim();
    if (text === "") {
      event.preventDefault();
      const currentTags = parseInValue(props.modelValue);
      if (currentTags.length > 0) {
        removeTag(currentTags.length - 1);
      }
    }
  }
};

// 监听 modelValue 变化，更新输入框内容
watch(() => props.modelValue, () => {
  if (inputRef.value) {
    inputRef.value.innerText = "";
  }
});
</script>

<style scoped>
.where-tags-input {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  min-height: 32px;
  background: #fff;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  cursor: text;
  transition: all 0.3s;
}

.where-tags-input:hover {
  border-color: #4096ff;
}

.where-tag {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  font-size: 12px;
  background: #f0f0f0;
  border: 1px solid #d9d9d9;
  border-radius: 2px;
  cursor: pointer;
  transition: all 0.3s;
}

.where-tag:hover {
  background: #e6f7ff;
  border-color: #1890ff;
  color: #1890ff;
}

.where-tags-input__editor {
  flex: 1;
  min-width: 60px;
  outline: none;
  font-size: 14px;
  line-height: 1.5;
}

.where-tags-input__editor:empty::before {
  content: attr(data-placeholder);
  color: #bfbfbf;
}
</style>
