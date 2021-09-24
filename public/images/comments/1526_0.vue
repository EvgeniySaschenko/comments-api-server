<template lang="pug">
include /assets/pug/index.pug
+b.comments-item
  +e.col-avatar
    img.comments-item__avatar-img(:src="comment.imgUser || imgDefaultUser")
  +e.col-content
    +e.content
      +e.username {{ comment.username }}
      +e.file-preview(v-if="files.length")
        img.comments-form__file-preview(
          :src="files[0].src",
          :alt="files[0].name",
          :class="`comments-item__file-preview-${files[0].type}`"
        )
        +e.file-preview-text(v-if="files[0].type === 'icon'") {{ files[0].name }}
      +e.file-count(v-if="files.length > 1") <b>1</b> из <b>{{ files.length }}</b>
      +e.text {{ text }}
        +e.SPAN.text-more(@click="handlerToggleTextBrief(comment.text)", v-if="isTextBrief") {{ isTextBriefЕxpand ? 'Ещё' : 'Свернуть' }}
    +e.panel-bottom
      +e.btn-estimate(@click="") Нравится
      +e.btn-ansfer(@click="handlerToggleForm()") Ответить
      +e.date-create 1ч
      +e.rating
        +e.rating--like
        +e.rating--super
        +e.rating--we--together
        +e.rating--delight
        +e.rating--sympathy
        +e.rating--anger
        +e.rating-count
    +e.panel-form-add(v-show="isFormShow")
      comments-form(:userName="comment.username", :options="options")
</template>

<script>
import CommentsForm from "./comments-form.vue";
import imgDefaultUser from "./default-user.png";
import extensionImg from "./extensionImg.json";
import iconFile from "./icon-file.svg";

export default {
  name: "CommentsItem",
  components: {
    CommentsForm,
  },
  props: {
    comment: {
      type: Object,
      required: true,
    },
    options: {
      type: Object,
      default: () => {},
    },
    idParent: {
      type: Number,
    },
  },
  data() {
    return {
      // Отображаемый текст
      text: "",
      // Показать кнопку Еще
      isTextBrief: false,
      // Переключатель кнопок Еще / Свернуть
      isTextBriefЕxpand: true,
      // Показать / скрыть форму добавления вопроса
      isFormShow: false,
      // Аватар поумолчанию
      imgDefaultUser,
      extensionImg,
      iconFile,
      files: [],
    };
  },
  created() {
    let { text } = this.comment;
    let { textBriefLength } = this.options;
    this.isTextBrief = text.length > textBriefLength || false;
    this.setText(text, this.isTextBrief);
    this.preparationDataFiles();
  },
  methods: {
    preparationDataFiles() {
      for (let file of this.comment.files) {
        let extension = file.name.match(/[^.]+$/i)[0];
        let item = { ...file, extension };
        if (this.extensionImg[extension]) {
          item.type = "img";
        } else {
          item.type = "icon";
          item.src = this.iconFile;
        }
        this.files.push(item);
      }
    },
    // Обрезать текст
    cropText(text) {
      return text.slice(0, this.options.textBriefLength) + "...";
    },
    //
    setText(text, isСropText) {
      this.text = isСropText ? this.cropText(text) : text;
    },
    // Свернуть / развернуть текст
    handlerToggleTextBrief(text) {
      this.isTextBriefЕxpand = !this.isTextBriefЕxpand;
      this.setText(text, this.isTextBriefЕxpand);
    },
    // Показать / скрыть форму для добавления вопрса
    handlerToggleForm() {
      this.isFormShow = !this.isFormShow;
    },
  },
};
</script>

<style lang="sass">
.comments-item
  display: flex
  margin-bottom: 5px
  &__col-avatar
    border-radius: 50%
    overflow: hidden
    height: 32px
    width: 32px
    margin-right: 10px
    flex-shrink: 0
  &__avatar-img
    max-width: 100%
    max-height: 100%
  &__content
    border-radius: 20px
    background-color: #f0f2f5
    padding: 10px
    margin-bottom: 5px
    min-width: 400px
  &__text
    &-more
      display: inline-block
      margin-left: 2px
      cursor: pointer
      font-weight: 700
  &__username
    font-weight: 700
  &__file
    &-count
      text-align: center
      color: #65676b
    &-preview
      display: flex
      align-items: center
      justify-content: center
      flex-direction: column
      text-align: center
      padding: 10px
      min-height: 180px
      max-height: 220px
    &-img
      max-width: 100%
    &-icon
      width: 60px
      height: 60px
    &-name
      font-size: 12px
  &__panel-bottom
    margin-bottom: 5px
    padding-left: 10px
    display: flex
    color: #65676b
    font-size: 12px
  &__btn-estimate,
  &__btn-ansfer
    cursor: pointer
    margin-right: 10px
    font-weight: 700
</style>
